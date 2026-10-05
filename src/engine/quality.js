// Graphics quality presets and the low-FPS detector (spec §4.1, §7).
export const QUALITY = {
  low: { pixelRatio: 1, shadows: false, shadowMapSize: 0, bloom: false, tiltShift: false, pointLights: 4, particles: 60 },
  high: { pixelRatio: 2, shadows: true, shadowMapSize: 2048, bloom: true, tiltShift: true, pointLights: 8, particles: 260 },
};

// Phones and low-memory devices start on Low (spec §7).
export function defaultQuality({ coarsePointer = false, deviceMemory = 8 } = {}) {
  return coarsePointer || deviceMemory <= 4 ? 'low' : 'high';
}

export function detectDevice(win = globalThis) {
  return {
    coarsePointer: Boolean(win.matchMedia?.('(pointer: coarse)').matches),
    deviceMemory: win.navigator?.deviceMemory ?? 8,
  };
}

// Feed frame times; returns true ONCE when a full window averages under the threshold.
// Seconds between two frame timestamps (ms), clamped to 0..max; 0 for a bad timestamp.
export function frameDt(now, last, max = 0.1) {
  const dt = (now - last) / 1000;
  return Number.isFinite(dt) ? Math.min(Math.max(0, dt), max) : 0;
}

export function createFpsMonitor({ threshold = 30, seconds = 5 } = {}) {
  let elapsed = 0;
  let frames = 0;
  let fired = false;
  return {
    sample(dt) {
      if (fired) return false;
      elapsed += dt;
      frames += 1;
      if (elapsed < seconds) return false;
      const fps = frames / elapsed;
      elapsed = 0;
      frames = 0;
      if (fps < threshold) {
        fired = true;
        return true;
      }
      return false;
    },
    reset() {
      elapsed = 0;
      frames = 0;
      fired = false;
    },
  };
}
