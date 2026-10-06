import { describe, it, expect } from 'vitest';
import { chapter1Level } from '../../src/content/chapter1/level.js';
import { buildWorld } from '../../src/engine/world.js';
import { stairFloorOverlaps } from '../../src/engine/collision.js';
import { TEXTURE_NAMES } from '../../src/art/textures.js';
import { PROPS } from '../../src/art/props.js';

describe('Chapter 1 level', () => {
  const world = buildWorld(chapter1Level);
  const col = world.collision;
  const zoneAt = (p) => col.zonesAt(p.x, p.z, p.y)[0] ?? null;

  // Walk in straight legs, each until a coordinate passes a target (or a step limit).
  function walk(start, legs) {
    let pos = { ...start };
    const visited = [];
    for (const [axis, target] of legs) {
      const dir = Math.sign(target - pos[axis]);
      for (let i = 0; i < 400 && Math.sign(target - pos[axis]) === dir && Math.abs(target - pos[axis]) > 0.05; i++) {
        pos = col.move(pos, axis === 'x' ? dir * 0.1 : 0, axis === 'z' ? dir * 0.1 : 0);
      }
      visited.push(zoneAt(pos));
    }
    return { pos, visited };
  }

  it('uses only known textures and props', () => {
    const textured = [...chapter1Level.floors, ...chapter1Level.stairs, ...chapter1Level.walls, ...chapter1Level.roofs];
    for (const part of textured) expect(TEXTURE_NAMES).toContain(part.tex);
    for (const p of chapter1Level.props) expect(Object.keys(PROPS)).toContain(p.type);
  });

  it('keeps every floor off both ends of the stair (the Plan 2 stair rule)', () => {
    expect(stairFloorOverlaps(chapter1Level)).toEqual([]);
  });

  it('walks from the street through the door, up the stairs to the caída and into the sala', () => {
    const { pos, visited } = walk({ x: 18.5, y: 0, z: 25 }, [
      ['z', 21], // through the front door into the zaguán
      ['x', 32.5], // east along the zaguán to the stair's foot
      ['z', 12.5], // up the stairs into the caída
      ['x', 23.5], // west across the caída
      ['z', 16], // through the doorway into the sala
    ]);
    expect(visited).toEqual(['zaguan', 'zaguan', 'caida', 'caida', 'sala']);
    expect(pos.y).toBe(3.5);
  });

  it('walks back down from the sala to the street', () => {
    const { pos, visited } = walk({ x: 23.5, y: 3.5, z: 16 }, [
      ['z', 12.5], ['x', 32.5], ['z', 21], ['x', 18.5], ['z', 25],
    ]);
    expect(visited.at(-1)).toBe('calle');
    expect(pos.y).toBe(0);
  });

  it('walks from the caída out onto the azotea over the river', () => {
    // round the end of the dining table, along its far side, then out through an arch
    const { visited } = walk({ x: 28, y: 3.5, z: 12.5 }, [['z', 7.5], ['x', 15], ['z', 4.5]]);
    expect(visited.at(-1)).toBe('azotea');
  });

  it('walks from the street up the lane to the riverbank and onto the bridge', () => {
    const { pos, visited } = walk({ x: 18.5, y: 0, z: 25 }, [['x', 46], ['z', 4.5], ['z', -2]]);
    expect(visited).toEqual(['calle', 'riverbank', 'riverbank']);
    expect(pos.y).toBeCloseTo(0.2);
    expect(pos.z).toBeGreaterThan(-3); // the far end of the bridge is broken
  });

  it('stands every spot, the spawn and every examinable on a floor', () => {
    for (const [name, p] of Object.entries(world.spots)) expect(col.canStand(p.x, p.z, p.y), name).toBe(true);
    expect(col.canStand(world.spawn.x, world.spawn.z, world.spawn.y)).toBe(true);
    for (const e of chapter1Level.examinables) expect(world.spots[e.spot], e.id).toBeDefined();
  });

  it('lists only real zones as indoor', () => {
    for (const z of chapter1Level.indoorZones) expect(Object.keys(chapter1Level.zones)).toContain(z);
  });
});
