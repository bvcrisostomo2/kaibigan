import { describe, it, expect } from 'vitest';
import {
  cellFor, sheetAnims, sheetRows, drawFrame, drawCharacterSheet, drawPortrait, PROPORTIONS,
  CELL_W, CELL_H, SHEET_COLS, SHEET_ROWS, DIRS, EXPRESSIONS, GESTURES,
} from '../../src/art/characters.js';
import { ACTIVITY_NAMES, ACTIVITY_FRAMES } from '../../src/art/activities.js';
import { COSTUMES } from '../../src/art/costumes.js';

const lowestRow = (c) => {
  for (let y = c.height - 1; y >= 0; y--) for (let x = 0; x < c.width; x++) if (c.opaque(x, y)) return y;
  return -1;
};
const topRow = (c) => {
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (c.opaque(x, y)) return y;
  return -1;
};

describe('cellFor', () => {
  it('maps directions, modes, expressions and gestures to sheet cells', () => {
    expect(cellFor({ dir: 'left', mode: 'walk', frame: 5 })).toEqual({ col: 1, row: 1 });
    expect(cellFor({ dir: 'up', mode: 'idle', frame: 1 })).toEqual({ col: 5, row: 3 });
    expect(cellFor({ expression: 'shock' })).toEqual({ col: 3, row: 4 });
    expect(cellFor({ gesture: 'fan' })).toEqual({ col: 2, row: 5 });
    expect(cellFor({ dir: 'up', mode: 'sit' })).toEqual({ col: 3, row: 6 });
  });

  it('rejects unknown values', () => {
    expect(() => cellFor({ dir: 'north' })).toThrow("Unknown direction 'north'");
    expect(() => cellFor({ mode: 'swim' })).toThrow("Unknown mode 'swim'");
    expect(() => cellFor({ expression: 'wink' })).toThrow("Unknown expression 'wink'");
    expect(() => cellFor({ gesture: 'wave' })).toThrow("Unknown gesture 'wave'");
  });
});

describe('sheetAnims', () => {
  it('names every animation in the procedural sheet', () => {
    const anims = sheetAnims();
    for (const dir of DIRS) {
      expect(anims[`walk_${dir}`]).toHaveLength(4);
      expect(anims[`idle_${dir}`]).toHaveLength(2);
    }
    for (const e of EXPRESSIONS) expect(anims[`expression_${e}`]).toEqual([{ col: EXPRESSIONS.indexOf(e), row: 4 }]);
    for (const g of GESTURES) expect(anims[`gesture_${g}`]).toEqual([{ col: GESTURES.indexOf(g), row: 5 }]);
    DIRS.forEach((dir, col) => expect(anims[`sit_${dir}`]).toEqual([{ col, row: 6 }]));
  });
});

describe('activities (Plan 5a extras at work)', () => {
  const working = Object.entries(COSTUMES).filter(([, c]) => c.activities?.length);

  it('gives each working costume a row per activity: two front frames, two left, two right', () => {
    for (const [id, c] of working) {
      expect(sheetRows(c), id).toBe(SHEET_ROWS + c.activities.length);
      const anims = sheetAnims(c);
      c.activities.forEach((a, i) => {
        for (const [v, dir] of ['down', 'left', 'right'].entries()) {
          expect(anims[`act_${a}_${dir}`], `${id} ${a} ${dir}`).toEqual([0, 1].map((f) => ({ col: v * ACTIVITY_FRAMES + f, row: SHEET_ROWS + i })));
        }
      });
    }
    expect(drawCharacterSheet(COSTUMES.cook).height).toBe(CELL_H * sheetRows(COSTUMES.cook));
    expect(sheetRows(COSTUMES.ibarra)).toBe(SHEET_ROWS); // the cast has none
  });

  it.each(ACTIVITY_NAMES)('draws %s in every view, inside the cell, with the two frames differing', (activity) => {
    const [, costume] = working.find(([, c]) => c.activities.includes(activity)) ?? [null, COSTUMES.maid];
    for (const dir of ['down', 'left', 'right']) {
      const a = drawFrame(costume, { dir, activity, frame: 0 });
      const b = drawFrame(costume, { dir, activity, frame: 1 });
      expect(a.coverage(), dir).toBeGreaterThan(300);
      expect(lowestRow(a), dir).toBeLessThan(CELL_H - 1);
      expect(Array.from(a.data), `${activity} ${dir}`).not.toEqual(Array.from(b.data));
    }
    const left = drawFrame(costume, { dir: 'left', activity, frame: 0 });
    const right = drawFrame(costume, { dir: 'right', activity, frame: 0 });
    for (let y = 0; y < CELL_H; y++) for (let x = 0; x < CELL_W; x++) expect(right.get(x, y)).toBe(left.get(CELL_W - 1 - x, y));
  });

  it('rejects an unknown activity', () => {
    expect(() => drawFrame(COSTUMES.maid, { activity: 'juggle' })).toThrow("Unknown activity 'juggle'");
  });

  it('dresses the household plainly: a headscarf on the cook, the muchacho barefoot', () => {
    expect(COSTUMES.cook.accessories).toContain('headscarf');
    const bare = drawFrame(COSTUMES.cook, { dir: 'down' });
    const hatless = drawFrame({ ...COSTUMES.cook, accessories: ['tapis'] }, { dir: 'down' });
    expect(Array.from(bare.data)).not.toEqual(Array.from(hatless.data));
    expect(COSTUMES.muchacho.colors.shoes).toBe(COSTUMES.muchacho.skin);
  });
});

describe('procedural sprites', () => {
  it('adults are taller than young characters', () => {
    const adultHeight = PROPORTIONS.adult.ankle - PROPORTIONS.adult.headTop;
    const youthHeight = PROPORTIONS.youth.ankle - PROPORTIONS.youth.headTop;
    expect(adultHeight).toBeGreaterThan(youthHeight);
  });

  it.each(Object.keys(COSTUMES))('%s draws every view inside its cell', (id) => {
    for (const dir of DIRS) {
      const c = drawFrame(COSTUMES[id], { dir });
      expect(c.width).toBe(CELL_W);
      expect(c.height).toBe(CELL_H);
      expect(c.coverage()).toBeGreaterThan(300);
      expect(topRow(c)).toBeGreaterThanOrEqual(0);
      expect(lowestRow(c)).toBeLessThan(CELL_H - 1);
    }
  });

  it.each(Object.keys(COSTUMES))('%s sits in every view: lower, with the feet still on the floor', (id) => {
    for (const dir of DIRS) {
      const standing = drawFrame(COSTUMES[id], { dir });
      const seated = drawFrame(COSTUMES[id], { dir, mode: 'sit' });
      expect(seated.coverage()).toBeGreaterThan(300);
      expect(topRow(seated), dir).toBeGreaterThan(topRow(standing));
      expect(Math.abs(lowestRow(seated) - lowestRow(standing)), dir).toBeLessThanOrEqual(1);
    }
    const left = drawFrame(COSTUMES[id], { dir: 'left', mode: 'sit' });
    const right = drawFrame(COSTUMES[id], { dir: 'right', mode: 'sit' });
    for (let y = 0; y < CELL_H; y++) for (let x = 0; x < CELL_W; x++) expect(right.get(x, y)).toBe(left.get(CELL_W - 1 - x, y));
  });

  it('is deterministic', () => {
    const a = drawFrame(COSTUMES.damaso, { dir: 'down', mode: 'walk', frame: 2 });
    const b = drawFrame(COSTUMES.damaso, { dir: 'down', mode: 'walk', frame: 2 });
    expect(Array.from(b.data)).toEqual(Array.from(a.data));
  });

  it('the right view mirrors the left', () => {
    const left = drawFrame(COSTUMES.ibarra, { dir: 'left' });
    const right = drawFrame(COSTUMES.ibarra, { dir: 'right' });
    for (let y = 0; y < CELL_H; y++) for (let x = 0; x < CELL_W; x++) expect(right.get(x, y)).toBe(left.get(CELL_W - 1 - x, y));
  });

  it('builds a full sheet and a pixel portrait', () => {
    const sheet = drawCharacterSheet(COSTUMES.tiago);
    expect(sheet.width).toBe(CELL_W * SHEET_COLS);
    expect(sheet.height).toBe(CELL_H * SHEET_ROWS);
    const portrait = drawPortrait(COSTUMES.tiago, 'smile');
    expect(portrait.width).toBe(64);
    expect(portrait.coverage()).toBeGreaterThan(500);
  });
});
