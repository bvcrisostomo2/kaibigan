// Picks the player character's ending: the first entry whose `if` holds.
// The last entry must have no `if` (the validator enforces it).
import { evaluate } from './conditions.js';

export function pickEnding(state, endings) {
  const ending = endings.find((e) => evaluate(e.if, state));
  if (!ending) throw new Error('No ending matched; the last ending must have no condition');
  return ending;
}
