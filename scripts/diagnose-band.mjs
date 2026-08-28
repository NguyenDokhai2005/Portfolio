/**
 * Reads the temporary `window.__lanyardDebug` counters to quantify the band's
 * attachment problem: how far the rendered band end drifts from the clip anchor
 * on the card, and how far the smoothed rope joints trail the physics.
 *
 * Samples an idle swing, then a dragged swing, which is when any joint softness
 * or frame-rate-dependent smoothing shows up worst.
 *
 * Run: node scripts/diagnose-band.mjs [origin]
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ORIGIN = process.argv[2] ?? 'http://localhost:3211';
const PORT = 9342;

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
    `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'cdp-band-'))}`,
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

await send(
  'Emulation.setDeviceMetricsOverride',
  { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
  sessionId,
);
await send('Page.navigate', { url: `${ORIGIN}/` }, sessionId);
await wait(1600);
await evaluate(
  `['introPlayed','heroPlayed','navbarPlayed'].forEach(k=>sessionStorage.setItem(k,'true'))`,
);
await send('Page.reload', {}, sessionId);
await wait(5000);

const readout = async (label) => {
  const d = await evaluate('window.__lanyardDebug ?? null');
  if (!d) {
    console.log(`${label}: no debug data (is the diagnostic build running?)`);
    return;
  }
  console.log(
    `${label}\n` +
      `   band-end vs clip anchor : max ${d.maxGap.toFixed(4)}  mean ${(d.sumGap / d.samples).toFixed(4)} world units\n` +
      `   j1 smoothing trail      : max ${d.maxLerp1.toFixed(4)}\n` +
      `   j2 smoothing trail      : max ${d.maxLerp2.toFixed(4)}\n` +
      `   frame delta             : ${d.minDelta.toFixed(4)}s .. ${d.maxDelta.toFixed(4)}s  (${d.samples} frames)`,
  );
};

const reset = () => evaluate('window.__lanyardDebug = undefined');

// --- idle -----------------------------------------------------------------
await reset();
await wait(3500);
await readout('IDLE (card spinning, no pointer)');

// --- dragged --------------------------------------------------------------
// Grab the card and whip it around; joint softness peaks under fast motion.
const cardPoint = await evaluate(`(() => {
  const c = document.querySelector('#home canvas');
  const r = c.getBoundingClientRect();
  return { x: Math.round(r.left + r.width * 0.82), y: Math.round(r.top + r.height * 0.5) };
})()`);

await reset();
await send(
  'Input.dispatchMouseEvent',
  { type: 'mousePressed', x: cardPoint.x, y: cardPoint.y, button: 'left', clickCount: 1 },
  sessionId,
);
for (let step = 0; step < 40; step += 1) {
  const x = cardPoint.x + Math.round(Math.sin(step / 3) * 220);
  const y = cardPoint.y + Math.round(Math.cos(step / 4) * 120);
  await send(
    'Input.dispatchMouseEvent',
    { type: 'mouseMoved', x, y, button: 'left' },
    sessionId,
  );
  await wait(45);
}
await readout('DRAGGED (whipped around)');
await send(
  'Input.dispatchMouseEvent',
  { type: 'mouseReleased', x: cardPoint.x, y: cardPoint.y, button: 'left', clickCount: 1 },
  sessionId,
);

// --- settling after release ----------------------------------------------
await reset();
await wait(2500);
await readout('SETTLING (just released)');

socket.close();
chrome.kill();
