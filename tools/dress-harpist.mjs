// The harpist: a musician hired for the dinner, in a plain camisa, a cream pañuelo over her
// shoulders and a dark striped saya, her black hair in a low bun; she plays a standing harp. Body and
// head: Female 02c (.packs/female02c); her green dress becomes the camisa above the waist and the
// saya below it, her grey sleeves the camisa's, her lavender apron part of the saya, her pink hair
// black. Changes beyond colour: the pañuelo, the crown combed back into a low bun with a wooden pin,
// the waist tie, the harp. Painted over a kitbash composite (tools/kitbash.mjs); built by:
// node tools/build-sets.mjs harpist
import { wear } from './parts.mjs';
import { BUN } from './parts/bun.mjs';
import { HARP } from './parts/harp.mjs';

const SAME_PACK = { bodyFrom: 24, headTo: 23, dx: 0 };
const SKIN = '#c68b5e';
const map = (from, to) => Object.fromEntries(from.map((c, i) => [c, to[i]]));
const GREEN = ['#4afb52', '#42cf31', '#299a21', '#185918', '#002800'];
const SLEEVE = ['#bdbeb5', '#949a8c', '#6b7563', '#4a494a', '#393839', '#292c29'];
const APRON = ['#e7c7ef', '#b596ce', '#9469bd', '#5a417b', '#291442'];
const CAMISA = ['#fbf7ec', '#f1ead8', '#d6ccb4', '#a89e88', '#6e6656', '#4a4438'];
const SAYA = ['#5a5a5a', '#4a4a4a', '#3a3a3a', '#2a2a2a', '#1a1a1a'];
const STRIPE = ['#6e6a62', '#5a5650', '#2a2a2a', '#1e1e1e', '#121212'];

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  zones: [{ fromRow: 46, map: {}, stripes: { width: 2, maps: [map([...GREEN, ...APRON], [...SAYA, ...SAYA]), map([...GREEN, ...APRON], [...STRIPE, ...STRIPE])] } }],
  bodyRecolor: { ...map(GREEN, CAMISA), ...map(SLEEVE, CAMISA), ...map(APRON, CAMISA) },
  recolor: {
    // pink hair → black
    '#ffcfd6': '#4a3e42', '#f7828c': '#3a3034', '#d64152': '#2a2224', '#a51029': '#1d1615', '#730c18': '#141011', '#4a0408': '#0a0708', '#291400': '#0a0708',
    // skin → morena
    '#ffdfb5': '#dba57c', '#f79e5a': SKIN, '#b54921': '#94603c',
  },
  // The saya lengthened from her calf to the floor in its stripes (s, S; o the hem and outline), a
  // cream pañuelo over her shoulders (p, P its fold, e its edge), a dark waist tie (k).
  palette: { o: '#0e0e0e', s: '#3a3a3a', S: '#5a5650', p: '#e6d6ad', P: '#c8b88e', e: '#9a8a62', k: '#2a2a2a' },
  views: {
    front: [
      { at: [16, 58], rows: ['.ossSSssSSssSSso.', '.ossSSssSSssSSso.', 'ossSSssSSssSSssSo', 'ossSSssSSssSSssSo', 'ossSSssSSssSSssSo', 'ooooooooooooooooo'] },
      { at: [17, 30], rows: ['eppppppppppppe', '.epppPPpppppe.', '..eppPppppe...', '...eppPppe....', '....eppPe.....', '.....eee......'] },
      { at: [17, 45], rows: ['kkkkkkkkkkkkkkk'] },
    ],
    right: [
      { at: [12, 58], rows: ['.ossSSssSSssSo.', '.ossSSssSSssSo.', 'ossSSssSSssSSso', 'ossSSssSSssSSso', 'ossSSssSSssSSso', 'ooooooooooooooo'] },
      { at: [15, 31], rows: ['epppppppppe', '.eppPPpppe.', '..epppPpe..', '...eeeee...'] },
      { at: [15, 45], rows: ['kkkkkkkkk'] },
    ],
    back: [
      { at: [16, 58], rows: ['.ossSSssSSssSSso.', '.ossSSssSSssSSso.', 'ossSSssSSssSSssSo', 'ossSSssSSssSSssSo', 'ossSSssSSssSSssSo', 'ooooooooooooooooo'] },
      { at: [17, 32], rows: ['eppppppppppppe', '.epppPpppPppe.', '..epppPPpppe..', '...eppPPppe...', '....eppPpe....', '.....epPe.....', '......ee......'] },
      { at: [17, 45], rows: ['kkkkkkkkkkkkkkk', '.......kk......', '......k..k.....'] },
    ],
  },
  wear: [wear(BUN, { front: [17, 14], right: [16, 15], back: [17, 15] })],
  activities: {
    pluck: { prop: HARP, at: { front: [6, 34], right: [26, 34] }, palette: { h: SKIN } },
  },
  changes: ['pañuelo over the shoulders', 'saya lengthened to the floor', 'waist tie', 'crown combed back into a low bun with a wooden pin', 'harp'],
};
