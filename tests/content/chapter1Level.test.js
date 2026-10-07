import { describe, it, expect } from 'vitest';
import { chapter1Level, levelNames } from '../../src/content/chapter1/level.js';
import { buildWorld } from '../../src/engine/world.js';
import { stairFloorOverlaps } from '../../src/engine/collision.js';
import { TEXTURE_NAMES } from '../../src/art/textures.js';
import { PROPS } from '../../src/art/props.js';
import { COSTUMES } from '../../src/art/costumes.js';
import { createStage } from '../../src/engine/stage.js';
import { WALK_SPEED } from '../../src/engine/actors.js';
import { chapter1Beats } from '../../src/content/chapter1/beats.js';

describe('Chapter 1 level: six maps joined by doors', () => {
  const world = buildWorld(chapter1Level);
  const col = world.collision;
  const maps = chapter1Level.maps;
  const zoneAt = (p) => col.zonesAt(p.x, p.z, p.y)[0] ?? null;

  // Walk in straight legs from a spot, each until a coordinate passes a target (or a step limit).
  // Returns where it ended, the zone after each leg, and the first door walked into.
  function walk(from, legs) {
    let pos = { x: world.spots[from].x, y: world.spots[from].y, z: world.spots[from].z };
    const visited = [];
    let door = null;
    for (const [axis, target] of legs) {
      const dir = Math.sign(target - pos[axis]);
      for (let i = 0; i < 600 && Math.sign(target - pos[axis]) === dir && Math.abs(target - pos[axis]) > 0.05; i++) {
        const before = world.doorAt(pos);
        pos = col.move(pos, axis === 'x' ? dir * 0.1 : 0, axis === 'z' ? dir * 0.1 : 0);
        const now = world.doorAt(pos);
        if (!door && now && now !== before) door = now.id;
      }
      visited.push(zoneAt(pos));
    }
    return { pos, visited, door };
  }
  // Local map coordinates to world (for the walking legs).
  const X = (map, x) => maps[map].offset[0] + x;
  const Z = (map, z) => maps[map].offset[1] + z;

  it('uses only known textures and props', () => {
    for (const map of Object.values(maps)) {
      const textured = [...(map.floors ?? []), ...(map.stairs ?? []), ...(map.walls ?? []), ...(map.roofs ?? [])];
      for (const part of textured) expect(TEXTURE_NAMES).toContain(part.tex);
      for (const p of map.props ?? []) expect(Object.keys(PROPS)).toContain(p.type);
    }
  });

  it('keeps every floor off both ends of each stair (the Plan 2 stair rule), map by map', () => {
    for (const map of Object.values(maps)) expect(stairFloorOverlaps(map)).toEqual([]);
  });

  it('puts the maps far enough apart that the camera never sees two at once', () => {
    const offsets = Object.values(maps).map((m) => m.offset[0]);
    for (let i = 0; i < offsets.length; i++) for (let j = i + 1; j < offsets.length; j++) expect(Math.abs(offsets[i] - offsets[j])).toBeGreaterThanOrEqual(300);
    for (const [id, m] of Object.entries(maps)) expect(['outdoor', 'indoor'], id).toContain(m.camera);
  });

  it('leads every door to a spot on another map, never arriving inside a door', () => {
    for (const d of world.doors) {
      const to = world.spots[d.to];
      expect(to, d.id).toBeDefined();
      expect(world.mapAt(to), d.id).not.toBe(d.map);
      expect(world.doorAt(to), d.id).toBe(null);
      expect(col.canStand(to.x, to.z, to.y), d.id).toBe(true);
    }
  });

  it('walks from the street through the front door into the zaguán', () => {
    const { door } = walk('street_spawn', [['z', Z('street', 2.95)]]);
    expect(door).toBe('front_door');
  });

  it('walks across the zaguán to the stairs and up them, and back out of the front door', () => {
    const up = walk('zaguan_entry', [['x', X('ground', 11.5)], ['z', Z('ground', 1.5)]]);
    expect(up.door).toBe('stairs_up');
    expect(up.pos.y).toBeGreaterThan(1.5);
    expect(walk('zaguan_entry', [['z', Z('ground', 7.9)]]).door).toBe('house_exit');
  });

  it('walks the upper floor: caída to sala, the oratorio door, the azotea, the kusina door and back down the stairs', () => {
    const across = walk('caida_from_stairs', [['x', X('upper', 8)]]);
    expect(across.visited).toEqual(['sala']);
    expect(walk('sala_spawn', [['x', X('upper', 9.1)], ['z', Z('upper', 0.3)]]).door).toBe('oratorio_door');
    expect(walk('tiago_table', [['z', Z('upper', -2)]]).visited).toEqual(['azotea']);
    expect(walk('caida_from_kusina', [['z', Z('upper', 0.2)]]).door).toBe('kusina_door');
    const down = walk('caida_from_stairs', [['z', Z('upper', 9.8)]]);
    expect(down.door).toBe('stairs_down');
    expect(down.pos.y).toBeLessThan(-1.5);
  });

  it('walks out of the kusina and the oratorio', () => {
    expect(walk('kusina_entry', [['z', Z('kusina', 6.9)]]).door).toBe('kusina_exit');
    expect(walk('oratorio_entry', [['z', Z('oratorio', 5.9)]]).door).toBe('oratorio_exit');
  });

  it('walks from the street up the lane to the riverbank, onto the bridge to its broken end, and back', () => {
    expect(walk('street_spawn', [['z', Z('street', 6)], ['x', X('street', 36.8)], ['z', Z('street', -1.9)]]).door).toBe('lane_north');
    const bridge = walk('landing_from_lane', [['x', X('riverbank', 19.5)], ['z', Z('riverbank', 2)]]);
    expect(bridge.visited.at(-1)).toBe('riverbank');
    expect(bridge.pos.y).toBeCloseTo(0.2);
    expect(bridge.pos.z).toBeGreaterThan(Z('riverbank', 3.9)); // the far end is broken
    expect(walk('landing_from_lane', [['z', Z('riverbank', 13.9)]]).door).toBe('lane_south');
  });

  it('stands every spot on a floor, apart from the seats, the seated extras and the boatman on his banca', () => {
    const seatedOrAfloat = new Set(Object.values(maps).flatMap((m) => (m.extras ?? []).filter((e) => e.pose === 'sit' || e.activity === 'pole').map((e) => e.spot)));
    for (const [name, p] of Object.entries(world.spots)) {
      if (name.startsWith('seat_') || seatedOrAfloat.has(name)) continue;
      expect(col.canStand(p.x, p.z, p.y), name).toBe(true);
    }
    expect(col.canStand(world.spawn.x, world.spawn.z, world.spawn.y)).toBe(true);
    for (const e of [...chapter1Level.examinables, ...chapter1Level.locked]) expect(world.spots[e.spot], e.id).toBeDefined();
  });

  it('puts every seat on a chair at the caída table, one chair per diner, with room to stand up behind it', () => {
    const seats = Object.entries(world.spots).filter(([name]) => name.startsWith('seat_'));
    expect(seats.map(([n]) => n).sort()).toEqual(['seat_damaso', 'seat_guevarra', 'seat_head', 'seat_ibarra', 'seat_laruja', 'seat_newcomer', 'seat_player', 'seat_tiburcio', 'seat_victorina']);
    const tableChairs = maps.upper.props.filter((p) => p.type === 'chair' && p.x >= 12 && p.z > 3 && p.z < 7);
    expect(tableChairs).toHaveLength(9);
    for (const [name, p] of seats) {
      expect(col.blocked(p.x, p.z, p.y), name).toBe(true);
      expect(zoneAt(p), name).toBe('caida');
      const room = [0.55, 0.8, 1.1].some((r) => [[0, -r], [0, r], [-r, 0]].some(([dx, dz]) => col.canStand(p.x + dx, p.z + dz, p.y)));
      expect(room, name).toBe(true);
    }
  });

  it('gives every extra a known costume, its activity art, and real spots', () => {
    for (const e of world.extras) {
      expect(COSTUMES[e.costume], e.id).toBeDefined();
      if (e.activity) expect(COSTUMES[e.costume].activities ?? [], e.id).toContain(e.activity);
      for (const s of e.loop ?? [e.spot]) expect(world.spots[s], `${e.id}: ${s}`).toBeDefined();
      if (e.loop) for (const s of e.loop) expect(col.canStand(world.spots[s].x, world.spots[s].z, world.spots[s].y), `${e.id}: ${s}`).toBe(true);
    }
    const ids = world.extras.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('lists only real zones as indoor and sets ambience only for real zones', () => {
    const { zones } = levelNames(chapter1Level);
    for (const z of chapter1Level.indoorZones) expect(zones).toContain(z);
    for (const z of Object.keys(chapter1Level.ambience)) expect(zones).toContain(z);
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
});
