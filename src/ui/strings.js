// UI string lookup (spec §6.4): t('menu.resume') or t('journal.notesCount', { found: 3, total: 8 }).
// A missing key throws under Vitest, so tests catch it; in the browser it shows the key itself.
import { EN } from '../content/strings/en.js';

export function createStrings(table, { strict = false } = {}) {
  function t(key, vars = {}) {
    const s = table[key];
    if (s == null) {
      if (strict) throw new Error(`Missing string '${key}'`);
      return key;
    }
    return s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
  }
  t.has = (key) => table[key] != null;
  return t;
}

export const t = createStrings(EN, { strict: import.meta.env?.MODE === 'test' });
