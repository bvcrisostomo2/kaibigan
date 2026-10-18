// A kitchen knife (itak) chopping at waist height: raised, then down on the board. h is the hand's
// skin, set per set; k the blade, w the handle.
export const KNIFE = {
  palette: { k: '#d8dce0', g: '#8a9098', w: '#5a3e22', h: '#c68b5e', b: '#a07a4a' },
  frames: [
    {
      front: [{ at: [0, 0], rows: [
        '.....k.',
        '....kg.',
        '...kg..',
        '..hw...',
        '.hh....',
        '.......',
        'bbbbbbb',
      ] }],
      right: [{ at: [0, 0], rows: [
        '.....k.',
        '....kg.',
        '...kg..',
        '..hw...',
        '.hh....',
        '.......',
        'bbbbbbb',
      ] }],
    },
    {
      front: [{ at: [0, 0], rows: [
        '.......',
        '.......',
        '.hh....',
        '.hhw...',
        '...gk..',
        '....gk.',
        'bbbbbbb',
      ] }],
      right: [{ at: [0, 0], rows: [
        '.......',
        '.......',
        '.hh....',
        '.hhw...',
        '...gk..',
        '....gk.',
        'bbbbbbb',
      ] }],
    },
  ],
};
