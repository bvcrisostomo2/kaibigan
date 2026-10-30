// Kabanata I, the argument at the small table and the late arrivals (spec §3.3, §3.7). The
// book's lines are condensed from Rizal's Chapter I in the public-domain Charles Derbyshire
// translation (1912), shortened and given period flavour (Plan 5 spec §4.9); the Spaniards' lines
// carry more Spanish than the Filipinos'. Derbyshire's "Indian" is indio. The player's lines are
// original.
const dialogue = (id, nodes) => ({ id, start: 'a', nodes });

export const argumentDialogues = {
  k1_argument: dialogue('k1_argument', {
    a: { who: 'damaso', to: 'newcomer', text: 'Wait a few months, joven. Governing from Madrid is one thing; living in the Philippines is another.', effects: { bio: 'damaso' }, next: 'b' },
    b: { who: 'newcomer', face: 'thoughtful', text: 'But—', effects: { bio: 'newcomer' }, next: 'c' },
    c: { who: 'damaso', face: 'annoyed', text: 'Twenty-three years of bananas and {g:morisqueta}, hombre! Spare me your theories. I know the {g:indio}.', next: 'd' },
    d: { who: 'damaso', face: 'sad', text: 'Twenty years {g:cura} of San Diego. I knew every soul like a mother. And when I left? A few old women saw me off. ¡Veinte años!', next: 'e' },
    e: { who: 'newcomer', face: 'thoughtful', text: 'But what has that to do with abolishing the tobacco monopoly?', next: 'f' },
    f: { who: 'damaso', face: 'shocked', text: "¿Qué? You can't see it? ¡Clarísimo! The indio is lazy!", next: 'g' },
    g: { who: 'newcomer', text: 'One traveller says that "indolence" excuses our own, and our backwardness, and our colonial system—', next: 'h' },
    h: { who: 'damaso', face: 'annoyed', move: 'point', text: '¡Bah! Envy! Ask Señor Laruja. He knows this country too.', next: 'i' },
    i: { who: 'laruja', to: 'newcomer', text: 'Es verdad. Nowhere in the world will you find anyone lazier than the indio. Nowhere.', effects: { bio: 'laruja' }, next: 'j' },
    j: { who: 'damaso', face: 'angry', to: 'newcomer', text: 'Nor more vicious! Nor more ungrateful!', next: 'k' },
    k: { who: 'newcomer', face: 'embarrassed', to: null, text: 'Señores, I believe we are in the house of an indio.', next: 'l' },
    l: { who: 'damaso', text: "¡Bah! Santiago doesn't think himself an indio. And anyway, he's not here.", next: 'm' },
    m: { who: 'narrator', text: 'You were born in San Diego. For a moment, every face at the table turns to you.', next: 'n' },
    n: {
      who: 'player',
      text: 'What do you do?',
      choices: [
        { text: 'Stand with the lieutenant: "Perdón, Padre, I\'m from San Diego. The people you call lazy were in your fields before dawn."', effects: { flag: 'ch1_defended_indios', hinala: 1, affinity: { guevarra: 1 } }, next: 'o' },
        { text: 'Nod along: "Padre Dámaso would know, after twenty years."', effects: { flag: 'ch1_sided_damaso', hinala: -1, affinity: { guevarra: -1 } }, next: 'p' },
        { text: '(Keep quiet.)', next: 'q' },
      ],
    },
    o: { who: 'damaso', face: 'angry', text: '¿Y quién te preguntó? Who asked you?', next: 'q' },
    p: { who: 'narrator', text: "Padre Dámaso laughs and slaps the table. The lieutenant's eyes stay on you a moment too long.", next: 'q' },
    q: { who: 'sibyla', face: 'thoughtful', to: 'damaso', text: "Did your Reverence say you left San Diego after twenty years? Weren't you happy with the town?", effects: { bio: 'sibyla' }, next: 'r' },
    r: { who: 'damaso', face: 'annoyed', text: '¡No!', next: 's' },
    s: { who: 'sibyla', face: 'content', text: 'It must hurt, leaving a town after twenty years. But our superiors know best, for the Order and for us.', next: 't' },
    t: { who: 'damaso', face: 'angry', text: "Either Religion is a fact or it isn't! Either the curas are free or they're not! The country is going to ruin!", next: 'u' },
    u: { who: 'guevarra', face: 'thoughtful', text: '¿Qué quiere decir? What do you mean?', effects: { bio: 'guevarra' }, next: 'v' },
    v: { who: 'damaso', face: 'angry', text: "I mean that when a priest throws a heretic's corpse out of his cemetery, no one, not even the King, may interfere! But a little General, a General Calamidad—", next: 'w' },
    w: { who: 'guevarra', face: 'angry', move: 'point', text: 'Padre! His Excellency is the {g:vice_regal_patron|Vice-Regal Patron}! Take that back, or tomorrow I report it to him!', next: 'x' },
    x: { who: 'damaso', face: 'angry', move: 'point', text: "Go, ¡ahora mismo! You think the cloth makes me afraid? Go! I'll lend you my carriage!", next: 'y' },
    y: { who: 'sibyla', to: null, text: 'Señores, distinguish Fray Dámaso the man from Fray Dámaso the priest. The priest, per se, can never give offence—', next: 'z' },
    z: { who: 'guevarra', text: 'I know his motives, Padre Sibyla. While he was away, his coadjutor buried a most worthy man. I knew him. I ate at his table.', next: 'aa' },
    aa: { who: 'guevarra', face: 'angry', text: 'He never went to confession? Neither do I! But to say he took his own life is a lie. A man who loved his son, who believed in God, does not do that.', next: 'ab' },
    ab: { who: 'guevarra', face: 'sad', text: 'This priest came back, punished the coadjutor, and had the body dug up and thrown out of the cemetery. The dead man had no family there. His only son was in Europe.', next: 'ac' },
    ac: { who: 'guevarra', face: 'annoyed', to: 'sibyla', text: 'His Excellency asked for punishment, and Padre Dámaso got a better parish. Eso es todo. Now make your distinctions, Padre.', next: 'ad' },
    ad: { who: 'narrator', text: 'He leaves the table. You know only one man of San Diego whose son is in Europe.', next: 'ae' },
    ae: { who: 'damaso', face: 'embarrassed', to: null, text: 'A better parish? What is gained by moving? And everything lost: the letters, the... everything mislaid!', next: null },
  }),

  k1_espadanas: dialogue('k1_espadanas', {
    a: { who: 'narrator', text: 'Slowly the room calms. New guests arrive: a lame, mild old Spaniard on the arm of an older Filipina all frizzes, paint and European silk.', next: 'b' },
    b: { who: 'narrator', text: 'Doctor De Espadaña and his señora, the Doctora Doña Victorina, join the company.', effects: { bio: 'victorina' }, next: 'c' },
    c: { who: 'laruja', face: 'happy', to: null, text: "Our host? He's no inventor of gunpowder, ¿eh?", next: 'd' },
    d: { who: 'victorina', face: 'annoyed', move: 'fan', text: '¡Usted también, Señor Laruja! How could the poor man invent gunpowder, if the Chinese did it centuries ago?', next: 'e' },
    e: { who: 'damaso', face: 'shocked', to: 'victorina', text: '¿Los chinos? Are you mad? A Franciscan invented it, one of my Order!', next: 'f' },
    f: { who: 'sibyla', face: 'content', to: 'victorina', text: 'Schwartz, perhaps, señora. In the fourteenth century.', next: 'g' },
    g: { who: 'victorina', face: 'thoughtful', move: 'fan', text: 'The fourteenth century? Was that before Christ, or after?', next: null },
  }),
};
