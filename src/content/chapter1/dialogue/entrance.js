// Kabanata II, "Si Crisostomo Ibarra" (spec §3.3). The book's lines are adapted from Rizal's
// Chapter II in the public-domain Charles Derbyshire translation (1912). The added beat (Ibarra
// sees the player first) and the player's lines are original and keep Capitan Tiago's promise.
const dialogue = (id, nodes) => ({ id, start: 'a', nodes });

export const entranceDialogues = {
  k2_entrance: dialogue('k2_entrance', {
    a: { who: 'narrator', text: 'The lieutenant starts from his thoughts and takes two steps forward. Fray Dámaso looks as if turned to stone. Capitan Tiago has come in, leading by the hand a young man dressed in deep mourning.', next: 'b' },
    b: { who: 'tiago', text: 'Good evening, gentlemen! Good evening, Padre! I have the honour of presenting Don Crisostomo Ibarra, the son of my late friend. He has just arrived from Europe, and I went to meet him.', effects: { bio: 'tiago' }, next: 'c' },
    c: { who: 'narrator', text: 'At the name, exclamations go round the room. But before he can greet anyone, the young man\'s eyes find yours.', next: 'd' },
    d: { who: 'ibarra', face: 'smile', text: '{name}! Of every face in Manila, yours first. Seven years, and you haven\'t changed at all.', effects: { bio: 'ibarra' }, next: 'e' },
    e: { who: 'player', text: 'Crisostomo. Welcome home.', next: 'f' },
    f: { who: 'ibarra', text: 'Later you must tell me everything. My father\'s letters stopped a year ago, and nobody writes me a straight word. You will, I know.', next: 'g' },
    g: { who: 'player', text: 'Later. Tonight, they are all waiting to meet you.', next: 'h' },
    h: { who: 'narrator', text: 'Capitan Tiago\'s warning sits in your throat. Ibarra squeezes your hand and turns to the room.', next: 'i' },
    i: { who: 'ibarra', face: 'smile', text: 'What! The curate of my native town! Padre Dámaso, my father\'s intimate friend!', next: 'j' },
    j: { who: 'narrator', text: 'Every look in the room turns to the Franciscan, who does not move.', next: 'k' },
    k: { who: 'ibarra', text: 'Pardon me. Perhaps I am mistaken.', next: 'l' },
    l: { who: 'damaso', face: 'frown', text: 'You are not mistaken. But your father was never an intimate friend of mine.', next: 'm' },
    m: { who: 'guevarra', text: 'Young man, are you the son of Don Rafael Ibarra?', next: 'n' },
    n: { who: 'guevarra', text: 'Welcome back to your country! And may you be happier in it than your father was. I knew him well: he was one of the worthiest and most honourable men in the Philippines.', next: 'o' },
    o: { who: 'ibarra', text: 'Sir, the praise you give my father removes my doubts about the manner of his death, of which I, his son, am still ignorant.', next: 'p' },
    p: { who: 'narrator', text: 'The old soldier\'s eyes fill with tears. He turns away quickly and withdraws, and Ibarra is left alone in the middle of the room.', next: 'q' },
    q: { who: 'narrator', text: 'He bows to the ladies along the wall, who do not dare to answer. Then he turns to the men.', next: 'r' },
    r: { who: 'ibarra', text: 'Gentlemen, in Germany, when a stranger finds himself with no one to introduce him, he gives his name himself. Allow me. My name is Juan Crisostomo Ibarra y Magsalin.', next: null },
  }),
  k2_dinner_call: dialogue('k2_dinner_call', {
    a: { who: 'servant', text: 'Dinner is served!', next: 'b' },
    b: { who: 'narrator', text: 'A waiter from the café La Campana announces it, and the guests file out toward the table in the {g:caida|caída}: the women, especially the Filipinas, with great hesitation.', next: null },
  }),
};
