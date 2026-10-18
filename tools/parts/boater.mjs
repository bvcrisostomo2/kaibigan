// A straw boater: a flat-topped hat of stiff yellow straw (y, Y its shine, k its weave) with a dark
// ribbon band (b) and a flat brim, the summer hat of foreign men in Manila. The top rows clear hair a
// pack had above the crown ('-'). Front, side and back are the same shape.
const HAT = [
  '---oooooooooo---',
  '--oyYyykyyykyo--',
  '--oyyykyyykyyo--',
  '--obbbbbbbbbbo--',
  'ooyykyyykyyykyoo',
  '.oooooooooooooo.',
];

export const BOATER = {
  palette: { o: '#3a2a10', y: '#e8cc78', Y: '#f8e4a8', k: '#c4a450', b: '#2a2430' },
  views: {
    front: [{ at: [0, 0], rows: HAT }],
    right: [{ at: [0, 0], rows: HAT }],
    back: [{ at: [0, 0], rows: HAT }],
  },
};
