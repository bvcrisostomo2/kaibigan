// Atmosphere particles (spec §4.1): warm dust motes that drift around the camera focus, and
// blinking fireflies outdoors at night. Counts come from the quality preset.
import * as THREE from 'three';

function softDot() {
  const size = 16;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot((x - 7.5) / 7.5, (y - 7.5) / 7.5);
      const a = Math.max(0, 1 - d) ** 2;
      data.set([255, 255, 255, Math.round(a * 255)], (y * size + x) * 4);
    }
  }
  const tex = new THREE.DataTexture(data, size, size);
  tex.needsUpdate = true;
  return tex;
}

// Wrap v into [-half, half) around 0 (pure).
export function wrap(v, half) {
  const span = half * 2;
  return ((((v + half) % span) + span) % span) - half;
}

const BOX = { x: 9, y: 3.5, z: 7 }; // half-extents of the volume around the focus

function makeCloud(count, color, size, seed) {
  const positions = new Float32Array(count * 3);
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (r() * 2 - 1) * BOX.x;
    positions[i * 3 + 1] = r() * BOX.y * 2;
    positions[i * 3 + 2] = (r() * 2 - 1) * BOX.z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ map: softDot(), color, size, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6, fog: false });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return points;
}

export function createParticles(scene, { count = 200 } = {}) {
  const dust = makeCloud(count, '#ffd9a0', 0.09, 7);
  const flies = makeCloud(Math.max(8, Math.round(count / 8)), '#d9ff8a', 0.16, 13);
  scene.add(dust, flies);
  const base = new THREE.Vector3();
  let time = 0;

  return {
    // focus: camera focus point; preset: current lighting preset; outdoors: show fireflies.
    update(dt, focus, preset, { outdoors = false } = {}) {
      time += dt;
      base.copy(focus);
      dust.position.set(0, 0, 0);
      const p = dust.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = wrap(p.getX(i) + Math.sin(time * 0.3 + i) * dt * 0.08 - focus.x, BOX.x) + focus.x;
        const y = ((p.getY(i) - focus.y + dt * 0.05) % (BOX.y * 2) + BOX.y * 2) % (BOX.y * 2) + focus.y;
        const z = wrap(p.getZ(i) - focus.z, BOX.z) + focus.z;
        p.setXYZ(i, x, y, z);
      }
      p.needsUpdate = true;
      dust.material.opacity = 0.25 + 0.35 * (1 - preset.lamps * 0.5);

      flies.visible = outdoors && preset.lamps > 0.6;
      if (flies.visible) {
        const f = flies.geometry.attributes.position;
        for (let i = 0; i < f.count; i++) {
          const x = wrap(f.getX(i) + Math.sin(time * 0.7 + i * 3) * dt * 0.4 - focus.x, BOX.x) + focus.x;
          const z = wrap(f.getZ(i) + Math.cos(time * 0.6 + i * 5) * dt * 0.4 - focus.z, BOX.z) + focus.z;
          f.setXYZ(i, x, focus.y + 0.6 + Math.abs(Math.sin(time * 0.5 + i)) * 1.8, z);
        }
        f.needsUpdate = true;
        flies.material.opacity = 0.5 + 0.5 * Math.sin(time * 3);
      }
    },
  };
}
