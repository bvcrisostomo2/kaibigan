// Kabanata I, the opening (spec §3.3). Narration condensed from Rizal's Chapter I in the
// public-domain Charles Derbyshire translation (1912), shortened and given period flavour (Plan 5
// spec §4.9); the player's lines are original.
const dialogue = (id, nodes) => ({ id, start: 'a', nodes });

export const openingDialogues = {
  k1_street: dialogue('k1_street', {
    a: { who: 'narrator', text: 'The last day of October. Capitan Tiago is giving a dinner, announced only this afternoon, and already all Binondo is talking.', next: 'b' },
    b: { who: 'narrator', text: 'His house on Calle Anloague is a great {g:bahay_na_bato|bahay na bato}, low and a little crooked, on the arm of the Pasig they call the Binondo River.', next: 'c' },
    c: { who: 'player', face: 'thoughtful', text: "Ibarra's ship came in today. If he keeps his word, he'll be here tonight.", next: 'd' },
    d: { who: 'player', face: 'sad', text: 'And I promised Capitan Tiago: not a word about his father. Not tonight.', next: null },
  }),
  k1_staircase: dialogue('k1_staircase', {
    a: { who: 'narrator', text: 'A wide staircase with green newels climbs from the tiled {g:zaguan|zaguán}, past flowerpots on painted Chinese porcelain.', effects: { note: 'note_bahay_na_bato' }, next: null },
  }),
  k1_bridge: dialogue('k1_bridge', {
    a: { who: 'narrator', text: "The district's one wooden bridge: broken on one side for half the year, impassable on the other for the rest.", effects: { note: 'note_binondo' }, next: 'b' },
    b: { who: 'player', face: 'content', text: 'We raced across it as children. It was broken then, too.', next: null },
  }),
  k1_isabel: dialogue('k1_isabel', {
    a: { who: 'isabel', face: 'happy', move: 'bow', to: 'player', text: "Ay, {title} {name}! Welcome, welcome! Go on up, everyone's in the {g:sala}.", effects: { bio: 'isabel' }, next: 'b' },
    b: { who: 'isabel', face: 'content', text: 'A cigar? Some {g:buyo}? No? Then go, {g:anak}, enjoy yourself.', next: null },
  }),
  // After the crash of a plate somewhere in the house (Plan 5a: the sound plays between the two).
  k1_isabel_exit: dialogue('k1_isabel_exit', {
    a: { who: 'narrator', text: 'A plate shatters somewhere. Tía Isabel hurries off: "¡Jesús! Just wait, you rascals!"', next: null },
  }),
  k1_sala_scene: dialogue('k1_sala_scene', {
    a: { who: 'narrator', text: 'In the {g:sala}, under mirrors and chandeliers, the guests have gathered. The grand piano, for once, is silent.', next: 'b' },
    b: { who: 'narrator', text: 'The women whisper behind their fans. All the noise comes from one small table: two priests, two civilians and a soldier, over wine and biscuits.', next: 'c' },
    c: { who: 'player', face: 'thoughtful', text: "No Ibarra yet. I'll wait for him here.", next: null },
  }),
};
