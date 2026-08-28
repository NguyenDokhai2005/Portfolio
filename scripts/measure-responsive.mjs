/**
 * Drives headless Chrome over CDP and reports the real content box of every
 * section at a set of viewport widths, so the container ladder can be verified
 * with numbers instead of eyeballed screenshots.
 *
 * Run: node scripts/measure-responsive.mjs [origin]
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ORIGIN = process.argv[2] ?? 'http://localhost:3211';
const PORT = 9333;

const WIDTHS = [320, 390, 430, 640, 768, 1024, 1280, 1440, 1920, 2560];
const TARGETS = [
  ['navbar', 'nav > div > div'],
  ['hero', '#home .page-shell-wide'],
  ['about', '#about .page-shell-wide'],
  ['portfolio', '#portfolio'],
  ['contact', '#contact'],
];

const CHROME = [
  `${process.env.ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe`,
  `${process.env['ProgramFiles(x86)']}\\Google\\Chrome\\Application\\chrome.exe`,
  `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
].find((candidate) => existsSync(candidate));

if (!CHROME) throw new Error('Chrome not found');

const profileDir = mkdtempSync(path.join(tmpdir(), 'cdp-'));
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

/** Chrome needs a moment before /json/version answers. */
async function waitForTarget() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      return (await response.json()).webSocketDebuggerUrl;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error('Chrome did not expose a debugging endpoint');
}

function connect(url) {
  const socket = new WebSocket(url);
  const pending = new Map();
  let nextId = 0;

  const ready = new Promise((resolve, reject) => {
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

  return { ready, send, close: () => socket.close() };
}

const wsUrl = await waitForTarget();
const browser = connect(wsUrl);
await browser.ready;

const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await browser.send('Target.attachToTarget', {
  targetId,
  flatten: true,
});

const evaluate = async (expression) => {
  const result = await browser.send(
    'Runtime.evaluate',
    { expression, awaitPromise: true, returnByValue: true },
    sessionId,
  );
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};

await browser.send('Page.enable', {}, sessionId);
await browser.send('Runtime.enable', {}, sessionId);

const PROBE = `(() => {
  const targets = ${JSON.stringify(TARGETS)};
  const out = { width: window.innerWidth, scrollW: document.documentElement.scrollWidth, rows: [] };
  for (const [name, selector] of targets) {
    const node = document.querySelector(selector);
    if (!node) { out.rows.push({ name, missing: true }); continue; }
    const rect = node.getBoundingClientRect();
    const cs = getComputedStyle(node);
    out.rows.push({
      name,
      left: Math.round(rect.left),
      right: Math.round(window.innerWidth - rect.right),
      box: Math.round(rect.width),
      pl: Math.round(parseFloat(cs.paddingLeft)),
      pr: Math.round(parseFloat(cs.paddingRight)),
      contentLeft: Math.round(rect.left + parseFloat(cs.paddingLeft)),
      contentRight: Math.round(window.innerWidth - rect.right + parseFloat(cs.paddingRight)),
    });
  }
  return out;
})()`;

const report = [];

for (const width of WIDTHS) {
  await browser.send(
    'Emulation.setDeviceMetricsOverride',
    { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 },
    sessionId,
  );

  // Intro overlay + hero reveal gate the sections behind sessionStorage flags.
  await evaluate(
    `(async () => {
      sessionStorage.setItem('introPlayed','true');
      sessionStorage.setItem('heroPlayed','true');
      sessionStorage.setItem('navbarPlayed','true');
    })()`,
  ).catch(() => {});

  await browser.send('Page.navigate', { url: `${ORIGIN}/` }, sessionId);
  await new Promise((resolve) => setTimeout(resolve, 2600));
  await evaluate(
    `(() => { sessionStorage.setItem('introPlayed','true'); sessionStorage.setItem('heroPlayed','true'); sessionStorage.setItem('navbarPlayed','true'); })()`,
  );
  await browser.send('Page.reload', {}, sessionId);
  await new Promise((resolve) => setTimeout(resolve, 2200));

  const probe = await evaluate(PROBE);
  report.push(probe);
}

browser.close();
chrome.kill();
try {
  rmSync(profileDir, { recursive: true, force: true });
} catch {
  /* Chrome may still hold a handle; the OS temp sweep will collect it. */
}

const lines = [];
for (const page of report) {
  const overflow = page.scrollW > page.width ? ` OVERFLOW scrollW=${page.scrollW}` : '';
  lines.push(`\n=== ${page.width}px${overflow} ===`);
  lines.push('  section     boxW   left  right   padL  padR   contentL contentR');
  for (const row of page.rows) {
    if (row.missing) {
      lines.push(`  ${row.name.padEnd(11)} (not found)`);
      continue;
    }
    lines.push(
      `  ${row.name.padEnd(11)}` +
        `${String(row.box).padStart(5)}` +
        `${String(row.left).padStart(7)}` +
        `${String(row.right).padStart(7)}` +
        `${String(row.pl).padStart(7)}` +
        `${String(row.pr).padStart(6)}` +
        `${String(row.contentLeft).padStart(11)}` +
        `${String(row.contentRight).padStart(9)}`,
    );
  }
}

console.log(lines.join('\n'));
