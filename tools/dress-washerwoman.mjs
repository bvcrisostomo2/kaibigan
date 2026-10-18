// The washerwoman (labandera): at the river steps in a plain camisa, a maroon striped saya under a
// dark tapis, her hair gathered under a blue headscarf; she beats the laundry with a palo-palo on a
// stone. Body and head: Female 07 (.packs/female07); her gold wrap becomes the camisa, her green
// skirt the saya, her brown hair dark. Changes beyond colour: the headscarf (checked, knotted at the
// nape), the tapis painted as a wrap with its edge and stripes, the waist tie, the palo-palo, the
// cloth and the stone. Painted over a kitbash composite (tools/kitbash.mjs); built by:
// node tools/build-sets.mjs washerwoman
import { wear } from './parts.mjs';
import { HEADSCARF } from './parts/headscarf.mjs';
import { PALO_PALO } from './parts/palo-palo.mjs';

const SAME_PACK = { bodyFrom: 25, headTo: 24, dx: 0 };
const SKIN = '#c68b5e';
const map = (from, to) => Object.fromEntries(from.map((c, i) => [c, to[i]]));
const GOLD = ['#ce9618', '#ad7500', '#8c6100', '#734d00', '#523400', '#312000'];
const COLLAR = ['#cecbce', '#a5a2a5', '#7b797b', '#4a4d4a', '#424139', '#313031'];
const CAMISA = ['#f4ecd8', '#e4dac4', '#c8bea6', '#a49a82', '#7a705c', '#4e4638'];
const GREEN = ['#428e5a', '#216939', '#185529', '#104921', '#103c21', '#102010'];
const SAYA = ['#7a5050', '#5a3a3a', '#4a2e2e', '#3e2626', '#2e1c1c', '#1c1010'];
const STRIPE = ['#d8c8b0', '#b8a68c', '#4a2e2e', '#3e2626', '#2e1c1c', '#1c1010'];

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  zones: [{ fromRow: 0, map: {}, stripes: { width: 2, maps: [map(GREEN, SAYA), map(GREEN, STRIPE)] } }],
  bodyRecolor: { ...map(GOLD, CAMISA), ...map(COLLAR, CAMISA) },
  recolor: {
    // brown hair → dark brown
    '#945929': '#4a3a30', '#6b3c18': '#33281f', '#4a2808': '#2a1e18', '#311c08': '#1e1612', '#180c00': '#100a08', '#291400': '#1e1612', '#633410': '#33281f', '#292421': '#1e1612',
    // skin → morena
    '#ffdfb5': '#dba57c', '#f79e5a': SKIN, '#b54921': '#94603c', '#b54d21': '#94603c',
  },
  // The tapis painted over the saya (T, its woven stripes t, its overlapping edge e, o its outline)
  // under a waist tie (k).
  palette: { k: '#4a3e34', T: '#2a2420', t: '#463c34', e: '#5a4e44', o: '#120e0c' },
  views: {
    front: [{ at: [16, 49], rows: ['kkkkkkkkkkkkkkkkk', '.oTTeTTTTTTTTTTo.', '.oTTTeTTTTTTTTTo.', '.ottttetttttttto.', '.oTTTTTeTTTTTTTo.', '.oTTTTTTeTTTTTTo.', '.ooooooooooooooo.'] }],
    right: [{ at: [15, 49], rows: ['kkkkkkkkkkkkkkk', '.oTTTTTTTTTTTo.', '.oTTTTTTTTTTTo.', '.ottttttttttto.', '.oTTTTTTTTTTTo.', '.oTTTTTTTTTTTo.', '.ooooooooooooo.'] }],
    back: [{ at: [16, 49], rows: ['kkkkkkkkkkkkkkkkk', '.oTTTTTTTTTTTTTo.', '.oTTTTTTTTTTTTTo.', '.ottttttttttttto.', '.oTTTTTTTTTTTTTo.', '.oTTTTTTTTTTTTTo.', '.ooooooooooooooo.'] }],
  },
  wear: [wear(HEADSCARF, { front: [17, 14], right: [13, 14], back: [17, 14] }, { s: '#5a7a9a', h: '#7a9aba', d: '#3a5470', p: '#a8bccb' })],
  activities: {
    wash: { prop: PALO_PALO, at: { front: [22, 44], right: [24, 44] }, palette: { h: SKIN } },
  },
  changes: ['blue checked headscarf knotted at the nape', 'tapis painted as a wrap with its edge and woven stripes', 'waist tie', 'palo-palo, cloth and stone'],
};
