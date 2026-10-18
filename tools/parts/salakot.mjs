// The salakot: a wide, shallow cone of woven nito over a bamboo frame, a small knob on top and a
// cord tied under the chin, worn by working men (the sweeper, the cochero, the boatman). Hand-drawn
// to the detail standard (spec §5.4): ring weave in two straw tones with radial ribs (c), a dark
// rim (r), the knob (k) and the chin cord (t), lit from the upper left. The brim's top edge (row 6)
// sits on the forehead; the cord runs down the cheeks to the chin in the front and side views.
const CONE = [
  '.........okko.........',
  '.......ooaabboo.......',
  '.....oaabacabbbo......',
  '...oaabbacabbabbbo....',
  '..oaaaaacaaaaacbbbbo..',
  '.oabbbbcbbbbbbbcbbbbo.',
  'orrrrrrrrrrrrrrrrrrrro',
  '.occcccccccccccccccco.',
  '..oooooooooooooooooo..',
];

export const SALAKOT = {
  palette: { o: '#2a1a0e', a: '#ecd08a', b: '#c9a052', c: '#94703a', r: '#5a3a1a', k: '#6a4824', t: '#3a2a1a' },
  views: {
    front: [{ at: [0, 0], rows: [
      ...CONE,
      '....t............t....',
      '.....t..........t.....',
      '......t........t......',
      '.......tt....tt.......',
      '.........tttt.........',
    ] }],
    right: [{ at: [0, 0], rows: [
      ...CONE,
      '..............t.......',
      '...............t......',
      '...............t......',
      '..............t.......',
    ] }],
    back: [{ at: [0, 0], rows: CONE }],
  },
};
