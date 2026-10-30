// Landscape on phones: the game plays sideways. Where the browser allows it (Android Chrome), the
// first tap goes full screen and locks the screen to landscape; browsers can only do this from a
// tap. Wherever the phone is still held upright (iPhone Safari has no lock, or the screen's
// rotation is locked), the game turns itself a quarter-turn clockwise in CSS (index.html, #app),
// so it reads sideways with the phone's top to the left.

// Go full screen and lock to landscape. True if it locked; never throws.
export async function lockLandscape(doc = document, scr = screen) {
  try {
    if (!doc.fullscreenElement && doc.documentElement.requestFullscreen) await doc.documentElement.requestFullscreen({ navigationUI: 'hide' });
    if (!scr.orientation?.lock) return false;
    await scr.orientation.lock('landscape');
    return true;
  } catch {
    return false;
  }
}

// Lock on the first tap, and on the next tap after the player leaves full screen.
export function keepLandscape(doc = document, scr = screen) {
  let locked = false;
  let trying = false;
  doc.addEventListener('pointerdown', () => {
    if (locked || trying) return;
    trying = true;
    lockLandscape(doc, scr).then((ok) => {
      locked = ok;
      trying = false;
    });
  });
  doc.addEventListener('fullscreenchange', () => {
    if (!doc.fullscreenElement) locked = false;
  });
}

// The media query under which index.html turns the game.
export const TURNED_QUERY = '(orientation: portrait) and (pointer: coarse)';

// Whether the game is drawn turned right now.
export function isTurned(win = window) {
  return win.matchMedia?.(TURNED_QUERY).matches ?? false;
}

// A movement on the screen (pixels, y down) as a movement in the game's own picture: when the game
// is turned clockwise, down the upright screen is right in the game, and right is up.
export function unturn(dx, dy, turned) {
  return turned ? { x: dy, y: 0 - dx } : { x: dx, y: dy }; // 0 - dx: never a negative zero
}
