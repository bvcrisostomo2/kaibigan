// A tiny chapter that exercises every director feature. Used by director and integration tests.
export const miniCast = [{ id: 'isabel' }, { id: 'damaso' }, { id: 'ibarra' }];
export const miniGlossary = [{ id: 'indio', title: 'indio', body: 'Colonial label for native Filipinos.' }];
export const miniNotes = [{ id: 'note_indio', title: 'The word "indio"', body: 'A note.' }];
export const miniHints = [{ id: 'eyes', if: { hinalaAtLeast: 2 }, journal: 'You sense eyes on you.', setFlag: 'guardia_watching' }];

export const miniChapter = {
  number: 1,
  startBeat: 'arrive',
  dialogues: {
    greet: { id: 'greet', start: 'a', nodes: { a: { who: 'isabel', text: 'Welcome, {title} {name}!', next: null } } },
    isabel_chat: {
      id: 'isabel_chat',
      start: 'a',
      nodes: { a: { who: 'isabel', text: 'Mind the {g:indio|indios} talk tonight.', effects: { note: 'note_indio' }, next: null } },
    },
    isabel_again: { id: 'isabel_again', start: 'a', nodes: { a: { who: 'isabel', text: 'Go on, eat!', next: null } } },
    insult: {
      id: 'insult',
      start: 'a',
      nodes: {
        a: { who: 'damaso', face: 'angry', text: 'Is that all they taught you in Europe?', next: 'c' },
        c: {
          who: 'player',
          text: 'How do you respond?',
          choices: [
            { text: 'Answer him openly.', effects: { tiwala: 2, hinala: 2, flag: 'ch1_defied_damaso' }, next: null },
            { text: 'Change the subject with tact.', effects: { tiwala: 1, flag: 'ch1_tactful' }, next: null },
            { text: 'Say nothing.', effects: { tiwala: -1, flag: 'ch1_silent' }, next: null },
          ],
        },
      },
    },
    close_plans: { id: 'close_plans', start: 'a', nodes: { a: { who: 'ibarra', text: 'Come to San Diego with me.', next: null } } },
    close_alone: { id: 'close_alone', start: 'a', nodes: { a: { who: 'ibarra', text: 'Good night, my friend.', next: null } } },
  },
  beats: [
    {
      id: 'arrive',
      checkpoint: 1,
      actions: [['titleCard', 1], ['dialogue', 'greet']],
      interactions: { isabel: [{ dialogue: 'isabel_again', if: { flag: 'seen:isabel_chat' } }, 'isabel_chat'] },
    },
    {
      id: 'dinner',
      checkpoint: 2,
      restore: { flags: ['seen:greet'] },
      trigger: { flag: 'seen:isabel_chat', or: { enterZone: 'sala', afterSec: 60 } },
      actions: [['titleCard', 2], ['moveTo', 'damaso', 'table'], ['dialogue', 'insult']],
    },
    {
      id: 'close',
      actions: [
        ['branch', [
          { if: { tiwalaAtLeast: 2 }, actions: [['dialogue', 'close_plans']] },
          { if: { hinalaAtLeast: 2 }, actions: [['dialogue', 'close_alone'], ['cutscene', 'guardia_shadow']] },
          { actions: [['dialogue', 'close_alone']] },
        ]],
        ['endChapter'],
      ],
    },
  ],
};
