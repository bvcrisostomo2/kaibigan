// Low-poly props built from boxes with pixel textures (spec §4.1).
// Every factory returns { object, footprint: { w, d } | null, lights: [LightSource] }.
// A LightSource is { offset: [x, y, z], color, intensity, distance, flicker } relative to the prop.
// The house's furnishings and the street's things live in furnishings.js (Plan 5a).
import * as THREE from 'three';
import { toTexture } from './threeTextures.js';
import { PixelCanvas, rng, shade } from './pixel.js';
import { material, tiledBox, at, emissiveBox, WARM } from './meshes.js';
import { FURNISHINGS } from './furnishings.js';

export { material, tiledBox };

function table({ w = 3, d = 1.2, cloth = true }) {
  const g = new THREE.Group();
  const h = 0.8;
  g.add(at(tiledBox(w, 0.1, d, material(cloth ? 'tablecloth' : 'narra')), 0, h, 0));
  if (cloth) g.add(at(tiledBox(w + 0.04, 0.3, d + 0.04, material('tablecloth')), 0, h - 0.15, 0));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(at(tiledBox(0.1, h, 0.1, material('wood')), sx * (w / 2 - 0.1), h / 2, sz * (d / 2 - 0.1)));
  return { object: g, footprint: { w, d }, lights: [] };
}

function chair() {
  const g = new THREE.Group();
  g.add(at(tiledBox(0.5, 0.08, 0.5, material('narra')), 0, 0.45, 0));
  g.add(at(tiledBox(0.5, 0.55, 0.06, material('wood')), 0, 0.75, -0.22));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(at(tiledBox(0.06, 0.45, 0.06, material('wood')), sx * 0.2, 0.22, sz * 0.2));
  return { object: g, footprint: { w: 0.5, d: 0.5 }, lights: [] };
}

function piano() {
  const g = new THREE.Group();
  g.add(at(tiledBox(1.6, 1.3, 0.6, material('wood')), 0, 0.65, 0));
  g.add(at(tiledBox(1.4, 0.06, 0.25, material('#f1ece0')), 0, 0.75, 0.4));
  g.add(at(tiledBox(1.4, 0.03, 0.08, material('#18161a')), 0, 0.79, 0.33));
  return { object: g, footprint: { w: 1.6, d: 0.9 }, lights: [] };
}

function sofa({ w = 2 }) {
  const g = new THREE.Group();
  const red = material('#7a2e2e');
  g.add(at(tiledBox(w, 0.4, 0.8, red), 0, 0.2, 0));
  g.add(at(tiledBox(w, 0.6, 0.15, red), 0, 0.6, -0.33));
  g.add(at(tiledBox(0.15, 0.55, 0.8, material('wood')), -w / 2, 0.3, 0));
  g.add(at(tiledBox(0.15, 0.55, 0.8, material('wood')), w / 2, 0.3, 0));
  return { object: g, footprint: { w, d: 0.8 }, lights: [] };
}

function chandelier() {
  const g = new THREE.Group();
  g.add(at(tiledBox(0.04, 0.8, 0.04, material('#3a3028')), 0, 0.4, 0));
  g.add(at(tiledBox(1.0, 0.06, 1.0, material('#b8943e')), 0, 0, 0));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    g.add(at(emissiveBox(0.06, 0.16, 0.06, '#fff0c8', 2.2), Math.cos(a) * 0.42, 0.12, Math.sin(a) * 0.42));
  }
  return { object: g, footprint: null, lights: [{ offset: [0, -0.2, 0], color: WARM, intensity: 6, distance: 7, flicker: 0.06 }] };
}

function candles() {
  const g = new THREE.Group();
  g.add(at(tiledBox(0.3, 0.05, 0.1, material('#b8943e')), 0, 0, 0));
  for (const dx of [-0.1, 0, 0.1]) g.add(at(emissiveBox(0.04, 0.14, 0.04, '#fff0c8', 2.2), dx, 0.1, 0));
  return { object: g, footprint: null, lights: [{ offset: [0, 0.25, 0], color: WARM, intensity: 2.5, distance: 4, flicker: 0.12 }] };
}

function lantern() {
  const g = new THREE.Group();
  g.add(at(tiledBox(0.12, 2.6, 0.12, material('#26221f')), 0, 1.3, 0));
  g.add(at(tiledBox(0.5, 0.06, 0.12, material('#26221f')), 0.2, 2.55, 0));
  g.add(at(emissiveBox(0.22, 0.3, 0.22, '#ffcf7a', 2.0), 0.4, 2.35, 0));
  return { object: g, footprint: { w: 0.3, d: 0.3 }, lights: [{ offset: [0.4, 2.25, 0], color: WARM, intensity: 7, distance: 8, flicker: 0.1 }] };
}

function wallLantern() {
  const g = new THREE.Group();
  g.add(at(tiledBox(0.08, 0.08, 0.3, material('#26221f')), 0, 0, 0.12));
  g.add(at(emissiveBox(0.2, 0.28, 0.2, '#ffcf7a', 2.0), 0, -0.15, 0.3));
  return { object: g, footprint: null, lights: [{ offset: [0, -0.15, 0.5], color: WARM, intensity: 4, distance: 6, flicker: 0.1 }] };
}

// A small procedural landscape for paintings, seeded so each painting differs.
function paintingTexture(seed) {
  const r = rng(seed);
  const c = new PixelCanvas(16, 12);
  const sky = shade('#d9a66b', (r() - 0.5) * 0.3);
  for (let y = 0; y < 12; y++) for (let x = 0; x < 16; x++) c.set(x, y, y < 6 ? shade(sky, -y * 0.04) : y < 9 ? '#4d6a3a' : '#2f4a5a');
  const hill = 3 + Math.floor(r() * 3);
  for (let x = 0; x < 16; x++) for (let y = hill + Math.round(Math.sin(x / 3 + seed) * 1.5); y < 7; y++) c.set(x, y, '#3d5534');
  return toTexture(c);
}

function painting({ w = 1.2, h = 0.9, seed = 1 }) {
  const g = new THREE.Group();
  g.add(at(tiledBox(w + 0.12, h + 0.12, 0.05, material('#9a7432')), 0, 0, 0));
  const canvas = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: paintingTexture(seed) }));
  canvas.position.z = 0.03;
  g.add(canvas);
  return { object: g, footprint: null, lights: [] };
}

function mirror({ w = 0.9, h = 1.4 }) {
  const g = new THREE.Group();
  g.add(at(tiledBox(w + 0.12, h + 0.12, 0.05, material('#b8943e')), 0, 0, 0));
  g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ color: '#a9c2c9', emissive: '#2c3a40' })), 0, 0, 0.03));
  return { object: g, footprint: null, lights: [] };
}

function plant() {
  const g = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.4, 8), material('#a2532f'));
  pot.position.y = 0.2;
  pot.castShadow = true;
  g.add(pot);
  const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), material('#4f7a34', { flatShading: true }));
  leaves.position.y = 0.75;
  leaves.castShadow = true;
  g.add(leaves);
  return { object: g, footprint: { w: 0.5, d: 0.5 }, lights: [] };
}

function crate() {
  return { object: at(tiledBox(0.8, 0.8, 0.8, material('wood')), 0, 0.4, 0), footprint: { w: 0.8, d: 0.8 }, lights: [] };
}

function barrel() {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.9, 10), material('wood'));
  m.position.y = 0.45;
  m.castShadow = true;
  return { object: m, footprint: { w: 0.65, d: 0.65 }, lights: [] };
}

function bench({ w = 1.8 }) {
  const g = new THREE.Group();
  g.add(at(tiledBox(w, 0.08, 0.45, material('narra')), 0, 0.45, 0));
  g.add(at(tiledBox(0.08, 0.45, 0.4, material('wood')), -w / 2 + 0.15, 0.22, 0));
  g.add(at(tiledBox(0.08, 0.45, 0.4, material('wood')), w / 2 - 0.15, 0.22, 0));
  return { object: g, footprint: { w, d: 0.45 }, lights: [] };
}

function cabinet({ w = 1.4 }) {
  const g = new THREE.Group();
  g.add(at(tiledBox(w, 2, 0.5, material('wood')), 0, 1, 0));
  g.add(at(tiledBox(w - 0.2, 0.9, 0.02, material('capiz')), 0, 1.4, 0.26));
  return { object: g, footprint: { w, d: 0.5 }, lights: [] };
}

function door({ w = 1.2, h = 2.4 }) {
  return { object: at(tiledBox(w, h, 0.12, material('wood')), 0, h / 2, 0), footprint: null, lights: [] };
}

export const PROPS = { table, chair, piano, sofa, chandelier, candles, lantern, wallLantern, painting, mirror, plant, crate, barrel, bench, cabinet, door, ...FURNISHINGS };

// Build a prop by type. `rot` is in quarter turns (0–3); footprints rotate with it.
export function makeProp(type, opts = {}) {
  const make = PROPS[type];
  if (!make) throw new Error(`Unknown prop '${type}'`);
  const prop = make(opts);
  const rot = ((opts.rot ?? 0) % 4 + 4) % 4;
  prop.object.rotation.y = -rot * (Math.PI / 2);
  if (prop.footprint && rot % 2 === 1) prop.footprint = { w: prop.footprint.d, d: prop.footprint.w };
  prop.lights = prop.lights.map((l) => {
    const v = new THREE.Vector3(...l.offset).applyAxisAngle(new THREE.Vector3(0, 1, 0), prop.object.rotation.y);
    return { ...l, offset: [v.x, v.y, v.z] };
  });
  return prop;
}
