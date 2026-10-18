// Hair combed flat and back with pomade, close to the skull (the muchacho, the passersby, the
// newcomer, Laruja). b is the hair (recoloured per set), h the pomade's shine; '-' clears a pack's
// own hair where it stood higher than the combed shape.
export const SLICK_HAIR = {
  palette: { o: '#0c0809', b: '#1d1615', h: '#4a3e42' },
  views: {
    front: [{ at: [0, 0], rows: [
      '---oooooooooo---',
      '--obbbbbbbhbbo--',
      '-obbbbbbbbhbbbo-',
      'obbbbbbbbbbhbbbo',
      'obbbbbbbbbbbhbbo',
      'obbbbbbbbbbbbbbo',
      'obbbo......obbbo',
      'obbo........obbo',
      '.oo..........oo.',
    ] }],
    right: [{ at: [0, 0], rows: [
      '...oooooooo------',
      '.oobbbbbbbhoo----',
      'obbbbbbbbbbhbo---',
      'obbbbbbbbbbbhbo--',
      'obbbbbbbbbbbbbbo-',
      'obbbbbbbbbbboo-----',
      'obbbbbbo...o-------',
      'obbbbbo.....o------',
      'obbbbo......o------',
      '.obbbo...........--',
      '..oo.............-',
    ] }],
    back: [{ at: [0, 0], rows: [
      '....ooooooooo....',
      '..oobbbbbbbbboo..',
      '.obbbbbbhbbbbbbo.',
      'obbbbbbbhbbbbbbbo',
      'obbbbbbbbhbbbbbbo',
      'obbbbbbbbhbbbbbbo',
      'obbbbbbbbbbbbbbbo',
      'obbbbbbbbbbbbbbbo',
      'obbbbbbbbbbbbbbbo',
      'obbbbbbbbbbbbbbbo',
      '.obbbbbbbbbbbbbo.',
      '..oobbbbbbbbboo..',
      '....ooooooooo....',
    ] }],
  },
};
