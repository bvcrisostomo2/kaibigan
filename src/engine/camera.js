// Fixed-tilt follow camera (spec §4.1): looks north at a fixed pitch, follows a target smoothly,
// zooms within limits, and fades walls/roofs that come between it and the player (dollhouse).
import * as THREE from 'three';

export const CAMERA_DEFAULTS = { fov: 30, pitchDeg: 38, distance: 15, minDistance: 9, maxDistance: 21, follow: 6 };

// Camera position relative to the target for a pitch (degrees down) and distance.
export function cameraOffset(pitchDeg, distance) {
  const p = (pitchDeg * Math.PI) / 180;
  return new THREE.Vector3(0, Math.sin(p) * distance, Math.cos(p) * distance);
}

export function clampDistance(d, opts = CAMERA_DEFAULTS) {
  return Math.max(opts.minDistance, Math.min(opts.maxDistance, d));
}

export function createFollowCamera(aspect, options = {}) {
  const opts = { ...CAMERA_DEFAULTS, ...options };
  const camera = new THREE.PerspectiveCamera(opts.fov, aspect, 0.1, 200);
  const focus = new THREE.Vector3();
  let distance = opts.distance;
  let target = null; // an Object3D or Vector3 to follow
  const ray = new THREE.Raycaster();
  const faded = new Set();

  function targetPoint() {
    if (!target) return focus;
    return target.isVector3 ? target : target.position;
  }

  function place() {
    camera.position.copy(focus).add(cameraOffset(opts.pitchDeg, distance));
    camera.lookAt(focus.x, focus.y + 0.8, focus.z);
  }

  return {
    camera,
    get distance() { return distance; },
    follow(objOrPoint, { snap = false } = {}) {
      target = objOrPoint;
      if (snap) {
        focus.copy(targetPoint());
        place();
      }
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
      focus.lerp(targetPoint(), k);
      place();
    },
    // Fade occluders between the camera and `point` (the player's chest). Call once per frame.
    updateOccluders(occluders, point, dt) {
      const hits = new Set();
      for (const yOff of [0.4, 1.2]) {
        const p = new THREE.Vector3(point.x, point.y + yOff, point.z);
        const dir = p.clone().sub(camera.position);
        const len = dir.length();
        ray.set(camera.position, dir.normalize());
        ray.far = len - 0.3;
        for (const h of ray.intersectObjects(occluders, false)) hits.add(h.object);
      }
      const speed = Number.isFinite(dt) ? Math.min(1, Math.max(0, dt * 6)) : 0;
      for (const mesh of occluders) {
        const want = hits.has(mesh) ? 0.15 : 1;
        const m = mesh.material;
        const next = m.opacity + (want - m.opacity) * speed;
        m.opacity = Math.abs(next - want) < 0.01 ? want : next;
        const transparent = m.opacity < 0.999;
        if (m.transparent !== transparent) {
          m.transparent = transparent;
          m.depthWrite = !transparent;
          m.needsUpdate = true;
        }
        if (transparent) faded.add(mesh);
        else faded.delete(mesh);
        mesh.castShadow = !transparent;
      }
    },
    fadedCount() {
      return faded.size;
    },
  };
}
