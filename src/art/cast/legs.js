// Hand-authored legs, recoloured per character through palette letters:
// r/t/T trousers (light → dark), j pinstripe (map to t for plain cloth), B/b/v boots, Z boot
// shine, N sole, o outline. Rows start at the hip line (hipY); 27 columns, the same grid as
// the upper-body maps (cell x 10..36).
//
// A leg is a hand-drawn 6-pixel strip laid from hip → knee → ankle, then a hand-drawn boot.
// Poses only say where those three points sit, so every walk frame keeps the same drawing.
export const HIP_Y = 38;
const LEG_ROWS = 17; // hip to ankle
const KNEE_ROW = 8;
const WIDTH = 27;

const STRIP = { near: 'orjtTo', far: 'otjtTo' };
const CUFF = 'oTTTTo';
// Boots as [x offset from the strip, row]. Front boots turn their toes outward; side boots
// point right (the walking direction); back boots show the heels.
const BOOTS = {
  frontL: [[0, 'oBbbvo'], [0, 'oZBbvo'], [-1, 'oBZbbvo'], [-1, 'oNNNNNo'], [-1, 'ooooooo']],
  frontR: [[0, 'oBbbvo'], [0, 'oZBbvo'], [0, 'oZbbbvo'], [0, 'oNNNNNo'], [0, 'ooooooo']],
  side: [[0, 'oBbbvo'], [0, 'oZBbvo'], [0, 'oBZbbvo'], [0, 'oNNNNNNo'], [0, 'oooooooo']],
  back: [[0, 'oBbbbo'], [0, 'obBbvo'], [0, 'obbbbvo'], [0, 'oNNNNNo'], [0, 'ooooooo']],
};

// Leg poses: { hip, knee, ankle } are the strip's left column at those rows; lift raises the foot.
export const LEG_POSES = {
  front: {
    idle: [{ hip: 7, knee: 7, ankle: 7 }, { hip: 14, knee: 14, ankle: 14 }],
    stepL: [{ hip: 7, knee: 7, ankle: 7 }, { hip: 14, knee: 14, ankle: 13, lift: 2 }],
    stepR: [{ hip: 7, knee: 7, ankle: 8, lift: 2 }, { hip: 14, knee: 14, ankle: 14 }],
  },
  // 3/4 facing right: [far leg, near leg] — the near leg is drawn last, in front.
  side: {
    idle: [{ hip: 15, knee: 15, ankle: 15 }, { hip: 8, knee: 8, ankle: 8 }],
    strideA: [{ hip: 15, knee: 13, ankle: 11, lift: 1 }, { hip: 8, knee: 10, ankle: 13 }],
    strideB: [{ hip: 15, knee: 16, ankle: 18 }, { hip: 8, knee: 7, ankle: 5, lift: 1 }],
  },
};
LEG_POSES.back = LEG_POSES.front;

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

// Rows (27 wide) for one leg pose in a view (pure).
export function legRows(view, pose) {
  const legs = LEG_POSES[view]?.[pose];
  if (!legs) throw new Error(`No '${pose}' legs for the ${view} view`);
  const grid = Array.from({ length: LEG_ROWS + 6 }, () => Array(WIDTH).fill('.'));
  const put = (x, y, s) => {
    for (let i = 0; i < s.length; i++) if (s[i] !== '.' && x + i >= 0 && x + i < WIDTH && y >= 0 && y < grid.length) grid[y][x + i] = s[i];
  };
  legs.forEach((leg, n) => {
    const lift = leg.lift ?? 0;
    const strip = view === 'side' && n === 0 ? STRIP.far : STRIP.near;
    const len = LEG_ROWS - lift;
    for (let y = 0; y < len; y++) {
      const x = y <= KNEE_ROW ? lerp(leg.hip, leg.knee, y / KNEE_ROW) : lerp(leg.knee, leg.ankle, (y - KNEE_ROW) / (len - 1 - KNEE_ROW));
      put(x, y, strip);
    }
    put(leg.ankle, len, CUFF);
    const boot = view === 'side' ? BOOTS.side : view === 'back' ? BOOTS.back : n === 0 ? BOOTS.frontL : BOOTS.frontR;
    boot.forEach(([dx, s], i) => put(leg.ankle + dx, len + 1 + i, s));
  });
  // The thighs meet at the crotch (seen through the parted coat skirts).
  const [l, r] = [...legs].sort((a, b) => a.hip - b.hip);
  for (let y = 0; y < KNEE_ROW; y++) for (let x = l.hip + 5; x <= r.hip; x++) grid[y][x] = 'T';
  return grid.map((row) => row.join(''));
}
