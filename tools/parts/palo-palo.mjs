// A palo-palo: the flat wooden paddle washerwomen beat laundry with on a stone at the river's edge.
// Two frames: raised, then brought down on the wet cloth (c, C its folds) on the stone (s). w is the
// blade, d the handle, h the hand (set per set). The stone's row is the floor.
const STONE = ['..cCcCcc....', '.cCcCcCcc...', 'ssssssssss..'];
const BLANK = '............';

export const PALO_PALO = {
  palette: { w: '#c49a64', d: '#6a4a28', c: '#ece8e0', C: '#b8b4ac', s: '#7a7670', h: '#c68b5e' },
  frames: [
    {
      front: [{ at: [0, 0], rows: [
        '........ww..', '........ww..', '........ww..', '........ww..', '........wd..',
        '.........d..', '.........d..', '........hh..', '........hh..',
        ...Array(10).fill(BLANK), ...STONE,
      ] }],
      right: [{ at: [0, 0], rows: [
        '........ww..', '........ww..', '........ww..', '........ww..', '........wd..',
        '.........d..', '.........d..', '........hh..', '........hh..',
        ...Array(10).fill(BLANK), ...STONE,
      ] }],
    },
    {
      front: [{ at: [0, 0], rows: [
        ...Array(10).fill(BLANK),
        '....hh......', '....hh......', '.....d......', '.....d......', '....dw......',
        '....ww......', '....ww......', '....ww......', '....ww......',
        '..cCwwcc....', '.cCcCcCcc...', 'ssssssssss..',
      ] }],
      right: [{ at: [0, 0], rows: [
        ...Array(10).fill(BLANK),
        '....hh......', '....hh......', '.....d......', '.....d......', '....dw......',
        '....ww......', '....ww......', '....ww......', '....ww......',
        '..cCwwcc....', '.cCcCcCcc...', 'ssssssssss..',
      ] }],
    },
  ],
};
