// Kabanata I, free talk in the sala (spec §3.3, §3.7). Descriptions are condensed from Rizal's
// Chapter I in the public-domain Charles Derbyshire translation (1912), shortened and given period
// flavour (Plan 5 spec §4.9). The book gives these guests few words to the player, so their lines
// here are short, original and kept in character; the player's lines are original.
const dialogue = (id, nodes) => ({ id, start: 'a', nodes });

// Before the argument: talking to anyone in Dámaso's group draws you into it.
export const salaDialogues = {
  k1_join_group: dialogue('k1_join_group', {
    a: { who: 'narrator', text: "Padre Dámaso holds forth at the small table; the fair young man beside him can't get a word in. No one makes room for you, but no one sends you away.", effects: { bio: 'damaso' }, next: null },
  }),
  k1_sibyla: dialogue('k1_sibyla', {
    a: { who: 'narrator', text: 'A young Dominican, polished as his gold-rimmed spectacles: Padre Sibyla, {g:cura} of Binondo. He weighs every word.', effects: { bio: 'sibyla' }, next: 'b' },
    b: { who: 'sibyla', face: 'content', to: 'player', text: "From San Diego, I believe? Padre Dámaso's old parish. Then tonight will be... instructive.", next: 'c' },
    c: { who: 'player', face: 'thoughtful', text: 'Instructive, Padre?', next: 'd' },
    d: { who: 'sibyla', face: 'content', text: "The {g:friar|friars} of my order and of his rarely agree. Listen, and you'll learn whose country this is.", effects: { note: 'note_friars' }, next: null },
  }),
  k1_guevarra: dialogue('k1_guevarra', {
    a: { who: 'narrator', text: 'A tall old lieutenant of the {g:guardia_civil|Guardia Civil}, stern-faced. When he speaks at all, he is curt.', effects: { bio: 'guevarra', note: 'note_guardia_civil' }, next: 'b' },
    b: { who: 'guevarra', to: 'player', text: 'San Diego? I served there once. Buenos hombres in that town, some of them.', next: 'c' },
    c: { who: 'player', face: 'thoughtful', text: 'You knew Don Rafael Ibarra?', next: 'd' },
    d: { who: 'guevarra', face: 'annoyed', text: 'I knew him. Not here, joven. Not tonight.', next: null },
  }),
  k1_portrait: dialogue('k1_portrait', {
    a: { who: 'narrator', text: 'A portrait of a man in full dress, stiff as the tasselled cane in his ringed fingers. It seems to say: "Ahem! See how fine I am!"', effects: { note: 'note_principalia' }, next: 'b' },
    b: { who: 'player', face: 'happy', text: "Capitan Tiago as he'd like to be seen. The real one is rounder.", next: null },
  }),

  // After the argument: Victorina and Tiburcio have arrived, and everyone has something to say.
  k1_sibyla_after: dialogue('k1_sibyla_after', {
    a: { who: 'sibyla', face: 'thoughtful', to: 'player', text: 'Forgive me for touching so tender a subject. Padre Dámaso has a warm heart and a hot head. San Diego knows both.', effects: { bio: 'sibyla', note: 'note_friars' }, next: null },
  }),
  k1_guevarra_after: dialogue('k1_guevarra_after', {
    a: { who: 'narrator', text: 'The lieutenant stands at the window, his back to the room, looking down at Calle Anloague.', effects: { bio: 'guevarra', note: 'note_guardia_civil' }, next: 'b' },
    // A node whose 'if' fails is skipped along its own 'next', so the two replies are chained.
    b: { who: 'guevarra', face: 'content', to: 'player', if: { flag: 'ch1_defended_indios' }, text: 'You spoke up back there. Bien. Few here would have.', next: 'c' },
    c: { who: 'guevarra', face: 'thoughtful', to: 'player', if: { flag: 'ch1_defended_indios' }, text: 'Careful whom you say it to, all the same.', next: 'd' },
    d: { who: 'guevarra', face: 'embarrassed', to: 'player', if: { notFlag: 'ch1_defended_indios' }, text: "Forgive an old soldier's temper. Some things I won't hear, not even from a priest.", next: null },
  }),
  k1_damaso_after: dialogue('k1_damaso_after', {
    a: { who: 'damaso', face: 'angry', to: 'player', if: { flag: 'ch1_defended_indios' }, text: 'You again! From San Diego, eh? Then you should know better than to talk back to your {g:cura}.', effects: { bio: 'damaso' }, next: 'b' },
    b: { who: 'damaso', face: 'happy', to: 'player', if: { flag: 'ch1_sided_damaso' }, text: '¡Ja! One sensible head in this room. You see how it is, eh? Twenty years, and they send me off like a stranger.', effects: { bio: 'damaso' }, next: 'c' },
    c: { who: 'damaso', face: 'annoyed', to: 'player', if: { all: [{ notFlag: 'ch1_defended_indios' }, { notFlag: 'ch1_sided_damaso' }] }, text: "¿Qué? Can't you see I'm in no mood for talk?", effects: { bio: 'damaso' }, next: null },
  }),
  k1_laruja: dialogue('k1_laruja', {
    a: { who: 'narrator', text: 'Señor Laruja: a tiny man with a black beard, and a nose far too big to be his own.', effects: { bio: 'laruja' }, next: 'b' },
    b: { who: 'laruja', face: 'content', to: 'player', text: "He's sulking because no one bowed to him. Give the newcomer a few months, ¿eh? He'll think as we do. Everyone does.", next: null },
  }),
  k1_newcomer: dialogue('k1_newcomer', {
    a: { who: 'newcomer', face: 'thoughtful', to: 'player', text: "Perdone, you're a native here, ¿no? Four days I've been in the islands, studying them. Tell me honestly: this indolence they talk of. Is it true?", effects: { bio: 'newcomer' }, next: 'b' },
    b: {
      who: 'player',
      text: 'How do you answer him?',
      choices: [
        { text: 'Frankly: "People work hard for little, under masters who take most of it. Call that indolence if you like."', effects: { hinala: 1, note: 'note_indio' }, next: 'c' },
        { text: 'Change the subject: "Have you tried the tinola yet? You will, tonight."', next: 'd' },
      ],
    },
    c: { who: 'newcomer', face: 'happy', text: '¡Fascinante! May I write that down? For my book, you see.', next: null },
    d: { who: 'newcomer', face: 'content', text: 'Ah, the chicken and squash stew! Padre Dámaso warned me about it.', next: null },
  }),
  k1_victorina: dialogue('k1_victorina', {
    a: { who: 'narrator', text: 'Doña Victorina de los Reyes de Espadaña: a Filipina all frizzes, paint and European silk, fanning herself.', effects: { bio: 'victorina' }, next: 'b' },
    b: { who: 'victorina', move: 'fan', to: 'player', text: 'Call me Doctora: my husband is a médico, ¿sabe? Have you ever seen a gown like this in Manila? Only in Madrid!', next: 'c' },
    c: {
      who: 'player',
      text: 'What do you say?',
      choices: [
        { text: 'Humour her: "Never, Doctora. Madrid must miss you."', effects: { affinity: { victorina: 1 } }, next: 'd' },
        { text: 'Tease her: "And in Madrid, are the ruffles worn so very high?"', effects: { affinity: { victorina: -1 } }, next: 'e' },
      ],
    },
    d: { who: 'victorina', face: 'happy', move: 'fan', text: '¡Qué encanto! How charming! You must visit us. We so rarely find such good company.', next: null },
    e: { who: 'victorina', face: 'annoyed', text: "¡Hmph! One can see you've never been to Europe.", next: null },
  }),
  k1_tiburcio: dialogue('k1_tiburcio', {
    a: { who: 'narrator', text: "Don Tiburcio de Espadaña, lame and mild, leans on his wife's arm. He stammers, so he says as little as he can.", effects: { bio: 'tiburcio' }, next: 'b' },
    b: { who: 'tiburcio', face: 'embarrassed', to: 'player', text: 'B-buenas noches. A f-fine house. M-muy fine.', next: null },
  }),
};
