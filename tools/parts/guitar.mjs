// A guitar (gitara) held across the body, its neck up to the left: the front view of the strum (the
// side view uses the pack's own playing animation). y is the top's light wood, d its dark edge, O
// the sound hole, w the neck, h the hands (set per set): one on the neck, one strumming over the
// hole, a pixel lower on the second frame.
const BODY = (strum) => [
  'o.............',
  'owo...........',
  '.ohh..........',
  '..owo.........',
  '...owo........',
  '....owoo......',
  '.....oyyyoo...',
  '....oyydyyyo..',
  `....oydO${strum ? 'hh' : 'yy'}yyo.`,
  `....oyyd${strum ? 'yy' : 'hh'}yyo.`,
  '.....oyyyyyyo.',
  '......oooooo..',
];

export const GUITAR = {
  palette: { o: '#2a1a0e', y: '#d8a060', d: '#9a6a34', O: '#1a100a', w: '#5a3a1e', h: '#c68b5e' },
  frames: [
    { front: [{ at: [0, 0], rows: BODY(true) }], right: [{ at: [0, 0], rows: BODY(true) }] },
    { front: [{ at: [0, 0], rows: BODY(false) }], right: [{ at: [0, 0], rows: BODY(false) }] },
  ],
};
