import { describe, it, expect } from 'vitest';
import { createState, hasFlag, addUnique, serialize, deserialize, SAVE_VERSION } from '../../src/story/state.js';

describe('createState', () => {
  it('starts with zeroed meters and empty lists', () => {
    const s = createState({ name: 'Andres', title: 'Don' });
    expect(s).toMatchObject({ name: 'Andres', title: 'Don', tiwala: 0, hinala: 0, flags: [], chapter: 1, beat: null, checkpoint: 0, version: SAVE_VERSION });
  });

  it('accepts Doña and rejects unknown titles', () => {
    expect(createState({ title: 'Doña' }).title).toBe('Doña');
    expect(() => createState({ title: 'Sir' })).toThrow('Unknown title');
  });
});

describe('flags', () => {
  it('addUnique adds once and reports whether it added', () => {
    const s = createState();
    expect(addUnique(s.flags, 'a')).toBe(true);
    expect(addUnique(s.flags, 'a')).toBe(false);
    expect(s.flags).toEqual(['a']);
    expect(hasFlag(s, 'a')).toBe(true);
    expect(hasFlag(s, 'b')).toBe(false);
  });
});

describe('serialize / deserialize', () => {
  it('round-trips a state', () => {
    const s = createState({ name: 'Maria', title: 'Doña' });
    s.tiwala = 3;
    s.flags.push('ch1_honest');
    s.affinity.guevarra = 1;
    s.beat = 'ch1_arrive';
    expect(deserialize(serialize(s))).toEqual({ state: s });
  });

  it('reports corrupt JSON', () => {
    expect(deserialize('{nope')).toEqual({ error: 'corrupt' });
  });

  it('reports a wrong shape as corrupt', () => {
    expect(deserialize(JSON.stringify({ version: SAVE_VERSION, name: 5 }))).toEqual({ error: 'corrupt' });
  });

  it('reports another save version', () => {
    const s = { ...createState(), version: SAVE_VERSION + 1 };
    expect(deserialize(JSON.stringify(s))).toEqual({ error: 'version' });
  });
});
