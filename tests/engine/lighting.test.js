import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { TIMES, TIME_ORDER, blendTimes, flicker, nearestSources, createLighting } from '../../src/engine/lighting.js';

describe('time-of-day presets', () => {
  it('run dusk → evening → night, getting darker and lamp-lit', () => {
    expect(TIME_ORDER).toEqual(['dusk', 'evening', 'night']);
    expect(TIMES.dusk.sun.intensity).toBeGreaterThan(TIMES.night.sun.intensity);
    expect(TIMES.dusk.lamps).toBeLessThan(TIMES.night.lamps);
  });

  it('blend numbers, colours and arrays', () => {
    expect(blendTimes(TIMES.dusk, TIMES.night, 0)).toEqual(TIMES.dusk);
    const end = blendTimes(TIMES.dusk, TIMES.night, 1);
    expect(end.sun.intensity).toBeCloseTo(TIMES.night.sun.intensity);
    expect(end.background).toBe(TIMES.night.background);
    const mid = blendTimes(TIMES.dusk, TIMES.night, 0.5);
    expect(mid.lamps).toBeCloseTo((TIMES.dusk.lamps + TIMES.night.lamps) / 2);
    expect(mid.sun.dir[0]).toBeCloseTo((TIMES.dusk.sun.dir[0] + TIMES.night.sun.dir[0]) / 2);
  });
});

describe('flicker and the light pool', () => {
  it('flicker stays around 1 and is off at amount 0', () => {
    expect(flicker(3.2, 1, 0)).toBe(1);
    for (let t = 0; t < 10; t += 0.37) {
      const v = flicker(t, 2, 0.2);
      expect(v).toBeGreaterThanOrEqual(0.8);
      expect(v).toBeLessThanOrEqual(1.2);
    }
  });

  it('hands the pool to the nearest lamps', () => {
    const sources = [{ position: [10, 0, 0] }, { position: [1, 0, 0] }, { position: [5, 0, 0] }];
    expect(nearestSources(sources, { x: 0, y: 0, z: 0 }, 2)).toEqual([1, 2]);
  });
});

describe('createLighting', () => {
  const focus = new THREE.Vector3();

  it('blends to a new time over the given seconds, then resolves', async () => {
    const scene = new THREE.Scene();
    const lighting = createLighting(scene, { shadows: false, pointLights: 2 });
    let done = false;
    lighting.setTime('night', 2).then(() => (done = true));
    lighting.update(1, focus);
    expect(lighting.preset.lamps).toBeGreaterThan(TIMES.dusk.lamps);
    expect(lighting.preset.lamps).toBeLessThan(TIMES.night.lamps);
    lighting.update(1.5, focus);
    await Promise.resolve();
    expect(done).toBe(true);
    expect(lighting.preset.lamps).toBeCloseTo(TIMES.night.lamps);
    expect(scene.background.getHexString()).toBe(TIMES.night.background.slice(1));
  });

  it('jumps instantly with 0 seconds and rejects unknown times', async () => {
    const lighting = createLighting(new THREE.Scene(), { shadows: false, pointLights: 1 });
    await lighting.setTime('evening');
    expect(lighting.preset).toEqual(TIMES.evening);
    await expect(lighting.setTime('noon')).rejects.toThrow("Unknown time 'noon'");
  });

  it('lights the nearest sources and leaves spare lights off', () => {
    const scene = new THREE.Scene();
    const lighting = createLighting(scene, { shadows: false, pointLights: 3 });
    lighting.setSources([{ position: [1, 1, 1], color: '#ffaa00', intensity: 2, distance: 4, flicker: 0 }]);
    lighting.update(0.016, focus);
    const points = scene.children.filter((c) => c.isPointLight);
    expect(points).toHaveLength(3);
    expect(points.filter((l) => l.intensity > 0)).toHaveLength(1);
  });
});

describe('createLighting with bad frame times', () => {
  it('ignores NaN and Infinity and still finishes a blend', async () => {
    const focus = new THREE.Vector3();
    const lighting = createLighting(new THREE.Scene(), { shadows: false, pointLights: 1 });
    let done = false;
    lighting.setTime('night', 1).then(() => (done = true));
    lighting.update(NaN, focus);
    lighting.update(Infinity, focus);
    await Promise.resolve();
    expect(done).toBe(false);
    for (let i = 0; i < 40; i++) lighting.update(1 / 30, focus);
    await Promise.resolve();
    expect(done).toBe(true);
    expect(lighting.preset.lamps).toBeCloseTo(TIMES.night.lamps);
  });
});
