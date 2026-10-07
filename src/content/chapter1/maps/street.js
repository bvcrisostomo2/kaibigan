// Calle Anloague (Plan 5 spec §3.4): house fronts in a row facing the camera, Capitan Tiago's in
// the middle; the lane at the east end leads to the riverbank. Local tiles: x along the street,
// z from the façades (north, small z) to the near pavement (south, the camera side).
const FRONT = 3.5; // the façades' street face
const H = 6.5; // eaves

// A two-storey house front from x0 to x1: stone below, plaster above, capiz windows, a gable roof.
function houseFront(x0, x1, { door = null, upper = 'plaster', windows = 3 } = {}) {
  const walls = [];
  if (door) {
    walls.push({ x: x0, z: 0, w: door[0] - x0, d: FRONT, y: 0, h: 3, tex: 'adobe' });
    walls.push({ x: door[1], z: 0, w: x1 - door[1], d: FRONT, y: 0, h: 3, tex: 'adobe' });
    walls.push({ x: door[0], z: 0, w: door[1] - door[0], d: FRONT - 0.6, y: 0, h: 3, tex: 'adobe' });
    walls.push({ x: door[0], z: FRONT - 0.6, w: door[1] - door[0], d: 0.6, y: 2.6, h: 0.4, tex: 'adobe', collide: false });
  } else {
    walls.push({ x: x0, z: 0, w: x1 - x0, d: FRONT, y: 0, h: 3, tex: 'adobe' });
  }
  walls.push({ x: x0, z: 0, w: x1 - x0, d: FRONT + 0.3, y: 3, h: H - 3, tex: upper });
  const windowList = [];
  const step = (x1 - x0) / windows;
  for (let i = 0; i < windows; i++) windowList.push({ x: x0 + step * (i + 0.5), z: FRONT + 0.31, y: 3.7, w: step * 0.62, h: 1.8, facing: 's' });
  return { walls, windows: windowList, roof: { x: x0 - 0.2, z: -0.2, w: x1 - x0 + 0.4, d: FRONT + 0.9, y: H, rise: 1.8, tex: 'roof', axis: 'x' } };
}

const tiago = houseFront(13, 27, { door: [19, 21], windows: 4 });
const westHouse = houseFront(0, 12.6, { door: [5, 6.4], upper: 'wood', windows: 3 });
const shop = houseFront(27.4, 35, { door: [29.6, 31], windows: 2 });
const eastHouse = houseFront(38.6, 44, { windows: 1, upper: 'wood' });

export const street = {
  name: 'Calle Anloague',
  detail: 'Binondo, Manila · 1880s',
  offset: [0, 0],
  camera: 'outdoor',
  bounds: { x: 0, z: 0, w: 42, d: 14 },
  floors: [
    { x: 0, z: 2.8, w: 44, d: 1.9, y: 0, tex: 'adobe' }, // the pavement along the house fronts (and into the doorways)
    { x: 0, z: FRONT + 1.2, w: 44, d: 6.3, y: 0, tex: 'cobble' },
    { x: 0, z: 11, w: 44, d: 3, y: 0, tex: 'adobe' }, // the near pavement
    { x: 35, z: -2, w: 3.6, d: 4.8, y: 0, tex: 'dirt' }, // the lane north to the river
  ],
  walls: [
    ...tiago.walls, ...westHouse.walls, ...shop.walls, ...eastHouse.walls,
    { x: 0, z: 13.6, w: 44, d: 0.3, y: 0, h: 0.7, tex: 'adobe' }, // a low wall along the near pavement
    { x: 34.6, z: -2, w: 0.4, d: FRONT + 2, y: 0, h: 2.2, tex: 'adobe' }, // the lane's walls
    { x: 38.6, z: -2, w: 0.4, d: 2, y: 0, h: 2.2, tex: 'adobe' },
  ],
  windows: [...tiago.windows, ...westHouse.windows, ...shop.windows, ...eastHouse.windows],
  roofs: [tiago.roof, westHouse.roof, shop.roof, eastHouse.roof],
  props: [
    // Capitan Tiago's balcony and doorway
    { type: 'balustrade', x: 20, z: FRONT + 0.75, y: 3, w: 6, collide: false },
    { type: 'door', x: 20, z: FRONT - 0.62, w: 2, h: 2.6 },
    { type: 'plant', x: 18.4, z: FRONT + 0.45 },
    { type: 'plant', x: 21.6, z: FRONT + 0.45 },
    { type: 'door', x: 5.7, z: FRONT - 0.62, w: 1.4, h: 2.6 },
    { type: 'door', x: 30.3, z: FRONT - 0.62, w: 1.4, h: 2.6 },
    // lamps along the house fronts
    { type: 'lantern', x: 3, z: FRONT + 0.6 },
    { type: 'lantern', x: 15.5, z: FRONT + 0.6 },
    { type: 'lantern', x: 25, z: FRONT + 0.6 },
    { type: 'lantern', x: 40, z: FRONT + 0.6 },
    // the street's things
    { type: 'carromata', x: 9, z: 8.2, rot: 1 },
    { type: 'stall', x: 32.6, z: 5.05, w: 2.2 },
    { type: 'crate', x: 34, z: 4.6 },
    { type: 'barrel', x: 27.9, z: 4.5 },
    { type: 'bench', x: 24, z: 4.4, w: 1.8 },
    { type: 'sacks', x: 2, z: 4.7 },
    { type: 'plant', x: 12.9, z: 4.4 },
    { type: 'plant', x: 39, z: 4.4 },
  ],
  zones: {
    calle: { x: 0, z: FRONT, w: 44, d: 11 },
    lane: { x: 35, z: -2, w: 3.6, d: FRONT + 2 },
  },
  spots: {
    street_spawn: [20, 8.5],
    street_door: [20, 5.6],
    lane_from_river: [36.8, 0],
    lane_guevarra: [36.8, 4.6],
    vendor_stall: [32.6, 6.6],
    cochero_seat: [10.6, 8.6],
    gossip_a: [16.6, 6.2],
    gossip_b: [17.6, 6.4],
    sweep_w: [22, 9.6],
    sweep_e: [27, 9.6],
    walk_w: [1, 10.4],
    walk_e: [34, 10.4],
    pawnshop_door: [30.3, 4.6],
    neighbour_door: [5.7, 4.6],
  },
  backdrop: { z: -30, x0: -20, x1: 64, seed: 7 },
  extras: [
    { id: 'vendor', costume: 'vendor', spot: 'vendor_stall', dir: 'down', activity: 'fan' },
    { id: 'cochero', costume: 'cochero', spot: 'cochero_seat', dir: 'left', activity: 'doze' },
    { id: 'gossip_1', costume: 'passerby_b', spot: 'gossip_a', dir: 'right', activity: 'chat' },
    { id: 'gossip_2', costume: 'lady_b', spot: 'gossip_b', dir: 'left' },
    { id: 'sweeper', costume: 'sweeper', loop: ['sweep_w', 'sweep_e'], pause: 4, activity: 'sweep' },
    { id: 'passerby', costume: 'passerby_a', loop: ['walk_w', 'walk_e'], pause: 3 },
  ],
};
