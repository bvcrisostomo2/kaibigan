// Capitán Tiago — short, stout and well-to-do: white camisa, black trousers and shoes, black
// hair, clean-shaven. Painted over a kitbash composite (tools/kitbash.mjs). Original pixels
// only: '.' keeps the composite's pixel, '-' erases it, letters paint. Coordinates are
// walk-frame-1 output coordinates (50×70).
//
// Usage: node tools/kitbash.mjs <bodyDir> <bodyDir> tiago_kb tools/dress-tiago.mjs
const CAMISA = ['#f6f2ea', '#e2dccf', '#c7bfb0', '#a0978a', '#7a7266'];
const BLACK = ['#4a4650', '#38343e', '#2a272f', '#1f1c23', '#141216'];
const OVERALLS = ['#39a684', '#29866b', '#186d52', '#185542', '#103429'];

export default {
  compose: { front: { bodyFrom: 20, headTo: 19, dx: 0 }, right: { bodyFrom: 20, headTo: 19, dx: 0 }, back: { bodyFrom: 20, headTo: 19, dx: 0 } },
  // Below the waist the overalls are his trousers.
  zones: [{ fromRow: 42, map: Object.fromEntries(OVERALLS.map((c, i) => [c, BLACK[i]])) }],
  bodyRecolor: {
    // shirt and overall bib → one white camisa
    '#bddf73': CAMISA[0], '#a5c35a': CAMISA[1], '#8ca252': CAMISA[2], '#73864a': CAMISA[3], '#5a6939': CAMISA[4],
    ...Object.fromEntries(OVERALLS.map((c, i) => [c, CAMISA[i]])),
    // boots → black shoes
    '#d61494': '#5a4a50', '#940c63': '#3a3036', '#6b1452': '#2a2228', '#421831': '#1a1418',
  },
  // hair → black; eyes → dark brown (the head comes from the un-recoloured source)
  recolor: { '#7b799c': '#4a4552', '#5a556b': '#2e2a32', '#42454a': '#1e1b20', '#102039': '#0e0c0e', '#63aaff': '#3a2418' },
  palette: { o: '#080808', F: '#f7be7b', d: '#c67531', e: '#943c18' },
  views: {
    front: [{ // clean-shaven: skin over the beard and moustache
      at: [19, 23],
      rows: ['.e.........e.', '..d.dFFFd.d..', '...oddFddo...', '....oedeo....'],
    }],
    right: [{
      at: [20, 22],
      rows: ['.e.........', '.e.......e.', '.e..dFFddo.', '..oed...d..', '..ooeddeo..'],
    }],
  },
};
