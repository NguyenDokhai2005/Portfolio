/**
 * Diagnostics for the two Home-section regressions.
 *
 *  A. samples the typewriter's text over time — a value that never advances
 *     means its timeout is being cleared faster than it can fire;
 *  B. samples each snap slot's class list — a slot flipping between `is-in` and
 *     `is-out` is an IntersectionObserver feedback loop, which would re-render
 *     the subtree continuously and starve the typewriter;
 *  C. reports the hero canvas box against the shell and the viewport, to show
 *     whether the 3D card is being cropped by a container rather than by WebGL.
 *
 * Run: node scripts/diagnose-hero.mjs [origin]
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ORIGIN = process.argv[2] ?? 'http://localhost:3211';
const PORT = 9338;
const WIDTHS = [375, 768, 1440];

const CHROME = [
  `${process.env.ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe`,
  `${process.env['ProgramFiles(x86)']}\\Google\\Chrome\\Application\\chrome.exe`,
  `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
].find((c) => existsSync(c));
if (!CHROME) throw new Error('Chrome not found');

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'cdp-diag-'))}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

async function endpoint() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      return (await res.json()).webSocketDebuggerUrl;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  throw new Error('no debugging endpoint');
}

const socket = new WebSocket(await endpoint());
const pending = new Map();
let nextId = 0;

await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  const entry = pending.get(message.id);
  if (!entry) return;
  pending.delete(message.id);
  if (message.error) entry.reject(new Error(JSON.stringify(message.error)));
  else entry.resolve(message.result);
});

const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = (nextId += 1);
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params, sessionId }));
  });

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);

const evaluate = async (expression) => {
  const r = await send(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true },
    sessionId,
  );
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Watches the typewriter and the slot classes for `ms`, in-page. */
const WATCH = (ms) => `(async () => {
  const slots = [...document.querySelectorAll('.snap-section')];
  const typer = document.querySelector('#home .inline-block.whitespace-pre-wrap');
  const samples = [];
  const classFlips = slots.map(() => 0);
  const lastClass = slots.map((s) => s.className);
  const seenText = new Set();

  const started = performance.now();
  while (performance.now() - started < ${ms}) {
    if (typer) seenText.add(typer.textContent.trim());
    slots.forEach((slot, i) => {
      if (slot.className !== lastClass[i]) {
        classFlips[i] += 1;
        lastClass[i] = slot.className;
      }
    });
    samples.push(1);
    await new Promise((r) => requestAnimationFrame(r));
  }

  return {
    frames: samples.length,
    distinctTexts: [...seenText],
    flips: slots.map((s, i) => ({
      id: s.querySelector('section')?.id ?? '?',
      flips: classFlips[i],
      cls: s.className,
    })),
  };
})()`;

const GEOMETRY = `(() => {
  const section = document.getElementById('home');
  const shell = section?.querySelector('.page-shell-wide');
  const canvas = section?.querySelector('canvas');
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const cs = (el, prop) => (el ? getComputedStyle(el)[prop] : null);
  return {
    vw: window.innerWidth,
    vh: window.innerHeight,
    section: box(section),
    sectionOverflow: cs(section, 'overflow'),
    shell: box(shell),
    shellPadRight: cs(shell, 'paddingRight'),
    canvas: box(canvas),
    canvasAspect: canvas ? +(canvas.getBoundingClientRect().width / canvas.getBoundingClientRect().height).toFixed(3) : null,
  };
})()`;

const lines = [];

for (const width of WIDTHS) {
  await send(
    'Emulation.setDeviceMetricsOverride',
    { width, height: 812, deviceScaleFactor: 1, mobile: width < 768 },
    sessionId,
  );
  await send('Page.navigate', { url: `${ORIGIN}/` }, sessionId);
  await wait(1500);
  await evaluate(
    `['introPlayed','heroPlayed','navbarPlayed'].forEach(k=>sessionStorage.setItem(k,'true'))`,
  );
  await send('Page.reload', {}, sessionId);
  await wait(3200);

  const geo = await evaluate(GEOMETRY);
  lines.push(`\n########## ${width} x ${geo.vh} ##########`);
  lines.push(' [C] hero geometry');
  lines.push(`      viewport      w=${geo.vw}`);
  lines.push(
    `      section       l=${geo.section.l} r=${geo.section.r} w=${geo.section.w}  overflow=${geo.sectionOverflow}`,
  );
  lines.push(
    `      .page-shell-wide  l=${geo.shell.l} r=${geo.shell.r} w=${geo.shell.w}  padding-right=${geo.shellPadRight}`,
  );
  lines.push(
    `      canvas        l=${geo.canvas?.l} r=${geo.canvas?.r} w=${geo.canvas?.w} h=${geo.canvas?.h}  aspect=${geo.canvasAspect}`,
  );
  const gapRight = geo.vw - (geo.canvas?.r ?? geo.vw);
  lines.push(
    `      canvas right edge is ${gapRight}px from the viewport right edge` +
      (gapRight > 0 ? ' (canvas is inset — 3D content can be cropped by it)' : ''),
  );

  const watch = await evaluate(WATCH(2600));
  lines.push(' [A] typewriter over 2.6s');
  lines.push(`      frames sampled: ${watch.frames}`);
  lines.push(`      distinct texts seen (${watch.distinctTexts.length}):`);
  for (const t of watch.distinctTexts.slice(0, 12))
    lines.push(`        "${t}"`);
  if (watch.distinctTexts.length <= 2)
    lines.push('        -> STUCK: the typewriter is not advancing');

  lines.push(' [B] snap slot class flips over the same 2.6s');
  for (const f of watch.flips) {
    lines.push(
      `      ${f.id.padEnd(10)} flips=${String(f.flips).padStart(4)}  class="${f.cls}"` +
        (f.flips > 6 ? '   <-- OSCILLATING' : ''),
    );
  }
}

console.log(lines.join('\n'));
socket.close();
chrome.kill();
