// The review sheet (spec §7.2): one row per set at 3×: the body pack's idle front, then the set's
// idle front, right and back, walk front frame 2, and every activity frame, on a checkerboard.
//
// Usage: node tools/contact.mjs <out.png> <id ...>   e.g. node tools/contact.mjs review.png sweeper
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { decode, encode } from './kitbash.mjs';
import { overworldDir, PACKS } from './unpack.mjs';
import { CAST } from './cast.mjs';
import { SPRITES } from './build-sets.mjs';

const SCALE = 3;
const GAP = 4;

function firstFrame(dir, folders) {
  for (const folder of folders) {
    const file = path.join(dir, folder, '01.png');
    if (fs.existsSync(file)) return decode(file);
  }
  return null;
}

function setRow(entry) {
  const row = [];
  const source = firstFrame(overworldDir(PACKS, entry.body), ['idle_front', 'walk_front']);
  if (source) row.push(source);
  const dir = path.join(SPRITES, entry.set);
  if (!fs.existsSync(dir)) throw new Error(`${entry.id}: not built yet (${dir})`);
  for (const f of ['idle_front/01.png', 'idle_right/01.png', 'idle_back/01.png', 'walk_front/02.png']) if (fs.existsSync(path.join(dir, f))) row.push(decode(path.join(dir, f)));
  for (const act of fs.readdirSync(dir).filter((d) => d.startsWith('act_')).sort()) {
    for (const f of fs.readdirSync(path.join(dir, act)).sort()) row.push(decode(path.join(dir, act, f)));
  }
  return row;
}

export function sheet(rows) {
  const all = rows.flat();
  const cw = Math.max(...all.map((i) => i.w)) + GAP, ch = Math.max(...all.map((i) => i.h)) + GAP;
  const cols = Math.max(...rows.map((r) => r.length));
  const W = cols * cw * SCALE, H = rows.length * ch * SCALE;
  const px = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = (Math.floor(x / (cw * SCALE)) + Math.floor(y / (ch * SCALE))) % 2 ? 150 : 180;
      px.set([c, c + 10, c + 20, 255], (y * W + x) * 4);
    }
  }
  rows.forEach((row, r) => row.forEach((img, c) => {
    const ox = c * cw + Math.floor((cw - img.w) / 2), oy = r * ch + ch - GAP / 2 - img.h; // feet on one line
    for (let y = 0; y < img.h; y++) {
      for (let x = 0; x < img.w; x++) {
        const j = (y * img.w + x) * 4;
        if (!img.px[j + 3]) continue;
        for (let sy = 0; sy < SCALE; sy++) for (let sx = 0; sx < SCALE; sx++) px.set([img.px[j], img.px[j + 1], img.px[j + 2], 255], (((oy + y) * SCALE + sy) * W + (ox + x) * SCALE + sx) * 4);
      }
    }
  }));
  return { w: W, h: H, px };
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [out, ...ids] = process.argv.slice(2);
  if (!out || !ids.length) {
    console.error('usage: node tools/contact.mjs <out.png> <id ...>');
    process.exit(2);
  }
  const entries = ids.map((id) => CAST.find((e) => e.id === id) ?? (() => { throw new Error(`${id}: not in tools/cast.mjs`); })());
  encode(sheet(entries.map(setRow)), out);
  console.log('wrote', out);
}
