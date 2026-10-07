// Follow camera (spec §4.1; Plan 5 spec §3.2): looks north at a fixed pitch, follows a target
// smoothly, zooms within limits, and stops at the current map's edges so it never shows past
// them. Each map picks a preset: 'outdoor' (low, house fronts square-on) or 'indoor' (higher,
// into a room open at the front). Nothing between camera and player needs fading: interiors have
// no front wall, ceiling or roof.
import * as THREE from 'three';

export const CAMERA_DEFAULTS = { fov: 30, pitchDeg: 38, distance: 15, minDistance: 9, maxDistance: 21, follow: 6, lookHeight: 0.8, frontMargin: 0 };

// lookHeight: how far above the player the camera aims (outdoors higher, to take in the roofs
// and the city behind); frontMargin: how far the focus stays back from a map's open front edge.
export const CAMERA_PRESETS = {
  outdoor: { pitchDeg: 26, distance: 19, minDistance: 15, maxDistance: 23, lookHeight: 4.4, frontMargin: 1 },
  indoor: { pitchDeg: 42, distance: 13, minDistance: 10, maxDistance: 16, lookHeight: 0.8, frontMargin: 2.5 },
};

// Camera position relative to the target for a pitch (degrees down) and distance.
export function cameraOffset(pitchDeg, distance) {
  const p = (pitchDeg * Math.PI) / 180;
  return new THREE.Vector3(0, Math.sin(p) * distance, Math.cos(p) * distance);
}

export function clampDistance(d, opts = CAMERA_DEFAULTS) {
  return Math.max(opts.minDistance, Math.min(opts.maxDistance, d));
}

// Half the width of the view at the focus, for a vertical fov, aspect and distance.
export function halfViewWidth(fovDeg, aspect, distance) {
  return Math.tan(((fovDeg / 2) * Math.PI) / 180) * distance * aspect;
}

// The focus point kept inside bounds ({ x, z, w, d }): x so the view's half-width stays within
// the map (centred when the map is narrower than the view), z within the map's depth and at least
// frontMargin back from its open front edge.
export function clampFocus(point, bounds, halfWidth, frontMargin = 0) {
  if (!bounds) return { x: point.x, z: point.z };
  const x0 = bounds.x + halfWidth;
  const x1 = bounds.x + bounds.w - halfWidth;
  const x = x0 > x1 ? bounds.x + bounds.w / 2 : Math.min(x1, Math.max(x0, point.x));
  const front = Math.max(bounds.z, bounds.z + bounds.d - frontMargin);
  const z = Math.min(front, Math.max(bounds.z, point.z));
  return { x, z };
}

export function createFollowCamera(aspect, options = {}) {
  const opts = { ...CAMERA_DEFAULTS, ...options };
  const camera = new THREE.PerspectiveCamera(opts.fov, aspect, 0.1, 200);
  const focus = new THREE.Vector3();
  let distance = opts.distance;
  let target = null; // an Object3D or Vector3 to follow
  let bounds = null;

  function targetPoint() {
    if (!target) return focus;
    return target.isVector3 ? target : target.position;
  }

  function goal() {
    const p = targetPoint();
    const c = clampFocus(p, bounds, halfViewWidth(opts.fov, camera.aspect, distance), opts.frontMargin);
    return new THREE.Vector3(c.x, p.y, c.z);
  }

  function place() {
    camera.position.copy(focus).add(cameraOffset(opts.pitchDeg, distance));
    camera.lookAt(focus.x, focus.y + opts.lookHeight, focus.z);
  }

  return {
    camera,
    get distance() { return distance; },
    get pitch() { return opts.pitchDeg; },
    follow(objOrPoint, { snap = false } = {}) {
      target = objOrPoint;
      if (snap) {
        focus.copy(goal());
        place();
      }
    },
    // Switch to a map's framing: a preset name or { pitchDeg, distance, minDistance, maxDistance },
    // and the map's bounds. Snaps (used under a transition's fade).
    useMap(preset, mapBounds = null) {
      Object.assign(opts, typeof preset === 'string' ? CAMERA_PRESETS[preset] ?? CAMERA_PRESETS.indoor : preset);
      distance = opts.distance;
      bounds = mapBounds;
      focus.copy(goal());
      place();
    },
    zoomBy(delta) {
      distance = clampDistance(distance + delta, opts);
    },
    setDistance(d) {
      distance = clampDistance(d, opts);
    },
    resize(newAspect) {
      camera.aspect = newAspect;
      camera.updateProjectionMatrix();
    },
    update(dt) {
      if (!Number.isFinite(dt)) return;
      const k = 1 - Math.exp(-opts.follow * dt);
      focus.lerp(goal(), k);
      place();
    },
  };
}
