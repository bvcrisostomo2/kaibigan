// Keyboard (and, from Plan 3, touch) → one action stream (spec §4.3).
// Movement is a vector; buttons are reported once per press via consumePressed().
export const KEYMAP = {
  KeyW: 'up', ArrowUp: 'up',
  KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  ShiftLeft: 'run', ShiftRight: 'run',
  Space: 'interact', KeyE: 'interact', Enter: 'interact',
  KeyJ: 'journal', KeyH: 'toggleControls', KeyM: 'mute', Escape: 'menu',
};

const BUTTONS = new Set(['interact', 'journal', 'toggleControls', 'mute', 'menu']);
// Direction keys also queue a 'nav_*' press on every keydown (key repeat included) for menu cursors.
const NAV = { up: 'nav_up', down: 'nav_down', left: 'nav_left', right: 'nav_right' };

export function createInput() {
  const held = new Set();
  const pressed = [];
  let virtual = { x: 0, z: 0 };
  let virtualRun = false;

  return {
    keyDown(code) {
      const action = KEYMAP[code];
      if (!action) return false;
      if (BUTTONS.has(action) && !held.has(action)) pressed.push(action);
      if (NAV[action]) pressed.push(NAV[action]);
      held.add(action);
      return true;
    },
    keyUp(code) {
      const action = KEYMAP[code];
      if (!action) return false;
      held.delete(action);
      return true;
    },
    // Touch joystick (Plan 3): x/z in −1..1, magnitude ≥ 0.85 runs.
    setVirtualMove(x, z) {
      virtual = { x, z };
      virtualRun = Math.hypot(x, z) >= 0.85;
    },
    press(action) {
      if (!BUTTONS.has(action)) throw new Error(`Unknown button '${action}'`);
      pressed.push(action);
    },
    // Normalised movement { x, z, run } for this frame.
    move() {
      let x = (held.has('right') ? 1 : 0) - (held.has('left') ? 1 : 0) + virtual.x;
      let z = (held.has('down') ? 1 : 0) - (held.has('up') ? 1 : 0) + virtual.z;
      const len = Math.hypot(x, z);
      if (len > 1) {
        x /= len;
        z /= len;
      }
      return { x, z, run: held.has('run') || virtualRun };
    },
    // Button and 'nav_*' presses since the last call, oldest first.
    consumePressed() {
      return pressed.splice(0, pressed.length);
    },
    clear() {
      held.clear();
      pressed.length = 0;
      virtual = { x: 0, z: 0 };
      virtualRun = false;
    },
  };
}

// Enter and Space on a focused button belong to the button (native activation, spec §4.3).
const BUTTON_KEYS = new Set(['Enter', 'NumpadEnter', 'Space']);

// Typing in a text field (name, save-code words) must not move the player or press buttons.
function isTextField(el) {
  return !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
}

// Wire a created input to window keyboard events. Returns an unbind function.
// Keys typed into text fields and browser shortcuts (Ctrl, Cmd, Alt) are left alone.
export function bindKeyboard(input, target = window) {
  const down = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || isTextField(e.target)) return;
    if (BUTTON_KEYS.has(e.code) && e.target?.tagName === 'BUTTON') return;
    if (e.repeat && KEYMAP[e.code] && BUTTONS.has(KEYMAP[e.code])) return;
    if (input.keyDown(e.code)) e.preventDefault();
  };
  const up = (e) => input.keyUp(e.code);
  const blur = () => input.clear();
  target.addEventListener('keydown', down);
  target.addEventListener('keyup', up);
  target.addEventListener('blur', blur);
  return () => {
    target.removeEventListener('keydown', down);
    target.removeEventListener('keyup', up);
    target.removeEventListener('blur', blur);
  };
}
