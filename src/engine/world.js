// Builds a level (plain data) into a three.js group plus collision, light sources and
// named spots/zones (spec §5). Level format, all in tile units (1 = 32 texture px):
//   floors:  [{ x, z, w, d, y, tex, thick? }]            top surface at y
//   stairs:  [{ x, z, w, d, y0, y1, dir, tex }]           dir = high side n|s|e|w. No floor at y0 may
//            overlap a stair's footprint: collision keeps actors at the nearest height, so the
//            floor would hide the ramp.
//   walls:   [{ x, z, w, d, y, h, tex, occluder?, collide? }]   solid boxes
//   roofs:   [{ x, z, w, d, y, rise, tex, axis: 'x'|'z' }]  gable roofs (always occluders)
//   windows: [{ x, z, y, w, h, facing: 'n'|'s'|'e'|'w' }]   capiz panels that glow at night
//   water:   [{ x, z, w, d, y }]
//   props:   [{ type, x, z, y?, rot?, ...opts }]           see art/props.js
//   lights:  [{ x, y, z, color, intensity, distance, flicker? }]
//   zones:   { name: { x, z, w, d, y0?, y1? } }
//   spots:   { name: [x, z] | [x, z, y] }
//   spawn:   [x, z] | [x, z, y]
import * as THREE from 'three';
import { createCollision } from './collision.js';
import { makeProp, material, tiledBox } from '../art/props.js';
import { tileTexture } from '../art/threeTextures.js';

const FACING = { n: Math.PI, s: 0, e: Math.PI / 2, w: -Math.PI / 2 };

export function buildWorld(level) {
  const group = new THREE.Group();
  const blockers = [];
  const lightSources = [];
  const occluders = [];
  const windowMaterials = [];
  const animated = [];

  for (const f of level.floors ?? []) {
    const thick = f.thick ?? 0.25;
    const mesh = tiledBox(f.w, thick, f.d, material(f.tex));
    mesh.position.set(f.x + f.w / 2, f.y - thick / 2, f.z + f.d / 2);
    mesh.castShadow = false;
    group.add(mesh);
  }

  for (const s of level.stairs ?? []) {
    const steps = Math.max(2, Math.round(Math.abs(s.y1 - s.y0) / 0.25));
    const alongZ = s.dir === 'n' || s.dir === 's';
    const len = alongZ ? s.d : s.w;
    for (let i = 0; i < steps; i++) {
      const top = s.y0 + ((s.y1 - s.y0) * (i + 1)) / steps;
      // Step i sits at the low end for i = 0.
      const t = (i + 0.5) / steps;
      const along = s.dir === 'n' || s.dir === 'w' ? len * (1 - t) : len * t;
      const stepLen = len / steps;
      const mesh = alongZ ? tiledBox(s.w, top, stepLen, material(s.tex)) : tiledBox(stepLen, top, s.d, material(s.tex));
      if (alongZ) mesh.position.set(s.x + s.w / 2, top / 2, s.z + along);
      else mesh.position.set(s.x + along, top / 2, s.z + s.d / 2);
      group.add(mesh);
    }
  }

  for (const w of level.walls ?? []) {
    // Occluders get their own material so fading one wall doesn't fade others.
    const mat = w.occluder === false ? material(w.tex) : material(w.tex).clone();
    const mesh = tiledBox(w.w, w.h, w.d, mat);
    mesh.position.set(w.x + w.w / 2, w.y + w.h / 2, w.z + w.d / 2);
    if (w.occluder !== false) {
      mesh.userData.occluder = true;
      occluders.push(mesh);
    }
    group.add(mesh);
    if (w.collide !== false) blockers.push({ x: w.x, z: w.z, w: w.w, d: w.d, y0: w.y, y1: w.y + w.h });
  }

  for (const r of level.roofs ?? []) {
    const roof = new THREE.Group();
    const along = r.axis === 'z' ? r.d : r.w;
    const span = r.axis === 'z' ? r.w : r.d;
    const slope = Math.hypot(span / 2, r.rise);
    const angle = Math.atan2(r.rise, span / 2);
    for (const side of [-1, 1]) {
      const mat = material(r.tex).clone();
      const panel = r.axis === 'z' ? tiledBox(slope, 0.12, along, mat) : tiledBox(along, 0.12, slope, mat);
      if (r.axis === 'z') {
        panel.position.set(side * span / 4, r.rise / 2, 0);
        panel.rotation.z = -side * angle;
      } else {
        panel.position.set(0, r.rise / 2, side * span / 4);
        panel.rotation.x = side * angle;
      }
      panel.userData.occluder = true;
      occluders.push(panel);
      roof.add(panel);
    }
    roof.position.set(r.x + r.w / 2, r.y, r.z + r.d / 2);
    group.add(roof);
  }

  for (const w of level.windows ?? []) {
    const mat = new THREE.MeshLambertMaterial({ map: tileTexture('capiz'), emissive: new THREE.Color('#ffb060'), emissiveMap: tileTexture('capiz'), emissiveIntensity: 0 });
    windowMaterials.push(mat);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w.w, w.h), mat);
    mesh.position.set(w.x, w.y + w.h / 2, w.z);
    mesh.rotation.y = FACING[w.facing];
    group.add(mesh);
  }

  for (const wtr of level.water ?? []) {
    const tex = tileTexture('water').clone();
    tex.needsUpdate = true;
    tex.repeat.set(wtr.w, wtr.d);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(wtr.w, wtr.d), new THREE.MeshLambertMaterial({ map: tex, transparent: true, opacity: 0.92 }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(wtr.x + wtr.w / 2, wtr.y, wtr.z + wtr.d / 2);
    mesh.receiveShadow = true;
    animated.push({ kind: 'water', texture: tex });
    group.add(mesh);
  }

  const collisionLevel = { floors: level.floors ?? [], stairs: level.stairs ?? [], blockers, zones: level.zones ?? {} };
  const collision = createCollision(collisionLevel);

  for (const p of level.props ?? []) {
    const prop = makeProp(p.type, p);
    const y = p.y ?? collision.heightAt(p.x, p.z, p.floorY ?? 0) ?? 0;
    prop.object.position.set(p.x, y, p.z);
    group.add(prop.object);
    if (prop.footprint && p.collide !== false) {
      blockers.push({ x: p.x - prop.footprint.w / 2, z: p.z - prop.footprint.d / 2, w: prop.footprint.w, d: prop.footprint.d, y0: y, y1: y + 2 });
    }
    for (const l of prop.lights) lightSources.push({ ...l, position: [p.x + l.offset[0], y + l.offset[1], p.z + l.offset[2]] });
  }
  for (const l of level.lights ?? []) lightSources.push({ ...l, position: [l.x, l.y, l.z], flicker: l.flicker ?? 0 });

  const spots = {};
  for (const [name, s] of Object.entries(level.spots ?? {})) spots[name] = toPoint(s, collision);
  const spawn = level.spawn ? toPoint(level.spawn, collision) : new THREE.Vector3();

  return { group, collision, lightSources, occluders, windowMaterials, animated, spots, spawn, zones: level.zones ?? {} };
}

function toPoint([x, z, y], collision) {
  return new THREE.Vector3(x, y ?? collision.heightAt(x, z, 0) ?? 0, z);
}

// Per-frame world animation (water drift).
export function animateWorld(world, time) {
  for (const a of world.animated) if (a.kind === 'water') a.texture.offset.set(time * 0.03, Math.sin(time * 0.5) * 0.02);
}
