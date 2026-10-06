// Kabanata I, free talk in the sala (spec §3.3, §3.7). Descriptions are adapted from Rizal's
// Chapter I in the public-domain Charles Derbyshire translation (1912). The book gives these
// guests few words to the player, so their lines here are short, original and kept in character;
// the player's lines are original.
const dialogue = (id, nodes) => ({ id, start: 'a', nodes });

// Before the argument: talking to anyone in Dámaso's group draws you into it.
export const salaDialogues = {
  k1_join_group: dialogue('k1_join_group', {
    a: { who: 'narrator', text: 'Padre Dámaso is in full voice at the small table, and the fair young man beside him cannot get a word in. Nobody makes room for you, but nobody sends you away.', effects: { bio: 'damaso' }, next: null },
  }),
  k1_sibyla: dialogue('k1_sibyla', {
    a: { who: 'narrator', text: 'A young Dominican, handsome and polished as his gold-rimmed eyeglasses: Padre Sibyla, the curate of Binondo. He says little, and seems to weigh every word.', effects: { bio: 'sibyla' }, next: 'b' },
    b: { who: 'sibyla', text: 'You are from San Diego, I believe. Padre Dámaso\'s old parish. Then you will find this evening instructive.', next: 'c' },
    c: { who: 'player', text: 'Instructive, Padre?', next: 'd' },
    d: { who: 'sibyla', text: 'The {g:friar|friars} of my order and of his do not always agree. Listen, and you will learn which of us the country belongs to.', effects: { note: 'note_friars' }, next: null },
  }),
  k1_guevarra: dialogue('k1_guevarra', {
    a: { who: 'narrator', text: 'A tall, elderly lieutenant of the {g:guardia_civil|Guardia Civil}, with an austere face. He talks little, and when he does it is harsh and curt.', effects: { bio: 'guevarra', note: 'note_guardia_civil' }, next: 'b' },
    b: { who: 'guevarra', text: 'San Diego? I was posted there, years ago. I knew some good men in that town.', next: 'c' },
    c: { who: 'player', text: 'You knew Don Rafael Ibarra?', next: 'd' },
    d: { who: 'guevarra', face: 'frown', text: 'I knew him. Not here, young one. Not tonight.', next: null },
  }),
  k1_portrait: dialogue('k1_portrait', {
    a: { who: 'narrator', text: 'An oil painting of a handsome man in full dress, rigid and erect, straight as the tasselled cane in his stiff, ring-covered fingers. The whole of it seems to say, "Ahem! See how well dressed and how dignified I am!"', effects: { note: 'note_principalia' }, next: 'b' },
    b: { who: 'player', text: 'Capitan Tiago, painted as he would like to be seen. The real one is rounder.', next: null },
  }),

  // After the argument: Victorina and Tiburcio have arrived, and everyone has something to say.
  k1_sibyla_after: dialogue('k1_sibyla_after', {
    a: { who: 'sibyla', text: 'I am sorry to have touched so delicate a subject. Padre Dámaso has a warm heart and a hot head, and San Diego knows both.', effects: { bio: 'sibyla', note: 'note_friars' }, next: null },
  }),
  k1_guevarra_after: dialogue('k1_guevarra_after', {
    a: { who: 'narrator', text: 'The lieutenant stands at the window with his back to the room, looking down at Calle Anloague.', effects: { bio: 'guevarra', note: 'note_guardia_civil' }, next: 'b' },
    // A node whose 'if' fails is skipped along its own 'next', so the two replies are chained.
    b: { who: 'guevarra', if: { flag: 'ch1_defended_indios' }, text: 'You spoke up back there. Good. Few in this room would have.', next: 'c' },
    c: { who: 'guevarra', if: { flag: 'ch1_defended_indios' }, text: 'Be careful whom you say it to, all the same.', next: 'd' },
    d: { who: 'guevarra', if: { notFlag: 'ch1_defended_indios' }, text: 'Forgive an old soldier his temper. Some things I will not hear said, not even by a priest.', next: null },
  }),
  k1_damaso_after: dialogue('k1_damaso_after', {
    a: { who: 'damaso', face: 'angry', if: { flag: 'ch1_defended_indios' }, text: 'You again. From San Diego, are you? Then you should know better than to talk back to your curate.', effects: { bio: 'damaso' }, next: 'b' },
    b: { who: 'damaso', if: { flag: 'ch1_sided_damaso' }, text: 'Ha! There is one sensible head in this room. You see how it is, eh? Twenty years, and they send me off like a stranger.', effects: { bio: 'damaso' }, next: 'c' },
    c: { who: 'damaso', face: 'frown', if: { all: [{ notFlag: 'ch1_defended_indios' }, { notFlag: 'ch1_sided_damaso' }] }, text: 'What? Can\'t you see I am in no humour for talk?', effects: { bio: 'damaso' }, next: null },
  }),
  k1_laruja: dialogue('k1_laruja', {
    a: { who: 'narrator', text: 'Señor Laruja: a very small man with a black beard, and a nose which, to judge from its size, ought not to belong to him.', effects: { bio: 'laruja' }, next: 'b' },
    b: { who: 'laruja', text: 'He is in a bad humour because nobody treated him with deference. Our host? Santiago is made of the right stuff. Though he is not the man who invented gunpowder, eh?', next: null },
  }),
  k1_newcomer: dialogue('k1_newcomer', {
    a: { who: 'newcomer', text: 'Forgive me, but you are a native of the country, are you not? I have been here four days, at my own expense, to study it. Tell me honestly: this indolence they speak of. Is it true?', effects: { bio: 'newcomer' }, next: 'b' },
    b: {
      who: 'player',
      text: 'How do you answer him?',
      choices: [
        { text: 'Answer frankly: "People work hard for little, under masters who take most of it. Call that indolence if you like."', effects: { hinala: 1, note: 'note_indio' }, next: 'c' },
        { text: 'Change the subject: "Have you tried the tinola yet? You will, tonight."', next: 'd' },
      ],
    },
    c: { who: 'newcomer', text: 'Fascinating. Fascinating! May I write that down? I am keeping notes, you see, for a book.', next: null },
    d: { who: 'newcomer', text: 'Ah, the stew of chicken and squash. Padre Dámaso has warned me about it.', next: null },
  }),
  k1_victorina: dialogue('k1_victorina', {
    a: { who: 'narrator', text: 'Doña Victorina de los Reyes de Espadaña: a Filipina resplendent in frizzes, paint and a European gown, fanning herself.', effects: { bio: 'victorina' }, next: 'b' },
    b: { who: 'victorina', text: 'You must call me Doctora: my husband is a doctor, you know. And tell me, have you ever seen a gown like this in Manila? They only make them so in Madrid.', next: 'c' },
    c: {
      who: 'player',
      text: 'What do you say?',
      choices: [
        { text: 'Humour her: "Never, Doctora. Madrid must miss you."', effects: { affinity: { victorina: 1 } }, next: 'd' },
        { text: 'Tease her gently: "In Madrid, are the ruffles also worn so very high?"', effects: { affinity: { victorina: -1 } }, next: 'e' },
      ],
    },
    d: { who: 'victorina', face: 'smile', text: 'What a charming young person! You must visit us. We are hardly ever among such good company.', next: null },
    e: { who: 'victorina', face: 'frown', text: 'Hmph! One sees you have never been to Europe.', next: null },
  }),
  k1_tiburcio: dialogue('k1_tiburcio', {
    a: { who: 'narrator', text: 'Don Tiburcio de Espadaña, lame and mild, leans on his wife\'s arm. He stammers, and so says as little as he can.', effects: { bio: 'tiburcio' }, next: 'b' },
    b: { who: 'tiburcio', text: 'G-good evening. A f-fine house. V-very fine.', next: null },
  }),
};
