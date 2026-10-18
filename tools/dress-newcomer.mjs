// The newcomer: a young Spaniard lately arrived in Manila, in a light tan suit, a white shirt and a
// dark red tie, his blond hair slicked; he watches the dinner with a stranger's eyes. Body and head:
// Alex (.packs/alex); his brown jacket and orange waistcoat become the tan suit, his jeans
// tan trousers, his boots shoes, his brown hair blond. Changes beyond colour: the hair combed back with
// pomade, the lapels' edges, the coat's hem in profile, the tie drawn down the shirt, the watch chain, a pocket square, the coat's collar, back seam and half
// belt.
// Painted over a kitbash composite (tools/kitbash.mjs); built by: node tools/build-sets.mjs newcomer
import { ramp } from './ramp.mjs';

const SAME_PACK = { bodyFrom: 21, headTo: 20, dx: 0 };
const SKIN = '#e8b994';

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  bodyRecolor: {
    // brown jacket → tan coat
    ...ramp(['#94824a', '#6b4531', '#634921', '#423018', '#392010'], ['#ddd4bc', '#c9bfa8', '#aaa08a', '#867e6a', '#5e5848']),
    // white shirt → white
    ...ramp(['#efe3de', '#9c8684', '#5a4d4a', '#393029'], ['#fbf7ef', '#d6d0c4', '#a49e92', '#6a665e']),
    // orange waistcoat → the suit's tan
    ...ramp(['#d66531', '#944110', '#8c1010', '#5a2808', '#5a0808'], ['#d4ccb4', '#c9bfa8', '#b8ae96', '#9a927e', '#7a7362']),
    // belt → the coat's shade, the buckle brass
    '#d6aa29': '#c8a040', '#8c6d08': '#8a6a20', '#6b514a': '#867e6a', '#5a615a': '#867e6a', '#423029': '#5e5848', '#393831': '#5e5848', '#211c18': '#3a3630', '#212021': '#3a3630',
    // jeans → tan trousers
    // (the jeans' worn patches take the trousers' own shades, so the knees don't look torn)
    ...ramp(['#a5b2ce', '#7b869c', '#5a79ad', '#394d73', '#182839'], ['#b4ab94', '#a89f8a', '#a89f8a', '#827a68', '#5a5446']),
    // boots → brown shoes
    ...ramp(['#8c3421', '#844131', '#6b2010', '#522821', '#4a1008', '#311818'], ['#5a4030', '#4a3424', '#3a2a20', '#2e2018', '#22160f', '#160e0a']),
  },
  recolor: {
    // brown hair → blond
    ...ramp(['#de8e6b', '#ad654a', '#844529', '#522821', '#311c18'], ['#e8c87a', '#c9a35a', '#a8823e', '#7a5c28', '#4a3416']),
    // skin → Spanish
    '#ffdfb5': '#f4d2b0', '#f79e5a': SKIN, '#b54921': '#c08a62',
  },
  // Pomade-sheen strands combed back over his hair (y), the lapels' edges (L), the tie drawn down the shirt (t, T), a white pocket square (w), a watch chain
  // (c); at the back the coat's collar, seam and half belt (L).
  palette: { y: '#f4dc98', L: '#867e6a', t: '#7a2e2e', T: '#4e1c1c', w: '#fbf7ef', c: '#d8b040' },
  views: {
    front: [
      { at: [19, 11], rows: ['..y..y..y..y', '...y..y..y..', '....y..y..y.'] },
      { at: [18, 25], rows: ['L............L', '.L..........L.', '.L....tt....L.', '..L...tT...L..', '..L...tT...L..', '...L..tT..L...', '...L..tT..L...', '....L.TT.L....'] },
      { at: [16, 28], rows: ['ww', 'ww'] },
      { at: [21, 34], rows: ['.cccccc.'] },
    ],
    right: [
      { at: [18, 11], rows: ['..y..y..y..y', '...y..y..y..', '....y..y..y.'] },
      { at: [14, 35], rows: ['LLLLLLLLLLLLLL'] },
      { at: [21, 25], rows: ['LL', 'LL', 'LLt', 'LLT', 'LLt', 'LLT', 'LLt', 'LLT'] },
      { at: [17, 28], rows: ['ww', 'ww'] },
      { at: [19, 34], rows: ['ccccc'] },
    ],
    back: [
      { at: [19, 11], rows: ['..y..y..y..y', '..y..y..y..y', '...y..y..y..', '...y..y..y..'] },
      { at: [17, 25], rows: ['LLLLLLLLLLLLLL'] },
      { at: [24, 27], rows: ['L', 'L', 'L', 'L', 'L', 'L'] },
      { at: [17, 33], rows: ['LLLLLLLLLLLLLL'] },
    ],
  },
  changes: ['pomade-sheen strands combed back', 'lapel edges', 'tie drawn down the shirt', 'pocket square', 'watch chain', 'coat collar, back seam and half belt'],
};
