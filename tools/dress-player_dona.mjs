// The player as Doña: a young Filipina in baro't saya: a sheer camisa with stiff butterfly sleeves, a
// cream pañuelo over her shoulders, a dark tapis over a blue striped saya, her black hair in a low bun
// with a wooden pin. Body and head: Female 02 (.packs/female02); her red bodice and grey sleeves become
// the camisa, her red skirt the saya, her white apron the tapis, her blonde hair black. Changes beyond
// colour: the butterfly sleeves' stiff puffs, the pañuelo, the saya lengthened to the floor, the
// tapis's edge and tie, the crown combed back into a low bun. Painted over a kitbash composite
// (tools/kitbash.mjs); built by: node tools/build-sets.mjs player_dona
import { wear } from './parts.mjs';
import { BUN } from './parts/bun.mjs';
import { ramp } from './ramp.mjs';

const SAME_PACK = { bodyFrom: 25, headTo: 24, dx: 0 };
const SKIN = '#c68b5e';
const map = (from, to) => Object.fromEntries(from.map((c, i) => [c, to[i]]));
const RED = ['#ff6d4a', '#ce4531', '#9c3021', '#5a2418', '#290800'];
const CAMISA = ['#fbf6ea', '#f1ead8', '#d6ccb4', '#a89e88', '#6e6656'];
const SAYA = ['#5a76a8', '#3d5a8a', '#31497a', '#24365e', '#16223e'];
const STRIPE = ['#d8d0bc', '#bcb4a0', '#31497a', '#24365e', '#16223e'];
const WAIST = 40; // output row: the bodice ends, the saya begins

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  zones: [{ fromRow: WAIST, map: {}, stripes: { width: 2, maps: [map(RED, SAYA), map(RED, STRIPE)] } }],
  bodyRecolor: {
    ...map(RED, CAMISA),
    // grey sleeves → the camisa's
    ...ramp(['#bdbeb5', '#949a8c', '#6b7563', '#4a494a', '#393839', '#292c29'], ['#f1ead8', '#d6ccb4', '#bab098', '#a89e88', '#6e6656', '#4a4438']),
    // white apron → dark tapis
    ...ramp(['#efebef', '#cecbc6', '#ada2a5', '#a59a94', '#7b716b', '#4a4142'], ['#4a4c66', '#3a3c54', '#2e3048', '#2e3048', '#24263a', '#16182a']),
  },
  recolor: {
    // blonde hair → black
    ...ramp(['#fffbd6', '#f7d763', '#e7be39', '#d6aa42', '#a57910', '#846118', '#735108', '#4a3000', '#291400'], ['#5a4e52', '#4a3e42', '#3a3034', '#33292c', '#2a2224', '#241c1e', '#1d1615', '#140f10', '#0a0708']),
    // green eyes → brown
    '#297d63': '#4a2e1c',
    // skin → morena
    '#ffdfb5': '#dba57c', '#f79e5a': SKIN, '#b54921': '#94603c',
  },
  // The saya lengthened to the floor in its stripes (s, S; o its hem), a cream pañuelo over her
  // shoulders (p, P its fold, e its edge), the butterfly sleeves' stiff puffs of sheer piña (v, V), the
  // tapis's tie (k) and its overlapping edge (E).
  palette: { o: '#0e1424', s: '#3d5a8a', S: '#d8d0bc', p: '#e6d6ad', P: '#c8b88e', e: '#9a8a62', v: '#fbf6ea', V: '#d6ccb4', k: '#16182a', E: '#5a5c76' },
  views: {
    front: [
      { at: [16, 58], rows: ['.ossSSssSSssSSso.', '.ossSSssSSssSSso.', 'ossSSssSSssSSssSo', 'ossSSssSSssSSssSo', 'ossSSssSSssSSssSo', 'ooooooooooooooooo'] },
      { at: [17, 30], rows: ['eppppppppppppe', '.epppPPpppppe.', '..eppPppppe...', '...eppPppe....', '....eppPe.....', '.....eee......'] },
      { at: [15, 30], rows: ['..vv', '.vVv', 'vVVv', '.vVv', '..vv'] },
      { at: [29, 30], rows: ['vv..', 'vVv.', 'vVVv', 'vVv.', 'vv..'] },
      { at: [17, 40], rows: ['kkkkkkkkkkkkkk', '...E..........', '....E.........', '.....E........', '......E.......', '.......E......'] },
    ],
    right: [
      { at: [12, 58], rows: ['.ossSSssSSssSo.', '.ossSSssSSssSo.', 'ossSSssSSssSSso', 'ossSSssSSssSSso', 'ossSSssSSssSSso', 'ooooooooooooooo'] },
      { at: [15, 31], rows: ['epppppppppe', '.eppPPpppe.', '..epppPpe..', '...eeeee...'] },
      { at: [15, 31], rows: ['.vv', 'vVv', 'vVV', 'vVv', '.vv'] },
      { at: [16, 41], rows: ['kkkkkkkkkk'] },
    ],
    back: [
      { at: [16, 58], rows: ['.ossSSssSSssSSso.', '.ossSSssSSssSSso.', 'ossSSssSSssSSssSo', 'ossSSssSSssSSssSo', 'ossSSssSSssSSssSo', 'ooooooooooooooooo'] },
      { at: [17, 32], rows: ['eppppppppppppe', '.epppPpppPppe.', '..epppPPpppe..', '...eppPPppe...', '....eppPpe....', '.....epPe.....', '......ee......'] },
      { at: [15, 33], rows: ['..vv', '.vVv', 'vVVv', '.vVv', '..vv'] },
      { at: [29, 33], rows: ['vv..', 'vVv.', 'vVVv', 'vVv.', 'vv..'] },
    ],
  },
  wear: [wear(BUN, { front: [17, 14], right: [16, 15], back: [17, 15] })],
  changes: ['butterfly sleeves', 'pañuelo over the shoulders', 'saya lengthened to the floor', 'tapis tie and edge', 'crown combed back into a low bun with a wooden pin'],
};
