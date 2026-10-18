// Passerby B: a townswoman stopping to gossip on Calle Anloague, in a camisa, a cream pañuelo over
// her shoulders, a dark tapis over a purple striped saya that reaches the floor, her black hair in a
// low bun; she chats. Body and head: Female 03 (.packs/female03); her yellow blouse and white collar
// become the camisa, her light blue skirt the saya, her orange-brown hair black. Changes beyond
// colour: the pañuelo, the tapis painted as a wrap with its tie, the saya lengthened to the floor, the
// crown combed back into a low bun with a wooden pin, the chat from her pack's talking animation.
// Painted over a kitbash composite (tools/kitbash.mjs); built by: node tools/build-sets.mjs passerby_b
import { wear } from './parts.mjs';
import { BUN } from './parts/bun.mjs';

const SAME_PACK = { bodyFrom: 25, headTo: 24, dx: 0 };
const SKIN = '#c68b5e';
const map = (from, to) => Object.fromEntries(from.map((c, i) => [c, to[i]]));
const YELLOW = ['#ffe700', '#dec700', '#bdaa08', '#8c7d18', '#5a5929'];
const COLLAR = ['#efefef', '#cecfce', '#adaaa5', '#7b7d7b', '#4a4942'];
const CAMISA = ['#faf4e6', '#efe8d6', '#d4ccb6', '#aaa28c', '#6e6858'];
const BLUE = ['#8cdbff', '#6bbee7', '#52aace', '#4a96b5', '#31718c', '#21556b', '#183c4a'];
const SAYA = ['#7a6aa0', '#6a5a8e', '#5a4a7a', '#4e406c', '#463a60', '#342a48', '#221a30'];
const STRIPE = ['#d8ccb4', '#c4b89c', '#5a4a7a', '#4e406c', '#463a60', '#342a48', '#221a30'];

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  zones: [{ fromRow: 0, map: {}, stripes: { width: 2, maps: [map(BLUE, SAYA), map(BLUE, STRIPE)] } }],
  bodyRecolor: { ...map(YELLOW, CAMISA), ...map(COLLAR, CAMISA), '#290800': '#22202a' },
  recolor: {
    // orange-brown hair → black
    '#ffaa39': '#4a3e42', '#d68a21': '#3a3034', '#ad6d21': '#2a2224', '#945d10': '#1d1615', '#735118': '#120e0f',
    // green eyes → brown
    '#52e300': '#4a2e1c',
    // skin → morena
    '#ffdfb5': '#dba57c', '#f79e5a': SKIN, '#b54921': '#94603c',
  },
  // The saya lengthened to the floor in its stripes (s, S; o its hem), a cream pañuelo over her
  // shoulders (p, P its fold, e its edge), and a knee-length tapis (T, its stripe t, its edge E, O its
  // outline) under a waist tie (k).
  palette: { o: '#16101e', s: '#5a4a7a', S: '#d8ccb4', p: '#e8dcc0', P: '#c8b894', e: '#a08e68', T: '#22202a', t: '#3a3646', E: '#4a4658', O: '#0e0c12', k: '#3a3646' },
  views: {
    front: [
      { at: [16, 58], rows: ['.ossSSssSSssSSso.', '.ossSSssSSssSSso.', 'ossSSssSSssSSssSo', 'ossSSssSSssSSssSo', 'ossSSssSSssSSssSo', 'ooooooooooooooooo'] },
      { at: [17, 30], rows: ['eppppppppppppe', '.epppPPpppppe.', '..eppPppppe...', '...eppPppe....', '....eppPe.....', '.....eee......'] },
      { at: [16, 45], rows: ['kkkkkkkkkkkkkkkkk', '.OTTETTTTTTTTTTO.', '.OTTTETTTTTTTTTO.', '.OttttEttttttttO.', '.OTTTTTETTTTTTTO.', '.OTTTTTTETTTTTTO.', '.OOOOOOOOOOOOOOO.'] },
    ],
    right: [
      { at: [13, 58], rows: ['.ossSSssSSssSo.', '.ossSSssSSssSo.', 'ossSSssSSssSSso', 'ossSSssSSssSSso', 'ossSSssSSssSSso', 'ooooooooooooooo'] },
      { at: [15, 31], rows: ['epppppppppe', '.eppPPpppe.', '..epppPpe..', '...eeeee...'] },
      { at: [15, 45], rows: ['kkkkkkkkkkkkkkk', '.OTTTTTTTTTTTO.', '.OTTTTTTTTTTTO.', '.OtttttttttttO.', '.OTTTTTTTTTTTO.', '.OTTTTTTTTTTTO.', '.OOOOOOOOOOOOO.'] },
    ],
    back: [
      { at: [16, 58], rows: ['.ossSSssSSssSSso.', '.ossSSssSSssSSso.', 'ossSSssSSssSSssSo', 'ossSSssSSssSSssSo', 'ossSSssSSssSSssSo', 'ooooooooooooooooo'] },
      { at: [17, 32], rows: ['eppppppppppppe', '.epppPpppPppe.', '..epppPPpppe..', '...eppPPppe...', '....eppPpe....', '.....epPe.....', '......ee......'] },
      { at: [16, 45], rows: ['kkkkkkkkkkkkkkkkk', '.OTTTTTTTTTTTTTO.', '.OTTTTTTTTTTTTTO.', '.OtttttttttttttO.', '.OTTTTTTTTTTTTTO.', '.OTTTTTTTTTTTTTO.', '.OOOOOOOOOOOOOOO.'] },
    ],
  },
  wear: [wear(BUN, { front: [17, 14], right: [16, 15], back: [17, 14] })],
  activities: {
    chat: { source: { right: 'talk_right' }, nod: { front: 29 } },
  },
  changes: ['pañuelo over the shoulders', 'tapis painted as a wrap with its tie', 'saya lengthened to the floor', 'crown combed back into a low bun with a wooden pin', 'chat'],
};
