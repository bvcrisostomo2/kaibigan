// "Felt" hints: once-only journal lines that fire when their condition first becomes true.
import { evaluate } from './conditions.js';
import { addUnique } from './state.js';

export function checkHints(state, hints, bus) {
  const fired = [];
  for (const hint of hints) {
    if (state.hintsShown.includes(hint.id)) continue;
    if (!evaluate(hint.if, state)) continue;
    state.hintsShown.push(hint.id);
    if (hint.setFlag) addUnique(state.flags, hint.setFlag);
    fired.push(hint);
    bus?.emit('hint', { id: hint.id, journal: hint.journal });
  }
  return fired;
}
