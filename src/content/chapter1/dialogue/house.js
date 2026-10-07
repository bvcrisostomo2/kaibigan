// One line each for the people at work and the doors that stay shut (Plan 5 spec §3.5, §3.6),
// as chapter-wide interactions: they answer in every beat. All original; the household and the
// street are not in Rizal's text, and nothing here contradicts it.
const line = (id, who, text) => ({ id, start: 'a', nodes: { a: { who, text, next: null } } });

export const houseDialogues = {
  house_cook: line('house_cook', 'narrator', 'The cook does not look up from the stove. "Ay, {title}, a kitchen is no place for a guest! Go, before the tinola boils over and the friars blame me."'),
  house_maid_kusina: line('house_maid_kusina', 'narrator', 'The maid chops garlic as if it had wronged her. "Señora Isabel says every plate must shine like the master\'s portrait."'),
  house_maid_sala: line('house_maid_sala', 'narrator', 'The maid flicks her duster over a vase and smiles shyly. "Excuse me, {title}. Not a speck of dust tonight, Señora Isabel says."'),
  house_muchacho: line('house_muchacho', 'narrator', 'The muchacho grins and keeps going. "More rice, more sugar, more everything, {title}. Capitan Tiago never gives a small dinner!"'),
  house_coachman: line('house_coachman', 'narrator', 'The coachman polishes the calesa\'s brass. "It shines for the guests, {title}, even if no one rides in it tonight."'),
  street_vendor: line('street_vendor', 'narrator', 'The vendor waves her fan over her baskets. "Suman, puto, bibingka! For the Capitan\'s guests, {title}, or for the ones he didn\'t invite!"'),
  street_cochero: line('street_cochero', 'narrator', 'The cochero dozes on his seat with his hat tipped over his eyes, waiting for a fare who is in no hurry to leave.'),
  street_sweeper: line('street_sweeper', 'narrator', 'The sweeper leans on his broom. "The whole of Binondo walks past this door tonight, {title}. Somebody has to sweep up after it."'),
  river_washerwoman: line('river_washerwoman', 'narrator', 'The washerwoman wrings out a shirt. "Washing at this hour? The Capitan\'s table linen, for tomorrow. The creek takes the stains, and keeps the secrets."'),
  river_fisherman: line('river_fisherman', 'narrator', 'The old fisherman doesn\'t take his eyes off the water. "Nothing biting. Too many lanterns on the creek tonight."'),
  party_orchestra: line('party_orchestra', 'narrator', 'The orchestra plays a kundiman, slow and sweet, under the noise of the dinner. Nobody seems to be listening, and the musicians don\'t seem to mind.'),
  locked_tiago_room: line('locked_tiago_room', 'narrator', 'Capitan Tiago\'s room. The door is shut.'),
  locked_clara_room: line('locked_clara_room', 'narrator', 'María Clara\'s room. The door is shut.'),
  locked_pawnshop: line('locked_pawnshop', 'narrator', 'A pawnshop, shuttered for the night.'),
  locked_neighbour: line('locked_neighbour', 'narrator', 'The neighbours\' door is barred. Half the street is at Capitan Tiago\'s tonight; the other half wishes it were.'),
  oratorio_altar: line('oratorio_altar', 'narrator', 'Saints crowd the altar in silk and gold, a candle burning before each. Capitan Tiago keeps on good terms with heaven, as with everyone else.'),
};

// Who says what, in every beat (chapter.interactions).
export const houseInteractions = {
  cook: 'house_cook',
  maid_kusina: 'house_maid_kusina',
  maid_sala: 'house_maid_sala',
  muchacho_sacks: 'house_muchacho',
  muchacho_serving: 'house_muchacho',
  muchacho_fire: 'house_muchacho',
  coachman: 'house_coachman',
  vendor: 'street_vendor',
  cochero: 'street_cochero',
  sweeper: 'street_sweeper',
  washerwoman: 'river_washerwoman',
  fisherman: 'river_fisherman',
  violinist: 'party_orchestra',
  tiago_room: 'locked_tiago_room',
  clara_room: 'locked_clara_room',
  pawnshop: 'locked_pawnshop',
  neighbour_house: 'locked_neighbour',
  altar: 'oratorio_altar',
};
