// The cadet: a young Spanish cadet at the dinner in a navy uniform coat with gold trim and white
// trousers, a kepi on his head, brass buttons down his chest and a black belt with a brass buckle;
// he chats, nodding along. Body and head: Student Male 03 (.packs/studentmale03); his navy coat stays
// navy, his dark trousers become white, his blue hair brown. Changes beyond colour: the kepi, the red
// stand collar, the gold epaulettes, the brass buttons (two more at the back above the belt), the belt
// and its buckle, the nod. Painted over a kitbash composite (tools/kitbash.mjs); built by:
// node tools/build-sets.mjs cadet
import { wear } from './parts.mjs';
import { KEPI } from './parts/kepi.mjs';

const SAME_PACK = { bodyFrom: 23, headTo: 22, dx: 0 };
const SKIN = '#e8b994';

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  bodyRecolor: {
    // navy coat → the cadets' navy
    '#4a6994': '#44587e', '#314163': '#2a3a5a', '#212842': '#1e2a44', '#181831': '#141c30',
    // dark trousers → white drill
    '#5a595a': '#f2eee2', '#424142': '#e6e2d6', '#313031': '#c4c0b2', '#212021': '#9a968a',
    // brown shoes → black
    '#a57939': '#3a3640', '#7b5118': '#2a2630', '#523000': '#1e1a22', '#523400': '#1e1a22', '#392408': '#151319', '#312008': '#151319',
  },
  recolor: {
    // blue hair → brown
    '#849ede': '#6a5038', '#525d7b': '#4e3a28', '#313c52': '#3a2a1a', '#182031': '#261a10', '#081018': '#140c06',
    // skin → Spanish
    '#ffdfb5': '#f4d2b0', '#f79e5a': SKIN, '#b54921': '#c08a62',
  },
  // A red stand collar (r, R), gold epaulette fringes on the shoulders (y, g), two rows of brass
  // buttons (y), a black belt (B) with a brass buckle (g, y).
  palette: { r: '#9a2e2e', R: '#5a1a1a', y: '#f0d070', g: '#b88a30', B: '#1a1618' },
  views: {
    front: [
      { at: [21, 28], rows: ['rrrrrrrr', 'RrrrrrrR'] },
      { at: [14, 33], rows: ['ygyg', 'g.g.'] },
      { at: [32, 33], rows: ['gygy', '.g.g'] },
      { at: [22, 32], rows: ['y....y', '......', '......', 'y....y', '......', '......', 'y....y', '......', '......', 'y....y'] },
      { at: [19, 44], rows: ['BBBBBgyBBBBB', '.....gg.....'] },
    ],
    right: [
      { at: [19, 28], rows: ['rrrrr', 'RrrrR'] },
      { at: [17, 30], rows: ['ygygy', 'g.g.g'] },
      { at: [24, 32], rows: ['y', '.', '.', 'y', '.', '.', 'y', '.', '.', 'y'] },
      { at: [14, 43], rows: ['BBBBBBBBBBgy', '..........gg'] },
    ],
    back: [
      { at: [20, 26], rows: ['rrrrrrrrr', 'RrrrrrrrR'] },
      { at: [16, 30], rows: ['ygyg', 'g.g.'] },
      { at: [29, 30], rows: ['gygy', '.g.g'] },
      { at: [20, 40], rows: ['y.......y', 'g.......g'] },
      { at: [15, 43], rows: ['BBBBBBBBBBBBBBB', 'BBBBBBBBBBBBBBB'] },
    ],
  },
  wear: [wear(KEPI, { front: [17, 12], right: [17, 12], back: [17, 12] })],
  activities: {
    chat: { nod: { front: 27, right: 27 } },
  },
  changes: ['kepi', 'red stand collar', 'gold epaulettes', 'brass buttons', 'belt with a brass buckle', 'nod'],
};
