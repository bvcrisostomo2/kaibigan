import { describe, it, expect } from 'vitest';
import { parseHex, toHex, shade, ramp, rng, PixelCanvas } from '../../src/art/pixel.js';

describe('colour helpers', () => {
  it('parses and formats hex colours', () => {
    expect(parseHex('#ff8000')).toEqual([255, 128, 0]);
    expect(toHex([255, 128, 0])).toBe('#ff8000');
    expect(toHex([300, -5, 12.6])).toBe('#ff000d');
    expect(() => parseHex('red')).toThrow("Bad color 'red'");
  });

  it('shades toward white or black', () => {
    expect(shade('#808080', 1)).toBe('#ffffff');
    expect(shade('#808080', -1)).toBe('#000000');
    expect(shade('#808080', 0)).toBe('#808080');
    expect(ramp('#808080')).toHaveLength(3);
    expect(ramp('#808080')[1]).toBe('#808080');
  });

  it('rng is deterministic per seed', () => {
    const a = rng(7);
    const b = rng(7);
    const c = rng(8);
    const seqA = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(seqA);
    expect([c(), c(), c()]).not.toEqual(seqA);
    for (const v of seqA) expect(v >= 0 && v < 1).toBe(true);
  });
});

describe('PixelCanvas', () => {
  it('sets, gets and clears pixels; ignores out-of-range writes', () => {
    const c = new PixelCanvas(4, 3);
    c.set(1, 2, '#102030');
    expect(c.get(1, 2)).toBe('#102030');
    expect(c.opaque(1, 2)).toBe(true);
    c.set(1, 2, null);
    expect(c.get(1, 2)).toBe(null);
    c.set(9, 9, '#ffffff');
    expect(c.get(9, 9)).toBe(null);
    expect(c.coverage()).toBe(0);
  });

  it('draws rectangles, ellipses and lines', () => {
    const c = new PixelCanvas(10, 10);
    c.fillRect(0, 0, 3, 2, '#ffffff');
    expect(c.coverage()).toBe(6);
    const e = new PixelCanvas(10, 10);
    e.ellipse(2, 2, 6, 6, '#ffffff');
    expect(e.get(4, 4)).toBe('#ffffff');
    expect(e.get(0, 0)).toBe(null);
    const l = new PixelCanvas(10, 10);
    l.line(0, 0, 9, 9, '#ffffff');
    expect(l.coverage()).toBe(10);
  });

  it('outlines shapes from the outside only', () => {
    const c = new PixelCanvas(5, 5);
    c.set(2, 2, '#ffffff');
    c.outline('#000000');
    expect(c.get(2, 2)).toBe('#ffffff');
    expect(c.get(1, 2)).toBe('#000000');
    expect(c.get(2, 1)).toBe('#000000');
    expect(c.get(1, 1)).toBe(null);
    expect(c.coverage()).toBe(5);
  });

  it('blits opaque pixels, optionally mirrored', () => {
    const src = new PixelCanvas(3, 1);
    src.set(0, 0, '#ff0000');
    const dst = new PixelCanvas(3, 1);
    dst.blit(src, 0, 0, { flipX: true });
    expect(dst.get(2, 0)).toBe('#ff0000');
    expect(dst.get(0, 0)).toBe(null);
  });

  it('recolours and clones', () => {
    const c = new PixelCanvas(2, 1);
    c.set(0, 0, '#111111');
    const copy = c.clone();
    c.recolor('#111111', '#222222');
    expect(c.get(0, 0)).toBe('#222222');
    expect(copy.get(0, 0)).toBe('#111111');
  });

  it('flips rows for DataTexture (row 0 = bottom)', () => {
    const c = new PixelCanvas(1, 2);
    c.set(0, 0, '#ff0000');
    const data = c.toTextureData();
    expect(Array.from(data.slice(0, 4))).toEqual([0, 0, 0, 0]);
    expect(Array.from(data.slice(4, 8))).toEqual([255, 0, 0, 255]);
  });
});
