// The single source of truth for story progress. A plain JSON-safe object.
export const SAVE_VERSION = 1;
export const TITLES = ['Don', 'Doña'];

export function createState({ name = '', title = 'Don' } = {}) {
  if (!TITLES.includes(title)) throw new Error(`Unknown title: ${title}`);
  return {
    version: SAVE_VERSION,
    name,
    title,
    tiwala: 0,
    hinala: 0,
    flags: [],
    affinity: {},
    insight: [],
    notes: [],
    bios: [],
    hintsShown: [],
    chapter: 1,
    beat: null,
    checkpoint: 0,
  };
}

export function hasFlag(state, flag) {
  return state.flags.includes(flag);
}

// Pushes value if absent. Returns true when it was added.
export function addUnique(list, value) {
  if (list.includes(value)) return false;
  list.push(value);
  return true;
}

export function serialize(state) {
  return JSON.stringify(state);
}

// Returns { state } on success, or { error: 'corrupt' | 'version' }.
export function deserialize(json) {
  let data;
  try {
    data = JSON.parse(json);
  } catch {
    return { error: 'corrupt' };
  }
  if (data && typeof data.version === 'number' && data.version !== SAVE_VERSION) return { error: 'version' };
  if (!isStateShape(data)) return { error: 'corrupt' };
  return { state: data };
}

const LIST_KEYS = ['flags', 'insight', 'notes', 'bios', 'hintsShown'];

function isStateShape(d) {
  return (
    d !== null &&
    typeof d === 'object' &&
    d.version === SAVE_VERSION &&
    typeof d.name === 'string' &&
    TITLES.includes(d.title) &&
    Number.isInteger(d.tiwala) &&
    Number.isInteger(d.hinala) &&
    LIST_KEYS.every((k) => Array.isArray(d[k])) &&
    d.affinity !== null &&
    typeof d.affinity === 'object' &&
    !Array.isArray(d.affinity) &&
    Number.isInteger(d.chapter) &&
    Number.isInteger(d.checkpoint) &&
    (d.beat === null || typeof d.beat === 'string')
  );
}
