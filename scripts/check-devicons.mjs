/**
 * Verifies each devicon URL used by the tech-stack seed resolves, and flags logos
 * that are too dark to read on the site's near-black tiles.
 *
 * `CardTechStack` renders the SVG as-is with no colour filter, so a black
 * wordmark such as Next.js or Vercel would otherwise be invisible.
 *
 * Run: node scripts/check-devicons.mjs
 */
const BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';

/** Tile background is `bg-white/[0.04]` over `#0d0d0d` — effectively #151515. */
const TILE_LUMA = 21;
const DARK_THRESHOLD = 70;

const paths = [
  'html5/html5-original.svg',
  'css3/css3-original.svg',
  'javascript/javascript-original.svg',
  'typescript/typescript-original.svg',
  'react/react-original.svg',
  'nextjs/nextjs-original.svg',
  'tailwindcss/tailwindcss-original.svg',
  'framermotion/framermotion-original.svg',
  'nestjs/nestjs-original.svg',
  'nodejs/nodejs-original.svg',
  'postgresql/postgresql-original.svg',
  'prisma/prisma-original.svg',
  'supabase/supabase-original.svg',
  'socketio/socketio-original.svg',
  'kotlin/kotlin-original.svg',
  'android/android-original.svg',
  'jetpackcompose/jetpackcompose-original.svg',
  'sqlite/sqlite-original.svg',
  'zustand/zustand-original.svg',
  'vitejs/vitejs-original.svg',
  'git/git-original.svg',
  'figma/figma-original.svg',
  'vscode/vscode-original.svg',
  'vercel/vercel-original.svg',
  // Control: must not resolve, otherwise the whole check is meaningless.
  'definitely-not-real/definitely-not-real-original.svg',
];

const luma = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

const rows = [];
let failures = 0;

for (const path of paths) {
  const isControl = path.startsWith('definitely-not-real');
  let status = 'ERR';
  let body = '';

  try {
    const response = await fetch(`${BASE}/${path}`);
    status = String(response.status);
    if (response.ok) body = await response.text();
  } catch {
    status = 'ERR';
  }

  if (isControl) {
    const ok = status !== '200';
    if (!ok) failures += 1;
    rows.push(`${ok ? 'ok  ' : 'FAIL'}  control returned ${status} (must not be 200)`);
    continue;
  }

  if (status !== '200' || !body.includes('<svg')) {
    failures += 1;
    rows.push(`FAIL  ${status.padEnd(4)} ${path}`);
    continue;
  }

  const colours = [
    ...new Set(
      [...body.matchAll(/(?:fill|stop-color|stroke)="(#[0-9a-fA-F]{6})"/g)].map((m) => m[1]),
    ),
  ];
  const visible = colours.filter((c) => luma(c) >= DARK_THRESHOLD);
  const dark = colours.filter((c) => luma(c) < DARK_THRESHOLD);
  // Only a problem when *every* colour in the logo is dark; a mostly-colourful
  // logo with one dark detail still reads fine.
  const needsInvert = colours.length > 0 && visible.length === 0;

  rows.push(
    `ok    200  ${path.padEnd(46)}` +
      (needsInvert
        ? `NEEDS INVERT (all ${dark.length} colours below luma ${DARK_THRESHOLD}: ${dark.join(',')})`
        : `readable (${visible.length}/${colours.length} colours above tile luma ~${TILE_LUMA})`),
  );
}

console.log(rows.join('\n'));
console.log(failures === 0 ? '\nALL ICON URLS VALID' : `\n${failures} PROBLEM(S)`);
process.exit(failures === 0 ? 0 : 1);
