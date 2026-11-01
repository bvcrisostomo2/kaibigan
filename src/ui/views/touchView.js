// Touch controls (spec §4.3): a joystick that comes to the left thumb, Talk bottom-right, Journal
// and Menu top-right. Shown only on touch devices. Drags go through stickVector (touchControls.js).
import { h } from '../dom.js';
import { stickVector, STICK_RADIUS } from '../touchControls.js';
import { isTurned, unturn, toLocal } from '../landscape.js';

// onMove(x, z) for input.setVirtualMove; onPress(button) for input.press.
export function createTouchView(root, { labels, onMove, onPress }) {
  // The stick floats: a touch anywhere in the zone (the left of the screen) puts it under the
  // thumb, and letting go sends it back to rest bottom-left.
  const knob = h('div', { class: 'ui-stick-knob' });
  const stick = h('div', { class: 'ui-stick', 'aria-hidden': 'true' }, knob);
  const zone = h('div', { class: 'ui-stick-zone' }, stick);
  let pointer = null;
  let centre = null;
  const release = () => {
    pointer = null;
    knob.style.transform = '';
    stick.classList.remove('is-active');
    stick.style.left = '';
    stick.style.top = '';
    onMove(0, 0);
  };
  zone.addEventListener('pointerdown', (e) => {
    if (pointer != null) return;
    pointer = e.pointerId;
    centre = { x: e.clientX, y: e.clientY };
    const at = toLocal(e.clientX, e.clientY, zone.getBoundingClientRect(), isTurned());
    stick.style.left = `${at.x - stick.offsetWidth / 2}px`;
    stick.style.top = `${at.y - stick.offsetHeight / 2}px`;
    stick.classList.add('is-active');
    try {
      zone.setPointerCapture(e.pointerId);
    } catch {
      // The pointer is already gone (or synthetic): the drag still works without capture.
    }
    e.preventDefault();
  });
  zone.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pointer) return;
    // The finger moves on the screen; when the game is drawn turned, turn that back.
    const d = unturn(e.clientX - centre.x, e.clientY - centre.y, isTurned());
    const v = stickVector(d.x, d.y);
    knob.style.transform = `translate(${v.x * STICK_RADIUS}px, ${v.z * STICK_RADIUS}px)`;
    onMove(v.x, v.z);
  });
  const end = (e) => {
    if (e.pointerId === pointer) release();
  };
  zone.addEventListener('pointerup', end);
  zone.addEventListener('pointercancel', end);

  const button = (cls, label, press) => h('button', {
    type: 'button',
    class: `ui-touch-button ${cls}`,
    onpointerdown(e) {
      e.preventDefault();
      onPress(press);
    },
  }, label);
  const el = h('div', { class: 'ui-screen ui-touch' },
    zone,
    button('is-talk', labels.talk, 'interact'),
    h('div', { class: 'ui-touch-top' }, button('', labels.journal, 'journal'), button('', labels.menu, 'menu')));
  root.append(el);
  return {
    // Hidden entirely on the front screens (title, letter, code entry), where nothing is playing.
    setVisible(visible) {
      el.hidden = !visible;
      if (!visible && pointer != null) release();
    },
    // The joystick and Talk hide while a blocking screen is open (its own buttons take taps).
    setPlaying(playing) {
      el.classList.toggle('is-blocked', !playing);
      if (!playing && pointer != null) release();
    },
  };
}

// A red banner for errors during development (spec §7).
export function createBannerView(root) {
  const el = h('div', { class: 'ui-screen ui-banner', role: 'alert', hidden: true });
  root.append(el);
  return {
    show(text) {
      el.textContent = text;
      el.hidden = false;
    },
  };
}
