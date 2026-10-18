// Lady A: a guest at Capitan Tiago's dinner in baro't saya: a sheer camisa, a cream pañuelo folded
// over her shoulders with an embroidered edge, a dark tapis over a green striped saya, her black hair
// in a low bun with a tortoiseshell peineta; she fans herself. Body and head: Female 11
// (.packs/female11); her orange bodice becomes the pañuelo, her orange overskirt the tapis, her white
// underskirt the saya, her brown hair black. Changes beyond colour: the crown combed back into a low
// bun, the peineta, the pañuelo's embroidered edge, the waist tie, the tapis drawn as a wrap, the fan.
// Painted over a kitbash composite (tools/kitbash.mjs); built by: node tools/build-sets.mjs lady_a
import { wear } from './parts.mjs';
import { BUN } from './parts/bun.mjs';
import { PEINETA } from './parts/peineta.mjs';
import { FAN } from './parts/fan.mjs';

const SAME_PACK = { bodyFrom: 24, headTo: 23, dx: 0 };
const SKIN = '#d9a37a'; // mestiza
const ORANGE = ['#ff8e08', '#d66518', '#a54d18', '#6b3410', '#391c10'];
const WHITE = ['#ffebce', '#cec3bd', '#8c7d73', '#523831'];
const map = (from, to) => Object.fromEntries(from.map((c, i) => [c, to[i]]));
const PANUELO = ['#f6eedc', '#efe2c4', '#d4c4a0', '#a89874', '#6e624a'];
const CAMISA = ['#f8f4ec', '#e4dccc', '#b4aa98', '#6e6658'];
const TAPIS = ['#3a4a46', '#2a3836', '#1e2a28', '#142020', '#0c1414'];
const SAYA = ['#3e8470', '#2f6a5a', '#245448', '#1a3e36'];
const STRIPE = ['#e8dcb8', '#c8bc98', '#245448', '#1a3e36'];
const WAIST = 42; // output row: the bodice ends, the overskirt begins
const HEM = 55; // output row: the overskirt ends, the underskirt shows

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  zones: [
    { fromRow: WAIST, map: map(ORANGE, TAPIS) },
    { fromRow: HEM, map: {}, stripes: { width: 2, maps: [map(WHITE, SAYA), map(WHITE, STRIPE)] } },
  ],
  bodyRecolor: { ...map(ORANGE, PANUELO), ...map(WHITE, CAMISA) },
  recolor: {
    // brown hair → black
    '#b58e6b': '#4a3e42', '#7b5542': '#33292c', '#5a3821': '#241c1e', '#392421': '#1a1415', '#211c08': '#0e0a0b', '#312821': '#1a1415', '#292018': '#141011', '#311c08': '#141011',
    // skin → mestiza
    '#ffdfb5': '#ecc49a', '#f79e5a': SKIN, '#b54921': '#a8704a',
  },
  // The pañuelo's embroidered edge (e) in a V down the chest, its brooch (b), and on the back its
  // point (p, P) over the hair Female 11 wore down her back; a waist tie (k, K) knotted at the hip; the tapis drawn as a wrap with its edge (E) and
  // two woven stripes (t).
  palette: { p: '#efe2c4', P: '#d4c4a0', e: '#b89a5a', b: '#e0b848', k: '#4a5a56', K: '#1e2a28', E: '#6a7e78', t: '#52665f' },
  views: {
    front: [
      { at: [19, 32], rows: ['e..........e', '.e........e.', '..e......e..', '...e....e...', '....e..e....', '.....bb.....'] },
      { at: [19, 43], rows: [
        'kkkkkkkkkkkkk',
        '..E.......KK.',
        '...E......kK.',
        'ttttEttttttt.',
        '.....E.......',
        '......E......',
        'tttttttEtttt.',
        '........E....',
        '.........E...',
      ] },
    ],
    right: [
      { at: [21, 32], rows: ['e..', '.e.', '.e.', '..e', '..e', '..b'] },
      { at: [21, 43], rows: ['kkkkkkkkkk', 'KK......E.', 'kK.......E', 'tttttttttt', '..........', '..........', 'tttttttttt'] },
    ],
    back: [
      { at: [21, 30], rows: ['ppppppppp', 'pppppppPp', '.pppppPp.', '.ppppPpp.', '..ppPpp..', '..pPppp..', '...ppp...', '...pPp...', '....p....'] },
      { at: [19, 32], rows: ['e..........e', '.e........e.', '..e......e..', '...e....e...', '....e..e....', '.....ee.....'] },
      { at: [19, 42], rows: ['kkkkkkkkkkkk', '.....KkK....', '.....kKk....', '.....K.K....', 'tttttttttttt', '.....k.k....', '......K.....', '............', 'tttttttttttt'] },
    ],
  },
  wear: [
    wear(BUN, { front: [16, 14], right: [17, 14], back: [16, 14] }),
    wear(PEINETA, { front: [19, 13], right: [15, 14], back: [19, 14] }),
  ],
  activities: {
    fan: { prop: FAN, at: { front: [28, 30], right: [26, 30] }, palette: { y: '#e8c06a', h: SKIN } },
  },
  changes: ['crown combed back into a low bun', 'tortoiseshell peineta', 'embroidered pañuelo edge and brooch', 'waist tie', 'tapis drawn as a wrap with woven stripes', 'fan'],
};
