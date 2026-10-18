// The fisherman (mangingisda): a broad, weathered man fishing from the bridge, in a coarse camisa
// under an open barong, dark trousers, barefoot, his grey hair under a cream headscarf, a folded
// net over his shoulder. Body and head: Thief (.packs/thief); his green bandana becomes the headscarf,
// his brown vest the open barong, his grey belt a dark sash, his blue trousers dark, his boots bare
// feet. Changes beyond colour: the camisa painted over his bare chest, the net over his shoulder with
// its floats. Painted over a kitbash composite (tools/kitbash.mjs); built by:
// node tools/build-sets.mjs fisherman
const SAME_PACK = { bodyFrom: 22, headTo: 21, dx: 0 };
const SKIN = '#c68b5e';
const BARONG = ['#d4cab0', '#b8ae94', '#968c74', '#6e6654'];
const FEET = 58; // output row: below it the boots are bare feet

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  // The boots share the vest's browns, so the feet are recoloured on their own rows.
  zones: [{ fromRow: FEET, map: { '#9c7542': SKIN, '#734521': '#94603c', '#4a2810': '#74462a', '#311c08': '#4e2c1a' } }],
  bodyRecolor: {
    // brown vest → the open barong
    '#9c7542': BARONG[0], '#734521': BARONG[1], '#4a2810': BARONG[2], '#311c08': BARONG[3],
    // grey belt → a dark sash
    '#d6dfde': '#6a6250', '#9ca6ad': '#4a4436', '#636d6b': '#3a3428', '#393c39': '#26221a',
    // blue trousers → dark
    '#5a8ea5': '#5e5646', '#31617b': '#4a4436', '#18304a': '#2e2a20',
  },
  recolor: {
    // green bandana → cream headscarf
    '#94c34a': '#ece4cc', '#4a9229': '#d8d0b8', '#316508': '#b0a68c', '#214110': '#7a7260',
    '#d6ffef': '#ece4cc', '#52ba8c': '#d8d0b8', '#399673': '#b0a68c', '#216d52': '#8a8270', '#105139': '#6a6250',
    // his hair → grey
    '#4a4142': '#4a4a4a', '#7b6d6b': '#6a6a6a', '#292421': '#2e2e2e',
  },
  // A coarse camisa painted over his bare chest (c, its placket and shade C); a folded net over his
  // left shoulder and down his back (n, N its knots, f its floats); a dark sash's knot at the back (k).
  palette: { c: '#e2d8c0', C: '#b8ae94', n: '#8a8270', N: '#5a5444', f: '#c8743a', k: '#26221a' },
  views: {
    front: [
      { at: [20, 25], rows: ['c.......c', 'cc.....cc', ...Array(9).fill('ccccCcccc'), 'CCCCCCCCC'] },
      { at: [29, 22], rows: ['NnNnN', 'nNnNf', 'NnNnN', 'nNnNn', 'NnNnN', 'nNnNf', 'NnNnN', 'nNnNn', 'NnNnN', 'nNnNf', 'NnNnN', 'nNnNn', 'NnNnN', 'nNnNf', 'NnNnN'] },
    ],
    right: [
      { at: [22, 25], rows: [...Array(10).fill('ccccCc'), 'CCCCCC'] },
      { at: [17, 22], rows: ['NnNn', 'nNnf', 'NnNn', 'nNnN', 'NnNn', 'nNnf', 'NnNn', 'nNnN', 'NnNn', 'nNnf', 'NnNn', 'nNnN', 'NnNn'] },
    ],
    back: [
      { at: [15, 23], rows: ['NnNnNn', 'nNnNnf', 'NnNnNn', 'nNnNnN', 'NnNnNn', 'nNnNnf', 'NnNnNn', 'nNnNnN', 'NnNnNn', 'nNnNnf', 'NnNnNn', 'nNnNnN', 'NnNnNn', 'nNnNnf', 'NnNnNn', 'nNnNnN'] },
      { at: [23, 39], rows: ['kkk', 'k.k', 'k..'] },
    ],
  },
  changes: ['camisa painted over his bare chest', 'folded net with floats over the shoulder and down the back', 'sash knot', 'cream headscarf'],
};
