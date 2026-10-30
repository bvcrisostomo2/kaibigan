// Code-drawn head-and-shoulders busts for the dialogue portraits (Plan 5 spec §4.5). Drawn at 48×48
// in the sprites' style (each part shaded and outlined on its own layer, then stacked: back hair,
// neck, body, head and face, front hair, hat) and doubled to 96×96. Each speaker's look is matched
// to their kitbash head (bustLooks.js); anyone else's comes from their costume data. Hair and hats
// stop above the eyes, so a feeling always shows.
import { PixelCanvas, shade } from './pixel.js';
import { COSTUMES } from './costumes.js';
import { BUST_LOOKS } from './bustLooks.js';
import { drawFace, drawFaceOverlay } from './faces.js';

export const BUST_SIZE = 96;
const N = 48; // the working size, doubled into BUST_SIZE
const CX = 23.5;
const OUTLINE = '#181410';
// Hair stays above this row across the face, clear of the brows and eyes.
const FRINGE_FLOOR = 14;

// The eyes' box on the 96×96 bust (both eyes and their lashes), for tests.
export function bustFaceBox() {
  return { x: 30, y: 34, w: 36, h: 16 };
}

// ---- looks ---------------------------------------------------------------------------------

const ramp3 = (hex) => [shade(hex, 0.3), hex, shade(hex, -0.3)];
const ramp4 = (hex) => [shade(hex, 0.25), hex, shade(hex, -0.25), shade(hex, -0.45)];
const HAIR_STYLES = { short: 'short', slick: 'swept', bun: 'long', tonsure: 'tonsure', curly: 'curls' };

// A look from a costume's data (art/costumes.js), for anyone without a matched one.
function lookFromCostume(c) {
  const hair = c.hair?.color ?? '#2a1d1a';
  const top = c.colors?.top ?? '#887766';
  const kind = c.top === 'habit' ? 'hood' : c.top === 'uniform' ? 'uniform' : c.top === 'coat' || c.top === 'suit' ? 'coat' : 'shirt';
  const acc = c.accessories ?? [];
  return {
    skin: ramp3(c.skin ?? '#d9a37a'),
    face: { w: c.build === 'stout' ? 12.5 : 11.5, jaw: c.build === 'stout' ? 6 : 4.5 },
    hair: { style: HAIR_STYLES[c.hair?.style] ?? 'short', tones: ramp4(hair) },
    beard: acc.includes('beard') ? { kind: 'full', color: hair } : acc.includes('mustache') ? { kind: 'mustache', size: 'small', color: hair } : null,
    hat: acc.includes('headscarf') ? { kind: 'headband', tones: ramp4(c.colors?.headscarf ?? '#8a6a4a') } : null,
    rouge: acc.includes('rouge'),
    brow: shade(hair, -0.25),
    iris: c.colors?.eyes ?? '#3a2a20',
    body: { kind, neck: 'tie', tones: ramp4(top), shirt: c.colors?.shirt ?? '#efe9dd', tie: c.colors?.tie ?? '#3a2a2a', collar: '#8a2a2a', buttons: '#d9b35a' },
  };
}

// The look a costume's bust is drawn with. Throws for an unknown costume.
export function lookFor(costumeId) {
  if (BUST_LOOKS[costumeId]) return BUST_LOOKS[costumeId];
  const costume = COSTUMES[costumeId];
  if (!costume) throw new Error(`Unknown costume '${costumeId}'`);
  return lookFromCostume(costume);
}

// ---- shapes --------------------------------------------------------------------------------

function layer() {
  return new PixelCanvas(N, N);
}

const outlined = (c) => c.outline(OUTLINE);

// Tone from 0..1 across a shape, lit from the left: [light, base, shadow, deep].
function tone(tones, t) {
  if (t < 0.18) return tones[0];
  if (t < 0.62) return tones[1];
  if (t < 0.86) return tones[2];
  return tones[3] ?? tones[2];
}

function fillPolygon(c, pts, colorAt) {
  const ys = pts.map((p) => p[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
    const yc = y + 0.5;
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) c.set(x, y, colorAt(x, y));
  }
}

// Half the head's width at row y: a skull, then a jaw narrowing to the chin.
function headHalf(look, y) {
  const { w, jaw } = look.face;
  const top = 5;
  const mid = 19;
  const chin = 34;
  if (y < top || y > chin) return 0;
  if (y <= mid) {
    const k = (y - mid) / (mid - top);
    return w * Math.sqrt(Math.max(0, 1 - k * k));
  }
  if (y <= mid + 2) return w;
  return w - (w - jaw) * ((y - mid - 2) / (chin - mid - 2)) ** 1.5;
}

const offset = (x) => x + 0.5 - (CX + 0.5);
const insideHead = (look, x, y) => {
  const hw = headHalf(look, y);
  return hw > 0 && Math.abs(offset(x)) <= hw;
};

// ---- body ----------------------------------------------------------------------------------

function drawBody(look) {
  const L = layer();
  const b = look.body;
  const set = (x, y, c) => L.set(x, y, c);
  fillPolygon(L, [[1, 48], [4, 41], [11, 37.5], [19, 35.5], [29, 35.5], [37, 37.5], [44, 41], [47, 48]], (x) => tone(b.tones, x / 47));
  const lapels = (y0, slope) => {
    for (let y = y0; y < 48; y++) {
      set(Math.round(19 + (y - y0) * slope), y, b.tones[3]);
      set(Math.round(28 - (y - y0) * slope), y, b.tones[3]);
    }
  };
  switch (b.kind) {
    case 'hood':
      // A heavy hood rolled round the neck, a seam down the front.
      for (let y = 30; y <= 41; y++) for (let x = 11; x <= 36; x++) {
        const d = Math.hypot((x + 0.5 - 24) / 13, (y + 0.5 - 36) / 5.5);
        if (d <= 1) set(x, y, d > 0.78 ? b.tones[3] : y < 35 ? b.tones[0] : b.tones[1]);
      }
      for (let y = 42; y < 48; y++) set(24, y, b.tones[3]);
      break;
    case 'lace':
      // A high lace collar with a ribbon bow at the throat.
      for (let y = 31; y <= 37; y++) for (let x = 18; x <= 29; x++) set(x, y, (x + y) % 3 === 0 ? b.tones[2] : b.tones[0]);
      for (const [x, y] of [[21, 37], [22, 38], [23, 38], [24, 38], [25, 38], [26, 37], [22, 39], [23, 39], [24, 39], [25, 39]]) set(x, y, b.ribbon);
      set(23, 38, shade(b.ribbon, 0.3));
      break;
    case 'coat':
      // An open coat over a shirt, with a cravat or a narrow tie.
      fillPolygon(L, [[19, 35], [29, 35], [24, 48]], () => b.shirt);
      if (b.neck === 'cravat') {
        for (let y = 35; y < 42; y++) for (let x = 22; x <= 25; x++) if (y < 37 || Math.abs(x - 23.5) < 1) set(x, y, b.tie);
        for (let y = 37; y < 42; y++) set(23, y, shade(b.tie, -0.3));
      } else {
        for (const [x, y] of [[23, 36], [24, 36], [23, 37], [24, 37]]) set(x, y, shade(b.tie, -0.2));
        for (let y = 38; y < 46; y++) for (let x = 23; x <= 24; x++) set(x, y, x === 24 ? shade(b.tie, -0.2) : b.tie);
      }
      lapels(36, 0.42);
      break;
    case 'vest':
      // A vest over a white shirt with a tie.
      fillPolygon(L, [[18, 35], [30, 35], [27, 48], [21, 48]], () => b.shirt);
      for (let y = 36; y < 48; y++) {
        set(Math.round(18 + (y - 36) * 0.25), y, b.tones[3]);
        set(Math.round(29 - (y - 36) * 0.25), y, b.tones[3]);
      }
      for (const [x, y] of [[23, 36], [24, 36], [23, 37], [24, 37]]) set(x, y, shade(b.tie, -0.2));
      for (let y = 38; y < 48; y++) for (let x = 23; x <= 24; x++) set(x, y, x === 24 ? shade(b.tie, -0.2) : b.tie);
      break;
    case 'panuelo': {
      // A sheer pañuelo over the shoulders, folded to a point at the front, its hem trimmed.
      fillPolygon(L, [[5, 42], [12, 37], [19, 35.5], [29, 35.5], [36, 37], [43, 42], [35, 44], [24, 48], [13, 44]], (x) => tone(b.shawl, x / 47));
      for (let x = 5; x <= 43; x++) {
        const y = x < 13 ? 42 + (x - 5) * 0.25 : x < 24 ? 44 + (x - 13) * 0.36 : x < 35 ? 48 - (x - 24) * 0.36 : 44 - (x - 35) * 0.25;
        set(x, Math.round(y), b.trim && x % 3 === 0 ? b.trim : b.shawl[3]);
      }
      fillPolygon(L, [[21, 35.5], [27, 35.5], [24, 40]], () => b.tones[1]);
      break;
    }
    case 'shirt': {
      // A loose white shirt open at the collar.
      fillPolygon(L, [[20, 35], [28, 35], [24, 42]], () => look.skin[1]);
      for (let y = 35; y < 43; y++) {
        set(Math.round(20 + (y - 35) * 0.55), y, b.tones[3]);
        set(Math.round(27 - (y - 35) * 0.55), y, b.tones[3]);
      }
      for (const [x, y] of [[17, 35], [18, 36], [19, 37], [30, 35], [29, 36], [28, 37]]) set(x, y, b.tones[2]);
      break;
    }
    case 'uniform':
      // A buttoned tunic with a standing red collar.
      for (let y = 33; y <= 37; y++) for (let x = 18; x <= 29; x++) set(x, y, y === 33 ? shade(b.collar, 0.2) : x > 26 ? shade(b.collar, -0.25) : b.collar);
      for (let y = 38; y < 48; y++) set(24, y, b.tones[3]);
      for (const y of [40, 43, 46]) set(25, y, b.buttons);
      break;
    case 'scarf':
      // A cream shirt with a grey neckerchief knotted at the throat.
      for (let y = 34; y <= 37; y++) for (let x = 19; x <= 28; x++) set(x, y, y === 34 ? shade(b.scarf, 0.2) : b.scarf);
      for (const [x, y] of [[22, 38], [23, 38], [24, 38], [25, 38], [23, 39], [24, 39], [22, 40], [25, 40], [21, 41], [26, 41]]) set(x, y, shade(b.scarf, -0.15));
      break;
    default:
      throw new Error(`Unknown bust body '${b.kind}'`);
  }
  return outlined(L);
}

function drawNeck(look) {
  const L = layer();
  const [, base, dark] = look.skin;
  for (let y = 31; y <= 38; y++) for (let x = 20; x <= 27; x++) L.set(x, y, y < 35 || x > 25 ? dark : base);
  return outlined(L);
}

// ---- head ----------------------------------------------------------------------------------

function drawHead(look) {
  const L = layer();
  const [light, base, dark] = look.skin;
  for (let y = 0; y < N; y++) {
    const hw = headHalf(look, y);
    if (!hw) continue;
    for (let x = 0; x < N; x++) {
      if (!insideHead(look, x, y)) continue;
      // Lit from the upper left: a shadowed right side, cheeks and jaw, a dark far edge.
      const t = (offset(x) + hw) / (2 * hw);
      let c = light;
      if (t > 0.78 || y > 31 || (y > 27 && (t < 0.12 || t > 0.62))) c = base;
      if (t > 0.94 || (y > 32 && t > 0.6)) c = dark;
      L.set(x, y, c);
    }
  }
  // Ears.
  const w = look.face.w;
  for (const [x0, right] of [[Math.round(CX - w) - 2, false], [Math.round(CX + w), true]]) {
    for (let y = 19; y <= 24; y++) for (let x = x0; x < x0 + 3; x++) {
      const edge = right ? x === x0 + 2 : x === x0;
      if ((y === 19 || y === 24) && edge) continue;
      L.set(x, y, !edge && (y === 21 || y === 22) ? dark : base);
    }
  }
  // The nose: a shaded side and a tip.
  L.set(24, 25, base);
  L.set(24, 26, dark);
  if (look.age === 'old') {
    // Lines under the eyes and beside the mouth.
    for (const x of [16, 17, 30, 31]) L.set(x, 25, base);
    L.set(19, 29, base);
    L.set(28, 29, base);
  }
  return outlined(L);
}

function drawBeard(L, look) {
  const b = look.beard;
  if (!b) return;
  const set = (x, y, c) => insideHead(look, x, y) && L.set(x, y, c);
  const dark = shade(b.color, -0.25);
  if (b.kind === 'stubble') {
    // A shadow of beard along the jaw and chin.
    for (let y = 26; y <= 34; y++) {
      const hw = headHalf(look, y);
      for (let x = 0; x < N; x++) {
        const t = (offset(x) + hw) / (2 * hw);
        if ((t < 0.18 || t > 0.82 || y >= 31) && (x + y) % 2 === 0) set(x, y, b.color);
      }
    }
    return;
  }
  const mustache = b.size === 'big'
    ? [[18, 26, 30], [17, 27, 31], [17, 28, 19], [29, 28, 31]]
    : [[20, 26, 28], [19, 27, 21], [27, 27, 29]];
  if (b.kind === 'full') {
    // Cheeks (below the eyes), jaw and chin, under a mustache.
    for (let y = 25; y <= 34; y++) {
      const hw = headHalf(look, y);
      for (let x = 0; x < N; x++) if (Math.abs(offset(x)) >= hw - 2.5 || y >= 30) set(x, y, (x + y) % 3 === 0 ? dark : b.color);
    }
  }
  for (const [x0, y, x1] of mustache) for (let x = x0; x < x1; x++) set(x, y, y === mustache[0][1] ? shade(b.color, 0.2) : b.color);
}

// ---- hair ----------------------------------------------------------------------------------

function hairMask(look, x, y) {
  const dx = offset(x);
  const ax = Math.abs(dx);
  const w = look.face.w;
  // The skull's outline grown by `vol` px.
  const shell = (vol) => {
    const k = (y + 0.5 - 19.5) / (16 + vol);
    return y <= 19 && ax <= (w + vol) * Math.sqrt(Math.max(0, 1 - k * k));
  };
  const side = (y0, y1, out = 1.5) => ax >= w - 1.5 && ax <= w + out && y >= y0 && y <= y1;
  switch (look.hair.style) {
    case 'tonsure':
      // A shaved crown above a ring of hair: a short band across the brow, longer at the sides.
      return shell(1.5) && y >= 10 && (y <= 11 || (y <= 21 && ax >= w - 3));
    case 'pompadour': {
      // Swept up and back into a tall quiff with two points; short sides.
      const quiff = y >= 1 && y <= 10 && Math.hypot((dx - 1.5) / 12.5, (y - 7) / 6) <= 1;
      const points = (y <= 3 && Math.abs(dx - 5 - (3 - y)) <= 1.2) || (y >= 1 && y <= 3 && Math.abs(dx - 9 - (3 - y)) <= 0.8);
      const line = 10 + Math.min(4, (ax / w) ** 2 * 4) + (dx > -3 && dx < 0 ? 2 : 0);
      return quiff || points || (shell(1.5) && y <= line) || side(8, 18);
    }
    case 'curls': {
      // Centre-parted, falling in ringlets beside the face (the back layer draws the length).
      const line = 8 + Math.min(FRINGE_FLOOR - 8, (ax / 9) ** 2 * 7);
      return (shell(2) && y <= line) || (ax >= w - 1 && ax <= w + 4 && y >= 8 && y <= 30);
    }
    case 'messy':
    case 'spiky': {
      // A fringe falling in points over the brow; messy hair is ruffled on top, spiky stands up.
      const tips = [-9, -5.5, -1.5, 2.5, 6.5, 10].some((c, n) => y >= 10 && Math.abs(dx - c + (y - 10) * (n < 3 ? 0.5 : -0.3)) < 2.2 - (y - 10) * 0.55);
      const cap = shell(1.5) && (y <= 10 || (tips && y <= FRINGE_FLOOR));
      const tops = look.hair.style === 'spiky'
        ? [-8, -3, 2, 7].some((c) => y >= 0 && y <= 5 && Math.abs(dx - c - (5 - y) * 0.4) < (y - 0) * 0.45)
        : y >= 2 && y <= 4 && (Math.abs(dx + 5 - (4 - y)) < 1.4 || Math.abs(dx - 4 - (4 - y)) < 1.4);
      return cap || tops || side(8, look.hair.style === 'spiky' ? 19 : 21, 2);
    }
    case 'long': {
      // Centre-parted and drawn back smooth; the length falls behind the shoulders (back layer).
      const line = 7 + Math.min(FRINGE_FLOOR - 7, (ax / 9) ** 2 * 8);
      return (shell(1.5) && y <= line && ax >= 0.6) || side(8, 28, 2.5);
    }
    case 'bowl': {
      // Cut straight across the brow and round the head, with a little knot at the crown.
      const knot = y >= 1 && y <= 3 && ax <= 2.5 - (y === 1 ? 1 : 0);
      return knot || (shell(1.5) && y <= 13) || side(8, 19);
    }
    case 'short': {
      // Short and neat, parted on the left.
      const part = dx > -5 && dx < -2 ? 1.5 : 0;
      return (shell(1.5) && y <= 11 + part + Math.min(2, (ax / w) ** 2 * 3)) || side(9, 18);
    }
    case 'swept': {
      // Combed straight back from a high brow.
      return (shell(2) && y <= 9 + Math.min(3, (ax / w) ** 2 * 4)) || side(8, 17);
    }
    default:
      throw new Error(`Unknown hair style '${look.hair.style}'`);
  }
}

function backHairMask(look, x, y) {
  const ax = Math.abs(offset(x));
  const w = look.face.w;
  if (look.hair.style === 'long') return y >= 8 && y <= 40 && ax >= w - 1 && ax <= w + 3.5 - Math.max(0, y - 32) * 0.45;
  if (look.hair.style !== 'curls') return false;
  // Ringlets: stacked rounds down each side to the shoulders.
  if (ax < w - 1 || ax > w + 7 || y < 8 || y > 44) return false;
  const ring = (y - 8) % 6;
  return Math.abs(ax - (w + 3)) <= 3.5 - (ring === 0 || ring === 5 ? 1 : 0);
}

function shadeHair(look, L, mask, back = false) {
  const t = look.hair.tones;
  const swept = look.hair.style === 'pompadour' || look.hair.style === 'swept';
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (!mask(x, y)) continue;
    // Lit from the upper left: a shine across the crown, strands below it, the edges in shadow.
    const dx = x - CX;
    let i = dx < 5 ? 1 : 2;
    if (back || y > 18) i = 2;
    const shine = Math.round(5 + (dx / 9) ** 2 * 3);
    if (!back && dx > -9 && dx < 5 && (y === shine || y === shine + 1)) i = 0;
    const strand = swept ? (x + y) % 4 === 0 : x % 3 === 0 && y > shine + 2;
    if (strand && i > 0) i = Math.min(3, i + 1);
    if (!mask(x, y + 1) || dx > look.face.w) i = Math.max(i, 3);
    L.set(x, y, t[i]);
  }
}

function drawHair(look, back) {
  const L = layer();
  shadeHair(look, L, (x, y) => (back ? backHairMask : hairMask)(look, x, y), back);
  return outlined(L);
}

// ---- hats ----------------------------------------------------------------------------------

function drawHat(look) {
  const hat = look.hat;
  if (!hat) return null;
  const L = layer();
  if (hat.kind === 'bonnet') {
    // A straw bonnet framing the face: a brim round the head, a banded crown, a rose and ribbons.
    for (let y = 0; y <= 26; y++) for (let x = 0; x < N; x++) {
      const d = Math.hypot((x + 0.5 - 24) / 16.5, (y + 0.5 - 16) / 16.5);
      const inner = Math.hypot((x + 0.5 - 24) / 14, (y + 0.5 - 17) / 14.5);
      if (d <= 1 && inner >= 1) L.set(x, y, tone(hat.tones, (d - 0.84) / 0.16 + (y > 18 ? 0.3 : 0)));
    }
    for (let y = 1; y <= 8; y++) for (let x = 9; x <= 38; x++) {
      if (Math.hypot((x + 0.5 - 24) / 15, (y + 0.5 - 9) / 8) <= 1) L.set(x, y, y === 7 ? hat.tones[2] : tone(hat.tones, (x - 9) / 29));
    }
    for (let y = 1; y <= 8; y++) for (let x = 12; x <= 20; x++) {
      const d = Math.hypot(x + 0.5 - 16.5, y + 0.5 - 4.5);
      if (d > 4.2) continue;
      L.set(x, y, d < 1.3 ? shade(hat.rose, -0.35) : (x + y) % 3 === 0 ? shade(hat.rose, -0.2) : x < 16 && y < 5 ? shade(hat.rose, 0.25) : hat.rose);
    }
    for (const [x, y] of [[8, 24], [8, 25], [9, 26], [39, 24], [39, 25], [38, 26]]) L.set(x, y, hat.ribbon);
  } else if (hat.kind === 'kepi') {
    // A stiff military cap: a crown narrowing upward, a dark band, a visor, a red badge.
    for (let y = 0; y <= 10; y++) {
      const hw = 10.5 + y * 0.15;
      for (let x = 0; x < N; x++) {
        const t = (offset(x) + hw) / (2 * hw);
        if (t < 0 || t > 1) continue;
        L.set(x, y, y >= 8 ? hat.tones[2] : tone(hat.tones, t));
      }
    }
    for (let y = 11; y <= 12; y++) for (let x = 10; x <= 37; x++) L.set(x, y, y === 11 ? hat.tones[3] : hat.tones[2]);
    for (const [x, y] of [[23, 3], [24, 3], [22, 4], [23, 4], [24, 4], [25, 4], [23, 5], [24, 5]]) L.set(x, y, hat.badge);
  } else if (hat.kind === 'headband') {
    // A cloth band tied round the head, over the hair.
    for (let y = 10; y <= 11; y++) for (let x = 0; x < N; x++) {
      const hw = headHalf(look, y) + 1.5;
      const t = (offset(x) + hw) / (2 * hw);
      if (t >= 0 && t <= 1) L.set(x, y, tone(hat.tones, t));
    }
  } else throw new Error(`Unknown hat '${hat.kind}'`);
  return outlined(L);
}

// ---- the bust ------------------------------------------------------------------------------

export function drawBust(costumeId, feeling = 'neutral') {
  const look = lookFor(costumeId);
  const head = drawHead(look);
  drawBeard(head, look);
  drawFace(head, look, feeling);
  const front = drawHair(look, false);
  // Hair casts a shadow along the forehead.
  for (let y = 1; y < N; y++) for (let x = 0; x < N; x++) {
    if (front.opaque(x, y - 1) && !front.opaque(x, y) && head.get(x, y) === look.skin[0]) head.set(x, y, look.skin[1]);
  }
  const small = layer();
  for (const part of [drawHair(look, true), drawNeck(look), drawBody(look), head, front, drawHat(look)]) if (part) small.blit(part);
  drawFaceOverlay(small, feeling);
  const out = new PixelCanvas(BUST_SIZE, BUST_SIZE);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = small.get(x, y);
    if (c) out.fillRect(x * 2, y * 2, 2, 2, c);
  }
  return out;
}
