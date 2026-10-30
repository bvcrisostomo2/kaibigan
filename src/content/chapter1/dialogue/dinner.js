// Kabanata III, "Ang Hapunan" (spec §3.3, §3.7). The book's lines are condensed from Rizal's
// Chapter III in the public-domain Charles Derbyshire translation (1912), shortened and given
// period flavour (Plan 5 spec §4.9). The player's lines, Key Decision 1 and the moment Tiago is
// offered a seat are original; Ibarra's own reply to Dámaso, from the book, always follows the
// player's answer.
const dialogue = (id, nodes) => ({ id, start: 'a', nodes });

export const dinnerDialogues = {
  k3_seating: dialogue('k3_seating', {
    a: { who: 'victorina', face: 'angry', to: 'guevarra', text: '¿No tiene ojos? Haven\'t you any eyes?', next: 'b' },
    b: { who: 'guevarra', face: 'content', text: 'Sí, señora, two better than yours. I was only admiring your frizzes.', next: 'c' },
    c: { who: 'narrator', text: 'He has stepped on her train. Meanwhile both friars start, out of habit, for the head of the table.', next: 'd' },
    d: { who: 'damaso', move: 'bow', to: 'sibyla', text: 'For you, Fray Sibyla.', next: 'e' },
    e: { who: 'sibyla', move: 'bow', text: "For you, Fray Dámaso. An older friend of the family, the late señora's confessor: age, dignity, authority—", next: 'f' },
    f: { who: 'damaso', face: 'annoyed', text: "¡Hombre! I'm not so old. You are the {g:cura} here.", next: 'g' },
    g: { who: 'sibyla', face: 'content', text: 'Since you command it, I obey.', next: 'h' },
    h: { who: 'damaso', face: 'angry', text: "¡No, no! I don't command it! I don't command it!", next: 'i' },
    i: { who: 'sibyla', to: 'guevarra', text: 'Teniente, here we are in the world, not the church. The seat of honour is yours.', next: 'j' },
    j: { who: 'narrator', text: 'The lieutenant curtly declines, and Padre Sibyla takes the head of the table. No one gives a thought to the host, who watches, smiling.', next: 'k' },
    k: { who: 'ibarra', face: 'thoughtful', to: 'tiago', text: "But Don Santiago, aren't you sitting down with us?", next: 'l' },
    l: { who: 'narrator', text: 'Every seat is taken. Lucullus will not dine in the house of Lucullus.', next: 'm' },
    m: {
      who: 'player',
      text: 'What do you do?',
      choices: [
        { text: 'Rise and offer him your chair: "Take mine, Capitan."', effects: { affinity: { tiago: 1 } }, next: 'n' },
        { text: '(Stay seated.)', next: 'o' },
      ],
    },
    n: { who: 'tiago', face: 'happy', to: 'player', text: "Sit, sit, don't get up! You're very good. But this fiesta is my thanks to the Virgin for our friend's safe return.", next: 'p' },
    o: { who: 'tiago', face: 'happy', to: 'ibarra', text: 'Sit, sit! This fiesta is my thanks to the Virgin for your safe return, Crisostomo.', next: 'p' },
    p: { who: 'tiago', face: 'happy', to: 'ibarra', text: 'Oy, bring the {g:tinola}! Seven years without it, ¿verdad, hijo?', next: 'q' },
    q: { who: 'narrator', text: "A steaming tureen arrives and the Dominican serves. Padre Dámaso's plate: a bare neck and a tough wing among lumps of squash. The others get legs and breasts, Ibarra above all.", effects: { note: 'note_tinola' }, next: 'r' },
    r: { who: 'narrator', text: 'The Franciscan mashes some squash, barely tastes the soup, drops his spoon with a clatter and pushes the plate away.', next: null },
  }),

  k3_table_talk: dialogue('k3_table_talk', {
    a: { who: 'laruja', to: 'ibarra', text: 'How long were you away from the country, Señor Ibarra?', next: 'b' },
    b: { who: 'ibarra', text: 'Almost seven years.', next: 'c' },
    c: { who: 'laruja', face: 'content', text: "Then you've forgotten it all, ¿no?", next: 'd' },
    d: { who: 'ibarra', face: 'sad', text: "Not at all. My country may forget me; I never forgot it. But a year without news, and I'm a stranger who doesn't know how or when his father died.", next: 'e' },
    e: { who: 'narrator', text: 'The lieutenant starts. You keep your eyes on your plate. You know more than Ibarra does, and you promised.', next: 'f' },
    f: { who: 'victorina', face: 'annoyed', move: 'fan', to: 'ibarra', text: "And where were you, that you didn't telegraph? When we married, we telegraphed the Peninsula!", next: 'g' },
    g: { who: 'ibarra', text: 'Señora, these two years I have been in the north of Europe: in Germany, and in Russian Poland.', next: 'h' },
    h: { who: 'tiburcio', face: 'embarrassed', to: 'ibarra', text: 'I—I knew a P-pole in S-spain, from W-warsaw. S-stadtnitzki. P-perhaps you s-saw him?', next: 'i' },
    i: { who: 'ibarra', face: 'happy', text: "Very likely, but I can't place him just now.", next: 'j' },
    j: { who: 'newcomer', face: 'thoughtful', to: 'ibarra', text: 'Dígame, which country of Europe pleased you most?', next: 'k' },
    k: { who: 'ibarra', face: 'content', text: 'After Spain, my second fatherland? Any country of free Europe.', next: 'l' },
    l: { who: 'laruja', face: 'thoughtful', to: 'ibarra', text: 'And the most notable thing you saw? In the life of the peoples, I mean: social, political, religious.', next: 'm' },
    m: { who: 'ibarra', face: 'thoughtful', text: 'Before visiting a country I studied its history, and then it all made sense. A people prospers or suffers in proportion to its liberties or its prejudices, and to what its forefathers gave, or kept for themselves.', next: 'n' },
    n: { who: 'damaso', face: 'angry', move: 'point', text: '¿Y nada más? You squandered a fortune to learn that? Any schoolboy knows it!', next: 'o' },
    o: { who: 'narrator', text: "The table goes silent. Everyone looks from the friar to Ibarra, afraid of a scene. Ibarra's eyes come to rest on you.", next: 'p' },
    p: {
      who: 'player',
      text: 'Key decision: how do you respond?',
      choices: [
        { text: 'Openly: "With respect, Padre, he crossed half the world to learn it. Some men stay home all their lives and never do."', effects: { tiwala: 2, hinala: 2, flag: 'ch1_defied_damaso' }, next: 'q' },
        { text: 'With tact: "Even what a schoolboy knows is worth seeing with one\'s own eyes, Padre. Tell us about Germany, Crisostomo."', effects: { tiwala: 1, flag: 'ch1_tactful' }, next: 'r' },
        { text: '(Stay silent and look at your plate.)', effects: { tiwala: -1, flag: 'ch1_silent' }, next: 's' },
      ],
    },
    q: { who: 'damaso', face: 'angry', to: 'player', text: '¡Hm! So the youth of San Diego talk back now. I will remember your face.', next: 't' },
    r: { who: 'narrator', text: 'A few guests laugh with relief. Padre Dámaso only grunts.', next: 't' },
    s: { who: 'narrator', text: 'Ibarra looks for you a moment longer, then faces the friar alone.', next: 't' },
    t: { who: 'ibarra', face: 'content', to: null, text: "Señores, don't be surprised at our old cura's familiarity. He treated me so as a child, and the years change nothing for his Reverence.", next: 'u' },
    u: { who: 'ibarra', to: 'damaso', text: "I'm grateful for it, too: it recalls the days his Reverence visited our home and honoured my father's table.", next: 'v' },
    v: { who: 'narrator', text: 'The Dominican glances at the Franciscan, who is visibly trembling. Ibarra rises.', next: 'w' },
    w: { who: 'ibarra', move: 'bow', to: null, text: 'Now, if you will excuse me. I have only just arrived, I leave tomorrow, and there is business to see to. Señores: to Spain and the Philippines!', next: null },
  }),

  // After the glasses touch (Plan 5a: the sound plays between the two dialogues).
  k3_exit: { id: 'k3_exit', start: 'x', nodes: {
    x: { who: 'narrator', text: "He drains the glass he hadn't touched. The old lieutenant silently does the same.", next: 'y' },
    y: { who: 'tiago', face: 'shocked', to: 'ibarra', text: "Don't go! María Clara is coming, Isabel went to fetch her. And the new cura of your town, too!", next: 'z' },
    z: { who: 'ibarra', text: "I'll call tomorrow before I go. Tonight I have a very important visit to make.", next: 'aa' },
    aa: { who: 'ibarra', face: 'happy', to: 'player', if: { flag: 'ch1_defied_damaso' }, text: "{g:salamat|Salamat}, {g:kaibigan}. I won't forget it.", next: 'ab' },
    ab: { who: 'ibarra', face: 'happy', to: 'player', if: { flag: 'ch1_tactful' }, text: 'Germany will keep for another night. Thank you, {g:kaibigan}.', next: null },
  } },

  k3_after: dialogue('k3_after', {
    a: { who: 'damaso', face: 'angry', to: null, text: "¿Ven? That's pride. They can't bear the cura correcting them. That's what comes of sending young men to Europe. The government should forbid it.", next: 'b' },
    b: { who: 'victorina', face: 'annoyed', move: 'fan', to: null, text: 'And the lieutenant! Frowning all evening. Good riddance: so old, and still only a teniente!', next: 'c' },
    c: { who: 'narrator', text: "Ibarra's chair stands empty beside yours. Down in the street, someone walks away from the house.", next: null },
  }),
};
