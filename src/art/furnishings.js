// The house's furnishings and the street's things (Plan 5 spec §3.4): low-poly props built from
// boxes, cylinders and spheres, in the props.js format { object, footprint: { w, d } | null,
// lights }. Rizal's caída details (Chinese lanterns, birdcages without birds, coloured glass
// globes, dried botete fish) hang from a `y` given in the level.
import * as THREE from 'three';
import { material, tiledBox, at, emissiveBox, round, ball, WARM } from './meshes.js';
import { PixelCanvas } from './pixel.js';
import { toTexture } from './threeTextures.js';

const DARK_WOOD = '#4a3020';
const CLAY = '#b0603a';
const STRAW = '#c9a25a';
const BURLAP = '#c9b48a';

// ---- The zaguán: a working storehouse ----

// A calesa: a light two-wheeled carriage, parked with its shafts down.
function calesa() {
  const g = new THREE.Group();
  g.add(at(tiledBox(1.3, 0.7, 1.1, material('#2a2420')), 0, 1.0, 0.1));
  g.add(at(tiledBox(1.3, 0.9, 0.08, material('#2a2420')), 0, 1.55, -0.4));
  g.add(at(tiledBox(1.35, 0.06, 1.2, material('#5a1e1e')), 0, 1.36, 0.05));
  for (const sx of [-0.72, 0.72]) {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 6, 16), material(DARK_WOOD));
    wheel.rotation.y = Math.PI / 2;
    wheel.position.set(sx, 0.62, 0.1);
    g.add(wheel);
    g.add(at(tiledBox(0.04, 1.2, 0.04, material(DARK_WOOD)), sx, 0.62, 0.1));
  }
  for (const sx of [-0.45, 0.45]) {
    const shaft = tiledBox(0.07, 0.07, 1.8, material(DARK_WOOD));
    shaft.position.set(sx, 0.45, 1.4);
    shaft.rotation.x = 0.35;
    g.add(shaft);
  }
  return { object: g, footprint: { w: 1.6, d: 2.6 }, lights: [] };
}

function sack() {
  const s = ball(0.32, BURLAP, { flat: true });
  s.scale.set(1, 0.75, 0.8);
  s.position.y = 0.24;
  return { object: s, footprint: { w: 0.6, d: 0.5 }, lights: [] };
}

// A heap of sacks of rice and sugar.
function sacks() {
  const g = new THREE.Group();
  for (const [x, y, z] of [[-0.3, 0.24, 0], [0.32, 0.24, 0.05], [0, 0.6, 0.02], [0.05, 0.24, -0.4]]) {
    const s = ball(0.32, BURLAP, { flat: true });
    s.scale.set(1, 0.75, 0.8);
    s.position.set(x, y, z);
    g.add(s);
  }
  return { object: g, footprint: { w: 1.3, d: 1 }, lights: [] };
}

function firewood({ w = 1.4 }) {
  const g = new THREE.Group();
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 5 - row; i++) {
      const log = round(0.09, 0.09, w, '#8a6a42', 6);
      log.rotation.z = Math.PI / 2;
      log.position.set(0, 0.1 + row * 0.17, -0.36 + i * 0.18 + row * 0.09);
      g.add(log);
    }
  }
  return { object: g, footprint: { w, d: 0.9 }, lights: [] };
}

// A tinaja: a big clay water jar.
function tinaja() {
  const g = new THREE.Group();
  const body = ball(0.36, CLAY);
  body.scale.set(1, 1.2, 1);
  body.position.y = 0.42;
  g.add(body);
  g.add(at(round(0.18, 0.22, 0.12, CLAY), 0, 0.86, 0));
  return { object: g, footprint: { w: 0.7, d: 0.7 }, lights: [] };
}

// A palayok: a small round clay cooking pot.
function palayok() {
  const p = ball(0.2, '#8a4a2a');
  p.scale.set(1, 0.8, 1);
  p.position.y = 0.16;
  return { object: p, footprint: null, lights: [] };
}

// A bilao: a round, flat winnowing basket.
function bilao() {
  return { object: at(round(0.38, 0.32, 0.06, STRAW, 14), 0, 0.03, 0), footprint: null, lights: [] };
}

// Shelves on a wall, lined with jars and pots.
function shelf({ w = 2 }) {
  const g = new THREE.Group();
  for (const y of [0.6, 1.3, 2.0]) {
    g.add(at(tiledBox(w, 0.06, 0.4, material('wood')), 0, y, 0));
    for (let i = 0; i < Math.floor(w / 0.35); i++) {
      const jar = round(0.1, 0.12, 0.28, i % 3 === 0 ? '#5a6a4a' : i % 3 === 1 ? CLAY : '#d8d0b8', 8);
      jar.position.set(-w / 2 + 0.2 + i * 0.35, y + 0.17, 0);
      g.add(jar);
    }
  }
  for (const sx of [-1, 1]) g.add(at(tiledBox(0.06, 2.1, 0.4, material('wood')), sx * (w / 2 - 0.03), 1.05, 0));
  return { object: g, footprint: { w, d: 0.4 }, lights: [] };
}

// A coiled rope.
function rope() {
  const r = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.07, 6, 14), material('#b8a070'));
  r.rotation.x = Math.PI / 2;
  r.position.y = 0.07;
  return { object: r, footprint: null, lights: [] };
}

// A saint's niche in the wall, with a small figure and a votive candle.
function niche() {
  const g = new THREE.Group();
  g.add(at(tiledBox(0.6, 0.8, 0.2, material('#e8dcc4')), 0, 0, 0));
  g.add(at(tiledBox(0.14, 0.4, 0.1, material('#3a5a8a')), 0, 0, 0.12));
  g.add(at(ball(0.07, '#e0b890'), 0, 0.25, 0.12));
  g.add(at(emissiveBox(0.04, 0.08, 0.04, '#ffd890', 2), 0.18, -0.3, 0.14));
  return { object: g, footprint: null, lights: [{ offset: [0.18, -0.25, 0.3], color: WARM, intensity: 1.2, distance: 2.5, flicker: 0.2 }] };
}

// A sleeping cat, curled up.
function cat() {
  const g = new THREE.Group();
  const body = ball(0.16, '#e0a050', { flat: true });
  body.scale.set(1.3, 0.7, 1);
  body.position.y = 0.1;
  g.add(body);
  g.add(at(ball(0.09, '#e0a050', { flat: true }), 0.17, 0.16, 0.04));
  return { object: g, footprint: null, lights: [] };
}

// ---- The upper floor: the party ----

// The wooden arches of the caída, "half Chinese and half European", along x. Posts and a lintel
// with fretwork; the level adds the posts' collision.
function arches({ w = 8, count = 3, h = 2.8 }) {
  const g = new THREE.Group();
  const span = w / count;
  for (let i = 0; i <= count; i++) g.add(at(tiledBox(0.22, h, 0.22, material(DARK_WOOD)), -w / 2 + i * span, h / 2, 0));
  g.add(at(tiledBox(w + 0.22, 0.26, 0.24, material(DARK_WOOD)), 0, h + 0.13, 0));
  for (let i = 0; i < count; i++) {
    const cx = -w / 2 + span * (i + 0.5);
    for (let k = 0; k < 5; k++) {
      const a = Math.PI * (k / 4);
      g.add(at(tiledBox(0.12, 0.12, 0.08, material('#6a4a2a')), cx + Math.cos(a) * (span / 2 - 0.25), h - 0.35 + Math.sin(a) * 0.35, 0));
    }
    g.add(at(tiledBox(span - 0.5, 0.06, 0.06, material('#c9a03a')), cx, h - 0.05, 0.1));
  }
  return { object: g, footprint: null, lights: [] };
}

// A low balustrade along x, with turned balusters.
function balustrade({ w = 6 }) {
  const g = new THREE.Group();
  g.add(at(tiledBox(w, 0.1, 0.24, material('#d8ccb4')), 0, 0.85, 0));
  g.add(at(tiledBox(w, 0.08, 0.24, material('#d8ccb4')), 0, 0.06, 0));
  for (let x = -w / 2 + 0.2; x <= w / 2 - 0.2; x += 0.35) g.add(at(round(0.05, 0.07, 0.74, '#e6dcc6', 6), x, 0.46, 0));
  return { object: g, footprint: { w, d: 0.3 }, lights: [] };
}

// A paper lantern hanging from y (the level sets y to the hook), glowing.
function paperLantern({ color = '#e05a3a' }) {
  const g = new THREE.Group();
  g.add(at(tiledBox(0.02, 0.4, 0.02, material('#2a2420')), 0, 0.2, 0));
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.4) }));
  body.scale.set(1, 1.25, 1);
  g.add(body);
  return { object: g, footprint: null, lights: [{ offset: [0, 0, 0], color, intensity: 1.6, distance: 3.5, flicker: 0.08 }] };
}

// A birdcage without a bird, hanging.
function birdcage() {
  const g = new THREE.Group();
  g.add(at(tiledBox(0.02, 0.35, 0.02, material('#2a2420')), 0, 0.42, 0));
  g.add(at(round(0.2, 0.2, 0.04, '#b8943e', 10), 0, -0.25, 0));
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#b8943e', wireframe: true }));
  dome.position.y = 0.05;
  g.add(dome);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.add(at(tiledBox(0.015, 0.3, 0.015, material('#b8943e')), Math.cos(a) * 0.19, -0.1, Math.sin(a) * 0.19));
  }
  return { object: g, footprint: null, lights: [] };
}

// A globe of frosted coloured glass, hanging.
function glassGlobe({ color = '#3a7ab8' }) {
  const g = new THREE.Group();
  g.add(at(tiledBox(0.02, 0.4, 0.02, material('#2a2420')), 0, 0.3, 0));
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.75, emissive: color, emissiveIntensity: 0.25 })));
  return { object: g, footprint: null, lights: [] };
}

// A dried, inflated botete (pufferfish), hanging.
function botete() {
  const g = new THREE.Group();
  g.add(at(tiledBox(0.02, 0.35, 0.02, material('#2a2420')), 0, 0.3, 0));
  const fish = ball(0.15, '#c8b078', { flat: true, detail: 0 });
  fish.scale.set(1.3, 1, 1);
  g.add(fish);
  g.add(at(tiledBox(0.12, 0.1, 0.02, material('#b09868')), 0.2, 0, 0));
  return { object: g, footprint: null, lights: [] };
}

// A sideboard laden with dishes.
function sideboard({ w = 2 }) {
  const g = new THREE.Group();
  g.add(at(tiledBox(w, 0.9, 0.5, material('wood')), 0, 0.45, 0));
  for (let i = 0; i < 4; i++) g.add(at(round(0.14, 0.12, 0.04, '#eef0f2', 12), -w / 2 + 0.3 + i * (w - 0.6) / 3, 0.93, 0));
  g.add(at(round(0.1, 0.1, 0.3, '#e8dcc4', 10), 0, 1.05, -0.1));
  return { object: g, footprint: { w, d: 0.5 }, lights: [] };
}

// A tall floor candelabrum.
function candelabrum() {
  const g = new THREE.Group();
  g.add(at(round(0.04, 0.12, 1.5, '#b8943e', 8), 0, 0.75, 0));
  for (const dx of [-0.2, 0, 0.2]) g.add(at(emissiveBox(0.04, 0.14, 0.04, '#fff0c8', 2.2), dx, 1.6, 0));
  g.add(at(tiledBox(0.5, 0.04, 0.06, material('#b8943e')), 0, 1.5, 0));
  return { object: g, footprint: { w: 0.4, d: 0.4 }, lights: [{ offset: [0, 1.7, 0], color: WARM, intensity: 2.5, distance: 4.5, flicker: 0.12 }] };
}

// A rug with a woven pattern (flat on the floor, walkable).
function rugTexture(color) {
  const c = new PixelCanvas(16, 16);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const border = x < 2 || y < 2 || x > 13 || y > 13;
      const diamond = Math.abs(x - 7.5) + Math.abs(y - 7.5) < 5 && (x + y) % 2 === 0;
      c.set(x, y, border ? '#c9a03a' : diamond ? '#e8d8b0' : color);
    }
  }
  return toTexture(c);
}
function rug({ w = 4, d = 3, color = '#7a2e2e' }) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: rugTexture(color) }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.02;
  m.receiveShadow = true;
  return { object: m, footprint: null, lights: [] };
}

// A low platform (the piano's dais).
function dais({ w = 2.4, d = 1.6 }) {
  return { object: at(tiledBox(w, 0.18, d, material('narra')), 0, 0.09, 0), footprint: null, lights: [] };
}

// A trellised arbour with climbing leaves.
function arbour({ w = 2 }) {
  const g = new THREE.Group();
  for (const sx of [-1, 1]) g.add(at(tiledBox(0.1, 2.2, 0.1, material('wood')), sx * w / 2, 1.1, 0));
  for (let i = 0; i < 5; i++) g.add(at(tiledBox(w + 0.2, 0.05, 0.06, material('wood')), 0, 2.2, -0.4 + i * 0.2));
  for (let i = 0; i < 6; i++) g.add(at(ball(0.28, '#4f7a34', { flat: true, detail: 0 }), -w / 2 + (i * w) / 5, 2.25, (i % 2) * 0.3 - 0.15));
  return { object: g, footprint: { w: 0.3, d: 0.3 }, lights: [] };
}

// A potted palm.
function palm() {
  const g = new THREE.Group();
  g.add(at(round(0.24, 0.18, 0.45, '#a2532f', 8), 0, 0.22, 0));
  g.add(at(round(0.05, 0.06, 1.0, '#7a6a3a', 6), 0, 0.9, 0));
  for (let i = 0; i < 6; i++) {
    const leaf = tiledBox(0.9, 0.03, 0.18, material('#3f7a34'));
    leaf.position.set(0, 1.4, 0);
    leaf.rotation.set(0, (i / 6) * Math.PI * 2, -0.5);
    leaf.translateX(0.4);
    g.add(leaf);
  }
  return { object: g, footprint: { w: 0.5, d: 0.5 }, lights: [] };
}

// A wooden washing tub.
function washTub() {
  return { object: at(round(0.42, 0.36, 0.4, '#8a6a42', 12), 0, 0.2, 0), footprint: { w: 0.85, d: 0.85 }, lights: [] };
}

// ---- The kusina ----

// The kalan: a raised clay hearth with the fire glowing under two pots.
function kalan({ w = 2.2 }) {
  const g = new THREE.Group();
  g.add(at(tiledBox(w, 0.85, 0.9, material('#8a5a3a')), 0, 0.42, 0));
  g.add(at(tiledBox(w - 0.4, 0.25, 0.5, material('#3a2a20')), 0, 0.95, 0));
  for (const dx of [-0.45, 0.45]) {
    g.add(at(emissiveBox(0.3, 0.12, 0.3, '#ff8a2a', 2.2), dx, 0.85, 0.2));
    const pot = ball(0.26, '#2a2420');
    pot.scale.set(1, 0.8, 1);
    pot.position.set(dx, 1.22, 0);
    g.add(pot);
  }
  return { object: g, footprint: { w, d: 0.9 }, lights: [{ offset: [0, 0.9, 0.5], color: '#ff8a3a', intensity: 3, distance: 4, flicker: 0.3 }] };
}

// A chopping block.
function choppingBlock() {
  return { object: at(round(0.3, 0.32, 0.6, '#9a7a50', 10), 0, 0.3, 0), footprint: { w: 0.6, d: 0.6 }, lights: [] };
}

// ---- The oratorio ----

// A tiered altar crowded with saints' images, flowers and candles.
function altar({ w = 2.4 }) {
  const g = new THREE.Group();
  for (let tier = 0; tier < 3; tier++) g.add(at(tiledBox(w - tier * 0.5, 0.35, 0.6 - tier * 0.12, material(tier === 0 ? '#e8dcc4' : '#d8c8a8')), 0, 0.17 + tier * 0.35, -tier * 0.1));
  const robes = ['#3a5a8a', '#8a2a2a', '#5a3a6a', '#2a5a3a', '#c9a03a'];
  for (let i = 0; i < 5; i++) {
    const tier = i % 3;
    const x = -w / 2 + 0.35 + i * (w - 0.7) / 4;
    g.add(at(tiledBox(0.16, 0.42, 0.12, material(robes[i])), x, 0.35 * (tier + 1) + 0.21, -tier * 0.1));
    g.add(at(ball(0.07, '#e0b890'), x, 0.35 * (tier + 1) + 0.48, -tier * 0.1));
  }
  for (const dx of [-w / 2 + 0.15, w / 2 - 0.15]) g.add(at(emissiveBox(0.05, 0.2, 0.05, '#fff0c8', 2.2), dx, 0.47, 0.2));
  return { object: g, footprint: { w, d: 0.7 }, lights: [{ offset: [0, 1.2, 0.5], color: WARM, intensity: 3, distance: 4.5, flicker: 0.15 }] };
}

// A prie-dieu: a kneeler for prayer.
function kneeler() {
  const g = new THREE.Group();
  g.add(at(tiledBox(0.7, 0.12, 0.35, material('#6a2a2a')), 0, 0.1, 0.15));
  g.add(at(tiledBox(0.7, 0.8, 0.08, material('wood')), 0, 0.4, -0.15));
  return { object: g, footprint: { w: 0.7, d: 0.5 }, lights: [] };
}

// ---- The street and the riverbank ----

// A vendor's stall: a table under an awning, heaped with fruit and kakanin.
function stall({ w = 2 }) {
  const g = new THREE.Group();
  g.add(at(tiledBox(w, 0.08, 0.9, material('wood')), 0, 0.85, 0));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(at(tiledBox(0.08, sz < 0 ? 2.2 : 1.8, 0.08, material('wood')), sx * (w / 2 - 0.05), sz < 0 ? 1.1 : 0.9, sz * 0.4));
  const awning = tiledBox(w + 0.3, 0.05, 1.3, material('#b8402a'));
  awning.position.set(0, 2.05, 0.1);
  awning.rotation.x = 0.25;
  g.add(awning);
  const goods = ['#e8b030', '#7aa040', '#e07030', '#f0e0b0'];
  for (let i = 0; i < 8; i++) g.add(at(ball(0.11, goods[i % 4]), -w / 2 + 0.25 + (i % 4) * (w - 0.5) / 3, 0.98, i < 4 ? -0.15 : 0.18));
  return { object: g, footprint: { w, d: 0.9 }, lights: [] };
}

// A carromata: a small two-wheeled hooded cart.
function carromata() {
  const g = new THREE.Group();
  g.add(at(tiledBox(1.1, 0.5, 1.6, material('#5a3a24')), 0, 0.85, 0));
  const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.2, 10, 1, true, 0, Math.PI), material('#3a3028', { side: THREE.DoubleSide }));
  hood.rotation.z = Math.PI / 2;
  hood.rotation.y = Math.PI / 2;
  hood.position.set(0, 1.1, -0.1);
  g.add(hood);
  for (const sx of [-0.62, 0.62]) {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 6, 14), material(DARK_WOOD));
    wheel.rotation.y = Math.PI / 2;
    wheel.position.set(sx, 0.5, 0);
    g.add(wheel);
  }
  return { object: g, footprint: { w: 1.4, d: 1.8 }, lights: [] };
}

function mooringPost() {
  return { object: at(round(0.14, 0.17, 0.9, '#5a4a3a', 8), 0, 0.45, 0), footprint: { w: 0.35, d: 0.35 }, lights: [] };
}

// A banca: a dugout boat, sitting on the water at the level's y.
function banca({ len = 3.2 }) {
  const g = new THREE.Group();
  const hull = tiledBox(0.7, 0.35, len, material('#6a4a2a'));
  hull.position.y = 0.1;
  g.add(hull);
  for (const sz of [-1, 1]) {
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 4), material('#6a4a2a'));
    tip.rotation.x = sz * Math.PI / 2;
    tip.position.set(0, 0.1, sz * (len / 2 + 0.28));
    g.add(tip);
  }
  for (const sx of [-1, 1]) g.add(at(tiledBox(0.06, 0.06, len * 0.8, material('#d8c8a0')), sx * 0.7, 0.15, 0));
  return { object: g, footprint: null, lights: [] };
}

// A stilt house for the far bank: a nipa house on posts over the water.
function stiltHouse({ w = 3, d = 2.5, seed = 0 }) {
  const g = new THREE.Group();
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(at(tiledBox(0.12, 1.6, 0.12, material(DARK_WOOD)), sx * (w / 2 - 0.1), 0.2, sz * (d / 2 - 0.1)));
  g.add(at(tiledBox(w, 1.6, d, material(seed % 2 ? '#a08a5a' : '#8a7a50')), 0, 1.8, 0));
  g.add(at(emissiveBox(0.5, 0.4, 0.02, '#ffb060', 1.2), (seed % 3) - 1, 1.9, d / 2 + 0.02));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, 1.3, 4), material('#6a5a3a', { flatShading: true }));
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 3.25;
  g.add(roof);
  return { object: g, footprint: { w, d }, lights: [] };
}

export const FURNISHINGS = {
  calesa, sack, sacks, firewood, tinaja, palayok, bilao, shelf, rope, niche, cat,
  arches, balustrade, paperLantern, birdcage, glassGlobe, botete, sideboard, candelabrum, rug, dais, arbour, palm, washTub,
  kalan, choppingBlock, altar, kneeler,
  stall, carromata, mooringPost, banca, stiltHouse,
};
