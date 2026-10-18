// Laruja: "a very small man with a black beard" (Chapter I), a guest who argues at the dinner, in a
// brown suit, a white shirt and a dark red tie, his black hair slicked. Body and head: Boy 04
// (.packs/boy04), whose small frame makes him the shortest man in the sala; his red tunic becomes the
// suit, his grey collar the shirt, his shorts and the bare legs below them the trousers, his blue hair
// black. Changes beyond colour: the black beard and moustache, the slicked hair's sheen, the tie, the
// suit's lapels and buttons, its hem, collar, back seam and half belt.
// Painted over a kitbash composite (tools/kitbash.mjs); built by: node tools/build-sets.mjs laruja
import { ramp } from './ramp.mjs';

const SAME_PACK = { bodyFrom: 35, headTo: 34, dx: 0 };
const SKIN = '#e8b994';
const TROUSERS = ['#5a4e44', '#4a4038', '#3e342c', '#2a221c'];
const LEGS = 58; // output row: below it his bare legs are trouser legs

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  // His bare legs share the face's skin, so they are recoloured on their own rows.
  zones: [{ fromRow: LEGS, map: ramp(['#ffe3b5', '#ffdfb5', '#f79e5a', '#b54921', '#522818'], TROUSERS) }],
  bodyRecolor: {
    // red tunic → brown suit
    ...ramp(['#d65531', '#a53821', '#842810', '#521808'], ['#7a6250', '#5a4636', '#46362a', '#2e231b']),
    // grey collar → white shirt
    ...ramp(['#fffff7', '#b5bab5', '#7b867b', '#7b827b'], ['#f6f1e6', '#efe9dd', '#c8c2b6', '#c8c2b6']),
    // shorts → trousers
    ...ramp(['#736963', '#424139', '#292421'], ['#5a4e44', '#3e342c', '#2a221c']),
  },
  recolor: {
    // blue hair → black
    ...ramp(['#6b7dbd', '#42597b', '#293452', '#212029'], ['#3a3034', '#241c1e', '#1b1615', '#0e0a0b']),
    // skin → Spanish
    '#ffdfb5': '#f4d2b0', '#ffe3b5': '#f4d2b0', '#f79e5a': SKIN, '#b54921': '#c08a62',
  },
  // A black beard and moustache (b, its sheen B, m the moustache), a dark red tie (t, T), the lapels'
  // edges (L), the jacket's buttons (u); in profile the jacket's hem; at the back the slicked hair's
  // sheen (B) and the jacket's collar, seam and half belt (L).
  palette: { b: '#1b1615', B: '#3a3034', m: '#120e0e', t: '#7a2e2e', T: '#4e1c1c', L: '#2e231b', u: '#c8b878' },
  views: {
    front: [
      { at: [19, 37], rows: ['b.........b', 'bb.mmmmm.bb', '.bbbb.bBbb.', '..bbBbbbb..', '....bbb....'] },
      { at: [20, 41], rows: ['L....tt...L', '.L...tT..L.', '..L..tT.L..', '...L.tTL...', '.....TT....'] },
      { at: [25, 47], rows: ['u', '.', 'u', '.', 'u'] },
    ],
    right: [
      { at: [19, 37], rows: ['b.....', 'bb.mmm', '.bbbBb', '..bbbb', '...bb.'] },
      { at: [21, 41], rows: ['LLt', 'LLT', 'LLt', 'LLT', 'LLt', 'LLT'] },
      { at: [23, 48], rows: ['u', '.', 'u', '.', 'u'] },
      { at: [17, 54], rows: ['LLLLLLLLLLL'] },
    ],
    back: [
      { at: [19, 27], rows: ['.B..B..B..B', '.B..B..B..B', '..B..B..B..', '..B..B..B..'] },
      { at: [20, 40], rows: ['LLLLLLLLLL'] },
      { at: [25, 41], rows: Array(14).fill('L') },
      { at: [19, 50], rows: ['LLLLLLLLLLLL'] },
    ],
  },
  changes: ['black beard and moustache', 'slicked hair', 'tie', 'lapel edges and buttons', 'jacket hem, collar, back seam and half belt', 'trousers to the ankle'],
};
