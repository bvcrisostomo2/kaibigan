// The boatman (bangkero): a lean man who poles his banca on the Pasig, in a coarse barong, dark
// trousers rolled to the knee, barefoot, a salakot on his head, a red sash and a coil of rope across
// his chest; he poles with a long bamboo tikin. Body and head: Male 15 (.packs/male15); his green vest
// and blue shirt become the barong, his belt the sash, his shorts the rolled trousers, his shoes bare
// feet, his brown hair black. Changes beyond colour: the salakot, the coil of rope, the sash's knot,
// the pole. Painted over a kitbash composite (tools/kitbash.mjs); built by:
// node tools/build-sets.mjs boatman
import { wear } from './parts.mjs';
import { SALAKOT } from './parts/salakot.mjs';
import { POLE } from './parts/pole.mjs';

const SAME_PACK = { bodyFrom: 23, headTo: 22, dx: 0 };
const SKIN = '#c68b5e';
const BARONG = ['#e2d6b8', '#c4b89c', '#a49a80', '#827a64', '#5a5444'];

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  bodyRecolor: {
    // green vest and blue shirt → barong
    '#7bdf63': BARONG[0], '#5aa239': BARONG[1], '#295929': BARONG[3],
    '#5a6dce': BARONG[1], '#31499c': BARONG[2], '#293073': BARONG[3], '#212439': BARONG[4], '#181829': BARONG[4],
    // grey collar → barong light
    '#e7e3e7': '#f0e8d4', '#adb2b5': BARONG[0], '#7b7d84': BARONG[2], '#4a4d52': BARONG[3], '#101821': BARONG[4],
    // belt → red sash
    '#ef8a31': '#b84a32', '#ce7d31': '#a83e2a', '#9c5500': '#8a3222', '#8c4900': '#7a2a1c', '#4a2410': '#4a1a12', '#392018': '#3a140e',
    // light shorts → dark trousers, rolled
    '#ceebd6': '#6a6250', '#adc7b5': '#5a5242', '#849284': '#4a4234', '#424d42': '#34302a', '#212021': '#201e1a',
    // shoes → bare feet
    '#bd7d00': SKIN, '#6b4500': '#94603c', '#392800': '#74462a',
  },
  recolor: {
    // brown hair → black
    '#bd9273': '#4a3e42', '#8c615a': '#33292c', '#6b4131': '#241c1e', '#392c21': '#1a1415', '#211818': '#0e0a0b',
    // teal eyes → brown
    '#002c31': '#2a1a12',
    // the green tie in his hair (the vest's greens, left on the head) → black
    '#7bdf63': '#33292c', '#5aa239': '#241c1e', '#295929': '#1a1415',
    // skin → morena
    '#ffdfb5': '#dba57c', '#f79e5a': SKIN, '#b54921': '#94603c',
  },
  // A twisted coil of rope worn across his chest from shoulder to hip (r, R), a spare coil at his hip
  // in profile, and the sash's knot and tails (k, K).
  palette: { r: '#9a7a48', R: '#5a4422', k: '#a83e2a', K: '#5a1a12' },
  views: {
    front: [
      { at: [16, 29], rows: ['rR.............', '.Rr............', '..rR...........', '....Rr.........', '.....rR........', '......Rr.......', '.......rR......', '........Rr.....', '.........rR....', '...........Rr..', '............rR.', '.............Rr'] },
      { at: [29, 41], rows: ['kK', 'Kk', 'k.', 'K.'] },
    ],
    right: [
      { at: [15, 29], rows: ['rR.........', '.Rr........', '..rR.......', '...Rr......', '....rR.....', '.....Rr....', '.....rR....', '......Rr...', '.......rR..', '........Rr.', '.........rR'] },
      { at: [13, 41], rows: ['.rRr.', 'r...R', 'R...r', '.rRr.'] },
    ],
    back: [
      { at: [17, 29], rows: ['.............rR', '............Rr.', '...........rR..', '.........Rr....', '........rR.....', '.......Rr......', '......rR.......', '.....Rr........', '....rR.........', '..Rr...........', '.rR............', 'Rr.............'] },
      { at: [24, 41], rows: ['kKk', 'K.K', 'k.k'] },
    ],
  },
  wear: [wear(SALAKOT, { front: [14, 10], right: [13, 10], back: [14, 10] })],
  activities: {
    pole: { prop: POLE, at: { front: [10, 14], right: [12, 14] }, palette: { h: SKIN } },
  },
  changes: ['salakot', 'coil of rope across the chest', 'sash knot', 'trousers rolled to the knee', 'pole'],
};
