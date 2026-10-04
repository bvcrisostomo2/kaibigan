import { describe, it, expect } from 'vitest';
import { WORDS } from '../../src/content/wordlist.js';
import { levenshtein } from '../../src/story/saveCode.js';

describe('save-code word list', () => {
  it('has exactly 509 entries (a prime)', () => {
    expect(WORDS).toHaveLength(509);
  });

  it('uses lowercase ASCII words of 3 to 8 letters', () => {
    expect(WORDS.filter((w) => !/^[a-z]{3,8}$/.test(w))).toEqual([]);
  });

  it('has no duplicates', () => {
    expect(new Set(WORDS).size).toBe(WORDS.length);
  });

  it('keeps every pair at least 2 edits apart', () => {
    const close = [];
    for (let i = 0; i < WORDS.length; i++) {
      for (let j = i + 1; j < WORDS.length; j++) {
        if (levenshtein(WORDS[i], WORDS[j]) < 2) close.push(`${WORDS[i]}/${WORDS[j]}`);
      }
    }
    expect(close).toEqual([]);
  });

  it('is frozen', () => {
    expect(Object.isFrozen(WORDS)).toBe(true);
  });
});
