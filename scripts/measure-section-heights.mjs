/**
 * Measures each section's *natural* content height (min-height overridden to
 * auto) against the viewport, at the breakpoints that matter.
 *
 * This is the go / no-go check for `scroll-snap-type: y mandatory`: a section
 * taller than the viewport strands the content between two snap points, so the
 * ladder has to know which sections overflow before the snap mode is chosen.
 *
 * Run: node scripts/measure-section-heights.mjs [origin]
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ORIGIN = process.argv[2] ?? 'http://localhost:3211';
const PORT = 9335;
const WIDTHS = [375, 768, 1440];

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
    `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'cdp-h-'))}`,
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
  const result = await send(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true },
    sessionId,
  );
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Neutralises the min-height so the section collapses to its content, measures,
 * then restores. Portfolio is measured in every tab state plus "See More"
 * expanded, because that is the tallest the page ever gets.
 */
const PROBE = `(async () => {
  const vh = window.innerHeight;
  const rows = [];

  const natural = (el) => {
    const prevMin = el.style.minHeight;
    const prevH = el.style.height;
    el.style.minHeight = '0px';
    el.style.height = 'auto';
    const h = Math.ceil(el.getBoundingClientRect().height);
    el.style.minHeight = prevMin;
    el.style.height = prevH;
    return h;
  };

  const clickByText = async (text) => {
    const btn = [...document.querySelectorAll('button')].find(
      (b) => b.textContent.trim() === text,
    );
    if (!btn) return false;
    btn.click();
    await new Promise((r) => setTimeout(r, 900));
    return true;
  };

  for (const id of ['home', 'about']) {
    const el = document.getElementById(id);
    if (el) rows.push({ id, h: natural(el) });
  }

  const portfolio = document.getElementById('portfolio');
  if (portfolio) {
    rows.push({ id: 'portfolio (projects, collapsed)', h: natural(portfolio) });
    if (await clickByText('See More')) {
      rows.push({ id: 'portfolio (projects, expanded)', h: natural(portfolio) });
      await clickByText('See Less');
    }
    if (await clickByText('Certificates')) {
      rows.push({ id: 'portfolio (certificates)', h: natural(portfolio) });
    }
    if (await clickByText('Tech Stack')) {
      rows.push({ id: 'portfolio (tech stack)', h: natural(portfolio) });
    }
    await clickByText('Projects');
  }

  const contact = document.getElementById('contact');
  if (contact) rows.push({ id: 'contact', h: natural(contact) });

  return { vh, vw: window.innerWidth, rows };
})()`;

const lines = [];

for (const width of WIDTHS) {
  await send(
    'Emulation.setDeviceMetricsOverride',
    { width, height: 812, deviceScaleFactor: 1, mobile: width < 768 },
    sessionId,
  );

  await send('Page.navigate', { url: `${ORIGIN}/` }, sessionId);
  await wait(1800);
  await evaluate(
    `['introPlayed','heroPlayed','navbarPlayed'].forEach(k=>sessionStorage.setItem(k,'true'))`,
  );
  await send('Page.reload', {}, sessionId);
  await wait(3200);

  const probe = await evaluate(PROBE);
  lines.push(`\n=== ${probe.vw} x ${probe.vh} (viewport height = ${probe.vh}px) ===`);
  for (const row of probe.rows) {
    const delta = row.h - probe.vh;
    const verdict = delta > 0 ? `OVERFLOWS by ${delta}px` : `fits (${-delta}px spare)`;
    lines.push(`  ${row.id.padEnd(34)} ${String(row.h).padStart(5)}px   ${verdict}`);
  }
}

console.log(lines.join('\n'));

socket.close();
chrome.kill();
