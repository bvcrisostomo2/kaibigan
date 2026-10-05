// Procedural character sprites in a Suikoden Star Leap–like overworld style (spec §4.1).
// Technique (studied from the style, all designs original): every body part is drawn as its own
// tapered shape, shaded with a 4-tone ramp lit from the upper left, OUTLINED ON ITS OWN LAYER and
// then stacked (back arm → legs → body → garment panels → front arm → head → hair). Stacking
// outlined parts produces the dark internal separation lines that give the style its crispness.
// Figures are ~4 heads tall in a 48×64 cell with a natural pose: elbows out, hands at the hips,
// feet in a slight A-stance. Side views are 3/4 views.
//
// Sheet layout (8 cols × 6 rows of 48×64 cells):
//   rows 0–3: directions down, left, right, up — cols 0–3 walk frames, cols 4–5 idle (breathing)
//   row 4:    front-facing expressions: neutral, smile, frown, shock, angry
//   row 5:    front-facing gestures: bow, point, fan
import { PixelCanvas, parseHex, shade } from './pixel.js';

export const CELL_W = 48;
export const CELL_H = 64;
export const SHEET_COLS = 8;
export const SHEET_ROWS = 6;
export const DIRS = ['down', 'left', 'right', 'up'];
export const WALK_FRAMES = 4;
export const IDLE_FRAMES = 2;
export const EXPRESSIONS = ['neutral', 'smile', 'frown', 'shock', 'angry'];
export const GESTURES = ['bow', 'point', 'fan'];
export const OUTLINE = '#181410';

const EYE = '#1d1416';
const WHITE = '#fbf7ef';
const MOUTH = '#a5413a';
const CX = 23.5;

const WALK = [
  { leg: 1, bob: 0, arm: 1 },
  { leg: 0, bob: -1, arm: 0 },
  { leg: -1, bob: 0, arm: -1 },
  { leg: 0, bob: -1, arm: 0 },
];
const IDLE = [
  { leg: 0, bob: 0, arm: 0, breathe: 0 },
  { leg: 0, bob: 0, arm: 0, breathe: 1 },
];

const BUILDS = {
  normal: { shoulder: 7, waist: 5.5, hip: 3, headW: 11, limb: 0.95 },
  slim: { shoulder: 6.5, waist: 4.8, hip: 2.7, headW: 11, limb: 0.85 },
  stout: { shoulder: 8.5, waist: 7.5, hip: 3.3, headW: 12, limb: 1.1 },
};

export function cellFor({ dir = 'down', mode = 'idle', frame = 0, expression = null, gesture = null } = {}) {
  if (gesture) {
    const col = GESTURES.indexOf(gesture);
    if (col < 0) throw new Error(`Unknown gesture '${gesture}'`);
    return { col, row: 5 };
  }
  if (expression) {
    const col = EXPRESSIONS.indexOf(expression);
    if (col < 0) throw new Error(`Unknown expression '${expression}'`);
    return { col, row: 4 };
  }
  const row = DIRS.indexOf(dir);
  if (row < 0) throw new Error(`Unknown direction '${dir}'`);
  if (mode === 'walk') return { col: ((frame % WALK_FRAMES) + WALK_FRAMES) % WALK_FRAMES, row };
  if (mode === 'idle') return { col: WALK_FRAMES + (((frame % IDLE_FRAMES) + IDLE_FRAMES) % IDLE_FRAMES), row };
  throw new Error(`Unknown mode '${mode}'`);
}

// ---------- palette ----------

export function ramp4(hex) {
  return [shade(hex, 0.28), hex, shade(hex, -0.24), shade(hex, -0.46)];
}

export function skinRamp(hex) {
  return [shade(hex, 0.2), hex, shade(hex, -0.13), shade(hex, -0.26)];
}

function luminance(hex) {
  const [r, g, b] = parseHex(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// Tone from a 0..1 position across a shape (0 = lit left edge, 1 = shadowed right edge).
function tone(tones, t, top = false) {
  if (top || t < 0.16) return tones[0];
  if (t < 0.6) return tones[1];
  if (t < 0.86) return tones[2];
  return tones[3];
}

// ---------- shape primitives (each draws into a part layer) ----------

function fillPolygon(c, pts, tones, { topRows = 1 } = {}) {
  const ys = pts.map((p) => p[1]);
  const y0 = Math.floor(Math.min(...ys));
  const y1 = Math.ceil(Math.max(...ys));
  for (let y = y0; y <= y1; y++) {
    const yc = y + 0.5;
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xa = Math.round(xs[k]);
      const xb = Math.round(xs[k + 1]) - 1;
      for (let x = xa; x <= xb; x++) c.set(x, y, tone(tones, (x - xa) / Math.max(1, xb - xa), y - y0 < topRows));
    }
  }
}

// A tapered limb from a→b with radii ra→rb, shaded across its width.
function capsule(c, [ax, ay], [bx, by], ra, rb, tones) {
  const minX = Math.floor(Math.min(ax - ra, bx - rb)) - 1;
  const maxX = Math.ceil(Math.max(ax + ra, bx + rb)) + 1;
  const minY = Math.floor(Math.min(ay - ra, by - rb)) - 1;
  const maxY = Math.ceil(Math.max(ay + ra, by + rb)) + 1;
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
      const cx = ax + dx * t;
      const cy = ay + dy * t;
      const r = ra + (rb - ra) * t;
      const ddx = px - cx;
      const ddy = py - cy;
      if (ddx * ddx + ddy * ddy > r * r) continue;
      c.set(x, y, tone(tones, (ddx / r + 1) / 2));
    }
  }
}

function ellipse(c, x0, y0, x1, y1, tones) {
  const cx = (x0 + x1 + 1) / 2;
  const cy = (y0 + y1 + 1) / 2;
  const rx = (x1 - x0 + 1) / 2;
  const ry = (y1 - y0 + 1) / 2;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy > 1) continue;
      let col = tones[1];
      if (dx > 0.55 || (dy > 0.6 && dx > 0.1)) col = tones[3];
      else if (dx > 0.22 || dy > 0.7) col = tones[2];
      else if (dx < -0.2 && dy < -0.25) col = tones[0];
      c.set(x, y, col);
    }
  }
}

// Outline a part layer: warm near-black, or a dark tint beside light fabrics (selective outline).
function outlineLayer(c, skip = null) {
  const marks = [];
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (c.opaque(x, y) || (skip && skip(x, y))) continue;
      let lightest = null;
      let any = false;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const n = c.get(x + dx, y + dy);
        if (n == null) continue;
        any = true;
        if (luminance(n) > 0.74 && (lightest == null || luminance(n) > luminance(lightest))) lightest = n;
      }
      if (any) marks.push([x, y, lightest ? shade(lightest, -0.6) : OUTLINE]);
    }
  }
  for (const [x, y, col] of marks) c.set(x, y, col);
  return c;
}

// ---------- the figure ----------

// Proportion sets measured from the reference style: 'youth' ≈ 3.5 heads (53 px tall),
// 'adult' ≈ 4.5 heads (58 px tall: smaller head, broad shoulders, longer body).
export const PROPORTIONS = {
  youth: { headTop: 10, chin: 13, faceShift: 0, hairVolume: 3, shoulderY: 25, waistY: 36, hipY: 41, knee: 51, ankle: 58, shoulderAdd: 0, elbowDrop: 7, handDrop: 13, elbowOut: 2, handIn: 1 },
  adult: { headTop: 5, chin: 12, faceShift: -1, hairVolume: 1, shoulderY: 19, waistY: 31, hipY: 38, knee: 50, ankle: 58, shoulderAdd: 2.5, elbowDrop: 9, handDrop: 17, elbowOut: 1.5, handIn: 0 },
};

function rig(costume, pose) {
  const b = BUILDS[costume.build ?? 'normal'];
  if (!b) throw new Error(`Unknown build '${costume.build}'`);
  const P = PROPORTIONS[costume.age ?? 'adult'];
  if (!P) throw new Error(`Unknown age '${costume.age}'`);
  const side = pose.view === 'side';
  const lift = pose.bob - (pose.breathe ?? 0);
  const bow = pose.gesture === 'bow' ? 2 : 0;
  const ox = side ? -1 : 0; // 3/4 view leans toward the facing side
  const shoulderY = P.shoulderY + lift;
  const waistY = P.waistY + pose.bob;
  const hipY = P.hipY + pose.bob;
  const sw = (side ? b.shoulder - 2 : b.shoulder) + P.shoulderAdd;
  const ww = side ? b.waist - 1.5 : b.waist;
  const headTop = P.headTop + lift + bow;
  return { b, P, side, ox, lift, shoulderY, waistY, hipY, sw, ww, headTop, chinY: headTop + P.chin, cx: CX + ox };
}

function legPoints(r, pose) {
  const { cx, hipY, side, b } = r;
  const { knee, ankle } = r.P;
  if (side) {
    const s = pose.leg * 3;
    return [
      { hip: [cx - 1, hipY], knee: [cx - 1 - s * 0.6, knee], ankle: [cx - 1 - s, ankle], lift: 0, far: true },
      { hip: [cx + 1, hipY], knee: [cx + 1 + s * 0.6, knee], ankle: [cx + 1 + s, ankle], lift: 0, far: false },
    ];
  }
  const h = b.hip;
  return [
    { hip: [cx - h, hipY], knee: [cx - h - 1, knee - (pose.leg === 1 ? 1 : 0)], ankle: [cx - h - 2, ankle - (pose.leg === 1 ? 2 : 0)], lift: pose.leg === 1 ? 2 : 0, dir: -1 },
    { hip: [cx + h, hipY], knee: [cx + h + 1, knee - (pose.leg === -1 ? 1 : 0)], ankle: [cx + h + 2, ankle - (pose.leg === -1 ? 2 : 0)], lift: pose.leg === -1 ? 2 : 0, dir: 1 },
  ];
}

function drawLegs(layers, r, costume, pose) {
  const col = costume.colors;
  const pants = ramp4(col.trousers ?? '#2b2b3a');
  const boots = ramp4(col.shoes ?? '#2a1c16');
  const covered = costume.bottom !== 'trousers';
  for (const leg of legPoints(r, pose)) {
    const L = new PixelCanvas(CELL_W, CELL_H);
    const tones = leg.far ? pants.map((t) => shade(t, -0.18)) : pants;
    const k = r.b.limb;
    if (!covered) {
      capsule(L, leg.hip, leg.knee, 2.7 * k, 2.3 * k, tones);
      capsule(L, leg.knee, leg.ankle, 2.3 * k, 2.0 * k, tones);
    }
    // Boot: a little wedge with the toe turned out (or forward in 3/4 view).
    const [x, y] = leg.ankle;
    const toe = r.side ? -3.5 : (leg.dir ?? 0) * 1.2;
    fillPolygon(L, [[x - 2.8, y - 3.5], [x + 2.8, y - 3.5], [x + 3.2 + Math.max(0, toe), y + 3], [x - 3.2 + Math.min(0, toe), y + 3]], leg.far ? boots.map((t) => shade(t, -0.15)) : boots);
    layers.push(outlineLayer(L));
  }
}

function drawArm(r, costume, pose, which) {
  const L = new PixelCanvas(CELL_W, CELL_H);
  const col = costume.colors;
  const sleeve = ramp4(col.sleeve ?? col.top);
  const skin = skinRamp(costume.skin);
  const style = costume.sleeves ?? 'normal';
  const k = r.b.limb * (style === 'wide' ? 1.25 : 1);
  const s = which === 'left' ? -1 : 1;
  const sh = [r.cx + s * (r.sw - 1.5), r.shoulderY + 2];
  let elbow;
  let hand;
  if (r.side) {
    const swing = pose.arm * 2.5;
    const far = which === 'left';
    elbow = [r.cx + (far ? -1 : 1) - swing * (far ? -1 : 1) * 0.5, r.shoulderY + 9];
    hand = [r.cx + (far ? -1 : 1.5) - swing * (far ? -1 : 1), r.shoulderY + 16];
    sh[0] = r.cx + (far ? -2 : 2);
  } else if (pose.gesture === 'point' && which === 'right') {
    elbow = [sh[0] + 5, sh[1] + 1];
    hand = [sh[0] + 10, sh[1] + 1];
  } else if (pose.gesture === 'fan' && which === 'right') {
    elbow = [sh[0] + 3, sh[1] + 7];
    hand = [sh[0] + 1, sh[1] - 3];
  } else if (pose.gesture === 'bow') {
    elbow = [sh[0] + s * 1.5, sh[1] + 8];
    hand = [r.cx + s * 1.5, sh[1] + 13];
  } else {
    const swing = (which === 'left' ? 1 : -1) * pose.arm;
    elbow = [sh[0] + s * r.P.elbowOut, sh[1] + r.P.elbowDrop + swing];
    hand = [sh[0] - s * r.P.handIn, sh[1] + r.P.handDrop + swing * 1.5];
  }
  const tones = r.side && which === 'left' ? sleeve.map((t) => shade(t, -0.15)) : sleeve;
  capsule(L, sh, elbow, 2.4 * k, 2.1 * k, tones);
  capsule(L, elbow, hand, 2.1 * k, (style === 'wide' ? 2.6 : 1.9) * k, tones);
  if (style === 'butterfly' || style === 'puff') ellipse(L, Math.round(sh[0] - 3), Math.round(sh[1] - 3), Math.round(sh[0] + 3), Math.round(sh[1] + 3), ramp4(shade(col.sleeve ?? col.top, 0.08)));
  if (col.cuff) capsule(L, [hand[0] - (hand[0] - elbow[0]) * 0.18, hand[1] - (hand[1] - elbow[1]) * 0.18], [hand[0] - (hand[0] - elbow[0]) * 0.06, hand[1] - (hand[1] - elbow[1]) * 0.06], 1.9 * k, 1.9 * k, ramp4(col.cuff));
  ellipse(L, Math.round(hand[0] - 2), Math.round(hand[1] - 1), Math.round(hand[0] + 2), Math.round(hand[1] + 3), skin);
  return outlineLayer(L);
}

// Torso and garment panels. Returns layers in stacking order.
function drawBody(r, costume, view) {
  const col = costume.colors;
  const layers = [];
  const top = ramp4(col.top);
  const { cx, shoulderY: sy, waistY: wy, hipY: hy, sw, ww } = r;
  const back = view === 'up';
  const torso = [[cx - sw, sy + 1], [cx - sw + 1, sy], [cx + sw - 1, sy], [cx + sw, sy + 1], [cx + ww + 0.5, wy], [cx + ww, hy], [cx - ww, hy], [cx - ww - 0.5, wy]];

  // Skirts and robes go under the torso.
  if (costume.bottom === 'skirt' || costume.bottom === 'robe') {
    const L = new PixelCanvas(CELL_W, CELL_H);
    const tones = ramp4(costume.bottom === 'robe' ? col.robe : col.skirt);
    const flare = costume.bottom === 'robe' ? 10.5 : 12.5;
    const hem = 58;
    fillPolygon(L, [[cx - ww - 0.5, wy - 2], [cx + ww + 0.5, wy - 2], [cx + flare, hem], [cx - flare, hem]], tones);
    if (col.skirtStripe) for (let x = Math.round(cx - flare); x < cx + flare; x += 3) L.line(Math.round(cx + (x - cx) * 0.45), wy, x, hem - 1, col.skirtStripe);
    else for (const f of [-0.5, 0, 0.5]) L.line(Math.round(cx + f * ww), wy + 2, Math.round(cx + f * flare * 1.1), hem - 1, shade(costume.bottom === 'robe' ? col.robe : col.skirt, -0.22));
    if (col.frill) for (const y of [hem - 1, hem - 7, hem - 13]) for (let x = 0; x < 40; x += 2) if (L.opaque(x, y)) L.set(x, y, col.frill);
    if (col.hem) for (let x = 0; x < 48; x++) if (L.opaque(x, hem) || L.opaque(x, hem - 1)) L.set(x, hem - 1, col.hem);
    layers.push(outlineLayer(L));
  }

  // Torso block.
  const T = new PixelCanvas(CELL_W, CELL_H);
  fillPolygon(T, torso, top);
  const mid = Math.round(cx - 0.5);
  if (!back && view !== 'side') {
    if (costume.top === 'coat' || costume.top === 'suit' || costume.top === 'uniform') {
      // Open front: shirt and (for coats) a waistcoat between the lapels.
      const shirt = col.shirt ?? WHITE;
      fillPolygon(T, [[mid - 2, sy], [mid + 3, sy], [mid + 1.5, wy - 2], [mid - 0.5, wy - 2]], ramp4(costume.top === 'uniform' ? col.top : shirt));
      if (col.tie) {
        T.fillRect(mid - 1, sy + 1, 3, 1, col.tie);
        T.fillRect(mid, sy + 2, 1, 2, col.tie);
      }
      if (col.chain) {
        T.line(mid - 2, wy - 4, mid - 4, wy - 3, col.chain);
        T.set(mid - 1, wy - 4, shade(col.chain, 0.3));
      }
      if (costume.top === 'coat') {
        // Frock coat: dark collar band, lapels, double row of buttons down to the waist.
        T.fillRect(Math.round(cx - sw + 2), sy, Math.round(sw * 2 - 4), 1, shade(col.top, -0.3));
        T.line(mid - 3, sy + 1, mid - 1, sy + 6, shade(col.top, 0.32));
        T.line(mid + 4, sy + 1, mid + 2, sy + 6, shade(col.top, -0.38));
        for (let y = sy + 7; y < wy; y += 3) {
          T.set(mid - 3, y, shade(col.top, 0.45));
          T.set(mid + 4, y, shade(col.top, 0.2));
        }
      }
      if (costume.top === 'uniform') {
        T.fillRect(Math.round(cx - sw + 2), sy, Math.round(sw * 2 - 4), 2, col.trim);
        for (let y = sy + 4; y < wy; y += 3) {
          T.set(mid - 2, y, '#e7c55a');
          T.set(mid + 2, y, '#e7c55a');
        }
      } else {
        T.line(mid - 2, sy, mid - 1, wy - 3, shade(col.top, 0.35));
        T.line(mid + 3, sy, mid + 2, wy - 3, shade(col.top, -0.4));
      }
    } else if (costume.top === 'barong') {
      for (let y = sy + 2; y < hy; y += 2) {
        T.set(mid - 1, y, shade(col.top, -0.18));
        T.set(mid + 2, y, shade(col.top, -0.18));
        if (y % 4 === 0) T.set(mid, y, shade(col.top, 0.2));
      }
      T.fillRect(mid - 1, sy, 4, 1, shade(col.top, -0.25));
    } else if (costume.top === 'habit') {
      // Cowl folded around the neck.
      fillPolygon(T, [[cx - sw + 1, sy], [cx + sw - 1, sy], [cx + sw - 3, sy + 4], [cx - sw + 3, sy + 4]], ramp4(shade(col.top, -0.08)));
    } else if (costume.top === 'dress') {
      T.fillRect(mid - 3, sy, 7, 2, col.frill ?? shade(col.top, 0.4));
      T.set(mid, sy + 4, '#f2d36b');
    }
  }
  if ((costume.top === 'coat' || costume.top === 'uniform' || costume.top === 'suit') && view !== 'up') {
    // High collar hugging the neck.
    const collar = costume.top === 'uniform' ? col.trim ?? col.top : shade(col.top, -0.2);
    T.fillRect(Math.round(cx - 3), sy - 2, 6, 2, collar);
    if (costume.top !== 'uniform') T.fillRect(Math.round(cx - 1), sy - 2, 2, 2, col.shirt ?? WHITE);
  }
  if (col.belt) for (let x = 0; x < 48; x++) if (T.opaque(x, wy) && T.opaque(x, wy + 1)) T.fillRect(x, wy, 1, 2, col.belt);
  layers.push(outlineLayer(T));

  // Long garment tails flare from the waist in two panels, open at the front.
  const tail = { barong: r.hipY + 7, coat: r.hipY + 12, suit: r.hipY + 6, uniform: r.hipY + 5 }[costume.top];
  if (tail) {
    for (const s of [-1, 1]) {
      const P = new PixelCanvas(CELL_W, CELL_H);
      const inner = costume.top === 'barong' || back ? 0 : 1.2;
      const spread = costume.top === 'coat' ? 4 : 2.5;
      fillPolygon(P, [[cx + s * inner, wy - 1], [cx + s * (ww + 0.8), wy - 1], [cx + s * (ww + spread), tail], [cx + s * inner * 0.5, tail]].map(([x, y]) => [x, y]), s < 0 ? top : top.map((t) => shade(t, -0.06)));
      if (col.trimLine) for (let y = wy; y <= tail; y++) {
        const xs = [];
        for (let x = 0; x < 48; x++) if (P.opaque(x, y)) xs.push(x);
        if (xs.length) P.set(s < 0 ? xs[xs.length - 1] : xs[0], y, col.trimLine);
      }
      layers.push(outlineLayer(P));
    }
  }

  // Accessories worn over the torso.
  const acc = costume.accessories ?? [];
  if (acc.includes('panuelo') && view === 'down') {
    const P = new PixelCanvas(CELL_W, CELL_H);
    fillPolygon(P, [[cx - sw - 0.5, sy + 0.5], [cx + sw + 0.5, sy + 0.5], [cx, sy + 9]], ramp4(col.panuelo));
    layers.push(outlineLayer(P));
  }
  if (acc.includes('tapis') && view !== 'up') {
    const P = new PixelCanvas(CELL_W, CELL_H);
    fillPolygon(P, [[cx - ww - 1, wy - 1], [cx + ww + 1, wy - 1], [cx + ww + 3, 53], [cx - ww - 3, 53]], ramp4(col.tapis));
    layers.push(outlineLayer(P));
  }
  if (acc.includes('cord') && view !== 'up') {
    const P = new PixelCanvas(CELL_W, CELL_H);
    P.fillRect(Math.round(cx - ww - 1), wy, Math.round(ww * 2 + 2), 1, '#efe7d3');
    P.line(Math.round(cx + 2), wy + 1, Math.round(cx + 3), wy + 11, '#e2d8c0');
    layers.push(P);
  }
  if (acc.includes('cape')) {
    for (const s of back ? [0] : [-1, 1]) {
      const P = new PixelCanvas(CELL_W, CELL_H);
      if (back) fillPolygon(P, [[cx - sw - 1, sy], [cx + sw + 1, sy], [cx + sw + 4, 50], [cx - sw - 4, 50]], ramp4(col.cape));
      else fillPolygon(P, [[cx + s * (sw - 3), sy - 0.5], [cx + s * (sw + 1.5), sy + 1], [cx + s * (sw + 3.5), 50], [cx + s * (sw - 1), 50]], ramp4(col.cape));
      layers.push(outlineLayer(P));
    }
  }
  return layers;
}

function drawHead(r, costume) {
  const L = new PixelCanvas(CELL_W, CELL_H);
  const skin = skinRamp(costume.skin);
  const hw = r.side ? r.b.headW - 1 : r.b.headW;
  const x0 = Math.round(r.cx - hw / 2);
  const x1 = x0 + hw - 1;
  // Neck, skull and a jaw that narrows to the chin.
  capsule(L, [r.cx, r.chinY - 1], [r.cx, r.shoulderY + 1], 2.4, 2.6, skinRamp(shade(costume.skin, -0.12)));
  ellipse(L, x0, r.headTop, x1, r.headTop + r.P.chin - 3, skin);
  const jx = r.side ? -1 : 0;
  fillPolygon(L, [[x0 + 1 + jx, r.headTop + r.P.chin - 6], [x1, r.headTop + r.P.chin - 6], [r.cx + 2.5, r.chinY], [r.cx - 2.5 + jx, r.chinY]], skin, { topRows: 0 });
  return { layer: L, x0, x1 };
}

function drawFace(L, r, head, costume, expression, view) {
  const y = r.headTop + r.P.faceShift;
  const brow = costume.colors.brow ?? shade(costume.hair?.color ?? '#2a1d1a', -0.25);
  const blush = costume.accessories?.includes('rouge') ? '#e0737f' : null;
  const mustache = costume.accessories?.includes('mustache');
  const set = (x, yy, c) => L.set(x, yy, c);
  if (view === 'side') {
    const e1 = head.x0 + 2;
    const e2 = head.x0 + 6;
    L.fillRect(e1, y + 7, 1, 2, EYE);
    L.fillRect(e2, y + 7, 1, 2, EYE);
    set(e2, y + 6, brow);
    set(e1, y + 6, brow);
    set(head.x0 - 1, y + 9, costume.skin);
    L.fillRect(e1 + 1, y + 11, 2, 1, MOUTH);
    if (mustache) L.fillRect(e1, y + 10, 4, 1, costume.hair.color);
    if (blush) set(e2 + 1, y + 9, blush);
    return;
  }
  const cx = Math.round(r.cx - 0.5);
  const Lx = cx - 2;
  const Rx = cx + 2;
  const iris = costume.colors.eyes ?? '#4a3326';
  // 2×3 eyes: lash line, dark pupil with a catch-light, coloured iris below.
  const eyes = (h = 3) => {
    for (const x of [Lx, Rx]) {
      const x0e = x === Lx ? x - 1 : x;
      if (h === 3) {
        // lash line · pupil + catch-light · iris
        L.fillRect(x0e, y + 7, 2, 1, EYE);
        L.set(x0e, y + 8, x === Lx ? WHITE : shade(iris, -0.35));
        L.set(x0e + 1, y + 8, x === Lx ? shade(iris, -0.35) : WHITE);
        L.fillRect(x0e, y + 9, 2, 1, iris);
      } else L.fillRect(x0e, y + 8, 2, 1, EYE);
    }
  };
  const brows = (dl, dr = dl) => {
    set(Lx - 1, y + 5 + dl, brow);
    set(Lx, y + 5 + dl, brow);
    set(Rx, y + 5 + dr, brow);
    set(Rx + 1, y + 5 + dr, brow);
  };
  // Lighter cheeks under the eyes help them read.
  for (const x of [Lx - 1, Lx, Rx, Rx + 1]) set(x, y + 10, shade(costume.skin, 0.08));
  const mouth = (pixels, color = MOUTH) => pixels.forEach(([dx, dy]) => set(cx + dx, y + dy, color));
  switch (expression) {
    case 'neutral':
      eyes();
      brows(0);
      mouth([[0, 12], [1, 12]], shade(MOUTH, -0.1));
      break;
    case 'smile':
      for (const x of [Lx, Rx]) {
        set(x - 1, y + 8, EYE);
        set(x, y + 7, EYE);
        set(x + 1, y + 8, EYE);
      }
      brows(-1);
      mouth([[-1, 11], [0, 12], [1, 12], [2, 11]]);
      break;
    case 'frown':
      eyes();
      set(Lx - 1, y + 5, brow);
      set(Lx, y + 6, brow);
      set(Rx, y + 6, brow);
      set(Rx + 1, y + 5, brow);
      mouth([[-1, 13], [0, 12], [1, 12], [2, 13]]);
      break;
    case 'shock':
      for (const x of [Lx, Rx]) {
        L.fillRect(x - (x === Lx ? 1 : 0), y + 6, 2, 3, WHITE);
        set(x, y + 7, EYE);
      }
      brows(-2);
      L.fillRect(cx, y + 11, 2, 2, '#6e2420');
      break;
    case 'angry':
      eyes(2);
      set(Lx - 1, y + 5, brow);
      set(Lx, y + 6, brow);
      set(Rx, y + 6, brow);
      set(Rx + 1, y + 5, brow);
      set(Lx + 1, y + 6, brow);
      set(Rx - 1, y + 6, brow);
      mouth([[-1, 12], [0, 12], [1, 12], [2, 12]], '#6e2420');
      break;
    case 'closed':
      for (const x of [Lx, Rx]) L.fillRect(x - (x === Lx ? 1 : 0), y + 8, 2, 1, EYE);
      mouth([[0, 12], [1, 12]], shade(MOUTH, -0.1));
      break;
    default:
      throw new Error(`Unknown expression '${expression}'`);
  }
  set(cx + 1, y + 10, shade(costume.skin, -0.2));
  if (blush) {
    set(Lx - 2, y + 10, blush);
    set(Rx + 2, y + 10, blush);
  }
  if (mustache) L.fillRect(cx - 2, y + 11, 6, 1, costume.hair.color);
}

// Spiky, strand-shaded hair. Spikes are seeded per costume so each character's hair differs.
function drawHair(r, head, costume, view) {
  const hair = costume.hair;
  if (!hair) return null;
  const L = new PixelCanvas(CELL_W, CELL_H);
  const tones = ramp4(hair.color);
  const [hi, base, lo] = tones;
  const { x0, x1 } = head;
  const y = r.headTop;
  const cx = (x0 + x1 + 1) / 2;
  const style = hair.style;
  const spikes = (list) => list.forEach(([ax, ay, bx, by, w]) => fillPolygon(L, [[ax - w, ay], [ax + w, ay], [bx, by]], tones, { topRows: 0 }));

  if (style === 'tonsure') {
    if (view === 'up') {
      ellipse(L, x0 - 1, y + 3, x1 + 1, y + 11, tones);
      ellipse(L, x0 + 2, y, x1 - 2, y + 6, skinRamp(costume.skin));
    } else if (view === 'side') {
      ellipse(L, x1 - 6, y + 3, x1 + 1, y + 11, tones);
      L.fillRect(x0 + 2, y + 3, x1 - x0 - 3, 1, base);
    } else {
      ellipse(L, x0 - 1, y + 3, x0 + 2, y + 10, tones);
      ellipse(L, x1 - 2, y + 3, x1 + 1, y + 10, tones);
      L.fillRect(x0 + 2, y + 3, x1 - x0 - 3, 1, base);
    }
    return outlineLayer(L);
  }
  if (style === 'curly') {
    const blobs = view === 'up'
      ? [[x0 - 3, y - 2, x1 + 3, y + 18]]
      : [[x0 - 3, y - 2, x1 + 3, y + 6], [x0 - 5, y + 2, x0 + 1, y + 14], [x1 - 1, y + 2, x1 + 5, y + 14], [x0 - 4, y + 10, x0 + 1, y + 21], [x1, y + 10, x1 + 5, y + 21]];
    for (const [a, b, c2, d] of blobs) ellipse(L, a, b, c2, d, tones);
    if (view !== 'up') for (let x = x0; x <= x1; x += 3) ellipse(L, x - 1, y + 2, x + 2, y + 5, tones);
    for (let x = x0 - 3; x <= x1 + 3; x += 2) if (L.get(x, y) === base) L.set(x, y, hi);
    return outlineLayer(L);
  }

  // Short / slick / bun: skull cap plus spikes and a fringe.
  const capBottom = view === 'up' ? y + 12 : y + 5;
  const vol = r.P.hairVolume;
  ellipse(L, x0 - vol, y - vol, x1 + vol, capBottom + (view === 'up' ? 5 : 4), tones);
  if (view === 'down') {
    // Remove the cap below the fringe line so the face shows.
    for (let yy = y + 5; yy <= capBottom + 4; yy++) for (let x = x0 + 1; x < x1; x++) L.set(x, yy, null);
    const fringe = style === 'slick' ? [[cx + 1, y + 1, cx - 3, y + 5, 2], [cx + 3, y + 1, cx + 5, y + 4, 1.5]] : [[cx - 3, y + 2, cx - 4, y + 6, 1.6], [cx, y + 2, cx + 0.5, y + 6, 1.6], [cx + 3, y + 2, cx + 4, y + 6, 1.6], [cx - 5, y + 3, cx - 7, y + 9, 1.3], [cx + 5, y + 3, cx + 7, y + 9, 1.3]];
    spikes(fringe);
    // Side locks down to the ears.
    // Side locks: long and loose on youths, short and tucked on adults.
    if (vol >= 3) spikes([[x0 - 1.5, y + 3, x0 - 1.5, y + (style === 'bun' ? 13 : 11), 1.6], [x1 + 2.5, y + 3, x1 + 2.5, y + (style === 'bun' ? 13 : 11), 1.6]]);
    else spikes([[x0 - 0.2, y + 2, x0, y + (style === 'bun' ? 10 : 8), 1.2], [x1 + 1.2, y + 2, x1 + 1, y + (style === 'bun' ? 10 : 8), 1.2]]);
  } else if (view === 'side') {
    for (let yy = y + 5; yy <= capBottom + 4; yy++) for (let x = x0; x < x0 + 8; x++) L.set(x, yy, null);
    spikes([[x0 + 2, y + 2, x0 - 0.5, y + 7, 1.6], [x0 + 5, y + 2, x0 + 3.5, y + 7, 1.4], [x1, y + 4, x1 + 2.5, y + 11, 1.8]]);
  } else {
    spikes([[cx - 3, y + 8, cx - 4, y + 14, 2], [cx, y + 8, cx, y + 15, 2], [cx + 3, y + 8, cx + 4, y + 14, 2]]);
  }
  // Crown spikes break up the silhouette (not for neat slicked hair).
  if (style !== 'slick' && style !== 'bun' && vol >= 3) spikes([[cx - 5, y + 1, cx - 8, y - 4, 2.2], [cx - 1, y, cx - 1, y - 5, 2.2], [cx + 3, y, cx + 5, y - 5, 2.2], [cx + 6, y + 2, cx + 10, y - 1, 1.8], [x0 - 2, y + 4, x0 - 5, y + 8, 1.6], [x1 + 3, y + 4, x1 + 6, y + 8, 1.6]]);
  if (style === 'bun') {
    if (view === 'up') ellipse(L, Math.round(cx - 4), y + 4, Math.round(cx + 3), y + 11, tones);
    else if (view === 'side') ellipse(L, x1 - 1, y, x1 + 5, y + 7, tones);
    else ellipse(L, Math.round(cx - 3), y - 5, Math.round(cx + 2), y + 1, tones);
  }
  // Strand lines and a sheen.
  for (let x = x0 - 2; x <= x1 + 2; x += 3) {
    if (L.get(x, y + 2) === base) L.set(x, y + 2, lo);
    for (const yy of [y, y + 1]) if (L.get(x + 1, yy) === base || L.get(x + 1, yy) === hi) L.set(x + 1, yy, shade(hair.color, 0.45));
    if (L.get(x + 2, y) === base) L.set(x + 2, y, hi);
  }
  // Hair tips rest directly on the face: no outline across the forehead.
  const face = view === 'down' ? (x, yy) => yy >= y + 4 && yy <= r.chinY && x > x0 && x < x1 : view === 'side' ? (x, yy) => yy >= y + 4 && yy <= r.chinY && x >= x0 - 1 && x < x0 + 8 : null;
  return outlineLayer(L, face);
}

function drawHat(r, head, costume, view) {
  if (!costume.accessories?.includes('tricornio')) return null;
  const L = new PixelCanvas(CELL_W, CELL_H);
  const hat = ramp4('#24222b');
  const y = r.headTop;
  ellipse(L, head.x0, y - 3, head.x1, y + 4, hat);
  fillPolygon(L, [[head.x0 - 3, y + 2], [head.x1 + 4, y + 2], [head.x1 + 2, y + 5], [head.x0 - 1, y + 5]], hat);
  if (view === 'down') L.fillRect(Math.round(r.cx - 1), y - 1, 2, 2, '#c9a64a');
  return outlineLayer(L);
}

function drawFan(r, costume) {
  const L = new PixelCanvas(CELL_W, CELL_H);
  const fan = ramp4(costume.colors.fan ?? '#e9c46a');
  const px = r.cx + r.sw + 1;
  const py = r.shoulderY - 4;
  for (let rad = 0; rad <= 8; rad++) {
    for (let a = 0; a <= 14; a++) {
      const ang = Math.PI * (1.2 + (a / 14) * 0.75);
      L.set(px + Math.cos(ang) * rad, py + Math.sin(ang) * rad, a % 3 === 0 ? fan[2] : rad > 6 ? fan[0] : fan[1]);
    }
  }
  return outlineLayer(L);
}

// ---------- frame composition ----------

export function drawFrame(costume, { dir = 'down', mode = 'idle', frame = 0, expression = null, gesture = null } = {}) {
  const base = expression || gesture ? IDLE[0] : mode === 'walk' ? WALK[((frame % WALK_FRAMES) + WALK_FRAMES) % WALK_FRAMES] : IDLE[((frame % IDLE_FRAMES) + IDLE_FRAMES) % IDLE_FRAMES];
  const view = gesture || expression ? 'down' : dir === 'left' || dir === 'right' ? 'side' : dir;
  const pose = { ...base, view, gesture };
  const r = rig(costume, pose);
  const layers = [];

  if (costume.hair?.style === 'curly' && view !== 'up') {
    const B = new PixelCanvas(CELL_W, CELL_H);
    ellipse(B, Math.round(r.cx - 10), r.headTop + 6, Math.round(r.cx + 9), r.headTop + 24, ramp4(shade(costume.hair.color, -0.12)));
    layers.push(outlineLayer(B));
  }
  // Back-facing: arms first so the body covers their inner edges; front: back arm in 3/4 view.
  if (view === 'side') layers.push(drawArm(r, costume, pose, 'left'));
  if (view === 'up') layers.push(drawArm(r, costume, pose, 'left'), drawArm(r, costume, pose, 'right'));
  drawLegs(layers, r, costume, pose);
  layers.push(...drawBody(r, costume, view));
  if (view === 'down') layers.push(drawArm(r, costume, pose, 'left'), drawArm(r, costume, pose, 'right'));
  if (view === 'side') layers.push(drawArm(r, costume, pose, 'right'));
  const head = drawHead(r, costume);
  if (view !== 'up') drawFace(head.layer, r, head, costume, gesture === 'bow' ? 'closed' : gesture === 'point' ? 'angry' : expression ?? 'neutral', view === 'side' ? 'side' : 'down');
  layers.push(outlineLayer(head.layer));
  const hair = drawHair(r, head, costume, view);
  if (hair) layers.push(hair);
  const hat = drawHat(r, head, costume, view);
  if (hat) layers.push(hat);
  if (gesture === 'fan') layers.push(drawFan(r, costume));

  const c = new PixelCanvas(CELL_W, CELL_H);
  for (const L of layers) c.blit(L);
  return dir === 'right' && !gesture && !expression ? mirror(c) : c;
}

function mirror(c) {
  const m = new PixelCanvas(c.width, c.height);
  m.blit(c, 0, 0, { flipX: true });
  return m;
}

export function drawCharacterSheet(costume) {
  const sheet = new PixelCanvas(CELL_W * SHEET_COLS, CELL_H * SHEET_ROWS);
  const put = (cell, col, row) => sheet.blit(cell, col * CELL_W, row * CELL_H);
  DIRS.forEach((dir, row) => {
    for (let f = 0; f < WALK_FRAMES; f++) put(drawFrame(costume, { dir, mode: 'walk', frame: f }), f, row);
    for (let f = 0; f < IDLE_FRAMES; f++) put(drawFrame(costume, { dir, mode: 'idle', frame: f }), WALK_FRAMES + f, row);
  });
  EXPRESSIONS.forEach((expression, col) => put(drawFrame(costume, { expression }), col, 4));
  GESTURES.forEach((gesture, col) => put(drawFrame(costume, { gesture }), col, 5));
  return sheet;
}

// Pixel portrait fallback (3× crop of the expression frame). Plan 3 adds large busts and image portraits.
export function drawPortrait(costume, expression = 'neutral') {
  const frame = drawFrame(costume, { expression });
  const out = new PixelCanvas(64, 64);
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      const col = frame.get(13 + x, 1 + y);
      if (col != null) out.fillRect(x * 3, y * 3, 3, 3, col);
    }
  }
  return out;
}

// Named animation index for the procedural sheet: { name: [{ col, row }, ...] }.
// Names: walk_<dir> / idle_<dir> (dir = down|left|right|up), expression_<name>, gesture_<name>.
export function sheetAnims() {
  const anims = {};
  DIRS.forEach((dir, row) => {
    anims[`walk_${dir}`] = Array.from({ length: WALK_FRAMES }, (_, f) => ({ col: f, row }));
    anims[`idle_${dir}`] = Array.from({ length: IDLE_FRAMES }, (_, f) => ({ col: WALK_FRAMES + f, row }));
  });
  EXPRESSIONS.forEach((name, col) => (anims[`expression_${name}`] = [{ col, row: 4 }]));
  GESTURES.forEach((name, col) => (anims[`gesture_${name}`] = [{ col, row: 5 }]));
  return anims;
}
