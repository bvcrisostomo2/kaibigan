// The muchacho: the household's houseboy, a slim youth of about sixteen in a loose camisa de chino
// and brown trousers, barefoot, a towel over his shoulder and a cloth sash at the waist; he carries
// sacks and fans the stove. Body and head: Male 02 (.packs/male02); his red vest and green sleeves
// become one camisa, his grey trousers brown, his shoes bare feet, his grey hair black. Changes
// beyond colour: the towel over the shoulder, the camisa's open neckline, the sash and its knot, the
// sack, the pamaypay. Painted over a kitbash composite (tools/kitbash.mjs); built by:
// node tools/build-sets.mjs muchacho
import { PAMAYPAY } from './parts/pamaypay.mjs';
import { SACK_ON_SHOULDER } from './parts/sack.mjs';

const SAME_PACK = { bodyFrom: 21, headTo: 20, dx: 0 };
const SKIN = '#c68b5e';
const FEET = 61; // output row: below it the red shoes are bare feet

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  // Shoes share the vest's reds, so the feet are recoloured on their own rows.
  zones: [{ fromRow: FEET, map: { '#c65539': SKIN, '#8c3421': '#94603c', '#5a2418': '#74462a', '#391c10': '#4e2c1a' } }],
  bodyRecolor: {
    // red vest and green sleeves → one camisa de chino
    '#de754a': '#f4eedc', '#c65539': '#e6dcc4', '#8c3421': '#c8bca0', '#5a2418': '#9a8e74', '#391c10': '#6a604e', '#7b3018': '#c8bca0',
    '#428629': '#ece4ce', '#315918': '#d2c8ae', '#213c10': '#aea48a', '#182c08': '#7e7562', '#081c00': '#5e5646',
    // grey trousers → brown
    '#6b6d6b': '#8a7e64', '#52514a': '#6b6150', '#313431': '#4e4638', '#212021': '#3a3428',
  },
  recolor: {
    // grey hair → black
    '#948a84': '#4a3e40', '#736963': '#3a3034', '#52494a': '#2a2224', '#423431': '#2a2224', '#393029': '#1d1615', '#292421': '#1a1516', '#211c18': '#141011', '#181410': '#110d0e', '#080400': '#0a0708',
    // skin → morena
    '#ffdfb5': '#dba57c', '#f79e5a': SKIN, '#b54921': '#94603c',
  },
  // A faded blue striped towel (u, its stripe w, its fold and edge U) over his left shoulder and down
  // his chest, the camisa's open neckline
  // (n), and a cloth sash at the waist (m, M) knotted at the right hip.
  palette: { u: '#a8bccb', w: '#e6ecf0', U: '#5e7a8e', n: '#9a8e74', m: '#7a3a2a', M: '#4e2218' },
  views: {
    front: [
      { at: [27, 29], rows: ['UuuU', 'UwwU', 'UuuU', 'UuuU', 'UwwU', 'UuuU', 'UuuU', 'UwwU', 'UuuU', 'UuuU', 'UwwU', 'UuuU', 'U.U.'] },
      { at: [22, 31], rows: ['n.....n', '.n...n.', '..n.n..', '...n...'] },
      { at: [20, 42], rows: ['mmmmmmmmmmm', '..........MM', '..........Mm', '...........M'] },
    ],
    right: [
      { at: [18, 29], rows: ['UuuU', 'UwwU', 'UuuU', 'UuuU', 'UwwU', 'UuuU', 'UuuU', 'UwwU', 'UuuU', 'UuuU', 'UwwU', 'UuuU', 'U.U.'] },
      { at: [22, 31], rows: ['n.', '.n'] },
      { at: [16, 42], rows: ['mmmmmmmmm', 'MMMMMMMMM'] },
    ],
    back: [
      { at: [20, 30], rows: ['UuuU', 'UwwU', 'UuuU', 'UuuU', 'UwwU', 'UuuU', 'UuuU', 'UwwU', 'U.U.'] },
      { at: [16, 43], rows: ['mmmmmmmmmmmmmmm', '.............MM', '.............Mm', '..............M'] },
    ],
  },
  activities: {
    carry: { prop: SACK_ON_SHOULDER, at: { front: [15, 26], right: [13, 26] }, palette: { h: SKIN } },
    fan: { prop: PAMAYPAY, at: { front: [31, 37], right: [20, 37] }, palette: { h: SKIN } },
  },
  changes: ['towel over the shoulder', 'open camisa neckline', 'sash knotted at the hip', 'sack', 'pamaypay'],
};
