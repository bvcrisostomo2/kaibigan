import { describe, it, expect } from 'vitest';
import { createBus } from '../../src/story/events.js';

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
});
