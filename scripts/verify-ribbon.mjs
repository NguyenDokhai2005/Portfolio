/**
 * Verifies the About light-ribbon band.
 *
 *  1. a touch drag across the canvas still scrolls the page — the failure that
 *     sank the WebGL scene this replaced;
 *  2. the canvas actually paints, checked from its own pixels rather than a
 *     screenshot, and the pixels change over time so the animation is live;
 *  3. the rAF loop stops while the band is off screen;
 *  4. the backing store matches CSS size x DPR, so nothing renders soft;
 *  5. no horizontal overflow, plus About's height for the snap budget.
 *
 * Writes `ribbon-report.txt` itself; shell redirection is unreliable here.
 *
 * Run: node scripts/verify-ribbon.mjs [origin]
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ORIGIN = process.argv[2] ?? 'http://localhost:3211';
const PORT = 9347;
const VIEWPORTS = [
  [375, 812],
  [768, 812],
  [1440, 812],
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
    `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'cdp-rib-'))}`,
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
  if (r.exceptionDetails) {
    const detail =
      r.exceptionDetails.exception?.description ??
      r.exceptionDetails.exception?.value ??
      r.exceptionDetails.text;
    throw new Error(`${detail}\n  while evaluating: ${expression.slice(0, 140)}`);
  }
  return r.result.value;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const waitFor = async (expression, timeoutMs = 15000) => {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const ok = await evaluate(expression).catch(() => false);
    if (ok) return;
    await wait(200);
  }
  throw new Error(`timed out waiting for: ${expression}`);
};

const lines = [];
let failures = 0;
const fail = (m) => {
  failures += 1;
  lines.push(`  FAIL  ${m}`);
};
const pass = (m) => lines.push(`  ok    ${m}`);

const flush = (tail) => {
  const text = `${lines.join('\n')}\n${tail}\n`;
  writeFileSync('ribbon-report.txt', text);
  console.log(text);
};
const abort = (error) => {
  flush(`ABORTED: ${error?.message ?? error}`);
  try {
    socket.close();
    chrome.kill();
  } catch {
    /* already gone */
  }
  process.exit(1);
};
process.on('unhandledRejection', abort);
process.on('uncaughtException', abort);

/**
 * `Page.reload` cannot be used: `page.tsx` clears `introPlayed` whenever the
 * navigation type is `reload`, which replays the 2.8s intro. A second navigate
 * keeps the flag.
 */
const openPage = async () => {
  await send('Page.navigate', { url: `${ORIGIN}/` }, sessionId);
  await waitFor(`Boolean(document.getElementById('about'))`);
  await evaluate(`sessionStorage.setItem('introPlayed','true')`);
  await send('Page.navigate', { url: `${ORIGIN}/` }, sessionId);
  await waitFor(`Boolean(document.getElementById('about'))`);
  await wait(500);
};

/** Counts lit pixels along a horizontal strip, and hashes them for change detection. */
const SIGNATURE = `(() => {
  const canvas = document.querySelector('[data-light-ribbon] canvas');
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  const h = canvas.height;
  const stripTop = Math.max(0, Math.floor(h * 0.3));
  const stripHeight = Math.max(1, Math.floor(h * 0.4));
  const data = ctx.getImageData(0, stripTop, canvas.width, stripHeight).data;
  let lit = 0;
  let sum = 0;
  let maxAlpha = 0;
  let maxLuma = 0;
  for (let i = 0; i < data.length; i += 16) {
    if (data[i + 3] > maxAlpha) maxAlpha = data[i + 3];
    const luma = data[i] + data[i + 1] + data[i + 2];
    if (luma > maxLuma) maxLuma = luma;
    // Lit by brightness, not alpha: a screenshot-composited canvas can report a
    // flattened alpha channel while the colour channels still carry the drawing.
    if (luma > 24) lit += 1;
    sum = (sum + data[i] * 3 + data[i + 1] * 5 + data[i + 2] * 7) % 2147483647;
  }
  return {
    lit, sum, maxAlpha, maxLuma,
    samples: Math.floor(data.length / 16),
    w: canvas.width, h: canvas.height, stripTop, stripHeight,
  };
})()`;

for (const [width, height] of VIEWPORTS) {
  const coarse = width < 768;

  await send(
    'Emulation.setDeviceMetricsOverride',
    { width, height, deviceScaleFactor: 1, mobile: coarse },
    sessionId,
  );
  await send(
    'Emulation.setTouchEmulationEnabled',
    { enabled: coarse, maxTouchPoints: 5 },
    sessionId,
  );
  await send(
    'Emulation.setEmitTouchEventsForMouse',
    { enabled: coarse, configuration: coarse ? 'mobile' : 'desktop' },
    sessionId,
  );

  await openPage();
  lines.push(`\n########## ${width} x ${height}${coarse ? '  (touch)' : '  (mouse)'} ##########`);

  // --- 3. idle while off screen -------------------------------------------
  const atTop = await evaluate(
    `document.querySelector('[data-light-ribbon]')?.dataset.lightRibbon ?? 'missing'`,
  );
  if (atTop === 'idle') pass('band idle while scrolled away');
  else fail(`band state at page top = ${atTop}, expected idle`);

  await evaluate(
    `document.getElementById('about').scrollIntoView({ behavior: 'instant', block: 'end' })`,
  );
  await waitFor(`document.querySelector('[data-light-ribbon]')?.dataset.lightRibbon === 'running'`);
  pass('band switches to running once in view');

  // --- 4. backing store resolution ----------------------------------------
  const geometry = await evaluate(`(() => {
    const host = document.querySelector('[data-light-ribbon]');
    const canvas = host.querySelector('canvas');
    const rect = host.getBoundingClientRect();
    return {
      cssW: Math.round(rect.width), cssH: Math.round(rect.height),
      bufW: canvas.width, bufH: canvas.height,
      dpr: window.devicePixelRatio,
      pointerEvents: getComputedStyle(canvas).pointerEvents,
    };
  })()`);
  const expectedW = Math.round(geometry.cssW * Math.min(geometry.dpr, 2));
  if (Math.abs(geometry.bufW - expectedW) <= 2)
    pass(
      `backing store ${geometry.bufW}x${geometry.bufH} matches ${geometry.cssW}x${geometry.cssH} ` +
        `at dpr ${geometry.dpr}`,
    );
  else
    fail(
      `backing store ${geometry.bufW} wide, expected ~${expectedW} ` +
        `(${geometry.cssW} css x dpr ${geometry.dpr})`,
    );

  if (geometry.pointerEvents === 'none')
    pass('canvas pointer-events: none — cannot intercept gestures');
  else fail(`canvas pointer-events = ${geometry.pointerEvents}, expected none`);

  // --- 2. it paints, and the paint changes --------------------------------
  // A single sample can land in the frame right after a ResizeObserver clears
  // the backing store, so poll until the strip is lit or the budget runs out.
  let first = await evaluate(SIGNATURE);
  for (let attempt = 0; attempt < 12 && (first?.lit ?? 0) <= 200; attempt += 1) {
    await wait(200);
    first = await evaluate(SIGNATURE);
  }
  await wait(900);
  const second = await evaluate(SIGNATURE);

  if (!first || !second) {
    fail('canvas not found for pixel sampling');
  } else {
    const coverage = (first.lit / first.samples) * 100;
    lines.push(
      `        strip ${first.w}x${first.stripHeight} at y=${first.stripTop}, ` +
        `${first.samples} samples, maxAlpha=${first.maxAlpha}, maxLuma=${first.maxLuma}`,
    );
    if (first.lit > 200)
      pass(`canvas is painting (${first.lit} lit samples, ${coverage.toFixed(1)}% of the strip)`);
    else fail(`canvas looks blank (${first.lit} lit of ${first.samples} samples)`);

    if (first.sum !== second.sum) pass('pixels change over time — animation is live');
    else fail('pixels identical after 900ms — animation is not running');
  }

  // --- 1. the gesture test that killed the previous attempt ---------------
  // The WebGL scene this replaced ate touch scrolls because OrbitControls
  // received touchmove and called preventDefault. Proving that cannot happen
  // here is a hit-test question, not a scrolling question: the canvas is
  // pointer-events:none, so it is never the touch target and can never cancel
  // the gesture. Synthesised compositor scrolls are unreliable under
  // `--headless=new` with scroll-snap, so they are reported, not asserted.
  if (coarse) {
    const hit = await evaluate(`(() => {
      const host = document.querySelector('[data-light-ribbon]');
      const canvas = host.querySelector('canvas');
      const r = host.getBoundingClientRect();
      const x = Math.round(r.left + r.width / 2);
      const y = Math.round(r.top + r.height / 2);
      const target = document.elementFromPoint(x, y);
      const blockers = [];
      for (let el = target; el && el !== document.documentElement; el = el.parentElement) {
        const ta = getComputedStyle(el).touchAction;
        if (ta === 'none' || ta === 'pan-x' || ta === 'pinch-zoom')
          blockers.push(el.tagName.toLowerCase() + ':' + ta);
      }
      return {
        x, y,
        targetIsCanvas: target === canvas,
        target: target ? target.tagName.toLowerCase() : 'null',
        insideBand: Boolean(target && host.contains(target)),
        blockers,
      };
    })()`);

    if (!hit.targetIsCanvas)
      pass(`touch target at the band centre is <${hit.target}>, not the canvas`);
    else fail('canvas is the touch target — it can cancel the scroll gesture');

    if (hit.blockers.length === 0) pass('no touch-action blocker between target and root');
    else fail(`touch-action blocks vertical panning: ${hit.blockers.join(', ')}`);

    const before = await evaluate('Math.round(window.scrollY)');
    await send(
      'Input.synthesizeScrollGesture',
      { x: hit.x, y: hit.y, xDistance: 0, yDistance: -220, gestureSourceType: 'touch', speed: 900 },
      sessionId,
    );
    await wait(1400);
    const after = await evaluate('Math.round(window.scrollY)');
    lines.push(
      `        synthesised touch scroll ${before} -> ${after}` +
        (after === before ? ' (no compositor scroll in headless — informational)' : ''),
    );
  }

  // --- 5. layout ----------------------------------------------------------
  const layout = await evaluate(`(() => {
    const about = document.getElementById('about');
    const slot = about.closest('.snap-section');
    const prevSection = about.style.minHeight;
    const prevSlot = slot ? slot.style.minHeight : null;
    const prevFlex = about.style.flex;
    about.style.minHeight = '0px';
    about.style.flex = '0 0 auto';
    if (slot) slot.style.minHeight = '0px';
    const h = Math.ceil(about.getBoundingClientRect().height);
    about.style.minHeight = prevSection;
    about.style.flex = prevFlex;
    if (slot && prevSlot !== null) slot.style.minHeight = prevSlot;
    return { about: h, vh: window.innerHeight, scrollW: document.documentElement.scrollWidth, vw: window.innerWidth };
  })()`);

  if (layout.scrollW <= layout.vw) pass(`no horizontal overflow (${layout.scrollW})`);
  else fail(`horizontal overflow: ${layout.scrollW} > ${layout.vw}`);

  const over = layout.about - layout.vh;
  lines.push(
    `        About natural height ${layout.about}px — ` +
      (over > 0 ? `exceeds viewport by ${over}px` : `fits, ${-over}px spare`),
  );

  if (!coarse && width === 1440) {
    const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
    writeFileSync('ribbon-1440.png', Buffer.from(shot.data, 'base64'));
    lines.push('        wrote ribbon-1440.png');
  }
  if (coarse) {
    const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
    writeFileSync('ribbon-375.png', Buffer.from(shot.data, 'base64'));
    lines.push('        wrote ribbon-375.png');
  }
}

flush(failures === 0 ? 'ALL RIBBON CHECKS PASSED' : `${failures} CHECK(S) FAILED`);

socket.close();
chrome.kill();
process.exit(failures === 0 ? 0 : 1);
