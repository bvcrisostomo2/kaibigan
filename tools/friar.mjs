// The friars' habit, shared by Dámaso and Sibyla so they wear the same thing. Built on Ledon's
// body: a slight stoop, hands clasped in front (the walk pose, kept for idle as a prayer pose).
// A brown habit, a rounded shoulder cape (capuche) open at the front over the clasped hands, the
// hood hanging down the back, the long front panel as a dark scapular, a white rope cord with
// a knotted end. Original pixels only.
export const ROBE = { light: '#9a6a42', mid: '#7a5233', dark: '#5a3a24', deep: '#3e2818' };
const SCAP = { light: '#5a3a24', mid: '#4a2c18', dark: '#3a2214', deep: '#2e1a0e' };
const CORD = { light: '#ece6da', mid: '#c9c1b2', dark: '#7d7468' };

// Ledon's tabard → the scapular (its gold trim the scapular's edge); white sleeves and green
// trousers → the habit; shoes → dark sandals.
export const HABIT_RECOLOR = {
  '#7382ff': SCAP.light, '#5269ef': SCAP.mid, '#3930ad': SCAP.dark, '#211c63': SCAP.deep,
  '#efae29': SCAP.dark, '#9c6d08': SCAP.deep, '#5a4100': SCAP.deep,
  '#fffbff': ROBE.light, '#b5a6a5': ROBE.mid, '#635552': ROBE.deep,
  '#bdc7a5': ROBE.light, '#949673': ROBE.mid, '#5a5d42': ROBE.dark, '#313829': ROBE.deep,
  '#392018': '#2a1e16', '#5a3429': '#4a3424',
};

export const HABIT_PALETTE = {
  o: '#181410', L: '#b0805a', C: ROBE.mid, c: ROBE.dark, D: '#24160c', // cape: lit, cloth, shade, hood opening
  w: CORD.light, W: CORD.dark, // cord, knot shade
  G: '#8a5c38', g: '#4e321e', // hood: lit edge, cloth
};

// A cape of rows [first, last] (cloth columns) from x0 to x1 with an optional gap per row
// (the neck, then the opening over the hands). Lit along the left edge and across the
// shoulders, shaded on the right; folds read as a lit ridge beside a shadow; the row above
// the hem is a darker band, the hem the outline.
function cape(x0, x1, rows, gaps = [], folds = []) {
  return rows.map(([a, b], j) => {
    const gap = gaps[j];
    let s = '';
    for (let x = x0; x <= x1; x++) {
      if (gap && x >= gap[0] && x <= gap[1]) s += '.';
      else if (x < a - 1 || x > b + 1) s += '.';
      else if (x === a - 1 || x === b + 1 || j === rows.length - 1) s += 'o';
      else if (gap && (x === gap[0] - 1 || x === gap[1] + 1)) s += 'o';
      else if (j === rows.length - 2) s += 'c';
      else if (x < a + 2 || (j >= 1 && j <= 2)) s += 'L';
      else if (x > b - 3) s += 'c';
      else if (j >= 3 && folds.includes(x)) s += 'c';
      else if (j >= 3 && folds.includes(x + 1)) s += 'L';
      else s += 'C';
    }
    return s;
  });
}

const HOOD_BACK = [
  '..ooooooooo..', '.oGgggggggGo.', 'oGgDDDDDDDggo', 'oGggDDDDDgggo', 'oGgggDDDggggo', '.oGgggggggGo.', '.oGgggggggGo.',
  '..oGgggggGo..', '..oGgggggGo..', '...oGgggGo...', '....oGgGo....', '.....ogo.....', '......o......',
];
const CORD_END = ['W', 'w', 'w', 'W', 'w', 'w', 'W', 'o'];

// Layers per view, in Ledon's output coordinates.
export function habitLayers() {
  return {
    front: [
      { at: [19, 40], rows: ['owwwwWwwwwwo', '.oWWWwWWWWo.'] }, // cord tied at the waist
      { at: [27, 42], rows: CORD_END },
      { at: [12, 28], rows: cape(12, 36,
        [[20, 28], [17, 31], [15, 33], [14, 34], [13, 35], [13, 35], [13, 35], [13, 35], [14, 34], [15, 33]],
        [[21, 27], [22, 26], [23, 25], null, null, null, [19, 29], [19, 29], [19, 29], [19, 29]],
        [17, 20, 29, 32]) },
    ],
    right: [
      { at: [20, 40], rows: ['owwwwwWwwwwo', '.oWWWWwWWWo.'] },
      { at: [30, 42], rows: CORD_END },
      { at: [15, 28], rows: cape(15, 38,
        [[22, 30], [19, 32], [18, 33], [17, 34], [16, 35], [16, 35], [16, 35], [16, 35], [17, 35], [18, 34]],
        [[24, 31], [25, 30], [26, 29], null, null, null, [26, 33], [26, 33], [25, 33], [25, 33]],
        [19, 22, 25]) },
    ],
    back: [
      { at: [19, 40], rows: ['owwwwwwwwwwo', '.oWWWWWWWWo.'] },
      { at: [13, 27], rows: cape(13, 37,
        [[21, 29], [18, 32], [16, 34], [15, 35], [14, 36], [14, 36], [14, 36], [14, 36], [14, 36], [15, 35], [16, 34]],
        [], [17, 21, 29, 33]) },
      { at: [19, 26], rows: HOOD_BACK },
    ],
  };
}

// Join a head's layers with the habit's, view by view (the head drawn last).
export function withHabit(heads) {
  const habit = habitLayers();
  return Object.fromEntries(['front', 'right', 'back'].map((v) => [v, [...habit[v], ...(heads[v] ?? [])]]));
}
