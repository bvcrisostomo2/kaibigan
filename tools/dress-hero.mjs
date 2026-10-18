// The player (Don) — a young ilustrado in shirtsleeves: grey waistcoat over a white shirt,
// maroon cravat, grey trousers, brown shoes, neat side-swept quiff. Painted over a kitbash
// composite (tools/kitbash.mjs). Original pixels only: '.' keeps the composite's pixel, '-'
// erases it, letters paint. Coordinates are walk-frame-1 output coordinates (50×70).
//
// Usage: node tools/kitbash.mjs <bodyDir> <bodyDir> hero_kb tools/dress-hero.mjs
const SHOES = {
  '#212021': '#2e211a', '#290400': '#2e211a', '#390400': '#4a3426', '#313431': '#4a3426', '#6b0c08': '#4a3426',
  '#52514a': '#6b4a35', '#b51c18': '#6b4a35', '#6b6d6b': '#8c6448',
  '#363636': '#4a3426', '#232323': '#2e211a', '#51504f': '#6b4a35', // back-view shades
};

export default {
  // Body and head come from the same set: keep the set's own head.
  compose: { front: { bodyFrom: 20, headTo: 19, dx: 0 }, right: { bodyFrom: 20, headTo: 19, dx: 0 }, back: { bodyFrom: 20, headTo: 19, dx: 0 } },
  zones: [
    // below the cuffs the jacket's greys are only its swinging skirt: it becomes trouser cloth
    { fromRow: 42, toRow: 58, map: {
      '#6b6d6b': '#64646c', '#52514a': '#4f4f57', '#313431': '#3b3b42', '#212021': '#26262b',
      '#6f6e6e': '#64646c', '#51504f': '#4f4f57', '#363636': '#3b3b42', '#232323': '#26262b',
    } },
    { fromRow: 59, map: SHOES },
  ],
  // Jacket greys → white shirtsleeves, red shirt and cuffs → white (its dark placket becomes
  // buttons), mustard trousers → grey.
  bodyRecolor: {
    '#6b6d6b': '#f4f0e8', '#52514a': '#d9d2c6', '#313431': '#a69e92', '#212021': '#6e675e',
    '#b51c18': '#f4f0e8', '#6b0c08': '#d9d2c6', '#390400': '#a69e92', '#290400': '#5e5850',
    '#e7a629': '#64646c', '#a56900': '#4f4f57', '#6b4900': '#3b3b42', '#392408': '#26262b',
    '#312821': '#3a2a20', '#73615a': '#7a5a44',
    // The back-view frames use their own, slightly different shades.
    '#6f6e6e': '#f4f0e8', '#51504f': '#d9d2c6', '#363636': '#a69e92', '#232323': '#6e675e',
    '#b51e1e': '#f4f0e8', '#6f0e0e': '#d9d2c6', '#3f0606': '#a69e92', '#290404': '#5e5850',
    '#e2a42c': '#64646c', '#a06a00': '#4f4f57', '#6d4900': '#3b3b42', '#38250a': '#26262b',
    '#261d1b': '#2e211a', '#372926': '#4a3426', '#76605a': '#7a5a44',
  },
  // Hair → black with a cool sheen.
  recolor: {
    '#393029': '#1b1719', '#52494a': '#2d272a', '#948a84': '#5d5459', '#736963': '#433b40', '#211c18': '#0e0c0d',
    '#241e1c': '#0e0c0d', '#524a48': '#2d272a', '#38312e': '#1b1719', '#918984': '#5d5459', '#716966': '#433b40', '#1f1513': '#0e0c0d',
  },
  palette: {
    o: '#181410', // outline
    k: '#0e0c0d', h: '#1b1719', H: '#2d272a', J: '#433b40', I: '#5d5459', // hair
    F: '#f7dfbd', d: '#e79e6b', e: '#a55131', // skin (the head's own tones)
    W: '#f4f0e8', G: '#d9d2c6', // shirt
    m: '#a8384a', M: '#c25466', n: '#6e1a2a', // maroon cravat: base, light, dark
    A: '#9a9ca3', V: '#7c7f86', v: '#5e6168', D: '#45474d', b: '#2b2b30', // grey waistcoat, buttons
    1: '#64646c', 2: '#4f4f57', 3: '#3b3b42', 4: '#26262b', // charcoal trousers
    R: '#522818', y: '#c9a55a', // skin outline, buckle
  },
  views: {
    front: [
      { // a soft, messy fringe swept to one side, falling to just above the eyes (unlike Ibarra's pompadour)
        at: [17, 8],
        rows: [
          '-----------------',
          '------ooooo------',
          '----ooHJJHHoo----',
          '---oHJJHhhhHHo---',
          '--oHJHhhhHhhhHho-',
          '.ohHhhhhHhhhHhhko',
          '.ohhhhhHhhhHhhko.',
          '.ohhhhHhhhHhhhko.',
          '.okhhHhhhHhhhhko.',
          '.okhHhhhHhhhdhko.',
          '.okehdhFhdFhFeko.',
          '....doo...ood....',
        ],
      },
      { // white collar points, maroon cravat, grey waistcoat; shirt tucked into the trousers
        at: [16, 25],
        rows: [
          '.....oWGnmnGWo.....',
          '.....VWGnMnGWV.....',
          '....VVvWmnmWvVV....',
          '....AVVvWmWvVvD....',
          '....AVVVvnvVVvD....',
          '....AVVVVbVVvvD....',
          '....AVVVVvVVvvD....',
          '......AVVbVvD......',
          '......AVVvVvD......',
          '.....AVVVbVVvD.....',
          '.....AVVVvVVvD.....',
          '.....AVVVbVVvD.....',
          '.....AVVVvVVvD.....',
          '.....AVVvovVvD.....',
          '.....D1122221D.....',
          '.....122232223.....',
          '.....122232223.....',
          '.....122232223.....',
          '....12223222334....',
          '....12223222334....',
          '....12223222334....',
        ],
      },
    ],
    right: [
      { // the same fringe in 3/4: a rounded top (no forward roll), its tips over the brow
        at: [17, 8],
        rows: [
          '-----------------',
          '-------ooooo-----',
          '----oooHJJHhoo---',
          '--ooHHJJHhhhhho--',
          '.ohHJHhhhHhhhhko-',
          'ohhhhhhHhhhHhhko-',
          'ohhhhhhhhhhhkko--',
          'ohhhhhhHhhhHhR---',
          'ohhhhhhhHhhhhR---',
          'ohhhhkdhhhHhhR---',
          'ohhhokdhFhFhdR---',
          '.......doo.......',
        ],
      },
      {
        at: [18, 25],
        rows: [
          '.....GWnmWo..',
          '...VVWnMnWv..',
          '..AVVvWmnWvD.',
          '..AVVVvmvD...',
          '..AVVVVnvD...',
          '..AVVVVbVvD..',
          '..AVVVVvVvD..',
          '.....AVVbVvD.',
          '.....AVVvVD..',
          '.....AVbVvD..',
          '....AVVvVvD..',
          '....AVVbVvD..',
          '....AVVvVvD..',
          '....vD11.....',
          '....1122.....',
          '....1122.....',
          '....1122.....',
          '....112......',
          '....112......',
          '....12.......',
          '...122.......',
        ],
      },
      // the vest's far side, then a sliver of the far arm's white sleeve behind it (over the base sprite's open-jacket edge)
      { at: [27, 28], rows: ['.vDo....', '.vDo....', '.vDDo...', '.vDoGo..', '.vDDoGo.', '.vDDoGo.', '.vDDoGo.', '.vDDoWGo', '.vDDoWGo', '.vDDoWGo'] },
      // in this stride the near arm swings clear of the hip: the jacket flap it uncovers becomes the vest's side
      { only: ['walk_right/02.png'], at: [20, 32], rows: ['..v', '.Dv', '.Dv', '.D.', '.D.', '.D.', '.D.', 'oD.', 'oD.'] },
    ],
    back: [
      { at: [23, 8], rows: ['.oooo.', 'ohHHho'] }, // the quiff's crest above the crown
      {
        at: [20, 24],
        rows: [
          '..GWWWWWG..',
          '...........',
          '...........',
          '.AVVVDVVvD.',
          '.AVVVDVVvD.',
          '.AVVVDVVvD.',
          '.AVVVDVVvD.',
          '..AVVDVvD..',
          '..AVVDVvD..',
          '..AVVDVvD..',
          '..AVVDVvD..',
          '..AbbybbD..',
          '..AVVDVvD..',
          '..AVVDVvD..',
          '..DDDDDDD..',
          '.122232223.',
          '.122232223.',
          '.122232223.',
          '.122232223.',
          '.122232223.',
          '.122232223.',
          '.122232223.',
        ],
      },
    ],
  },
};
