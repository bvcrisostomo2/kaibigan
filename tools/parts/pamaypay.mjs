// A pamaypay: a small square fan of woven buri on a short handle, waved to and fro (the muchacho
// fanning the stove, the vendor fanning herself). h is the hand's skin, set per set.
const LEFT = [
  'kyyyk...',
  'ykyky...',
  'yykyy...',
  'ykyky...',
  'kyyyk...',
  '..w.....',
  '..w.....',
  '.hh.....',
];
const RIGHT = [
  '...kyyyk',
  '...ykyky',
  '...yykyy',
  '...ykyky',
  '...kyyyk',
  '...w....',
  '..w.....',
  '.hh.....',
];

export const PAMAYPAY = {
  palette: { y: '#e0c27a', k: '#a8864a', w: '#7a5233', h: '#c68b5e' },
  frames: [
    { front: [{ at: [0, 0], rows: LEFT }], right: [{ at: [0, 0], rows: LEFT }] },
    { front: [{ at: [0, 0], rows: RIGHT }], right: [{ at: [0, 0], rows: RIGHT }] },
  ],
};
