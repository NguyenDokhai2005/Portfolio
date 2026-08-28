/**
 * Captures the hero card at intervals so a full idle revolution can be checked
 * frame by frame — in particular whether the reverse face is textured with the
 * atlas's back panel rather than a stretched copy of the portrait.
 *
 * Run: node scripts/shoot-card-spin.mjs [origin] [frames] [intervalMs]
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import sharp from 'sharp';

const ORIGIN = process.argv[2] ?? 'http://localhost:3211';
const FRAMES = Number(process.argv[3] ?? 8);
const INTERVAL = Number(process.argv[4] ?? 1100);
const PORT = 9340;
const WIDTH = 1440;
const HEIGHT = 900;

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
    `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'cdp-spin-'))}`,
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

await send(
  'Emulation.setDeviceMetricsOverride',
  { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false },
  sessionId,
);
await send('Page.navigate', { url: `${ORIGIN}/` }, sessionId);
await wait(1600);
await evaluate(
  `['introPlayed','heroPlayed','navbarPlayed'].forEach(k=>sessionStorage.setItem(k,'true'))`,
);
await send('Page.reload', {}, sessionId);
await wait(4500);

/** Crop to the right half, where the card lives, so the frames are easy to read. */
const CROP = { left: Math.round(WIDTH * 0.6), top: 0, width: Math.round(WIDTH * 0.4), height: HEIGHT };

const report = [];

for (let frame = 0; frame < FRAMES; frame += 1) {
  const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  const png = Buffer.from(shot.data, 'base64');
  const file = `.tmp-spin-${String(frame).padStart(2, '0')}.png`;
  await sharp(png).extract(CROP).toFile(file);

  // Mean luminance of the card region separates the faces: the portrait side is
  // much brighter than the near-black back panel.
  const { data, info } = await sharp(png)
    .extract(CROP)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let sum = 0;
  let bright = 0;
  const pixels = info.width * info.height;
  for (let i = 0; i < pixels; i += 1) {
    const o = i * info.channels;
    const l = data[o] * 0.299 + data[o + 1] * 0.587 + data[o + 2] * 0.114;
    sum += l;
    if (l > 170) bright += 1;
  }

  report.push(
    `${file}  meanLuma=${(sum / pixels).toFixed(1).padStart(6)}  brightPx=${String(bright).padStart(6)}`,
  );
  await wait(INTERVAL);
}

console.log(report.join('\n'));
socket.close();
chrome.kill();
