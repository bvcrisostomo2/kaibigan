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
    expect(decodeCode(messy).corrected).toEqual([]);

    // Accents are stripped before matching: 'á' reads as 'a', 'ñ' as 'n'.
    const words = code.split(' ');
    expect(words[1]).toBe('siyam');
    expect(words[5]).toBe('bangus');
    const accented = [...words];
    accented[1] = 'siyám';
    accented[5] = 'bañgus';
    const r = decodeCode(accented.join(' '));
    expect(r.ok).toBe(true);
    expect(r.corrected).toEqual([]);
    expect(r.data).toEqual(decodeCode(code).data);
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

  it('reports an ambiguous word with its position and candidates', () => {
    const bad = [...code];
    bad[3] = 'kala'; // prefix of kalabasa, kalabaw, kalamba, ...
    const r = decodeCode(bad.join(' '));
    expect(r.ok).toBe(false);
    expect(r.error).toMatchObject({ kind: 'ambiguousWord', word: 'kala', position: 4 });
    expect(r.error.candidates).toEqual(['kalabasa', 'kalabaw', 'kalamba', 'kalapati', 'kalaw']);
  });

  it('reports a checksum-valid code from a newer layout as newerVersion', () => {
    // The low 4 bits of the first (least significant) payload digit hold the version.
    const payload = [2, 0, 0, 0, 0, 0];
    const partial = payload.reduce((sum, d, i) => (sum + (i + 1) * d) % 509, 0);
    let check = -1;
    for (let c = 0; c < 509; c++) if ((partial + (payload.length + 1) * c) % 509 === 0) check = c;
    expect(check).toBeGreaterThanOrEqual(0);
    const text = [...payload, check].map((d) => WORDS[d]).join(' ');
    expect(decodeCode(text)).toEqual({ ok: false, error: { kind: 'newerVersion' } });
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

  it('never lets restore flags override a choice the code stores', () => {
    const state = sampleState();
    state.flags = ['ch1_honest']; // ch1_tactful is unset in the code
    const { data } = decodeCode(encodeCode(state));
    expect(data.flags).not.toContain('ch1_tactful');
    const s = stateFromCode(data, 'Maria', { flags: ['ch1_tactful', 'seen:greet'] });
    expect(s.flags).toContain('seen:greet');
    expect(s.flags).not.toContain('ch1_tactful');
    expect(s.flags).toContain('ch1_honest');
  });
});

describe('code layout is deeply frozen', () => {
  it.each(['flags', 'affinity', 'notes'])('freezes layout 1 %s', (key) => {
    expect(Object.isFrozen(CODE_LAYOUTS[1][key])).toBe(true);
  });
});

// GOLDEN VECTORS. These pin the exact encoding students have written down. If one fails,
// an existing code would break. Never "fix" a golden test by updating its expected value:
// add a new layout version instead (old versions must keep decoding forever).
describe('frozen encoding (golden vectors)', () => {
  it('encodes the sample state to the exact original code', () => {
    expect(encodeCode(sampleState())).toBe('bibig siyam bigay sorbetes lipad bangus bayabas');
  });

  it('decodes the sample code to the exact original data', () => {
    expect(decodeCode('bibig siyam bigay sorbetes lipad bangus bayabas')).toEqual({
      ok: true,
      corrected: [],
      data: {
        version: 1,
        checkpoint: 3,
        title: 'Doña',
        tiwala: 4,
        hinala: -2,
        flags: ['ch1_defied_damaso', 'ch1_honest'],
        affinity: { guevarra: 2, isabel: -1 },
        notes: ['note_indio', 'note_tinola'],
      },
    });
  });

  it('decodes a full state (all flags, notes, affinities, Doña, clamped extremes)', () => {
    const full = createState({ title: 'Doña' });
    full.checkpoint = 63;
    full.tiwala = 99;
    full.hinala = -99;
    full.flags = [...layout.flags];
    full.affinity = { guevarra: 10, isabel: -10, tiago: 1, sibyla: -1, victorina: 2 };
    full.notes = [...layout.notes];
    const code = 'aklat sinag tamis bundok poso hangin buhangin';
    expect(encodeCode(full)).toBe(code);
    expect(decodeCode(code)).toEqual({
      ok: true,
      corrected: [],
      data: {
        version: 1,
        checkpoint: 63,
        title: 'Doña',
        tiwala: 15,
        hinala: -16,
        flags: [
          'ch1_defied_damaso',
          'ch1_tactful',
          'ch1_silent',
          'ch1_honest',
          'ch1_hid_truth',
          'ch1_defended_indios',
          'ch1_sided_damaso',
          'guardia_watching',
        ],
        affinity: { guevarra: 3, isabel: -4, tiago: 1, sibyla: -1, victorina: 2 },
        notes: [
          'note_friars',
          'note_guardia_civil',
          'note_bahay_na_bato',
          'note_binondo',
          'note_indio',
          'note_principalia',
          'note_tinola',
          'note_rizal_europe',
        ],
      },
    });
  });

  it('decodes the minimal state (all defaults, checkpoint 1)', () => {
    const minimal = createState();
    minimal.checkpoint = 1;
    const code = 'kampana tagumpay bili sahig ikot abo burol';
    expect(encodeCode(minimal)).toBe(code);
    expect(decodeCode(code)).toEqual({
      ok: true,
      corrected: [],
      data: { version: 1, checkpoint: 1, title: 'Don', tiwala: 0, hinala: 0, flags: [], affinity: {}, notes: [] },
    });
  });

  it('pins layout 1 exactly', () => {
    expect(CODE_LAYOUTS[1]).toEqual({
      checkpointBits: 6,
      meterBits: 5,
      affinityBits: 3,
      flags: [
        'ch1_defied_damaso',
        'ch1_tactful',
        'ch1_silent',
        'ch1_honest',
        'ch1_hid_truth',
        'ch1_defended_indios',
        'ch1_sided_damaso',
        'guardia_watching',
      ],
      affinity: ['guevarra', 'isabel', 'tiago', 'sibyla', 'victorina'],
      notes: [
        'note_friars',
        'note_guardia_civil',
        'note_bahay_na_bato',
        'note_binondo',
        'note_indio',
        'note_principalia',
        'note_tinola',
        'note_rizal_europe',
      ],
    });
  });
});
