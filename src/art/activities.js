// Activities for extras (Plan 5 spec §3.5): short looping poses with the object in hand, drawn in
// the front view ('down') and the 3/4 side view ('side', facing left; right is mirrored). Each
// activity gives, per frame, where the hands go (cell pixels) and draws its object on a layer.
// The rig `r` comes from art/characters.js: cx, shoulderY, waistY, hipY, headTop.
import { PixelCanvas } from './pixel.js';

export const ACTIVITY_FRAMES = 2;
const OUT = '#181410';

const WOOD = '#7a5233';
const STRAW = '#c9a25a';

function layer(draw) {
  const L = new PixelCanvas(48, 64);
  draw(L);
  return L.outline(OUT);
}

// A thick line (w pixels) between two points.
function bar(L, [x0, y0], [x1, y1], hex, w = 1) {
  for (let o = 0; o < w; o++) L.line(Math.round(x0 + o), Math.round(y0), Math.round(x1 + o), Math.round(y1), hex);
}

// A point t of the way along a line.
const along = ([x0, y0], [x1, y1], t) => [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];

export const ACTIVITIES = {
  // Sweeping with a long-handled broom, the head swinging side to side.
  sweep(f, view, r) {
    const swing = f ? 4 : -4;
    const top = view === 'side' ? [r.cx + 3, r.shoulderY + 3] : [r.cx + 5, r.shoulderY + 4];
    const foot = view === 'side' ? [r.cx - 7 + swing / 2, 59] : [r.cx - 2 + swing, 59];
    return {
      hands: { right: along(top, foot, 0.25), left: along(top, foot, 0.5) },
      object: layer((L) => {
        bar(L, top, foot, WOOD);
        L.fillRect(Math.round(foot[0]) - 3, 57, 7, 4, STRAW);
        L.line(Math.round(foot[0]) - 3, 61, Math.round(foot[0]) + 3, 61, '#a07a3a');
      }),
    };
  },
  // Fanning herself, the fan beating at the chin.
  fan(f, view, r) {
    const hx = view === 'side' ? r.cx - 4 : r.cx + 4;
    const hy = r.shoulderY - 2 + (f ? 1 : -1);
    return {
      hands: { right: [hx, hy] },
      object: layer((L) => {
        for (let rad = 0; rad <= 6; rad++) {
          for (let a = 0; a <= 10; a++) {
            const ang = Math.PI * ((f ? 1.15 : 1.3) + (a / 10) * 0.7);
            L.set(Math.round(hx + Math.cos(ang) * rad), Math.round(hy + Math.sin(ang) * rad), a % 3 === 0 ? '#b88a2a' : '#f0c75e');
          }
        }
      }),
      over: true,
    };
  },
  // Talking with a hand raised, palm open, then lowered.
  chat(f, view, r) {
    const hx = view === 'side' ? r.cx - 6 : r.cx + 7;
    return { hands: { right: [hx, f ? r.shoulderY + 4 : r.shoulderY + 9] } };
  },
  // Strumming a guitar held across the body.
  strum(f, view, r) {
    const body = [r.cx + 2, r.waistY + 1];
    return {
      hands: { right: [body[0] + 1, body[1] + (f ? -2 : 2)], left: [r.cx - 9, r.shoulderY + 7] },
      object: layer((L) => {
        L.ellipse(body[0] - 4, body[1] - 4, body[0] + 4, body[1] + 4, '#a8702e');
        L.ellipse(body[0] - 1, body[1] - 1, body[0] + 1, body[1] + 1, '#3a2414');
        bar(L, [body[0] - 4, body[1] - 2], [r.cx - 11, r.shoulderY + 5], '#6b4520', 2);
      }),
    };
  },
  // Playing the violin at the left shoulder, the bow drawn back and forth.
  bow(f, view, r) {
    const chin = [r.cx - 4, r.shoulderY + 1];
    const bowHand = [r.cx + (f ? 9 : 3), r.shoulderY + 5];
    return {
      hands: { left: [r.cx - 10, r.shoulderY + 2], right: bowHand },
      object: layer((L) => {
        L.ellipse(chin[0] - 4, chin[1], chin[0] + 2, chin[1] + 4, '#7a3a1a');
        bar(L, [chin[0] - 4, chin[1] + 1], [r.cx - 11, r.shoulderY + 1], '#3a2010');
        L.line(bowHand[0] - 9, bowHand[1] - 3, bowHand[0] + 2, bowHand[1] + 1, '#e8dcb8');
      }),
      over: true,
    };
  },
  // Plucking a harp standing beside her.
  pluck(f, view, r) {
    const x = r.cx + 9;
    return {
      hands: { right: [x - 2, r.shoulderY + (f ? 6 : 10)], left: [x - 4, r.shoulderY + (f ? 11 : 7)] },
      object: layer((L) => {
        bar(L, [x + 4, r.shoulderY - 8], [x + 4, 60], '#a07a3a', 2);
        bar(L, [x + 4, r.shoulderY - 8], [x - 5, r.shoulderY - 2], '#a07a3a', 2);
        bar(L, [x - 5, r.shoulderY - 2], [x - 1, 60], '#a07a3a');
        for (let i = 0; i < 4; i++) L.line(x - 3 + i * 2, r.shoulderY - 3, x - 3 + i * 2, 56, '#efe4c4');
      }),
    };
  },
  // Stirring a pot with a ladle.
  stir(f, view, r) {
    const pot = view === 'side' ? [r.cx - 8, r.hipY - 1] : [r.cx, r.hipY + 2];
    const hand = [pot[0] + (f ? 2 : -2), pot[1] - 7];
    return {
      hands: { right: hand, left: [pot[0] + (view === 'side' ? 3 : -6), pot[1] - 2] },
      object: layer((L) => {
        L.ellipse(pot[0] - 5, pot[1] - 2, pot[0] + 5, pot[1] + 4, '#3a2a20');
        L.line(pot[0] - 4, pot[1] - 2, pot[0] + 4, pot[1] - 2, '#b06a3a');
        bar(L, hand, [pot[0] + (f ? -1 : 1), pot[1]], '#5a4a3a');
      }),
      over: true,
    };
  },
  // Chopping on a board: the knife up, then down.
  chop(f, view, r) {
    const board = view === 'side' ? [r.cx - 9, r.hipY - 2] : [r.cx, r.hipY - 1];
    const hand = [board[0] + 3, board[1] - (f ? 8 : 2)];
    return {
      hands: { right: hand, left: [board[0] - 4, board[1] - 1] },
      object: layer((L) => {
        L.fillRect(board[0] - 6, board[1], 12, 2, '#a07850');
        L.line(hand[0], hand[1] + 1, hand[0] - 3, hand[1] + 5, '#c0c4c8');
      }),
      over: true,
    };
  },
  // Carrying a sack on the shoulder (between loads).
  carry(f, view, r) {
    const sack = [r.cx + (view === 'side' ? 5 : 10), r.shoulderY - 1 + (f ? 1 : 0)];
    return {
      hands: { right: [sack[0] + 2, sack[1] + 1] },
      object: layer((L) => {
        L.ellipse(sack[0] - 5, sack[1] - 3, sack[0] + 4, sack[1] + 3, '#c9b48a');
        L.line(sack[0] - 3, sack[1] - 3, sack[0] - 1, sack[1] - 4, '#8a7a5a');
      }),
      over: true,
    };
  },
  // Polishing with a cloth, rubbing to and fro.
  polish(f, view, r) {
    const hand = view === 'side' ? [r.cx - 10 + (f ? 2 : -1), r.waistY + 2] : [r.cx + (f ? 9 : 5), r.waistY + 3];
    return {
      hands: { right: hand },
      object: layer((L) => L.fillRect(Math.round(hand[0]) - 2, Math.round(hand[1]) + 1, 4, 3, '#e6e0d0')),
      over: true,
    };
  },
  // Washing clothes: bent over, the cloth scrubbed up and down.
  wash(f, view, r) {
    const y = r.hipY + 6 + (f ? 0 : 3);
    const x = view === 'side' ? r.cx - 8 : r.cx;
    return {
      hands: { right: [x + 2, y], left: [x - 3, y] },
      object: layer((L) => {
        L.fillRect(x - 5, y + 2, 10, 3, '#dfe6ec');
        L.line(x - 5, y + 5, x + 5, y + 5, '#9fb4c4');
      }),
      over: true,
      bob: 2,
    };
  },
  // Poling a banca: a long pole pushed down and back.
  pole(f, view, r) {
    const top = [r.cx + (f ? 7 : 4), r.headTop - 2];
    const foot = [r.cx - (f ? 10 : 6), 61];
    return {
      hands: { right: along(top, foot, 0.32), left: along(top, foot, 0.52) },
      object: layer((L) => bar(L, top, foot, '#8a6a3c')),
    };
  },
  // Dozing: eyes closed, head nodding.
  doze(f) {
    return { closed: true, bob: f ? 1 : 0 };
  },
  // Dusting with a feather duster, flicking side to side.
  dust(f, view, r) {
    const hand = [r.cx + (f ? 10 : 5), r.shoulderY + 3];
    return {
      hands: { right: hand },
      object: layer((L) => {
        bar(L, hand, [hand[0] + 2, hand[1] - 6], WOOD);
        L.ellipse(hand[0] + 1, hand[1] - 11, hand[0] + 5, hand[1] - 6, '#d0b080');
      }),
      over: true,
    };
  },
};

export const ACTIVITY_NAMES = Object.keys(ACTIVITIES);
