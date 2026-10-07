// Two small rooms off the upper floor (Plan 5 spec §3.4): the kusina behind the caída, and
// Capitan Tiago's oratorio in the cuartos wing behind the sala. Both open at the front.

function room(w, d, wallTex, floorTex) {
  return {
    floors: [{ x: 0, z: 0, w, d, y: 0, tex: floorTex }],
    walls: [
      { x: -0.4, z: -0.4, w: w + 0.8, d: 0.4, y: 0, h: 3.2, tex: wallTex },
      { x: -0.4, z: 0, w: 0.4, d, y: 0, h: 3.2, tex: wallTex },
      { x: w, z: 0, w: 0.4, d, y: 0, h: 3.2, tex: wallTex },
    ],
  };
}

const kusinaRoom = room(10, 7, 'adobe', 'tiles');
export const kusina = {
  name: 'Casa de Capitan Tiago',
  detail: 'The kusina',
  offset: [1600, 0],
  camera: 'indoor',
  bounds: { x: 0, z: 0, w: 10, d: 7 },
  ...kusinaRoom,
  props: [
    { type: 'kalan', x: 2.2, z: 0.6, w: 2.6 },
    { type: 'shelf', x: 6, z: 0.2, w: 2.4 },
    { type: 'tinaja', x: 9.1, z: 0.7 },
    { type: 'tinaja', x: 9.4, z: 1.6 },
    { type: 'table', x: 6.5, z: 3.2, w: 2.2, d: 1, cloth: false },
    { type: 'choppingBlock', x: 4.4, z: 3.4 },
    { type: 'firewood', x: 0.9, z: 5.6, w: 1.4, rot: 1 },
    { type: 'bilao', x: 8.6, z: 5.8 },
    { type: 'palayok', x: 3.6, z: 6.2 },
    { type: 'palayok', x: 4.2, z: 6.4 },
    { type: 'sacks', x: 8.8, z: 4 },
    { type: 'wallLantern', x: 4.5, z: 0, y: 2.4 },
    { type: 'botete', x: 7.6, z: 1.2, y: 2.4 },
  ],
  zones: { kusina: { x: 0, z: 0, w: 10, d: 7 } },
  spots: {
    kusina_entry: [5, 6],
    cook_stove: [4, 1.5],
    maid_table: [6.5, 2.2],
    muchacho_fire: [0.7, 1.6],
  },
  extras: [
    { id: 'cook', costume: 'cook', spot: 'cook_stove', dir: 'left', activity: 'stir' },
    { id: 'maid_kusina', costume: 'maid', spot: 'maid_table', dir: 'down', activity: 'chop' },
    { id: 'muchacho_fire', costume: 'muchacho', spot: 'muchacho_fire', dir: 'right', activity: 'fan' },
  ],
};

const oratorioRoom = room(8, 6, 'plaster', 'narra');
export const oratorio = {
  name: 'Casa de Capitan Tiago',
  detail: 'The oratorio',
  offset: [2000, 0],
  camera: 'indoor',
  bounds: { x: 0, z: 0, w: 8, d: 6 },
  ...oratorioRoom,
  props: [
    { type: 'altar', x: 4, z: 0.5, w: 3 },
    { type: 'kneeler', x: 3.3, z: 2.4 },
    { type: 'kneeler', x: 4.7, z: 2.4 },
    { type: 'candelabrum', x: 1.2, z: 0.9 },
    { type: 'candelabrum', x: 6.8, z: 0.9 },
    { type: 'painting', x: 1.6, z: 0.05, y: 1.9, w: 0.8, h: 1, seed: 21 },
    { type: 'painting', x: 6.4, z: 0.05, y: 1.9, w: 0.8, h: 1, seed: 22 },
    { type: 'plant', x: 0.6, z: 3 },
    { type: 'plant', x: 7.4, z: 3 },
    { type: 'rug', x: 4, z: 3.4, w: 3, d: 2.4, color: '#3a2a5a' },
  ],
  zones: { oratorio: { x: 0, z: 0, w: 8, d: 6 } },
  spots: {
    oratorio_entry: [4, 4.9],
    altar_view: [4, 1.6],
  },
};
