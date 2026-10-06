import { describe, it, expect } from 'vitest';
import { chapter1Level } from '../../src/content/chapter1/level.js';
import { buildWorld } from '../../src/engine/world.js';
import { stairFloorOverlaps } from '../../src/engine/collision.js';
import { TEXTURE_NAMES } from '../../src/art/textures.js';
import { PROPS } from '../../src/art/props.js';
import { createStage } from '../../src/engine/stage.js';
import { WALK_SPEED } from '../../src/engine/actors.js';
import { chapter1Beats } from '../../src/content/chapter1/beats.js';

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

  it('stands every spot (seats aside), the spawn and every examinable on a floor', () => {
    for (const [name, p] of Object.entries(world.spots)) if (!name.startsWith('seat_')) expect(col.canStand(p.x, p.z, p.y), name).toBe(true);
    expect(col.canStand(world.spawn.x, world.spawn.z, world.spawn.y)).toBe(true);
    for (const e of chapter1Level.examinables) expect(world.spots[e.spot], e.id).toBeDefined();
  });

  it('puts every seat on a chair at the table, with room to stand up behind it', () => {
    const seats = Object.entries(world.spots).filter(([name]) => name.startsWith('seat_'));
    expect(seats.map(([n]) => n).sort()).toEqual(['seat_damaso', 'seat_guevarra', 'seat_head', 'seat_ibarra', 'seat_laruja', 'seat_newcomer', 'seat_player', 'seat_tiburcio', 'seat_victorina']);
    for (const [name, p] of seats) {
      expect(col.blocked(p.x, p.z, p.y), name).toBe(true); // on the chair itself
      expect(zoneAt(p), name).toBe('caida');
      const room = [0.55, 0.8, 1.1].some((r) => [[0, -r], [0, r], [-r, 0]].some(([dx, dz]) => col.canStand(p.x + dx, p.z + dz, p.y)));
      expect(room, name).toBe(true);
    }
  });

  it('sets one chair for each of the nine diners, so no seat sits empty', () => {
    const chairs = chapter1Level.props.filter((p) => p.type === 'chair' && p.y === 3.5 && p.z < 12);
    expect(chairs).toHaveLength(9);
    const seats = Object.entries(world.spots).filter(([name]) => name.startsWith('seat_'));
    for (const [name, s] of seats) expect(chairs.some((c) => Math.hypot(c.x - s.x, c.z - s.z) < 0.01), name).toBe(true);
  });

  it("walks Ibarra from his chair past the table to the stair head on his own feet, never stuck or teleported", async () => {
    const exit = chapter1Beats.find((b) => b.id === 'k3_dinner').actions;
    const from = exit.findIndex((a) => a[0] === 'stand' && a[1] === 'ibarra');
    const to = exit.findIndex((a) => a[0] === 'hide' && a[1] === 'ibarra');
    const ibarra = {
      object: { position: world.spots.seat_ibarra.clone(), visible: true },
      get position() { return this.object.position; },
      seated: true, dir: 'down',
      setMotion() {}, face() {}, emote() {},
      sit(d) { this.seated = true; this.dir = d; },
      stand() { this.seated = false; },
    };
    const stage = createStage({ world, actors: new Map([['ibarra', ibarra]]), camera: {}, lighting: {}, audio: {}, fader: {} });
    const dt = 1 / 30;
    let jumped = false;
    for (const action of exit.slice(from, to)) {
      let done = false;
      stage.run(action).then(() => (done = true));
      for (let t = 0; !done && t < 40; t += dt) {
        const before = ibarra.position.clone();
        stage.update(dt);
        if (ibarra.position.distanceTo(before) > WALK_SPEED * dt * 1.5) jumped = true;
        await Promise.resolve();
      }
      expect(done, JSON.stringify(action)).toBe(true);
    }
    expect(jumped).toBe(false);
    expect(ibarra.position.distanceTo(world.spots.isabel_stairhead)).toBeLessThan(0.2);
  });

  it('lists only real zones as indoor', () => {
    for (const z of chapter1Level.indoorZones) expect(Object.keys(chapter1Level.zones)).toContain(z);
  });
});
