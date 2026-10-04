import { describe, it, expect } from 'vitest';
import { validateContent } from '../../src/story/validate.js';
import { miniChapter, miniCast, miniGlossary, miniNotes, miniHints } from '../fixtures/miniChapter.js';
import { ENDINGS } from '../../src/content/endings.js';

const clone = (x) => structuredClone(x);

function base(overrides = {}) {
  return {
    chapters: [clone(miniChapter)],
    cast: miniCast,
    glossary: miniGlossary,
    notes: miniNotes,
    hints: miniHints,
    endings: ENDINGS,
    level: { zones: ['sala'], spots: ['table'] },
    ...overrides,
  };
}

function errorsFor(mutate) {
  const content = base();
  mutate(content.chapters[0], content);
  return validateContent(content).errors;
}

describe('validateContent', () => {
  it('accepts the fixture chapter with no errors', () => {
    expect(validateContent(base()).errors).toEqual([]);
  });

  it('warns about flags that are read but never set', () => {
    const { warnings } = validateContent(base());
    expect(warnings.some((w) => w.includes("'testified_against_ibarra'"))).toBe(true);
  });

  it.each([
    ['a missing next node', (ch) => { ch.dialogues.greet.nodes.a.next = 'q'; }, "greet.a → next 'q' not found"],
    ['an unknown speaker', (ch) => { ch.dialogues.greet.nodes.a.who = 'tiyo'; }, "greet.a: speaker 'tiyo' not found"],
    ['an unknown glossary term', (ch) => { ch.dialogues.greet.nodes.a.text = '{g:zzz}'; }, "greet.a: glossary term 'zzz' not found"],
    ['an unknown effect', (ch) => { ch.dialogues.greet.nodes.a.effects = { trust: 1 }; }, "greet.a: unknown effect 'trust'"],
    ['an unknown note', (ch) => { ch.dialogues.greet.nodes.a.effects = { note: 'nope' }; }, "greet.a: note 'nope' not found"],
    ['an unknown condition key', (ch) => { ch.dialogues.greet.nodes.a.if = { flagg: 'x' }; }, "greet.a: unknown condition key 'flagg'"],
    ['a missing start node', (ch) => { ch.dialogues.greet.start = 'zz'; }, "greet: start 'zz' not found"],
    ['a mismatched dialogue id', (ch) => { ch.dialogues.greet.id = 'hello'; }, "dialogue 'greet': id field is 'hello'"],
    ['an unknown action', (ch) => { ch.beats[0].actions.push(['dance']); }, "unknown action 'dance'"],
    ['a missing dialogue in actions', (ch) => { ch.beats[0].actions.push(['dialogue', 'nope']); }, "dialogue 'nope' not found"],
    ['a missing setBeat target', (ch) => { ch.beats[0].actions.push(['setBeat', 'nope']); }, "beat 'nope' not found"],
    ['an unknown actor', (ch) => { ch.beats[1].actions.push(['moveTo', 'ghost', 'table']); }, "actor 'ghost' not found"],
    ['an unknown spot', (ch) => { ch.beats[1].actions.push(['moveTo', 'damaso', 'roof']); }, "spot 'roof' not found"],
    ['an unknown zone', (ch) => { ch.beats[1].trigger = { enterZone: 'attic' }; }, "zone 'attic' not found"],
    ['a branch without default', (ch) => { ch.beats[2].actions[0][1].pop(); }, 'branch must end with a default case'],
    ['a missing interaction dialogue', (ch) => { ch.beats[0].interactions.isabel = 'nope'; }, "interactions.isabel: dialogue 'nope' not found"],
    ['a duplicate checkpoint', (ch) => { ch.beats[2].checkpoint = 1; }, 'checkpoint 1 already used'],
    ['a missing start beat', (ch) => { ch.startBeat = 'nope'; }, "startBeat 'nope' not found"],
  ])('reports %s', (_label, mutate, message) => {
    expect(errorsFor(mutate).some((e) => e.includes(message))).toBe(true);
  });

  it('requires a default ending', () => {
    const { errors } = validateContent(base({ endings: [{ id: 'x', if: { flag: 'a' } }] }));
    expect(errors).toContain("endings: the last ending must have no 'if' (default)");
  });

  it('requires hints to have a condition', () => {
    const { errors } = validateContent(base({ hints: [{ id: 'h', journal: 'x' }] }));
    expect(errors).toContain("hint 'h': needs an 'if' condition");
  });

  describe('save-code coverage', () => {
    const layout = { checkpointBits: 6, meterBits: 5, affinityBits: 3, flags: ['ch1_defied_damaso', 'ch1_tactful', 'ch1_silent', 'guardia_watching'], affinity: ['isabel'], notes: ['note_indio'] };

    it('passes when every persistent flag is stored and every stored flag is set', () => {
      expect(validateContent(base({ codeLayouts: { 1: layout } })).errors).toEqual([]);
    });

    it('reports a persistent flag missing from the layout', () => {
      const partial = { ...layout, flags: ['ch1_defied_damaso', 'ch1_tactful', 'guardia_watching'] };
      expect(validateContent(base({ codeLayouts: { 1: partial } })).errors).toContain("flag 'ch1_silent' is a persistent choice but no code layout stores it");
    });

    it('reports a stored flag that content never sets', () => {
      const extra = { ...layout, flags: [...layout.flags, 'ch1_ghost'] };
      expect(validateContent(base({ codeLayouts: { 1: extra } })).errors).toContain("code layout 1: flag 'ch1_ghost' is never set by content");
    });

    it('reports unknown affinity cast and notes', () => {
      const bad = { ...layout, affinity: ['nobody'], notes: ['nope'] };
      const { errors } = validateContent(base({ codeLayouts: { 1: bad } }));
      expect(errors).toContain("code layout 1: affinity cast 'nobody' not found");
      expect(errors).toContain("code layout 1: note 'nope' not found");
    });
  });
});
