// Chapter 1's content bundle for startGame (src/boot/game.js).
import { chapter1Level } from './level.js';
import { chapter1Cast } from './cast.js';
import { chapter1Letter } from './letter.js';
import { chapter1Notes } from './notes.js';
import { chapter1Beats, chapter1Cutscenes } from './beats.js';
import { openingDialogues } from './dialogue/opening.js';
import { salaDialogues } from './dialogue/sala.js';
import { argumentDialogues } from './dialogue/argument.js';
import { entranceDialogues } from './dialogue/entrance.js';
import { dinnerDialogues } from './dialogue/dinner.js';
import { houseDialogues, houseInteractions } from './dialogue/house.js';
import { GLOSSARY } from '../glossary.js';
import { HINTS } from '../hints.js';

export const chapter1 = {
  number: 1,
  startBeat: 'k1_arrive',
  titleCards: {
    1: { title: 'Kabanata I: Isang Handaan', subtitle: 'Chapter I: A Gathering' },
    2: { title: 'Kabanata II: Si Crisostomo Ibarra', subtitle: 'Chapter II: Crisostomo Ibarra' },
    3: { title: 'Kabanata III: Ang Hapunan', subtitle: 'Chapter III: The Dinner' },
  },
  locations: {
    calle: { name: 'Calle Anloague', detail: 'Binondo, Manila · 1880s' },
    casa: { name: 'Casa de Capitan Tiago', detail: 'Calle Anloague, Binondo · 1880s' },
  },
  // Plan 4b-1's card: the evening so far. Plan 4b-2 replaces it with the chapter's full end card.
  endCard: {
    recap: 'At Capitan Tiago\'s dinner, Padre Dámaso held forth on the "indolent" indios until Teniente Guevarra told how a worthy man of San Diego was dug up from his grave. Then Ibarra came home in mourning, and Dámaso denied his father. At table the friar got the neck of the chicken, sneered at what Ibarra had learned in Europe, and Ibarra answered with courtesy and left. To be continued.',
    prompts: [
      'Padre Dámaso and Señor Laruja call the indios indolent in a house that belongs to one. What does it tell you that they feel free to say it there?',
      'Ibarra answers Dámaso\'s insult with courtesy, then leaves. Was that strength, or a retreat?',
      'At dinner you chose how to answer Dámaso. What did your answer risk, and what did it protect?',
    ],
    standings: [
      { if: { flag: 'ch1_defied_damaso' }, text: 'Padre Dámaso will remember your name.' },
      { if: { flag: 'ch1_tactful' }, text: 'Ibarra noticed you speak up for him.' },
      { if: { flag: 'ch1_silent' }, text: 'Ibarra looked for you when Dámaso spoke. You looked at your plate.' },
      { if: { flag: 'ch1_defended_indios' }, text: 'Teniente Guevarra counts you among the decent ones.' },
      { if: { flag: 'ch1_sided_damaso' }, text: 'Padre Dámaso thinks you a sensible young person.' },
    ],
  },
  cutscenes: chapter1Cutscenes,
  dialogues: { ...openingDialogues, ...salaDialogues, ...argumentDialogues, ...entranceDialogues, ...dinnerDialogues, ...houseDialogues },
  // The household's and the street's lines, and the shut doors, in every beat (Plan 5a).
  interactions: houseInteractions,
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
