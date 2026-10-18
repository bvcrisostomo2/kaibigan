// The sweeper: a street sweeper in a plain camisa de chino and dark loose trousers, barefoot,
// under a salakot, a cloth sash knotted at the hip and a rag tucked in it, with a long-handled
// walis tingting. Body and head: Male 11 (.packs/male11), his
// orange hair blackened and his skin darkened to morena. Changes beyond colour: the salakot (it
// hides his hair), the sash and its knot, the rag, the broom. Painted over a kitbash composite (tools/kitbash.mjs); built by:
// node tools/build-sets.mjs sweeper
import { wear } from './parts.mjs';
import { SALAKOT } from './parts/salakot.mjs';
import { BROOM } from './parts/broom.mjs';

const SAME_PACK = { bodyFrom: 20, headTo: 19, dx: 0 };
const SKIN = { '#ffdfb5': '#dba57c', '#f79e5a': '#c68b5e', '#b54921': '#94603c', '#8c4531': '#74462a' };

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  recolor: {
    // orange hair → black
    '#f79e42': '#5a5054', '#c66139': '#4a4044', '#a54921': '#3a3034', '#733821': '#2a2224', '#422010': '#141012', '#311c08': '#0e0b0c',
    ...SKIN,
    // brown jacket and green shirt → one camisa de chino
    '#ce7110': '#efe7d2', '#a55100': '#d8cdb2', '#843c00': '#b8ac90', '#632c00': '#948a70', '#391800': '#62594a',
    '#638e21': '#f6f1e4', '#426110': '#e2d9c3', '#293c10': '#c4b9a0', '#182808': '#9a8f76',
    // grey trousers → dark brown
    '#736963': '#7a6e58', '#6b6d6b': '#7a6e58', '#52514a': '#5a5040', '#424139': '#5a5040', '#313431': '#433b2f', '#292421': '#2e281f', '#212021': '#2e281f',
    // sandals → bare feet
    '#ad7129': '#94603c', '#6b4921': '#74462a',
  },
  // The sash over the shirt's hem (m light, n mid, q dark), its knot and tails at the left hip, and
  // a rag (r, R) tucked in at the right hip; in the side view the knot is at the back.
  palette: { m: '#9a4e30', n: '#7a3a22', q: '#4a2014', r: '#ddd6c4', R: '#a8a08c' },
  views: {
    front: [{ at: [19, 45], rows: [
      'qmmmmmmmmmmmq',
      'qnnnnnnnnnnnq',
      '.mq.......rR.',
      '.nq.......rR.',
      '..q.......Rr.',
      '..........rR.',
    ] }],
    right: [{ at: [20, 44], rows: [
      'qmmmmmmmmmmq',
      'qnnnnnnnnnnq',
      '.mq.....rR..',
      '.nq.....rR..',
      '..q.....Rr..',
    ] }],
    back: [{ at: [19, 45], rows: [
      'qmmmmmmmmmmmq',
      'qnnnnnnnnnnnq',
      '.....mnq.....',
      '.....mnq.....',
      '......q......',
    ] }],
  },
  wear: [wear(SALAKOT, { front: [15, 10], right: [12, 10], back: [14, 10] })],
  activities: {
    sweep: { prop: BROOM, at: { front: [7, 28], right: [22, 28] }, palette: { h: '#c68b5e' } },
  },
  changes: ['salakot with weave and chin cord', 'sash knotted at the hip', 'rag tucked in the sash', 'broom'],
};
