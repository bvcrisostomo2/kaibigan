// Kabanata I, the opening (spec §3.3). Narration adapted from Rizal's Chapter I in the public-domain
// Charles Derbyshire translation (1912); the player's lines are original.
const dialogue = (id, nodes) => ({ id, start: 'a', nodes });

export const openingDialogues = {
  k1_street: dialogue('k1_street', {
    a: { who: 'narrator', text: 'On the last of October, Don Santiago de los Santos, known to all as Capitan Tiago, gave a dinner. He announced it only that afternoon, and already it was the talk of Binondo.', next: 'b' },
    b: { who: 'narrator', text: 'His house stands on Calle Anloague: a large {g:bahay_na_bato|bahay na bato}, rather low and not quite straight in all its lines, on the arm of the Pasig that some call the Binondo River.', next: 'c' },
    c: { who: 'player', text: "Ibarra's ship came in this afternoon. If he keeps his word, he will be here tonight.", next: 'd' },
    d: { who: 'player', text: 'And Capitan Tiago made me promise: not a word to him about his father. Not tonight.', next: null },
  }),
  k1_staircase: dialogue('k1_staircase', {
    a: { who: 'narrator', text: 'A wide staircase with green newels and carpeted steps climbs from the tiled {g:zaguan|zaguán}, between rows of flower-pots on pedestals of painted Chinese porcelain.', effects: { note: 'note_bahay_na_bato' }, next: null },
  }),
  k1_bridge: dialogue('k1_bridge', {
    a: { who: 'narrator', text: 'In nearly a mile of river, the district has only this one wooden bridge: out of repair on one side for six months, and impassable on the other for the rest of the year.', effects: { note: 'note_binondo' }, next: 'b' },
    b: { who: 'player', text: 'We used to race across it as children. It was broken then, too.', next: null },
  }),
  k1_isabel: dialogue('k1_isabel', {
    a: { who: 'isabel', face: 'smile', text: 'Ay, {title} {name}! Welcome, welcome. Come up, come in. Everyone is in the {g:sala}.', effects: { bio: 'isabel' }, next: 'b' },
    b: { who: 'isabel', text: 'Will you take a cigar? Some {g:buyo}? No? Then go, go and enjoy yourself.', next: null },
  }),
  // After the crash of a plate somewhere in the house (Plan 5a: the sound plays between the two).
  k1_isabel_exit: dialogue('k1_isabel_exit', {
    a: { who: 'narrator', text: 'Somewhere behind her a plate shatters. Tía Isabel hurries away, muttering, "Jesús! Just wait, you rascals!"', next: null },
  }),
  k1_sala_scene: dialogue('k1_sala_scene', {
    a: { who: 'narrator', text: 'In the {g:sala}, among massive mirrors and gleaming chandeliers, the guests are assembled. A grand piano of great price stands on a platform; tonight it has the further virtue of not being played.', next: 'b' },
    b: { who: 'narrator', text: 'The women sit apart, murmuring behind their fans. All the animation comes from one small table, where two priests, two civilians and a soldier sit over wine and English biscuits.', next: 'c' },
    c: { who: 'player', text: 'No Ibarra yet. I will wait for him here.', next: null },
  }),
};
