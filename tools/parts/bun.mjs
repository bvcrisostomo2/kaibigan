// Hair drawn back into a low bun (pusod) at the nape, the everyday style of working women: the crown
// combed smooth and back (strand lines h over b), and a coil of two wraps (d, its shadow) held by a
// wooden pin (sipit: w) that shows past the coil on both sides. Drawn to the detail standard
// (spec §5.4). The crown also covers whatever a pack had there (a cap, a ribbon). The front view
// shows only the crown; the side view (facing right) shows the coil at the back of the head; the
// back view shows the coil and its wraps under the crown.
const COIL = [
  '....ooo....',
  '..oohbhoo..',
  '.ohbdhdbho.',
  'wwobdhbhdbow',
  '.ohdbdbdho.',
  '..oodbdoo..',
  '....ooo....',
];

export const BUN = {
  palette: { o: '#080606', b: '#1d1615', h: '#4a3e42', d: '#0e0a0b', w: '#b08452' },
  views: {
    front: [{ at: [0, 0], rows: [
      '....ooooooo....',
      '..oobhbbbhboo..',
      '.obhbbhbbbhbbo.',
      'obbbhbbbhbbbhbo',
    ] }],
    right: [
      { at: [0, 0], rows: [
        '.....oooo....',
        '...oobhbboo..',
        '..obhbbhbbbo.',
        '.obbbhbbbhbbo',
        'obbbbbhbbbbbo',
      ] },
      { at: [-5, 10], rows: COIL },
    ],
    back: [
      { at: [0, 0], rows: [
        '....ooooooo....',
        '..oobhbbbhboo..',
        '.obhbbhbbbhbbo.',
        'obbbhbbbhbbbhbo',
      ] },
      { at: [2, 12], rows: COIL },
    ],
  },
};
