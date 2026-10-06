// Every DOM view, in stacking order (later ones draw on top), under one UI root element.
import { createHudView, createMarkersView, createTitleCardView, createToastsView, createKodigoView } from './panelViews.js';
import { createDialogueView, createGlossaryView } from './dialogueViews.js';
import { createJournalView, createMenuView, createChapterEndView } from './menuViews.js';
import { createTitleView, createLetterView, createCodeView } from './frontViews.js';

export function createDomViews(root) {
  return {
    hud: createHudView(root),
    markers: createMarkersView(root),
    toasts: createToastsView(root),
    kodigo: createKodigoView(root),
    titleCard: createTitleCardView(root),
    dialogue: createDialogueView(root),
    glossary: createGlossaryView(root),
    journal: createJournalView(root),
    menu: createMenuView(root),
    chapterEnd: createChapterEndView(root),
    title: createTitleView(root),
    letter: createLetterView(root),
    code: createCodeView(root),
  };
}
