// The upper floor (Plan 5 spec §3.4): the sala (left) and the caída (middle and right) side by
// side, open to the camera; the cuartos wing behind the sala under its own roof; the wooden arches
// at the back of the caída opening onto the azotea over the creek; the kusina behind the caída's
// right end; the stairs coming up at the right. Rizal's caída "tonight serves as the dining-room
// and at the same time affords a place for the orchestra".
const D = 10; // floor depth (z 0 = the back walls, z 10 = the open front)
const H = 3.2; // wall height
// The stairs down to the zaguán: the floor at z 4 (y 0) down to z 9 (y -2), the door at the foot.
const STAIR = { x: 27.4, z: 4, w: 2.2, d: 5, y0: -2, y1: 0, dir: 'n', tex: 'narra' };

// Chairs round the long table (centre x 19.5, z 5): five along the north side facing down the
// table toward the camera, three along the south side, one at the head (west).
const NORTH = [15, 17.2, 19.4, 21.6, 23.8];
const SOUTH = [15, 17.2, 19.4];

export const upper = {
  name: 'Casa de Capitan Tiago',
  detail: 'The upper floor · Calle Anloague, Binondo',
  offset: [1200, 0],
  camera: 'indoor',
  bounds: { x: 0, z: -4, w: 32, d: 14 },
  floors: [
    { x: 0, z: 0, w: 12, d: D, y: 0, tex: 'narra' }, // the sala
    // the caída, split round the stair's footprint
    { x: 12, z: 0, w: STAIR.x - 12, d: D, y: 0, tex: 'narra' },
    { x: STAIR.x, z: 0, w: STAIR.w, d: STAIR.z, y: 0, tex: 'narra' },
    { x: STAIR.x + STAIR.w, z: 0, w: 32 - STAIR.x - STAIR.w, d: D, y: 0, tex: 'narra' },
    { x: STAIR.x, z: STAIR.z + STAIR.d, w: STAIR.w, d: D - STAIR.z - STAIR.d, y: -2, tex: 'adobe' }, // the stair's foot
    { x: 12, z: -4, w: 14, d: 4, y: 0, tex: 'tiles' }, // the azotea
  ],
  stairs: [STAIR],
  walls: [
    // the sala's back wall (the cuartos wing behind it) and the wing itself, under its roof
    { x: -0.4, z: -0.4, w: 12.4, d: 0.4, y: 0, h: H, tex: 'plaster' },
    { x: -0.4, z: -4.4, w: 12.4, d: 4, y: 0, h: H, tex: 'plaster', collide: false },
    // the kusina behind the caída's right end
    { x: 26, z: -0.4, w: 6.4, d: 0.4, y: 0, h: H, tex: 'plaster' },
    { x: 26, z: -4.4, w: 6.4, d: 4, y: 0, h: H, tex: 'plaster', collide: false },
    // the arches' posts (the arches prop draws them; these make them solid)
    ...[12, 14.8, 17.6, 20.4, 23.2, 26].map((x) => ({ x: x - 0.11, z: -0.11, w: 0.22, d: 0.22, y: 0, h: 2.8, tex: 'wood' })),
    // between the sala and the caída: a wall seen edge-on, with a wide doorway (z 2.4–7.6)
    { x: 11.9, z: 0, w: 0.25, d: 2.4, y: 0, h: H, tex: 'plaster' },
    { x: 11.9, z: 7.6, w: 0.25, d: 2.4, y: 0, h: H, tex: 'plaster' },
    // the outer side walls
    { x: -0.4, z: 0, w: 0.4, d: D, y: 0, h: H, tex: 'plaster' },
    { x: 32, z: -4.4, w: 0.4, d: D + 4.4, y: 0, h: H, tex: 'plaster' },
    { x: 11.6, z: -4.4, w: 0.4, d: 4, y: 0, h: 1, tex: 'adobe' }, // the azotea's west parapet
    { x: STAIR.x - 0.15, z: STAIR.z, w: 0.15, d: STAIR.d, y: -2, h: 3, tex: 'wood' }, // the stairwell's rail
  ],
  roofs: [
    { x: -0.6, z: -4.6, w: 12.8, d: 4.4, y: H, rise: 1.4, tex: 'roof', axis: 'x' },
    { x: 25.8, z: -4.6, w: 6.8, d: 4.4, y: H, rise: 1.4, tex: 'roof', axis: 'x' },
  ],
  // The creek beyond the azotea, under the whole house (it runs behind every house on the street).
  water: [{ x: -20, z: -22, w: 74, d: 17.6, y: -3 }],
  props: [
    // ---- the sala ----
    { type: 'dais', x: 2.4, z: 1.6, w: 3, d: 2 },
    { type: 'piano', x: 2.4, z: 1.3, y: 0.18 },
    { type: 'door', x: 2.1, z: 0.02, w: 1.1, h: 2.4 }, // Capitan Tiago's room (locked)
    { type: 'door', x: 5.6, z: 0.02, w: 1.1, h: 2.4 }, // María Clara's room (locked)
    { type: 'door', x: 9.1, z: 0.02, w: 1.1, h: 2.4 }, // the oratorio
    { type: 'painting', x: 3.85, z: 0.05, y: 1.9, w: 1, h: 1.3, seed: 7 }, // the portrait of the master of the house
    { type: 'mirror', x: 7.35, z: 0.05, y: 1.7 },
    { type: 'mirror', x: 10.85, z: 0.05, y: 1.7 },
    { type: 'chandelier', x: 6, z: 4.5, y: 3.2 },
    { type: 'rug', x: 6.2, z: 5.6, w: 7, d: 5, color: '#6a2a2a' },
    { type: 'table', x: 4.2, z: 6.6, w: 1.6, d: 1.2 },
    { type: 'chair', x: 7.35, z: 1, rot: 0 },
    { type: 'chair', x: 10.85, z: 1, rot: 0 },
    { type: 'chair', x: 0.8, z: 4.2, rot: 1 },
    { type: 'chair', x: 0.8, z: 5.6, rot: 1 },
    { type: 'sofa', x: 2.6, z: 9.2, w: 2.4 },
    { type: 'sofa', x: 9.6, z: 9.2, w: 2.2 },
    { type: 'table', x: 6.1, z: 9.3, w: 1, d: 0.6, cloth: false },
    { type: 'palm', x: 0.6, z: 9.3 },
    { type: 'palm', x: 11.3, z: 2.8 },
    { type: 'candelabrum', x: 0.6, z: 2.6 },
    // ---- the caída ----
    { type: 'arches', x: 19, z: 0, w: 14, count: 5 },
    { type: 'table', x: 19.5, z: 5, w: 11, d: 1.4 },
    ...NORTH.map((x) => ({ type: 'chair', x, z: 3.9, rot: 0 })),
    ...SOUTH.map((x) => ({ type: 'chair', x, z: 6.1, rot: 2 })),
    { type: 'chair', x: 13.2, z: 5, rot: 3 }, // the head of the table
    { type: 'candles', x: 16, z: 5, y: 0.86 },
    { type: 'candles', x: 19.5, z: 5, y: 0.86 },
    { type: 'candles', x: 23, z: 5, y: 0.86 },
    { type: 'chandelier', x: 16.5, z: 5, y: 3.2 },
    { type: 'chandelier', x: 22.5, z: 5, y: 3.2 },
    // Rizal's caída: Chinese lanterns, birdcages without birds, coloured glass globes, botete
    { type: 'paperLantern', x: 14, z: 2.2, y: 2.6, color: '#d84a3a' },
    { type: 'birdcage', x: 18, z: 1.8, y: 2.5 },
    { type: 'glassGlobe', x: 20.6, z: 2.4, y: 2.6, color: '#3a7ab8' },
    { type: 'botete', x: 22.8, z: 1.9, y: 2.5 },
    { type: 'glassGlobe', x: 25, z: 2.4, y: 2.6, color: '#3a9a5a' },
    { type: 'birdcage', x: 15.6, z: 8.4, y: 2.6 },
    { type: 'glassGlobe', x: 21, z: 8.6, y: 2.7, color: '#b83a3a' },
    { type: 'botete', x: 25.5, z: 8.2, y: 2.6 },
    { type: 'sideboard', x: 31.4, z: 6.2, rot: 3, w: 2.4 },
    { type: 'palm', x: 31.3, z: 9.3 },
    { type: 'painting', x: 31.9, z: 2.6, y: 1.9, rot: 3, seed: 13 },
    { type: 'candelabrum', x: 26.6, z: 9.4 },
    { type: 'door', x: 29.1, z: 0.02, w: 1.2, h: 2.4 }, // the kusina's door
    // ---- the azotea ----
    { type: 'balustrade', x: 19, z: -3.8, w: 14 },
    { type: 'paperLantern', x: 14, z: -2.4, y: 2.4, color: '#e0823a' },
    { type: 'paperLantern', x: 18, z: -2.8, y: 2.5, color: '#d84a3a' },
    { type: 'paperLantern', x: 22, z: -2.4, y: 2.4, color: '#e0b03a' },
    { type: 'paperLantern', x: 25, z: -2.9, y: 2.5, color: '#d84a3a' },
    { type: 'arbour', x: 16, z: -2, w: 2.2 },
    { type: 'palm', x: 12.6, z: -3.2 },
    { type: 'palm', x: 25.4, z: -1.2 },
    { type: 'tinaja', x: 24.6, z: -3.3 },
    { type: 'washTub', x: 23.4, z: -3.2 },
    // the far bank across the creek
    { type: 'stiltHouse', x: -4, z: -16, y: -3, w: 3.4, d: 2.6, seed: 1 },
    { type: 'stiltHouse', x: 3, z: -17, y: -3, w: 3, d: 2.4, seed: 2 },
    { type: 'stiltHouse', x: 10, z: -16.4, y: -3, w: 3.8, d: 2.8, seed: 3 },
    { type: 'stiltHouse', x: 18, z: -17, y: -3, w: 3.2, d: 2.4, seed: 4 },
    { type: 'stiltHouse', x: 26, z: -16.2, y: -3, w: 3.6, d: 2.6, seed: 5 },
    { type: 'stiltHouse', x: 34, z: -16.8, y: -3, w: 3, d: 2.4, seed: 6 },
    { type: 'banca', x: 15, z: -9, y: -2.95, rot: 1, len: 3.4 },
  ],
  zones: {
    sala: { x: 0, z: 0, w: 12, d: D, y0: -1, y1: 2 },
    caida: { x: 12, z: 0, w: 20, d: D, y0: -2.5, y1: 2 },
    azotea: { x: 12, z: -4, w: 14, d: 4, y0: -1, y1: 2 },
  },
  spots: {
    // the caída
    caida_from_stairs: [28.5, 3.2],
    caida_from_kusina: [29.1, 1.3],
    isabel_stairhead: [26.8, 3],
    caida_spawn: [26.6, 4.4],
    servant_spot: [30.4, 2],
    seat_head: [13.2, 5],
    seat_damaso: [NORTH[0], 3.9],
    seat_ibarra: [NORTH[1], 3.9],
    seat_player: [NORTH[2], 3.9],
    seat_guevarra: [NORTH[3], 3.9],
    seat_laruja: [NORTH[4], 3.9],
    seat_newcomer: [SOUTH[0], 6.1],
    seat_victorina: [SOUTH[1], 6.1],
    seat_tiburcio: [SOUTH[2], 6.1],
    tiago_table: [18.3, 2.9],
    ibarra_exit_1: [17.2, 2.6],
    ibarra_exit_2: [26.2, 2.6],
    sala_door: [13, 3.4],
    // the sala
    sala_spawn: [7.6, 7.8],
    sala_entry: [11, 4.4],
    damaso_spot: [3.6, 5.7],
    sibyla_spot: [5.2, 5.7],
    guevarra_spot: [4.2, 7.7],
    laruja_spot: [2.8, 6.8],
    newcomer_spot: [5.8, 7.4],
    guevarra_window: [11.35, 9.4],
    victorina_spot: [8.6, 3.2],
    tiburcio_spot: [9.8, 3.4],
    tiago_spot: [9.6, 6.6],
    ibarra_spot: [8.4, 6.9],
    tiago_portrait: [3.85, 1],
    tiago_room_door: [2.1, 0.8],
    clara_room_door: [5.6, 0.8],
    sala_from_oratorio: [9.1, 1.4],
    // extras
    lady_seat_1: [7.35, 1],
    lady_seat_2: [10.85, 1],
    lady_seat_3: [0.8, 4.2],
    lady_fanning: [1.4, 7.6],
    cadet_1: [10.2, 6.9],
    cadet_2: [11.1, 7.5],
    cadet_3: [10.4, 8.2],
    promenade_w: [1.4, 3.2],
    promenade_e: [10.8, 3.2],
    promenade_w2: [2, 3.8],
    promenade_e2: [10.2, 3.8],
    maid_dusting: [6.1, 8.6],
    harp: [22.6, 8.8],
    guitar_1: [23.7, 9.1],
    guitar_2: [24.8, 8.8],
    violin: [25.9, 9.1],
    serve_a: [30, 4.4],
    serve_b: [20.5, 8.1],
    azotea_guest_1: [19.8, -3],
    azotea_guest_2: [20.8, -3.1],
  },
  backdrop: { z: -40, x0: -30, x1: 62, seed: 5 },
  extras: [
    { id: 'lady_1', costume: 'lady_a', spot: 'lady_seat_1', pose: 'sit', dir: 'down' },
    { id: 'lady_2', costume: 'lady_b', spot: 'lady_seat_2', pose: 'sit', dir: 'down' },
    { id: 'lady_3', costume: 'lady_c', spot: 'lady_seat_3', pose: 'sit', dir: 'right' },
    { id: 'lady_4', costume: 'lady_a', spot: 'lady_fanning', dir: 'down', activity: 'fan' },
    { id: 'cadet_1', costume: 'cadet', spot: 'cadet_1', dir: 'right', activity: 'chat' },
    { id: 'cadet_2', costume: 'cadet', spot: 'cadet_2', dir: 'left' },
    { id: 'cadet_3', costume: 'cadet', spot: 'cadet_3', dir: 'up', activity: 'chat' },
    { id: 'foreigner_1', costume: 'foreigner', loop: ['promenade_w', 'promenade_e'], pause: 2.5 },
    { id: 'foreigner_2', costume: 'foreigner', loop: ['promenade_e2', 'promenade_w2'], pause: 3 },
    { id: 'maid_sala', costume: 'maid', spot: 'maid_dusting', dir: 'down', activity: 'dust' },
    { id: 'harpist', costume: 'harpist', spot: 'harp', dir: 'down', activity: 'pluck' },
    { id: 'guitarist_1', costume: 'guitarist', spot: 'guitar_1', dir: 'down', activity: 'strum' },
    { id: 'guitarist_2', costume: 'guitarist', spot: 'guitar_2', dir: 'down', activity: 'strum' },
    { id: 'violinist', costume: 'violinist', spot: 'violin', dir: 'down', activity: 'bow' },
    { id: 'muchacho_serving', costume: 'muchacho', loop: ['serve_a', 'serve_b'], pause: 3 },
    { id: 'azotea_guest_1', costume: 'passerby_a', spot: 'azotea_guest_1', dir: 'up' },
    { id: 'azotea_guest_2', costume: 'lady_b', spot: 'azotea_guest_2', dir: 'up' },
  ],
};
