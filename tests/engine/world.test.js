import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { buildWorld, animateWorld, updateFades, FADED_OPACITY } from '../../src/engine/world.js';

const level = {
  floors: [
    { x: 0, z: 0, w: 10, d: 10, y: 0, tex: 'cobble' },
    { x: 0, z: -6, w: 10, d: 4, y: 3, tex: 'narra' },
  ],
  walls: [
    { x: 4, z: 4, w: 2, d: 0.4, y: 0, h: 3, tex: 'adobe' },
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

describe('buildWorld: a level without maps is one map', () => {
  const world = buildWorld(level);

  it('makes walls and prop footprints solid on their floor', () => {
    expect(world.collision.blocked(5, 4.2, 0)).toBe(true); // wall
    expect(world.collision.blocked(2, 2, 0)).toBe(true); // table
    expect(world.collision.blocked(8.1, 0.5, 0)).toBe(false); // collide: false
    expect(world.collision.blocked(1, -4, 3)).toBe(true); // chair upstairs
    expect(world.collision.blocked(1, -4, 0)).toBe(false);
  });

  it('has no fading walls, roofs or windows any more (Plan 5a: nothing stands between camera and player)', () => {
    expect(world.occluders).toBeUndefined();
    expect(world.upper).toBeUndefined();
  });

  it('gathers light sources from props and level lights, tagged with their map', () => {
    expect(world.lightSources.length).toBeGreaterThanOrEqual(2);
    const levelLight = world.lightSources.find((l) => l.color === '#ffaa55');
    expect(levelLight.position).toEqual([5, 2, 5]);
    expect(levelLight.flicker).toBe(0);
    expect(levelLight.map).toBe('main');
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
    expect(world.animated[0].normal.offset.x).toBeCloseTo(0.5); // the ripples outrun the colour
  });

  it('gives water a shiny, rippling material', () => {
    const water = world.maps.main?.group ?? world.group;
    let mat = null;
    let mesh = null;
    water.traverse((o) => { if (o.material?.normalMap) { mat = o.material; mesh = o; } });
    expect(mat).toBeInstanceOf(THREE.MeshPhongMaterial);
    expect(mesh.receiveShadow).toBe(false); // shadows would lie on the ripples as flat slabs
    expect(mat.shininess).toBeGreaterThan(20);
  });

  it('fades a prop that stands between the camera and a zone while the player is in it', () => {
    const w = buildWorld({ ...level, props: [...level.props, { type: 'arches', x: 5, z: 0, w: 6, count: 2, fadeIn: ['street'] }], walls: [...level.walls, { x: 1, z: 1, w: 0.2, d: 0.2, y: 0, h: 2, tex: 'wood', fadeIn: ['street'] }] });
    expect(w.faders).toHaveLength(2); // the post (a wall) and the arches
    const fade = w.faders[1];
    const mats = new Set();
    fade.object.traverse((o) => o.material && mats.add(o.material));
    // Its own materials, so fading it leaves every other wooden thing alone.
    const table = buildWorld(level).group;
    for (const m of mats) expect(m.transparent).toBe(true);
    for (let i = 0; i < 120; i++) updateFades(w, 'street', 1 / 60);
    for (const m of mats) expect(m.opacity).toBeCloseTo(FADED_OPACITY, 2);
    for (let i = 0; i < 120; i++) updateFades(w, null, 1 / 60);
    for (const m of mats) expect(m.opacity).toBeCloseTo(1, 2);
    let shared = false;
    table.traverse((o) => { if (o.material && mats.has(o.material)) shared = true; });
    expect(shared).toBe(false);
  });

  it("lights a prop's windows with the town's (a stilt house's capiz pane follows the time of day)", () => {
    const w = buildWorld({ ...level, props: [...level.props, { type: 'stiltHouse', x: 5, z: 12, y: -0.5 }] });
    expect(w.windowMaterials).toHaveLength(2);
    expect(w.windowMaterials[1].emissiveIntensity).toBe(0);
  });

  it("passes a map's zone views through", () => {
    const w = buildWorld({ ...level, zoneCameras: { street: 'outdoor' } });
    expect(w.maps.main.zoneCameras).toEqual({ street: 'outdoor' });
    expect(world.maps.main.zoneCameras).toEqual({});
  });

  it('passes zones through', () => {
    expect(world.zones.street).toEqual(level.zones.street);
    expect(world.collision.zonesAt(5, 5, 0)).toEqual(['street']);
    expect(world.mapAt(world.spots.door)).toBe('main');
  });
});

describe('buildWorld: maps as regions', () => {
  const room = (zone, spots, extra = {}) => ({
    floors: [{ x: 0, z: 0, w: 10, d: 8, y: 0, tex: 'narra' }],
    zones: { [zone]: { x: 0, z: 0, w: 10, d: 8 } },
    spots,
    ...extra,
  });
  const twoMaps = {
    maps: {
      street: { name: 'Calle Anloague', detail: 'Binondo', offset: [0, 0], camera: 'outdoor', ...room('calle', { street_spawn: [5, 6], street_door: [5, 2] }), backdrop: { z: -20, x0: -10, x1: 20, seed: 3 } },
      house: { name: 'Casa', offset: [400, 0], ...room('zaguan', { zaguan_entry: [5, 6] }), props: [{ type: 'lantern', x: 2, z: 2 }], extras: [{ id: 'cook', costume: 'servant', spot: 'zaguan_entry' }] },
    },
    doors: [
      { id: 'front_door', map: 'street', rect: { x: 4, z: 0, w: 2, d: 1 }, to: 'zaguan_entry', face: 'up' },
      { id: 'house_exit', map: 'house', rect: { x: 4, z: 7, w: 2, d: 1 }, to: 'street_door', face: 'down' },
    ],
    locked: [{ id: 'shop_door', spot: 'street_door' }],
    spawn: 'street_spawn',
  };
  const world = buildWorld(twoMaps);

  it('places each map in its own region and puts spots and zones at their world positions', () => {
    expect(world.spots.street_spawn.toArray()).toEqual([5, 0, 6]);
    expect(world.spots.zaguan_entry.toArray()).toEqual([405, 0, 6]);
    expect(world.zones.zaguan).toEqual({ x: 400, z: 0, w: 10, d: 8 });
    expect(world.collision.zonesAt(405, 6, 0)).toEqual(['zaguan']);
    expect(world.collision.canStand(405, 6, 0)).toBe(true);
    expect(world.spawn.toArray()).toEqual([5, 0, 6]);
  });

  it('builds one group per map, with its name, camera and bounds', () => {
    expect(Object.keys(world.maps)).toEqual(['street', 'house']);
    expect(world.group.children).toContain(world.maps.house.group);
    expect(world.maps.street).toMatchObject({ name: 'Calle Anloague', detail: 'Binondo', camera: 'outdoor', bounds: { x: 0, z: 0, w: 10, d: 8 } });
    expect(world.maps.house).toMatchObject({ camera: 'indoor', bounds: { x: 400, z: 0, w: 10, d: 8 } });
  });

  it('knows which map a point is on', () => {
    expect(world.mapAt(world.spots.street_spawn)).toBe('street');
    expect(world.mapAt(world.spots.zaguan_entry)).toBe('house');
    expect(world.mapAt({ x: 200, z: 0 })).toBe(null);
  });

  it('moves doors into their map and finds the door a point stands in', () => {
    expect(world.doors[1].rect).toEqual({ x: 404, z: 7, w: 2, d: 1 });
    expect(world.doorAt({ x: 5, z: 0.5 })?.id).toBe('front_door');
    expect(world.doorAt({ x: 405, z: 7.5 })?.id).toBe('house_exit');
    expect(world.doorAt({ x: 5, z: 5 })).toBe(null);
    expect(world.locked).toEqual([{ id: 'shop_door', spot: 'street_door' }]);
  });

  it('tags lights and extras with their map', () => {
    expect(world.lightSources.every((l) => l.map === 'house')).toBe(true);
    expect(world.lightSources[0].position[0]).toBeGreaterThan(400);
    expect(world.extras).toEqual([{ id: 'cook', costume: 'servant', spot: 'zaguan_entry', map: 'house' }]);
  });

  it('raises the painted city, hills and sky behind a map, the sky tinted by the frame loop', () => {
    const backdrop = world.maps.street.group.children.find((c) => c.userData.backdrop);
    const skyline = backdrop.children.find((c) => c.userData.skyline);
    const sky = backdrop.children.find((c) => c.userData.sky);
    expect(skyline.position.z).toBeCloseTo(-20);
    expect(sky.position.z).toBeLessThan(skyline.position.z);
    expect(skyline.material.map.image.width).toBeGreaterThan(100);
    expect(world.skyMaterials).toEqual([sky.material]);
    expect(sky.material.fog).toBe(false);
  });

  it('lays a dark ground under each map, past its sides and front but never north of it', () => {
    const base = world.maps.house.group.children.find((c) => c.userData.base);
    expect(base).toBeDefined();
    const box = new THREE.Box3().setFromObject(base);
    expect(box.min.z).toBeCloseTo(0); // the map's back edge: nothing north
    expect(box.max.z).toBeGreaterThan(8 + 20);
    expect(box.min.x).toBeLessThan(400 - 20);
    expect(box.max.y).toBeLessThan(0);
  });

  it('checks the stair rule map by map', () => {
    const stair = { x: 4, z: 4, w: 2, d: 2, y0: 0, y1: 3, dir: 'n', tex: 'narra' };
    const bad = { maps: { up: { offset: [0, 0], floors: [{ x: 0, z: 0, w: 10, d: 10, y: 0, tex: 'cobble' }], stairs: [stair] } } };
    expect(() => buildWorld(bad)).toThrow("Map 'up': floor at y 0 (x 0, z 0) overlaps the stair at x 4, z 4 at its base");
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
