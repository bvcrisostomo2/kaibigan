// A sack of rice (bigas) carried on the shoulder, steadied with one hand; it rises and settles a
// pixel with the step. s is the burlap, d its shadow, h the hand's skin (set per set).
const SACK = [
  '..ooooo...',
  '.osssssoo.',
  'osssdsssso',
  'ossssssdso',
  'osdssssso.',
  '.oossssoo.',
  '...ooohh..',
  '.......hh.',
];

export const SACK_ON_SHOULDER = {
  palette: { o: '#3a2a18', s: '#cbb58a', d: '#9a845c', h: '#c68b5e' },
  frames: [
    { front: [{ at: [0, 0], rows: SACK }], right: [{ at: [0, 0], rows: SACK }] },
    { front: [{ at: [0, 1], rows: SACK }], right: [{ at: [0, 1], rows: SACK }] },
  ],
};
