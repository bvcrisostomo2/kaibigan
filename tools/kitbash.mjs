// LOCAL-ONLY prototyping tool: assembles a stand-in character sheet from third-party reference
// sprites (a body from one set, a head from another, recoloured) and writes the frames into the
// local-assets/ folder.
//
// Usually run through tools/build-sets.mjs, which builds every set in tools/cast.mjs.
// Usage: node tools/kitbash.mjs <bodyOverworldDir> <headOverworldDir> <outSetName>
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// ---------- PNG I/O (8-bit RGB/RGBA/palette, non-interlaced) ----------
export function decode(file) {
  const b = fs.readFileSync(file);
  let p = 8, w, h, ct, pal, trns;
  const idat = [];
  while (p < b.length) {
    const len = b.readUInt32BE(p);
    const type = b.toString('ascii', p + 4, p + 8);
    const d = b.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; }
    if (type === 'PLTE') pal = d;
    if (type === 'tRNS') trns = d;
    if (type === 'IDAT') idat.push(d);
    p += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = { 6: 4, 2: 3, 3: 1, 4: 2, 0: 1 }[ct];
  const stride = w * bpp;
  const px = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)];
    const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0, up = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let v = line[i];
      if (ft === 1) v += a; else if (ft === 2) v += up; else if (ft === 3) v += (a + up) >> 1;
      else if (ft === 4) { const pp = a + up - c, pa = Math.abs(pp - a), pb = Math.abs(pp - up), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
      line[i] = v & 255;
    }
    for (let x = 0; x < w; x++) {
      let r, g, bl, al;
      if (ct === 6) [r, g, bl, al] = line.subarray(x * 4, x * 4 + 4);
      else if (ct === 2) { [r, g, bl] = line.subarray(x * 3, x * 3 + 3); al = 255; }
      else { const i = line[x]; r = pal[i * 3]; g = pal[i * 3 + 1]; bl = pal[i * 3 + 2]; al = trns && i < trns.length ? trns[i] : 255; }
      px.set([r, g, bl, al], (y * w + x) * 4);
    }
    prev = line;
  }
  // Key out the solid background (top-left colour).
  const [kr, kg, kb] = px;
  for (let i = 0; i < px.length; i += 4) if (px[i] === kr && px[i + 1] === kg && px[i + 2] === kb) px[i + 3] = 0;
  return { w, h, px };
}

function crc32(buf) {
  let c, t = [];
  for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  let x = 0xffffffff;
  for (const b of buf) x = t[(x ^ b) & 255] ^ (x >>> 8);
  return (x ^ 0xffffffff) >>> 0;
}
export function encode(img, file) {
  const { w, h, px } = img;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      // Write the key green behind transparent pixels so the game's loader keys it out.
      const rgba = px[i + 3] ? [px[i], px[i + 1], px[i + 2], 255] : [123, 154, 41, 255];
      raw.set(rgba, y * (w * 4 + 1) + 1 + x * 4);
    }
  }
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td)); return Buffer.concat([l, td, c]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}

// ---------- helpers ----------
const hex = (r, g, b) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export function bbox(img) {
  let top = img.h, bottom = 0, left = img.w, right = 0;
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) if (img.px[(y * img.w + x) * 4 + 3]) { top = Math.min(top, y); bottom = Math.max(bottom, y); left = Math.min(left, x); right = Math.max(right, x); }
  return { top, bottom, left, right, cx: (left + right) / 2 };
}

function recolor(img, map) {
  const out = { ...img, px: Buffer.from(img.px) };
  for (let i = 0; i < out.px.length; i += 4) {
    if (!out.px[i + 3]) continue;
    const to = map[hex(out.px[i], out.px[i + 1], out.px[i + 2])];
    if (to) out.px.set(rgb(to), i);
  }
  return out;
}

function mirrored(img) {
  const out = { ...img, px: Buffer.alloc(img.px.length) };
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) img.px.copy(out.px, (y * img.w + (img.w - 1 - x)) * 4, (y * img.w + x) * 4, (y * img.w + x) * 4 + 4);
  return out;
}

// Per view: body starts at `bodyFrom` (collar row) in body frame 1; head ends at `headTo` (chin
// row) in head frame 1. Defaults measured for Kamandol's body under the male student's head; a
// dress file can override them (bodyFrom = headTo + 1, dx = 0 keeps a set's own head).
export const VIEWS = {
  front: { bodyFrom: 17, headTo: 23, dx: -1 },
  right: { bodyFrom: 17, headTo: 24, dx: 0 },
  back: { bodyFrom: 16, headTo: 22, dx: -1 },
};

export function compose(body, head, v, bodyRef, headRef) {
  const W = 50, H = 70;
  const out = { w: W, h: H, px: Buffer.alloc(W * H * 4) };
  const bodyY = H - body.h; // bottom-align the body (feet on the baseline)
  // Follow each frame's bob relative to frame 1.
  const bShift = bbox(body).top - bodyRef.top;
  const hShift = bbox(head).top - headRef.top;
  const cut = v.bodyFrom + bShift;
  for (let y = cut; y < body.h; y++) for (let x = 0; x < body.w; x++) {
    const i = (y * body.w + x) * 4;
    if (body.px[i + 3]) out.px.set(body.px.subarray(i, i + 4), ((y + bodyY) * W + x) * 4);
  }
  // Chin row of the head sits on the body's first row (overlapping the collar by one row).
  const chin = v.headTo + hShift;
  const dy = cut - 1 - chin + bodyY;
  for (let y = 0; y <= chin; y++) for (let x = 0; x < head.w; x++) {
    const i = (y * head.w + x) * 4;
    const ty = y + dy, tx = x + v.dx;
    if (head.px[i + 3] && ty >= 0 && ty < H && tx >= 0 && tx < W) out.px.set(head.px.subarray(i, i + 4), (ty * W + tx) * 4);
  }
  return out;
}

// Paint a dress layer (hair, clothing) over a composed frame. Layer maps are in walk-frame-1
// output coordinates, shifted by the frame's offset from it. '.' keeps the pixel, '-' erases it.
// A layer may carry its own palette (a part from tools/parts/); otherwise the dress palette is used.
export function dress(img, layers, palette, bob, mirror = false, dx = 0) {
  for (const { at: [x0, y0], rows, palette: own } of layers) {
    const colours = own ?? palette ?? {};
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch === '.') continue;
        const x = (mirror ? img.w - 1 - (x0 + i) : x0 + i) + dx, y = y0 + j + bob;
        if (x < 0 || x >= img.w || y < 0 || y >= img.h) continue;
        const p = (y * img.w + x) * 4;
        if (ch === '-') img.px[p + 3] = 0;
        else {
          if (!colours[ch]) throw new Error(`No colour for '${ch}' in the palette`);
          img.px.set([...rgb(colours[ch]), 255], p);
        }
      }
    });
  }
  return img;
}

const HEAD_IDLE = { front: ['front/idle/01.png', 'idle_front/01.png'], back: ['back/idle/01.png', 'idle_back/01.png'], right: ['right/idle/01.png', 'idle_right/01.png'] };
const FRAME = /^\d+\.png$/; // skips duplicate variants such as 02__v38cc0554.png

// A view's frame file in a set, as { file, mirror }: a set without right-facing frames has its
// left-facing ones mirrored.
function locate(dir, folder, file) {
  const direct = path.join(dir, folder, file);
  if (fs.existsSync(direct)) return { file: direct, mirror: false };
  const left = path.join(dir, folder.replace('right', 'left'), file);
  if (folder.includes('right') && fs.existsSync(left)) return { file: left, mirror: true };
  return null;
}
const load = ({ file, mirror }) => (mirror ? mirrored(decode(file)) : decode(file));

// Where a frame's head sits relative to the reference frame's: the shift (dx, dy) that makes the
// most head pixels match. Idle art is sometimes drawn a pixel off from the walk cycle.
export function headOffset(img, ref, rows, guess) {
  let best = { dx: 0, dy: guess, score: -1 };
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      let score = 0;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < ref.w; x++) {
          const r = (y * ref.w + x) * 4;
          if (!ref.px[r + 3]) continue;
          const tx = x + dx, ty = y + dy;
          if (tx < 0 || tx >= img.w || ty < 0 || ty >= img.h) continue;
          const p = (ty * img.w + tx) * 4;
          if (img.px[p + 3] && img.px[p] === ref.px[r] && img.px[p + 1] === ref.px[r + 1] && img.px[p + 2] === ref.px[r + 2]) score++;
        }
      }
      const closer = Math.abs(dx) + Math.abs(dy - guess) < Math.abs(best.dx) + Math.abs(best.dy - guess);
      if (score > best.score || (score === best.score && closer)) best = { dx, dy, score };
    }
  }
  return best;
}

// Every frame of the set as { anim, file, img, bob } (left is mirrored from right by the game).
export function buildFrames(bodyDir, headDir, { dressing } = {}) {
  const frames = [];
  for (const view of ['front', 'right', 'back']) {
    const v = dressing?.compose?.[view] ?? VIEWS[view];
    const walk = `walk_${view}`;
    const bodyAt = (f) => locate(bodyDir, walk, f);
    const headAt = (f) => locate(headDir, walk, f) ?? locate(headDir, walk, '01.png');
    const bodyRef = bbox(load(bodyAt('01.png')));
    const headRef = bbox(load(headAt('01.png')));
    let ref = null; // walk frame 1, undressed: the frame the dress maps are drawn on
    const add = (anim, file, bodySrc, headSrc) => {
      let body = load(bodySrc);
      // Zones recolour only from an output row down (e.g. shoes that share the shirt's colours).
      // A zone may be limited to one view and to a column range (e.g. a skirt between the arms).
      for (const zone of dressing?.zones ?? []) {
        if (zone.view && zone.view !== view) continue;
        const [x0, x1] = zone.cols ?? [0, body.w - 1];
        const px = Buffer.from(body.px);
        // toRow bounds it below; stripes alternates maps every `width` columns (cloth stripes
        // that follow the garment as it moves).
        const last = zone.toRow == null ? body.h - 1 : zone.toRow - (70 - body.h);
        for (let y = Math.max(0, zone.fromRow - (70 - body.h)); y <= last && y < body.h; y++) {
          for (let x = x0; x <= x1 && x < body.w; x++) {
            const i = (y * body.w + x) * 4;
            const map = zone.stripes ? zone.stripes.maps[Math.floor((x - x0) / zone.stripes.width) % zone.stripes.maps.length] : zone.map;
            const to = px[i + 3] && map[hex(px[i], px[i + 1], px[i + 2])];
            if (to) px.set(rgb(to), i);
          }
        }
        body = { ...body, px };
      }
      // A view can recolour first (e.g. a cloak that only covers the back).
      if (dressing?.viewRecolor?.[view]) body = recolor(body, dressing.viewRecolor[view]);
      if (dressing?.bodyRecolor) body = recolor(body, dressing.bodyRecolor);
      const img = compose(body, load(headSrc), v, bodyRef, headRef);
      const bob = bbox(body).top - bodyRef.top;
      if (dressing?.recolor) img.px = recolor(img, dressing.recolor).px;
      ref ??= { ...img, px: Buffer.from(img.px) };
      const at = headOffset(img, ref, dressing?.headRows ?? 26, bob);
      // A layer with `only` paints just those frames (e.g. 'walk_right/02.png').
      const layers = dressing?.views?.[view]?.filter((l) => !l.only || l.only.includes(`${anim}/${file}`));
      if (layers) dress(img, layers, dressing.palette, at.dy, false, at.dx);
      frames.push({ anim, file, img, bob: at.dy, dx: at.dx });
    };
    const folder = bodyAt('01.png').file.split(path.sep).slice(-2, -1)[0];
    for (const f of fs.readdirSync(path.join(bodyDir, folder)).filter((n) => FRAME.test(n)).sort()) add(walk, f, bodyAt(f), headAt(f));
    // Idle uses the walk references too, so the head does not jump when he starts walking.
    // idleFromWalk keeps the walk pose standing still (e.g. hands clasped in front).
    const fromWalk = dressing?.idleFromWalk;
    const idleBody = (!fromWalk && locate(bodyDir, `idle_${view}`, '01.png')) || bodyAt('01.png');
    const idleHead = (!fromWalk && HEAD_IDLE[view].map((p) => locate(headDir, path.dirname(p), path.basename(p))).find(Boolean)) || headAt('01.png');
    add(`idle_${view}`, '01.png', idleBody, idleHead);
    // Activities drawn from one of the body pack's own animations (spec §4.3). The packs name
    // these folders inconsistently, so the dress file names one per view; a left-facing folder is
    // mirrored for the right view. The head is the idle head.
    for (const [name, act] of Object.entries(dressing?.activities ?? {})) {
      const spec = act.source?.[view];
      if (!spec) continue;
      const { folder, mirror = false } = typeof spec === 'string' ? { folder: spec } : spec;
      const dir = path.join(bodyDir, folder);
      if (!fs.existsSync(dir)) throw new Error(`Activity '${name}': no folder '${folder}' in ${bodyDir}`);
      for (const f of fs.readdirSync(dir).filter((n) => FRAME.test(n)).sort()) add(`act_${name}_${view}`, f, { file: path.join(dir, f), mirror }, idleHead);
    }
  }
  return frames;
}

if (import.meta.url === `file:///${path.resolve(process.argv[1]).replace(/\\/g, '/')}`) {
  const [bodyDir, headDir, setName, dressFile] = process.argv.slice(2);
  if (!setName) {
    console.error('usage: node tools/kitbash.mjs <bodyOverworldDir> <headOverworldDir> <outSetName> [dress.mjs]');
    process.exit(1);
  }
  const dressing = dressFile ? (await import(`file:///${path.resolve(dressFile).replace(/\\/g, '/')}`)).default : undefined;
  const outRoot = path.join('local-assets', 'sprites', setName);
  fs.rmSync(outRoot, { recursive: true, force: true });
  const frames = buildFrames(bodyDir, headDir, { dressing });
  for (const { anim, file, img } of frames) encode(img, path.join(outRoot, anim, file));
  console.log(`wrote ${frames.length} frames to ${outRoot}`);
}
