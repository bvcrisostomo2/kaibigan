import { describe, it, expect } from 'vitest';
import { drawTexture, TEXTURE_NAMES, TILE } from '../../src/art/textures.js';

describe('tile textures', () => {
  it('are 32×32', () => {
    expect(TILE).toBe(32);
  });

  it('include every texture the levels use', () => {
    for (const name of ['narra', 'adobe', 'plaster', 'wood', 'capiz', 'roof', 'cobble', 'dirt', 'grass', 'water', 'tablecloth', 'carpet', 'tiles']) {
      expect(TEXTURE_NAMES).toContain(name);
    }
  });

  it.each(TEXTURE_NAMES)('%s is fully opaque and deterministic', (name) => {
    const a = drawTexture(name);
    expect(a.width).toBe(TILE);
    expect(a.height).toBe(TILE);
    expect(a.coverage()).toBe(TILE * TILE);
    expect(Array.from(drawTexture(name).data)).toEqual(Array.from(a.data));
  });

  it('every texture is different', () => {
    const keys = new Set(TEXTURE_NAMES.map((n) => Array.from(drawTexture(n).data).join(',')));
    expect(keys.size).toBe(TEXTURE_NAMES.length);
  });

  it('has some detail (not one flat colour)', () => {
    for (const name of TEXTURE_NAMES) {
      const c = drawTexture(name);
      const colours = new Set();
      for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) colours.add(c.get(x, y));
      expect(colours.size, name).toBeGreaterThan(2);
    }
  });

  it('rejects unknown names', () => {
    expect(() => drawTexture('marble')).toThrow("Unknown texture 'marble'");
  });
});
