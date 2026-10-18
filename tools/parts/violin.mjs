// A violin (biyolin) held at the left shoulder under the chin, the neck out to the raised left hand,
// and the bow drawn across the strings: two frames, the bow pulled one way then pushed back. y is the
// varnished body, O its f-holes, w the neck, b the bow, h the hands (set per set).
const VIOLIN = (bowAt, handAt) => [
  '....hh........',
  '....hwww......',
  '........wwyyo.',
  '........oyyyyo',
  '.........oyOyo',
  '..........oyyo',
  '.'.repeat(bowAt) + 'bbbbbbbbb' + '.'.repeat(Math.max(0, 5 - bowAt)),
  '.'.repeat(handAt) + 'hh',
];

export const VIOLIN_PROP = {
  palette: { o: '#2a1206', y: '#a8501e', O: '#2a1206', w: '#3a2414', b: '#e8dcc0', h: '#d9a37a' },
  frames: [
    { front: [{ at: [0, 0], rows: VIOLIN(3, 2) }], right: [{ at: [0, 0], rows: VIOLIN(3, 2) }] },
    { front: [{ at: [0, 0], rows: VIOLIN(5, 9) }], right: [{ at: [0, 0], rows: VIOLIN(5, 9) }] },
  ],
};
