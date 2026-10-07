import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { cameraOffset, clampDistance, clampFocus, halfViewWidth, createFollowCamera, CAMERA_DEFAULTS, CAMERA_PRESETS } from '../../src/engine/camera.js';

describe('camera math', () => {
  it('places the camera south of and above the target at the pitch', () => {
    const o = cameraOffset(30, 10);
    expect(o.x).toBe(0);
    expect(o.y).toBeCloseTo(5);
    expect(o.z).toBeCloseTo(10 * Math.cos(Math.PI / 6));
  });

  it('clamps zoom distance', () => {
    expect(clampDistance(1)).toBe(CAMERA_DEFAULTS.minDistance);
    expect(clampDistance(999)).toBe(CAMERA_DEFAULTS.maxDistance);
    expect(clampDistance(12)).toBe(12);
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

  it('has a low outdoor preset and a higher, closer indoor one', () => {
    expect(CAMERA_PRESETS.outdoor.pitchDeg).toBe(26);
    expect(CAMERA_PRESETS.indoor.pitchDeg).toBe(42);
    expect(CAMERA_PRESETS.indoor.distance).toBeLessThan(CAMERA_PRESETS.outdoor.distance);
    expect(CAMERA_PRESETS.outdoor.lookHeight).toBeGreaterThan(CAMERA_PRESETS.indoor.lookHeight); // roofs and the skyline outdoors
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
  });

  it('zooms within limits', () => {
    const cam = createFollowCamera(1);
    cam.zoomBy(-100);
    expect(cam.distance).toBe(CAMERA_DEFAULTS.minDistance);
    cam.setDistance(1000);
    expect(cam.distance).toBe(CAMERA_DEFAULTS.maxDistance);
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
    expect(cam.pitch).toBe(42);
    expect(cam.distance).toBe(CAMERA_PRESETS.indoor.distance);
    const edge = 400 + halfViewWidth(30, 16 / 9, CAMERA_PRESETS.indoor.distance);
    expect(cam.camera.position.x).toBeCloseTo(edge, 5); // snapped, held off the west wall's edge
    cam.setDistance(100);
    expect(cam.distance).toBe(CAMERA_PRESETS.indoor.maxDistance);
    cam.useMap('outdoor', null);
    expect(cam.pitch).toBe(CAMERA_PRESETS.outdoor.pitchDeg);
    expect(cam.camera.position.x).toBeCloseTo(401, 5);
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
