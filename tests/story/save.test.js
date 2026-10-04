import { describe, it, expect } from 'vitest';
import { saveGame, loadGame, clearSave, SAVE_KEY } from '../../src/story/save.js';
import { createState } from '../../src/story/state.js';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  };
}

const throwingStorage = {
  getItem() { throw new Error('blocked'); },
  setItem() { throw new Error('blocked'); },
  removeItem() { throw new Error('blocked'); },
};

describe('autosave', () => {
  it('saves and loads a state', () => {
    const storage = memoryStorage();
    const s = createState({ name: 'Andres' });
    s.beat = 'ch1_dinner';
    expect(saveGame(storage, s)).toBe(true);
    expect(loadGame(storage)).toEqual({ state: s });
  });

  it('reports none when nothing is saved', () => {
    expect(loadGame(memoryStorage())).toEqual({ error: 'none' });
  });

  it('reports corrupt data', () => {
    const storage = memoryStorage();
    storage.setItem(SAVE_KEY, 'garbage');
    expect(loadGame(storage)).toEqual({ error: 'corrupt' });
  });

  it('never throws when storage is blocked or missing', () => {
    expect(saveGame(throwingStorage, createState())).toBe(false);
    expect(loadGame(throwingStorage)).toEqual({ error: 'unavailable' });
    expect(saveGame(null, createState())).toBe(false);
    expect(loadGame(null)).toEqual({ error: 'unavailable' });
    expect(() => clearSave(throwingStorage)).not.toThrow();
  });

  it('clears the save', () => {
    const storage = memoryStorage();
    saveGame(storage, createState());
    clearSave(storage);
    expect(loadGame(storage)).toEqual({ error: 'none' });
  });
});
