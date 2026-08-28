/**
 * Captures screenshots at given viewport widths, skipping the intro overlay so
 * framer-motion reveal states have settled before the frame is taken.
 *
 * Run: node scripts/shoot-responsive.mjs <origin> <width>x<selectorToScrollTo> ...
 * e.g. node scripts/shoot-responsive.mjs http://localhost:3211 768@#about 1920@
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const [origin, ...specs] = process.argv.slice(2);
const PORT = 9334;

const CHROME = [
  `${process.env.ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe`,
  `${process.env['ProgramFiles(x86)']}\\Google\\Chrome\\Application\\chrome.exe`,
  `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
].find((candidate) => existsSync(candidate));
if (!CHROME) throw new Error('Chrome not found');

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'cdp-shot-'))}`,
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

const evaluate = (expression) =>
  send('Runtime.evaluate', { expression, returnByValue: true }, sessionId);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

for (const spec of specs) {
  const [rawWidth, anchor = ''] = spec.split('@');
  const width = Number(rawWidth);

  await send(
    'Emulation.setDeviceMetricsOverride',
    { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 },
    sessionId,
  );

  await send('Page.navigate', { url: `${origin}/` }, sessionId);
  await wait(2000);
  await evaluate(
    `['introPlayed','heroPlayed','navbarPlayed'].forEach(k=>sessionStorage.setItem(k,'true'))`,
  );
  await send('Page.navigate', { url: `${origin}/${anchor}` }, sessionId);
  await wait(3500);
  if (anchor) {
    await evaluate(
      `document.querySelector('${anchor}')?.scrollIntoView({block:'start'})`,
    );
    await wait(1800);
  }

  const { data } = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  const file = `.tmp-shot-${width}${anchor.replace('#', '-')}.png`;
  writeFileSync(file, Buffer.from(data, 'base64'));
  console.log(`${file}`);
}

socket.close();
chrome.kill();
