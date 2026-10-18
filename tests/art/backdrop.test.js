import { describe, it, expect } from 'vitest';
import { backdropShapes, paintSkyline, paintHills, paintSky, BACKDROP_PX, SKYLINE_HEIGHT } from '../../src/art/backdrop.js';

describe('the painted city', () => {
  it('lays out roofs, trees and landmarks across its stretch, deterministically, with bastions on the wall', () => {
    const shapes = backdropShapes({ x0: -10, x1: 60, seed: 3 });
    expect(backdropShapes({ x0: -10, x1: 60, seed: 3 })).toEqual(shapes);
    const kinds = new Set(shapes.map((s) => s.kind));
    for (const k of ['house', 'church', 'dome', 'bastion']) expect(kinds).toContain(k);
    const along = shapes.filter((s) => s.kind !== 'bastion');
    expect(along[0].x).toBe(-10);
    expect(Math.max(...along.map((s) => s.x + s.w))).toBeGreaterThanOrEqual(60);
    expect(backdropShapes({ x0: -10, x1: 60, seed: 4 })).not.toEqual(shapes);
  });

  it('paints the skyline at its pixel density with the wall solid along the foot and sky left clear', () => {
    const c = paintSkyline({ x0: 0, x1: 40, seed: 7 });
    expect(c.width).toBe(40 * BACKDROP_PX);
    expect(c.height).toBe(SKYLINE_HEIGHT * BACKDROP_PX);
    for (let x = 0; x < c.width; x += 7) expect(c.opaque(x, c.height - 2)).toBe(true);
    expect(c.opaque(0, 0) && c.opaque(c.width - 1, 0)).toBe(false);
    expect(Array.from(paintSkyline({ x0: 0, x1: 40, seed: 7 }).data)).toEqual(Array.from(c.data));
  });

  it('paints hazy hills along the bottom and a sky that brightens toward the horizon', () => {
    const h = paintHills({ width: 64, seed: 1 });
    expect(h.opaque(10, h.height - 1)).toBe(true);
    expect(h.opaque(10, 0)).toBe(false);
    const sky = paintSky({ width: 32, height: 32, seed: 1 });
    const v = (y) => parseInt(sky.get(0, y).slice(1, 3), 16);
    expect(v(31)).toBeGreaterThan(v(0));
  });
});
