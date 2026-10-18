// Landscape on phones: the game plays sideways. Where the browser allows it (Android Chrome), the
// first tap goes full screen and locks the screen to landscape; browsers can only do this from a
// tap. Where it can't (iPhone Safari has no lock), a phone held upright shows the rotate screen
// instead (ui.css, .ui-rotate).

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

// The rotate screen: shown by CSS whenever a touch device is held upright.
export function rotateView(h, { title, detail }) {
  return h('div', { class: 'ui-rotate', 'aria-live': 'polite' },
    h('div', { class: 'ui-rotate-phone', 'aria-hidden': 'true' }),
    h('p', { class: 'ui-rotate-title' }, title),
    h('p', { class: 'ui-rotate-detail' }, detail));
}
