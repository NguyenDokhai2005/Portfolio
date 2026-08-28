/**
 * Verifies the scroll-snap behaviour with real synthesized gestures.
 *
 * Checks, per breakpoint:
 *   1. the document (not <body>/<main>) is the scroll container and carries
 *      `scroll-snap-type` — the failure mode that silently disables snapping;
 *   2. each snap slot is exactly one viewport tall and rests flush at the top
 *      with no neighbour peeking in;
 *   3. one wheel gesture advances exactly one section, and an exaggerated flick
 *      still cannot skip a section (`scroll-snap-stop: always`);
 *   4. the fixed navbar keeps its position and stays the topmost hit target;
 *   5. no horizontal overflow, and which sections exceed the viewport height.
 *
 * Run: node scripts/verify-snap.mjs [origin]
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ORIGIN = process.argv[2] ?? 'http://localhost:3211';
const PORT = 9336;
const WIDTHS = [375, 768, 1440];
const VIEWPORT_HEIGHT = 812;

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
    `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'cdp-snap-'))}`,
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

/** A wheel flick; negative yDistance scrolls the view downwards. */
const flick = async (distance, width) => {
  await send(
    'Input.synthesizeScrollGesture',
    {
      x: Math.round(width / 2),
      y: Math.round(VIEWPORT_HEIGHT / 2),
      xDistance: 0,
      yDistance: -distance,
      gestureSourceType: 'mouse',
      speed: 4000,
    },
    sessionId,
  );
  await wait(1400);
};

const SLOTS = `(() => {
  const slots = [...document.querySelectorAll('.snap-section')];
  return slots.map((slot) => {
    const section = slot.querySelector('section');
    return {
      id: section?.id ?? '(no section)',
      top: Math.round(slot.offsetTop),
      slotH: Math.round(slot.getBoundingClientRect().height),
      sectionH: section ? Math.round(section.getBoundingClientRect().height) : 0,
      align: getComputedStyle(slot).scrollSnapAlign,
      stop: getComputedStyle(slot).scrollSnapStop,
    };
  });
})()`;

const ENV = `(() => {
  const html = getComputedStyle(document.documentElement);
  const body = getComputedStyle(document.body);
  const main = getComputedStyle(document.querySelector('main'));
  return {
    scrollingElementIsHtml: document.scrollingElement === document.documentElement,
    htmlSnapType: html.scrollSnapType,
    bodyOverflowX: body.overflowX,
    bodyOverflowY: body.overflowY,
    mainOverflowX: main.overflowX,
    mainOverflowY: main.overflowY,
    vh: window.innerHeight,
    vw: window.innerWidth,
    scrollW: document.documentElement.scrollWidth,
  };
})()`;

const AT_REST = `(() => {
  const y = Math.round(window.scrollY);
  const vh = window.innerHeight;
  const visible = [...document.querySelectorAll('.snap-section')]
    .map((slot) => {
      const r = slot.getBoundingClientRect();
      const overlap = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      return {
        id: slot.querySelector('section')?.id ?? '?',
        px: Math.round(Math.max(0, overlap)),
        top: Math.round(r.top),
      };
    })
    .filter((s) => s.px > 0);
  const nav = document.querySelector('nav');
  const navRect = nav?.getBoundingClientRect();
  const navCentre = navRect
    ? document.elementFromPoint(navRect.left + 30, navRect.top + navRect.height / 2)
    : null;
  const scrollHint = [...document.querySelectorAll('span')].find(
    (s) => s.textContent.trim() === 'Scroll',
  );
  const hintRect = scrollHint?.getBoundingClientRect();
  return {
    y,
    visible,
    navTop: navRect ? Math.round(navRect.top) : null,
    navHit: nav && navCentre ? nav.contains(navCentre) : false,
    scrollHintVisible: hintRect
      ? hintRect.bottom > 0 && hintRect.top < vh && Number(getComputedStyle(scrollHint).opacity) > 0.01
      : false,
  };
})()`;

const lines = [];
let failures = 0;
const fail = (message) => {
  failures += 1;
  lines.push(`  FAIL  ${message}`);
};
const pass = (message) => lines.push(`  ok    ${message}`);

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

  const env = await evaluate(ENV);
  const slots = await evaluate(SLOTS);

  lines.push(`\n########## ${width} x ${env.vh} ##########`);

  // --- 1. snap really attaches to the document scroller -------------------
  lines.push(' [1] scroll container');
  if (env.scrollingElementIsHtml) pass('document scroller is <html>');
  else fail('document scroller is not <html>');
  // Chrome serialises `y proximity` back as plain `y`, since `proximity` is the
  // initial strictness — so both spellings mean proximity snapping is active.
  if (env.htmlSnapType === 'y' || env.htmlSnapType === 'y proximity')
    pass(`html scroll-snap-type = "${env.htmlSnapType}" (y proximity)`);
  else fail(`html scroll-snap-type = "${env.htmlSnapType}"`);
  for (const [label, value] of [
    ['body', env.bodyOverflowX],
    ['main', env.mainOverflowX],
  ]) {
    if (value === 'hidden') fail(`${label} overflow-x: hidden makes it a scroll container`);
    else pass(`${label} overflow-x = ${value}`);
  }

  // --- 2. slot geometry ---------------------------------------------------
  lines.push(' [2] slot geometry');
  for (const slot of slots) {
    if (slot.align !== 'start') fail(`${slot.id}: scroll-snap-align = ${slot.align}`);
    if (slot.slotH < env.vh) fail(`${slot.id}: slot ${slot.slotH}px < viewport ${env.vh}px`);
    const over = slot.sectionH - env.vh;
    lines.push(
      `        ${slot.id.padEnd(10)} slot ${String(slot.slotH).padStart(5)}px  ` +
        `section ${String(slot.sectionH).padStart(5)}px  ` +
        (over > 0 ? `EXCEEDS viewport by ${over}px` : `fits`) +
        `  align=${slot.align} stop=${slot.stop}`,
    );
  }

  // --- 3. one gesture, one section ---------------------------------------
  lines.push(' [3] gesture -> section');
  await evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
  await wait(700);

  const rest0 = await evaluate(AT_REST);
  if (rest0.visible.length === 1) pass(`at rest on #${rest0.visible[0].id}: only 1 slot visible`);
  else
    fail(
      `at rest ${rest0.visible.length} slots visible: ` +
        rest0.visible.map((s) => `${s.id}=${s.px}px`).join(', '),
    );

  await flick(600, width);
  const rest1 = await evaluate(AT_REST);
  const expected1 = slots[1]?.top ?? -1;
  if (Math.abs(rest1.y - expected1) <= 2)
    pass(`one flick landed on #${slots[1].id} (y=${rest1.y}, snap point ${expected1})`);
  else
    fail(
      `one flick landed at y=${rest1.y}, expected ${expected1} (#${slots[1]?.id}); ` +
        `visible: ${rest1.visible.map((s) => `${s.id}=${s.px}px`).join(', ')}`,
    );
  if (rest1.visible.length === 1) pass('after flick only 1 slot visible');
  else
    fail(
      `after flick ${rest1.visible.length} slots visible: ` +
        rest1.visible.map((s) => `${s.id}=${s.px}px`).join(', '),
    );

  // Exaggerated flick must still be stopped by scroll-snap-stop: always.
  await evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
  await wait(700);
  await flick(2600, width);
  const rest2 = await evaluate(AT_REST);
  if (rest2.y <= expected1 + 2)
    pass(`hard flick stopped at y=${rest2.y} (did not skip past #${slots[1].id})`);
  else fail(`hard flick overshot to y=${rest2.y}, past snap point ${expected1}`);

  // A discrete wheel notch is the interaction the brief actually describes, and
  // it is the opposite risk: proximity snapping may drag it back to the start.
  lines.push(' [3b] discrete mouse-wheel notches');
  for (const notches of [1, 3]) {
    await evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
    await wait(700);
    for (let n = 0; n < notches; n += 1) {
      await send(
        'Input.dispatchMouseEvent',
        {
          type: 'mouseWheel',
          x: Math.round(width / 2),
          y: Math.round(VIEWPORT_HEIGHT / 2),
          deltaX: 0,
          deltaY: 120,
        },
        sessionId,
      );
      await wait(90);
    }
    await wait(1500);
    const notch = await evaluate(AT_REST);
    const landed =
      notch.y === 0
        ? 'stayed on #home (snapped back — feels stuck)'
        : Math.abs(notch.y - expected1) <= 2
          ? `landed exactly on #${slots[1].id}`
          : `rested mid-section at y=${notch.y}`;
    lines.push(
      `        ${notches} notch(es) x120px -> y=${notch.y}: ${landed}` +
        `  [visible: ${notch.visible.map((s) => `${s.id}=${s.px}px`).join(', ')}]`,
    );
  }

  // --- 4. fixed navbar ----------------------------------------------------
  lines.push(' [4] fixed navbar');
  if (rest1.navTop !== null && Math.abs(rest1.navTop - 20) <= 1)
    pass(`navbar pinned at top=${rest1.navTop}px while scrolled`);
  else fail(`navbar top=${rest1.navTop}px while scrolled (expected 20)`);
  if (rest1.navHit) pass('navbar is the hit target at its own coordinates');
  else fail('navbar is covered — clicks would not reach it');

  // --- 5. overflow + scroll hint -----------------------------------------
  lines.push(' [5] overflow & scroll hint');
  if (env.scrollW <= env.vw) pass(`no horizontal overflow (scrollWidth ${env.scrollW})`);
  else fail(`horizontal overflow: scrollWidth ${env.scrollW} > ${env.vw}`);

  if (rest0.scrollHintVisible) pass('"Scroll" hint visible on the first section');
  else fail('"Scroll" hint missing on the first section');

  await evaluate(
    `document.getElementById('contact').scrollIntoView({ behavior: 'instant', block: 'start' })`,
  );
  await wait(900);
  const last = await evaluate(AT_REST);
  if (!last.scrollHintVisible) pass('"Scroll" hint hidden on the last section');
  else fail('"Scroll" hint still visible on the last section');

  // --- 6. every pixel of the oversized sections stays reachable ------------
  // The whole reason for `proximity` over `mandatory`: wheel stepping must never
  // strand the content that lives past the first viewport of a tall section.
  lines.push(' [6] reachability by wheel alone');
  await evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
  await wait(700);

  const notch = () =>
    send(
      'Input.dispatchMouseEvent',
      {
        type: 'mouseWheel',
        x: Math.round(width / 2),
        y: Math.round(VIEWPORT_HEIGHT / 2),
        deltaX: 0,
        deltaY: 260,
      },
      sessionId,
    );

  const maxScroll = await evaluate(
    `Math.round(document.documentElement.scrollHeight - window.innerHeight)`,
  );
  let previous = -1;
  let stalls = 0;
  let steps = 0;

  while (steps < 90) {
    await notch();
    await wait(330);
    const y = await evaluate('Math.round(window.scrollY)');
    if (y >= maxScroll - 2) break;
    if (y === previous) {
      stalls += 1;
      if (stalls >= 8) break;
    } else {
      stalls = 0;
    }
    previous = y;
    steps += 1;
  }

  const reach = await evaluate(`(() => {
    const foot = [...document.querySelectorAll('div')].find((d) =>
      d.textContent.trim().startsWith('\\u00a9') && d.children.length === 0,
    );
    const r = foot?.getBoundingClientRect();
    return {
      y: Math.round(window.scrollY),
      max: Math.round(document.documentElement.scrollHeight - window.innerHeight),
      footerVisible: r ? r.top < window.innerHeight && r.bottom > 0 : null,
    };
  })()`);

  if (reach.y >= reach.max - 2)
    pass(`wheel reached the document bottom (y=${reach.y} of ${reach.max})`);
  else fail(`wheel stalled at y=${reach.y}, document bottom is ${reach.max}`);
  if (reach.footerVisible) pass('Contact footer reachable (copyright line on screen)');
  else fail(`Contact footer not reachable (visible=${reach.footerVisible})`);

  // --- 7. nested scroller keeps its own gestures --------------------------
  lines.push(' [7] nested scroller (comment list)');
  const listBox = await evaluate(`(() => {
    const el = document.querySelector('.custom-scroll');
    if (!el) return null;
    el.scrollTop = 0;
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.left + r.width / 2),
      y: Math.round(r.top + r.height / 2),
      scrollable: el.scrollHeight - el.clientHeight,
      onScreen: r.top >= 0 && r.bottom <= window.innerHeight,
    };
  })()`);

  if (!listBox) {
    fail('.custom-scroll not found');
  } else if (!listBox.onScreen || listBox.scrollable <= 1) {
    lines.push(
      `        skipped: list ${listBox.onScreen ? 'not scrollable' : 'off screen'} ` +
        `(scrollable=${listBox.scrollable}, onScreen=${listBox.onScreen})`,
    );
  } else {
    const before = await evaluate('Math.round(window.scrollY)');
    await send(
      'Input.dispatchMouseEvent',
      { type: 'mouseWheel', x: listBox.x, y: listBox.y, deltaX: 0, deltaY: 120 },
      sessionId,
    );
    await wait(600);
    const after = await evaluate(`(() => ({
      page: Math.round(window.scrollY),
      list: Math.round(document.querySelector('.custom-scroll').scrollTop),
    }))()`);

    if (after.list > 0) pass(`comment list scrolled itself (scrollTop=${after.list})`);
    else fail('comment list did not scroll — wheel was hijacked');
    if (after.page === before) pass('page did not jump while scrolling the list');
    else fail(`page jumped from ${before} to ${after.page} while scrolling the list`);
  }
}

lines.push(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}`);
console.log(lines.join('\n'));

socket.close();
chrome.kill();
process.exit(failures === 0 ? 0 : 1);
