// Lady B: a guest at the dinner in baro't saya: a sheer camisa, a cream pañuelo over her shoulders, a
// floor-length saya in wine stripes under a dark tapis, her dark hair in a low bun with a
// tortoiseshell peineta; she fans herself with a pink fan. Body and head: Female 04
// (.packs/female04); her grey blouse becomes the camisa, her orange belt the tapis's tie, her short
// dark skirt the top of the saya, her blonde hair dark brown. Changes beyond colour: the saya
// lengthened to the floor over her bare legs, the tapis over it, the pañuelo, the crown combed back
// into a low bun, the peineta, the fan. Painted over a kitbash composite (tools/kitbash.mjs); built
// by: node tools/build-sets.mjs lady_b
import { wear } from './parts.mjs';
import { BUN } from './parts/bun.mjs';
import { PEINETA } from './parts/peineta.mjs';
import { FAN } from './parts/fan.mjs';

const SAME_PACK = { bodyFrom: 24, headTo: 23, dx: 0 };
const SKIN = '#c68b5e';
const map = (from, to) => Object.fromEntries(from.map((c, i) => [c, to[i]]));
const GREY = ['#eff3f7', '#dedfde', '#b5babd', '#adb2b5', '#7b8684', '#7b8284', '#5a5d5a', '#4a494a', '#393c39'];
const CAMISA = ['#fbf7ee', '#f2ece0', '#dcd4c2', '#d4ccb8', '#aaa290', '#a49c8a', '#7e7868', '#5e584c', '#45403a'];
const BELT = ['#ef6539', '#ef5d31', '#ad3810', '#9c3010', '#5a1c08', '#290800', '#292c29'];
const TIE = ['#6a3a52', '#5e3248', '#4a2638', '#40202f', '#2a1a22', '#1a0e14', '#1a0e14'];
const SKIRT = ['#5a595a', '#393839', '#212021', '#101010'];
const TAPIS = ['#4a3442', '#36222e', '#2a1a22', '#1a0e14'];

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  // Her short skirt becomes the tapis; the saya is painted below it down to the floor.
  bodyRecolor: { ...map(GREY, CAMISA), ...map(BELT, TIE), ...map(SKIRT, TAPIS) },
  recolor: {
    // blonde hair → dark brown
    '#f7c329': '#5a4a40', '#ce8a10': '#44362e', '#9c5500': '#33281f', '#633800': '#2a1e18', '#392000': '#170f0b',
    // green eyes → brown
    '#318e18': '#4a2e1c',
    // skin → morena
    '#ffdfb5': '#dba57c', '#f79e5a': SKIN, '#b54921': '#94603c',
  },
  // The saya painted from the tapis's hem to the floor in wine and cream stripes (s, S; o its hem
  // and outline), over her bare legs; a cream pañuelo (p, P its fold, e its edge) over her shoulders.
  palette: { o: '#140a0e', s: '#7a2a4a', S: '#e4cdb8', p: '#f0e4cc', P: '#d2c2a0', e: '#a8946a' },
  views: {
    front: [
      { at: [17, 56], rows: ['.ossSSssSSssSSso.', '.ossSSssSSssSSso.', 'ossSSssSSssSSssSo', 'ossSSssSSssSSssSo', 'ossSSssSSssSSssSo', 'ossSSssSSssSSssSo', 'ooooooooooooooooo'] },
      { at: [18, 31], rows: ['eppppppppppppe', '.epppPPpppppe.', '..eppPppppe...', '...eppPppe....', '....eppPe.....', '.....eee......'] },
    ],
    right: [
      { at: [13, 56], rows: ['.ossSSssSSssSo.', '.ossSSssSSssSo.', 'ossSSssSSssSSso', 'ossSSssSSssSSso', 'ossSSssSSssSSso', 'ossSSssSSssSSso', 'ooooooooooooooo'] },
      { at: [16, 31], rows: ['epppppppppe', '.eppPPpppe.', '..epppPpe..', '...eeeee...'] },
    ],
    back: [
      { at: [16, 56], rows: ['.ossSSssSSssSSso.', '.ossSSssSSssSSso.', 'ossSSssSSssSSssSo', 'ossSSssSSssSSssSo', 'ossSSssSSssSSssSo', 'ossSSssSSssSSssSo', 'ooooooooooooooooo'] },
      { at: [18, 32], rows: ['eppppppppppppe', '.epppPpppPppe.', '..epppPPpppe..', '...eppPPppe...', '....eppPpe....', '.....epPe.....', '......ee......'] },
    ],
  },
  wear: [
    wear(BUN, { front: [17, 14], right: [16, 14], back: [17, 14] }),
    wear(PEINETA, { front: [20, 13], right: [14, 14], back: [20, 14] }),
  ],
  activities: {
    fan: { prop: FAN, at: { front: [28, 30], right: [26, 30] }, palette: { y: '#d8a0b8', k: '#9a5a74', h: SKIN } },
  },
  changes: ['saya lengthened to the floor in stripes', 'tapis over it', 'pañuelo over the shoulders', 'crown combed back into a low bun', 'tortoiseshell peineta', 'fan'],
};
