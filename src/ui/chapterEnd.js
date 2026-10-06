// The chapter-end card (spec §3.4): recap, notes found, standing in words (never numbers),
// "Think about it" prompts and the latest code. endCard is chapter content:
//   { recap, prompts: [string], standings: [{ if?, text }] }  (every standing whose `if` holds)
import { evaluate } from '../story/conditions.js';

export function chapterEndView(state, { chapter, endCard, notes, code }) {
  return {
    chapter,
    recap: endCard.recap,
    found: state.notes.filter((id) => notes.some((n) => n.id === id)).length,
    total: notes.length,
    standings: endCard.standings.filter((s) => evaluate(s.if, state)).map((s) => s.text),
    prompts: endCard.prompts,
    code,
  };
}
