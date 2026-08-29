/**
 * Reports the empty region inside the About section, so any decorative element
 * placed there can be sized against real numbers rather than a screenshot guess.
 *
 * Measures the copy column, the avatar ring, the stat grid and the marquee block,
 * then derives the unused rectangle between the copy and the ring.
 *
 * Run: node scripts/measure-about-gap.mjs [origin]
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ORIGIN = process.argv[2] ?? 'http://localhost:3211';
const PORT = 9345;
const VIEWPORTS = [
  [375, 812],
  [768, 812],
  [1440, 812],
  [1440, 900],
  [1920, 1080],
];

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
    `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'cdp-gap-'))}`,
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
  const m = JSON.parse(event.data);
  const entry = pending.get(m.id);
  if (!entry) return;
  pending.delete(m.id);
  if (m.error) entry.reject(new Error(JSON.stringify(m.error)));
  else entry.resolve(m.result);
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

const PROBE = `(() => {
  const about = document.getElementById('about');
  const shell = about.querySelector('.page-shell-wide');
  const row = shell.firstElementChild;              // copy + avatar flex row
  const copy = row.firstElementChild;               // text column
  // Second child of the row. A class selector is avoided here: escaping
  // Tailwind's "lg:flex" colon through two template-literal layers is fragile.
  const ring = row.children[1] ?? null;
  const stats = shell.children[1];
  const marquee = shell.children[2];

  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      l: Math.round(r.left), r: Math.round(r.right),
      t: Math.round(r.top), b: Math.round(r.bottom),
      w: Math.round(r.width), h: Math.round(r.height),
    };
  };

  const c = box(copy);
  const g = box(ring);
  const ringVisible = ring ? getComputedStyle(ring).display !== 'none' : false;

  // The ring's flex item is far wider than the circle it holds (48% of the row,
  // with the circle pinned to its right and nudged -80px). The visually empty
  // band therefore sits *inside* that item, so the circle itself is what bounds
  // the usable area — not the container.
  const circle = ringVisible ? box(ring.firstElementChild) : null;

  // Unused rectangle: right of the copy column, left of the ring (or the shell's
  // inner edge when the ring is hidden), between the row top and the stat grid.
  const shellBox = box(shell);
  const shellPadRight = parseFloat(getComputedStyle(shell).paddingRight);
  const rightLimit = circle ? circle.l : Math.round(shellBox.r - shellPadRight);
  const statsBox = box(stats);

  return {
    vw: window.innerWidth,
    vh: window.innerHeight,
    shell: shellBox,
    copy: c,
    ring: ringVisible ? g : null,
    circle,
    stats: statsBox,
    marquee: box(marquee),
    gap: {
      l: c.r,
      r: rightLimit,
      t: c.t,
      b: statsBox.t,
      w: Math.max(0, rightLimit - c.r),
      h: Math.max(0, statsBox.t - c.t),
    },
  };
})()`;

const lines = [];

for (const [width, height] of VIEWPORTS) {
  await send(
    'Emulation.setDeviceMetricsOverride',
    { width, height, deviceScaleFactor: 1, mobile: width < 768 },
    sessionId,
  );
  await send('Page.navigate', { url: `${ORIGIN}/` }, sessionId);
  await wait(1500);
  await evaluate(
    `['introPlayed','heroPlayed','navbarPlayed'].forEach(k=>sessionStorage.setItem(k,'true'))`,
  );
  await send('Page.reload', {}, sessionId);
  await wait(3000);
  await evaluate(
    `document.getElementById('about').scrollIntoView({ behavior: 'instant', block: 'start' })`,
  );
  await wait(1200);

  const p = await evaluate(PROBE);
  lines.push(`\n########## ${p.vw} x ${p.vh} ##########`);
  const fmt = (name, b) =>
    b
      ? `  ${name.padEnd(9)} x ${String(b.l).padStart(4)}..${String(b.r).padEnd(5)} ` +
        `y ${String(b.t).padStart(4)}..${String(b.b).padEnd(5)} ${b.w}x${b.h}`
      : `  ${name.padEnd(9)} (hidden)`;
  lines.push(fmt('shell', p.shell));
  lines.push(fmt('copy', p.copy));
  lines.push(fmt('ring box', p.ring));
  lines.push(fmt('circle', p.circle));
  lines.push(fmt('stats', p.stats));
  lines.push(fmt('marquee', p.marquee));
  lines.push(
    `  FREE AREA x ${p.gap.l}..${p.gap.r}  y ${p.gap.t}..${p.gap.b}  ` +
      `=> ${p.gap.w} x ${p.gap.h} px` +
      (p.gap.w < 160 || p.gap.h < 160 ? '   (too small for a 3D scene)' : ''),
  );
}

console.log(lines.join('\n'));
socket.close();
chrome.kill();
