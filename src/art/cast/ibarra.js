// Crisostomo Ibarra — hand-authored pixel art (original design). Brown frock coat worn open
// over a lighter waistcoat, white wing collar, lilac-grey silk ascot, gold watch chain; dark
// pompadour. Adult proportions (~58 px tall).
//
// Technique: sloped shoulders flowing into the sleeves (no outline across the shoulder),
// sleeves shaded like cylinders, 5-tone wool, warm skin with orange side-shading and a warm
// skin outline on the fists, eyes as lid + pupil over a catch-light, no mouth at rest.
//
// Maps are rows of palette letters; '.' is transparent. `at` is the cell position of the map's
// top-left pixel in a 48×64 cell; arm layers are placed relative to their map. Legs come from
// the shared leg drawings (legs.js).
export const ibarra = {
  palette: {
    o: '#181410', // outline
    k: '#0d0b10', h: '#241f2a', H: '#3d3546', J: '#5e5468', I: '#7d7290', // hair: deep → shine
    F: '#ffe0bf', f: '#f2c79f', d: '#e3a072', e: '#b5603a', // skin: light → deep edge
    a: '#181410', w: '#fffbff', x: '#080808', g: '#c4a89c', i: '#8c3421', // eyes: dark, catch-light, black, lid, inner-corner shadow
    U: '#6e5a50', u: '#54443d', c: '#3e322d', q: '#2c2320', Q: '#1d1715', // coat: deep brown wool
    L: '#7a5f50', l: '#5e483c', M: '#3f2f28', // waistcoat: warmer, lighter brown
    W: '#f7f3ea', G: '#d2cabb', // shirt collar & cuffs
    p: '#7d7488', P: '#504a5a', K: '#a99fb6', // silk ascot: lilac grey, shadow, pattern
    y: '#e1bb5c', Y: '#9a7a2e', n: '#2a201c', // chain, chain shadow, buttons
    r: '#4d4549', t: '#363034', T: '#262124', j: '#5f565b', // trousers: grey-brown + pinstripe
    B: '#3a3036', b: '#1f1a1e', v: '#100d10', Z: '#8a7f88', N: '#5a4234', // boots: leather, shine, sole
    R: '#5a2a1a', // skin outline (warm, like the reference fists)
  },
  front: {
    at: [10, 3],
    rows: [
      '........ooooo..............',
      '.......oJJHHHoooooo........',
      '......oJJHHhhhhhhhko.......',
      '......oJHHhhhhhhhhkko......',
      '.......oHhhhhhkhhhko.......',
      '.......ohkkhkkkhkkko.......',
      '.......ohedddffdhhko.......',
      '.......okedFFFffdeko.......',
      '.......okkkFFFFFkkko.......',
      '......odkegxiFixgekdo......',
      '.......okdwadFdaweko.......',
      '........odFFFFdfdeo........',
      '.........odFFffdeo.........',
      '..........odffdeo..........',
      '........oWWpKpPpWWo........',
      '.......oUWWpKpPpWWco.......',
      '......ouUqLlpKpMlqcqo......',
      '.....ouUuqLlpPpMlqcqqo.....',
      '....ouUuuqLlLnMlMqcqqqo....',
      '....ocUuQuULlnlMqcQcqQo....',
      '....ocUuQuULlllMqcQcqQo....',
      '....ocUuQuULlnlMqcQcqQo....',
      '...ocUuuQuULlllMqcQcqqQo...',
      '...ocUuuQuULlnlMqcQcqqQo...',
      '...ocUuuQuULYylMqcQcqqQo...',
      '...ocUuuQoqylnlMqoQcqqQo...',
      '...ocUuuQoqLMMMMqoQcqqQo...',
      '...ocUuuQoqlMoMlqoQcqqQo...',
      '...ocUuuQoUuqoucQoQcqqQo...',
      '...ocUuuQoUuqoucQoQcqqQo...',
      '...ocUuuQoUuqoucQoQcqqQo...',
      '...ocUuuQoUuqoucQoQcqqQo...',
      '...ocUuuQoUuqoucQoQcqqQo...',
      '...oWWWGQoUotTtouoQWWGGo...',
      '...RFFfdQoUotTtouoQfFFdR...',
      '...RFdfdQoUotTtouoQdFdeR...',
      '...RdfdeQoUotTtouoQdfdeR...',
      '....RRRoUuqotTtoucQoRRR....',
      '.......oUuqo...ouqQo.......',
      '.......oUuqo...oucQo.......',
      '.......oUuqo...ouqQo.......',
      '......oUuqo.....oucQo......',
      '......oUuqo.....ouqQo......',
      '......oUuqo.....oucQo......',
      '......oqqqo.....oqqQo......',
      '......ooooo.....ooooo......',
    ],
  },
  // 3/4 view facing right (left is mirrored). Crest rolls forward over the brow; the near ear
  // and a thin sideburn show; the far eye sits against the profile. The open coat shows a
  // strip of waistcoat; arms are separate layers so they can swing.
  side: {
    at: [10, 3],
    rows: [
      '...........ooooo...........',
      '........oooJJIJHo..........',
      '.......oHHJJIJHhhko........',
      '......oHJHHhhhhhhhhko......',
      '......oHhhhhhhhhhhkko......',
      '......ohhhhhhkhhhkko.......',
      '......ohhhhhhkkdFFdR.......',
      '......ohhhhkeedFFFFR.......',
      '......ohhodkdkkFFkdR.......',
      '......ohodekegxiFxdR.......',
      '.......oeddddwadFadR.......',
      '........oeddFFFFdfdR.......',
      '.........oedFFffdeR........',
      '...........odffdeR.........',
      '.........oGWWpKPWGo........',
      '........oUUWWpKPWcqo.......',
      '.....ouUUuUqLpKpMqcqo......',
      '....ouUUuUUqLlPlMqcqqo.....',
      '....ocUuoUUqLlnlMqcQqo.....',
      '.......ouUUqLlllMqco.......',
      '.......ouUUqLlllMqco.......',
      '.......ouUUqLlnlMqco.......',
      '.......ouUUqLlllMqco.......',
      '.......ouUUqLYylMqco.......',
      '.......ouUUqyLnlMqco.......',
      '.......ouUUqLlllMqco.......',
      '.......ouUUqLMMMMqco.......',
      '.......ouUUqlMoMlqco.......',
      '.......ouUUUuqoucqQo.......',
      '.......ouUUUuqoucqQo.......',
      '.......ouUUUuotocqQo.......',
      '.......ouUUUuotocqQo.......',
      '.......ouUUUuotocqQo.......',
      '.......ouUUUuotocqQo.......',
      '.......ouUUUuotocqQo.......',
      '.......ouUUUuo..ocQo.......',
      '.......ouUUUuo..ocQo.......',
      '.......ouUUUuo..ocQo.......',
      '.......ouUUUuo..ocQo.......',
      '.......ouUUUuo..ocQo.......',
      '......ouUUUuo...ocqQo......',
      '......ouUUUuo...ocqQo......',
      '......ouUUUuo...ocqQo......',
      '......ouUUUuo...ocqQo......',
      '......ouUUUuo...ocqQo......',
      '......ooooooo...ooooo......',
    ],
    arms: {
      near: {
        idle: {
          at: [3, 18],
          rows: [
            '.ocUuQ', '.ocUuQ', '.ocUuQ', '.ocUuQ',
            'ocUuuQ', 'ocUuuQ', 'ocUuuQ', 'ocUuuQ', 'ocUuuQ', 'ocUuuQ', 'ocUuuQ', 'ocUuuQ',
            'oWWWGQ', 'RFFfdQ', 'RFdfdQ', 'Rdfde.', '.RRR..',
          ],
        },
        fwd: {
          at: [3, 18],
          rows: [
            '.ocUuQ...', '.ocUuQ...', '.ocUuQ...', '..ocUuQ..',
            '..ocUuuQ.', '..ocUuuQ.', '..ocUuuQ.', '...ocUuuQ', '...ocUuuQ', '...ocUuuQ',
            '...oWWWGQ', '...RFFfdQ', '...RFdfdQ', '...Rdfde.', '....RRR..',
          ],
        },
        back: {
          at: [1, 18],
          rows: [
            '...ocUuQ', '...ocUuQ', '...ocUuQ', '..ocUuQ.',
            '..ocUuuQ', '..ocUuuQ', '..ocUuuQ', '.ocUuuQ.', '.ocUuuQ.', '.ocUuuQ.',
            '.oWWWGQ.', '.RFFfdQ.', '.RFdfdQ.', '.Rdfde..', '..RRR...',
          ],
        },
      },
      // Mostly hidden behind the body; only the outer edge and the hand show.
      far: {
        idle: {
          at: [18, 18],
          rows: [
            'Qcqo.', 'Qcqo.', 'Qcqo.', 'Qcqo.',
            'Qcqqo', 'Qcqqo', 'Qcqqo', 'Qcqqo', 'Qcqqo', 'Qcqqo', 'Qcqqo', 'Qcqqo',
            'QWGGo', 'QfFdR', 'QdFeR', '.deR.', '.RR..',
          ],
        },
        fwd: {
          at: [18, 18],
          rows: [
            'Qcqo...', 'Qcqo...', 'Qcqo...', '.Qcqqo.', '.Qcqqo.', '.Qcqqo.', '.Qcqqo.',
            '..Qcqqo', '..Qcqqo', '..Qcqqo',
            '..QWGGo', '..QfFdR', '..QdFeR', '...deR.', '...RR..',
          ],
        },
        back: { at: [18, 18], rows: ['Qcqo', 'Qcqo', 'Qcqo', 'Qcqo', 'Qcqo'] },
      },
    },
  },
  // Back view: the pompadour's crest shows above the crown, the hair tapers to a neat nape;
  // coat collar over a strip of shirt collar, centre seam, half-belt buttons, rear vent.
  back: {
    at: [10, 3],
    rows: [
      '..............ooooo........',
      '........ooooooHHHJJo.......',
      '.......okhhhhhhhHHJJo......',
      '......okkhhhhhhhhHHJo......',
      '......okhhhHJJHhhhhko......',
      '......ohhhhhHHhhhhhko......',
      '......ohhhhhhhhhhhhko......',
      '.......ohhhhhhhhhhko.......',
      '.......okhhhhhhhhhko.......',
      '......odkhhhhhhhhhkdo......',
      '.......oekkhhhhhkkeo.......',
      '........okkkkkkkkko........',
      '.........oedddddeo.........',
      '..........oedddeo..........',
      '........ocWWWWWWWco........',
      '.......oUqqqqqqqqqco.......',
      '......ouUUUuuuuuuccqo......',
      '.....ouUUUUuuuuuucccqo.....',
      '....ouUuuUUUuuuuuucqqqo....',
      '....ocUuQuUUucuucqQcqQo....',
      '....ocUuQuUUucuucqQcqQo....',
      '....ocUuQuUUucuucqQcqQo....',
      '...ocUuuQuUUucuucqQcqqQo...',
      '...ocUuuQuUUucuucqQcqqQo...',
      '...ocUuuQuUUucuucqQcqqQo...',
      '...ocUuuQuUnucuncqQcqqQo...',
      '...ocUuuQuUUuouucqQcqqQo...',
      '...ocUuuQuUUuouucqQcqqQo...',
      '...ocUuuQuUUuouucqQcqqQo...',
      '...ocUuuQuUUuouucqQcqqQo...',
      '...oWWWGQuUUuouucqQWWGGo...',
      '...RFFfdQuUUuouucqQfFFdR...',
      '...RFdfdQuUUuouucqQdFdeR...',
      '...RdfdeQuUUuouucqQdfdeR...',
      '....RRRouUUUuouucqQoRRR....',
      '.......ouUUUuouucqQo.......',
      '.......ouUUUuouucqQo.......',
      '.......ouUUUuouucqQo.......',
      '......ouUUUuuouuccqQo......',
      '......ouUUUuuouuccqQo......',
      '......ouUUUuuouuccqQo......',
      '......ouUUUuuouuccqQo......',
      '......ouUUUuo.oucqqQo......',
      '......ouUUUuo.oucqqQo......',
      '......ouUUUuo.oucqqQo......',
      '......ooooooo.ooooooo......',
    ],
  },
};
