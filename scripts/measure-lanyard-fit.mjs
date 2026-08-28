/**
 * Measures whether the 3D lanyard card fits inside the hero canvas.
 *
 * The card's white frame is the brightest thing in the hero, so its pixel
 * bounding box can be found reliably. If that box touches a canvas edge the card
 * is being cropped by the camera frustum.
 *
 * Run: node scripts/measure-lanyard-fit.mjs [origin]
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import sharp from 'sharp';

const ORIGIN = process.argv[2] ?? 'http://localhost:3211';
const PORT = 9339;

/** Width x height pairs: the required breakpoints plus tall/wide desktops where
 *  capping the shell narrows the canvas aspect. */
const VIEWPORTS = [
  [375, 812],
  [768, 812],
  [1024, 640],
  [1440, 812],
  [1440, 900],
  [1920, 1200],
  [2560, 1440],
];

const BRIGHT = 170;

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
    `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'cdp-fit-'))}`,
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

const lines = [];
let clipped = 0;

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
  // Let the rope physics settle so the card is at rest, not mid-swing.
  await wait(5200);

  const info = await evaluate(`(() => {
    const canvas = document.querySelector('#home canvas');
    if (!canvas) return { hasCanvas: false };
    const r = canvas.getBoundingClientRect();
    const cam = window.__heroCamera;
    return {
      hasCanvas: true,
      l: Math.round(r.left), t: Math.round(r.top),
      w: Math.round(r.width), h: Math.round(r.height),
      aspect: +(r.width / r.height).toFixed(3),
    };
  })()`);

  const label = `${width}x${height}`;

  if (!info.hasCanvas) {
    lines.push(`${label.padEnd(11)} no canvas (lanyard not rendered)`);
    continue;
  }

  const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  const png = Buffer.from(shot.data, 'base64');
  const { data, info: meta } = await sharp(png)
    .extract({
      left: info.l,
      top: Math.max(0, info.t),
      width: info.w,
      height: Math.min(info.h, height - Math.max(0, info.t)),
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const W = meta.width;
  const H = meta.height;
  const C = meta.channels;
  let minX = Infinity;
  let maxX = -1;
  let minY = Infinity;
  let maxY = -1;

  // Ignore the left 40%: the headline type is also bright white.
  const startX = Math.floor(W * 0.4);
  for (let y = 0; y < H; y += 1) {
    for (let x = startX; x < W; x += 1) {
      const i = (y * W + x) * C;
      const l = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      if (l < BRIGHT) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0) {
    lines.push(`${label.padEnd(11)} aspect=${String(info.aspect).padEnd(6)} no bright card pixels found`);
    continue;
  }

  const gapRight = W - 1 - maxX;
  const gapLeft = minX - startX;
  const touchesRight = gapRight <= 1;
  const touchesTop = minY <= 1;
  const touchesBottom = maxY >= H - 2;
  const bad = touchesRight || touchesBottom;
  if (bad) clipped += 1;

  lines.push(
    `${label.padEnd(11)} aspect=${String(info.aspect).padEnd(6)} ` +
      `card x=[${minX}..${maxX}] y=[${minY}..${maxY}] of ${W}x${H}  ` +
      `gapRight=${gapRight}px  ` +
      (bad
        ? `CLIPPED (${[
            touchesRight && 'right',
            touchesTop && 'top',
            touchesBottom && 'bottom',
          ]
            .filter(Boolean)
            .join('+')})`
        : 'fits'),
  );
}

lines.push(
  `\n${clipped === 0 ? 'CARD FITS AT EVERY VIEWPORT' : `${clipped} viewport(s) clip the card`}`,
);
console.log(lines.join('\n'));

socket.close();
chrome.kill();
process.exit(clipped === 0 ? 0 : 1);
