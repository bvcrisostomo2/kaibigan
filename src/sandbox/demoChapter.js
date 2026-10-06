// A throwaway demo chapter for Plan 3: just enough story to drive every UI screen in the
// sandbox (title card, narrator and player lines, choices, glossary terms, notes, bios, a felt
// hint, two checkpoints and the chapter-end card). Stand-in lines, not the novel's text;
// Plan 4 replaces it with content/chapter1. Actor ids match sandboxCast (sandboxLevel.js).
export const demoCast = [
  { id: 'isabel', name: 'Tía Isabel', costume: 'isabel', bio: "Capitan Tiago's cousin, who runs his household and greets his guests." },
  { id: 'ibarra', name: 'Crisostomo Ibarra', costume: 'ibarra', bio: 'Your childhood friend, home after seven years in Europe.' },
  { id: 'damaso', name: 'Padre Dámaso', costume: 'damaso', bio: 'A Franciscan friar, for twenty years the curate of San Diego.' },
  { id: 'sibyla', name: 'Padre Sibyla', costume: 'sibyla', bio: 'A young Dominican friar, quiet and watchful.' },
  { id: 'guevarra', name: 'Teniente Guevarra', costume: 'guevarra', bio: 'An officer of the Guardia Civil.' },
  { id: 'victorina', name: 'Doña Victorina', costume: 'victorina', bio: 'A guest who dresses in the latest European fashion.' },
  { id: 'tiago', name: 'Capitan Tiago', costume: 'tiago', bio: 'Your host, one of the richest men in Binondo.' },
];

export const demoGlossary = [
  { id: 'indio', title: 'indio', body: 'The Spanish colonial word for native Filipinos, often used to look down on them.' },
  { id: 'zaguan', title: 'zaguán', body: 'The entrance hall on the stone ground floor of a bahay na bato.' },
  { id: 'sala', title: 'sala', body: 'The main room upstairs, where guests were received.' },
];

// Ids from the save-code layout, so found notes survive a code.
export const demoNotes = [
  { id: 'note_bahay_na_bato', title: 'The bahay na bato', body: 'A "house of stone": a stone ground floor for storage and carriages, and a wooden upper floor where the family lived.' },
  { id: 'note_indio', title: 'The word "indio"', body: 'Spanish officials and friars called native Filipinos indios. Rizal wrote against the contempt behind the label.' },
];

export const demoHints = [{ id: 'demo_eyes', if: { hinalaAtLeast: 1 }, journal: 'You sense eyes on you.' }];

export const demoLetter = {
  heading: 'Barcelona',
  paragraphs: [
    'My dear friend,',
    'After seven years I am finally coming home. My ship reaches Manila tomorrow, and Capitan Tiago has asked me to dine at his house that same evening.',
    'There is so much I want to hear from you: about San Diego, about my father, about everything I missed. Say you will be there.',
  ],
  closing: 'Your friend always,',
  signature: 'Crisostomo Ibarra',
};

const line = (id, nodes) => ({ id, start: 'a', nodes });

export const demoChapter = {
  number: 1,
  startBeat: 'demo_arrive',
  titleCards: { 1: { title: 'Kabanata I: Isang Handaan', subtitle: 'Chapter I: A Gathering' } },
  locations: {
    calle: { name: 'Calle Anloague', detail: 'Binondo, Manila · 1880s' },
    casa: { name: 'Casa de Capitan Tiago', detail: 'Calle Anloague, Binondo · 1880s' },
  },
  endCard: {
    recap: 'You came to Capitan Tiago\'s house on the evening Ibarra came home, met the guests and heard Padre Dámaso hold forth. (Demo recap: the real one arrives with Chapter 1.)',
    prompts: [
      'Why might the guests react so differently to Ibarra\'s return?',
      'What does Padre Dámaso\'s way of speaking about the indios tell you about his power?',
      'Was it worth speaking up tonight? What did it cost, and what did it gain?',
    ],
    standings: [
      { if: { tiwalaAtLeast: 1 }, text: 'Ibarra is glad you were there.' },
      { if: { tiwalaBelow: 1 }, text: 'Ibarra wonders what you are keeping from him.' },
      { if: { hinalaAtLeast: 1 }, text: 'Padre Dámaso will remember your name.' },
    ],
  },
  dialogues: {
    demo_intro: line('demo_intro', {
      a: { who: 'narrator', text: 'Calle Anloague, at dusk. Lanterns are being lit along the street, and music drifts down from Capitan Tiago\'s house.', next: 'b' },
      b: { who: 'player', text: 'Ibarra lands today. He wrote that he would come to the dinner.', next: null },
    }),
    demo_ibarra: line('demo_ibarra', {
      a: { who: 'ibarra', face: 'smile', text: '{name}! Seven years, and you look exactly the same.', effects: { bio: 'ibarra' }, next: 'b' },
      b: { who: 'ibarra', text: 'Tell me honestly. People look away when I mention my father. Is something wrong?', next: 'c' },
      c: {
        who: 'player',
        choices: [
          { text: 'Promise to talk later, away from the crowd.', effects: { tiwala: 1 }, next: 'd' },
          { text: 'Tell him nothing is wrong.', effects: { tiwala: -1 }, next: 'e' },
        ],
      },
      d: { who: 'ibarra', text: 'Later, then. I will hold you to it.', next: null },
      e: { who: 'ibarra', face: 'frown', text: 'I see.', next: null },
    }),
    demo_ibarra_again: line('demo_ibarra_again', {
      a: { who: 'ibarra', text: 'Go on in. I will follow when I can.', next: null },
    }),
    demo_guevarra: line('demo_guevarra', {
      a: { who: 'guevarra', text: 'Good evening, {title}. The {g:zaguan|zaguán} is through that door; the guests are upstairs in the {g:sala}.', effects: { bio: 'guevarra' }, next: null },
    }),
    demo_isabel: line('demo_isabel', {
      a: { who: 'isabel', face: 'smile', text: 'Welcome, welcome! Go up, {title} {name}, everyone is in the {g:sala}.', effects: { bio: 'isabel', note: 'note_bahay_na_bato' }, next: null },
    }),
    demo_damaso: line('demo_damaso', {
      a: { who: 'damaso', face: 'angry', text: 'I know the {g:indio|indios} better than anyone in this room. Twenty years I lived among them!', effects: { bio: 'damaso' }, next: 'b' },
      b: {
        who: 'player',
        text: 'Everyone turns to see who will answer.',
        choices: [
          { text: 'Listen and say nothing.', next: 'c' },
          { text: 'Say the people of San Diego deserve more respect.', effects: { hinala: 1, flag: 'demo_spoke_up', note: 'note_indio' }, next: 'd' },
        ],
      },
      c: { who: 'damaso', text: 'At least someone here has manners.', next: null },
      d: { who: 'damaso', face: 'angry', text: 'Respect? You young people learn nothing in your schools!', next: null },
    }),
    demo_tiago: line('demo_tiago', {
      a: { who: 'tiago', face: 'smile', text: 'Ah, {title} {name}! Ibarra will be here any moment. Eat, eat!', effects: { bio: 'tiago' }, next: null },
    }),
    demo_victorina: line('demo_victorina', {
      a: { who: 'victorina', text: 'Is this not the latest fashion from Madrid? Nobody here understands such things.', effects: { bio: 'victorina' }, next: null },
    }),
    demo_sibyla: line('demo_sibyla', {
      a: { who: 'sibyla', text: 'Padre Dámaso is in a temper tonight. It would be wise not to provoke him.', effects: { bio: 'sibyla' }, next: null },
    }),
    demo_goodnight: line('demo_goodnight', {
      a: { who: 'narrator', text: 'The evening wears on. This is where the demo ends.', next: null },
    }),
  },
  beats: [
    {
      id: 'demo_arrive',
      checkpoint: 1,
      location: 'calle',
      actions: [['setTime', 'dusk'], ['titleCard', 1], ['dialogue', 'demo_intro']],
      interactions: {
        ibarra: [{ dialogue: 'demo_ibarra_again', if: { flag: 'seen:demo_ibarra' } }, 'demo_ibarra'],
        guevarra: 'demo_guevarra',
        isabel: 'demo_isabel',
      },
    },
    {
      id: 'demo_sala',
      location: 'casa',
      trigger: { enterZone: 'sala', or: { afterSec: 300 } },
      actions: [['setTime', 'evening', 3], ['dialogue', 'demo_damaso']],
      interactions: { tiago: 'demo_tiago', victorina: 'demo_victorina', sibyla: 'demo_sibyla' },
    },
    {
      id: 'demo_end',
      checkpoint: 2,
      restore: { flags: ['seen:demo_damaso'] },
      location: 'casa',
      trigger: { flag: 'seen:demo_tiago', or: { afterSec: 240 } },
      actions: [['setTime', 'night', 2], ['dialogue', 'demo_goodnight'], ['endChapter']],
    },
  ],
};
