// What the Journal shows (spec §3.4, §3.6), read from state each time it opens: unlocked bios,
// found notes (with the chapter's total) and the lines of felt hints. Never meter values.
import { wrapIndex } from './cursor.js';

export const JOURNAL_TABS = ['characters', 'notes'];

export function journalView(state, { cast, notes, hints }) {
  const characters = state.bios
    .map((id) => cast.find((c) => c.id === id))
    .filter(Boolean)
    .map((c) => ({ id: c.id, name: c.name, bio: c.bio ?? '' }));
  const found = state.notes
    .map((id) => notes.find((n) => n.id === id))
    .filter(Boolean)
    .map((n) => ({ id: n.id, title: n.title, body: n.body }));
  const feelings = state.hintsShown.map((id) => hints.find((h) => h.id === id)?.journal).filter(Boolean);
  return { characters, notes: found, found: found.length, total: notes.length, feelings };
}

export function nextTab(tab, delta) {
  return JOURNAL_TABS[wrapIndex(JOURNAL_TABS.indexOf(tab) + delta, JOURNAL_TABS.length)];
}
