import { describe, it, expect } from 'vitest';
import { createBus, EVENTS } from '../../src/story/events.js';
import { applyEffects } from '../../src/story/effects.js';
import { createState } from '../../src/story/state.js';

describe('createBus', () => {
  it('delivers payloads to handlers of that type', () => {
    const bus = createBus();
    const got = [];
    bus.on('hello', (p) => got.push(p));
    bus.emit('hello', { n: 1 });
    bus.emit('other', { n: 2 });
    expect(got).toEqual([{ n: 1 }]);
  });

  it('lets wildcard handlers see every event', () => {
    const bus = createBus();
    const got = [];
    bus.on('*', (e) => got.push(e));
    bus.emit('a', 1);
    expect(got).toEqual([{ type: 'a', payload: 1 }]);
  });

  it('returns an unsubscribe function', () => {
    const bus = createBus();
    const got = [];
    const off = bus.on('x', (p) => got.push(p));
    off();
    bus.emit('x', 1);
    expect(got).toEqual([]);
  });

  it('runs multiple handlers per type in registration order', () => {
    const bus = createBus();
    const got = [];
    bus.on('x', () => got.push('first'));
    bus.on('x', () => got.push('second'));
    bus.on('x', () => got.push('third'));
    bus.emit('x');
    expect(got).toEqual(['first', 'second', 'third']);
  });

  it('keeps running later and wildcard handlers when a handler throws', () => {
    const errors = [];
    const bus = createBus({ onError: (error, type) => errors.push([error.message, type]) });
    const got = [];
    bus.on('x', () => { throw new Error('boom'); });
    bus.on('x', () => got.push('typed'));
    bus.on('*', () => got.push('wildcard'));
    bus.emit('x', 1);
    expect(got).toEqual(['typed', 'wildcard']);
    expect(errors).toEqual([['boom', 'x']]);
  });

  it('reports a throwing wildcard handler with the emitted type', () => {
    const errors = [];
    const bus = createBus({ onError: (error, type) => errors.push([error.message, type]) });
    bus.on('*', () => { throw new Error('wild'); });
    bus.emit('y');
    expect(errors).toEqual([['wild', 'y']]);
  });

  it('logs to console.error by default', () => {
    const calls = [];
    const original = console.error;
    console.error = (...args) => calls.push(args);
    try {
      const bus = createBus();
      const error = new Error('oops');
      bus.on('z', () => { throw error; });
      bus.emit('z');
      expect(calls).toEqual([["[bus] handler for 'z' failed", error]]);
    } finally {
      console.error = original;
    }
  });
});

describe('applyEffects with a throwing listener', () => {
  it('still applies the remaining effects', () => {
    const errors = [];
    const bus = createBus({ onError: (error, type) => errors.push(type) });
    bus.on('journal:note', () => { throw new Error('ui exploded'); });
    const ctx = { state: createState(), bus, hints: [] };
    applyEffects(ctx, { note: 'n1', tiwala: 1 });
    expect(ctx.state.tiwala).toBe(1);
    expect(ctx.state.notes).toEqual(['n1']);
    expect(errors).toEqual(['journal:note']);
  });
});

describe('EVENTS', () => {
  it('lists every event the story core emits and is frozen', () => {
    expect([...EVENTS].sort()).toEqual([
      'beat:enter', 'chapter:end', 'checkpoint', 'dialogue:choice', 'dialogue:end', 'dialogue:node',
      'dialogue:start', 'hint', 'interact', 'journal:bio', 'journal:note', 'state:changed',
    ]);
    expect(Object.isFrozen(EVENTS)).toBe(true);
  });
});
