// The maid (criada): the same baro't saya as Tía Isabel's in cheap cloth (a plain camisa, a saya in
// faded stripes, a small dark tapis tied at the waist), her black hair in a low bun; she chops, dusts and sweeps. Body and
// head: Waiter 01 (.packs/waiter01); her black dress becomes the camisa above the waist and the
// striped saya below it, her apron's bib the camisa and its skirt the tapis, her blue-grey hair
// black. Changes beyond colour: the crown combed back over Waiter 01's headband and a low bun at the nape
// with a wooden pin, the waist tie and its tails, the tapis drawn as a wrap, the knife, the duster,
// the broom. Painted over a kitbash composite (tools/kitbash.mjs); built by:
// node tools/build-sets.mjs maid
import { wear } from './parts.mjs';
import { BUN } from './parts/bun.mjs';
import { KNIFE } from './parts/knife.mjs';
import { DUSTER } from './parts/duster.mjs';
import { BROOM } from './parts/broom.mjs';

const SAME_PACK = { bodyFrom: 20, headTo: 19, dx: 0 };
const SKIN = '#c68b5e';
const DRESS = ['#7b8284', '#5a5d5a', '#424542', '#313431', '#181c18'];
const APRON = ['#ffffff', '#dedbde', '#bdbebd', '#9c9a9c', '#7b797b', '#525552'];
const CAMISA = ['#f6f0e2', '#ebe4d2', '#d4cbb6', '#b4a990', '#857b66', '#5a5244'];
const SAYA = ['#8e7e6c', '#7a6a5a', '#62544a', '#4c4036', '#2e2620'];
const STRIPE = ['#76685a', '#5e5044', '#4a3e34', '#382e26', '#221c16'];
const TAPIS = ['#5e5650', '#4c4540', '#3a3430', '#2c2724', '#201c1a', '#16120f'];
const map = (from, to) => Object.fromEntries(from.map((c, i) => [c, to[i]]));
const WAIST = 46; // output row: where the apron's skirt begins

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  zones: [
    { fromRow: WAIST, map: {}, stripes: { width: 2, maps: [map(DRESS, SAYA), map(DRESS, STRIPE)] } },
    { fromRow: WAIST, map: map(APRON, TAPIS) },
  ],
  bodyRecolor: { ...map(DRESS, CAMISA.slice(1)), ...map(APRON, CAMISA) },
  recolor: {
    // blue-grey hair → black
    '#8492ad': '#4a3e40', '#6b7184': '#3a3034', '#4a556b': '#2e2628', '#425163': '#2a2224', '#394152': '#221c1d', '#293039': '#1a1516', '#182029': '#110d0e',
    // skin → morena
    '#ffdfb5': '#dba57c', '#f79e5a': SKIN, '#b54921': '#94603c',
    // green eyes → dark brown
    '#42825a': '#5a3a28',
    // what is left of the white headband at the temples → hair (the apron's greys are recoloured
    // on the body before this runs, so only the head still has them)
    '#ffffff': '#4a3e40', '#dedbde': '#3a3034', '#bdbebd': '#2e2628', '#9c9a9c': '#2a2224', '#8c8a8c': '#2a2224', '#7b797b': '#221c1d', '#525552': '#1a1516',
  },
  // A dark tie at the waist knotted at the hip (k, K), its tails hanging at the back, and the tapis
  // drawn as a wrap: its overlapping edge (e) and two woven stripes (t).
  palette: { k: '#5a4636', K: '#2c221a', e: '#6e6660', t: '#5e5650' },
  views: {
    front: [{ at: [19, 46], rows: [
      'kkkkkkkkkkkkk',
      '..e.......KK.',
      '...e......kK.',
      '.ttttettttKt.',
      '.....e.......',
      '......e......',
      '.tttttttettt.',
      '........e....',
    ] }],
    right: [{ at: [18, 46], rows: [
      'kkkkkkkkkkkkk',
      'KK......e....',
      'kK.......e...',
      '.Kttttttttt..',
      '.............',
      '.............',
      '...tttttttt..',
    ] }],
    back: [{ at: [18, 46], rows: [
      'kkkkkkkkkkkkkkk',
      '......KkK......',
      '......kKk......',
      '......K.K......',
      '......k.k......',
      '......K.K......',
      '.......k.......',
    ] }],
  },
  wear: [wear(BUN, { front: [18, 12], right: [18, 12], back: [18, 12] })],
  activities: {
    chop: { prop: KNIFE, at: { front: [20, 44], right: [26, 44] }, palette: { h: SKIN } },
    dust: { prop: DUSTER, at: { front: [30, 30], right: [28, 30] }, palette: { h: SKIN } },
    sweep: { prop: BROOM, at: { front: [6, 27], right: [20, 27] }, palette: { h: SKIN } },
  },
  changes: ['crown combed back over the headband', 'low bun with a wooden pin', 'waist tie with its tails', 'tapis drawn as a wrap with woven stripes', 'knife', 'duster', 'broom'],
};
