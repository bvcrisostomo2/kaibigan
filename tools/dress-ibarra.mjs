// Ibarra's own hair and clothing, painted over a kitbash composite (tools/kitbash.mjs).
// Original pixels only: '.' keeps the composite's pixel, '-' erases it, letters paint.
// Coordinates are walk-frame-1 output coordinates (50×70); layers follow each frame's bob.
//
// Usage: node tools/kitbash.mjs <bodyDir> <headDir> ibarra_kb tools/dress-ibarra.mjs
export default {
  palette: {
    o: '#181410', R: '#522818', // outline, skin outline
    k: '#0d0b10', h: '#241f2a', H: '#3d3546', J: '#5e5468', I: '#7d7290', // hair: deep → shine
    F: '#ffdfb5', d: '#f79e5a', e: '#b54921', // skin (matches the head's tones)
    W: '#f7f3ea', G: '#d2cabb', // shirt collar
    p: '#7d7488', P: '#504a5a', K: '#a99fb6', // silk ascot
    L: '#7a5f50', l: '#5e483c', M: '#3f2f28', n: '#2a201c', // waistcoat, buttons
    y: '#e1bb5c', Y: '#9a7a2e', // watch chain
    U: '#6e5a50', u: '#54443d', c: '#3e322d', q: '#2c2320', Q: '#1d1715', '!': '#33282a', // coat, lapel
    r: '#4d4549', t: '#363034', T: '#262124', // trousers
  },
  // Kamandol's body → Ibarra: white coat → brown wool, gold trim → brown piping, grey lapels →
  // dark brown, red cravat → lilac-grey ascot, olive trousers → grey-brown, boots → dark leather.
  bodyRecolor: {
    '#efebe7': '#6e5a50', '#c6c3ad': '#54443d', '#8c8a7b': '#3e322d', '#4a4d42': '#2c2320',
    '#c6aa52': '#7a6252', '#8c6d18': '#4a3a32',
    '#5a595a': '#33282a', '#313431': '#1d1715',
    '#5a0000': '#504a5a', '#ad2021': '#a99fb6', '#7b0c08': '#7d7488',
    '#313021': '#262124', '#525939': '#363034', '#7b8252': '#4d4549',
    '#292818': '#1f1a1e', '#4a4121': '#3a3036', '#6b5d42': '#5a4c50',
  },
  // Head's hair tones → Ibarra's near-black hair with a violet sheen.
  recolor: { '#211442': '#0d0b10', '#42304a': '#241f2a', '#5a494a': '#3d3546', '#736963': '#3d3546', '#948e84': '#5e5468' },
  views: {
    front: [
      { // pompadour: crest swept up to his right, forehead clear, brows over the eyes
        at: [17, 7],
        rows: [
          '---ooooo-------',
          '--oJIJHHoooooo-',
          '-oJIJHHhhhhhhko',
          'oJJHHhhhhhJHhko',
          'oHHhhhhkhhhhkko',
          '-ohhhhkhhhhhko-',
          '-okhkeddehhkko-',
          '-okedFFFFdehko-',
          '-okedFFFFFdeko-',
          '-okekkdFdkkeko-',
        ],
      },
      { // wing collar, ascot, open frock coat over the waistcoat, coat skirts parted
        at: [17, 22],
        rows: [
          '..oQWWpKpWWQo...',
          '...!GWPKPWG!....',
          '...!LGpKpGl!....',
          '..Q!LLpPplM!Q...',
          '..Q!LLlplMl!Q...',
          '...!LLlnlMl!....',
          '...!LLlllMl!....',
          '...!LLlllMl!....',
          '...!LLlnlMl!....',
          '...!LLlllMl!....',
          '...!LLlllMl!....',
          '...!LLlnlMl!....',
          '...!Lylllyl!....',
          '...!LLYyYMl!....',
          '...!LLlnlMl!....',
          '...!LLlllMl!....',
          '...!LlMMMMl!....',
          '...!lMoroMl!....',
          '..uUUuoroucc....',
          '..uUUUotouUuc...',
          '..uUUUotouUuc...',
          '..uUUUotouUuc...',
          '..uUUUotouUuc...',
          '...UuortToqU....',
          '...UuortToqU....',
          '...UuortToqU....',
          '...UuortToqU....',
          '...UuortToqU....',
          '...UuortToqU....',
          '...UuortToqU....',
          '...UuortToqU....',
          '...UuortToqU....',
          '...UuortToqU....',
          '.....oTtTo......',
          '......tot.......',
        ],
      },
    ],
    right: [
      { // pompadour in 3/4: crest high over the brow, swept back, sideburn before the ear
        at: [17, 5],
        rows: [
          '........oooo....',
          '.....oooHJIJo---',
          '...ooHHJIJHHhko-',
          '..oHHJJHHhhhhhko',
          '.oHJHHhhhhhhhkko',
          'oHHhhhhhhhhhkko-',
          'ohhhhhkhhhhkko--',
          'ohhhhhhhkFFFdR--',
          'ohhhhhhkdFFFFR--',
          'ohhhhhke......--',
          'ohhhokk.......--',
        ],
      },
      {
        at: [19, 22],
        rows: [
          '.QGWWpKpWQ...',
          '..!GWPKPG!...',
          '..!LGpKpl!...',
          '..!LLpPpM!...',
          '..!LLlplM!...',
          '..!LLlnlM!...',
          '..!LLlllM!...',
          '..!LLlllM!...',
          '..!LLlnlM!...',
          '..!LLlllM!...',
          '..!LLlllM!...',
          '..!LLlnlM!...',
          '..!LyllyM!...',
          '..!LLYyYM!...',
          '..!LLlnlM!...',
          '..!LLlllM!...',
          '..!LlMMMM!...',
          '..!lMoroM!...',
          '..uUuoroucc..',
          '..uUUotouc...',
          '..uUUotouc...',
          '..uUUotouc...',
          '..uUUotouc...',
          '..UuortToq...',
          '..UuortToq...',
          '..UuortToq...',
          '..UuortToq...',
          '..UuortToq...',
          '..UuortToq...',
          '..UuortToq...',
          '..UuortToq...',
          '..UuortToq...',
          '..UuortToq...',
          '....oTtTo....',
        ],
      },
    ],
    back: [
      { at: [21, 6], rows: ['.kkkkk.', 'khHJHhk'] }, // the pompadour's crest above the crown
      { at: [19, 21], rows: ['..GWWWWWG..'] }, // shirt collar above the coat collar
    ],
  },
};
