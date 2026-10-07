// The riverbank (Plan 5 spec §3.4): the landing in front, the creek flowing across the middle,
// the one wooden bridge out to its broken far end, the far bank's stilt houses, the city behind.
// Capitan Tiago's row of houses stands behind the camera, its back walls on the water.
export const riverbank = {
  name: 'The riverbank',
  detail: 'Binondo, Manila · 1880s',
  offset: [400, 0],
  camera: 'outdoor',
  bounds: { x: 0, z: 0, w: 30, d: 14 },
  floors: [
    { x: 0, z: 9.5, w: 30, d: 4.5, y: 0, tex: 'adobe' }, // the stone landing
    { x: 4, z: 9, w: 6, d: 0.5, y: -0.35, tex: 'adobe' }, // a step down to the water
    { x: 18, z: 4, w: 3, d: 5.5, y: 0.2, tex: 'wood', thick: 0.15 }, // the bridge, broken at its far end (z 4)
  ],
  walls: [
    { x: 0, z: 13.7, w: 25, d: 0.3, y: 0, h: 0.6, tex: 'adobe' }, // the landing's low wall (the lane opens at x 25–28)
    { x: 28, z: 13.7, w: 2, d: 0.3, y: 0, h: 0.6, tex: 'adobe' },
    { x: 17.9, z: 4, w: 0.1, d: 5.5, y: 0.2, h: 0.5, tex: 'wood' }, // the bridge's rails
    { x: 21, z: 4, w: 0.1, d: 5.5, y: 0.2, h: 0.5, tex: 'wood' },
  ],
  water: [{ x: -20, z: -6, w: 70, d: 15.6, y: -0.6 }],
  props: [
    { type: 'stiltHouse', x: 2, z: 0.5, y: -0.6, w: 3.2, d: 2.4, seed: 1 },
    { type: 'stiltHouse', x: 6.5, z: 0, y: -0.6, w: 2.8, d: 2.2, seed: 2 },
    { type: 'stiltHouse', x: 11, z: 0.6, y: -0.6, w: 3.6, d: 2.6, seed: 3 },
    { type: 'stiltHouse', x: 25, z: 0.2, y: -0.6, w: 3, d: 2.4, seed: 4 },
    { type: 'stiltHouse', x: 29.5, z: 0.6, y: -0.6, w: 3.4, d: 2.6, seed: 5 },
    { type: 'banca', x: 7.5, z: 7.6, y: -0.55, rot: 1, len: 3.2 },
    { type: 'banca', x: 13.5, z: 5.2, y: -0.55, rot: 1, len: 3.4 },
    { type: 'mooringPost', x: 5, z: 9.8 },
    { type: 'mooringPost', x: 10, z: 9.8 },
    { type: 'mooringPost', x: 23.5, z: 9.8 },
    { type: 'lantern', x: 16.5, z: 10.2 },
    { type: 'lantern', x: 26, z: 10.2 },
    { type: 'crate', x: 1.2, z: 12.6 },
    { type: 'crate', x: 2.1, z: 12.8 },
    { type: 'tinaja', x: 3.2, z: 12.9 },
    { type: 'washTub', x: 8.6, z: 10.4 },
  ],
  zones: {
    riverbank: { x: 0, z: 3.5, w: 30, d: 10.5 },
  },
  spots: {
    landing_from_lane: [26.5, 12.4],
    river_ibarra: [14.5, 10.4],
    bridge_end: [19.5, 4.6, 0.2],
    washerwoman_steps: [7, 9.9],
    fisherman_bridge: [20.2, 7.2, 0.2],
    boatman_banca: [13.5, 5.2, -0.3],
  },
  backdrop: { z: -32, x0: -25, x1: 55, seed: 11 },
  extras: [
    { id: 'washerwoman', costume: 'washerwoman', spot: 'washerwoman_steps', dir: 'down', activity: 'wash' },
    { id: 'fisherman', costume: 'fisherman', spot: 'fisherman_bridge', dir: 'right' },
    { id: 'boatman', costume: 'boatman', spot: 'boatman_banca', dir: 'left', activity: 'pole' },
  ],
};
