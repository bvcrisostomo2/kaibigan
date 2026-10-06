// Touch controls (spec §4.3): a joystick bottom-left, Talk bottom-right, Journal and Menu
// top-right. Shown only on touch devices. Drags go through stickVector (touchControls.js).
import { h } from '../dom.js';
import { stickVector, STICK_RADIUS } from '../touchControls.js';

// onMove(x, z) for input.setVirtualMove; onPress(button) for input.press.
export function createTouchView(root, { labels, onMove, onPress }) {
  const knob = h('div', { class: 'ui-stick-knob' });
  const stick = h('div', { class: 'ui-stick', 'aria-hidden': 'true' }, knob);
  let pointer = null;
  let centre = null;
  const release = () => {
    pointer = null;
    knob.style.transform = '';
    onMove(0, 0);
  };
  stick.addEventListener('pointerdown', (e) => {
    pointer = e.pointerId;
    const r = stick.getBoundingClientRect();
    centre = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    try {
      stick.setPointerCapture(e.pointerId);
    } catch {
      // The pointer is already gone (or synthetic): the drag still works without capture.
    }
    e.preventDefault();
  });
  stick.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pointer) return;
    const v = stickVector(e.clientX - centre.x, e.clientY - centre.y);
    knob.style.transform = `translate(${v.x * STICK_RADIUS}px, ${v.z * STICK_RADIUS}px)`;
    onMove(v.x, v.z);
  });
  stick.addEventListener('pointerup', release);
  stick.addEventListener('pointercancel', release);

  const button = (cls, label, press) => h('button', {
    type: 'button',
    class: `ui-touch-button ${cls}`,
    onpointerdown(e) {
      e.preventDefault();
      onPress(press);
    },
  }, label);
  const el = h('div', { class: 'ui-screen ui-touch' },
    stick,
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
