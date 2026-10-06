// Kabanata I, the argument at the small table and the late arrivals (spec §3.3, §3.7). The
// book's lines are adapted (and shortened) from Rizal's Chapter I in the public-domain Charles
// Derbyshire translation (1912); "Indian" is his word for indio. The player's lines are original.
const dialogue = (id, nodes) => ({ id, start: 'a', nodes });

export const argumentDialogues = {
  k1_argument: dialogue('k1_argument', {
    a: { who: 'damaso', text: 'You\'ll see, when you\'ve been here a few months. It\'s one thing to govern in Madrid and another to live in the Philippines.', effects: { bio: 'damaso' }, next: 'b' },
    b: { who: 'newcomer', text: 'But—', effects: { bio: 'newcomer' }, next: 'c' },
    c: { who: 'damaso', text: 'I, who can look back over twenty-three years of bananas and {g:morisqueta}, know whereof I speak. Don\'t come at me with theories and fine speeches. I know the {g:indio|Indian}.', next: 'd' },
    d: { who: 'damaso', text: 'Twenty years I was curate of San Diego, and I knew every soul in it as if I had been his mother. And when I left, I was escorted by only a few old women. After twenty years!', next: 'e' },
    e: { who: 'newcomer', text: 'But I don\'t see what that has to do with the abolition of the tobacco monopoly.', next: 'f' },
    f: { who: 'damaso', face: 'shock', text: 'What? Is it possible that you don\'t see it, clear as day? The Indian is so indolent!', next: 'g' },
    g: { who: 'newcomer', text: 'A foreign traveller says that with this indolence we excuse our own, and our backwardness, and our colonial system—', next: 'h' },
    h: { who: 'damaso', text: 'Bah, jealousy! Ask Señor Laruja, who also knows this country.', next: 'i' },
    i: { who: 'laruja', text: 'It\'s true. In no part of the world can you find anyone more indolent than the Indian. In no part of the world.', effects: { bio: 'laruja' }, next: 'j' },
    j: { who: 'damaso', text: 'Nor more vicious, nor more ungrateful!', next: 'k' },
    k: { who: 'newcomer', text: 'Gentlemen, I believe we are in the house of an Indian.', next: 'l' },
    l: { who: 'damaso', text: 'Bah! Santiago doesn\'t consider himself an Indian. And besides, he\'s not here.', next: 'm' },
    m: { who: 'narrator', text: 'You were born in San Diego. Every face at the little table turns, for a moment, toward you.', next: 'n' },
    n: {
      who: 'player',
      text: 'What do you do?',
      choices: [
        { text: 'Stand with the lieutenant: "Forgive me, Padre. I am from San Diego. The people you call indolent were working your fields before dawn."', effects: { flag: 'ch1_defended_indios', hinala: 1, affinity: { guevarra: 1 } }, next: 'o' },
        { text: 'Nod along: "Padre Dámaso would know, after twenty years."', effects: { flag: 'ch1_sided_damaso', hinala: -1, affinity: { guevarra: -1 } }, next: 'p' },
        { text: '(Keep quiet.)', next: 'q' },
      ],
    },
    o: { who: 'damaso', face: 'angry', text: 'And who asked you?', next: 'q' },
    p: { who: 'narrator', text: 'Padre Dámaso laughs and slaps the table. The lieutenant looks at you a moment longer than he needs to.', next: 'q' },
    q: { who: 'sibyla', text: 'Did your Reverence say that you had been twenty years in San Diego, and had left it? Wasn\'t your Reverence satisfied with the town?', effects: { bio: 'sibyla' }, next: 'r' },
    r: { who: 'damaso', face: 'frown', text: 'No!', next: 's' },
    s: { who: 'sibyla', text: 'It must be painful to leave a town after twenty years. But our superiors do these things for the good of the Order, and for our own good.', next: 't' },
    t: { who: 'damaso', face: 'angry', text: 'Either Religion is a fact or it is not! That is, either the curates are free or they are not! The country is going to ruin!', next: 'u' },
    u: { who: 'guevarra', text: 'What do you mean?', effects: { bio: 'guevarra' }, next: 'v' },
    v: { who: 'damaso', face: 'angry', text: 'I mean that when a priest throws out of his cemetery the corpse of a heretic, no one, not even the King himself, has any right to interfere! But a little General, a little General Calamity—', next: 'w' },
    w: { who: 'guevarra', face: 'angry', text: 'Padre, his Excellency is the {g:vice_regal_patron|Vice-Regal Patron}! Either you withdraw what you have said, or tomorrow I report it to his Excellency!', next: 'x' },
    x: { who: 'damaso', face: 'angry', text: 'Go ahead, right now! Do you think that because I wear the cloth I\'m afraid? Go, while I can lend you my carriage!', next: 'y' },
    y: { who: 'sibyla', text: 'Gentlemen, we must distinguish in the words of Fray Dámaso those of the man from those of the priest. Those of the priest, per se, can never give offence—', next: 'z' },
    z: { who: 'guevarra', text: 'I understand his motives, Padre Sibyla. While he was away from San Diego, his coadjutor buried the body of an extremely worthy individual. I knew him. I was entertained in his house.', next: 'aa' },
    aa: { who: 'guevarra', text: 'What if he never went to confession? Neither do I! But to say that he took his own life is a lie, a slander. A man with a son he loved, who believed in God and knew his duty, does not do that.', next: 'ab' },
    ab: { who: 'guevarra', text: 'This priest came back, mistreated the poor coadjutor, and had the body dug up and taken out of the cemetery, to be buried I don\'t know where. The dead man had no family there. His only son was in Europe.', next: 'ac' },
    ac: { who: 'guevarra', text: 'His Excellency asked for some punishment, and Padre Dámaso was moved to a better town. That is all there is to it. Now your Reverence can make your distinctions.', next: 'ad' },
    ad: { who: 'narrator', text: 'He walks away from the table. You know only one man of San Diego whose son is in Europe.', next: 'ae' },
    ae: { who: 'damaso', text: 'A gain? What gain is there in moving? And all the things that are lost, the letters, the... everything that is mislaid!', next: null },
  }),

  k1_espadanas: dialogue('k1_espadanas', {
    a: { who: 'narrator', text: 'Little by little the party grows calm again. New guests come in: a lame old Spaniard of mild aspect, on the arm of an elderly Filipina resplendent in frizzes, paint and a European gown.', next: 'b' },
    b: { who: 'narrator', text: 'Doctor De Espadaña and his señora, the Doctora Doña Victorina, take their seats among the company.', effects: { bio: 'victorina' }, next: 'c' },
    c: { who: 'laruja', text: 'Our host? No, he\'s not the man who invented gunpowder.', next: 'd' },
    d: { who: 'victorina', text: 'You too, Señor Laruja! How could the poor man invent gunpowder if, as they say, the Chinese invented it centuries ago?', next: 'e' },
    e: { who: 'damaso', text: 'The Chinese! Are you crazy? A Franciscan, one of my Order, invented it!', next: 'f' },
    f: { who: 'sibyla', text: 'Schwartz, perhaps you mean, señora. And in the fourteenth century.', next: 'g' },
    g: { who: 'victorina', text: 'The fourteenth century? Was that before or after Christ?', next: null },
  }),
};
