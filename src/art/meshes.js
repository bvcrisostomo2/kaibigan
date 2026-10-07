// Mesh building blocks shared by the prop modules (props.js, furnishings.js).
import * as THREE from 'three';
import { tileTexture } from './threeTextures.js';

const matCache = new Map();

// Lambert material with a tiled texture or flat colour; cached so props share materials.
export function material(texOrColor, extra = {}) {
  const key = texOrColor + JSON.stringify(extra);
  if (!matCache.has(key)) {
    const opts = texOrColor.startsWith('#') ? { color: texOrColor } : { map: tileTexture(texOrColor) };
    matCache.set(key, new THREE.MeshLambertMaterial({ ...opts, ...extra }));
  }
  return matCache.get(key);
}

// A box whose texture tiles once per world unit on every face (instead of stretching).
export function tiledBox(w, h, d, mat) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const uv = geo.attributes.uv;
  // Face order: +x, -x, +y, -y, +z, -z (4 vertices each).
  const sizes = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) {
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v;
      uv.setXY(i, uv.getX(i) * sizes[f][0], uv.getY(i) * sizes[f][1]);
    }
  }
  uv.needsUpdate = true;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function at(mesh, x, y, z) {
  mesh.position.set(x, y, z);
  return mesh;
}

// An unlit, glowing box (flames, lamp glass).
export function emissiveBox(w, h, d, color, intensity = 1.6) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) }));
}

// A simple lathe-like round shape: a cylinder (radius top/bottom) with the given colour.
export function round(rTop, rBottom, h, color, segments = 10) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, segments), material(color));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function ball(r, color, { flat = false, detail = 1 } = {}) {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, detail), material(color, flat ? { flatShading: true } : {}));
  m.castShadow = true;
  return m;
}

export const WARM = '#ffb35c';
