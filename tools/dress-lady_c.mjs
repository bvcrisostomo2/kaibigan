// Lady C: a Spanish guest at the dinner in the European fashion of the 1880s: a blue gown with puffed
// sleeves, a cream lace frill at the neck and the hem, a bustle bow at the back, her brown hair up in
// a low bun with a tortoiseshell peineta; she fans herself. Body and head: Female 01
// (.packs/female01); her yellow blouse and magenta skirt become one blue gown, her lime collar the
// lace frill, her orange hair brown. Changes beyond colour: the puffed sleeves, the lace at the neck
// and the hem, the bustle bow, the crown combed back into a low bun, the peineta, the fan. Painted
// over a kitbash composite (tools/kitbash.mjs); built by: node tools/build-sets.mjs lady_c
import { wear } from './parts.mjs';
import { BUN } from './parts/bun.mjs';
import { PEINETA } from './parts/peineta.mjs';
import { FAN } from './parts/fan.mjs';

const SAME_PACK = { bodyFrom: 25, headTo: 24, dx: 0 };
const SKIN = '#e8b994'; // Spanish
const map = (from, to) => Object.fromEntries(from.map((c, i) => [c, to[i]]));
const YELLOW = ['#ffff31', '#ced300', '#9c9e00', '#6b6d00', '#424500', '#290800'];
const MAGENTA = ['#d600ce', '#8c0c84', '#73006b', '#52004a'];
const GOWN = ['#6a7cb0', '#52649a', '#3a4a7a', '#2c3a62', '#1e2a4a', '#121a30'];

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  bodyRecolor: {
    ...map(YELLOW, GOWN),
    ...map(MAGENTA, [GOWN[1], GOWN[2], GOWN[3], GOWN[4]]),
    // the lime collar and its greys → cream lace
    '#deff73': '#f4eedc', '#bdff31': '#e8e0cc', '#bdaead': '#e8e0cc', '#948a84': '#b8ae96',
  },
  recolor: {
    // orange hair → brown
    '#ffb65a': '#7a5a40', '#f76500': '#5e4230', '#bd4d00': '#4a3020', '#8c5500': '#36221a', '#080c08': '#140c08',
    // cyan eyes → brown
    '#31e3ff': '#6a4a30',
    // skin → Spanish
    '#ffdfb5': '#f4d2b0', '#f79e5a': SKIN, '#b54921': '#c08a62',
  },
  // The gown's blue (g, G its light, d its shadow, O its outline), its cream lace (l, L), the bustle
  // bow (b, B its light). Front: puffed sleeves at the shoulders, a lace frill at the neckline, the
  // skirt lengthened to the floor with a lace hem. Back: the bodice painted over the hair Female 01
  // wore down to her waist, the bustle bow, the long skirt. Side: the hair behind her cleared and the
  // gown's back edge drawn, the bow.
  palette: { O: '#101626', g: '#3a4a7a', G: '#52649a', d: '#2c3a62', l: '#f4eedc', L: '#d8cfb8', b: '#52649a', B: '#7a8cc0' },
  views: {
    front: [
      { at: [15, 30], rows: ['..OOO', '.OGgg', 'OGggg', 'OGggd', '.Oggd', '..OOd'] },
      { at: [31, 30], rows: ['OOO..', 'ggdO.', 'gggdO', 'gggdO', 'ggdO.', 'dOO..'] },
      { at: [20, 30], rows: ['llllllllll', 'LlLlLlLlLl'] },
      { at: [17, 56], rows: ['.OGgggggggggggdO', '.OGgggggggggggdO', 'OGgggggggggggggdO', 'OGgggggggggggggdO', 'OGgggggggggggggdO', 'OGgggggggggggggdO', 'OlLlLlLlLlLlLlLlO', 'OOOOOOOOOOOOOOOOO'] },
    ],
    right: [
      { at: [14, 30], rows: ['----Ogg', '----Ogg', '----Ogg', '----Ogg', '----Ogg', '----Ogg', '----Ogg', '----Ogg', '----Ogg', '----Ogg', '----Ogg'] },
      { at: [13, 41], rows: ['..BBB.', '.BbbbB', 'BbbbBd', '.BbbBd', '..BB.d', '.....d'] },
      { at: [15, 56], rows: ['.OGgggggggggdO', '.OGgggggggggdO', 'OGgggggggggggdO', 'OGgggggggggggdO', 'OGgggggggggggdO', 'OGgggggggggggdO', 'OlLlLlLlLlLlLlO', 'OOOOOOOOOOOOOOO'] },
    ],
    back: [
      { at: [17, 28], rows: ['OlllllllllllllO', 'OLLLLLLLLLLLLLO', 'OGggdggdggdgggO', 'OGggdggdggdgggO', 'OGggdggdggdgggO', 'OGggdggdggdgggO', 'OGggdggdggdgggO', 'OGggdggdggdgggO', 'OGggdggdggdgggO', 'OGggdggdggdgggO', 'OGggdggdggdgggO', 'OGggdggdggdgggO', 'OGggdggdggdgggO', 'OGggdggdggdgggO', 'OGggdggdggdgggO', 'OGggdggdggdgggO'] },
      { at: [18, 42], rows: ['..BBB...BBB..', '.BbbbB.BbbbB.', 'BbbbbBdBbbbbB', '.BbbBBdBBbbB.', '..BB.ddd.BB..', '.....d.d.....', '....d...d....'] },
      { at: [17, 56], rows: ['.OGgggggggggggdO', '.OGgggggggggggdO', 'OGgggggggggggggdO', 'OGgggggggggggggdO', 'OGgggggggggggggdO', 'OGgggggggggggggdO', 'OlLlLlLlLlLlLlLlO', 'OOOOOOOOOOOOOOOOO'] },
    ],
  },
  wear: [
    wear(BUN, { front: [17, 15], right: [16, 15], back: [17, 15] }),
    wear(PEINETA, { front: [20, 14], right: [14, 15], back: [20, 15] }),
  ],
  activities: {
    fan: { prop: FAN, at: { front: [28, 30], right: [26, 30] }, palette: { y: '#f0d080', h: SKIN } },
  },
  changes: ['puffed sleeves', 'lace frill at the neckline', 'skirt lengthened to the floor with a lace hem', 'bodice back painted over the long hair', 'bustle bow', 'crown combed back into a low bun', 'tortoiseshell peineta', 'fan'],
};
