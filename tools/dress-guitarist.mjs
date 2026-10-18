// The guitarist: a musician hired for the dinner, in a barong of sheer cloth with an embroidered
// front, a red kerchief at his neck, dark trousers and shoes, his hair black; he strums a guitar.
// Body and head: Male 09 (.packs/male09); his orange shirt becomes the barong, his blue trousers
// dark, his hair black. Changes beyond colour: the barong's embroidered front, the neck
// kerchief, the hem's side slits, the guitar. Painted over a kitbash composite (tools/kitbash.mjs);
// built by: node tools/build-sets.mjs guitarist
import { GUITAR } from './parts/guitar.mjs';

const SAME_PACK = { bodyFrom: 21, headTo: 20, dx: 0 };
const SKIN = '#c68b5e';
const BARONG = ['#fbf7ea', '#efe7d0', '#d6ccb2', '#b0a68c', '#7e7562'];

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  bodyRecolor: {
    // orange shirt → barong
    '#ffb24a': BARONG[0], '#ef9618': BARONG[1], '#d66d00': BARONG[2], '#a54100': BARONG[3], '#632c00': BARONG[4], '#522010': BARONG[4],
    // green sleeves → the barong's
    '#efef9c': BARONG[0], '#ced76b': BARONG[1], '#c6cb63': BARONG[1], '#a5ae4a': BARONG[2], '#737d31': BARONG[3], '#636d31': BARONG[3], '#4a5118': BARONG[4], '#182c08': BARONG[4], '#081c00': '#3a3428',
    // blue trousers → dark
    '#4a82b5': '#4a4a56', '#29598c': '#3a3a44', '#183c63': '#2a2a32', '#101c4a': '#1e1e26', '#081031': '#141418',
    // shoes → dark brown
    '#bd7121': '#5a4030', '#8c4d18': '#3e2c22', '#633810': '#2a1c16', '#392008': '#1c120e',
  },
  recolor: {
    // auburn hair → black
    '#ce7521': '#4a3e42', '#a55910': '#3a3034', '#7b3c00': '#2a2224', '#522000': '#1d1615', '#291000': '#0e0a0b',
    // skin → morena
    '#ffdfb5': '#dba57c', '#f79e5a': SKIN, '#b54921': '#94603c', '#8c3421': '#74462a',
  },
  // The barong's embroidered front panel in a lattice (e), a red kerchief knotted at the neck (r, R),
  // the shoulder yoke's seam, and at the back the barong's hem with its side slits (e).
  palette: { e: '#b4a888', r: '#a83a2a', R: '#6a2218' },
  views: {
    front: [
      { at: [22, 30], rows: ['e....e', '.e..e.', '..ee..', '.e..e.', 'e....e', 'e....e', '.e..e.', '..ee..', '.e..e.', 'e....e', 'e....e', '.e..e.', '..ee..', '.e..e.', 'e....e'] },
      { at: [20, 27], rows: ['rrrrrrrrrr', '....RR....', '...R..R...'] },
    ],
    right: [
      { at: [23, 30], rows: ['e.e', '.e.', 'e.e', '.e.', 'e.e', '.e.', 'e.e', '.e.', 'e.e', '.e.', 'e.e', '.e.', 'e.e', '.e.', 'e.e'] },
      { at: [16, 31], rows: ['eeeeeee'] },
      { at: [19, 27], rows: ['rrrrrrr', '.....RR', '....R.R'] },
      { at: [16, 45], rows: ['eeeeeeee'] },
    ],
    back: [
      { at: [20, 27], rows: ['rrrrrrrrrr'] },
      { at: [17, 31], rows: ['eeeeeeeeeeeeeeee'] },
      { at: [16, 43], rows: ['e................e', 'e................e', 'eeeeeeeeeeeeeeeeee'] },
    ],
  },
  activities: {
    strum: { prop: GUITAR, at: { front: [16, 33], right: [17, 33] }, palette: { h: SKIN } },
  },
  changes: ['embroidered barong front', 'red neck kerchief', 'shoulder yoke seam', 'barong hem with side slits', 'guitar'],
};
