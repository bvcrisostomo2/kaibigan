// Dialogue portraits (Plan 5 spec §4.5). A costume's portrait comes from, best first:
//   1. a registered local image (local-assets/portraits, dev only; see localPortraits.js).
//      An image for the exact feeling wins, then the costume's neutral image.
//   2. its code-drawn bust in that feeling (busts.js)
import { drawBust, BUST_SIZE } from './busts.js';

export const PORTRAIT_SIZE = BUST_SIZE;

const images = new Map(); // 'costumeId_expression' → url

export function registerPortrait(costumeId, expression, url) {
  images.set(`${costumeId}_${expression}`, url);
}

export function clearPortraits() {
  images.clear();
}

const generated = new Map(); // 'costumeId_expression' → pixels, drawn once (callers must not modify)

// A costume's generated portrait. Throws for an unknown costume.
export function portraitPixels(costumeId, expression = 'neutral') {
  const key = `${costumeId}_${expression}`;
  if (!generated.has(key)) generated.set(key, drawBust(costumeId, expression));
  return generated.get(key);
}

// What to show: { kind: 'image', url } or { kind: 'pixels', pixels }.
export function portraitSource(costumeId, expression = 'neutral') {
  const url = images.get(`${costumeId}_${expression}`) ?? images.get(`${costumeId}_neutral`);
  if (url) return { kind: 'image', url };
  return { kind: 'pixels', pixels: portraitPixels(costumeId, expression) };
}
