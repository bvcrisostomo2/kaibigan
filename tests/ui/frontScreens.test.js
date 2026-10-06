import { describe, it, expect } from 'vitest';
import { runFrontScreens } from '../../src/ui/frontScreens.js';
import { createState, serialize } from '../../src/story/state.js';
import { SAVE_KEY } from '../../src/story/save.js';
import { encodeCode } from '../../src/story/saveCode.js';
import { miniChapter, miniHints } from '../fixtures/miniChapter.js';
import { fakeViews, flush } from '../support/fakeViews.js';

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; },
  };
}
const letter = { heading: 'Manila', paragraphs: ['I land tomorrow.'], closing: 'Your friend, Crisostomo' };

function start(storage) {
  const views = fakeViews();
  let result = null;
  runFrontScreens({ views, storage, chapters: [miniChapter], hints: miniHints, letter }).then((r) => (result = r));
  return { views, result: () => result };
}

describe('runFrontScreens', () => {
  it('starts a new game from the signed letter, re-showing name errors', async () => {
    const { views, result } = start(memoryStorage());
    expect(views.title.vm.items.map((i) => i.id)).toEqual(['newGame', 'enterCode']);
    expect(views.title.vm).toMatchObject({ title: 'Kaibigan', subtitle: 'A Noli Me Tangere Story', notice: null });
    views.title.handlers.onSelect('newGame');
    expect(views.title.visible).toBe(false);
    expect(views.letter.vm).toMatchObject({ letter, titles: ['Don', 'Doña'], name: '', title: 'Don', error: null });
    views.letter.handlers.onSign('Ana2', 'Doña');
    expect(views.letter.vm).toMatchObject({ name: 'Ana2', title: 'Doña', error: 'Please use letters, spaces, apostrophes or hyphens only.' });
    views.letter.handlers.onSign(' Ana ', 'Doña');
    await flush();
    expect(views.letter.visible).toBe(false);
    expect(result().beatId).toBe('arrive');
    expect(result().state).toMatchObject({ name: 'Ana', title: 'Doña', beat: null });
  });

  it('continues an autosave at its beat', async () => {
    const saved = { ...createState({ name: 'Ana' }), beat: 'dinner', checkpoint: 2 };
    const { views, result } = start(memoryStorage({ [SAVE_KEY]: serialize(saved) }));
    expect(views.title.vm.items[0]).toEqual({ id: 'continue', label: 'Continue', sub: 'Magpatuloy' });
    views.title.handlers.onSelect('continue');
    await flush();
    expect(result()).toEqual({ state: saved, beatId: 'dinner' });
  });

  it('asks before a new game replaces an autosave', async () => {
    const saved = { ...createState({ name: 'Ana' }), beat: 'dinner', checkpoint: 2 };
    const { views, result } = start(memoryStorage({ [SAVE_KEY]: serialize(saved) }));
    views.title.handlers.onSelect('newGame');
    expect(views.title.visible).toBe(true);
    expect(views.title.vm.confirm).toEqual({ text: 'Start a new game? Your saved game will be replaced.', yes: 'Start a new game', no: 'Keep my save' });
    views.title.handlers.onCancel();
    expect(views.title.vm.confirm).toBe(null);
    views.title.handlers.onSelect('newGame');
    views.title.handlers.onConfirm();
    expect(views.letter.visible).toBe(true);
    views.letter.handlers.onSign('Ben', 'Don');
    await flush();
    expect(result().state.name).toBe('Ben');
  });

  it('discards a corrupt save with the spec message and no Continue', () => {
    const storage = memoryStorage({ [SAVE_KEY]: '{broken' });
    const { views } = start(storage);
    expect(views.title.vm.notice).toBe("Couldn't load your save, starting fresh");
    expect(views.title.vm.items.map((i) => i.id)).toEqual(['newGame', 'enterCode']);
    expect(storage.data[SAVE_KEY]).toBeUndefined();
    views.title.handlers.onSelect('continue'); // not offered: ignored
    expect(views.title.visible).toBe(true);
  });

  it('plays without storage (blocked) and never offers Continue', () => {
    const { views } = start(null);
    expect(views.title.vm.items.map((i) => i.id)).toEqual(['newGame', 'enterCode']);
  });

  it('loads a save code at its checkpoint, keeping typed words on errors', async () => {
    const coded = createState({ name: 'x', title: 'Doña' });
    coded.checkpoint = 2;
    coded.flags.push('ch1_tactful');
    const code = encodeCode(coded);
    const { views, result } = start(memoryStorage());
    views.title.handlers.onSelect('enterCode');
    expect(views.code.vm).toMatchObject({ words: '', name: '', error: null, labels: { heading: 'Enter your save code' } });
    views.code.handlers.onSubmit('zzzz', 'Ana');
    expect(views.code.vm).toMatchObject({ words: 'zzzz', name: 'Ana', field: 'words', error: "I don't recognize the word 'zzzz' (word 1)." });
    views.code.handlers.onBack();
    expect(views.title.visible).toBe(true);
    views.title.handlers.onSelect('enterCode');
    views.code.handlers.onSubmit(code, 'Ana');
    await flush();
    expect(result().beatId).toBe('dinner');
    expect(result().state).toMatchObject({ name: 'Ana', title: 'Doña', checkpoint: 2 });
    expect(result().state.flags).toEqual(expect.arrayContaining(['ch1_tactful', 'seen:greet'])); // the beat's restore flags
  });
});
