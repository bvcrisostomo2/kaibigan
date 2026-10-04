// Autosave to a Storage-like object (the browser's localStorage).
// Every call is wrapped so private windows and blocked storage never crash the game.
import { serialize, deserialize } from './state.js';

export const SAVE_KEY = 'kaibigan.autosave';

export function browserStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

// Returns true when the save was written.
export function saveGame(storage, state) {
  try {
    storage.setItem(SAVE_KEY, serialize(state));
    return true;
  } catch {
    return false;
  }
}

// Returns { state } or { error: 'none' | 'unavailable' | 'corrupt' | 'version' }.
export function loadGame(storage) {
  let raw;
  try {
    raw = storage.getItem(SAVE_KEY);
  } catch {
    return { error: 'unavailable' };
  }
  if (raw == null) return { error: 'none' };
  return deserialize(raw);
}

export function clearSave(storage) {
  try {
    storage.removeItem(SAVE_KEY);
  } catch {
    // Nothing to clear.
  }
}
