import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { cameraOffset, clampDistance, createFollowCamera, CAMERA_DEFAULTS } from '../../src/engine/camera.js';

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

  it('fades walls between the camera and the player, and restores them', () => {
    const cam = createFollowCamera(1);
    cam.follow(new THREE.Vector3(0, 0, 0), { snap: true });
    cam.camera.updateMatrixWorld();
    const wall = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 0.4), new THREE.MeshBasicMaterial({ transparent: false, opacity: 1 }));
    wall.position.set(0, 1, 3);
    wall.updateMatrixWorld();
    for (let i = 0; i < 60; i++) cam.updateOccluders([wall], new THREE.Vector3(0, 0, 0), 1 / 30);
    expect(wall.material.opacity).toBeLessThan(0.5);
    expect(wall.material.transparent).toBe(true);
    expect(cam.fadedCount()).toBe(1);
    wall.position.set(50, 0, 50);
    wall.updateMatrixWorld();
    for (let i = 0; i < 60; i++) cam.updateOccluders([wall], new THREE.Vector3(0, 0, 0), 1 / 30);
    expect(wall.material.opacity).toBe(1);
    expect(cam.fadedCount()).toBe(0);
  });
});
