import { describe, it, expect } from 'vitest';
import { createCollision, stairHeight, stairFloorOverlaps, STEP } from '../../src/engine/collision.js';

// Street (y 0) south of a house; a stair ramp climbs north to an upper floor (y 3).
const level = {
  floors: [
    { x: 0, z: 6, w: 10, d: 4, y: 0 }, // street
    { x: 0, z: 0, w: 10, d: 4, y: 3 }, // upper floor
    { x: 0, z: 0, w: 3, d: 4, y: 0 }, // ground-floor hall under the upper floor
  ],
  stairs: [{ x: 4, z: 4, w: 2, d: 2, y0: 0, y1: 3, dir: 'n' }],
  blockers: [
    { x: 7, z: 1, w: 2, d: 1, y0: 3, y1: 4 }, // a table upstairs
    { x: 1, z: 7, w: 1, d: 1, y0: 0, y1: 2 }, // a crate on the street
  ],
  zones: { sala: { x: 0, z: 0, w: 10, d: 4, y0: 2, y1: 6 }, street: { x: 0, z: 6, w: 10, d: 4 } },
};

describe('stairHeight', () => {
  it('interpolates toward the high side', () => {
    const s = level.stairs[0];
    expect(stairHeight(s, 5, 6)).toBe(0);
    expect(stairHeight(s, 5, 5)).toBe(1.5);
    expect(stairHeight(s, 5, 4)).toBe(3);
  });

  it.each([
    ['s', 0, 3],
    ['e', 0, 3],
    ['w', 3, 0],
  ])('dir %s', (dir, atStart, atEnd) => {
    const s = { x: 0, z: 0, w: 2, d: 2, y0: 0, y1: 3, dir };
    const [x0, z0, x1, z1] = dir === 's' ? [1, 0, 1, 2] : [0, 1, 2, 1];
    expect(stairHeight(s, x0, z0)).toBe(atStart);
    expect(stairHeight(s, x1, z1)).toBe(atEnd);
  });

  it('rejects a bad direction', () => {
    expect(() => stairHeight({ x: 0, z: 0, w: 1, d: 1, y0: 0, y1: 1, dir: 'up' }, 0, 0)).toThrow("Bad stair dir 'up'");
  });
});

describe('createCollision', () => {
  const col = createCollision(level);

  it('finds the floor height reachable from the current height', () => {
    expect(col.heightAt(1, 1, 0)).toBe(0); // hall, from the ground
    expect(col.heightAt(1, 1, 3)).toBe(3); // same x/z upstairs
    expect(col.heightAt(5, 8, 0)).toBe(0);
    expect(col.heightAt(20, 20, 0)).toBe(null); // nowhere
  });

  it('cannot jump between floors that are too far apart', () => {
    expect(col.heightAt(8, 1, 0)).toBe(null); // upstairs only, at y 3
  });

  it('walks up the stairs in small steps', () => {
    let pos = { x: 5, y: 0, z: 6.5 };
    for (let i = 0; i < 40; i++) pos = col.move(pos, 0, -0.1);
    expect(pos.y).toBe(3);
    expect(pos.z).toBeLessThan(4);
  });

  it('blocks furniture only on its own floor', () => {
    expect(col.blocked(8, 1.5, 3)).toBe(true);
    expect(col.blocked(8, 1.5, 0)).toBe(false);
    expect(col.blocked(1.5, 7.5, 0)).toBe(true);
  });

  it('stops at blockers and slides along them', () => {
    const start = { x: 0.6, y: 0, z: 7.5 };
    expect(col.canStand(start.x, start.z, 0)).toBe(true);
    const moved = col.move(start, 0.3, 0.1); // the crate is east: x blocked, z slides
    expect(moved.x).toBe(0.6);
    expect(moved.z).toBeCloseTo(7.6);
  });

  it('stays put when every direction is blocked', () => {
    const pos = { x: 9.9, y: 0, z: 9.9 };
    expect(col.move(pos, 1, 1)).toEqual(pos);
  });

  it('reports standing positions', () => {
    expect(col.canStand(5, 8, 0)).toBe(true);
    expect(col.canStand(1.5, 7.5, 0)).toBe(false);
  });

  it('reports zones, honouring y ranges', () => {
    expect(col.zonesAt(5, 2, 3)).toEqual(['sala']);
    expect(col.zonesAt(5, 2, 0)).toEqual([]);
    expect(col.zonesAt(5, 8, 0)).toEqual(['street']);
  });

  it('keeps the step limit small enough to stop climbing walls', () => {
    expect(STEP).toBeLessThan(1);
  });
});

describe('stairFloorOverlaps', () => {
  it("finds floors at a stair's base or top height that overlap its ramp", () => {
    const stair = { x: 4, z: 4, w: 2, d: 2, y0: 0, y1: 3, dir: 'n' };
    const base = { x: 3, z: 5, w: 4, d: 4, y: 0 };
    const top = { x: 0, z: 0, w: 10, d: 4.5, y: 3 };
    const clear = { x: 0, z: 0, w: 10, d: 4, y: 3 };
    const other = { x: 4, z: 4, w: 2, d: 2, y: 1.5 };
    expect(stairFloorOverlaps({ floors: [base, top, clear, other], stairs: [stair] })).toEqual([
      { floor: base, stair, end: 'base' },
      { floor: top, stair, end: 'top' },
    ]);
    expect(stairFloorOverlaps(level)).toEqual([]);
    expect(stairFloorOverlaps({})).toEqual([]);
  });

  it('shows why: a top-height floor over the ramp blocks the way down', () => {
    const stair = { x: 4, z: 4, w: 2, d: 2, y0: 0, y1: 3, dir: 'n' };
    const col = createCollision({ floors: [{ x: 0, z: 0, w: 10, d: 4.5, y: 3 }, { x: 0, z: 6, w: 10, d: 4, y: 0 }], stairs: [stair] });
    let pos = { x: 5, y: 3, z: 3 };
    for (let i = 0; i < 40; i++) pos = col.move(pos, 0, 0.1);
    expect(pos.y).toBe(3);
  });
});
