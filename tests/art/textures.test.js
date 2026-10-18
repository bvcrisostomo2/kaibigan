import { describe, it, expect } from 'vitest';
import { drawTexture, drawSurface, textureSpan, TEXTURE_NAMES, TEXTURE_SPANS, PX_PER_UNIT } from '../../src/art/textures.js';

describe('tile textures', () => {
  it('are drawn at 32 px per world unit', () => {
    expect(PX_PER_UNIT).toBe(32);
  });

  it('include every texture the levels use', () => {
    for (const name of ['narra', 'adobe', 'plaster', 'wood', 'capiz', 'roof', 'cobble', 'dirt', 'grass', 'water', 'tablecloth', 'carpet', 'tiles']) {
      expect(TEXTURE_NAMES).toContain(name);
    }
  });

  it('the ground, walls and roofs cover several units so their pattern does not repeat every step', () => {
    for (const name of ['cobble', 'adobe', 'plaster', 'narra', 'roof', 'dirt', 'grass', 'water']) expect(TEXTURE_SPANS[name], name).toBeGreaterThanOrEqual(4);
    expect(textureSpan('capiz')).toBe(1);
  });

  it.each(TEXTURE_NAMES)('%s is fully opaque, sized by its span and deterministic', (name) => {
    const a = drawTexture(name);
    const size = textureSpan(name) * PX_PER_UNIT;
    expect(a.width).toBe(size);
    expect(a.height).toBe(size);
    expect(a.coverage()).toBe(size * size);
    expect(Array.from(drawTexture(name).data)).toEqual(Array.from(a.data));
  });

  it('every texture is different', () => {
    const keys = new Set(TEXTURE_NAMES.map((n) => Array.from(drawTexture(n).data).join(',')));
    expect(keys.size).toBe(TEXTURE_NAMES.length);
  });

  it('has detail (many colours, not a few flat ones)', () => {
    for (const name of TEXTURE_NAMES) {
      const c = drawTexture(name);
      const colours = new Set();
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) colours.add(c.get(x, y));
      expect(colours.size, name).toBeGreaterThan(TEXTURE_SPANS[name] >= 4 ? 100 : 2);
    }
  });

  it('stone, wood, roof and ground carry relief for the bump map', () => {
    for (const name of ['cobble', 'adobe', 'plaster', 'narra', 'wood', 'roof', 'dirt', 'grass', 'water', 'tiles']) expect(drawSurface(name).hasRelief(), name).toBe(true);
    expect(drawSurface('capiz').hasRelief()).toBe(false);
  });

  it('rejects unknown names', () => {
    expect(() => drawTexture('marble')).toThrow("Unknown texture 'marble'");
  });
});
