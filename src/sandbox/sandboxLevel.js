// A small test level for Plan 2: a Binondo street beside the Pasig, and a bahay na bato whose
// stone ground floor (zaguán) has a stair up to a wooden sala. Not the Chapter 1 map (Plan 4).
const W = 22; // street width (x)
const UP = 3; // upper floor height

export const sandboxLevel = {
  floors: [
    { x: 0, z: 12, w: W, d: 6, y: 0, tex: 'cobble' }, // Calle
    { x: 0, z: 18, w: W, d: 1.2, y: 0, tex: 'adobe' }, // riverside wall top
    // zaguán (entrance hall), split around the stair: a floor under a ramp would hide it
    { x: 6, z: 9, w: 7, d: 3, y: 0, tex: 'tiles' },
    { x: 15.4, z: 9, w: 0.6, d: 3, y: 0, tex: 'tiles' },
    { x: 13, z: 11.4, w: 2.4, d: 0.6, y: 0, tex: 'tiles' }, // in front of the stair's foot
    { x: 6, z: 2, w: 10, d: 7, y: UP, tex: 'narra', thick: 0.3 }, // sala (upper floor)
  ],
  // The stair's foot sits inside the hall (behind the front wall at z 11.6) and its top lands on the sala.
  stairs: [{ x: 13, z: 8.4, w: 2.4, d: 3, y0: 0, y1: UP, dir: 'n', tex: 'narra' }],
  water: [{ x: -4, z: 19.2, w: W + 8, d: 10, y: -0.6 }],
  walls: [
    // ground floor stone walls (front has a doorway at x 10–12)
    { x: 6, z: 11.6, w: 4, d: 0.4, y: 0, h: UP, tex: 'adobe' },
    { x: 12, z: 11.6, w: 4, d: 0.4, y: 0, h: UP, tex: 'adobe' },
    { x: 10, z: 11.6, w: 2, d: 0.4, y: 2.4, h: 0.6, tex: 'adobe' },
    { x: 5.6, z: 2, w: 0.4, d: 10, y: 0, h: UP, tex: 'adobe' },
    { x: 16, z: 2, w: 0.4, d: 10, y: 0, h: UP, tex: 'adobe' },
    { x: 6, z: 8.7, w: 7, d: 0.3, y: 0, h: UP - 0.3, tex: 'adobe', occluder: false }, // back of the zaguán
    // upper floor wooden walls with window openings on the street side
    { x: 5.6, z: 2, w: 0.4, d: 7, y: UP, h: 3, tex: 'plaster' },
    { x: 16, z: 2, w: 0.4, d: 7, y: UP, h: 3, tex: 'plaster' },
    { x: 6, z: 1.6, w: 10, d: 0.4, y: UP, h: 3, tex: 'plaster', occluder: false },
    { x: 6, z: 9, w: 10, d: 0.3, y: UP + 2.3, h: 0.7, tex: 'wood' },
    { x: 6, z: 9, w: 6.6, d: 0.3, y: UP, h: 0.9, tex: 'wood' },
    { x: 15.4, z: 9, w: 0.6, d: 0.3, y: UP, h: 0.9, tex: 'wood' },
    // rail around the stair opening upstairs
    { x: 12.6, z: 9, w: 0.2, d: 0.3, y: UP, h: 2.3, tex: 'wood' },
    // neighbouring houses' walls along the street (decor, block movement north)
    { x: 0, z: 9, w: 5.6, d: 3, y: 0, h: 5, tex: 'plaster' },
    { x: 16.4, z: 9, w: 5.6, d: 3, y: 0, h: 5, tex: 'plaster' },
    // street edges
    { x: -0.4, z: 12, w: 0.4, d: 7, y: 0, h: 0.6, tex: 'adobe', occluder: false },
    { x: W, z: 12, w: 0.4, d: 7, y: 0, h: 0.6, tex: 'adobe', occluder: false },
    { x: 0, z: 19, w: W, d: 0.2, y: 0, h: 0.5, tex: 'adobe', occluder: false },
  ],
  roofs: [
    { x: 5.4, z: 1.4, w: 11.2, d: 8.2, y: UP + 3, rise: 2.4, tex: 'roof', axis: 'z' },
    { x: 0, z: 8.6, w: 5.6, d: 3.4, y: 5, rise: 1.4, tex: 'roof', axis: 'x' },
    { x: 16.4, z: 8.6, w: 5.6, d: 3.4, y: 5, rise: 1.4, tex: 'roof', axis: 'x' },
  ],
  windows: [
    { x: 8.5, z: 9.16, y: UP + 0.9, w: 2.2, h: 1.4, facing: 's' },
    { x: 13.5, z: 9.16, y: UP + 0.9, w: 2.2, h: 1.4, facing: 's' },
    { x: 2.8, z: 12.02, y: 1.2, w: 1.6, h: 1.4, facing: 's' },
    { x: 19.2, z: 12.02, y: 1.2, w: 1.6, h: 1.4, facing: 's' },
  ],
  props: [
    { type: 'table', x: 10, z: 5, y: UP, w: 4, d: 1.4 },
    { type: 'chair', x: 8.6, z: 4, y: UP, rot: 0 },
    { type: 'chair', x: 11.4, z: 4, y: UP, rot: 0 },
    { type: 'chair', x: 8.6, z: 6, y: UP, rot: 2 },
    { type: 'chair', x: 11.4, z: 6, y: UP, rot: 2 },
    { type: 'candles', x: 10, z: 5, y: UP + 0.86 },
    { type: 'chandelier', x: 10, z: 5, y: UP + 2.6 },
    { type: 'piano', x: 7.2, z: 2.6, y: UP },
    { type: 'sofa', x: 14.3, z: 2.7, y: UP, w: 2.2 },
    { type: 'painting', x: 10, z: 2.05, y: UP + 1.8, seed: 3 },
    { type: 'mirror', x: 13.5, z: 2.05, y: UP + 1.7 },
    { type: 'plant', x: 15.3, z: 8.2, y: UP },
    { type: 'cabinet', x: 7, z: 8.4, y: UP, rot: 2, w: 1.6 },
    { type: 'door', x: 11, z: 11.9, y: 0, w: 2, h: 2.4, collide: false },
    { type: 'lantern', x: 4.2, z: 13, rot: 0 },
    { type: 'lantern', x: 18, z: 13, rot: 2 },
    { type: 'barrel', x: 1.2, z: 13 },
    { type: 'crate', x: 2.2, z: 12.9 },
    { type: 'bench', x: 9, z: 18.2, w: 2.2 },
    { type: 'plant', x: 16.8, z: 12.6 },
    { type: 'wallLantern', x: 9.6, z: 12, y: 2.1 },
  ],
  zones: {
    calle: { x: 0, z: 12, w: W, d: 7 },
    zaguan: { x: 6, z: 9, w: 10, d: 3, y0: -1, y1: 1 },
    sala: { x: 6, z: 2, w: 10, d: 7, y0: 2, y1: 6 },
  },
  spots: {
    door: [11, 13],
    table: [10, 7.2, UP],
    piano: [7.5, 3.8, UP],
  },
  spawn: [11, 15],
};

// Where NPCs stand in the sandbox.
export const sandboxCast = [
  { id: 'ibarra', costume: 'ibarra', at: [8, 15], dir: 'down', companion: true },
  { id: 'guevarra', costume: 'guevarra', at: [5.5, 14.5], dir: 'right' },
  { id: 'isabel', costume: 'isabel', at: [11.6, 9.8], dir: 'down' },
  { id: 'damaso', costume: 'damaso', at: [9, 7.3, UP], dir: 'up' },
  { id: 'sibyla', costume: 'sibyla', at: [11.2, 7.3, UP], dir: 'up' },
  { id: 'victorina', costume: 'victorina', at: [14, 4, UP], dir: 'down' },
  { id: 'tiago', costume: 'tiago', at: [8, 3.8, UP], dir: 'down' },
];
