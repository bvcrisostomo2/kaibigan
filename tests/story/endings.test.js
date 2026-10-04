import { describe, it, expect } from 'vitest';
import { pickEnding } from '../../src/story/endings.js';
import { ENDINGS } from '../../src/content/endings.js';
import { createState } from '../../src/story/state.js';

function stateWith({ tiwala = 0, hinala = 0, flags = [] } = {}) {
  return Object.assign(createState(), { tiwala, hinala, flags });
}

describe('pickEnding', () => {
  it('lets the betrayal flag override everything', () => {
    expect(pickEnding(stateWith({ tiwala: 9, hinala: 0, flags: ['testified_against_ibarra'] }), ENDINGS).id).toBe('taksil');
  });

  it.each([
    [{ tiwala: 6, hinala: 0 }, 'tapat'],
    [{ tiwala: 6, hinala: 6, flags: ['family_protection'] }, 'ipinatapon'],
    [{ tiwala: 6, hinala: 6 }, 'martir'],
    [{ tiwala: 0, hinala: 6 }, 'wasak'],
    [{ tiwala: 0, hinala: 0 }, 'nakaligtas'],
  ])('%j selects %s', (patch, id) => {
    expect(pickEnding(stateWith(patch), ENDINGS).id).toBe(id);
  });

  it('reaches every ending in the table (none is shadowed)', () => {
    const reached = new Set(
      [
        { flags: ['testified_against_ibarra'] },
        { tiwala: 6, hinala: 6, flags: ['family_protection'] },
        { tiwala: 6 },
        { tiwala: 6, hinala: 6 },
        { hinala: 6 },
        {},
      ].map((p) => pickEnding(stateWith(p), ENDINGS).id),
    );
    expect([...reached].sort()).toEqual(ENDINGS.map((e) => e.id).sort());
  });

  it('throws when nothing matches', () => {
    expect(() => pickEnding(createState(), [{ id: 'x', if: { flag: 'never' } }])).toThrow('No ending matched');
  });
});
