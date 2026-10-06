// Dialogue portraits (spec §4.1). A costume's portrait comes from, best first:
//   1. a registered local image (git-ignored local-assets/portraits, dev only; see localPortraits.js).
//      An image for the exact expression wins, then the costume's neutral image.
//   2. a hand-authored character: a head crop of its own front sprite, so it matches the sprite
//      (the same crop for every expression until the maps gain expression frames)
//   3. the procedural portrait (characters.js drawPortrait)
import { PixelCanvas } from './pixel.js';
import { drawPortrait } from './characters.js';
import { COSTUMES } from './costumes.js';
import { handmadeFrames } from './handmade.js';
import { HANDMADE } from './cast/index.js';

export const PORTRAIT_SIZE = 64;
const CROP = 21; // source pixels per side, scaled ×3 (as drawPortrait does)

const images = new Map(); // 'costumeId_expression' → url

export function registerPortrait(costumeId, expression, url) {
  images.set(`${costumeId}_${expression}`, url);
}

export function clearPortraits() {
  images.clear();
}

// A 21×21 window around a frame's head (from its top opaque row, centred on the head's
// columns), scaled ×3 into a 64×64 canvas. An empty frame gives an empty portrait.
export function headCrop(frame) {
  const out = new PixelCanvas(PORTRAIT_SIZE, PORTRAIT_SIZE);
  let top = -1;
  for (let y = 0; y < frame.height && top < 0; y++) {
    for (let x = 0; x < frame.width; x++) {
      if (frame.opaque(x, y)) {
        top = y;
        break;
      }
    }
  }
  if (top < 0) return out;
  let minX = frame.width;
  let maxX = -1;
  for (let y = top; y < Math.min(frame.height, top + 12); y++) {
    for (let x = 0; x < frame.width; x++) {
      if (frame.opaque(x, y)) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    }
  }
  const left = Math.max(0, Math.min(frame.width - CROP, Math.round((minX + maxX) / 2) - 10));
  const y0 = Math.max(0, top - 2);
  for (let y = 0; y < CROP; y++) {
    for (let x = 0; x < CROP; x++) {
      const c = frame.get(left + x, y0 + y);
      if (c != null) out.fillRect(x * 3, y * 3, 3, 3, c);
    }
  }
  return out;
}

function drawGenerated(costumeId, expression) {
  if (HANDMADE[costumeId]) return headCrop(handmadeFrames(HANDMADE[costumeId]).idle_down[0]);
  const costume = COSTUMES[costumeId];
  if (!costume) throw new Error(`Unknown costume '${costumeId}'`);
  return drawPortrait(costume, expression);
}

const generated = new Map(); // 'costumeId_expression' → pixels, drawn once (callers must not modify)

// A costume's generated portrait. Throws for an unknown costume.
export function portraitPixels(costumeId, expression = 'neutral') {
  const key = `${costumeId}_${expression}`;
  if (!generated.has(key)) generated.set(key, drawGenerated(costumeId, expression));
  return generated.get(key);
}

// What to show: { kind: 'image', url } or { kind: 'pixels', pixels }.
export function portraitSource(costumeId, expression = 'neutral') {
  const url = images.get(`${costumeId}_${expression}`) ?? images.get(`${costumeId}_neutral`);
  if (url) return { kind: 'image', url };
  return { kind: 'pixels', pixels: portraitPixels(costumeId, expression) };
}
