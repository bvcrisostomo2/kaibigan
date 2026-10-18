// LOCAL-ONLY prototyping tool: builds seated frames (sit_front, sit_back, sit_right) for a kitbash
// sprite set from its first idle frame per view, and writes them beside the set's other frames in
// the local-assets/ folder.
//
// Usage: node tools/sit.mjs <setDir> [outSetDir]
//   e.g. node tools/sit.mjs local-assets/sprites/damaso_kb
//
// How a frame is seated: the hips are found at a fixed fraction of the figure's height; the top of
// the thighs is cut out, so the body sinks onto the seat with the feet still on the floor. In the
// side view the legs below the seat then slant forward to the knee.
import fs from 'node:fs';
import path from 'node:path';
import { decode, encode } from './kitbash.mjs';

export const HIP = 0.6; // hips at this fraction of the figure's height, from the top
export const DROP = 0.16; // how far the body sinks, as a fraction of the figure's height
export const THIGH = 0.12; // side view: how far the knees come forward, as a fraction of the height
export const RAMP = 0.1; // side view: rows over which the legs slant forward, as a fraction of the height

const same = (px, i, c) => px[i] === c[0] && px[i + 1] === c[1] && px[i + 2] === c[2];

// { top, bottom, left, right } of the pixels that are not the background colour.
export function figureBox(img, bg) {
  let top = img.h, bottom = -1, left = img.w, right = -1;
  for (let y = 0; y < img.h; y++) {
    for (let x = 0; x < img.w; x++) {
      if (same(img.px, (y * img.w + x) * 4, bg)) continue;
      top = Math.min(top, y); bottom = Math.max(bottom, y);
      left = Math.min(left, x); right = Math.max(right, x);
    }
  }
  return { top, bottom, left, right };
}

function blank(img, bg) {
  const px = Buffer.alloc(img.w * img.h * 4);
  for (let i = 0; i < px.length; i += 4) px.set([bg[0], bg[1], bg[2], 255], i);
  return { w: img.w, h: img.h, px };
}

function copyRow(src, dst, sy, dy, dx = 0, bg = null) {
  for (let x = 0; x < src.w; x++) {
    const tx = x + dx;
    if (tx < 0 || tx >= dst.w) continue;
    const i = (sy * src.w + x) * 4;
    if (bg && same(src.px, i, bg)) continue;
    dst.px.set(src.px.subarray(i, i + 4), (dy * dst.w + tx) * 4);
  }
}


// A seated version of one idle frame. view = 'front' | 'back' | 'right' (facing right).
export function seat(img, view) {
  const bg = [img.px[0], img.px[1], img.px[2]];
  const box = figureBox(img, bg);
  const height = box.bottom - box.top + 1;
  const hip = box.top + Math.round(height * HIP);
  const drop = Math.round(height * DROP);
  const out = blank(img, bg);
  // Upper body sinks by `drop`; the legs below the cut stay where they were.
  for (let y = 0; y < hip; y++) if (y + drop < img.h) copyRow(img, out, y, y + drop);
  if (view !== 'right') {
    for (let y = hip + drop; y < img.h; y++) copyRow(img, out, y, y, 0, bg);
    return out;
  }
  // Side view: the legs bend forward from the seat, slanting over RAMP of the height to the
  // knee and then dropping straight, so thighs and lap use the set's own pixels.
  const forward = Math.round(height * THIGH);
  const ramp = Math.max(1, Math.round(height * RAMP));
  const seatY = hip + drop;
  for (let y = seatY; y < img.h; y++) copyRow(img, out, y, y, Math.min(forward, Math.round(((y - seatY + 1) * forward) / ramp)), bg);
  return out;
}

export function seatSet(setDir, outDir = setDir) {
  const written = [];
  for (const view of ['front', 'back', 'right']) {
    const dir = path.join(setDir, `idle_${view}`);
    if (!fs.existsSync(dir)) continue;
    const first = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort()[0];
    if (!first) continue;
    const file = path.join(outDir, `sit_${view}`, '01.png');
    encode(seat(decode(path.join(dir, first)), view), file);
    written.push(file);
  }
  return written;
}

if (import.meta.url === `file:///${path.resolve(process.argv[1]).replace(/\\/g, '/')}`) {
  const [setDir, outDir] = process.argv.slice(2);
  if (!setDir) {
    console.error('usage: node tools/sit.mjs <setDir> [outSetDir]');
    process.exit(2);
  }
  for (const f of seatSet(setDir, outDir)) console.log('wrote', f);
}
