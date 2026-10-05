import { describe, it, expect } from 'vitest';
import { checkMaps, drawHandmadeFrame, handmadeFrames, drawHandmadeSheet, WALK } from '../../src/art/handmade.js';
import { legRows, LEG_POSES } from '../../src/art/cast/legs.js';
import { ibarra } from '../../src/art/cast/ibarra.js';
import { HANDMADE } from '../../src/art/cast/index.js';
import { CELL_W, CELL_H } from '../../src/art/characters.js';

const lowestRow = (c) => {
  for (let y = c.height - 1; y >= 0; y--) for (let x = 0; x < c.width; x++) if (c.opaque(x, y)) return y;
  return -1;
};

describe('hand-authored maps', () => {
  it('every hand-authored character passes the map checks', () => {
    for (const [id, character] of Object.entries(HANDMADE)) expect(checkMaps(character), id).toEqual([]);
  });

  it('reports ragged rows and unknown palette letters', () => {
    const bad = { palette: { a: '#000000' }, front: { at: [0, 0], rows: ['aa', 'a', 'aZ'] } };
    const problems = checkMaps(bad);
    expect(problems).toContain('front row 1: width 1, expected 2');
    expect(problems).toContain("front row 2: unknown letter 'Z'");
  });

  it('every leg pose is 27 columns wide', () => {
    for (const [view, poses] of Object.entries(LEG_POSES)) {
      for (const pose of Object.keys(poses)) for (const row of legRows(view, pose)) expect(row).toHaveLength(27);
    }
    expect(() => legRows('front', 'cartwheel')).toThrow("No 'cartwheel' legs for the front view");
  });

  it('rejects a view the character does not have', () => {
    expect(() => drawHandmadeFrame({ palette: {} }, { view: 'side' })).toThrow("No 'side' view for this character");
  });
});

describe('hand-authored sheets', () => {
  const frames = handmadeFrames(ibarra);

  it('names idle and walk animations for all four sides', () => {
    for (const dir of ['down', 'up', 'right', 'left']) {
      expect(frames[`idle_${dir}`]).toHaveLength(1);
      expect(frames[`walk_${dir}`]).toHaveLength(WALK.front.length);
    }
  });

  it('the left view mirrors the right', () => {
    const r = frames.walk_right[1];
    const l = frames.walk_left[1];
    for (let y = 0; y < CELL_H; y++) for (let x = 0; x < CELL_W; x++) expect(l.get(x, y)).toBe(r.get(CELL_W - 1 - x, y));
  });

  it('keeps the feet on one baseline while walking', () => {
    const base = lowestRow(frames.idle_down[0]);
    for (const f of frames.walk_down) expect(Math.abs(lowestRow(f) - base)).toBeLessThanOrEqual(2);
  });

  it('packs one animation per row', () => {
    const sheet = drawHandmadeSheet(ibarra);
    expect(sheet.cols).toBe(4);
    expect(sheet.rows).toBe(Object.keys(frames).length);
    expect(sheet.pixels.width).toBe(CELL_W * 4);
    expect(sheet.anims.walk_up).toHaveLength(4);
    expect(sheet.footMargin).toBeGreaterThanOrEqual(0);
  });
});
