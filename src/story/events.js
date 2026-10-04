// A tiny synchronous event bus. Handlers for '*' receive every event as { type, payload }.
//
// A handler that throws never aborts the emit or the caller's work: the error goes to
// onError(error, type) and the remaining handlers (typed and '*') still run. The default
// onError logs with console.error. Events never carry meter values (tiwala / hinala).
//
// Every event the story core emits, with its payload:
//   beat:enter      { id, checkpoint }   a beat started (before its actions run); checkpoint may be null
//   checkpoint      { id, beat }         a beat with a checkpoint number was entered
//   dialogue:start  { id }               the director opened dialogue `id`
//   dialogue:node   { id, node }         dialogue `id` entered node `node`
//   dialogue:choice { id, node, index }  the player chose visible choice `index` at `node`
//   dialogue:end    { id }               dialogue `id` finished (its seen: flag is already set)
//   interact        { target }           the player pressed Talk on `target`
//   chapter:end     { chapter }          the chapter's endChapter action ran
//   hint            { id, journal }      a felt hint fired; `journal` is its text
//   journal:note    { id }               a note was newly added to the journal
//   journal:bio     { id }               a character bio was newly unlocked
//   state:changed   (no payload)         effects were applied; re-read via the public API only
export const EVENTS = Object.freeze([
  'beat:enter',
  'checkpoint',
  'dialogue:start',
  'dialogue:node',
  'dialogue:choice',
  'dialogue:end',
  'interact',
  'chapter:end',
  'hint',
  'journal:note',
  'journal:bio',
  'state:changed',
]);

const defaultOnError = (error, type) => console.error(`[bus] handler for '${type}' failed`, error);

export function createBus({ onError = defaultOnError } = {}) {
  const handlers = new Map();
  const call = (fn, arg, type) => {
    try {
      fn(arg);
    } catch (error) {
      onError(error, type);
    }
  };
  return {
    on(type, fn) {
      if (!handlers.has(type)) handlers.set(type, new Set());
      handlers.get(type).add(fn);
      return () => handlers.get(type).delete(fn);
    },
    emit(type, payload) {
      for (const fn of [...(handlers.get(type) ?? [])]) call(fn, payload, type);
      for (const fn of [...(handlers.get('*') ?? [])]) call(fn, { type, payload }, type);
    },
  };
}
