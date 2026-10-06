// The letter intro's form (spec §3.2, §4.2): the player's name and Don or Doña.
import { TITLES } from '../story/state.js';

export const NAME_MAX = 20;
// Letters (ñ and accented vowels included, precomposed or not), spaces, apostrophes, hyphens.
const NAME_CHARS = /^[\p{L}\p{M}][\p{L}\p{M} '’-]*$/u;

// { ok: true, name } with spaces tidied, or { ok: false, error: 'empty' | 'long' | 'chars' }.
export function validateName(raw) {
  const name = String(raw ?? '').trim().replace(/\s+/g, ' ');
  if (!name) return { ok: false, error: 'empty' };
  if ([...name].length > NAME_MAX) return { ok: false, error: 'long' };
  if (!NAME_CHARS.test(name)) return { ok: false, error: 'chars' };
  return { ok: true, name };
}

// { ok: true, name, title } or { ok: false, error }. Throws for a title that isn't Don or Doña.
export function signLetter(rawName, title) {
  if (!TITLES.includes(title)) throw new Error(`Unknown title: ${title}`);
  const v = validateName(rawName);
  return v.ok ? { ok: true, name: v.name, title } : v;
}
