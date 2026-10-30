import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { lockLandscape, keepLandscape, isTurned, unturn, TURNED_QUERY } from '../../src/ui/landscape.js';

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

  it('gives up quietly where it cannot (iPhone Safari): the game turns itself instead', async () => {
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

describe('the game turned sideways on a phone held upright', () => {
  it('turns the whole game a quarter-turn clockwise in CSS, for the same media query the code uses', () => {
    const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
    expect(TURNED_QUERY).toBe('(orientation: portrait) and (pointer: coarse)');
    const rule = html.slice(html.indexOf(`@media ${TURNED_QUERY}`));
    expect(rule.length).toBeLessThan(html.length);
    expect(rule).toMatch(/#app \{[^}]*rotate\(90deg\)/);
  });

  it('knows when it is turned', () => {
    const win = (matches) => ({ matchMedia: vi.fn((q) => ({ matches: q === TURNED_QUERY && matches })) });
    expect(isTurned(win(true))).toBe(true);
    expect(isTurned(win(false))).toBe(false);
    expect(isTurned({})).toBe(false); // no matchMedia: never turned
  });

  it("turns a drag on the upright screen back into the game's directions", () => {
    // Held with its top to the left: down the upright screen is right in the game, right is up.
    expect(unturn(0, 10, true)).toEqual({ x: 10, y: 0 });
    expect(unturn(10, 0, true)).toEqual({ x: 0, y: -10 });
    expect(unturn(3, 4, false)).toEqual({ x: 3, y: 4 });
  });
});
