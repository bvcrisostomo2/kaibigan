// Don Tiburcio de Espadaña: Doña Victorina's husband, a thin, lame Spaniard who passes for a doctor,
// in a grey suit with a dark cravat and a watch chain, his short hair grey, spectacles on his nose.
// Body and head: Sanchez (.packs/sanchez); his brown coat becomes the grey suit's, his red waistcoat
// a darker grey, his white trousers grey, his yellow cravat dark. Changes beyond colour: the
// spectacles, the lapels' edges, the waistcoat's buttons, a pocket square, the watch chain, the
// coat's hem, collar, back seam, half belt and vent. Painted over a kitbash composite
// (tools/kitbash.mjs); built by: node tools/build-sets.mjs tiburcio
import { ramp } from './ramp.mjs';

const SAME_PACK = { bodyFrom: 19, headTo: 18, dx: 0 };
const COAT = ['#ffba39', '#faba3f', '#a57d21', '#a57e20', '#946508', '#976709', '#735921', '#705b24', '#533700', '#523400', '#4a3c08', '#4a3d0f', '#292000', '#2b2305'];
const WAISTCOAT = ['#c66142', '#c76344', '#8c4531', '#8c4730', '#633021', '#663221', '#421c10', '#401e12'];
const TROUSERS = ['#efeff7', '#ecedf2', '#bdbece', '#b9bcce', '#848a94', '#868895', '#52555a', '#52545e'];
const CRAVAT = ['#ded321', '#dad022', '#9c9200', '#989000', '#5a5100', '#585200', '#de5110', '#dd5317', '#6b1000', '#6d1100'];
const SHOES = ['#73615a', '#76605a', '#372926', '#312821', '#261d1b', '#211c18'];

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  bodyRecolor: {
    ...ramp(COAT, ['#a4a29a', '#8a887f', '#6c6a63', '#55534d', '#3a3934']),
    ...ramp(WAISTCOAT, ['#6a6860', '#55534d', '#44423d', '#2e2d29']),
    ...ramp(TROUSERS, ['#7e7c74', '#6a6862', '#5a5852', '#42413c']),
    ...ramp(CRAVAT, ['#5a3a3a', '#3b2a2a', '#241a1a']),
    ...ramp(SHOES, ['#3a3434', '#1f1b1b', '#121010']),
  },
  // Gold wire spectacles (g; the lenses keep his eyes), the lapels' edges (L), the waistcoat's buttons (u),
  // a white pocket square (w), a watch chain (c); in profile the coat's hem; at the back its collar,
  // seam, half belt and vent (L).
  palette: { g: '#b89a5a', L: '#3a3934', u: '#c8b878', w: '#efe9dd', c: '#d8b040' },
  views: {
    front: [
      { at: [21, 19], rows: ['.g.....g.', 'g.ggggg.g', '.g.....g.'] },
      { at: [19, 26], rows: ['L.........L', '.L.......L.', '.L.......L.', '..L.....L..', '..L.....L..', '...L...L...', '...L...L...', '....L.L....'] },
      { at: [24, 34], rows: ['u', '.', 'u', '.', 'u'] },
      { at: [28, 29], rows: ['ww', 'ww'] },
      { at: [21, 42], rows: ['c......c', '.cccccc.'] },
    ],
    right: [
      { at: [19, 19], rows: ['......g.', 'gggggg.g', '......g.'] },
      { at: [23, 26], rows: ['LL', 'LL', 'LL', 'LL', 'LL', 'LL', 'LL', 'LL'] },
      { at: [25, 34], rows: ['u', '.', 'u', '.', 'u'] },
      { at: [21, 29], rows: ['ww', 'ww'] },
      { at: [20, 42], rows: ['ccccc'] },
      { at: [15, 46], rows: ['LLLLLLLLLLLL'] },
    ],
    back: [
      { at: [19, 25], rows: ['LLLLLLLLLLL'] },
      { at: [23, 30], rows: Array(16).fill('L') },
      { at: [18, 40], rows: ['LLLLLLLLLLLL'] },
      { at: [22, 42], rows: ['L.L', 'L.L', 'L.L', 'L.L'] },
    ],
  },
  changes: ['spectacles', 'lapel edges', 'waistcoat buttons', 'pocket square', 'watch chain', 'coat hem, collar, back seam and half belt'],
};
