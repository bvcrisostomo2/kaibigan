// A wooden ladle (sandok) held in both hands over a pot at the waist: the stir. Two frames, the bowl
// swung one way then the other. h is the hands' skin, set per set.
export const LADLE = {
  palette: { w: '#d2a066', d: '#9a6a3a', k: '#c9c4b8', h: '#c68b5e', o: '#2a1a0e' },
  frames: [
    {
      front: [{ at: [0, 0], rows: [
        '..hh.hh....',
        '..hhwhh....',
        '.....wd....',
        '......wd...',
        '.......wd..',
        '.......okko',
        '.......okko',
        '........oo.',
      ] }],
      right: [{ at: [0, 0], rows: [
        'hh.........',
        'hhwd.......',
        '...wd......',
        '....wd.....',
        '.....wd....',
        '.....okko..',
        '.....okko..',
        '......oo...',
      ] }],
    },
    {
      front: [{ at: [0, 0], rows: [
        '....hh.hh..',
        '....hhwhh..',
        '....dw.....',
        '...dw......',
        '..dw.......',
        'okko.......',
        'okko.......',
        '.oo........',
      ] }],
      right: [{ at: [0, 0], rows: [
        '..hh.......',
        '..hhwd.....',
        '....wd.....',
        '....wd.....',
        '....wd.....',
        '...okko....',
        '...okko....',
        '....oo.....',
      ] }],
    },
  ],
};
