// The front screens (spec §3.2, §3.9, §4.2): title → letter intro (New Game) or code entry
// (Enter Code) → a game to start. Resolves { state, beatId }:
//   Continue    the autosave, at its beat (or its checkpoint's beat if the beat was removed)
//   New Game    a fresh state from the signed letter, at the first chapter's start beat
//   Enter Code  a state rebuilt from the code, at the code's checkpoint beat
// Views are injected (DOM views in the game, fakes in tests):
//   views.title.show({ title, subtitle, items: [{ id, label, sub }], notice }, { onSelect(id) })
//   views.letter.show({ letter, titles, name, title, error, labels }, { onSign(name, title) })
//   views.code.show({ words, name, error, field, labels }, { onSubmit(words, name), onBack() })
// and each has hide().
import { TITLES, createState } from '../story/state.js';
import { loadGame, clearSave } from '../story/save.js';
import { stateFromCode } from '../story/saveCode.js';
import { titleMenu } from './titleScreen.js';
import { signLetter } from './letterIntro.js';
import { submitCode } from './codeEntry.js';
import { t } from './strings.js';

export function runFrontScreens({ views, storage, chapters, hints = [], letter }) {
  return new Promise((resolve) => {
    const load = storage ? loadGame(storage) : { error: 'unavailable' };
    const menu = titleMenu(load, chapters);
    if (menu.notice && storage) clearSave(storage);

    function showTitle() {
      views.title.show({
        title: t('game.title'),
        subtitle: t('game.subtitle'),
        items: menu.items.map((id) => ({ id, label: t(`title.${id}`), sub: id === 'continue' ? t('title.continueSub') : null })),
        notice: menu.notice ? t(menu.notice) : null,
      }, {
        onSelect(id) {
          if (!menu.items.includes(id)) return;
          views.title.hide();
          if (id === 'continue') resolve({ state: load.state, beatId: menu.resume });
          else if (id === 'newGame') showLetter({ name: '', title: TITLES[0], error: null });
          else showCode({ words: '', name: '', error: null, field: null });
        },
      });
    }

    function showLetter(form) {
      views.letter.show({
        letter,
        titles: TITLES,
        ...form,
        labels: { name: t('letter.nameLabel'), title: t('letter.titleLabel'), sign: t('letter.sign') },
      }, {
        onSign(name, title) {
          const r = signLetter(name, title);
          if (!r.ok) return showLetter({ name, title, error: t(`letter.nameError.${r.error}`) });
          views.letter.hide();
          resolve({ state: createState({ name: r.name, title: r.title }), beatId: chapters[0].startBeat });
        },
      });
    }

    function showCode(form) {
      views.code.show({
        ...form,
        labels: { heading: t('code.heading'), words: t('code.wordsLabel'), name: t('code.nameLabel'), submit: t('code.submit'), back: t('code.back') },
      }, {
        onSubmit(words, name) {
          const r = submitCode(words, name, chapters);
          if (!r.ok) return showCode({ words, name, error: r.message, field: r.field });
          views.code.hide();
          resolve({ state: stateFromCode(r.data, r.name, r.beat.restore, hints), beatId: r.beat.id });
        },
        onBack() {
          views.code.hide();
          showTitle();
        },
      });
    }

    showTitle();
  });
}
