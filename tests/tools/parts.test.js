import { describe, it, expect } from 'vitest';
import { wear, propLayers, withParts, recolourOnly } from '../../tools/parts.mjs';

const HAT = { palette: { a: '#111111', b: '#222222' }, views: { front: [{ at: [0, 0], rows: ['ab'] }], right: [{ at: [1, 2], rows: ['a'] }] } };
const BROOM = { palette: { w: '#7a5233', h: '#c68b5e' }, frames: [{ front: [{ at: [0, 0], rows: ['w'] }], right: [{ at: [0, 0], rows: ['h'] }] }, { front: [{ at: [1, 0], rows: ['w'] }], right: [{ at: [1, 0], rows: ['h'] }] }] };

describe('wear', () => {
  it('shifts each view by its offset and carries the palette', () => {
    const w = wear(HAT, { front: [10, 20], right: [3, 4] });
    expect(w.front).toEqual([{ at: [10, 20], rows: ['ab'], palette: HAT.palette }]);
    expect(w.right).toEqual([{ at: [4, 6], rows: ['a'], palette: HAT.palette }]);
    expect(w.back).toBeUndefined();
  });

  it("overrides some of the part's colours", () => {
    const w = wear(HAT, { front: [0, 0] }, { a: '#ff0000' });
    expect(w.front[0].palette).toEqual({ a: '#ff0000', b: '#222222' });
  });

  it('names a view the part lacks', () => {
    expect(() => wear(HAT, { back: [0, 0] })).toThrow("The part has no 'back' view");
  });
});

describe('propLayers', () => {
  it('gives one shifted layer list per frame', () => {
    const frames = propLayers(BROOM, 'front', [5, 6], { h: '#000000' });
    expect(frames).toHaveLength(2);
    expect(frames[1]).toEqual([{ at: [6, 6], rows: ['w'], palette: { w: '#7a5233', h: '#000000' } }]);
  });

  it('names a frame without the view', () => {
    expect(() => propLayers(BROOM, 'back', [0, 0])).toThrow("Prop frame 1 has no 'back' view");
  });
});

describe('withParts and recolourOnly', () => {
  it('appends worn layers after the dress layers, per view', () => {
    const own = { at: [0, 0], rows: ['x'] };
    const d = withParts({ views: { front: [own] }, wear: [wear(HAT, { front: [1, 1], right: [0, 0] })] });
    expect(d.views.front).toEqual([own, { at: [1, 1], rows: ['ab'], palette: HAT.palette }]);
    expect(d.views.right).toHaveLength(1);
  });

  it('leaves a dressing without parts as it is', () => {
    const d = { views: { front: [] } };
    expect(withParts(d)).toBe(d);
  });

  it('keeps only the recolours', () => {
    const d = recolourOnly({ compose: 1, zones: 2, bodyRecolor: 3, recolor: 4, views: 5, wear: 6, activities: 7 });
    expect(d).toEqual({ compose: 1, zones: 2, bodyRecolor: 3, recolor: 4, activities: 7 });
  });
});
