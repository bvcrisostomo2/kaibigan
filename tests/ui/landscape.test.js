import { describe, it, expect, vi } from 'vitest';
import { lockLandscape, keepLandscape } from '../../src/ui/landscape.js';

// A fake document and screen: fullscreen and the orientation lock either work or refuse.
function fakes({ fullscreen = true, lock = true } = {}) {
  const listeners = {};
  const doc = {
    fullscreenElement: null,
    documentElement: {
      requestFullscreen: fullscreen ? vi.fn(async () => { doc.fullscreenElement = doc.documentElement; }) : undefined,
    },
    addEventListener: (type, fn) => { (listeners[type] ??= []).push(fn); },
    fire: (type) => (listeners[type] ?? []).forEach((fn) => fn({ type })),
  };
  const screen = { orientation: { lock: lock ? vi.fn(async () => {}) : vi.fn(async () => { throw new Error('not supported'); }) } };
  return { doc, screen };
}

describe('lockLandscape', () => {
  it('goes full screen and locks to landscape where the browser allows', async () => {
    const { doc, screen } = fakes();
    expect(await lockLandscape(doc, screen)).toBe(true);
    expect(doc.documentElement.requestFullscreen).toHaveBeenCalled();
    expect(screen.orientation.lock).toHaveBeenCalledWith('landscape');
  });

  it('gives up quietly where it cannot (iPhone Safari): the rotate screen covers that', async () => {
    const { doc, screen } = fakes({ fullscreen: false, lock: false });
    expect(await lockLandscape(doc, screen)).toBe(false);
    expect(await lockLandscape(doc, {})).toBe(false);
  });
});

describe('keepLandscape', () => {
  it('locks on the first tap, not again while locked, and again after leaving full screen', async () => {
    const { doc, screen } = fakes();
    keepLandscape(doc, screen);
    doc.fire('pointerdown');
    await Promise.resolve();
    await Promise.resolve();
    doc.fire('pointerdown');
    await Promise.resolve();
    expect(screen.orientation.lock).toHaveBeenCalledTimes(1);
    doc.fullscreenElement = null;
    doc.fire('fullscreenchange');
    doc.fire('pointerdown');
    await Promise.resolve();
    await Promise.resolve();
    expect(screen.orientation.lock).toHaveBeenCalledTimes(2);
  });
});
