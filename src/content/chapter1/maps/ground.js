// The zaguán (Plan 5 spec §3.4): Capitan Tiago's stone ground floor, a working storehouse, open at
// the front to the camera. The front door (south edge) leads out to the street; the stairs climb
// north between flower-pots to the upper floor.
const W = 14;
const D = 8;
// The stairs: from the floor at z 6.4 up to the top at z 1.4 (the door to the upper floor).
const STAIR = { x: 10.4, z: 1.4, w: 2.2, d: 5, y0: 0, y1: 2, dir: 'n', tex: 'narra' };

export const ground = {
  name: 'Casa de Capitan Tiago',
  detail: 'Zaguán · Calle Anloague, Binondo',
  offset: [800, 0],
  camera: 'indoor',
  bounds: { x: 0, z: 0, w: W, d: D },
  floors: [
    // split round the stair's footprint (the stair rule)
    { x: 0, z: 0, w: STAIR.x, d: D, y: 0, tex: 'adobe' },
    { x: STAIR.x + STAIR.w, z: 0, w: W - STAIR.x - STAIR.w, d: D, y: 0, tex: 'adobe' },
    { x: STAIR.x, z: STAIR.z + STAIR.d, w: STAIR.w, d: D - STAIR.z - STAIR.d, y: 0, tex: 'adobe' },
    { x: STAIR.x, z: 0, w: STAIR.w, d: STAIR.z, y: 2, tex: 'narra' }, // the landing at the top
  ],
  stairs: [STAIR],
  walls: [
    { x: -0.4, z: -0.4, w: W + 0.8, d: 0.4, y: 0, h: 3.2, tex: 'adobe' }, // back wall
    { x: -0.4, z: 0, w: 0.4, d: D, y: 0, h: 3.2, tex: 'adobe' },
    { x: W, z: 0, w: 0.4, d: D, y: 0, h: 3.2, tex: 'adobe' },
    { x: STAIR.x - 0.15, z: STAIR.z, w: 0.15, d: STAIR.d, y: 0, h: 1, tex: 'wood' }, // the stair's banister
  ],
  props: [
    { type: 'calesa', x: 2.6, z: 3, rot: 0 },
    { type: 'crate', x: 5.4, z: 0.6 },
    { type: 'crate', x: 6.3, z: 0.6 },
    { type: 'crate', x: 5.85, z: 0.6, y: 0.8 },
    { type: 'crate', x: 5.4, z: 1.45 },
    { type: 'cat', x: 5.85, z: 0.6, y: 1.6 },
    { type: 'sacks', x: 7.6, z: 1.2 },
    { type: 'barrel', x: 9, z: 0.6 },
    { type: 'barrel', x: 9.2, z: 1.4 },
    { type: 'firewood', x: 1.2, z: 0.6, w: 1.6 },
    { type: 'shelf', x: 3.4, z: 0.2, w: 1.8 },
    { type: 'rope', x: 4.4, z: 1.2 },
    { type: 'niche', x: 0.9, z: 0.05, y: 1.9 },
    { type: 'wallLantern', x: 7.5, z: 0.0, y: 2.4 },
    { type: 'wallLantern', x: 13.5, z: 0.0, y: 2.4 },
    { type: 'tinaja', x: 0.6, z: 6.6 },
    { type: 'tinaja', x: 1.4, z: 7.3 },
    { type: 'bilao', x: 2.8, z: 7.2 },
    { type: 'palayok', x: 3.5, z: 7.4 },
    { type: 'palayok', x: 3.2, z: 6.8 },
    { type: 'bench', x: 5.6, z: 7.4, w: 1.6 },
    { type: 'plant', x: 9.8, z: 6.1 },
    { type: 'plant', x: 13.2, z: 6.1 },
    { type: 'plant', x: 9.8, z: 4.6 },
    { type: 'plant', x: 13.2, z: 4.6 },
  ],
  zones: {
    zaguan: { x: 0, z: 0, w: W, d: D, y0: -1, y1: 2.5 },
  },
  spots: {
    zaguan_entry: [7, 6.8],
    zaguan_from_stairs: [11.5, 7.2],
    stair_foot: [11.5, 6.9],
    stair_view: [9.2, 7.2],
    coachman_calesa: [4.1, 4.6],
    carry_a: [7.4, 5.2],
    carry_b: [1.8, 5.2],
  },
  extras: [
    { id: 'coachman', costume: 'cochero', spot: 'coachman_calesa', dir: 'left', activity: 'polish' },
    { id: 'muchacho_sacks', costume: 'muchacho', loop: ['carry_a', 'carry_b'], pause: 2.5, activity: 'carry' },
  ],
};
