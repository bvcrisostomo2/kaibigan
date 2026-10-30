// What the Journal shows (spec §3.4, §3.6), read from state each time it opens: unlocked bios,
// found notes (with the chapter's total), the lines of felt hints and the conversation so far
// (Plan 5 spec §4.7). Never meter values.
import { wrapIndex } from './cursor.js';
import { speakerFor } from './dialogueBox.js';
import { parseText } from '../story/text.js';
import { lineId } from '../story/dialogue.js';

export const JOURNAL_TABS = ['characters', 'notes', 'conversation'];

// The conversation log (state.log, story/log.js) as entries to show, oldest first:
// { lineId, kind: 'line' | 'narration' | 'choice', name, costume, feeling, segments }. Entries the
// content no longer has (a save older than an edit) are skipped.
export function conversationEntries(log, dialogues, { cast, state }) {
  const vars = { name: state.name, title: state.title };
  const entries = [];
  for (const ref of log) {
    if (!Array.isArray(ref) || typeof ref[0] !== 'string' || typeof ref[1] !== 'string') continue;
    const [dialogueId, nodeId, choiceIndex] = ref;
    const node = dialogues[dialogueId]?.nodes?.[nodeId];
    if (!node) continue;
    if (ref.length === 3) {
      const choice = node.choices?.[choiceIndex];
      if (!choice) continue;
      const player = speakerFor('player', { cast, state });
      entries.push({ lineId: lineId(dialogueId, nodeId), kind: 'choice', name: player.name, costume: player.costume, feeling: 'neutral', segments: parseText(choice.text, vars) });
      continue;
    }
    if (node.choices || node.text == null) continue;
    const speaker = speakerFor(node.who, { cast, state });
    entries.push({
      lineId: lineId(dialogueId, nodeId),
      kind: speaker.kind === 'narrator' ? 'narration' : 'line',
      name: speaker.name,
      costume: speaker.costume,
      feeling: node.face ?? 'neutral',
      segments: parseText(node.text, vars),
    });
  }
  return entries;
}

export function journalView(state, { cast, notes, hints, dialogues = {} }) {
  const characters = state.bios
    .map((id) => cast.find((c) => c.id === id))
    .filter(Boolean)
    .map((c) => ({ id: c.id, name: c.name, bio: c.bio ?? '' }));
  const found = state.notes
    .map((id) => notes.find((n) => n.id === id))
    .filter(Boolean)
    .map((n) => ({ id: n.id, title: n.title, body: n.body }));
  const feelings = state.hintsShown.map((id) => hints.find((h) => h.id === id)?.journal).filter(Boolean);
  const conversation = conversationEntries(state.log ?? [], dialogues, { cast, state });
  return { characters, notes: found, found: found.length, total: notes.length, feelings, conversation };
}

export function nextTab(tab, delta) {
  return JOURNAL_TABS[wrapIndex(JOURNAL_TABS.indexOf(tab) + delta, JOURNAL_TABS.length)];
}
