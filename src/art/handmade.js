// Renders hand-authored characters (art/cast/*.js) into 48×64 cells and sprite sheets.
// A character provides palette-letter maps per view (front, side = 3/4 facing right, back),
// optional swinging arm layers for the side view, and a leg style (art/cast/legs.js).
import { PixelCanvas } from './pixel.js';
import { CELL_W, CELL_H } from './characters.js';
import { HIP_Y, LEG_POSES, legRows } from './cast/legs.js';

export const VIEWS = ['front', 'side', 'back'];

// Walk cycles per view: four frames, the body dipping a pixel on the stride frames.
// Side arms: A = near arm back / far arm forward (near leg striding), B = the reverse.
export const WALK = {
  front: [{ legs: 'idle' }, { legs: 'stepL', bob: 1 }, { legs: 'idle' }, { legs: 'stepR', bob: 1 }],
  side: [{ legs: 'idle', arms: 'idle' }, { legs: 'strideA', arms: 'A', bob: 1 }, { legs: 'idle', arms: 'idle' }, { legs: 'strideB', arms: 'B', bob: 1 }],
  back: [{ legs: 'idle' }, { legs: 'stepL', bob: 1 }, { legs: 'idle' }, { legs: 'stepR', bob: 1 }],
};
const ARM_POSES = { idle: { near: 'idle', far: 'idle' }, A: { near: 'back', far: 'fwd' }, B: { near: 'fwd', far: 'back' } };

// Problems with a character's maps (pure): ragged rows, unknown palette letters.
export function checkMaps(character) {
  const problems = [];
  const check = (label, rows) => {
    const width = rows[0]?.length ?? 0;
    rows.forEach((row, i) => {
      if (row.length !== width) problems.push(`${label} row ${i}: width ${row.length}, expected ${width}`);
      for (const ch of row) if (ch !== '.' && !(ch in character.palette)) problems.push(`${label} row ${i}: unknown letter '${ch}'`);
    });
  };
  for (const view of VIEWS) {
    const map = character[view];
    if (!map) continue;
    check(view, map.rows);
    for (const [side, poses] of Object.entries(map.arms ?? {})) for (const [pose, arm] of Object.entries(poses)) check(`${view}.arms.${side}.${pose}`, arm.rows);
  }
  for (const [view, poses] of Object.entries(LEG_POSES)) for (const pose of Object.keys(poses)) check(`legs.${view}.${pose}`, legRows(view, pose));
  return problems;
}

function paint(canvas, rows, [x0, y0], palette) {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '.') continue;
      canvas.set(x0 + i, y0 + j, palette[ch]);
    }
  });
}

// One frame: legs, far arm, body, near arm (bob shifts everything above the legs).
export function drawHandmadeFrame(character, { view = 'front', legs = 'idle', bob = 0, arms = 'idle' } = {}) {
  const map = character[view];
  if (!map) throw new Error(`No '${view}' view for this character`);
  const c = new PixelCanvas(CELL_W, CELL_H);
  const [mx, my] = map.at;
  paint(c, legRows(view, legs), [mx, HIP_Y], character.palette);
  const armLayer = (side) => {
    const arm = map.arms?.[side]?.[ARM_POSES[arms][side]];
    if (arm) paint(c, arm.rows, [mx + arm.at[0], my + arm.at[1] + bob], character.palette);
  };
  armLayer('far');
  paint(c, map.rows, [mx, my + bob], character.palette);
  armLayer('near');
  return c;
}

function mirrored(src) {
  const out = new PixelCanvas(src.width, src.height);
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      const i = (y * src.width + x) * 4;
      out.data.set(src.data.subarray(i, i + 4), (y * src.width + (src.width - 1 - x)) * 4);
    }
  }
  return out;
}

// Every frame as { anim: [canvas, ...] }: idle_ and walk_ for down, up, right and left (left
// mirrors the 3/4 right view).
export function handmadeFrames(character) {
  const sets = { down: 'front', up: 'back', right: 'side' };
  const anims = {};
  for (const [dir, view] of Object.entries(sets)) {
    if (!character[view]) continue;
    anims[`idle_${dir}`] = [drawHandmadeFrame(character, { view, ...WALK[view][0] })];
    anims[`walk_${dir}`] = WALK[view].map((f) => drawHandmadeFrame(character, { view, ...f }));
  }
  if (anims.idle_right) {
    anims.idle_left = anims.idle_right.map(mirrored);
    anims.walk_left = anims.walk_right.map(mirrored);
  }
  return anims;
}

// A packed sheet: one animation per row. Returns { pixels, cols, rows, footMargin, anims }
// with anims mapping names to { col, row } cells.
export function drawHandmadeSheet(character) {
  const frames = handmadeFrames(character);
  const names = Object.keys(frames);
  const cols = Math.max(...names.map((n) => frames[n].length));
  const pixels = new PixelCanvas(CELL_W * cols, CELL_H * names.length);
  const anims = {};
  let bottom = 0;
  names.forEach((name, row) => {
    anims[name] = frames[name].map((f, col) => {
      for (let y = 0; y < CELL_H; y++) {
        for (let x = 0; x < CELL_W; x++) {
          const i = (y * CELL_W + x) * 4;
          if (!f.data[i + 3]) continue;
          bottom = Math.max(bottom, y);
          pixels.data.set(f.data.subarray(i, i + 4), ((row * CELL_H + y) * pixels.width + col * CELL_W + x) * 4);
        }
      }
      return { col, row };
    });
  });
  return { pixels, cols, rows: names.length, footMargin: CELL_H - 1 - bottom, anims };
}
