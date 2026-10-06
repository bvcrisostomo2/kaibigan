// One condition language for dialogue, beats, hints and endings.
// A condition is an object; every key in it must hold (AND). null/undefined means "always".
import { hasFlag } from './state.js';

export const CONDITION_KEYS = [
  'flag', 'notFlag', 'flagsAll', 'flagsAny',
  'tiwalaAtLeast', 'tiwalaBelow', 'hinalaAtLeast', 'hinalaBelow',
  'affinityAtLeast', 'countAtLeast', 'all', 'any',
];

export function evaluate(cond, state) {
  if (cond == null) return true;
  for (const [key, value] of Object.entries(cond)) {
    if (!test(key, value, state)) return false;
  }
  return true;
}

function test(key, v, s) {
  switch (key) {
    case 'flag': return hasFlag(s, v);
    case 'notFlag': return !hasFlag(s, v);
    case 'flagsAll': return v.every((f) => hasFlag(s, f));
    case 'flagsAny': return v.some((f) => hasFlag(s, f));
    case 'tiwalaAtLeast': return s.tiwala >= v;
    case 'tiwalaBelow': return s.tiwala < v;
    case 'hinalaAtLeast': return s.hinala >= v;
    case 'hinalaBelow': return s.hinala < v;
    case 'affinityAtLeast': return Object.entries(v).every(([id, n]) => (s.affinity[id] ?? 0) >= n);
    // At least n of the listed flags are set, e.g. 'talked to 3 guests' over their seen: flags.
    case 'countAtLeast': return v.flags.filter((f) => hasFlag(s, f)).length >= v.n;
    case 'all': return v.every((c) => evaluate(c, s));
    case 'any': return v.some((c) => evaluate(c, s));
    default: throw new Error(`Unknown condition key: ${key}`);
  }
}

// Every flag name a condition reads (used by the content validator).
export function flagsReadBy(cond, out = new Set()) {
  if (!cond) return out;
  for (const [key, v] of Object.entries(cond)) {
    if (key === 'flag' || key === 'notFlag') out.add(v);
    else if (key === 'flagsAll' || key === 'flagsAny') v.forEach((f) => out.add(f));
    else if (key === 'countAtLeast') v.flags.forEach((f) => out.add(f));
    else if (key === 'all' || key === 'any') v.forEach((c) => flagsReadBy(c, out));
  }
  return out;
}
