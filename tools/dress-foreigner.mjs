// The foreigner: one of "two foreigners dressed in white, promenading" (Chapter I): a white linen
// suit with a dark tie and a watch chain, brown shoes, light brown hair under a straw boater; he
// chats. Body and head: Student Male 02 (.packs/studentmale02); his navy coat and cape become the
// white suit, his dark trousers white, his blond hair light brown. Changes beyond colour: the
// boater, the lapels, the tie, the watch chain, the coat's back seam and half belt, the chat from
// his pack's talking animation. Painted over a kitbash composite (tools/kitbash.mjs); built by:
// node tools/build-sets.mjs foreigner
import { wear } from './parts.mjs';
import { BOATER } from './parts/boater.mjs';

const SAME_PACK = { bodyFrom: 23, headTo: 22, dx: 0 };
const SKIN = '#e8b994';
const WHITE = ['#fbf9f2', '#f0ece0', '#d8d2c2', '#b4ac98', '#8a8270'];

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  bodyRecolor: {
    // navy coat and cape → white linen
    '#4a6994': WHITE[1], '#314163': WHITE[2], '#212842': WHITE[3], '#181831': WHITE[4],
    // gold trim → white, a shade lighter
    '#c6ae31': WHITE[0], '#9c8629': WHITE[1], '#735929': WHITE[2], '#423000': WHITE[3], '#423400': WHITE[3],
    // dark trousers → white
    '#5a595a': WHITE[0], '#424142': WHITE[1], '#313031': WHITE[2], '#212021': WHITE[3],
    // shoes → brown
    '#a57939': '#8a6a42', '#7b5118': '#6a4a2a', '#523000': '#4a3018', '#312008': '#2a1a0e',
  },
  recolor: {
    // blond hair → light brown
    '#ffd773': '#b8986a', '#ce9e29': '#9a7a4a', '#8c6918': '#7a5c36', '#5a5108': '#5e4628', '#5a4508': '#5e4628', '#292c00': '#33240f', '#392400': '#33240f',
    // the green waistcoat under the coat → the tie's grey
    '#004131': '#5a5a6a',
    // cyan eyes → grey-blue
    '#00c7de': '#6a8aa0', '#0059bd': '#3a5468',
    // skin → Spanish
    '#ffdfb5': '#f4d2b0', '#f79e5a': SKIN, '#b54921': '#c08a62',
  },
  // The lapels (L), a dark tie (t, T), a gold watch chain (c), a hip pocket's flap (P, L), and at the
  // back a seam (S) and a half belt (B) with two buttons (b).
  palette: { L: '#9a927e', t: '#5a5a6a', T: '#3a3a46', c: '#d8b040', P: '#d8d2c2', S: '#c0b8a4', B: '#e8e2d2', b: '#8a8270' },
  views: {
    front: [
      { at: [21, 31], rows: ['L...tt...L', 'L...tT...L', '.L..tT..L.', '.L..tT..L.', '..L.tT.L..', '..L.tT.L..', '...LtTL...', '....tT....', '....TT....'] },
      { at: [23, 41], rows: ['c....c', '.cccc.'] },
    ],
    right: [
      { at: [23, 31], rows: ['LLt', 'LLt', 'LLT', 'LLt', 'LLT', 'LLt', 'LLT', '..t'] },
      { at: [20, 41], rows: ['cccc'] },
      { at: [18, 42], rows: ['LLLLL', 'PPPPL'] },
    ],
    back: [
      { at: [20, 29], rows: ['LLLLLLLLL', '.LLLLLLL.'] },
      { at: [24, 32], rows: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', '.', '.', 'S', 'S', 'S'] },
      { at: [19, 43], rows: ['LLLLLLLLLLL', 'BbBBBBBBBbB', 'LLLLLLLLLLL'] },
    ],
  },
  wear: [wear(BOATER, { front: [16, 13], right: [15, 13], back: [16, 13] })],
  activities: {
    chat: { source: { right: { folder: 'talk_left', mirror: true } }, nod: { front: 27 } },
  },
  changes: ['straw boater', 'lapels', 'tie', 'gold watch chain', 'hip pocket', 'back seam and half belt', 'chat'],
};
