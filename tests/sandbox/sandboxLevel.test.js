import { describe, it, expect } from 'vitest';
import { sandboxLevel, sandboxCast } from '../../src/sandbox/sandboxLevel.js';
import { buildWorld } from '../../src/engine/world.js';
import { TEXTURE_NAMES } from '../../src/art/textures.js';
import { PROPS } from '../../src/art/props.js';
import { sheetSource } from '../../src/art/threeTextures.js';

describe('sandbox level', () => {
  const world = buildWorld(sandboxLevel);

  it('uses only known textures and props', () => {
    const textured = [...sandboxLevel.floors, ...sandboxLevel.stairs, ...sandboxLevel.walls, ...sandboxLevel.roofs];
    for (const part of textured) expect(TEXTURE_NAMES).toContain(part.tex);
    for (const p of sandboxLevel.props) expect(Object.keys(PROPS)).toContain(p.type);
  });

  it('spawns the player on walkable ground', () => {
    const s = world.spawn;
    expect(world.collision.canStand(s.x, s.z, s.y)).toBe(true);
  });

  it('places every cast member on walkable ground with a known costume', () => {
    for (const c of sandboxCast) {
      const [x, z, y] = c.at;
      const h = world.collision.heightAt(x, z, y ?? 0);
      expect(h, c.id).not.toBe(null);
      expect(world.collision.canStand(x, z, h), c.id).toBe(true);
      expect(() => sheetSource(c.costume)).not.toThrow();
    }
  });

  it('connects the street to the sala: in at the door, along the hall, up the stairs', () => {
    let pos = { x: 11, y: 0, z: 13 };
    const walk = (dx, dz, steps) => {
      for (let i = 0; i < steps; i++) pos = world.collision.move(pos, dx, dz);
    };
    walk(0, -0.1, 17); // through the doorway to just inside the front wall
    walk(0.1, 0, 32); // east to the stair's foot
    walk(0, -0.1, 40); // up
    expect(pos.y).toBe(3);
    expect(world.collision.zonesAt(pos.x, pos.z, pos.y)).toContain('sala');
  });

  it('walks back down from the sala to the street', () => {
    let pos = { x: 14.1, y: 3, z: 7.5 };
    const walk = (dx, dz, steps) => {
      for (let i = 0; i < steps; i++) pos = world.collision.move(pos, dx, dz);
    };
    walk(0, 0.1, 40); // down the stair to its foot, just inside the front wall
    expect(pos.y).toBeLessThan(0.45);
    walk(-0.1, 0, 32); // west along the hall to the doorway
    expect(pos.y).toBe(0);
    walk(0, 0.1, 20); // out to the street
    expect(world.collision.zonesAt(pos.x, pos.z, pos.y)).not.toContain('sala');
    expect(pos.z).toBeGreaterThan(12.5);
  });

  it('has no floor at a stair top height overlapping the ramp (it would block the way down)', () => {
    for (const s of sandboxLevel.stairs) {
      for (const f of sandboxLevel.floors) {
        if (f.y !== s.y1) continue;
        const overlapX = Math.min(f.x + f.w, s.x + s.w) - Math.max(f.x, s.x);
        const overlapZ = Math.min(f.z + f.d, s.z + s.d) - Math.max(f.z, s.z);
        expect(overlapX > 0 && overlapZ > 0, JSON.stringify(f)).toBe(false);
      }
    }
  });

  it('has no floor hiding a stair ramp (collision prefers the nearest height)', () => {
    for (const s of sandboxLevel.stairs) {
      for (const f of sandboxLevel.floors) {
        if (f.y !== s.y0) continue;
        const overlapX = Math.min(f.x + f.w, s.x + s.w) - Math.max(f.x, s.x);
        const overlapZ = Math.min(f.z + f.d, s.z + s.d) - Math.max(f.z, s.z);
        expect(overlapX > 0 && overlapZ > 0, JSON.stringify(f)).toBe(false);
      }
    }
  });

  it('resolves every named spot', () => {
    for (const [name, p] of Object.entries(world.spots)) expect(world.collision.heightAt(p.x, p.z, p.y), name).not.toBe(null);
  });
});
