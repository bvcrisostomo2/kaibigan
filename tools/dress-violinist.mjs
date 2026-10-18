// The violinist: a mestizo musician hired for the dinner, in a pleated barong with a black bow tie,
// a dark belt, dark trousers and shoes, his hair slicked and his moustache trimmed; he plays the
// violin. Body and head: Male 05 (.packs/male05); his brown sweater and white collar and cuffs become
// the barong, his green trousers dark. Changes beyond colour: the bow tie, the barong's pleats and
// placket, its buttons, pocket and the watch chain, the shoulder yoke's seam at the back, the violin. Painted over
// a kitbash composite (tools/kitbash.mjs); built by: node tools/build-sets.mjs violinist
import { VIOLIN_PROP } from './parts/violin.mjs';

const SAME_PACK = { bodyFrom: 21, headTo: 20, dx: 0 };
const SKIN = '#d9a37a';

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  bodyRecolor: {
    // white collar and cuffs, and the brown sweater → one barong
    '#efebef': '#fdf9ee', '#bdbebd': '#f3ebd6', '#949694': '#d6ccb2', '#6b6d6b': '#b0a68c', '#525552': '#8a806a', '#292c29': '#5a5244',
    '#c66510': '#faf4e4', '#ad5910': '#f3ebd6', '#944d10': '#e2d8c0', '#7b3c10': '#c8bea4', '#5a3010': '#a49a80', '#391c08': '#6e6654',
    // belt → black
    '#4a4131': '#2a2830', '#312821': '#1c1a20', '#211c18': '#121014',
    // green trousers → dark
    '#396142': '#46424e', '#294929': '#33303a', '#183421': '#26242c', '#102010': '#18161c',
    // shoes → dark brown
    '#9c4131': '#5a4030', '#7b3029': '#3e2c22', '#5a2018': '#2a1c16', '#390808': '#1c120e',
  },
  recolor: {
    // greying brown hair → dark brown, slicked
    '#736952': '#4e3e34', '#5a5142': '#3e3028', '#4a4529': '#33261e', '#393021': '#2a1e18', '#212010': '#160f0b', '#6b5942': '#3a2a20',
    // skin → mestizo
    '#ffdfb5': '#ecc49a', '#f79e5a': SKIN, '#b54921': '#a8704a',
  },
  // A black bow tie (k, K), the barong's pleats (p) either side of its placket (L), its buttons (u),
  // a pocket (W) and a watch chain (c), the shoulder yoke's seam (s); at the back the seam (S), the
  // yoke, the side seams and the hem (s).
  palette: { k: '#121014', K: '#3a3440', p: '#c8bea4', L: '#a49a80', u: '#8a806a', W: '#a49a80', c: '#d8b040', S: '#b0a68c', s: '#b0a68c' },
  views: {
    front: [
      { at: [23, 26], rows: ['kkKkk', '.k.k.'] },
      { at: [21, 28], rows: ['L.p.p.L.', 'L.p.p.L.', '.Lp.pL..', '.Lp.pL..', '..LpL...', '..LpL...', '...L....'] },
      { at: [24, 35], rows: ['u', '.', 'u', '.', 'u'] },
      { at: [20, 37], rows: ['WWW.....', '.c....c.', '..cccc..'] },
      { at: [16, 29], rows: ['sssss.........sssss'] },
    ],
    right: [
      { at: [23, 26], rows: ['kK', 'k.'] },
      { at: [21, 28], rows: ['LLp', 'LLp', 'LLp', 'LLp', 'LLp', 'LLp', 'LL.'] },
      { at: [22, 25], rows: ['pp'] },
      { at: [19, 31], rows: ['WW', 'WW'] },
      { at: [24, 35], rows: ['u', '.', 'u', '.', 'u'] },
      { at: [18, 37], rows: ['WWWW', '....', '....', 'cccccc'] },
      { at: [15, 29], rows: ['sssssss'] },
    ],
    back: [
      { at: [20, 25], rows: ['SSSSSSSSS'] },
      { at: [24, 27], rows: ['S', 'S', 'S', 'S', 'S', 'S', 'S'] },
      { at: [17, 30], rows: ['sssssssssssssss'] },
      { at: [19, 33], rows: ['s.............s', 's.............s', 's.............s'] },
      { at: [17, 39], rows: ['sssssssssssssss'] },
    ],
  },
  activities: {
    bow: { prop: VIOLIN_PROP, at: { front: [21, 25], right: [17, 25] }, palette: { h: SKIN } },
  },
  changes: ['bow tie', 'barong pleats and placket', 'buttons, pocket and watch chain', 'back seam and shoulder yoke', 'violin'],
};
