// Alférez Guevarra — the old lieutenant of the Guardia Civil: black patent tricornio over short
// grey hair, a bushy grey moustache; navy double-breasted coat with a red stand collar, brass
// buttons and a black belt; white gloves, grey trousers, black boots. Painted over a kitbash
// composite (tools/kitbash.mjs). Original pixels only: '.' keeps the composite's pixel, '-'
// erases it, letters paint. Coordinates are walk-frame-1 output coordinates (50×70).
//
// Usage: node tools/kitbash.mjs <bodyDir> <bodyDir> guevarra_kb tools/dress-guevarra.mjs
const NAVY = { lightest: '#7487b3', lighter: '#5b6f9e', light: '#4a5c88', mid: '#3e4e78', dark: '#28324f', deep: '#181e33' };
const GREY = ['#a3a6ae', '#7d808a', '#5a5d66', '#3a3c44'];
const WHITE = ['#f0ede6', '#c8c2b4', '#8a8478'];
const BLACK = ['#4a4448', '#2e2a2e', '#1a1618'];
const pair = (a, b, to) => ({ [a]: to, [b]: to });
const RED = [['#ce2021', '#ce2127'], ['#731818', '#76181f'], ['#4a1000', '#491003']];
const SKINLIKE = [['#8c6d6b', '#8d6f69'], ['#634d4a', '#624e4a'], ['#372d2b']]; // gloves and boots share these

const map = (groups, to) => Object.fromEntries(groups.flatMap((cs, i) => cs.map((c) => [c, to[i]])));

export default {
  compose: { front: { bodyFrom: 20, headTo: 19, dx: 0 }, right: { bodyFrom: 20, headTo: 19, dx: 0 }, back: { bodyFrom: 20, headTo: 19, dx: 0 } },
  zones: [
    { fromRow: 30, toRow: 46, map: map(SKINLIKE, WHITE) }, // white gloves
    { fromRow: 47, map: { ...map(RED, GREY), ...map(SKINLIKE, BLACK) } }, // grey trousers, black boots
  ],
  recolor: {
    // tunic → navy
    ...pair('#74b5ff', '#73b6ff', NAVY.lightest), ...pair('#7386ff', '#7784ff', NAVY.lighter), ...pair('#a361e1', '#a561e7', NAVY.light),
    ...pair('#5230b5', '#5331b2', NAVY.mid), ...pair('#312063', '#322064', NAVY.dark),
    // red sleeves → the coat's navy
    ...map(RED, [NAVY.mid, NAVY.dark, NAVY.deep]),
    // the sash and the ruff fold into the coat: they become navy too
    ...pair('#f7d023', '#f7d321', NAVY.light), ...pair('#9d8004', '#9c8200', NAVY.mid), '#5a4900': NAVY.dark,
    ...pair('#f3f0d0', '#f7f3d6', NAVY.lighter), ...pair('#bdb26b', '#b9b26b', NAVY.light), ...pair('#847939', '#827b3a', NAVY.dark), ...pair('#424121', '#434026', NAVY.deep),
    // hair → grey
    '#b7b4b2': GREY[0], '#b5b6b5': GREY[0], '#7e7b79': GREY[1], '#7b797b': GREY[1], '#575453': GREY[2], '#525552': GREY[2],
  },
  palette: {
    o: '#181410', K: '#1c1a22', k: '#3e3c4c', c: '#c42a2a', // tricornio: patent black, shine, red cockade
    H: '#8a8d96', M: '#a8abb2', m: '#6e717a', n: '#50535c', k: '#34363c', // short grey hair, moustache, shadow, deep shadow
    d: '#f09d59', e: '#b44b23', F: '#ffdfb6', // skin
    r: '#c42a2a', R: '#7a1414', // red collar
    y: '#e8c050', Y: '#9a7a24', // brass
    B: '#1a1618', b: '#3a3438', // belt
  },
  views: {
    front: [
      { // tricornio worn low and snug, its brim shading the brow; short grey hair, moustache, no beard
        at: [17, 6],
        rows: [
          '-----------------',
          '....ooooooooo....',
          '..ooKKKKKKKKKoo..',
          '.oKkKKKKKKKKKkKo.',
          '.oKKKKKKKKKKKKKo.',
          '.oKKKKKKKKKKKKKo.',
          'okkKKKKKcKKKKKkko',
          '.ooooKKKKKKKoooo.',
          '--oHdddddddddHo--',
          '--oH.........Ho--',
          '--oe.........eo--',
          '--od.........do--',
          '--oe.........eo--',
          '---o.........o---',
          '---o.mMM.MMm.o---',
          '---omMMMMMMMmo---',
          '---oed.....deo---',
          '.....oedddeo.....',
        ],
      },
      { at: [13, 13], rows: Array(11).fill('----') },
      { at: [34, 13], rows: Array(9).fill('---') },
      { // red stand collar; brass buttons in two rows; black belt with a brass buckle
        at: [19, 24],
        rows: [
          '..rrrrrrr..',
          '..RrrrrrR..',
          '...........',
          '....y...y..',
          '...........',
          '....y...y..',
          '...........',
          '....y...y..',
          '...........',
          '.BBBBByBBBB',
          '.bbbbbYbbbb',
        ],
      },
    ],
    right: [
      { // tricornio in 3/4 (points to the back and the front), short grey hair, moustache
        at: [14, 5],
        rows: [
          '--------------------',
          '......oooooooo......',
          '....ooKKKKKKKKoo....',
          '..ooKkKKKKKKKKKKoo..',
          '.oKKKKKKKKKKKKKKKKo.',
          'okKKKKKKKKcKKKKKKkko',
          '.ookkKKKKKKKKKKkkoo.',
          '...oooKKKKKKKKooo...',
          '---oHHHHHddddddR----',
          '---oHHHH.......o----',
          '---oHHH.........o---',
          '---oHH..........o---',
          '---oHe..............',
          '---oHe..............',
          '----oe..............',
          '-----o..............',
          '------od..mMM.......',
          '------....m.........',
          '-----...............',
          '----................',
        ],
      },
      { at: [21, 22], rows: ['.rrrrrrr', '.RrrrrrR'] },
      { at: [25, 27], rows: ['..y', '...', '..y', '...', '..y'] },
      { at: [21, 33], rows: ['BBBBByBBBB', 'bbbbbYbbbb'] },
    ],
    back: [
      { at: [17, 7], rows: ['....ooooooooo....', '..ooKKKKKKKKKoo..', '.oKkKKKKKKKKKkKo.', '.oKKKKKKKKKKKKKo.', '.oKKKKKKKKKKKKKo.', 'okkKKKKKKKKKKKkko', '.ooooKKKKKKKoooo.'] },
      {
        at: [17, 14],
        rows: [
          '..onnmnnnmnnnno..',
          '..onnmnnnmnnnno..',
          '..onmnnnnnmnnno..',
          '..onnnnnnnnnnno..',
          '..oonnnkkknnnoo..',
          '..eooknkkknkooe..',
          '...ooookkkoooo...',
          '....oFFFFFFFo....',
        ],
      },
      { at: [20, 33], rows: ['BBBBBBBBBBB', 'bbbbbbbbbbb'] },
      { at: [13, 12], rows: Array(11).fill('-----') },
      { at: [32, 12], rows: Array(10).fill('-----') },
    ],
  },
};
