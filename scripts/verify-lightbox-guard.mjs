/**
 * Confirms the wheel handler stands down while the certificate lightbox is open,
 * i.e. that the full-screen fixed overlay is detected and the page behind it does
 * not step to another section.
 *
 * Run: node scripts/verify-lightbox-guard.mjs [origin]
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ORIGIN = process.argv[2] ?? 'http://localhost:3211';
const PORT = 9337;

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
    `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'cdp-lb-'))}`,
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
  { width: 1440, height: 812, deviceScaleFactor: 1, mobile: false },
  sessionId,
);
await send('Page.navigate', { url: `${ORIGIN}/` }, sessionId);
await wait(1600);
await evaluate(
  `['introPlayed','heroPlayed','navbarPlayed'].forEach(k=>sessionStorage.setItem(k,'true'))`,
);
await send('Page.reload', {}, sessionId);
await wait(3000);

const out = [];
let failures = 0;
const check = (ok, message) => {
  out.push(`${ok ? '  ok  ' : '  FAIL'}  ${message}`);
  if (!ok) failures += 1;
};

// Open the Certificates tab, then the first certificate's preview.
await evaluate(
  `document.getElementById('portfolio').scrollIntoView({ behavior: 'instant', block: 'start' })`,
);
await wait(900);
await evaluate(
  `[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Certificates')?.click()`,
);
await wait(1200);

const opened = await evaluate(`(() => {
  const card = document.querySelector('#portfolio img');
  if (!card) return { ok: false, why: 'no certificate image' };
  (card.closest('[role="button"]') ?? card.parentElement ?? card).click();
  return { ok: true };
})()`);
await wait(1200);

const state = await evaluate(`(() => {
  const overlay = [...document.querySelectorAll('div')].find((d) => {
    const s = getComputedStyle(d);
    return s.position === 'fixed' && d.getBoundingClientRect().height >= window.innerHeight * 0.9;
  });
  return {
    overlayFound: Boolean(overlay),
    y: Math.round(window.scrollY),
    cx: overlay ? Math.round(window.innerWidth / 2) : 0,
    cy: overlay ? Math.round(window.innerHeight / 2) : 0,
  };
})()`);

check(opened.ok, `certificate clicked (${opened.why ?? 'ok'})`);
check(state.overlayFound, 'full-screen fixed overlay present (lightbox open)');

if (state.overlayFound) {
  for (let n = 0; n < 3; n += 1) {
    await send(
      'Input.dispatchMouseEvent',
      { type: 'mouseWheel', x: state.cx, y: state.cy, deltaX: 0, deltaY: 200 },
      sessionId,
    );
    await wait(200);
  }
  await wait(900);
  const after = await evaluate('Math.round(window.scrollY)');
  check(
    after === state.y,
    `page stayed at y=${after} with the lightbox open (was ${state.y})`,
  );
}

out.push(failures === 0 ? '\nLIGHTBOX GUARD OK' : `\n${failures} FAILED`);
console.log(out.join('\n'));

socket.close();
chrome.kill();
process.exit(failures === 0 ? 0 : 1);
