/**
 * Opens the Portfolio "Tech Stack" tab and screenshots the grid, so the devicon
 * logos can be checked for readability — several ship as solid black and rely on
 * the `invert` flag to show up on the dark tiles.
 *
 * Run: node scripts/shoot-tech-stack.mjs [origin]
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ORIGIN = process.argv[2] ?? 'http://localhost:3211';
const PORT = 9343;

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
    `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'cdp-tech-'))}`,
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
  { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false },
  sessionId,
);
await send('Page.navigate', { url: `${ORIGIN}/` }, sessionId);
await wait(1600);
await evaluate(
  `['introPlayed','heroPlayed','navbarPlayed'].forEach(k=>sessionStorage.setItem(k,'true'))`,
);
await send('Page.reload', {}, sessionId);
await wait(3200);

await evaluate(
  `document.getElementById('portfolio').scrollIntoView({ behavior: 'instant', block: 'start' })`,
);
await wait(800);
const clicked = await evaluate(
  `Boolean([...document.querySelectorAll('button')]
     .find(b => b.textContent.trim() === 'Tech Stack')
     ?.click() ?? true)`,
);
await wait(2600);

// Report any logo that renders too dark to see, measured from the live DOM.
const audit = await evaluate(`(() => {
  const imgs = [...document.querySelectorAll('#portfolio img')];
  return imgs.map((img) => ({
    name: img.alt,
    inverted: img.className.includes('invert'),
    loaded: img.complete && img.naturalWidth > 0,
  }));
})()`);

const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
writeFileSync('.tmp-tech-stack.png', Buffer.from(shot.data, 'base64'));

console.log(`tab clicked: ${clicked}`);
const broken = audit.filter((a) => !a.loaded);
console.log(`${audit.length} logos; inverted: ${audit.filter((a) => a.inverted).length}`);
console.log(
  broken.length === 0
    ? 'all logos loaded'
    : `FAILED TO LOAD: ${broken.map((b) => b.name).join(', ')}`,
);
console.log('wrote .tmp-tech-stack.png');

socket.close();
chrome.kill();
process.exit(broken.length === 0 ? 0 : 1);
