// A peineta: a small arched comb of carey (tortoiseshell) set upright in the hair behind the crown, a
// lady's ornament worn with the low bun (parts/bun.mjs). y is the shell's amber, z its dark mottling,
// o the outline. Front and back show the arch above the crown; the side view shows it edge-on.
export const PEINETA = {
  palette: { o: '#2a1408', y: '#b8782e', z: '#6a3a14', g: '#e0a850' },
  views: {
    front: [{ at: [0, 0], rows: [
      '..ooooooo..',
      '.ogyzyyzyo.',
      'oyzyygzyzyo',
      '.ozyzyyzyo.',
    ] }],
    right: [{ at: [0, 0], rows: [
      '.oo.',
      'ogyo',
      'oyzo',
      'ozyo',
      '.oo.',
    ] }],
    back: [{ at: [0, 0], rows: [
      '..ooooooo..',
      '.oyzyyzygo.',
      'oyzgyyzyzyo',
      '.ozyzyyzyo.',
    ] }],
  },
};
