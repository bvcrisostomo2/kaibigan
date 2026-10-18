// A lady's folding fan (abaniko) of painted paper on bamboo ribs, waved at the chest: open and
// tilted one way, then the other. y is the paper (recoloured per lady), k the ribs and the painted
// edge, w the handle, h the hand's skin (set per set).
export const FAN = {
  palette: { y: '#e8c06a', k: '#9a7a3a', w: '#6a4824', h: '#d9a37a' },
  frames: [
    {
      front: [{ at: [0, 0], rows: [
        '..k.k.k..',
        '.kyykyyk.',
        'kyykyykyk',
        '.kyyyyyk.',
        '..kyyyk..',
        '...kwk...',
        '....h....',
        '...hh....',
      ] }],
      right: [{ at: [0, 0], rows: [
        '..k.k.k..',
        '.kyykyyk.',
        'kyykyykyk',
        '.kyyyyyk.',
        '..kyyyk..',
        '...kwk...',
        '....h....',
        '...hh....',
      ] }],
    },
    {
      front: [{ at: [0, 0], rows: [
        '.........',
        'k.k.k....',
        'kyykyyk..',
        'kyykyyyk.',
        '.kyyyyk..',
        '..kyyk...',
        '...kw....',
        '...hh....',
      ] }],
      right: [{ at: [0, 0], rows: [
        '.........',
        'k.k.k....',
        'kyykyyk..',
        'kyykyyyk.',
        '.kyyyyk..',
        '..kyyk...',
        '...kw....',
        '...hh....',
      ] }],
    },
  ],
};
