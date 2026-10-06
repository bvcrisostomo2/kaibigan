import { describe, it, expect } from 'vitest';
import { createInput, bindKeyboard, KEYMAP } from '../../src/engine/input.js';

describe('createInput', () => {
  it('turns held keys into a normalised movement vector', () => {
    const input = createInput();
    input.keyDown('KeyD');
    expect(input.move()).toEqual({ x: 1, z: 0, run: false });
    input.keyDown('KeyS');
    const m = input.move();
    expect(m.x).toBeCloseTo(Math.SQRT1_2);
    expect(m.z).toBeCloseTo(Math.SQRT1_2);
    input.keyUp('KeyD');
    input.keyUp('KeyS');
    expect(input.move()).toEqual({ x: 0, z: 0, run: false });
  });

  it('arrows and WASD are the same; opposite keys cancel', () => {
    const input = createInput();
    input.keyDown('ArrowLeft');
    input.keyDown('KeyD');
    expect(input.move().x).toBe(0);
  });

  it('Shift runs', () => {
    const input = createInput();
    input.keyDown('KeyW');
    input.keyDown('ShiftLeft');
    expect(input.move()).toEqual({ x: 0, z: -1, run: true });
  });

  it('reports each button press once, even when held', () => {
    const input = createInput();
    input.keyDown('Space');
    input.keyDown('Space');
    input.keyDown('KeyJ');
    expect(input.consumePressed()).toEqual(['interact', 'journal']);
    expect(input.consumePressed()).toEqual([]);
    input.keyUp('Space');
    input.keyDown('KeyE');
    expect(input.consumePressed()).toEqual(['interact']);
  });

  it('ignores unmapped keys', () => {
    const input = createInput();
    expect(input.keyDown('KeyQ')).toBe(false);
    expect(input.keyUp('KeyQ')).toBe(false);
  });

  it('takes a virtual joystick; a full push runs', () => {
    const input = createInput();
    input.setVirtualMove(0.5, 0);
    expect(input.move()).toEqual({ x: 0.5, z: 0, run: false });
    input.setVirtualMove(0, 0.9);
    expect(input.move().run).toBe(true);
  });

  it('presses buttons programmatically and rejects unknown ones', () => {
    const input = createInput();
    input.press('menu');
    expect(input.consumePressed()).toEqual(['menu']);
    expect(() => input.press('jump')).toThrow("Unknown button 'jump'");
  });

  it('clear() drops everything (window blur)', () => {
    const input = createInput();
    input.keyDown('KeyW');
    input.keyDown('Space');
    input.clear();
    expect(input.move()).toEqual({ x: 0, z: 0, run: false });
    expect(input.consumePressed()).toEqual([]);
  });
});

describe('bindKeyboard', () => {
  const fakeTarget = () => {
    const handlers = {};
    return {
      handlers,
      addEventListener: (type, fn) => (handlers[type] = fn),
      removeEventListener: (type) => delete handlers[type],
    };
  };
  const key = (code, extra = {}) => ({ code, repeat: false, preventDefault() { this.prevented = true; }, ...extra });

  it('feeds keyboard events and prevents default for mapped keys', () => {
    const target = fakeTarget();
    const input = createInput();
    const unbind = bindKeyboard(input, target);
    const e = key('KeyW');
    target.handlers.keydown(e);
    expect(e.prevented).toBe(true);
    expect(input.move().z).toBe(-1);
    target.handlers.keyup(key('KeyW'));
    expect(input.move().z).toBe(0);
    target.handlers.keydown(key('KeyW'));
    target.handlers.blur();
    expect(input.move().z).toBe(0);
    unbind();
    expect(Object.keys(target.handlers)).toEqual([]);
  });

  it('ignores auto-repeat for buttons', () => {
    const target = fakeTarget();
    const input = createInput();
    bindKeyboard(input, target);
    target.handlers.keydown(key('Space'));
    target.handlers.keyup(key('Space'));
    target.handlers.keydown(key('Space', { repeat: true }));
    expect(input.consumePressed()).toEqual(['interact']);
  });

  it('maps every documented key', () => {
    expect(KEYMAP).toMatchObject({ KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right', ShiftLeft: 'run', Space: 'interact', KeyJ: 'journal', KeyH: 'toggleControls', KeyM: 'mute', Escape: 'menu' });
  });
});

describe('bindKeyboard while typing', () => {
  const fakeTarget = () => {
    const handlers = {};
    return { handlers, addEventListener: (type, fn) => (handlers[type] = fn), removeEventListener: (type) => delete handlers[type] };
  };
  const key = (code, extra = {}) => ({ code, repeat: false, preventDefault() { this.prevented = true; }, ...extra });

  it('leaves keys alone while typing in a text field', () => {
    const fields = [{ tagName: 'INPUT' }, { tagName: 'TEXTAREA' }, { tagName: 'SELECT' }, { tagName: 'DIV', isContentEditable: true }];
    for (const field of fields) {
      const target = fakeTarget();
      const input = createInput();
      bindKeyboard(input, target);
      for (const code of ['KeyW', 'KeyE', 'Space', 'KeyM']) {
        const e = key(code, { target: field });
        target.handlers.keydown(e);
        expect(e.prevented, `${field.tagName} ${code}`).toBeUndefined();
      }
      expect(input.move().z).toBe(0);
      expect(input.consumePressed()).toEqual([]);
    }
  });

  it('leaves browser shortcuts (Ctrl, Cmd, Alt) alone', () => {
    for (const mod of ['ctrlKey', 'metaKey', 'altKey']) {
      const target = fakeTarget();
      const input = createInput();
      bindKeyboard(input, target);
      const e = key('KeyS', { [mod]: true });
      target.handlers.keydown(e);
      expect(e.prevented, mod).toBeUndefined();
      expect(input.move().z).toBe(0);
    }
  });
});

describe('menu navigation presses', () => {
  it('queues a nav press for every direction keydown, key repeat included', () => {
    const input = createInput();
    input.keyDown('KeyW');
    input.keyDown('KeyW');
    input.keyDown('ArrowDown');
    input.keyDown('KeyA');
    input.keyDown('ArrowRight');
    expect(input.consumePressed()).toEqual(['nav_up', 'nav_up', 'nav_down', 'nav_left', 'nav_right']);
    expect(input.move().z).toBe(0); // up and down both held
  });

  it('passes key repeats of direction keys through bindKeyboard', () => {
    const handlers = {};
    const target = { addEventListener: (type, fn) => (handlers[type] = fn), removeEventListener() {} };
    const input = createInput();
    bindKeyboard(input, target);
    const ev = (repeat) => ({ code: 'ArrowDown', repeat, preventDefault() {} });
    handlers.keydown(ev(false));
    handlers.keydown(ev(true));
    handlers.keydown(ev(true));
    expect(input.consumePressed()).toEqual(['nav_down', 'nav_down', 'nav_down']);
  });
});

describe('bindKeyboard on a focused button', () => {
  it('leaves Enter and Space to the button (native activation) but keeps movement keys', () => {
    const handlers = {};
    const target = { addEventListener: (type, fn) => (handlers[type] = fn), removeEventListener() {} };
    const key = (code) => ({ code, repeat: false, target: { tagName: 'BUTTON' }, preventDefault() { this.prevented = true; } });
    const input = createInput();
    bindKeyboard(input, target);
    for (const code of ['Enter', 'Space']) {
      const e = key(code);
      handlers.keydown(e);
      expect(e.prevented, code).toBeUndefined();
    }
    expect(input.consumePressed()).toEqual([]);
    const w = key('KeyW');
    handlers.keydown(w);
    expect(w.prevented).toBe(true);
    expect(input.move().z).toBe(-1);
  });
});
