// The face system for the busts (Plan 5 spec §4.5): the eyes, brows and mouth each of the nine
// feelings draws, and any extra (a blush, a tear, a drop of sweat). Faces are drawn at the bust's
// 48×48 working size, always at the same places, so hair and hats can be kept clear of them.
import { shade } from './pixel.js';

export const FACE_PARTS = {
  neutral: { eyes: 'open', brows: 'flat', mouth: 'line', extra: null },
  happy: { eyes: 'arc', brows: 'raised', mouth: 'smile', extra: null },
  content: { eyes: 'closed', brows: 'soft', mouth: 'soft_smile', extra: null },
  sad: { eyes: 'sad', brows: 'sad', mouth: 'frown', extra: 'tear' },
  angry: { eyes: 'narrow', brows: 'angry', mouth: 'grit', extra: null },
  annoyed: { eyes: 'half', brows: 'knit', mouth: 'flat', extra: null },
  shocked: { eyes: 'wide', brows: 'high', mouth: 'o', extra: 'sweat' },
  thoughtful: { eyes: 'up', brows: 'one_up', mouth: 'hmm', extra: null },
  embarrassed: { eyes: 'aside', brows: 'worried', mouth: 'wavy', extra: 'blush' },
};

const OUTLINE = '#181410';
const WHITE = '#fbf7ef';
const MOUTH = '#8a2e2a';
const MOUTH_IN = '#5a1414';
const TEETH = '#f4efe6';
const BLUSH = '#ec8a8e';

// Where the face sits on the 48×48 bust.
export const EYE_TOP = 18;
const LEFT_EYE = 16; // the left eye's outer column; the right eye mirrors it about the centre
const RIGHT_EYE = 47 - LEFT_EYE - 3;
const MOUTH_X = 21;
const MOUTH_Y = 28;

// Eye shapes for the left eye (its outer corner on the left). The right eye mirrors it unless the
// shape gives its own `right` (eyes that look the same way rather than apart).
// L lash · U upper iris · I iris · H catch-light · W white · S lid (skin shadow)
const EYES = {
  open: { y: 0, left: ['LLLL', 'UHHU', 'UHUU', 'UUUU', 'IIII', '.II.'] },
  wide: { y: -1, left: ['.LL.', 'LWWL', 'WUUW', 'WUHW', 'WWWW', '.WW.', '.LL.'] },
  arc: { y: 1, left: ['.LL.', 'L..L', 'L..L'] },
  closed: { y: 2, left: ['L..L', '.LL.'] },
  sad: { y: 0, left: ['..LL', 'LLUU', 'UHHU', 'UUUU', 'IIII', '.II.'] },
  narrow: { y: 1, left: ['LL..', 'ULLL', 'UHHU', 'IIII', '.II.'] },
  half: { y: 1, left: ['SSSS', 'LLLL', 'UHUU', 'IIII', '.II.'] },
  up: { y: 0, left: ['LLLL', 'UHUW', 'UUUW', 'IIIW', 'WWWW', '.WW.'], right: ['LLLL', 'UHUW', 'UUUW', 'IIIW', 'WWWW', '.WW.'] },
  aside: { y: 0, left: ['LLLL', 'UHUW', 'UUUW', 'UUUW', 'IIIW', '.II.'], right: ['LLLL', 'UHUW', 'UUUW', 'UUUW', 'IIIW', '.II.'] },
};
const OPEN_LASH = ['open', 'sad', 'aside', 'up'];
const mirror = (rows) => rows.map((r) => [...r].reverse().join(''));

// Brows: [left outer row, left inner row] (the right mirrors unless given), five pixels long.
const BROWS = {
  flat: [15.5, 15.5], soft: [15.5, 16], raised: [14.5, 14.5], high: [13.5, 13.5], sad: [16.5, 14],
  worried: [16, 14.5], angry: [14, 16.5], knit: [16, 16.5], one_up: [14, 14, 16, 16],
};

// Mouths: [dx from MOUTH_X, dy from MOUTH_Y, colour], drawn in order (later pixels win).
const MOUTHS = {
  line: [[2, 0, 'm'], [3, 0, 'm'], [4, 0, 'm']],
  soft_smile: [[1, 0, 'm'], [2, 1, 'm'], [3, 1, 'm'], [4, 1, 'm'], [5, 0, 'm']],
  smile: [[0, 0, 'm'], [1, 0, 'm'], [2, 0, 'm'], [3, 0, 'm'], [4, 0, 'm'], [5, 0, 'm'], [1, 1, 'i'], [4, 1, 'i'], [2, 1, 't'], [3, 1, 't'], [1, 2, 'm'], [2, 2, 'i'], [3, 2, 'i'], [4, 2, 'm'], [2, 3, 'm'], [3, 3, 'm']],
  frown: [[1, 1, 'm'], [2, 0, 'm'], [3, 0, 'm'], [4, 0, 'm'], [5, 1, 'm']],
  grit: [[0, 0, 'm'], [1, 0, 'm'], [2, 0, 'm'], [3, 0, 'm'], [4, 0, 'm'], [5, 0, 'm'], [0, 1, 'm'], [1, 1, 't'], [2, 1, 't'], [3, 1, 't'], [4, 1, 't'], [5, 1, 'm'], [1, 2, 'm'], [2, 2, 'm'], [3, 2, 'm'], [4, 2, 'm']],
  flat: [[2, 0, 'm'], [3, 0, 'm'], [4, 0, 'm'], [5, 0, 'm'], [6, 1, 'm']],
  o: [[2, -1, 'm'], [3, -1, 'm'], [1, 0, 'm'], [2, 0, 'i'], [3, 0, 'i'], [4, 0, 'm'], [1, 1, 'm'], [2, 1, 'i'], [3, 1, 'i'], [4, 1, 'm'], [2, 2, 'm'], [3, 2, 'm']],
  hmm: [[4, 0, 'm'], [5, 0, 'm'], [6, -1, 'm']],
  wavy: [[0, 1, 'm'], [1, 0, 'm'], [2, 1, 'm'], [3, 0, 'm'], [4, 1, 'm'], [5, 0, 'm']],
};

function drawEyes(L, look, kind) {
  const e = EYES[kind];
  const col = { L: OUTLINE, U: shade(look.iris, -0.5), I: look.iris, H: WHITE, W: WHITE, S: look.skin[1] };
  const paint = (rows, x0) => rows.forEach((row, j) => [...row].forEach((ch, i) => ch !== '.' && L.set(x0 + i, EYE_TOP + e.y + j, col[ch])));
  paint(e.left, LEFT_EYE);
  paint(e.right ?? mirror(e.left), RIGHT_EYE);
  // The outer corner's lash flicks out (always, for long lashes).
  if (OPEN_LASH.includes(kind) || look.lashes) {
    const y = EYE_TOP + e.y + (look.lashes ? 0 : 1);
    L.set(LEFT_EYE - 1, y, OUTLINE);
    L.set(RIGHT_EYE + 4, y, OUTLINE);
  }
}

function drawBrows(L, look, kind) {
  const [lo, li, ro = lo, ri = li] = BROWS[kind];
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const ly = Math.round(lo + (li - lo) * t);
    const ry = Math.round(ro + (ri - ro) * t);
    L.set(LEFT_EYE - 1 + i, ly, look.brow);
    L.set(RIGHT_EYE + 4 - i, ry, look.brow);
    // The old have bushy brows: a second row over the outer four pixels.
    if (look.age === 'old' && i < 4) {
      L.set(LEFT_EYE - 1 + i, ly - 1, look.brow);
      L.set(RIGHT_EYE + 4 - i, ry - 1, look.brow);
    }
  }
}

function drawMouth(L, kind) {
  const c = { m: MOUTH, i: MOUTH_IN, t: TEETH };
  for (const [dx, dy, k] of MOUTHS[kind]) L.set(MOUTH_X + dx, MOUTH_Y + dy, c[k]);
}

function drawExtra(L, look, extra) {
  if (extra === 'blush' || look.rouge) {
    for (const x of [15, 16, 17, 30, 31, 32]) L.set(x, 25, BLUSH);
    if (extra === 'blush') for (const x of [16, 17, 30, 31]) L.set(x, 26, shade(BLUSH, 0.15));
  }
  if (extra === 'tear') for (const [x, y] of [[16, 24], [16, 25], [15, 26]]) L.set(x, y, '#9ad4f0');
}

// What a feeling draws over everything else (hair included): a drop of sweat by the temple.
export function drawFaceOverlay(L, feeling) {
  if (FACE_PARTS[feeling]?.extra !== 'sweat') return;
  for (const [x, y] of [[36, 12], [36, 13], [35, 14], [36, 14], [37, 14], [35, 15], [36, 15], [37, 15], [36, 16]]) L.set(x, y, y === 16 || x === 37 ? '#5aa0d0' : '#bfe6ff');
  L.set(35, 15, '#ffffff');
}

// Draw a feeling's face onto a bust's head layer (48×48). The mouth goes first so a beard drawn
// before it never hides it; the eyes and brows last.
export function drawFace(L, look, feeling) {
  const parts = FACE_PARTS[feeling];
  if (!parts) throw new Error(`Unknown feeling '${feeling}'`);
  drawMouth(L, parts.mouth);
  drawExtra(L, look, parts.extra);
  drawEyes(L, look, parts.eyes);
  drawBrows(L, look, parts.brows);
}
