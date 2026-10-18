// A cadet's kepi: a stiff round cap of navy cloth (n, N its light), a gold band (g, y its shine), a
// black leather visor (d) over the forehead; the cadets of the Guardia Civil and the colleges wore
// them. The rows above the cap clear the hair a pack had higher than the crown ('-'). The side view
// faces right: the visor juts forward on the right.
export const KEPI = {
  palette: { o: '#0a0c14', n: '#2a3a5a', N: '#44587e', g: '#c8a040', y: '#f0d070', d: '#14141c' },
  views: {
    front: [{ at: [0, 0], rows: [
      '--ooooooooooo--',
      '-onNnnnnnnnnno-',
      '-onnNnnnnnnnno-',
      '-onnnnnnnnnnno-',
      '-oygggggggggyo-',
      'odddddddddddddo',
      '.ooooooooooooo.',
    ] }],
    right: [{ at: [0, 0], rows: [
      '--oooooooooo----',
      '-onNnnnnnnnno---',
      '-onnNnnnnnnno---',
      '-onnnnnnnnnno---',
      '-oyggggggggyo---',
      '-oddddddddddddo.',
      '..oooooooooooo..',
    ] }],
    back: [{ at: [0, 0], rows: [
      '--ooooooooooo--',
      '-onNnnnnnnnnno-',
      '-onnnnnnnnnnno-',
      '-onnnnnnnnnnno-',
      '-oygggggggggyo-',
      '-onnnnnnnnnnno-',
      '..ooooooooooo..',
    ] }],
  },
};
