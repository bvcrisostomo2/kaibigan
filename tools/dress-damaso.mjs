// Padre Dámaso — the Franciscan: a stern old man (narrowed eyes), a bald crown ringed by grey-white hair combed
// down from the crown and back from a receding, creased brow; in the friars' habit (tools/friar.mjs) on Ledon's body — a slight
// stoop, hands clasped in front — with Male 12's older head. Painted over a kitbash composite
// (tools/kitbash.mjs). Original pixels only: '.' keeps the composite's pixel, '-' erases it,
// letters paint. Coordinates are walk-frame-1 output coordinates (50×70).
//
// Usage: node tools/kitbash.mjs <ledonDir> <male12Dir> damaso_kb tools/dress-damaso.mjs
import { HABIT_RECOLOR, HABIT_PALETTE, withHabit } from './friar.mjs';

// grey-white: he is old
const HAIR = { k: '#4e4a48', h: '#7e7874', H: '#b8b2ac' };

// Head layers drawn for Male 12's own frame, moved to where its head now sits on Ledon's body.
const at = ([x, y], [dx, dy]) => [x + dx, y + dy];
const FRONT = [-1, 1];
const RIGHT = [3, 1];

export default {
  // Male 12's chin row on Ledon's collar row.
  compose: {
    front: { bodyFrom: 28, headTo: 21, dx: FRONT[0] },
    right: { bodyFrom: 28, headTo: 21, dx: RIGHT[0] },
    back: { bodyFrom: 26, headTo: 20, dx: 0 },
  },
  idleFromWalk: true, // hands clasped in front when standing
  bodyRecolor: HABIT_RECOLOR,
  // Male 12's long grey hair → his dark greying hair
  recolor: {
    '#efebef': HAIR.H, '#efe7e7': HAIR.H, '#ada2a5': HAIR.H, '#a5a2a5': HAIR.H, '#a5a29c': HAIR.H, '#ad9e9c': HAIR.H, '#a59e94': HAIR.H,
    '#7b7d7b': HAIR.h, '#7b7d73': HAIR.h, '#6b655a': HAIR.h, '#4a4142': HAIR.k, '#4a4539': HAIR.k, '#4a4542': HAIR.k, '#4a4942': HAIR.k,
    '#292821': HAIR.k, '#292c21': HAIR.k,
  },
  palette: { ...HABIT_PALETTE, ...HAIR, F: '#ffdfb5', d: '#f79e5a', e: '#b54921', R: '#522818', B: '#2e2826', E: '#fffbff', x: '#1e1612' }, // brows, eye white, pupil
  views: withHabit({
    front: [
      { // a round head: the bald crown on top, the ring of hair combed back, receding temples
        at: at([18, 9], FRONT),
        rows: [
          '---------------',
          '---------------',
          '---------------',
          '-----ooooo-----',
          '---ooFFFFdoo---',
          '--ohhFFFFdhho--',
          '-ohhHhhhhhhHho-',
          '-oHdFhhhhhFdHo-',
          '-oHdFFdhdFFdHo-',
          '-oHdFdddddFdHo-',
          '-oHdFFFFFFFdHo-',
          '-oHdFFFFFFFdHo-',
        ],
      },
      // no brows (the lash line reads as one); narrowed eyes — lashes, white and pupil, a skin lower lid
      { at: [20, 20], rows: ['dF.....Fd', '.FFF.FFF.', '.oo...oo.', '.Ex...xE.', '.dd...dd.'] },
      { at: [10, 12], rows: Array(12).fill('------') }, // Male 12's long hair beside the head
      { at: [33, 12], rows: Array(12).fill('------') },
    ],
    right: [
      { // a round skull, the bald crown over the top and back; below it the hair runs straight down, as from behind
        at: at([12, 9], RIGHT),
        rows: [
          '-------------------',
          '-------------------',
          '-------------------',
          '--------oooo-------',
          '------ooFFFFoo-----',
          '-----oFFFFFFdhHoo--',
          '-----ohFFFFdhHhhko-',
          '-----ohHhHhhhhdFFR-',
          '-----ohHhHhhkdFdFR.',
          '-----ohHhHhkdFFFFR.',
          '------oHhHkdFFFFFR.',
          '------ohhokdFFFFFR.',
          '------ohde.........',
          '------ohde.........',
          '------oo...........',
          '-----..............',
          '----',
          '----',
        ],
      },
      { at: [26, 20], rows: ['dF.....', '.FFF.F.', '.oo..oR', '.Ex..xR', '.dd..dR'] }, // the same eyes in 3/4; a small far eye, a skin outline (not a black block)
    ],
    back: [
      { // the bald crown from behind, the ring of hair round it, a neat nape — three rows shorter than the base head
        at: [18, 9],
        rows: [
          '---------------',
          '---------------',
          '---------------',
          '---------------',
          '-----ooooo-----',
          '---ooFFFFdoo---',
          '--oFFFFFFFFdo--',
          '-ohhFFFFFFdhho-',
          '-ohhHhFFdhHhho-',
          '-ohhHhhHhhHhho-',
          '-ohhHhhHhhHhho-',
          '-ohhHhhHhhHhho-',
          '-ohhHhhHhhHhho-',
          '-okhHhhHhhHhko-',
          '-dokhhhhhhhkod-',
          '-eoodddddddooe-',
        ],
      },
    ],
  }),
};
