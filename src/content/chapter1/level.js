// Chapter 1's level (spec §3.3): Capitan Tiago's bahay na bato on Calle Anloague, backing onto a
// creek of the Pasig. North is up (the camera looks north); 1 unit = 1 tile.
//   Ground floor (y 0): the stone zaguán, with the stairs at the east end climbing north.
//   Upper floor (y UP): the caída at the back (the stair head; tonight the dining room, as in
//   Rizal's Chapter I, with arches onto the azotea over the river) and the sala at the front.
//   Calle Anloague runs along the south side; a lane east of the house leads north to the
//   riverbank and the one wooden bridge.
// Plan 2's stair rule holds: no floor at the stair's base or top height overlaps its footprint
// (buildWorld throws otherwise), so the zaguán and upper floors are split around it.
const UP = 3.5; // upper floor height
const W = 52; // street length (x)

// A wall run along x with gaps (doorways or arches) and a beam over each gap.
function wallX({ x0, x1, z, d, y, h, tex, gaps = [], beam = 0.6, occluder = true }) {
  const parts = [];
  let x = x0;
  for (const [g0, g1] of gaps) {
    if (g0 > x) parts.push({ x, z, w: g0 - x, d, y, h, tex, occluder });
    parts.push({ x: g0, z, w: g1 - g0, d, y: y + h - beam, h: beam, tex, occluder });
    x = g1;
  }
  if (x1 > x) parts.push({ x, z, w: x1 - x, d, y, h, tex, occluder });
  return parts;
}

export const chapter1Level = {
  floors: [
    { x: 0, z: 22, w: W, d: 6, y: 0, tex: 'cobble' }, // Calle Anloague
    { x: -4, z: 28.4, w: W + 8, d: 5, y: 0.15, tex: 'adobe' }, // the far pavement (decor, behind the parapet)
    // zaguán, split around the stair (x 31–34, z 14–20)
    { x: 8, z: 6, w: 23, d: 16, y: 0, tex: 'tiles' },
    { x: 34, z: 6, w: 4, d: 16, y: 0, tex: 'tiles' },
    { x: 31, z: 6, w: 3, d: 8, y: 0, tex: 'tiles' },
    { x: 31, z: 20, w: 3, d: 2, y: 0, tex: 'tiles' }, // in front of the stair's foot
    // upper floor, split around the stairwell
    { x: 8, z: 6, w: 30, d: 8, y: UP, tex: 'narra', thick: 0.3 }, // caída
    { x: 8, z: 14, w: 22, d: 8, y: UP, tex: 'narra', thick: 0.3 }, // sala
    { x: 30, z: 14, w: 1, d: 8, y: UP, tex: 'narra', thick: 0.3 },
    { x: 34, z: 14, w: 4, d: 8, y: UP, tex: 'narra', thick: 0.3 },
    { x: 31, z: 20, w: 3, d: 2, y: UP, tex: 'narra', thick: 0.3 },
    { x: 12, z: 3, w: 12, d: 3, y: UP, tex: 'tiles', thick: 0.3 }, // azotea over the river
    { x: 44, z: 6, w: 4, d: 16, y: 0, tex: 'dirt' }, // the lane
    { x: 38, z: 3, w: 14, d: 3, y: 0, tex: 'adobe' }, // riverbank
    { x: 45, z: -3, w: 3, d: 6, y: 0.2, tex: 'wood', thick: 0.2 }, // the bridge (broken at its far end)
  ],
  stairs: [{ x: 31, z: 14, w: 3, d: 6, y0: 0, y1: UP, dir: 'n', tex: 'narra' }],
  water: [
    { x: -6, z: -10, w: 44, d: 16, y: -0.6 }, // behind the house, up to its back wall
    { x: 38, z: -10, w: 22, d: 13, y: -0.6 }, // past the riverbank
  ],
  walls: [
    // ground floor, stone; the front door is x 17–20
    ...wallX({ x0: 8, x1: 38, z: 21.6, d: 0.4, y: 0, h: UP, tex: 'adobe', gaps: [[17, 20]], beam: 0.9 }),
    { x: 8, z: 6, w: 30, d: 0.4, y: 0, h: UP, tex: 'adobe', occluder: false },
    { x: 8, z: 6, w: 0.4, d: 16, y: 0, h: UP, tex: 'adobe' },
    { x: 37.6, z: 6, w: 0.4, d: 16, y: 0, h: UP, tex: 'adobe' },
    // upper floor
    { x: 8, z: 21.7, w: 30, d: 0.3, y: UP, h: 3, tex: 'plaster' }, // street side (capiz windows on it)
    ...wallX({ x0: 8, x1: 38, z: 6, d: 0.3, y: UP, h: 3, tex: 'plaster', gaps: [[13, 17], [19, 23]], occluder: false }), // arches to the azotea
    { x: 8, z: 6, w: 0.3, d: 16, y: UP, h: 3, tex: 'plaster' },
    { x: 37.7, z: 6, w: 0.3, d: 16, y: UP, h: 3, tex: 'plaster' },
    ...wallX({ x0: 8, x1: 30, z: 13.85, d: 0.3, y: UP, h: 3, tex: 'wood', gaps: [[13, 16], [22, 25]] }), // sala | caída
    // rails round the stairwell and the azotea
    { x: 30.8, z: 14.6, w: 0.2, d: 5.4, y: UP, h: 0.9, tex: 'wood' },
    { x: 34, z: 14.6, w: 0.2, d: 5.4, y: UP, h: 0.9, tex: 'wood' },
    { x: 30.8, z: 20, w: 3.4, d: 0.2, y: UP, h: 0.9, tex: 'wood' },
    { x: 12, z: 3, w: 12, d: 0.15, y: UP, h: 0.9, tex: 'wood', occluder: false },
    { x: 12, z: 3, w: 0.15, d: 3, y: UP, h: 0.9, tex: 'wood', occluder: false },
    { x: 23.85, z: 3, w: 0.15, d: 3, y: UP, h: 0.9, tex: 'wood', occluder: false },
    // neighbouring houses (decor; they also keep the player on the street, lane and bank)
    { x: 0, z: 6, w: 8, d: 16, y: 0, h: 6.5, tex: 'plaster' },
    { x: 38, z: 6, w: 6, d: 16, y: 0, h: 5.5, tex: 'adobe' },
    { x: 48, z: 6, w: 4, d: 16, y: 0, h: 6, tex: 'plaster' },
    // street and bridge edges
    { x: 0, z: 28, w: W, d: 0.4, y: 0, h: 0.6, tex: 'adobe', occluder: false },
    { x: -0.4, z: 22, w: 0.4, d: 6.4, y: 0, h: 0.6, tex: 'adobe', occluder: false },
    { x: W, z: 22, w: 0.4, d: 6.4, y: 0, h: 0.6, tex: 'adobe', occluder: false },
    { x: 44.8, z: -3, w: 0.2, d: 6, y: 0.2, h: 0.6, tex: 'wood', occluder: false },
    { x: 48, z: -3, w: 0.2, d: 6, y: 0.2, h: 0.6, tex: 'wood', occluder: false },
    { x: 45, z: -3.2, w: 3, d: 0.2, y: 0.2, h: 0.5, tex: 'wood', occluder: false },
  ],
  roofs: [
    { x: 7.6, z: 5.6, w: 30.8, d: 16.8, y: UP + 3, rise: 3, tex: 'roof', axis: 'x' },
    { x: 0, z: 6, w: 8, d: 16, y: 6.5, rise: 1.6, tex: 'roof', axis: 'x' },
    { x: 38, z: 6, w: 6, d: 16, y: 5.5, rise: 1.4, tex: 'roof', axis: 'x' },
    { x: 48, z: 6, w: 4, d: 16, y: 6, rise: 1.4, tex: 'roof', axis: 'x' },
  ],
  windows: [
    ...[11, 15.5, 20, 24.5, 29, 35.5].map((x) => ({ x, z: 22.02, y: UP + 0.8, w: 2.4, h: 1.5, facing: 's' })),
    ...[11.5, 25, 34].map((x) => ({ x, z: 22.02, y: 1.2, w: 1.4, h: 1.2, facing: 's' })),
  ],
  props: [
    // zaguán
    { type: 'crate', x: 9.6, z: 7.4 },
    { type: 'crate', x: 10.8, z: 7.2 },
    { type: 'barrel', x: 9.4, z: 9 },
    { type: 'bench', x: 13, z: 20.6, w: 2.4 },
    { type: 'crate', x: 24, z: 7.4 },
    { type: 'crate', x: 25.2, z: 7.4 },
    { type: 'crate', x: 24.6, z: 8.5 },
    { type: 'barrel', x: 15, z: 7.3 },
    { type: 'barrel', x: 16.2, z: 7.3 },
    { type: 'cabinet', x: 9, z: 14, rot: 1, w: 1.6 },
    { type: 'bench', x: 27, z: 18.4, w: 2.4 },
    { type: 'plant', x: 30.4, z: 17 }, // flower-pots flanking the stair, as in Rizal's Chapter I
    { type: 'plant', x: 34.6, z: 17 },
    { type: 'wallLantern', x: 16.4, z: 22.1, y: 2.2 },
    { type: 'wallLantern', x: 20.6, z: 22.1, y: 2.2 },
    // caída: tonight's dining room
    { type: 'table', x: 19, z: 10, y: UP, w: 15, d: 1.4 },
    ...[12.5, 15, 17.5, 20, 22.5, 25].flatMap((x) => [
      { type: 'chair', x, z: 8.9, y: UP, rot: 0 },
      { type: 'chair', x, z: 11.1, y: UP, rot: 2 },
    ]),
    { type: 'candles', x: 14, z: 10, y: UP + 0.86 },
    { type: 'candles', x: 19, z: 10, y: UP + 0.86 },
    { type: 'candles', x: 24, z: 10, y: UP + 0.86 },
    { type: 'chandelier', x: 14, z: 10, y: UP + 2.6 },
    { type: 'chandelier', x: 24, z: 10, y: UP + 2.6 },
    { type: 'painting', x: 10.5, z: 6.35, y: UP + 1.8, seed: 11 },
    { type: 'painting', x: 26, z: 6.35, y: UP + 1.8, seed: 12 },
    { type: 'painting', x: 30.5, z: 6.35, y: UP + 1.8, seed: 13 },
    { type: 'cabinet', x: 35.6, z: 7, y: UP, rot: 0, w: 1.6 },
    // sala
    { type: 'piano', x: 10.6, z: 15.6, y: UP },
    { type: 'table', x: 14, z: 18.6, y: UP, w: 1.6, d: 1.2 },
    { type: 'sofa', x: 24.2, z: 20.9, y: UP, w: 2.4 },
    { type: 'sofa', x: 17, z: 20.9, y: UP, w: 2.2 },
    { type: 'chair', x: 21, z: 16, y: UP, rot: 2 },
    { type: 'painting', x: 10.5, z: 14.2, y: UP + 1.8, seed: 7 }, // the portrait of the master of the house
    { type: 'mirror', x: 18.5, z: 14.2, y: UP + 1.7 },
    { type: 'mirror', x: 27, z: 14.2, y: UP + 1.7 },
    { type: 'chandelier', x: 14, z: 18, y: UP + 2.6 },
    { type: 'chandelier', x: 24, z: 18, y: UP + 2.6 },
    { type: 'plant', x: 29.2, z: 21, y: UP },
    // azotea
    { type: 'plant', x: 12.8, z: 3.6, y: UP },
    { type: 'plant', x: 23.2, z: 3.6, y: UP },
    { type: 'lantern', x: 18, z: 3.5, y: UP },
    // street, lane and riverbank
    ...[4, 14, 24, 41].map((x) => ({ type: 'lantern', x, z: 22.5, rot: 0 })),
    { type: 'lantern', x: 44.5, z: 14, rot: 1 },
    { type: 'bench', x: 41, z: 4.6, w: 2.2 },
    { type: 'barrel', x: 50.5, z: 4.4 },
    { type: 'crate', x: 51.2, z: 5.2 },
  ],
  zones: {
    calle: { x: 0, z: 22, w: W, d: 6 },
    zaguan: { x: 8, z: 6, w: 30, d: 16, y0: -1, y1: 1.5 },
    caida: { x: 8, z: 6, w: 30, d: 8, y0: 2, y1: 6.5 },
    sala: { x: 8, z: 14, w: 22, d: 8, y0: 2, y1: 6.5 },
    azotea: { x: 12, z: 3, w: 12, d: 3, y0: 2, y1: 6.5 },
    lane: { x: 44, z: 6, w: 4, d: 16 },
    riverbank: { x: 38, z: -3, w: 14, d: 9 },
  },
  indoorZones: ['zaguan', 'caida', 'sala'],
  // Downstairs in the zaguán the upper storey (and anyone up there) is hidden, dollhouse style.
  cutaway: { y: UP, zones: ['zaguan'] },
  spots: {
    street_spawn: [18.5, 25],
    front_door: [18.5, 21],
    stair_foot: [32.5, 20.8],
    stair_view: [30.2, 18.4],
    isabel_stairhead: [33.4, 12.6, UP],
    caida_spawn: [32.5, 12.8, UP],
    sala_entry: [23.5, 15.2, UP],
    sala_spawn: [18.5, 16.4, UP],
    damaso_spot: [13, 17.6, UP],
    sibyla_spot: [15, 17.6, UP],
    guevarra_spot: [14, 19.7, UP],
    newcomer_spot: [19.5, 16.4, UP],
    victorina_spot: [23.4, 19.6, UP],
    tiburcio_spot: [25, 19.6, UP],
    tiago_spot: [27.2, 16.4, UP],
    ibarra_spot: [28.2, 16.8, UP],
    servant_spot: [27.5, 8.4, UP],
    tiago_portrait: [12.6, 14.9, UP],
    seat_head: [11, 10, UP],
    lane_guevarra: [46, 15],
    river_ibarra: [46.5, 4.3],
    bridge_end: [46.5, 1.2],
  },
  examinables: [
    { id: 'staircase', spot: 'stair_view' },
    { id: 'bridge', spot: 'bridge_end' },
    { id: 'tiago_portrait', spot: 'tiago_portrait' },
  ],
  spawn: [18.5, 25],
};
