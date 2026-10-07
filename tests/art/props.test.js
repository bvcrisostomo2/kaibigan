import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { makeProp, material, tiledBox, PROPS } from '../../src/art/props.js';

describe('props', () => {
  it.each(Object.keys(PROPS))('%s builds an object with footprint and lights', (type) => {
    const p = makeProp(type, {});
    expect(p.object).toBeInstanceOf(THREE.Object3D);
    expect(p.footprint === null || (p.footprint.w > 0 && p.footprint.d > 0)).toBe(true);
    expect(Array.isArray(p.lights)).toBe(true);
  });

  it("has the house's furnishings and the street's things (Plan 5a)", () => {
    for (const t of ['calesa', 'sacks', 'firewood', 'tinaja', 'palayok', 'bilao', 'shelf', 'rope', 'niche', 'cat', 'arches', 'balustrade', 'paperLantern', 'birdcage', 'glassGlobe', 'botete', 'sideboard', 'candelabrum', 'rug', 'dais', 'arbour', 'palm', 'washTub', 'kalan', 'choppingBlock', 'altar', 'kneeler', 'stall', 'carromata', 'mooringPost', 'banca', 'stiltHouse']) expect(PROPS, t).toHaveProperty(t);
    expect(makeProp('kalan', {}).lights[0].flicker).toBeGreaterThan(0.2); // the fire
    expect(makeProp('balustrade', { w: 6 }).footprint).toEqual({ w: 6, d: 0.3 }); // you can't step off the azotea
  });

  it('rotates footprints with odd quarter turns', () => {
    const p0 = makeProp('table', { w: 3, d: 1.2 });
    const p1 = makeProp('table', { w: 3, d: 1.2, rot: 1 });
    expect(p1.footprint).toEqual({ w: p0.footprint.d, d: p0.footprint.w });
    expect(makeProp('table', { w: 3, d: 1.2, rot: 2 }).footprint).toEqual(p0.footprint);
  });

  it('rotates light offsets with the prop', () => {
    const p0 = makeProp('lantern', {});
    const p2 = makeProp('lantern', { rot: 2 });
    expect(p0.lights.length).toBeGreaterThan(0);
    expect(p2.lights[0].offset[0]).toBeCloseTo(-p0.lights[0].offset[0]);
    expect(p2.lights[0].offset[1]).toBeCloseTo(p0.lights[0].offset[1]);
  });

  it('rejects unknown types', () => {
    expect(() => makeProp('throne')).toThrow("Unknown prop 'throne'");
  });

  it('shares materials and tiles box textures per world unit', () => {
    expect(material('narra')).toBe(material('narra'));
    expect(material('#ff0000').color.getHexString()).toBe('ff0000');
    const box = tiledBox(3, 1, 2, material('adobe'));
    const uv = box.geometry.attributes.uv;
    let maxU = 0;
    for (let i = 0; i < uv.count; i++) maxU = Math.max(maxU, uv.getX(i));
    expect(maxU).toBe(3);
  });
});
