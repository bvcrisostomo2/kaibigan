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

  it('checks cutscenes, beat spawns, beat locations and title cards', () => {
    expect(errorsFor((ch) => { ch.beats[2].actions[0][1][1].actions[1] = ['cutscene', 'nope']; })).toContain("beat 'close'.actions[0].case[1][1]: cutscene 'nope' not found");
    expect(errorsFor((ch) => { ch.cutscenes.guardia_shadow.push(['dialogue', 'greet']); })).toContain("cutscene 'guardia_shadow'[1]: only host actions may run in a cutscene, not 'dialogue'");
    expect(errorsFor((ch) => { ch.cutscenes.guardia_shadow.push(['cutscene', 'guardia_shadow']); })).toContain("cutscene 'guardia_shadow'[1]: only host actions may run in a cutscene, not 'cutscene'");
    expect(errorsFor((ch) => { ch.cutscenes.guardia_shadow.push(['moveTo', 'nobody', 'table']); })).toContain("cutscene 'guardia_shadow'[1]: actor 'nobody' not found");
    expect(errorsFor((ch) => { ch.beats[0].spawn = 'roof'; })).toContain("beat 'arrive': spawn 'roof' not found");
    expect(errorsFor((ch) => { ch.beats[0].spawn = 'table'; })).toEqual([]);
    expect(errorsFor((ch) => { ch.beats[0].location = 'casa'; })).toContain("beat 'arrive': location 'casa' not found");
    expect(errorsFor((ch) => { ch.locations = { casa: { name: 'Casa', detail: '' } }; ch.beats[0].location = 'casa'; })).toEqual([]);
    expect(errorsFor((ch) => { ch.titleCards = { 1: { title: 'I', subtitle: 'One' } }; })).toContain("beat 'dinner'.actions[0]: title card '2' not found");
  });

  it('checks seating actions and counted conditions', () => {
    expect(errorsFor((ch) => { ch.beats[1].actions.push(['sit', 'damaso', 'table', 'down'], ['stand', 'damaso']); })).toEqual([]);
    expect(errorsFor((ch) => { ch.beats[1].actions.push(['sit', 'ghost', 'table', 'down']); })).toContain("beat 'dinner'.actions[3]: actor 'ghost' not found");
    expect(errorsFor((ch) => { ch.beats[1].actions.push(['sit', 'damaso', 'roof', 'down']); })).toContain("beat 'dinner'.actions[3]: spot 'roof' not found");
    expect(errorsFor((ch) => { ch.beats[1].actions.push(['sit', 'damaso', 'table', 'sideways']); })).toContain("beat 'dinner'.actions[3]: sit needs a facing, not 'sideways'");
    expect(errorsFor((ch) => { ch.beats[1].actions.push(['stand', 'ghost']); })).toContain("beat 'dinner'.actions[3]: actor 'ghost' not found");
    expect(errorsFor((ch) => { ch.beats[1].trigger = { countAtLeast: { n: 1, flags: ['seen:greet'] } }; })).toEqual([]);
    const counted = base();
    counted.chapters[0].beats[1].trigger = { countAtLeast: { n: 1, flags: ['seen:nope'] } };
    expect(validateContent(counted).warnings).toContain("beat 'dinner'.trigger: flag 'seen:nope' is never set (fine only if a later chapter sets it)");
    expect(errorsFor((ch) => { ch.beats[1].trigger = { countAtLeast: { n: 2, flags: ['seen:greet'] } }; })).toContain("beat 'dinner'.trigger: countAtLeast needs { n, flags } with 1 ≤ n ≤ flags.length");
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

    it('reports restore flags that save codes already store', () => {
      const content = base({ codeLayouts: { 1: layout } });
      content.chapters[0].beats[1].restore = { flags: ['seen:greet', 'ch1_tactful'] };
      const { errors } = validateContent(content);
      expect(errors).toContain("beat 'dinner'.restore: flag 'ch1_tactful' is stored in save codes; remove it from restore");
      expect(errors.some((e) => e.includes("'seen:greet'"))).toBe(false);
    });

    it('reports unknown affinity cast and notes', () => {
      const bad = { ...layout, affinity: ['nobody'], notes: ['nope'] };
      const { errors } = validateContent(base({ codeLayouts: { 1: bad } }));
      expect(errors).toContain("code layout 1: affinity cast 'nobody' not found");
      expect(errors).toContain("code layout 1: note 'nope' not found");
    });
  });
});
