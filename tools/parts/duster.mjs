// A feather duster (pamunas) of chicken feathers on a short stick, flicked side to side at shoulder
// height. h is the hand's skin, set per set; p the feathers, q their shadow, w the stick.
export const DUSTER = {
  palette: { p: '#b06a3a', q: '#6e3e20', w: '#5a3e22', h: '#c68b5e' },
  frames: [
    {
      front: [{ at: [0, 0], rows: [
        'pqp.....',
        'ppqp....',
        '.pqpp...',
        '..ppw...',
        '....w...',
        '....hh..',
        '....hh..',
      ] }],
      right: [{ at: [0, 0], rows: [
        'pqp.....',
        'ppqp....',
        '.pqpp...',
        '..ppw...',
        '....w...',
        '....hh..',
        '....hh..',
      ] }],
    },
    {
      front: [{ at: [0, 0], rows: [
        '.....pqp',
        '....pqpp',
        '...ppqp.',
        '...wpp..',
        '...w....',
        '..hh....',
        '..hh....',
      ] }],
      right: [{ at: [0, 0], rows: [
        '.....pqp',
        '....pqpp',
        '...ppqp.',
        '...wpp..',
        '...w....',
        '..hh....',
        '..hh....',
      ] }],
    },
  ],
};
