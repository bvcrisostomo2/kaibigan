import { describe, it, expect } from 'vitest';
import { encodeCode, decodeCode, matchWord, stateFromCode, codeLength, levenshtein } from '../../src/story/saveCode.js';
import { WORDS } from '../../src/content/wordlist.js';
import { CODE_LAYOUTS } from '../../src/content/codeLayout.js';
import { createState } from '../../src/story/state.js';

const layout = CODE_LAYOUTS[1];

function sampleState() {
  const s = createState({ name: 'Andres', title: 'Doña' });
  s.checkpoint = 3;
  s.tiwala = 4;
  s.hinala = -2;
  s.flags = ['ch1_defied_damaso', 'ch1_honest', 'seen:greet'];
  s.affinity = { guevarra: 2, isabel: -1, damaso: -3 };
  s.notes = ['note_indio', 'note_tinola'];
  return s;
}

// The persistent subset a code is expected to carry.
function persistent(s) {
  const affinity = {};
  for (const id of layout.affinity) if (s.affinity[id]) affinity[id] = s.affinity[id];
  return {
    checkpoint: s.checkpoint,
    title: s.title,
    tiwala: s.tiwala,
    hinala: s.hinala,
    flags: layout.flags.filter((f) => s.flags.includes(f)),
    affinity,
    notes: layout.notes.filter((n) => s.notes.includes(n)),
  };
}

describe('levenshtein', () => {
  it.each([['kalesa', 'kalesa', 0], ['bato', 'bata', 1], ['ilog', 'ilong', 1], ['abc', '', 3], ['kitten', 'sitting', 3]])(
    '%s vs %s = %i',
    (a, b, d) => expect(levenshtein(a, b)).toBe(d),
  );
});

describe('encodeCode / decodeCode', () => {
  it('produces a 7-word code for layout 1', () => {
    expect(codeLength(1)).toBe(7);
    expect(encodeCode(sampleState()).split(' ')).toHaveLength(7);
  });

  it('round-trips the persistent state', () => {
    const s = sampleState();
    const result = decodeCode(encodeCode(s));
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ version: 1, ...persistent(s) });
    expect(result.corrected).toEqual([]);
  });

  it('round-trips many varied states', () => {
    for (let i = 0; i < 300; i++) {
      const s = createState({ title: i % 2 ? 'Doña' : 'Don' });
      s.checkpoint = i % 64;
      s.tiwala = (i % 32) - 16;
      s.hinala = ((i * 7) % 32) - 16;
      s.flags = layout.flags.filter((_, k) => (i >> k) & 1);
      layout.affinity.forEach((id, k) => { s.affinity[id] = ((i + k) % 8) - 4; });
      s.notes = layout.notes.filter((_, k) => ((i * 3) >> k) & 1);
      const r = decodeCode(encodeCode(s));
      expect(r.ok).toBe(true);
      expect(r.data).toEqual({ version: 1, ...persistent(s) });
    }
  });

  it('clamps meters and affinity into range', () => {
    const s = createState();
    s.tiwala = 99;
    s.hinala = -99;
    s.affinity = { guevarra: 10 };
    const { data } = decodeCode(encodeCode(s));
    expect(data).toMatchObject({ tiwala: 15, hinala: -16, affinity: { guevarra: 3 } });
  });

  it('rejects an out-of-range checkpoint', () => {
    const s = createState();
    s.checkpoint = 64;
    expect(() => encodeCode(s)).toThrow('out of range');
  });

  it('ignores case, punctuation, accents and extra spaces', () => {
    const code = encodeCode(sampleState());
    const messy = '  ' + code.toUpperCase().split(' ').join(' ,  - ') + '!! ';
    expect(decodeCode(messy).ok).toBe(true);
  });
});

describe('error detection', () => {
  const code = encodeCode(sampleState()).split(' ');

  it('catches every single-word substitution', () => {
    for (let pos = 0; pos < code.length; pos++) {
      for (const w of WORDS) {
        if (w === code[pos]) continue;
        const bad = [...code];
        bad[pos] = w;
        expect(decodeCode(bad.join(' ')).ok).toBe(false);
      }
    }
  });

  it('catches every swap of two adjacent different words', () => {
    for (let pos = 0; pos < code.length - 1; pos++) {
      if (code[pos] === code[pos + 1]) continue;
      const bad = [...code];
      [bad[pos], bad[pos + 1]] = [bad[pos + 1], bad[pos]];
      expect(decodeCode(bad.join(' ')).ok).toBe(false);
    }
  });

  it('reports empty input', () => {
    expect(decodeCode('   ')).toEqual({ ok: false, error: { kind: 'empty' } });
  });

  it('reports an unknown word with its position', () => {
    const bad = [...code];
    bad[3] = 'xyzzy';
    expect(decodeCode(bad.join(' '))).toEqual({ ok: false, error: { kind: 'unknownWord', word: 'xyzzy', position: 4, candidates: [] } });
  });

  it('reports a missing word as a length or checksum error', () => {
    const r = decodeCode(code.slice(0, -1).join(' '));
    expect(r.ok).toBe(false);
    expect(['length', 'checksum']).toContain(r.error.kind);
  });
});

describe('forgiving word matching', () => {
  it('accepts exact words', () => {
    expect(matchWord('kalesa')).toEqual({ index: WORDS.indexOf('kalesa'), word: 'kalesa' });
  });

  it('accepts a unique prefix of 4+ letters', () => {
    expect(matchWord('kales')).toEqual({ index: WORDS.indexOf('kalesa'), word: 'kalesa' });
  });

  it('autocorrects a single typo when only one word is that close', () => {
    expect(matchWord('kalessa').word).toBe('kalesa');
  });

  it('refuses ambiguous input and lists candidates', () => {
    const m = matchWord('kala'); // kalabasa, kalabaw, kalamba, ...
    expect(m.index).toBe(null);
    expect(m.candidates.length).toBeGreaterThan(1);
  });

  it('reports autocorrections from decodeCode', () => {
    const words = encodeCode(sampleState()).split(' ');
    const typo = words[1] + words[1].at(-1); // doubled last letter
    const r = decodeCode([words[0], typo, ...words.slice(2)].join(' '));
    expect(r.ok).toBe(true);
    expect(r.corrected).toEqual([{ position: 2, from: typo, to: words[1] }]);
  });
});

describe('stateFromCode', () => {
  it('builds a state with the name, decoded data and checkpoint restore data', () => {
    const { data } = decodeCode(encodeCode(sampleState()));
    const s = stateFromCode(data, 'Maria', { flags: ['seen:greet', 'ch1_honest'], bios: ['ibarra'] });
    expect(s).toMatchObject({ name: 'Maria', title: 'Doña', tiwala: 4, hinala: -2, checkpoint: 3, bios: ['ibarra'] });
    expect(s.flags).toEqual(['ch1_defied_damaso', 'ch1_honest', 'seen:greet']);
    expect(s.notes).toEqual(['note_indio', 'note_tinola']);
    expect(s.affinity).toEqual({ guevarra: 2, isabel: -1 });
  });
});
