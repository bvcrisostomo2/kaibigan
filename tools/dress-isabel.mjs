// Tía Isabel — Capitán Tiago's elderly cousin in baro't saya: a sheer white camisa, a stiff
// embroidered pañuelo folded over the shoulders, a dark knee-length tapis over a floor-length
// saya in broad red-and-black stripes (1880s), greying hair in a bun. Painted over a kitbash
// composite (tools/kitbash.mjs). Original pixels only: '.' keeps the composite's pixel, '-'
// erases it, letters paint. Coordinates are walk-frame-1 output coordinates (50×70).
//
// Usage: node tools/kitbash.mjs <bodyDir> <bodyDir> isabel_kb tools/dress-isabel.mjs
const OLIVE = ['#8c9a63', '#6b7142', '#4a5529', '#393c21'];
const CREAM = ['#efe3a5', '#bdae7b', '#84795a', '#5a5139'];
const CAMISA = ['#f0ece4', '#d4cdbf', '#a8a092', '#6e675c'];
const TAPIS = ['#4a3c40', '#382c30', '#281e22', '#181214'];
const RED = ['#c4384a', '#9a2434', '#6e1824', '#3e0c14'];
const BLACK = ['#4a4246', '#332c30', '#221c20', '#120e10'];
const HAIR = ['#6e625c', '#4e4440', '#362d2a', '#201816'];
const map = (from, to) => Object.fromEntries(from.map((c, i) => [c, to[i]]));
const cloth = (to) => ({ ...map(OLIVE, to), ...map(CREAM, to) });
const stripes = (x0) => ({ width: 2, maps: [cloth(RED), cloth(BLACK)], x0 });

// Per view: the columns of the body between the arms (hips) and of the full skirt below them.
const VIEW = {
  front: { hips: [18, 32], skirt: [17, 33] },
  right: { hips: [19, 30], skirt: [15, 31] },
  back: { hips: [19, 31], skirt: [17, 33] },
};
const zones = Object.entries(VIEW).flatMap(([view, { hips, skirt }]) => [
  { view, fromRow: 41, toRow: 51, cols: hips, map: cloth(TAPIS) }, // tapis to the knee
  { view, fromRow: 52, cols: skirt, stripes: stripes(skirt[0]) }, // the saya below it
]);

// The saya carried to the floor, flaring like a bell, in the same stripes as the zones above.
// rows: [[first, last], ...] skirt columns per row, top to bottom; the last row is the hem line.
function hem(x0, x1, rows) {
  return rows.map(([a, b], j) => {
    let s = '';
    for (let x = x0; x <= x1; x++) {
      if (x < a - 1 || x > b + 1) s += '-';
      else if (x === a - 1 || x === b + 1 || j === rows.length - 1) s += 'o';
      else {
        const black = Math.floor((x - x0) / 2) % 2 === 1;
        const shade = x < a + (b - a) / 3 ? 0 : x > b - (b - a) / 3 ? 2 : 1;
        s += (black ? 'JKL' : 'SRQ')[Math.min(2, shade + (j >= rows.length - 2 ? 1 : 0))];
      }
    }
    return s;
  });
}

// The pañuelo: across the shoulders, then a V to a point on the chest (and on the back).
const PANUELO = [
  '..qPPPPpPPPpPPPPq..',
  '.qPPxPPPpPpPPPxPPq.',
  'qPPPPxPPPpPPPxPPPPq',
  '..qPPPxPPpPPxPPPq..',
  '....qPPPPpPPPPq....',
  '.....qPPxpxPPq.....',
  '......qPPpPPq......',
  '.......qPpPq.......',
  '........qPq........',
  '.........q.........',
];

export default {
  compose: { front: { bodyFrom: 20, headTo: 19, dx: 0 }, right: { bodyFrom: 20, headTo: 19, dx: 0 }, back: { bodyFrom: 20, headTo: 19, dx: 0 } },
  zones,
  // the dress above the waist is the camisa; the kerchief is her hair (its knot the bun)
  bodyRecolor: { ...map(OLIVE, CAMISA), ...map(CREAM, HAIR) },
  recolor: { ...map(CREAM, HAIR), '#4a2c08': '#362d2a', '#6b3c18': '#4e4440', '#945929': '#6e625c', '#311c08': '#201816' },
  palette: {
    o: '#181410',
    P: '#f2e6c6', p: '#d8c69a', q: '#a8946a', x: '#c04a4a', // pañuelo: ivory, fold, edge, embroidery
    S: RED[0], R: RED[1], Q: RED[2], J: BLACK[0], K: BLACK[1], L: BLACK[2],
  },
  views: {
    front: [
      { at: [16, 30], rows: PANUELO },
      { at: [17, 57], rows: hem(17, 33, [[19, 31], [19, 31], [18, 32], [18, 32], [17, 33], [17, 33], [17, 33], [17, 33]]) },
      { at: [17, 65], rows: ['-----------------', '-----------------'] },
    ],
    right: [
      { at: [15, 30], rows: PANUELO },
      { at: [15, 57], rows: hem(15, 31, [[16, 29], [16, 29], [15, 30], [15, 30], [15, 31], [15, 31], [15, 31], [15, 31]]) },
      { at: [14, 65], rows: ['------------------', '------------------'] },
    ],
    back: [
      { at: [16, 30], rows: PANUELO },
      { at: [17, 57], rows: hem(17, 33, [[19, 31], [19, 31], [18, 32], [18, 32], [17, 33], [17, 33], [17, 33], [17, 33]]) },
      { at: [17, 65], rows: ['-----------------', '-----------------'] },
    ],
  },
};
