// Closed eyes for a doze: two short lid lines (l) over the eyes, the second frame a pixel lower as
// the head nods. Placed over a set's eyes per view; k is the lid's crease.
export const EYELIDS = {
  palette: { l: '#5a3a28', k: '#2a1a12' },
  frames: [
    { front: [{ at: [0, 0], rows: ['kk...kk', 'll...ll'] }], right: [{ at: [0, 0], rows: ['kk', 'll'] }] },
    { front: [{ at: [0, 1], rows: ['kk...kk', 'll...ll'] }], right: [{ at: [0, 1], rows: ['kk', 'll'] }] },
  ],
};
