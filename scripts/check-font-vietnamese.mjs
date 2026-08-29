/**
 * Checks whether the webfonts the site loads actually ship Vietnamese glyphs.
 *
 * Vietnamese precomposed letters such as ễ U+1EC5, ỗ U+1ED7 and ả U+1EA3 live in
 * Latin Extended Additional (U+1E00–U+1EFF). Google Fonts exposes them in the
 * `vietnamese` subset; `latin-ext` stops short. If no served @font-face covers
 * those code points, the browser silently substitutes another family for just
 * those characters, so an accented name renders in a mismatched font.
 *
 * Run: node scripts/check-font-vietnamese.mjs
 */
const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap';

/** A browser UA is required or Google returns the legacy, range-less payload. */
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const PROBE = [
  ['ễ', 0x1ec5],
  ['ỗ', 0x1ed7],
  ['ả', 0x1ea3],
  ['Đ', 0x0110],
  ['ỹ', 0x1ef9],
];

const css = await (await fetch(CSS_URL, { headers: { 'User-Agent': UA } })).text();

/** Splits the payload into `{ family, unicodeRange }` blocks. */
const blocks = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);

const parsed = blocks.map((block) => ({
  family: (block.match(/font-family:\s*'([^']+)'/) ?? [, '?'])[1],
  ranges: (block.match(/unicode-range:\s*([^;]+);/) ?? [, ''])[1]
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((token) => {
      const [from, to] = token.replace(/U\+/i, '').split('-');
      return [parseInt(from, 16), parseInt(to ?? from, 16)];
    }),
}));

const families = [...new Set(parsed.map((p) => p.family))];
console.log(`@font-face blocks: ${parsed.length} across ${families.join(', ')}\n`);

let missing = 0;

for (const family of families) {
  const blocksFor = parsed.filter((p) => p.family === family);
  console.log(`${family}`);
  for (const [glyph, code] of PROBE) {
    const covered = blocksFor.some((b) =>
      b.ranges.some(([lo, hi]) => code >= lo && code <= hi),
    );
    if (!covered) missing += 1;
    console.log(
      `   ${glyph}  U+${code.toString(16).toUpperCase().padStart(4, '0')}  ` +
        (covered ? 'covered' : 'NOT SERVED — browser will fall back'),
    );
  }
  console.log('');
}

console.log(
  missing === 0
    ? 'All probed Vietnamese glyphs are served.'
    : `${missing} glyph/family combination(s) not served.`,
);
