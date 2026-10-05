// Time-of-day lighting (spec §4.1): presets for dusk → evening → night, smooth blends, flickering
// candles/lanterns, and a pool of real point lights handed to the lamps nearest the camera focus
// (the rest still glow via their emissive meshes).
import * as THREE from 'three';

export const TIMES = {
  dusk: {
    sun: { color: '#ffb36e', intensity: 2.6, dir: [-0.65, 0.45, 0.5] },
    hemi: { sky: '#f3c09a', ground: '#4b3a36', intensity: 1.0 },
    fog: { color: '#d99b74', near: 34, far: 90 },
    background: '#e2a57a',
    lamps: 0.3,
    windows: 0.15,
    grade: { warmth: 0.08, saturation: 1.1, vignette: 0.32 },
  },
  evening: {
    sun: { color: '#ff8c5c', intensity: 1.1, dir: [-0.85, 0.28, 0.35] },
    hemi: { sky: '#8d6c9c', ground: '#2a2230', intensity: 0.7 },
    fog: { color: '#6b5272', near: 28, far: 78 },
    background: '#5e4b6e',
    lamps: 0.8,
    windows: 0.65,
    grade: { warmth: 0.05, saturation: 1.06, vignette: 0.4 },
  },
  night: {
    sun: { color: '#93a8d8', intensity: 0.4, dir: [0.35, 0.75, 0.4] },
    hemi: { sky: '#2e385c', ground: '#15131f', intensity: 0.5 },
    fog: { color: '#1c2138', near: 22, far: 64 },
    background: '#151b30',
    lamps: 1,
    windows: 1,
    grade: { warmth: 0.02, saturation: 0.96, vignette: 0.5 },
  },
};
export const TIME_ORDER = ['dusk', 'evening', 'night'];

const lerp = (a, b, t) => a + (b - a) * t;
const lerpColor = (a, b, t) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();

// Blend two presets (pure). Numbers and colours interpolate; arrays element-wise.
export function blendTimes(a, b, t) {
  const walk = (x, y) => {
    if (typeof x === 'number') return lerp(x, y, t);
    if (typeof x === 'string') return lerpColor(x, y, t);
    if (Array.isArray(x)) return x.map((v, i) => lerp(v, y[i], t));
    return Object.fromEntries(Object.keys(x).map((k) => [k, walk(x[k], y[k])]));
  };
  return walk(a, b);
}

// Candle/lantern flicker multiplier around 1 (pure, deterministic per seed).
export function flicker(time, seed, amount) {
  if (!amount) return 1;
  const n = Math.sin(time * 7.3 + seed) * 0.5 + Math.sin(time * 13.1 + seed * 2.3) * 0.3 + Math.sin(time * 23.7 + seed * 0.7) * 0.2;
  return 1 + amount * n;
}

// Indices of the `count` light sources closest to `focus` (pure).
export function nearestSources(sources, focus, count) {
  return sources
    .map((s, i) => ({ i, d: (s.position[0] - focus.x) ** 2 + (s.position[1] - focus.y) ** 2 + (s.position[2] - focus.z) ** 2 }))
    .sort((a, b) => a.d - b.d)
    .slice(0, count)
    .map((e) => e.i);
}

export function createLighting(scene, { shadows = true, shadowMapSize = 2048, pointLights = 8 } = {}) {
  const hemi = new THREE.HemisphereLight();
  const sun = new THREE.DirectionalLight();
  sun.castShadow = shadows;
  if (shadows) {
    sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);
    Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 60 });
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
  }
  scene.add(hemi, sun, sun.target);
  scene.fog = new THREE.Fog('#000000', 30, 80);

  const pool = Array.from({ length: pointLights }, () => {
    const l = new THREE.PointLight('#ffb35c', 0, 6, 1.6);
    scene.add(l);
    return l;
  });

  let sources = [];
  let current = structuredClone(TIMES.dusk);
  let tween = null;
  let assigned = [];
  let reassignIn = 0;
  let clock = 0;

  function apply(p, focus) {
    hemi.color.set(p.hemi.sky);
    hemi.groundColor.set(p.hemi.ground);
    hemi.intensity = p.hemi.intensity;
    sun.color.set(p.sun.color);
    sun.intensity = p.sun.intensity;
    const d = new THREE.Vector3(...p.sun.dir).normalize().multiplyScalar(30);
    sun.position.copy(focus).add(d);
    sun.target.position.copy(focus);
    scene.fog.color.set(p.fog.color);
    scene.fog.near = p.fog.near;
    scene.fog.far = p.fog.far;
    scene.background = new THREE.Color(p.background);
  }

  return {
    get preset() { return current; },
    setSources(list) {
      sources = list;
      reassignIn = 0;
    },
    // Jump (seconds = 0) or blend to a named time of day. Resolves when done.
    setTime(name, seconds = 0) {
      const target = TIMES[name];
      if (!target) return Promise.reject(new Error(`Unknown time '${name}'`));
      if (seconds <= 0) {
        current = structuredClone(target);
        tween = null;
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        tween = { from: structuredClone(current), to: target, t: 0, seconds, resolve };
      });
    },
    update(dt, focus) {
      if (!Number.isFinite(dt)) dt = 0;
      clock += dt;
      if (tween) {
        tween.t = Math.min(1, tween.t + dt / tween.seconds);
        current = blendTimes(tween.from, tween.to, tween.t);
        if (tween.t >= 1) {
          const done = tween.resolve;
          tween = null;
          done();
        }
      }
      apply(current, focus);
      reassignIn -= dt;
      if (reassignIn <= 0) {
        assigned = nearestSources(sources, focus, pool.length);
        reassignIn = 0.25;
      }
      pool.forEach((light, k) => {
        const s = sources[assigned[k]];
        if (!s) {
          light.intensity = 0;
          return;
        }
        light.position.set(...s.position);
        light.color.set(s.color);
        light.distance = s.distance;
        light.intensity = s.intensity * current.lamps * flicker(clock, assigned[k] * 1.7, s.flicker ?? 0);
      });
    },
  };
}
