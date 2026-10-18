// Follow camera (spec §4.1; Plan 5 spec §3.2): looks north at a fixed pitch, follows a target
// smoothly and stops at the current map's edges so it never shows past them. Each map picks a
// preset: 'outdoor' (lower, house fronts square-on) or 'indoor' (higher, into a room open at the
// front); a zone may have its own (the azotea looks out over the creek), eased to with blendTo.
// Both keep a character the same size on screen (see framingDistance); there is no manual
// zoom, only the stage's scripted one. Interiors have no front wall, ceiling or roof; the few
// things that do stand between camera and player in some zone fade there (world.js fadeIn).
import * as THREE from 'three';

// spriteScale: the fraction of the screen's height one world unit standing upright at the focus
// takes up, the same on every map.
export const CAMERA_DEFAULTS = { fov: 30, pitchDeg: 38, spriteScale: 0.115, follow: 6, lookHeight: 1.4, frontGap: Infinity };

// How quickly a blend between framings eases (per second).
const BLEND_RATE = 3.5;

// How far a scripted zoom may go from a preset's distance, as fractions of it.
export const ZOOM_RANGE = { min: 0.7, max: 1.3 };

// lookHeight: how far above the player's feet the camera aims, which puts the player a little
// below the middle of the screen; frontGap: how far past a map's open front edge the bottom of the
// screen may reach (the focus stays back from the edge just enough for that, see frontReach).
export const CAMERA_PRESETS = {
  outdoor: { pitchDeg: 24, lookHeight: 1.4, frontGap: 1.5 },
  indoor: { pitchDeg: 42, lookHeight: 1.4, frontGap: 0.6 },
};

// Camera position relative to the target for a pitch (degrees down) and distance.
export function cameraOffset(pitchDeg, distance) {
  const p = (pitchDeg * Math.PI) / 180;
  return new THREE.Vector3(0, Math.sin(p) * distance, Math.cos(p) * distance);
}

// The distance at which an upright unit at the focus fills spriteScale of the screen's height for
// a pitch and vertical fov. Seen from higher up, upright things look shorter (by the pitch's
// cosine), so a higher camera comes closer.
export function framingDistance(pitchDeg, fovDeg = CAMERA_DEFAULTS.fov, spriteScale = CAMERA_DEFAULTS.spriteScale) {
  const p = (pitchDeg * Math.PI) / 180;
  return Math.cos(p) / (2 * Math.tan(((fovDeg / 2) * Math.PI) / 180) * spriteScale);
}

// How far in front of the focus the bottom edge of the screen meets the ground, for a camera at a
// pitch and distance aiming lookHeight above the focus.
export function frontReach(pitchDeg, distance, lookHeight, fovDeg = CAMERA_DEFAULTS.fov) {
  const p = (pitchDeg * Math.PI) / 180;
  const height = Math.sin(p) * distance;
  const back = Math.cos(p) * distance;
  const down = Math.atan2(height - lookHeight, back) + ((fovDeg / 2) * Math.PI) / 180;
  return back - height / Math.tan(down);
}

export function clampDistance(d, base) {
  return Math.max(base * ZOOM_RANGE.min, Math.min(base * ZOOM_RANGE.max, d));
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
  let zoom = 1; // a scripted zoom, as a fraction of the framing distance
  let distance = framingDistance(opts.pitchDeg, opts.fov, opts.spriteScale);
  let target = null; // an Object3D or Vector3 to follow
  let bounds = null;
  let view = null; // the preset name in use (or being blended to)
  let blend = null; // { pitchDeg, lookHeight, frontGap } being eased toward

  const presetOf = (preset) => (typeof preset === 'string' ? CAMERA_PRESETS[preset] ?? CAMERA_PRESETS.indoor : preset);
  function frame() {
    distance = framingDistance(opts.pitchDeg, opts.fov, opts.spriteScale) * zoom;
  }

  function targetPoint() {
    if (!target) return focus;
    return target.isVector3 ? target : target.position;
  }

  function goal() {
    const p = targetPoint();
    const margin = Math.max(0, frontReach(opts.pitchDeg, distance, opts.lookHeight, opts.fov) - opts.frontGap);
    const c = clampFocus(p, bounds, halfViewWidth(opts.fov, camera.aspect, distance), margin);
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
    get view() { return view; },
    // The point being followed (the player, or whoever a scene turns to): what the blur keeps sharp.
    get subject() { return targetPoint(); },
    follow(objOrPoint, { snap = false } = {}) {
      target = objOrPoint;
      if (snap) {
        focus.copy(goal());
        place();
      }
    },
    // Switch to a map's framing: a preset name or { pitchDeg, lookHeight, frontGap }, and the
    // map's bounds. Snaps (used under a transition's fade).
    useMap(preset, mapBounds = null) {
      Object.assign(opts, presetOf(preset));
      view = typeof preset === 'string' ? preset : null;
      blend = null;
      zoom = 1;
      frame();
      bounds = mapBounds;
      focus.copy(goal());
      place();
    },
    // Ease to another framing on the same map (a zone with its own view, like the azotea).
    blendTo(preset) {
      view = typeof preset === 'string' ? preset : null;
      blend = { ...presetOf(preset) };
    },
    // A scripted zoom (the stage's 'camera zoom'), held near the preset's framing.
    setDistance(d) {
      const base = framingDistance(opts.pitchDeg, opts.fov, opts.spriteScale);
      zoom = clampDistance(d, base) / base;
      frame();
    },
    resize(newAspect) {
      camera.aspect = newAspect;
      camera.updateProjectionMatrix();
    },
    update(dt) {
      if (!Number.isFinite(dt)) return;
      const k = 1 - Math.exp(-opts.follow * dt);
      if (blend) {
        const kb = 1 - Math.exp(-BLEND_RATE * dt);
        let done = true;
        for (const key of Object.keys(blend)) {
          const to = blend[key];
          const next = Number.isFinite(to) && Number.isFinite(opts[key]) ? opts[key] + (to - opts[key]) * kb : to;
          opts[key] = Math.abs(next - to) < 1e-4 ? to : next;
          if (opts[key] !== to) done = false;
        }
        if (done) blend = null;
        frame();
      }
      focus.lerp(goal(), k);
      place();
    },
  };
}
