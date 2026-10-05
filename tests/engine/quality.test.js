import { describe, it, expect } from 'vitest';
import { QUALITY, defaultQuality, detectDevice, createFpsMonitor, frameDt } from '../../src/engine/quality.js';

describe('quality presets', () => {
  it('Low drops the expensive effects', () => {
    expect(QUALITY.low).toMatchObject({ shadows: false, bloom: false, tiltShift: false });
    expect(QUALITY.high).toMatchObject({ shadows: true, bloom: true, tiltShift: true });
    expect(QUALITY.low.pointLights).toBeLessThan(QUALITY.high.pointLights);
    expect(QUALITY.low.particles).toBeLessThan(QUALITY.high.particles);
  });

  it('phones and low-memory devices start on Low', () => {
    expect(defaultQuality({ coarsePointer: true })).toBe('low');
    expect(defaultQuality({ deviceMemory: 4 })).toBe('low');
    expect(defaultQuality({ coarsePointer: false, deviceMemory: 8 })).toBe('high');
    expect(defaultQuality()).toBe('high');
  });

  it('detects the device from a window-like object', () => {
    const win = { matchMedia: () => ({ matches: true }), navigator: { deviceMemory: 2 } };
    expect(detectDevice(win)).toEqual({ coarsePointer: true, deviceMemory: 2 });
    expect(detectDevice({})).toEqual({ coarsePointer: false, deviceMemory: 8 });
  });
});

describe('createFpsMonitor', () => {
  it('fires once after a slow window, then stays quiet', () => {
    const m = createFpsMonitor({ threshold: 30, seconds: 5 });
    let fired = 0;
    for (let i = 0; i < 300; i++) if (m.sample(1 / 20)) fired++; // 15 s at 20 fps
    expect(fired).toBe(1);
  });

  it('does not fire at a good frame rate', () => {
    const m = createFpsMonitor();
    for (let i = 0; i < 600; i++) expect(m.sample(1 / 60)).toBe(false);
  });

  it('can be reset', () => {
    const m = createFpsMonitor({ seconds: 1 });
    for (let i = 0; i < 10; i++) m.sample(0.2);
    m.reset();
    let fired = false;
    for (let i = 0; i < 10; i++) fired ||= m.sample(0.2);
    expect(fired).toBe(true);
  });
});

describe('frameDt', () => {
  it('turns two timestamps (ms) into a clamped frame time in seconds', () => {
    expect(frameDt(1016, 1000)).toBeCloseTo(0.016);
    expect(frameDt(5000, 1000)).toBe(0.1);
    expect(frameDt(5000, 1000, 0.25)).toBe(0.25);
    expect(frameDt(1000, 1016)).toBe(0);
  });

  it('returns 0 for bad timestamps (NaN, Infinity, missing)', () => {
    expect(frameDt(NaN, 1000)).toBe(0);
    expect(frameDt(1000, undefined)).toBe(0);
    expect(frameDt(Infinity, 1000)).toBe(0);
  });
});
