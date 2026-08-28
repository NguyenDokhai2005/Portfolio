/**
 * Captures a tight crop around the strap's clip while the card spins, so the
 * clip can be checked for rotation independently of the card.
 *
 * Also reports the clip's projected width per frame: a fixed clip keeps a steady
 * width, whereas a rotating one oscillates.
 *
 * Run: node scripts/shoot-clip-region.mjs [origin] [frames] [intervalMs]
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import sharp from 'sharp';

const ORIGIN = process.argv[2] ?? 'http://localhost:3211';
const FRAMES = Number(process.argv[3] ?? 6);
const INTERVAL = Number(process.argv[4] ?? 900);
const PORT = 9341;
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
    `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'cdp-clip-'))}`,
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

/** Region covering the strap end, the clip and the top of the card. */
const CROP = { left: 1080, top: 170, width: 260, height: 300 };

const report = [];

for (let frame = 0; frame < FRAMES; frame += 1) {
  const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  const png = Buffer.from(shot.data, 'base64');
  const file = `.tmp-clip-${String(frame).padStart(2, '0')}.png`;
  await sharp(png).extract(CROP).resize({ width: CROP.width * 2 }).toFile(file);

  // The clip is metal on a near-black backdrop; measure the horizontal spread of
  // mid-tone pixels in the upper band, above the card.
  const band = { left: CROP.left, top: CROP.top, width: CROP.width, height: 90 };
  const { data, info } = await sharp(png)
    .extract(band)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let minX = Infinity;
  let maxX = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const o = (y * info.width + x) * info.channels;
      const l = data[o] * 0.299 + data[o + 1] * 0.587 + data[o + 2] * 0.114;
      if (l < 60) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
  }

  report.push(
    `${file}  clipBandSpread=${maxX < 0 ? 'none' : `${maxX - minX + 1}px [${minX}..${maxX}]`}`,
  );
  await wait(INTERVAL);
}

console.log(report.join('\n'));
socket.close();
chrome.kill();
