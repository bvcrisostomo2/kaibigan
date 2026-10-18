// Tiny synthetic images and packs for the tool tests (CI has no .packs/).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { encode } from '../../tools/kitbash.mjs';

export const RED = [200, 40, 40];
export const BLUE = [40, 60, 200];
export const YELLOW = [230, 200, 40];
export const MAGENTA = [220, 40, 200];

function put(img, x, y, [r, g, b]) {
  img.px.set([r, g, b, 255], (y * img.w + x) * 4);
}

// An 8×12 figure on a transparent ground: head rows 1–4 (red), body rows 5–11 (blue), columns 2–5,
// a yellow foot at (2, 11) so mirroring shows. extra: [[x, y, rgb], ...] painted on top.
export function figure(extra = []) {
  const img = { w: 8, h: 12, px: Buffer.alloc(8 * 12 * 4) };
  for (let y = 1; y <= 11; y++) for (let x = 2; x <= 5; x++) put(img, x, y, y <= 4 ? RED : BLUE);
  put(img, 2, 11, YELLOW);
  for (const [x, y, c] of extra) put(img, x, y, c);
  return img;
}

// A 50×70 frame with a blue body block at columns 20–29, rows 40–69 (feet on row 69).
export function blankFrame(w = 50, h = 70) {
  const img = { w, h, px: Buffer.alloc(w * h * 4) };
  for (let y = 40; y < 70; y++) for (let x = 20; x < 30; x++) put(img, x, y, BLUE);
  return img;
}

export const tmpDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'kb-'));

// A pack laid out like the Star Leap zips: root/<name>/<name>/Overworld/<folder>/NN.png.
export function writePack(root, name, folders) {
  const ow = path.join(root, name, name, 'Overworld');
  for (const [folder, frames] of Object.entries(folders)) {
    frames.forEach((img, k) => encode(img, path.join(ow, folder, `${String(k + 1).padStart(2, '0')}.png`)));
  }
  return ow;
}

export const pixel = (img, x, y) => [...img.px.subarray((y * img.w + x) * 4, (y * img.w + x) * 4 + 4)];
