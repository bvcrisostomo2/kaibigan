// Padre Sibyla — the young friar: a bowl cut with the tonsure showing on the crown, in the same
// habit as Dámaso (tools/friar.mjs), on Ledon's own body and head: a slight stoop, hands
// clasped in front. Painted over a kitbash composite (tools/kitbash.mjs). Original pixels only.
//
// Usage: node tools/kitbash.mjs <ledonDir> <ledonDir> sibyla_kb tools/dress-sibyla.mjs
import { HABIT_RECOLOR, HABIT_PALETTE, withHabit } from './friar.mjs';

export default {
  compose: { front: { bodyFrom: 20, headTo: 19, dx: 0 }, right: { bodyFrom: 20, headTo: 19, dx: 0 }, back: { bodyFrom: 20, headTo: 19, dx: 0 } },
  idleFromWalk: true, // hands clasped in front when standing
  recolor: {
    ...HABIT_RECOLOR,
    // hair → dark brown
    '#52494a': '#2e2420', '#8c8284': '#5a4a40', '#292421': '#1a1412', '#6b615a': '#4a3c34', '#4a3c31': '#2e2420',
  },
  palette: { ...HABIT_PALETTE, F: '#ffdfb5', d: '#f79e5a', e: '#b54921', R: '#522818', E: '#fffbff' },
  views: withHabit({
    front: [
      { at: [22, 16], rows: ['.ooo.', 'oFFdo'] }, // the tonsure just showing at the top of the bowl
      // a calm face under the fringe: lashes, white eyes with dark pupils, no mouth
      { at: [18, 25], rows: ['odFooFFFooFdo', 'odFEoFFFoEFdo', '.oeFFFFFFFeo.', '...oeddddeo..'] },
    ],
    right: [
      { at: [25, 16], rows: ['.ooo.', 'oFFdo'] },
      { at: [24, 25], rows: ['dFooFFFoFR', 'dFEoFFFoFR', 'edFFFFFFFR', '.eddddddeR'] },
    ],
    back: [{ at: [22, 17], rows: ['.oFFFo.', 'oFFFFdo', '.oFFdo.'] }],
  }),
};
