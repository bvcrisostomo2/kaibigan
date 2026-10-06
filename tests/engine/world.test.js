import { describe, it, expect } from 'vitest';
import { buildWorld, animateWorld } from '../../src/engine/world.js';

const level = {
  floors: [
    { x: 0, z: 0, w: 10, d: 10, y: 0, tex: 'cobble' },
    { x: 0, z: -6, w: 10, d: 4, y: 3, tex: 'narra' },
  ],
  walls: [
    { x: 4, z: 4, w: 2, d: 0.4, y: 0, h: 3, tex: 'adobe' },
    { x: 0, z: 9.6, w: 10, d: 0.4, y: 0, h: 0.6, tex: 'adobe', occluder: false },
    { x: 8, z: 0, w: 0.2, d: 1, y: 0, h: 3, tex: 'wood', collide: false },
  ],
  roofs: [{ x: 0, z: -6, w: 10, d: 4, y: 6, rise: 2, tex: 'roof', axis: 'z' }],
  windows: [{ x: 2, z: 4, y: 1, w: 1, h: 1, facing: 's' }],
  water: [{ x: 0, z: 11, w: 10, d: 3, y: -0.5 }],
  props: [
    { type: 'table', x: 2, z: 2, w: 2, d: 1 },
    { type: 'lantern', x: 7, z: 7 },
    { type: 'chair', x: 1, z: -4, y: 3 },
  ],
  lights: [{ x: 5, y: 2, z: 5, color: '#ffaa55', intensity: 2, distance: 5 }],
  zones: { street: { x: 0, z: 0, w: 10, d: 10 } },
  spots: { door: [5, 5], upstairs: [5, -4, 3] },
  spawn: [1, 8],
};

describe('buildWorld', () => {
  const world = buildWorld(level);

  it('makes walls and prop footprints solid on their floor', () => {
    expect(world.collision.blocked(5, 4.2, 0)).toBe(true); // wall
    expect(world.collision.blocked(2, 2, 0)).toBe(true); // table
    expect(world.collision.blocked(8.1, 0.5, 0)).toBe(false); // collide: false
    expect(world.collision.blocked(1, -4, 3)).toBe(true); // chair upstairs
    expect(world.collision.blocked(1, -4, 0)).toBe(false);
  });

  it('collects occluders: walls (unless occluder: false), roof panels and windows', () => {
    expect(world.occluders).toHaveLength(1 + 1 + 2 + 1);
    const windowMesh = world.occluders.find((o) => world.windowMaterials.includes(o.material));
    expect(windowMesh).toBeDefined();
    for (const o of world.occluders) expect(o.userData.occluder).toBe(true);
  });

  it('gives each occluding wall its own material so they fade separately', () => {
    const [a] = world.occluders;
    const b = world.occluders.find((o) => o !== a && o.material.map === a.material.map);
    if (b) expect(b.material).not.toBe(a.material);
  });

  it('gathers light sources from props and level lights', () => {
    expect(world.lightSources.length).toBeGreaterThanOrEqual(2);
    const levelLight = world.lightSources.find((l) => l.color === '#ffaa55');
    expect(levelLight.position).toEqual([5, 2, 5]);
    expect(levelLight.flicker).toBe(0);
  });

  it('resolves spots and the spawn to ground height', () => {
    expect(world.spots.door.toArray()).toEqual([5, 0, 5]);
    expect(world.spots.upstairs.toArray()).toEqual([5, 3, -4]);
    expect(world.spawn.toArray()).toEqual([1, 0, 8]);
  });

  it('keeps window materials and animated water', () => {
    expect(world.windowMaterials).toHaveLength(1);
    expect(world.animated).toHaveLength(1);
    animateWorld(world, 10);
    expect(world.animated[0].texture.offset.x).toBeCloseTo(0.3);
  });

  it('passes zones through', () => {
    expect(world.zones.street).toEqual(level.zones.street);
    expect(world.collision.zonesAt(5, 5, 0)).toEqual(['street']);
  });
});

describe('buildWorld level checks', () => {
  const stair = { x: 4, z: 4, w: 2, d: 2, y0: 0, y1: 3, dir: 'n', tex: 'narra' };

  it('rejects a floor that hides a stair ramp at its base height', () => {
    const floors = [{ x: 0, z: 0, w: 10, d: 10, y: 0, tex: 'cobble' }];
    expect(() => buildWorld({ floors, stairs: [stair] })).toThrow('overlaps the stair at x 4, z 4 at its base');
  });

  it('rejects a floor that blocks the way down at a stair top height', () => {
    const floors = [{ x: 0, z: 6, w: 10, d: 4, y: 0, tex: 'cobble' }, { x: 0, z: 0, w: 10, d: 4.5, y: 3, tex: 'narra' }];
    expect(() => buildWorld({ floors, stairs: [stair] })).toThrow('overlaps the stair at x 4, z 4 at its top');
  });
});

describe('buildWorld cutaway', () => {
  it('groups everything at or above the cutaway height so the boot can hide the upper storey', () => {
    const withCut = buildWorld({ ...level, cutaway: { y: 3, zones: ['street'] } });
    expect(withCut.cutaway).toEqual({ y: 3, zones: ['street'] });
    // the upper floor, its chair and the roof; not the ground floor, walls, window or lantern
    expect(withCut.upper.children).toHaveLength(3);
    expect(withCut.group.children).toContain(withCut.upper);
    const without = buildWorld(level);
    expect(without.cutaway).toBe(null);
    expect(without.upper.children).toHaveLength(0);
  });
});
