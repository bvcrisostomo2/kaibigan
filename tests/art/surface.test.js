import { describe, it, expect } from 'vitest';
import { valueNoise, fbm, stoneCells, Surface } from '../../src/art/surface.js';

// The largest jump between a row or column and the next, wrapping round the tile's edge.
function largestStep(field, size, wrapOnly = false) {
  let inner = 0;
  let edge = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = field[y * size + x];
      const right = field[y * size + ((x + 1) % size)];
      const down = field[((y + 1) % size) * size + x];
      const step = Math.max(Math.abs(v - right), Math.abs(v - down));
      if (x === size - 1 || y === size - 1) edge = Math.max(edge, step);
      else inner = Math.max(inner, step);
    }
  }
  return wrapOnly ? edge : { inner, edge };
}

describe('noise', () => {
  it('value noise is deterministic, within 0..1 and tiles seamlessly', () => {
    const a = valueNoise(64, 4, 4, 7);
    expect(Array.from(valueNoise(64, 4, 4, 7))).toEqual(Array.from(a));
    expect(Math.min(...a)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...a)).toBeLessThanOrEqual(1);
    const { inner, edge } = largestStep(a, 64);
    expect(edge).toBeLessThanOrEqual(inner * 1.5 + 1e-6); // no seam at the wrap
  });

  it('can stretch along one axis (grain, streaks)', () => {
    const streaks = valueNoise(64, 16, 1, 3);
    // One cell down the tile: every column changes far less down than across.
    let across = 0;
    let down = 0;
    for (let y = 0; y < 63; y++) for (let x = 0; x < 63; x++) {
      across += Math.abs(streaks[y * 64 + x] - streaks[y * 64 + x + 1]);
      down += Math.abs(streaks[y * 64 + x] - streaks[(y + 1) * 64 + x]);
    }
    expect(down).toBeLessThan(across);
  });

  it('fbm spans 0..1 and tiles', () => {
    const f = fbm(64, 11);
    expect(Math.min(...f)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...f)).toBeLessThanOrEqual(1);
    const { inner, edge } = largestStep(f, 64);
    expect(edge).toBeLessThanOrEqual(inner * 1.5 + 1e-6);
  });
});

describe('stoneCells', () => {
  it('splits a tile into stones that wrap round its edges', () => {
    const { id, edge } = stoneCells(64, 6, 5);
    const ids = new Set(id);
    expect(ids.size).toBe(36);
    for (const e of edge) expect(e).toBeGreaterThanOrEqual(0);
    // A stone that touches the right edge carries on at the left: some ids sit on both edges.
    const left = new Set(Array.from({ length: 64 }, (_, y) => id[y * 64]));
    const right = new Set(Array.from({ length: 64 }, (_, y) => id[y * 64 + 63]));
    expect([...left].some((i) => right.has(i))).toBe(true);
  });
});

describe('Surface', () => {
  it('draws like a pixel canvas and keeps a height per pixel', () => {
    const s = new Surface(8);
    s.fillRect(0, 0, 8, 8, '#808080');
    s.set(2, 3, '#ff0000');
    s.setHeight(2, 3, 0.9);
    const c = s.toCanvas();
    expect(c.width).toBe(8);
    expect(c.get(2, 3)).toBe('#ff0000');
    expect(c.get(0, 0)).toBe('#808080');
    expect(s.heightAt(2, 3)).toBeCloseTo(0.9);
    expect(s.heightAt(10, 11)).toBe(s.heightAt(2, 3)); // wraps
  });

  it('a flat surface has no relief; a bumpy one gives a grey height image', () => {
    const s = new Surface(4);
    s.fillRect(0, 0, 4, 4, '#808080');
    expect(s.hasRelief()).toBe(false);
    s.setHeight(1, 1, 1);
    s.setHeight(2, 2, 0);
    expect(s.hasRelief()).toBe(true);
    const h = s.heightCanvas();
    expect(h.get(1, 1)).toBe('#ffffff');
    expect(h.get(2, 2)).toBe('#000000');
  });

  it('turns the height into a normal map: flat faces up, slopes lean away from the rise', () => {
    const s = new Surface(8);
    expect(s.normalCanvas().get(3, 3)).toBe('#8080ff');
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) s.setHeight(x, y, x < 4 ? 0 : 1);
    const n = s.normalCanvas();
    const red = (hex) => parseInt(hex.slice(1, 3), 16);
    expect(red(n.get(3, 2))).toBeLessThan(128); // rising to the right: the normal leans left
    expect(n.get(1, 2)).toBe('#8080ff');
  });

  it('bakes light from the top left into the colour', () => {
    const s = new Surface(8);
    s.fillRect(0, 0, 8, 8, '#808080');
    for (let x = 0; x < 8; x++) s.setHeight(x, 4, 1); // a ridge across the middle
    s.bakeLight(0.5);
    const c = s.toCanvas();
    const lum = (hex) => parseInt(hex.slice(1, 3), 16);
    expect(lum(c.get(3, 5))).toBeLessThan(lum(c.get(3, 3))); // its far side darker than the near
  });
});
