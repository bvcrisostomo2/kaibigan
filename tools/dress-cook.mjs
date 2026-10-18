// The cook (kusinera): an older woman of the household in a plain camisa, a dark checked saya and a
// work tapis, her greying hair under a red headscarf, stirring a pot with a wooden ladle. Body and
// head: Female 09 (.packs/female09); her gold wrap becomes the camisa above the waist and the
// checked saya below it, her white apron the dark tapis. Changes beyond colour: the headscarf, the
// waist tie, the tapis drawn as a wrap (its edge and stripes), the ladle. Painted over a kitbash composite (tools/kitbash.mjs); built by:
// node tools/build-sets.mjs cook
import { wear } from './parts.mjs';
import { HEADSCARF } from './parts/headscarf.mjs';
import { LADLE } from './parts/ladle.mjs';

const SAME_PACK = { bodyFrom: 20, headTo: 19, dx: 0 };
const GOLD = ['#ffd373', '#e7b652', '#bd9231', '#845910', '#523408', '#311c00'];
const shades = (to) => Object.fromEntries(GOLD.map((c, i) => [c, to[i]]));
const CAMISA = ['#f4eee0', '#e2d9c4', '#c9bea6', '#a69a80', '#7a705c', '#4e4638'];
const SAYA = ['#7a7890', '#64627a', '#4c4a5e', '#3b3a4a', '#2c2b38', '#1c1b24'];
const STRIPE = ['#9896ae', '#828098', '#6a6880', '#56546a', '#42405a', '#2a2934'];
const APRON = ['#efebef', '#cecbc6', '#ada2a5', '#7b716b', '#4a4142'];
const TAPIS = ['#5a5660', '#4a4650', '#3a3640', '#2c2a30', '#1c1a20'];
const WAIST = 43; // output row: the wrap's sash

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  // Below the waist the wrap is the saya, checked in stripes two pixels wide, and the apron is the
  // tapis; above it, both are the camisa.
  zones: [
    { fromRow: WAIST, map: {}, stripes: { width: 2, maps: [shades(SAYA), shades(STRIPE)] } },
    { fromRow: WAIST, map: Object.fromEntries(APRON.map((c, i) => [c, TAPIS[i]])) },
  ],
  bodyRecolor: {
    ...shades(CAMISA),
    // the apron's bib → camisa; the sash shadow → tapis
    '#efebef': CAMISA[0], '#cecbc6': CAMISA[1], '#ada2a5': CAMISA[2], '#7b716b': CAMISA[3], '#4a4142': CAMISA[4], '#290800': '#1c1a20',
  },
  recolor: {
    // brown hair → greying
    '#9c6d42': '#8a827a', '#734d29': '#6a625a', '#4a3018': '#4e4842', '#291808': '#36302c', '#291400': '#36302c', '#100800': '#1e1a18',
    // skin → morena
    '#ffdfb5': '#dba57c', '#f79e5a': '#c68b5e', '#b54921': '#94603c', '#8c4531': '#74462a',
    // blue eyes → dark brown
    '#2961a5': '#5a3a28', '#312494': '#2e1c12',
  },
  // A red tie at the waist knotted at the hip (k, K), and the tapis drawn as a wrap: its overlapping
  // edge running down from the waist (e) and two woven stripes across it (t).
  palette: { k: '#8a3a2a', K: '#5e2418', e: '#7a7482', t: '#7a7484' },
  views: {
    front: [{ at: [20, 43], rows: [
      'kkkkkkkkkkk',
      '..e......KK',
      '...e.....kK',
      '....e....K.',
      'tttttettttt',
      '......e....',
      '.......e...',
      'tttttttteKt',
      '.........e.',
      '..........e',
    ] }],
    right: [{ at: [21, 43], rows: [
      'kkkkkkkkkk',
      'KK.....e..',
      'Kk......e.',
      '.K.......e',
      'tttttttttt',
      '..........',
      '..........',
      'tttttttttt',
    ] }],
    back: [{ at: [20, 43], rows: [
      'kkkkkkkkkkk',
      '....KkK....',
      '....kKk....',
      '.....K.....',
      'ttttttttttt',
      '...........',
      '...........',
      'ttttttttttt',
    ] }],
  },
  wear: [wear(HEADSCARF, { front: [17, 12], right: [14, 12], back: [17, 12] })],
  activities: {
    stir: { prop: LADLE, at: { front: [20, 42], right: [24, 42] }, palette: { h: '#c68b5e' } },
  },
  changes: ['headscarf with checked weave, fold and knot', 'waist tie knotted at the hip', 'tapis drawn as a wrap with woven stripes', 'ladle'],
};
