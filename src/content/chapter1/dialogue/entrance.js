// Kabanata II, "Si Crisostomo Ibarra" (spec §3.3). The book's lines are condensed from Rizal's
// Chapter II in the public-domain Charles Derbyshire translation (1912), shortened and given period
// flavour (Plan 5 spec §4.9). The added beat (Ibarra sees the player first) and the player's lines
// are original and keep Capitan Tiago's promise.
const dialogue = (id, nodes) => ({ id, start: 'a', nodes });

export const entranceDialogues = {
  k2_entrance: dialogue('k2_entrance', {
    a: { who: 'narrator', text: 'The lieutenant steps forward. Fray Dámaso goes still as stone. Capitan Tiago comes in, leading a young man in deep mourning.', next: 'b' },
    b: { who: 'tiago', face: 'happy', move: 'bow', to: null, text: 'Good evening, señores! Padre! May I present Don Crisostomo Ibarra, son of my late friend, just home from Europe!', effects: { bio: 'tiago' }, next: 'c' },
    c: { who: 'narrator', text: "His name runs round the room. But the young man's eyes find yours first.", next: 'd' },
    d: { who: 'ibarra', face: 'happy', to: 'player', text: "{name}! Of all the faces in Manila, yours first. Seven years, and you haven't changed.", effects: { bio: 'ibarra' }, next: 'e' },
    e: { who: 'player', face: 'happy', text: 'Crisostomo. Welcome home, {g:kaibigan}.', next: 'f' },
    f: { who: 'ibarra', face: 'thoughtful', text: "Later you must tell me everything. Father's letters stopped a year ago, and no one gives me a straight answer. You will.", next: 'g' },
    g: { who: 'player', face: 'sad', text: "Later. They're all waiting to meet you.", next: 'h' },
    h: { who: 'narrator', text: "Capitan Tiago's warning sticks in your throat. Ibarra squeezes your hand and turns to the room.", next: 'i' },
    i: { who: 'ibarra', face: 'happy', to: 'damaso', text: "But this is the {g:cura} of my hometown! Padre Dámaso, my father's dear friend!", next: 'j' },
    j: { who: 'narrator', text: "Every eye turns to the Franciscan. He doesn't move.", next: 'k' },
    k: { who: 'ibarra', face: 'embarrassed', to: 'damaso', text: "Forgive me. Perhaps I'm mistaken.", next: 'l' },
    l: { who: 'damaso', face: 'annoyed', text: "You're not mistaken. But your father was never a friend of mine.", next: 'm' },
    m: { who: 'guevarra', face: 'thoughtful', to: 'ibarra', text: 'Joven, are you the son of Don Rafael Ibarra?', next: 'n' },
    n: { who: 'guevarra', face: 'sad', to: 'ibarra', text: '¡Bienvenido! Welcome home, and may you be happier here than your father was. He was one of the most honourable men in these islands.', next: 'o' },
    o: { who: 'ibarra', face: 'sad', text: 'Señor, your words ease my doubts about how he died. I, his son, still do not know.', next: 'p' },
    p: { who: 'narrator', text: "The old soldier's eyes fill. He turns away quickly, leaving Ibarra alone in the middle of the room.", next: 'q' },
    q: { who: 'narrator', text: "He bows to the ladies along the wall. They don't dare answer.", next: 'r' },
    r: { who: 'ibarra', move: 'bow', to: null, text: 'Señores, in Germany a stranger with no one to present him presents himself. My name is Juan Crisostomo Ibarra y Magsalin.', next: null },
  }),
  k2_dinner_call: dialogue('k2_dinner_call', {
    a: { who: 'servant', face: 'happy', to: null, text: '¡La cena! Dinner is served!', next: 'b' },
    b: { who: 'narrator', text: 'A waiter from the café La Campana. The guests drift toward the table in the {g:caida|caída}, the Filipinas most hesitant of all.', next: null },
  }),
};
