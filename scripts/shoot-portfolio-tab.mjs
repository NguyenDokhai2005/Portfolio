/**
 * Opens a Portfolio tab by its visible label and screenshots the panel, also
 * reporting any image inside it that failed to load.
 *
 * Run: node scripts/shoot-portfolio-tab.mjs [tabLabel] [origin]
 * e.g. node scripts/shoot-portfolio-tab.mjs Experience
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const TAB_LABEL = process.argv[2] ?? 'Experience';
const ORIGIN = process.argv[3] ?? 'http://localhost:3211';
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
const clicked = await evaluate(`(() => {
  const button = [...document.querySelectorAll('#portfolio button')]
    .find((b) => b.textContent.trim() === ${JSON.stringify(TAB_LABEL)});
  if (!button) return false;
  button.click();
  return true;
})()`);
await wait(2600);

const audit = await evaluate(`(() => {
  const panel = document.querySelector('#portfolio');
  const imgs = [...panel.querySelectorAll('img')];
  return {
    cardCount: panel.querySelectorAll('h3').length,
    images: imgs.map((img) => ({
      name: img.alt || img.getAttribute('src'),
      loaded: img.complete && img.naturalWidth > 0,
    })),
  };
})()`);

const slug = TAB_LABEL.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const file = `.tmp-tab-${slug}.png`;
const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
writeFileSync(file, Buffer.from(shot.data, 'base64'));

const broken = audit.images.filter((a) => !a.loaded);
console.log(`tab "${TAB_LABEL}" clicked: ${clicked}`);
console.log(`headings in panel: ${audit.cardCount}`);
console.log(`images: ${audit.images.length}`);
console.log(
  broken.length === 0
    ? 'all images loaded'
    : `FAILED TO LOAD: ${broken.map((b) => b.name).join(', ')}`,
);
console.log(`wrote ${file}`);

socket.close();
chrome.kill();
process.exit(clicked && broken.length === 0 ? 0 : 1);
