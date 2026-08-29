/**
 * Rebuilds the lanyard card's baseColor atlas with the owner's own portrait.
 *
 * `public/assets/kartu.glb` ships a single 512x512 baseColor atlas that packs
 * three regions: the card front photo, the card back pattern, and the name
 * label. Only the photo region is replaced here — everything else is copied
 * from the original atlas so the card keeps its exact look and UV mapping.
 *
 * Run: node scripts/build-lanyard-texture.mjs
 */
import { Buffer } from 'node:buffer';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const GLB = path.join(ROOT, 'public/assets/kartu.glb');
const PORTRAIT = path.join(ROOT, 'public/assets/PP.png');
const OUT = path.join(ROOT, 'public/assets/kartu-texture.png');

/** Photo slot inside the atlas, measured from the original texture's edges. */
const SLOT = { left: 17, top: 23, width: 218, height: 344, radius: 7 };

/**
 * Name printed on the card's reverse face. Kept diacritic-free to match the
 * name shown in the DOM, where the webfonts lack the Vietnamese glyphs.
 */
const NAME = 'NGUYEN DO KHAI';

/**
 * The label band on the back face. The baked-in name occupies x 330–438,
 * y 323–345; this band is wider so a longer name still centres on the panel
 * (which spans x 269–497).
 *
 * `bgTop` is an equally tall, unprinted band lower down the same columns. The
 * backdrop is a purely horizontal gradient — measured constant down every
 * column — so copying that block up repaints the label area seamlessly. It is
 * copied at full size on purpose: resizing a 1px-tall row up to the band height
 * makes libvips collapse the horizontal gradient to its mean (~233), which
 * leaves a visible flat rectangle.
 */
const LABEL = { left: 283, top: 316, width: 200, height: 36, baseline: 29, bgTop: 353 };

/** Pulls the embedded baseColor PNG out of the .glb binary chunk. */
function extractAtlas(glbPath) {
  const glb = readFileSync(glbPath);
  if (glb.toString('ascii', 0, 4) !== 'glTF') {
    throw new Error(`${glbPath} is not a binary glTF file`);
  }

  let offset = 12;
  let json;
  let binStart;

  while (offset < glb.length) {
    const length = glb.readUInt32LE(offset);
    const type = glb.toString('ascii', offset + 4, offset + 8);
    if (type === 'JSON') json = JSON.parse(glb.toString('utf8', offset + 8, offset + 8 + length));
    else if (type === 'BIN\0') binStart = offset + 8;
    offset += 8 + length;
  }

  if (!json || binStart === undefined) throw new Error('Missing JSON or BIN chunk');

  const image = json.images?.[0];
  if (!image || image.bufferView === undefined) {
    throw new Error('glTF has no embedded image to replace');
  }

  const view = json.bufferViews[image.bufferView];
  const start = binStart + (view.byteOffset ?? 0);
  return glb.subarray(start, start + view.byteLength);
}

/** Rounded-rectangle alpha mask so the pasted photo keeps the original corners. */
function roundedMask({ width, height, radius }) {
  return Buffer.from(
    `<svg width="${width}" height="${height}">` +
      `<rect width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#fff"/>` +
      `</svg>`,
  );
}

const atlas = extractAtlas(GLB);

// `cover` keeps the portrait's aspect ratio; the slot is much taller than
// PP.png, so this trims the sides evenly and keeps the face centred.
const photo = await sharp(PORTRAIT)
  .resize(SLOT.width, SLOT.height, { fit: 'cover', position: 'center' })
  .composite([
    {
      input: roundedMask(SLOT),
      blend: 'dest-in',
    },
  ])
  .png()
  .toBuffer();

// Repaint the label band from a clean row of the same gradient, erasing the
// name that ships baked into the model.
const labelBackground = await sharp(atlas)
  .extract({
    left: LABEL.left,
    top: LABEL.bgTop,
    width: LABEL.width,
    height: LABEL.height,
  })
  .png()
  .toBuffer();

const nameLabel = Buffer.from(
  `<svg width="${LABEL.width}" height="${LABEL.height}" xmlns="http://www.w3.org/2000/svg">` +
    `<text x="${LABEL.width / 2}" y="${LABEL.baseline}" text-anchor="middle" ` +
    `font-family="Segoe UI, DejaVu Sans, Arial, sans-serif" font-size="21" ` +
    `font-weight="700" letter-spacing="0.6" fill="#1f1f1f">${NAME}</text>` +
    `</svg>`,
);

const composed = await sharp(atlas)
  .composite([
    { input: photo, left: SLOT.left, top: SLOT.top },
    { input: labelBackground, left: LABEL.left, top: LABEL.top },
    { input: nameLabel, left: LABEL.left, top: LABEL.top },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();

writeFileSync(OUT, composed);

const { width, height, size } = await sharp(composed).metadata();
console.log(`wrote ${path.relative(ROOT, OUT)} — ${width}x${height}, ${size} bytes`);
