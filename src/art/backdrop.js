// The painted city behind the outdoor maps (Plan 5 spec §5c): Intramuros seen across Binondo and
// the river. Three layers, each a PixelCanvas laid on a plane by engine/world.js:
//   skyline  the muralla (the city wall, with bastions and their garitas) and, rising over it,
//            church façades with bell towers, the cathedral's dome, tiled roofs, acacias and palms
//   hills    the far ridges of the Sierra Madre in haze
//   sky      a grey gradient with clouds, tinted by the time of day (the world's sky material)
// Deterministic for a seed; pure JS. Canvas rows run top to bottom; a layer's bottom row stands at
// its plane's foot.
import { PixelCanvas, rng, shade } from './pixel.js';
import { valueNoise } from './surface.js';

export const BACKDROP_PX = 8; // skyline pixels per world unit
export const SKYLINE_HEIGHT = 18; // units, from the plane's foot
export const WALL_HEIGHT = 3.2; // the muralla's height above the foot

const KINDS = ['house', 'house', 'house', 'tree', 'palm', 'house', 'palm', 'tree'];
const LANDMARKS = ['church', 'dome', 'church']; // in turn, one every 14 units or so

// The skyline's buildings and trees along x0..x1 (units), left to right, and the muralla's
// bastions. Each { kind, x, w, h, seed }; h is the height above the foot.
export function backdropShapes({ x0, x1, seed = 1 }) {
  const r = rng(seed);
  const shapes = [];
  let x = x0;
  let sinceLandmark = 8;
  let landmarks = Math.floor(r() * LANDMARKS.length);
  while (x < x1) {
    let kind = KINDS[Math.floor(r() * KINDS.length)];
    if (sinceLandmark > 12 + r() * 6) kind = LANDMARKS[landmarks++ % LANDMARKS.length];
    const w = { house: 3 + r() * 3, tree: 2 + r() * 1.5, palm: 1.6, church: 6 + r() * 2, dome: 5 + r() }[kind];
    const h = { house: 4.4 + r() * 2.2, tree: 4.5 + r() * 2, palm: 6 + r() * 3, church: 9 + r() * 2, dome: 11 + r() * 2 }[kind];
    shapes.push({ kind, x, w, h, seed: Math.floor(r() * 1e6) });
    sinceLandmark = kind === 'church' || kind === 'dome' ? 0 : sinceLandmark + w;
    x += kind === 'tree' || kind === 'palm' ? w * 0.6 : w + r() * 0.5;
  }
  for (let b = x0 + 6 + r() * 6; b < x1 - 3; b += 16 + r() * 8) shapes.push({ kind: 'bastion', x: b, w: 4, h: WALL_HEIGHT + 1.2, seed: Math.floor(r() * 1e6) });
  return shapes;
}

// Fill the rows y0..y1 between two edges that run linearly from (left0, right0) to (left1, right1).
function trapezoid(c, y0, y1, left0, right0, left1, right1, colour) {
  for (let y = Math.round(y0); y <= Math.round(y1); y++) {
    const t = y1 === y0 ? 0 : (y - y0) / (y1 - y0);
    const l = Math.round(left0 + (left1 - left0) * t);
    const rr = Math.round(right0 + (right1 - right0) * t);
    for (let x = l; x <= rr; x++) c.set(x, y, typeof colour === 'function' ? colour(x, y, l, rr) : colour);
  }
}

function cross(c, x, top, colour = '#3b332c') {
  c.line(x, top, x, top + 5, colour);
  c.line(x - 2, top + 2, x + 2, top + 2, colour);
}

// The bell tower: square tiers narrowing upward, each with an arched opening, a small dome on top.
function tower(c, cx, foot, w, h, stone) {
  const tiers = 3;
  let y = foot;
  let half = w / 2;
  const tierH = (h - w * 0.8) / tiers;
  for (let t = 0; t < tiers; t++) {
    const top = y - tierH;
    c.fillRect(Math.round(cx - half), Math.round(top), Math.round(half * 2), Math.round(tierH), shade(stone, -t * 0.03));
    c.fillRect(Math.round(cx - half), Math.round(top), 1, Math.round(tierH), shade(stone, 0.12)); // lit edge
    c.fillRect(Math.round(cx + half) - 1, Math.round(top), 1, Math.round(tierH), shade(stone, -0.2));
    c.fillRect(Math.round(cx - half - 1), Math.round(top), Math.round(half * 2 + 2), 1, shade(stone, -0.25)); // cornice
    const ow = Math.max(2, Math.round(half * 0.7));
    const oh = Math.round(tierH * 0.55);
    c.fillRect(Math.round(cx - ow / 2), Math.round(top + tierH * 0.25), ow, oh, '#2e2620');
    c.ellipse(Math.round(cx - ow / 2), Math.round(top + tierH * 0.25 - ow / 2), Math.round(cx + ow / 2) - 1, Math.round(top + tierH * 0.25 + ow / 2), '#2e2620');
    if (t === 1) c.set(Math.round(cx), Math.round(top + tierH * 0.6), '#b48a3c'); // the bell
    y = top;
    half *= 0.82;
  }
  c.ellipse(Math.round(cx - half), Math.round(y - half * 1.4), Math.round(cx + half), Math.round(y + half * 0.6), shade(stone, -0.12));
  c.fillRect(Math.round(cx - half), Math.round(y), Math.round(half * 2) + 1, 2, shade(stone, -0.2));
  cross(c, Math.round(cx), Math.round(y - half * 1.4) - 5);
}

const PAINTERS = {
  house(c, s, X, foot, P) {
    const r = rng(s.seed);
    const wall = shade(['#ddd2b8', '#d4c6a6', '#e4dac3', '#cdbd9b'][Math.floor(r() * 4)], (r() - 0.5) * 0.08);
    const roof = ['#8f4a33', '#9b5236', '#86432e', '#7a4632'][Math.floor(r() * 4)];
    const x0 = X(s.x);
    const x1 = X(s.x + s.w);
    const top = foot - s.h * P;
    c.fillRect(x0, Math.round(top), x1 - x0, Math.round(foot - top), wall);
    c.fillRect(x1 - 2, Math.round(top), 2, Math.round(foot - top), shade(wall, -0.18));
    // A row of windows on the upper floor (capiz and dark sliding panels).
    for (let wx = x0 + 3; wx < x1 - 5; wx += 6) {
      c.fillRect(wx, Math.round(top + 4), 4, 5, r() < 0.5 ? '#4a3a30' : '#e9dfc4');
      c.fillRect(wx - 1, Math.round(top + 9), 6, 1, shade(wall, -0.25));
    }
    // A hipped roof with deep eaves.
    const rise = (1.2 + r() * 0.8) * P;
    trapezoid(c, top - rise, top, x0 + (x1 - x0) * 0.3, x1 - (x1 - x0) * 0.3, x0 - 3, x1 + 2, (x, y, l, rr) => ((x - l) < (rr - l) * 0.4 ? shade(roof, 0.1) : (y % 3 === 0 ? shade(roof, -0.15) : roof)));
    c.fillRect(x0 - 3, Math.round(top), x1 - x0 + 5, 1, shade(roof, -0.35));
  },
  church(c, s, X, foot, P) {
    const r = rng(s.seed);
    const stone = shade('#c9b994', (r() - 0.5) * 0.1);
    const x0 = X(s.x);
    const x1 = X(s.x + s.w);
    const mid = (x0 + x1) / 2;
    const top = foot - s.h * P;
    // The nave's roof behind the façade.
    trapezoid(c, top + 6, top + 18, mid - 6, mid + 6, x0 - 4, x1 + 4, '#7c4332');
    c.fillRect(x0, Math.round(top + 10), x1 - x0, Math.round(foot - top - 10), stone);
    c.fillRect(x0, Math.round(top + 10), 2, Math.round(foot - top - 10), shade(stone, 0.12));
    c.fillRect(x1 - 2, Math.round(top + 10), 2, Math.round(foot - top - 10), shade(stone, -0.18));
    // Pediment, cornices, the rose window and the great door.
    trapezoid(c, top, top + 10, mid, mid, x0 + 2, x1 - 2, (x, y) => (y === Math.round(top + 10) ? shade(stone, -0.25) : stone));
    cross(c, Math.round(mid), Math.round(top) - 6);
    for (const f of [0.38, 0.62]) c.fillRect(x0 - 1, Math.round(top + 10 + (foot - top - 10) * f), x1 - x0 + 2, 1, shade(stone, -0.22));
    c.ellipse(Math.round(mid - 3), Math.round(top + 14), Math.round(mid + 3), Math.round(top + 20), '#5a4a3c');
    c.ellipse(Math.round(mid - 1), Math.round(top + 16), Math.round(mid + 1), Math.round(top + 18), '#b39a5a');
    // Twin bell towers (or one), taller than the façade.
    const tw = 1.8 * P;
    const th = s.h * P * 1.25;
    tower(c, x0 + tw / 2 - 2, foot, tw, th, shade(stone, -0.04));
    if (r() < 0.7) tower(c, x1 - tw / 2 + 2, foot, tw, th, shade(stone, -0.06));
  },
  dome(c, s, X, foot, P) {
    const x0 = X(s.x);
    const x1 = X(s.x + s.w);
    const mid = (x0 + x1) / 2;
    const top = foot - s.h * P;
    const body = '#c4b38f';
    const domeTop = top + 6;
    const domeFoot = top + s.w * P * 0.45;
    // The cathedral's body and drum.
    c.fillRect(x0, Math.round(domeFoot + 6), x1 - x0, Math.round(foot - domeFoot - 6), body);
    c.fillRect(x0, Math.round(domeFoot + 6), 2, Math.round(foot - domeFoot - 6), shade(body, 0.12));
    c.fillRect(x1 - 2, Math.round(domeFoot + 6), 2, Math.round(foot - domeFoot - 6), shade(body, -0.18));
    c.fillRect(x0 - 1, Math.round(domeFoot + 6), x1 - x0 + 2, 1, shade(body, -0.25));
    for (let x = x0 + 4; x < x1 - 4; x += 7) {
      c.fillRect(x, Math.round(domeFoot + 11), 1, Math.round(foot - domeFoot - 11), shade(body, -0.1)); // pilasters
      c.fillRect(x + 2, Math.round(domeFoot + 13), 3, 5, '#4d4036'); // arched windows
      c.set(x + 3, Math.round(domeFoot + 12), '#4d4036');
    }
    c.fillRect(Math.round(mid - s.w * P * 0.32), Math.round(domeFoot), Math.round(s.w * P * 0.64), 7, shade(body, -0.05));
    for (let x = Math.round(mid - s.w * P * 0.28); x < mid + s.w * P * 0.3; x += 4) c.fillRect(x, Math.round(domeFoot + 2), 2, 3, '#4d4036');
    // The dome: weathered lead-grey with ribs and a lit flank, a lantern and a cross.
    const rx = s.w * P * 0.34;
    for (let y = Math.round(domeTop); y <= Math.round(domeFoot); y++) {
      const t = (domeFoot - y) / (domeFoot - domeTop);
      const half = rx * Math.sqrt(Math.max(0, 1 - t * t));
      for (let x = Math.round(mid - half); x <= Math.round(mid + half); x++) {
        const u = (x - (mid - half)) / Math.max(1, half * 2);
        const rib = Math.abs(((x - mid) / Math.max(1, half)) * 3 % 1) < 0.12;
        c.set(x, y, rib ? '#5f6b68' : u < 0.35 ? '#94a29c' : u > 0.8 ? '#5d6965' : '#7d8a85');
      }
    }
    c.fillRect(Math.round(mid - 2), Math.round(domeTop - 5), 4, 5, '#a89a7a');
    c.ellipse(Math.round(mid - 2), Math.round(domeTop - 8), Math.round(mid + 2), Math.round(domeTop - 4), '#6b7773');
    cross(c, Math.round(mid), Math.round(domeTop) - 14);
  },
  tree(c, s, X, foot, P) {
    // An acacia: a broad crown of leaf clumps, lit from the left, on a short dark trunk.
    const r = rng(s.seed);
    const x0 = X(s.x);
    const x1 = X(s.x + s.w);
    const top = foot - s.h * P;
    c.fillRect(Math.round((x0 + x1) / 2), Math.round(top + (foot - top) * 0.5), 2, Math.round((foot - top) * 0.5), '#4a3a2c');
    for (let k = 0; k < 14; k++) {
      const cx = x0 + r() * (x1 - x0);
      const cy = top + 3 + r() * (foot - top) * 0.4;
      const rad = 3 + r() * 4;
      c.ellipse(Math.round(cx - rad), Math.round(cy - rad * 0.7), Math.round(cx + rad), Math.round(cy + rad * 0.7), cx < (x0 + x1) / 2 ? '#56743a' : '#3e5a2b');
      c.ellipse(Math.round(cx - rad * 0.5), Math.round(cy - rad * 0.6), Math.round(cx + rad * 0.2), Math.round(cy - rad * 0.1), '#6c8a45');
    }
  },
  palm(c, s, X, foot, P) {
    // A coconut palm: a thin leaning trunk with ring marks and a burst of drooping fronds.
    const r = rng(s.seed);
    const x = X(s.x + s.w / 2);
    const top = foot - s.h * P;
    const lean = (r() - 0.5) * 10;
    for (let y = Math.round(foot); y >= top; y--) {
      const t = (foot - y) / (foot - top);
      const px = Math.round(x + lean * t * t);
      c.set(px, y, y % 4 === 0 ? '#5a4a3a' : '#776350');
      c.set(px + 1, y, '#5a4a3a');
    }
    const hx = Math.round(x + lean);
    for (let f = 0; f < 9; f++) {
      const a = (f / 9) * Math.PI * 2;
      const len = 7 + r() * 5;
      for (let i = 0; i <= len; i++) {
        const fx = hx + Math.cos(a) * i;
        const fy = top + Math.sin(a) * i * 0.5 + (i * i) / (len * 2.2);
        c.set(fx, fy, i < len * 0.5 ? '#5d7c38' : '#45602a');
        c.set(fx, fy + 1, '#3b5225');
      }
    }
    c.ellipse(hx - 1, Math.round(top), hx + 1, Math.round(top + 2), '#6b5a2e');
  },
};

// The muralla across the whole width: adobe courses, a coping, merlons with embrasures, moss at
// the foot; bastions jut taller, each with a domed garita on its corner.
function muralla(c, shapes, X, foot, P) {
  const top = Math.round(foot - WALL_HEIGHT * P);
  const n = c.width;
  const moss = valueNoise(n, 24, 1, 5);
  for (let y = top; y < c.height; y++) {
    for (let x = 0; x < n; x++) {
      const row = Math.floor((y - top) / 3);
      const joint = (y - top) % 3 === 2 || (x + (row % 2) * 4) % 8 === 0;
      let col = joint ? '#7e715b' : (x * 7 + row * 13) % 11 < 2 ? '#a08f71' : '#968669';
      const foot0 = (y - top) / (c.height - top);
      if (foot0 > 0.7 && moss[y * n + x] > 0.62) col = (x + y) % 3 === 0 ? '#6c7350' : shade(col, -0.12); // damp moss
      c.set(x, y, col);
    }
  }
  c.fillRect(0, top - 1, n, 2, '#b2a283'); // the coping
  for (let x = 0; x < n; x += 6) c.fillRect(x, top - 4, 4, 3, '#a39375'); // merlons
  for (const s of shapes.filter((b) => b.kind === 'bastion')) {
    const x0 = X(s.x);
    const x1 = X(s.x + s.w);
    const btop = Math.round(foot - s.h * P);
    trapezoid(c, btop, foot, x0 + 2, x1 - 2, x0 - 4, x1 + 4, (x, y, l, rr) => {
      const row = Math.floor((y - btop) / 3);
      const joint = (y - btop) % 3 === 2 || (x + (row % 2) * 4) % 8 === 0;
      if (x - l < 3) return joint ? '#a39377' : '#b8a888'; // the sunlit flank
      if (rr - x < 4) return joint ? '#6c614d' : '#7c6f58';
      return joint ? '#8b7e66' : '#a0906f';
    });
    c.fillRect(x0 + 1, btop - 1, x1 - x0 - 2, 2, '#b8a888');
    for (let x = x0 + 2; x < x1 - 2; x += 5) c.fillRect(x, btop - 4, 3, 3, '#a89878');
    // The garita: a little round sentry box with a domed cap.
    const gx = x1 - 3;
    c.fillRect(gx - 2, btop - 9, 5, 6, '#a29273');
    c.set(gx, btop - 7, '#2e2620');
    c.ellipse(gx - 3, btop - 12, gx + 3, btop - 8, '#8a7b60');
    c.set(gx, btop - 13, '#6c604b');
  }
}

// The skyline layer for a backdrop spec ({ x0, x1, seed }), x0 at the canvas's left edge.
export function paintSkyline({ x0, x1, seed = 1 }) {
  const P = BACKDROP_PX;
  const c = new PixelCanvas(Math.ceil((x1 - x0) * P), SKYLINE_HEIGHT * P);
  const X = (wx) => Math.round((wx - x0) * P);
  const foot = c.height - 1;
  const shapes = backdropShapes({ x0, x1, seed });
  // Trees and houses first, landmarks over them, the wall in front of everything.
  const order = { palm: 0, tree: 1, house: 2, church: 3, dome: 3 };
  for (const s of shapes.filter((s) => s.kind in order).sort((a, b) => order[a.kind] - order[b.kind])) PAINTERS[s.kind](c, s, X, foot, P);
  muralla(c, shapes, X, foot, P);
  return c;
}

// The far hills: three hazy ridges, palest at the back.
export function paintHills({ width, height = 48, seed = 1 }) {
  const c = new PixelCanvas(width, height);
  const ridges = [['#a9adbd', 0.25, 4], ['#979cb0', 0.45, 7], ['#878da3', 0.65, 11]];
  ridges.forEach(([colour, base, cells], i) => {
    const n = valueNoise(width, cells, 1, seed + i * 17);
    for (let x = 0; x < width; x++) {
      const top = Math.round(height * (base + (n[x] - 0.5) * 0.4));
      for (let y = Math.max(0, top); y < height; y++) c.set(x, y, y === top ? shade(colour, 0.08) : colour);
    }
  });
  return c;
}

// The sky: grey from the zenith (top) to white at the horizon (bottom) with drifting clouds, lit
// on top. The world multiplies it by the time of day's sky colour.
export function paintSky({ width = 256, height = 128, seed = 1 } = {}) {
  const c = new PixelCanvas(width, height);
  const big = valueNoise(width, 6, 3, seed);
  const fine = valueNoise(width, 24, 12, seed + 1);
  for (let y = 0; y < height; y++) {
    const t = y / (height - 1);
    for (let x = 0; x < width; x++) {
      const k = y * width + x;
      const cloud = Math.max(0, big[k] * 0.7 + fine[k] * 0.3 - 0.56) * 4 * (0.3 + t * 0.9);
      const lit = cloud > 0 && big[Math.max(0, y - 2) * width + x] < big[k] ? 0.06 : 0;
      const v = Math.min(1, 0.62 + t * 0.34 + Math.min(0.32, cloud * 0.4) + lit);
      const g = Math.round(v * 255).toString(16).padStart(2, '0');
      c.set(x, y, `#${g}${g}${g}`);
    }
  }
  return c;
}
