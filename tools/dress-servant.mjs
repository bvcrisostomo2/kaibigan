// A servant of Capitan Tiago's house: an older man in a long barong of coarse piña with an embroidered
// front, a dark sash and dark trousers, a white napkin over his arm for the dinner, his short hair
// dark and greying. Body and head: Gen (.packs/gen); his green coat, red vest and gold trim become the
// barong, his belt the sash, his purple trousers dark, his grey hair darker. Changes beyond colour:
// the barong's embroidered front, the sash's knot, the napkin over his arm, the collar line, the
// shoulder yoke and the back seam. Painted over a kitbash
// composite (tools/kitbash.mjs); built by: node tools/build-sets.mjs servant
import { ramp } from './ramp.mjs';

const SAME_PACK = { bodyFrom: 20, headTo: 19, dx: 0 };
const SKIN = '#c68b5e';
const BARONG = ['#ece4ce', '#d8cdb2', '#bab096', '#968c74', '#6a624e'];
const FEET = 55; // output row: below it his boots (the coat's greens) are dark shoes

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  // His boots share the coat's greens and trim, so the feet are recoloured on their own rows.
  zones: [{ fromRow: FEET, map: ramp(['#c6aa52', '#739a6b', '#8c6d18', '#426539', '#4a3808', '#213821'], ['#5a4030', '#4a3424', '#3a2a20', '#2e2018', '#22160f', '#160e0a']) }],
  bodyRecolor: {
    // green coat → barong
    ...ramp(['#739a6b', '#426539', '#213821', '#213031'], BARONG.slice(0, 4)),
    // red vest → barong, a shade warmer
    ...ramp(['#ad3029', '#631410'], ['#e4dac2', '#b0a68c']),
    // gold trim → the barong's edge
    ...ramp(['#c6aa52', '#8c6d18', '#4a3808'], ['#c8bea4', '#968c74', '#6a624e']),
    // grey collar → barong
    ...ramp(['#84969c', '#424d52'], ['#d8cdb2', '#968c74']),
    // belt → a dark sash
    ...ramp(['#b57952', '#a58e7b', '#6b4521', '#4a2c18', '#422c18'], ['#5a5040', '#4a4033', '#3a3226', '#2a241c', '#2a241c']),
    // purple trousers → dark
    ...ramp(['#9c7584', '#5a3c42', '#392429', '#292c29'], ['#5a5044', '#4a4033', '#33291f', '#221c14']),
  },
  recolor: {
    // grey hair → dark, greying
    ...ramp(['#ffffff', '#ad9e9c', '#949e8c', '#635552', '#52554a', '#313029', '#212018'], ['#8a8682', '#6a6662', '#4a4644', '#33302e', '#2a2624', '#1d1a19', '#121010']),
    // skin → morena
    '#ffdfb5': '#dba57c', '#f79e5a': SKIN, '#b54921': '#94603c',
  },
  // The barong's embroidered front in a lattice (e), a white napkin over his forearm (w, W its fold),
  // the sash's knot (k); in profile the collar line; at the back the shoulder yoke and the seam; the
  // barong's hem (s).
  palette: { e: '#a49a80', w: '#fbf8f0', W: '#d0cab8', k: '#2a241c', s: '#bab096' },
  views: {
    front: [
      { at: [21, 26], rows: ['e....e', '.e..e.', '..ee..', '.e..e.', 'e....e', 'e....e', '.e..e.', '..ee..', '.e..e.', 'e....e'] },
      { at: [13, 40], rows: ['wwwww', 'wWwww', '.wwWw', '.wWww', '..ww.', '..w..'] },
      { at: [28, 40], rows: ['kk', 'k.', 'kk'] },
    ],
    right: [
      { at: [22, 26], rows: ['e.e', '.e.', 'e.e', '.e.', 'e.e', '.e.', 'e.e', '.e.', 'e.e', '.e.'] },
      { at: [15, 40], rows: ['wwww', 'wWww', '.wwW', '.wWw', '..w.'] },
      { at: [17, 25], rows: ['ssssss'] },
      { at: [18, 52], rows: ['ssssssssssss'] },
    ],
    back: [
      { at: [15, 29], rows: ['ssssssssssssssssss'] },
      { at: [16, 52], rows: ['ssssssssssssssss'] },
      { at: [24, 30], rows: ['s', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's', 's'] },
    ],
  },
  changes: ['embroidered barong front', 'napkin over the forearm', 'sash knot', 'collar, shoulder yoke, back seam and hem'],
};
