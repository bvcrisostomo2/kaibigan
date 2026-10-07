// Kabanata III, "Ang Hapunan" (spec §3.3, §3.7). The book's lines are adapted from Rizal's
// Chapter III in the public-domain Charles Derbyshire translation (1912). The player's lines,
// Key Decision 1 and the moment Tiago is offered a seat are original; Ibarra's own reply to
// Dámaso, from the book, always follows the player's answer.
const dialogue = (id, nodes) => ({ id, start: 'a', nodes });

export const dinnerDialogues = {
  k3_seating: dialogue('k3_seating', {
    a: { who: 'victorina', face: 'angry', text: 'Haven\'t you any eyes?', next: 'b' },
    b: { who: 'guevarra', text: 'Yes, señora, two better than yours. But the fact is, I was admiring your frizzes.', next: 'c' },
    c: { who: 'narrator', text: 'The lieutenant has stepped on the train of her gown. Meanwhile the two friars both start, as if from habit, toward the head of the table.', next: 'd' },
    d: { who: 'damaso', text: 'For you, Fray Sibyla.', next: 'e' },
    e: { who: 'sibyla', text: 'For you, Fray Dámaso. An older friend of the family, confessor of the late lady: age, dignity, authority—', next: 'f' },
    f: { who: 'damaso', face: 'frown', text: 'Not so very old, either! On the other hand, you are the curate of the district.', next: 'g' },
    g: { who: 'sibyla', text: 'Since you command it, I obey.', next: 'h' },
    h: { who: 'damaso', face: 'angry', text: 'I don\'t command it! I don\'t command it!', next: 'i' },
    i: { who: 'sibyla', text: 'Lieutenant, here we are in the world and not in the church. The seat of honour belongs to you.', next: 'j' },
    j: { who: 'narrator', text: 'The lieutenant curtly declines, and Padre Sibyla takes the head of the table. No one has given a thought to the host, who watches the scene with a smile of satisfaction.', next: 'k' },
    k: { who: 'ibarra', text: 'How\'s this, Don Santiago, aren\'t you going to sit down with us?', next: 'l' },
    l: { who: 'narrator', text: 'But every seat is taken. Lucullus is not to sup in the house of Lucullus.', next: 'm' },
    m: {
      who: 'player',
      text: 'What do you do?',
      choices: [
        { text: 'Rise and offer him your chair: "Take mine, Capitan."', effects: { affinity: { tiago: 1 } }, next: 'n' },
        { text: '(Stay seated.)', next: 'o' },
      ],
    },
    n: { who: 'tiago', face: 'smile', text: 'Sit still, don\'t get up! You are very good. But this fiesta is my thanks to the Virgin for our friend\'s safe arrival.', next: 'p' },
    o: { who: 'tiago', text: 'Sit still, don\'t get up! This fiesta is my thanks to the Virgin for your safe arrival, Crisostomo.', next: 'p' },
    p: { who: 'tiago', face: 'smile', text: 'Oy! Bring on the {g:tinola}! I ordered tinola, as you doubtless have not tasted any for so long.', next: 'q' },
    q: { who: 'narrator', text: 'A large steaming tureen is brought in, and the Dominican serves. But Padre Dámaso\'s plate holds a bare neck and a tough wing of chicken, floating in soup among lumps of squash, while the others eat legs and breasts: Ibarra above all.', effects: { note: 'note_tinola' }, next: 'r' },
    r: { who: 'narrator', text: 'The Franciscan mashes a few pieces of squash, barely tastes the soup, drops his spoon noisily and pushes the plate away.', next: null },
  }),

  k3_table_talk: dialogue('k3_table_talk', {
    a: { who: 'laruja', text: 'How long have you been away from the country?', next: 'b' },
    b: { who: 'ibarra', text: 'Almost seven years.', next: 'c' },
    c: { who: 'laruja', text: 'Then you have probably forgotten all about it.', next: 'd' },
    d: { who: 'ibarra', text: 'Quite the contrary. Even if my country seems to have forgotten me, I have always thought of it. It has been a year since I received any news from here, so that I find myself a stranger who does not yet know how or when his father died.', next: 'e' },
    e: { who: 'narrator', text: 'The lieutenant lets out a sudden exclamation. You keep your eyes on your plate. You know more than Ibarra does, and you promised.', next: 'f' },
    f: { who: 'victorina', text: 'And where were you, that you didn\'t telegraph? When we were married we telegraphed to the Peninsula.', next: 'g' },
    g: { who: 'ibarra', text: 'Señora, for the past two years I have been in the north of Europe, in Germany and Russian Poland.', next: 'h' },
    h: { who: 'tiburcio', text: 'I—I knew in S-spain a P-pole from W-warsaw, c-called S-stadtnitzki. P-perhaps you s-saw him?', next: 'i' },
    i: { who: 'ibarra', face: 'smile', text: 'It\'s very likely, but just at this moment I don\'t recall him.', next: 'j' },
    j: { who: 'newcomer', text: 'Which country of Europe pleased you most?', next: 'k' },
    k: { who: 'ibarra', text: 'After Spain, my second fatherland, any country of free Europe.', next: 'l' },
    l: { who: 'laruja', text: 'And what do you consider the most notable thing you have seen? In the life of the people: social, political, religious, as a whole?', next: 'm' },
    m: { who: 'ibarra', text: 'Before visiting a country I tried to learn its history, and afterwards everything seemed natural. The prosperity or misery of each people is in direct proportion to its liberties or its prejudices, and to the sacrifices or the selfishness of its forefathers.', next: 'n' },
    n: { who: 'damaso', face: 'angry', text: 'And haven\'t you observed anything more than that? It wasn\'t worth while to squander your fortune to learn so trifling a thing. Any schoolboy knows that.', next: 'o' },
    o: { who: 'narrator', text: 'The table goes quiet. Everyone looks from the friar to Ibarra, fearing a scene, and Ibarra\'s eyes come to rest on you.', next: 'p' },
    p: {
      who: 'player',
      text: 'Key decision: how do you respond?',
      choices: [
        { text: 'Openly: "With respect, Padre, he crossed half the world to learn it. Some men stay home their whole lives and never do."', effects: { tiwala: 2, hinala: 2, flag: 'ch1_defied_damaso' }, next: 'q' },
        { text: 'With tact: "Even what a schoolboy knows is worth seeing with one\'s own eyes, Padre. Tell us about Germany, Crisostomo."', effects: { tiwala: 1, flag: 'ch1_tactful' }, next: 'r' },
        { text: '(Stay silent and look at your plate.)', effects: { tiwala: -1, flag: 'ch1_silent' }, next: 's' },
      ],
    },
    q: { who: 'damaso', face: 'angry', text: 'Hm! So the young people of San Diego have learned to answer back. I will remember your face.', next: 't' },
    r: { who: 'narrator', text: 'A few guests laugh with relief. Padre Dámaso only grunts.', next: 't' },
    s: { who: 'narrator', text: 'Ibarra looks for you a moment longer, then turns back to the friar alone.', next: 't' },
    t: { who: 'ibarra', text: 'Gentlemen, don\'t be surprised at the familiarity with which our former curate treats me. He treated me so when I was a child, and the years seem to make no difference to his Reverence.', next: 'u' },
    u: { who: 'ibarra', text: 'I appreciate it, too, because it recalls the days when his Reverence visited our home and honoured my father\'s table.', next: 'v' },
    v: { who: 'narrator', text: 'The Dominican glances at the Franciscan, who is trembling visibly. Ibarra rises.', next: 'w' },
    w: { who: 'ibarra', text: 'You will now permit me to retire. I have just arrived, I must leave tomorrow morning, and there is business I must attend to. Gentlemen: all for Spain and the Philippines!', next: null },
  }),

  // After the glasses touch (Plan 5a: the sound plays between the two dialogues).
  k3_exit: { id: 'k3_exit', start: 'x', nodes: {
    x: { who: 'narrator', text: 'He drains his glass, which he had not touched before. The old lieutenant silently does the same.', next: 'y' },
    y: { who: 'tiago', text: 'Don\'t go! María Clara will be here; Isabel has gone to fetch her. And the new curate of your town is coming too.', next: 'z' },
    z: { who: 'ibarra', text: 'I\'ll call tomorrow before I leave. I have a very important visit to make now.', next: 'aa' },
    aa: { who: 'ibarra', if: { flag: 'ch1_defied_damaso' }, text: 'Thank you, my friend. I won\'t forget it.', next: 'ab' },
    ab: { who: 'ibarra', if: { flag: 'ch1_tactful' }, face: 'smile', text: 'Germany will keep for another evening. Thank you.', next: null },
  } },

  k3_after: dialogue('k3_after', {
    a: { who: 'damaso', text: 'Do you see? That comes from pride. They can\'t stand to have the curate correct them. It\'s the evil result of sending young men to Europe. The government ought to prohibit it.', next: 'b' },
    b: { who: 'victorina', text: 'And how about the lieutenant? He didn\'t get the frown off his face all evening. He did well to leave us: so old, and still only a lieutenant!', next: 'c' },
    c: { who: 'narrator', text: 'Ibarra\'s chair stands empty beside yours. Down in the street, someone is walking away from the house.', next: null },
  }),
};
