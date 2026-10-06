// Chapter 1's content bundle for startGame (src/boot/game.js).
import { chapter1Level } from './level.js';
import { chapter1Cast } from './cast.js';
import { chapter1Letter } from './letter.js';
import { chapter1Notes } from './notes.js';
import { chapter1Beats } from './beats.js';
import { openingDialogues } from './dialogue/opening.js';
import { GLOSSARY } from '../glossary.js';
import { HINTS } from '../hints.js';

export const chapter1 = {
  number: 1,
  startBeat: 'k1_arrive',
  titleCards: {
    1: { title: 'Kabanata I: Isang Handaan', subtitle: 'Chapter I: A Gathering' },
  },
  locations: {
    calle: { name: 'Calle Anloague', detail: 'Binondo, Manila · 1880s' },
    casa: { name: 'Casa de Capitan Tiago', detail: 'Calle Anloague, Binondo · 1880s' },
  },
  endCard: {
    recap: 'On the last of October, Capitan Tiago gave a dinner, and half of Binondo came to his house on Calle Anloague. You have arrived; Ibarra has not, yet. The rest of the evening is still being written.',
    prompts: [
      'Rizal describes the house before the people in it. What does the house tell you about Capitan Tiago?',
      'Why might Capitan Tiago want Ibarra kept from the news about his father tonight?',
      'What do you expect from a dinner where every guest wants to seem an old friend of the host?',
    ],
    standings: [],
  },
  cutscenes: {},
  dialogues: { ...openingDialogues },
  beats: chapter1Beats,
};

export const chapter1Content = {
  level: chapter1Level,
  cast: chapter1Cast,
  chapter: chapter1,
  glossary: GLOSSARY,
  notes: chapter1Notes,
  hints: HINTS,
  letter: chapter1Letter,
};
