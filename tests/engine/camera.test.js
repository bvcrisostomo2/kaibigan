import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { cameraOffset, clampDistance, clampFocus, framingDistance, frontReach, halfViewWidth, createFollowCamera, CAMERA_PRESETS, ZOOM_RANGE } from '../../src/engine/camera.js';

// The on-screen height (a fraction of the screen) of an upright unit standing at the target, and
// where its middle lands (0 = top of the screen, 1 = bottom).
function onScreen(cam, target) {
  cam.camera.updateMatrixWorld();
  const ndc = (y) => new THREE.Vector3(target.position.x, y, target.position.z).project(cam.camera).y;
  const feet = ndc(target.position.y);
  const head = ndc(target.position.y + 1);
  const middle = ndc(target.position.y + 0.8);
  return { height: (head - feet) / 2, y: (1 - middle) / 2 };
}

describe('camera math', () => {
  it('places the camera south of and above the target at the pitch', () => {
    const o = cameraOffset(30, 10);
    expect(o.x).toBe(0);
    expect(o.y).toBeCloseTo(5);
    expect(o.z).toBeCloseTo(10 * Math.cos(Math.PI / 6));
  });

  it('holds a scripted zoom near the framing distance', () => {
    expect(clampDistance(1, 10)).toBe(10 * ZOOM_RANGE.min);
    expect(clampDistance(999, 10)).toBe(10 * ZOOM_RANGE.max);
    expect(clampDistance(12, 10)).toBe(12);
  });

  it('brings a higher camera closer so upright things keep their size', () => {
    expect(framingDistance(38)).toBeLessThan(framingDistance(28));
    expect(framingDistance(0, 30, 0.1)).toBeCloseTo(1 / (2 * Math.tan(Math.PI / 12) * 0.1));
  });

  it('keeps the focus inside a map so the view never shows past its edges', () => {
    const bounds = { x: 0, z: 0, w: 40, d: 10 };
    expect(clampFocus({ x: 20, z: 5 }, bounds, 6)).toEqual({ x: 20, z: 5 });
    expect(clampFocus({ x: 1, z: -3 }, bounds, 6)).toEqual({ x: 6, z: 0 }); // west edge, north edge
    expect(clampFocus({ x: 39, z: 14 }, bounds, 6)).toEqual({ x: 34, z: 10 });
    expect(clampFocus({ x: 3, z: 5 }, { x: 0, z: 0, w: 8, d: 6 }, 6)).toEqual({ x: 4, z: 5 }); // narrower than the view: centred
    expect(clampFocus({ x: 3, z: 5 }, null, 6)).toEqual({ x: 3, z: 5 });
    expect(clampFocus({ x: 20, z: 9.5 }, bounds, 6, 2.5)).toEqual({ x: 20, z: 7.5 }); // held back from the open front
    expect(clampFocus({ x: 20, z: 1 }, { x: 0, z: 0, w: 40, d: 2 }, 6, 2.5)).toEqual({ x: 20, z: 0 });
  });

  it('measures half the view width at the focus', () => {
    expect(halfViewWidth(90, 1, 10)).toBeCloseTo(10);
    expect(halfViewWidth(30, 16 / 9, 13)).toBeCloseTo(Math.tan(Math.PI / 12) * 13 * 16 / 9);
  });

  it('measures how far in front of the focus the bottom of the screen meets the ground', () => {
    // Straight down (pitch 90): the bottom edge is fov/2 off vertical.
    expect(frontReach(90, 10, 0, 30)).toBeCloseTo(10 * Math.tan(Math.PI / 12));
    // With no field of view the bottom ray is the line of sight, which meets the ground at the focus.
    expect(frontReach(45, 10 * Math.SQRT2, 0, 0)).toBeCloseTo(0, 5);
    // Aiming higher brings the bottom edge in, closer to the focus.
    expect(frontReach(38, 13, 1.4)).toBeLessThan(frontReach(38, 13, 0));
  });

  it('has a low outdoor preset and a higher indoor one', () => {
    expect(CAMERA_PRESETS.outdoor.pitchDeg).toBeLessThan(CAMERA_PRESETS.indoor.pitchDeg);
  });
});

describe('createFollowCamera', () => {
  it('snaps to a target and follows it smoothly', () => {
    const cam = createFollowCamera(16 / 9);
    const target = new THREE.Object3D();
    cam.follow(target, { snap: true });
    expect(cam.camera.position.y).toBeGreaterThan(0);
    target.position.set(10, 0, 0);
    cam.update(1 / 60);
    const partial = cam.camera.position.x;
    expect(partial).toBeGreaterThan(0);
    expect(partial).toBeLessThan(10);
    for (let i = 0; i < 300; i++) cam.update(1 / 60);
    expect(cam.camera.position.x).toBeCloseTo(10, 2);
    expect(cam.subject).toBe(target.position);
  });

  it('has no manual zoom, and holds a scripted one within limits', () => {
    const cam = createFollowCamera(1);
    expect(cam.zoomBy).toBeUndefined();
    const base = cam.distance;
    cam.setDistance(1000);
    expect(cam.distance).toBeCloseTo(base * ZOOM_RANGE.max);
  });

  it('shows a character the same size indoors and outdoors, a little below the middle', () => {
    const cam = createFollowCamera(16 / 9);
    const target = new THREE.Object3D();
    cam.follow(target);
    cam.useMap('outdoor', null);
    const out = onScreen(cam, target);
    cam.useMap('indoor', null);
    const inside = onScreen(cam, target);
    expect(inside.height).toBeCloseTo(out.height, 2);
    for (const v of [out, inside]) {
      expect(v.y).toBeGreaterThan(0.5);
      expect(v.y).toBeLessThan(0.65);
    }
  });

  it('updates the projection on resize', () => {
    const cam = createFollowCamera(1);
    cam.resize(2);
    expect(cam.camera.aspect).toBe(2);
  });

  it("switches to a map's preset and bounds, snapping, and stops at the map's edge while following", () => {
    const cam = createFollowCamera(16 / 9);
    const target = new THREE.Object3D();
    target.position.set(401, 0, 4);
    cam.follow(target);
    cam.useMap('indoor', { x: 400, z: 0, w: 32, d: 9 });
    expect(cam.pitch).toBe(CAMERA_PRESETS.indoor.pitchDeg);
    const indoorDistance = framingDistance(CAMERA_PRESETS.indoor.pitchDeg);
    expect(cam.distance).toBeCloseTo(indoorDistance);
    const edge = 400 + halfViewWidth(30, 16 / 9, indoorDistance);
    // Held back from the open front just enough that the screen's bottom stops frontGap past it.
    target.position.set(420, 0, 9);
    cam.follow(target, { snap: true });
    const margin = frontReach(CAMERA_PRESETS.indoor.pitchDeg, indoorDistance, CAMERA_PRESETS.indoor.lookHeight) - CAMERA_PRESETS.indoor.frontGap;
    expect(cam.camera.position.z).toBeCloseTo(9 - margin + cameraOffset(CAMERA_PRESETS.indoor.pitchDeg, indoorDistance).z, 5);
    target.position.set(401, 0, 4);
    cam.follow(target, { snap: true });
    expect(cam.camera.position.x).toBeCloseTo(edge, 5); // snapped, held off the west wall's edge
    cam.useMap('outdoor', null);
    expect(cam.pitch).toBe(CAMERA_PRESETS.outdoor.pitchDeg);
    expect(cam.camera.position.x).toBeCloseTo(401, 5);
  });
});

describe('blending between framings', () => {
  it('eases from one preset to another (a zone with its own view), keeping characters the same size', () => {
    const cam = createFollowCamera(16 / 9);
    const target = new THREE.Object3D();
    cam.follow(target);
    cam.useMap('indoor', null);
    expect(cam.view).toBe('indoor');
    const before = onScreen(cam, target).height;
    cam.blendTo('outdoor');
    expect(cam.view).toBe('outdoor');
    cam.update(1 / 60);
    expect(cam.pitch).toBeLessThan(CAMERA_PRESETS.indoor.pitchDeg);
    expect(cam.pitch).toBeGreaterThan(CAMERA_PRESETS.outdoor.pitchDeg);
    for (let i = 0; i < 400; i++) cam.update(1 / 60);
    expect(cam.pitch).toBeCloseTo(CAMERA_PRESETS.outdoor.pitchDeg, 3);
    expect(onScreen(cam, target).height).toBeCloseTo(before, 2);
  });

  it('a map change snaps, cancelling a blend', () => {
    const cam = createFollowCamera(16 / 9);
    cam.follow(new THREE.Object3D());
    cam.useMap('indoor', null);
    cam.blendTo('outdoor');
    cam.useMap('indoor', null);
    for (let i = 0; i < 60; i++) cam.update(1 / 60);
    expect(cam.pitch).toBe(CAMERA_PRESETS.indoor.pitchDeg);
  });

  it('keeps a scripted zoom through a blend', () => {
    const cam = createFollowCamera(16 / 9);
    cam.follow(new THREE.Object3D());
    cam.useMap('indoor', null);
    cam.setDistance(cam.distance * 1.2);
    cam.blendTo('outdoor');
    for (let i = 0; i < 400; i++) cam.update(1 / 60);
    expect(cam.distance).toBeCloseTo(framingDistance(CAMERA_PRESETS.outdoor.pitchDeg) * 1.2, 3);
  });
});

describe('createFollowCamera with bad frame times', () => {
  it('ignores NaN and Infinity when following', () => {
    const cam = createFollowCamera(1);
    const target = new THREE.Object3D();
    cam.follow(target, { snap: true });
    target.position.set(4, 0, 0);
    cam.update(NaN);
    cam.update(Infinity);
    expect(cam.camera.position.x).toBe(0);
    for (let i = 0; i < 300; i++) cam.update(1 / 60);
    expect(cam.camera.position.x).toBeCloseTo(4, 2);
  });
});
