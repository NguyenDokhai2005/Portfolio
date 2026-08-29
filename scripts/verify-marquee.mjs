/**
 * Proves the tech marquee loops without a seam, and reports the height the new
 * rows add to the About section.
 *
 * The animation slides the track by exactly -50%. That is only seamless if the
 * first duplicated item starts at precisely half the track's width — otherwise
 * every cycle snaps by the difference. This is the failure mode that flex `gap`
 * introduces, so it is asserted numerically rather than eyeballed.
 *
 * Run: node scripts/verify-marquee.mjs [origin]
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ORIGIN = process.argv[2] ?? 'http://localhost:3211';
const PORT = 9344;
const WIDTHS = [375, 768, 1440];
const VIEWPORT_HEIGHT = 812;

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
    `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'cdp-marquee-'))}`,
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

const PROBE = `(() => {
  const rows = [...document.querySelectorAll('.tech-marquee')].map((row, rowIndex) => {
    const track = row.querySelector('.tech-marquee__track');
    const items = [...track.children];
    const half = items.length / 2;
    const firstDuplicate = items[half];

    // Widths come from the layout box, which already includes each item's
    // trailing margin, so this is the exact distance the animation must travel.
    const trackWidth = items.reduce((sum, item) => {
      const style = getComputedStyle(item);
      return sum + item.getBoundingClientRect().width + parseFloat(style.marginInlineEnd || 0);
    }, 0);

    const style = getComputedStyle(track);
    return {
      rowIndex,
      itemCount: items.length,
      trackWidth: +trackWidth.toFixed(2),
      halfTrack: +(trackWidth / 2).toFixed(2),
      duplicateOffset: +(firstDuplicate.offsetLeft - items[0].offsetLeft).toFixed(2),
      duration: style.animationDuration,
      direction: style.animationDirection,
      running: style.animationPlayState,
      overflowHidden: getComputedStyle(row).overflow !== 'visible',
    };
  });

  const about = document.getElementById('about');
  const marqueeBlock = about?.querySelector('.tech-marquee')?.parentElement;

  // The .snap-section wrapper also carries min-height:100dvh and stretches its
  // child, so relaxing the section alone floors the reading at the viewport
  // height and hides how tall the content really is. Both must be neutralised.
  const naturalHeight = (() => {
    if (!about) return null;
    const slot = about.closest('.snap-section');
    const inner = about.parentElement;
    const prevSection = about.style.minHeight;
    const prevSlot = slot ? slot.style.minHeight : null;
    const prevFlex = inner ? about.style.flex : null;

    about.style.minHeight = '0px';
    about.style.flex = '0 0 auto';
    if (slot) slot.style.minHeight = '0px';

    const h = Math.ceil(about.getBoundingClientRect().height);

    about.style.minHeight = prevSection;
    if (prevFlex !== null) about.style.flex = prevFlex;
    if (slot && prevSlot !== null) slot.style.minHeight = prevSlot;
    return h;
  })();

  const logos = [...document.querySelectorAll('.tech-marquee img')];

  return {
    vw: window.innerWidth,
    vh: window.innerHeight,
    rows,
    aboutNaturalHeight: naturalHeight,
    marqueeBlockHeight: marqueeBlock ? Math.ceil(marqueeBlock.getBoundingClientRect().height) : null,
    logoCount: logos.length,
    brokenLogos: logos.filter((i) => !(i.complete && i.naturalWidth > 0)).length,
    scrollW: document.documentElement.scrollWidth,
  };
})()`;

const lines = [];
let failures = 0;
const fail = (m) => {
  failures += 1;
  lines.push(`  FAIL  ${m}`);
};
const pass = (m) => lines.push(`  ok    ${m}`);

for (const width of WIDTHS) {
  await send(
    'Emulation.setDeviceMetricsOverride',
    { width, height: VIEWPORT_HEIGHT, deviceScaleFactor: 1, mobile: width < 768 },
    sessionId,
  );
  await send('Page.navigate', { url: `${ORIGIN}/` }, sessionId);
  await wait(1600);
  await evaluate(
    `['introPlayed','heroPlayed','navbarPlayed'].forEach(k=>sessionStorage.setItem(k,'true'))`,
  );
  await send('Page.reload', {}, sessionId);
  await wait(3000);
  await evaluate(
    `document.getElementById('about').scrollIntoView({ behavior: 'instant', block: 'start' })`,
  );
  await wait(1400);

  const probe = await evaluate(PROBE);
  lines.push(`\n########## ${width} x ${probe.vh} ##########`);

  if (probe.rows.length !== 2) fail(`expected 2 marquee rows, found ${probe.rows.length}`);
  else pass('2 marquee rows present');

  for (const row of probe.rows) {
    const drift = Math.abs(row.duplicateOffset - row.halfTrack);
    // Sub-pixel tolerance: layout rounding, not a real seam.
    if (drift <= 0.5) {
      pass(
        `row ${row.rowIndex}: duplicate starts at ${row.duplicateOffset}px, ` +
          `half track ${row.halfTrack}px — seamless (drift ${drift.toFixed(2)}px)`,
      );
    } else {
      fail(
        `row ${row.rowIndex}: duplicate at ${row.duplicateOffset}px vs half track ` +
          `${row.halfTrack}px — loop will jump ${drift.toFixed(2)}px every cycle`,
      );
    }
    if (row.itemCount % 2 !== 0) fail(`row ${row.rowIndex}: odd item count ${row.itemCount}`);
    if (!row.overflowHidden) fail(`row ${row.rowIndex}: container is not clipping`);
    lines.push(
      `        items=${row.itemCount} duration=${row.duration} ` +
        `direction=${row.direction} state=${row.running}`,
    );
  }

  const directions = probe.rows.map((r) => r.direction);
  if (new Set(directions).size === 2) pass(`rows travel opposite ways (${directions.join(' / ')})`);
  else fail(`both rows share direction ${directions[0]}`);

  if (probe.brokenLogos === 0) pass(`all ${probe.logoCount} logo images loaded`);
  else fail(`${probe.brokenLogos} of ${probe.logoCount} logos failed to load`);

  if (probe.scrollW <= probe.vw) pass(`no horizontal page overflow (${probe.scrollW})`);
  else fail(`horizontal overflow: scrollWidth ${probe.scrollW} > ${probe.vw}`);

  const over = probe.aboutNaturalHeight - probe.vh;
  lines.push(
    `        About natural height ${probe.aboutNaturalHeight}px ` +
      `(marquee block ${probe.marqueeBlockHeight}px) — ` +
      (over > 0 ? `EXCEEDS viewport by ${over}px` : `fits, ${-over}px spare`),
  );
}

const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
writeFileSync('.tmp-marquee.png', Buffer.from(shot.data, 'base64'));
lines.push('\nwrote .tmp-marquee.png');

lines.push(failures === 0 ? '\nALL MARQUEE CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
console.log(lines.join('\n'));

socket.close();
chrome.kill();
process.exit(failures === 0 ? 0 : 1);
