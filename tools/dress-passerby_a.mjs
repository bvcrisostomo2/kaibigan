// Passerby A: a mestizo townsman out walking in a long barong of fine cloth with an embroidered front,
// dark trousers and a dark felt hat, his hair and beard black. Body and head: Male 13 (.packs/male13); his blue robe
// becomes the barong, its orange collar and front the embroidered panel's ground, his grey sash dark,
// his trousers dark, his brown hair black. Changes beyond colour: a dark felt hat (the boater's shape
// in felt), the barong's embroidered front, its collar band, the yoke and back seams, the sash's tails
// and the side slit. Painted over a kitbash composite (tools/kitbash.mjs); built by:
// node tools/build-sets.mjs passerby_a
import { wear } from './parts.mjs';
import { BOATER } from './parts/boater.mjs';

const FELT = { o: '#140e0a', y: '#4a3a2e', Y: '#6a5a4a', k: '#3a2c22', b: '#1a1410' };
const SAME_PACK = { bodyFrom: 21, headTo: 20, dx: 0 };
const SKIN = '#d9a37a';
const BARONG = ['#fbf6ea', '#f0e8d4', '#d6ccb2', '#b0a68c', '#7e7562'];

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  bodyRecolor: {
    // blue robe → barong
    '#2979de': BARONG[0], '#185db5': BARONG[1], '#083873': BARONG[2], '#08244a': BARONG[3],
    // orange collar and front → the panel's ground, a shade warmer
    '#ce7110': '#f6ecd4', '#a55100': '#e6d8b8', '#843c00': '#c8b894', '#632c00': '#a49470', '#391800': '#6e6450',
    // grey sash → dark
    '#c6cbce': '#6a6a7a', '#adaaad': '#5a5a6a', '#737573': '#46465a', '#52514a': '#3a3a4a', '#313431': '#2a2a36', '#212021': '#1c1c26',
    // trousers → dark
    '#843829': '#4a4a5a', '#5a2418': '#3a3a4a', '#391408': '#26262e',
    // shoes → dark brown
    '#7b5108': '#4a3424', '#633c00': '#2a1c16', '#392000': '#1a120c',
  },
  recolor: {
    // brown hair and beard → black
    '#734d29': '#4a3e42', '#4a3018': '#2a2224', '#291808': '#1d1615', '#100800': '#0a0708', '#4a3c00': '#2a2224',
    // skin → mestizo
    '#ffdfb5': '#ecc49a', '#f79e5a': SKIN, '#b54921': '#a8704a',
  },
  // The barong's embroidered front in a lattice and its collar band (e), the shoulder yoke's seam and
  // the back seam (s); in profile the sash's hanging tails (q) and the side slit (s).
  palette: { e: '#b4a888', s: '#c8bea4', q: '#2a2a36' },
  views: {
    front: [
      { at: [21, 28], rows: ['e....e', '.e..e.', '..ee..', '.e..e.', 'e....e', 'e....e', '.e..e.', '..ee..', '.e..e.', 'e....e'] },
      { at: [19, 27], rows: ['eeeeeeeeee'] },
    ],
    right: [
      { at: [22, 28], rows: ['e.e', '.e.', 'e.e', '.e.', 'e.e', '.e.', 'e.e', '.e.', 'e.e', '.e.'] },
      { at: [19, 27], rows: ['eeeee'] },
      { at: [15, 31], rows: ['ssssssss'] },
      { at: [22, 41], rows: ['q', 'q', 'q', 'q'] },
      { at: [14, 46], rows: ['s', 's', 's', 's'] },
    ],
    back: [
      { at: [15, 31], rows: ['sssssssssssssssss'] },
      { at: [23, 33], rows: ['s', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's'] },
    ],
  },
  wear: [wear(BOATER, { front: [16, 10], right: [15, 10], back: [16, 10] }, FELT)],
  changes: ['dark felt hat', 'embroidered barong front', 'collar band', 'shoulder yoke and back seam', 'sash tails and side slit in profile'],
};
