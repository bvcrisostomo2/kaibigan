import { describe, it, expect } from 'vitest';
import { evaluate, flagsReadBy } from '../../src/story/conditions.js';
import { createState } from '../../src/story/state.js';

function stateWith(patch) {
  return Object.assign(createState(), patch);
}

describe('evaluate', () => {
  const s = stateWith({ flags: ['a', 'b'], tiwala: 2, hinala: -1, affinity: { guevarra: 2 } });

  it('treats null and undefined as true', () => {
    expect(evaluate(null, s)).toBe(true);
    expect(evaluate(undefined, s)).toBe(true);
  });

  it.each([
    [{ flag: 'a' }, true],
    [{ flag: 'z' }, false],
    [{ notFlag: 'z' }, true],
    [{ notFlag: 'a' }, false],
    [{ flagsAll: ['a', 'b'] }, true],
    [{ flagsAll: ['a', 'z'] }, false],
    [{ flagsAny: ['z', 'b'] }, true],
    [{ flagsAny: ['y', 'z'] }, false],
    [{ tiwalaAtLeast: 2 }, true],
    [{ tiwalaAtLeast: 3 }, false],
    [{ tiwalaBelow: 3 }, true],
    [{ tiwalaBelow: 2 }, false],
    [{ hinalaAtLeast: -1 }, true],
    [{ hinalaAtLeast: 0 }, false],
    [{ hinalaBelow: 0 }, true],
    [{ affinityAtLeast: { guevarra: 2 } }, true],
    [{ affinityAtLeast: { guevarra: 3 } }, false],
    [{ affinityAtLeast: { isabel: 0 } }, true],
    [{ all: [{ flag: 'a' }, { tiwalaAtLeast: 1 }] }, true],
    [{ all: [{ flag: 'a' }, { tiwalaAtLeast: 9 }] }, false],
    [{ any: [{ flag: 'z' }, { tiwalaAtLeast: 1 }] }, true],
    [{ any: [{ flag: 'z' }, { tiwalaAtLeast: 9 }] }, false],
  ])('%j gives %s', (cond, expected) => {
    expect(evaluate(cond, s)).toBe(expected);
  });

  it('ANDs multiple keys in one object', () => {
    expect(evaluate({ flag: 'a', tiwalaAtLeast: 2 }, s)).toBe(true);
    expect(evaluate({ flag: 'a', tiwalaAtLeast: 5 }, s)).toBe(false);
  });

  it('throws on unknown keys', () => {
    expect(() => evaluate({ flagg: 'a' }, s)).toThrow('Unknown condition key: flagg');
  });
});

describe('flagsReadBy', () => {
  it('collects flags from every nesting level', () => {
    const cond = { flag: 'a', notFlag: 'b', any: [{ flagsAll: ['c'] }, { all: [{ flagsAny: ['d'] }] }], tiwalaAtLeast: 1 };
    expect([...flagsReadBy(cond)].sort()).toEqual(['a', 'b', 'c', 'd']);
  });
});
