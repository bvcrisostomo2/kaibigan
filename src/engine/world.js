// Builds a level (plain data) into three.js groups plus collision, light sources and named
// spots/zones (spec §5; Plan 5 spec §3.1). A level is a set of maps, each authored in its own
// local tile coordinates and placed by an `offset` in its own region of one world, far enough
// apart that the camera never sees two at once. Spot and zone names are unique across maps and
// come out at their world positions, so the story names spots as before.
//
//   level = { maps: { id: map, ... }, doors?, locked?, spawn }
//   map   = { name?, detail?, offset: [x, z], camera?: 'outdoor'|'indoor', bounds?: { x, z, w, d },
//             floors, stairs, walls, roofs, windows, water, props, lights, zones, spots, extras?,
//             backdrop? }
//   doors:  [{ id, map, rect: { x, z, w, d }, to: spotName, face }]   rect in the map's local tiles;
//           walking into it takes the player to `to` (a spot on another map), facing `face`
//   locked: [{ id, spot }]          shut doors: Talk targets with a line (content), never passable
//   spawn:  spotName | [x, z] | [x, z, y]
// A level without `maps` is one map, 'main', at the origin (the Plan 2 sandbox).
//
// Map parts, all in tiles (1 = 32 texture px):
//   floors:  [{ x, z, w, d, y, tex, thick? }]            top surface at y
//   stairs:  [{ x, z, w, d, y0, y1, dir, tex }]           dir = high side n|s|e|w. No floor at y0 or
//            y1 may overlap a stair's footprint (buildWorld throws).
//   walls:   [{ x, z, w, d, y, h, tex, collide?, fadeIn? }]  solid boxes (fadeIn: as for props)
//   roofs:   [{ x, z, w, d, y, rise, tex, axis: 'x'|'z' }]  gable roofs (outdoor façades)
//   windows: [{ x, z, y, w, h, facing: 'n'|'s'|'e'|'w' }]   capiz panels set into a wall, glowing at night
//   water:   [{ x, z, w, d, y }]
//   props:   [{ type, x, z, y?, rot?, fadeIn?, ...opts }]  see art/props.js; fadeIn: zones in which the
//            prop fades (it stands between the camera and them)
//   lights:  [{ x, y, z, color, intensity, distance, flicker? }]
//   zones:   { name: { x, z, w, d, y0?, y1? } }
//   spots:   { name: [x, z] | [x, z, y] }
//   extras:  [{ id, costume, spot?, loop?, ... }]        background people (engine/extras.js)
//   backdrop: { z, x0, x1, seed, y?, scale? }             the painted city on the water's far edge (z,
//            at its level y), drawn at scale; hills and sky behind
//   zoneCameras: { zone: preset }                         zones framed differently (the azotea looks out)
import * as THREE from 'three';
import { createCollision, stairFloorOverlaps } from './collision.js';
import { makeProp, material, tiledBox } from '../art/props.js';
import { tileTexture, tileNormal, toTexture } from '../art/threeTextures.js';
import { paintSkyline, paintHills, paintSky, SKYLINE_HEIGHT } from '../art/backdrop.js';
import { textureSpan } from '../art/textures.js';

const FACING = { n: Math.PI, s: 0, e: Math.PI / 2, w: -Math.PI / 2 };
export const MAP_MARGIN = 4; // tiles around a map's bounds that still count as that map

// Shift a rectangle-like part ({ x, z, ... }) by an offset.
const moved = (part, [ox, oz]) => ({ ...part, x: part.x + ox, z: part.z + oz });

// The extent of a map's floors, in local tiles (used when a map gives no bounds).
function floorExtent(map) {
  const fs = map.floors ?? [];
  if (!fs.length) return { x: 0, z: 0, w: 0, d: 0 };
  const x0 = Math.min(...fs.map((f) => f.x));
  const z0 = Math.min(...fs.map((f) => f.z));
  const x1 = Math.max(...fs.map((f) => f.x + f.w));
  const z1 = Math.max(...fs.map((f) => f.z + f.d));
  return { x: x0, z: z0, w: x1 - x0, d: z1 - z0 };
}

export function buildWorld(level) {
  const maps = level.maps ?? { main: { ...level, offset: [0, 0] } };
  for (const [id, map] of Object.entries(maps)) {
    const [overlap] = stairFloorOverlaps(map);
    if (overlap) {
      const { floor: f, stair: s, end } = overlap;
      throw new Error(`Map '${id}': floor at y ${f.y} (x ${f.x}, z ${f.z}) overlaps the stair at x ${s.x}, z ${s.z} at its ${end}`);
    }
  }

  const group = new THREE.Group();
  const floors = [];
  const stairs = [];
  const blockers = [];
  const zones = {};
  const lightSources = [];
  const windowMaterials = [];
  const skyMaterials = [];
  const animated = [];
  const faders = [];
  // Let an object fade in zones: its own copies of its materials, so fading it leaves everything
  // else that shares them.
  const fadeWith = (object, zones) => {
    object.traverse((o) => {
      if (!o.material) return;
      o.material = o.material.clone();
      o.material.transparent = true;
    });
    faders.push({ object, zones, opacity: 1 });
  };
  const spotList = [];
  const extras = [];
  const info = {};

  // Collision over every map's floors, stairs and blockers, in world coordinates.
  for (const map of Object.values(maps)) {
    const off = map.offset ?? [0, 0];
    for (const f of map.floors ?? []) floors.push(moved(f, off));
    for (const s of map.stairs ?? []) stairs.push(moved(s, off));
    for (const [name, z] of Object.entries(map.zones ?? {})) zones[name] = moved(z, off);
  }
  const collision = createCollision({ floors, stairs, blockers, zones });

  for (const [id, map] of Object.entries(maps)) {
    const off = map.offset ?? [0, 0];
    const g = new THREE.Group();
    g.name = id;
    group.add(g);
    const b = moved(map.bounds ?? floorExtent(map), off);
    info[id] = { id, name: map.name ?? null, detail: map.detail ?? null, camera: map.camera ?? 'indoor', zoneCameras: map.zoneCameras ?? {}, bounds: b, group: g };

    for (const f0 of map.floors ?? []) {
      const f = moved(f0, off);
      const thick = f.thick ?? 0.25;
      const mesh = tiledBox(f.w, thick, f.d, material(f.tex));
      mesh.position.set(f.x + f.w / 2, f.y - thick / 2, f.z + f.d / 2);
      mesh.castShadow = false;
      g.add(mesh);
    }

    for (const s0 of map.stairs ?? []) {
      const s = moved(s0, off);
      const steps = Math.max(2, Math.round(Math.abs(s.y1 - s.y0) / 0.25));
      const alongZ = s.dir === 'n' || s.dir === 's';
      const len = alongZ ? s.d : s.w;
      for (let i = 0; i < steps; i++) {
        const top = s.y0 + ((s.y1 - s.y0) * (i + 1)) / steps;
        const t = (i + 0.5) / steps; // step i sits at the low end for i = 0
        const along = s.dir === 'n' || s.dir === 'w' ? len * (1 - t) : len * t;
        const stepLen = len / steps;
        const mesh = alongZ ? tiledBox(s.w, top, stepLen, material(s.tex)) : tiledBox(stepLen, top, s.d, material(s.tex));
        if (alongZ) mesh.position.set(s.x + s.w / 2, top / 2, s.z + along);
        else mesh.position.set(s.x + along, top / 2, s.z + s.d / 2);
        g.add(mesh);
      }
    }

    for (const w0 of map.walls ?? []) {
      const w = moved(w0, off);
      const mesh = tiledBox(w.w, w.h, w.d, material(w.tex));
      mesh.position.set(w.x + w.w / 2, w.y + w.h / 2, w.z + w.d / 2);
      g.add(mesh);
      if (w.fadeIn) fadeWith(mesh, w.fadeIn);
      if (w.collide !== false) blockers.push({ x: w.x, z: w.z, w: w.w, d: w.d, y0: w.y, y1: w.y + w.h });
    }

    for (const r0 of map.roofs ?? []) {
      const r = moved(r0, off);
      const roof = new THREE.Group();
      const along = r.axis === 'z' ? r.d : r.w;
      const span = r.axis === 'z' ? r.w : r.d;
      const slope = Math.hypot(span / 2, r.rise);
      const angle = Math.atan2(r.rise, span / 2);
      for (const side of [-1, 1]) {
        const panel = r.axis === 'z' ? tiledBox(slope, 0.12, along, material(r.tex)) : tiledBox(along, 0.12, slope, material(r.tex));
        if (r.axis === 'z') {
          panel.position.set(side * span / 4, r.rise / 2, 0);
          panel.rotation.z = -side * angle;
        } else {
          panel.position.set(0, r.rise / 2, side * span / 4);
          panel.rotation.x = side * angle;
        }
        roof.add(panel);
      }
      roof.position.set(r.x + r.w / 2, r.y, r.z + r.d / 2);
      g.add(roof);
    }

    for (const w0 of map.windows ?? []) {
      const w = moved(w0, off);
      const mat = new THREE.MeshLambertMaterial({ map: tileTexture('capiz'), emissive: new THREE.Color('#ffb060'), emissiveMap: tileTexture('capiz'), emissiveIntensity: 0 });
      windowMaterials.push(mat);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w.w, w.h), mat);
      mesh.position.set(w.x, w.y + w.h / 2, w.z);
      mesh.rotation.y = FACING[w.facing];
      g.add(mesh);
    }

    for (const wt of map.water ?? []) {
      const wtr = moved(wt, off);
      // A shiny surface whose swell (a normal map) drifts against the colour, so lamps and the
      // sky glint off moving ripples.
      const span = textureSpan('water');
      const tex = tileTexture('water').clone();
      tex.needsUpdate = true;
      tex.repeat.set(wtr.w / span, wtr.d / span);
      const normal = tileNormal('water');
      normal.repeat.set((wtr.w / span) * 1.5, (wtr.d / span) * 1.5);
      const mat = new THREE.MeshPhongMaterial({ map: tex, normalMap: normal, normalScale: new THREE.Vector2(0.7, 0.7), specular: new THREE.Color('#a8c8d0'), shininess: 70, transparent: true, opacity: 0.9 });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(wtr.w, wtr.d), mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(wtr.x + wtr.w / 2, wtr.y, wtr.z + wtr.d / 2);
      mesh.receiveShadow = true;
      animated.push({ kind: 'water', texture: tex, normal });
      g.add(mesh);
    }

    for (const p0 of map.props ?? []) {
      const p = moved(p0, off);
      const prop = makeProp(p.type, p);
      const y = p.y ?? collision.heightAt(p.x, p.z, p.floorY ?? 0) ?? 0;
      prop.object.position.set(p.x, y, p.z);
      g.add(prop.object);
      if (p.fadeIn) fadeWith(prop.object, p.fadeIn);
      if (prop.footprint && p.collide !== false) {
        // Solid from the floor under it, even when it stands raised on a dais.
        const floorY = collision.heightAt(p.x, p.z, p.floorY ?? 0) ?? y;
        blockers.push({ x: p.x - prop.footprint.w / 2, z: p.z - prop.footprint.d / 2, w: prop.footprint.w, d: prop.footprint.d, y0: Math.min(y, floorY), y1: y + 2 });
      }
      windowMaterials.push(...(prop.windows ?? [])); // glowing panes, lit by the time of day
      for (const l of prop.lights) lightSources.push({ ...l, map: id, position: [p.x + l.offset[0], y + l.offset[1], p.z + l.offset[2]] });
    }
    for (const l0 of map.lights ?? []) {
      const l = moved(l0, off);
      lightSources.push({ ...l, map: id, position: [l.x, l.y, l.z], flicker: l.flicker ?? 0 });
    }

    if (map.backdrop) g.add(buildBackdrop(moved(map.backdrop, off), map.backdrop, off, skyMaterials));
    const lowest = Math.min(0, ...(map.floors ?? []).map((f) => f.y - (f.thick ?? 0.25)), ...(map.stairs ?? []).map((s) => Math.min(s.y0, s.y1)), ...(map.water ?? []).map((w) => w.y));
    g.add(buildBase(b, map.camera ?? 'indoor', lowest - 0.1));
    if (level.maps) for (const c of buildCurtains(b, !map.backdrop && !(map.water ?? []).length)) g.add(c);

    for (const [name, s] of Object.entries(map.spots ?? {})) spotList.push([name, [s[0] + off[0], s[1] + off[1], s[2]]]);
    for (const e of map.extras ?? []) extras.push({ ...e, map: id });
  }

  const spots = {};
  for (const [name, s] of spotList) spots[name] = toPoint(s, collision);

  const mapAt = (p) => {
    for (const m of Object.values(info)) {
      const { x, z, w, d } = m.bounds;
      if (p.x >= x - MAP_MARGIN && p.x <= x + w + MAP_MARGIN && p.z >= z - MAP_MARGIN && p.z <= z + d + MAP_MARGIN) return m.id;
    }
    return null;
  };

  const doors = (level.doors ?? []).map((d) => ({ ...d, rect: moved(d.rect, maps[d.map]?.offset ?? [0, 0]) }));
  // The door whose rectangle the point stands in (on the same map).
  const doorAt = (p) => doors.find((d) => mapAt(p) === d.map && p.x >= d.rect.x && p.x <= d.rect.x + d.rect.w && p.z >= d.rect.z && p.z <= d.rect.z + d.rect.d) ?? null;

  const spawn = typeof level.spawn === 'string' ? spots[level.spawn]?.clone() : level.spawn ? toPoint(level.spawn, collision) : new THREE.Vector3();

  return { group, maps: info, mapAt, doors, doorAt, locked: level.locked ?? [], extras, collision, lightSources, windowMaterials, skyMaterials, animated, faders, spots, spawn: spawn ?? new THREE.Vector3(), zones };
}

function toPoint([x, z, y], collision) {
  return new THREE.Vector3(x, y ?? collision.heightAt(x, z, 0) ?? 0, z);
}

// The painted city behind a map (art/backdrop.js): the skyline (the muralla and the churches,
// domes and roofs of Intramuros over it) on a plane at z, lit like the world so it darkens with
// the evening; hazy hills further back; and a sky further still, unlit and unfogged, whose colour
// the frame loop sets to the time of day's (world.skyMaterials). The skyline stands at the far
// edge of the map's water (z), its foot at the water's level (y), so the wall always rises
// straight out of the river; it is painted at `scale` (a miniature, so it reads as distant).
// Hills and sky stand further back.
function buildBackdrop(at, spec, off, skyMaterials) {
  const g = new THREE.Group();
  const x0 = spec.x0 + off[0];
  const x1 = spec.x1 + off[0];
  const width = x1 - x0;
  const mid = (x0 + x1) / 2;
  const foot = spec.y ?? -0.5;
  const scale = spec.scale ?? 1;
  const plane = (canvas, w, h, x, y, z, mat) => {
    mat.map = toTexture(canvas);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(x, y + h / 2, z);
    return mesh;
  };

  const sky = new THREE.MeshBasicMaterial({ fog: false, depthWrite: false });
  skyMaterials.push(sky);
  const skyMesh = plane(paintSky({ seed: spec.seed }), width * 3, 70, mid, foot - 10, at.z - 60, sky);
  skyMesh.renderOrder = -1;
  skyMesh.userData.sky = true;
  g.add(skyMesh);

  const hills = paintHills({ width: Math.round(width * 1.8 * 4), seed: spec.seed + 1 });
  g.add(plane(hills, width * 1.8, hills.height / 4, mid, foot - 1, at.z - 30, new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.5 })));

  const city = paintSkyline({ x0: 0, x1: width / scale, seed: spec.seed });
  // Unfogged (the haze would wash it out); the lights still darken it at night. Its foot dips just
  // under the water so no seam shows.
  const skyline = plane(city, width, SKYLINE_HEIGHT * scale, mid, foot - 0.2, at.z, new THREE.MeshLambertMaterial({ alphaTest: 0.5, fog: false }));
  skyline.userData.skyline = true;
  g.add(skyline);

  g.userData.backdrop = true;
  return g;
}

// A dark ground under a map, reaching past its sides and open front (never north, where water or
// the backdrop lie), so the camera never sees empty sky below the edge of a room or street.
export const BASE_REACH = 30;
// y is below the map's lowest floor, stair and water, so none of them is ever hidden under it.
function buildBase(b, kind, y) {
  const w = b.w + BASE_REACH * 2;
  const d = b.d + BASE_REACH;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ color: kind === 'outdoor' ? '#1f1b18' : '#120d0a' }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(b.x + b.w / 2, y, b.z + d / 2);
  mesh.userData.base = true;
  return mesh;
}

// Tall dark walls just outside a map's sides (and behind a room with no view), so however wide the
// camera sees there is never a patch of sky past the map. A map with a backdrop or water keeps its
// north open for them.
export const CURTAIN_HEIGHT = 44;
function buildCurtains(b, closeNorth) {
  const dark = new THREE.MeshBasicMaterial({ color: '#0b0908', side: THREE.DoubleSide });
  const z0 = b.z - 4;
  const depth = b.d + BASE_REACH + 4;
  const make = (kind, w, x, z, ry) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, CURTAIN_HEIGHT), dark);
    m.position.set(x, CURTAIN_HEIGHT / 2 - 6, z);
    m.rotation.y = ry;
    m.userData.curtain = kind;
    return m;
  };
  const out = [
    make('west', depth, b.x - 0.6, z0 + depth / 2, Math.PI / 2),
    make('east', depth, b.x + b.w + 0.6, z0 + depth / 2, Math.PI / 2),
  ];
  if (closeNorth) out.push(make('north', b.w + BASE_REACH * 2, b.x + b.w / 2, b.z - 0.6, 0));
  return out;
}

// How far a prop fades while the player stands in one of its fadeIn zones.
export const FADED_OPACITY = 0.18;

// Per frame: ease each fading prop toward faded (the player is in one of its zones) or solid.
export function updateFades(world, zone, dt) {
  const k = 1 - Math.exp(-6 * dt);
  for (const f of world.faders) {
    const want = f.zones.includes(zone) ? FADED_OPACITY : 1;
    if (f.opacity === want) continue;
    f.opacity += (want - f.opacity) * k;
    if (Math.abs(f.opacity - want) < 0.002) f.opacity = want;
    f.object.traverse((o) => {
      if (!o.material) return;
      o.material.opacity = f.opacity;
      o.material.depthWrite = f.opacity === 1;
    });
  }
}

// Per-frame world animation (water: the colour drifts downstream, the ripples faster and across).
export function animateWorld(world, time) {
  for (const a of world.animated) {
    if (a.kind !== 'water') continue;
    a.texture.offset.set(time * 0.03, Math.sin(time * 0.5) * 0.02);
    a.normal?.offset.set(time * 0.05, time * 0.012 + Math.sin(time * 0.3) * 0.03);
  }
}
