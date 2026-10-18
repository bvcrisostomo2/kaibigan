// The cochero: a calesa driver in a coarse barong and dark trousers under a salakot, a cloth sash at
// his waist and a rag tucked in it; he dozes on his seat and polishes his calesa. Body and head:
// Male 01 (.packs/male01); his green jacket and maroon shirt become the barong, his purple trousers
// dark, his blue hair black. Changes beyond colour: the salakot, the sash and its knot, the rag, the
// dozing lids, the polishing rag. Painted over a kitbash composite (tools/kitbash.mjs); built by:
// node tools/build-sets.mjs cochero
import { wear } from './parts.mjs';
import { SALAKOT } from './parts/salakot.mjs';
import { RAG } from './parts/rag.mjs';
import { EYELIDS } from './parts/eyelids.mjs';

const SAME_PACK = { bodyFrom: 21, headTo: 20, dx: 0 };
const SKIN = '#c68b5e';
const BARONG = ['#e8decc', '#c9bfa6', '#aca28a', '#8a8068', '#5e5646'];

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  bodyRecolor: {
    // green jacket → barong
    '#00d708': BARONG[0], '#00a608': BARONG[1], '#007500': BARONG[2], '#005900': BARONG[3], '#003400': BARONG[4],
    // maroon shirt under it → the barong's shade, a little darker
    '#b50042': BARONG[1], '#7b0031': BARONG[2], '#5a0021': BARONG[3], '#310010': BARONG[4], '#180008': '#3e382c', '#212021': '#3e382c',
    // white collar band → barong light
    '#e7e7e7': '#f2ecdc', '#b5b6b5': BARONG[1],
    // purple trousers → dark
    '#a500bd': '#4e4638', '#7b008c': '#3a3428', '#4a005a': '#2a261c', '#310039': '#1c1a14',
    // shoes → dark brown
    '#7b5108': '#4a3424', '#633c00': '#2a1c16', '#392000': '#1a120c',
  },
  recolor: {
    // blue hair → black
    '#42aeef': '#4a3e42', '#2182a5': '#33292c', '#21697b': '#241c1e', '#18414a': '#1a1415', '#082429': '#0e0a0b', '#080400': '#0a0708',
    // teal eyes → brown
    '#109e94': '#4a2e1c',
    // skin → morena
    '#ffdfb5': '#dba57c', '#f79e5a': SKIN, '#b54921': '#94603c',
  },
  // A cloth sash at the waist (m, n, q) knotted at the left hip with its tails, and a rag (r, R)
  // tucked in at the right hip; in the side view the knot is at the back.
  palette: { m: '#3a5a7a', n: '#2a4460', q: '#162434', r: '#ddd6c4', R: '#a8a08c' },
  views: {
    front: [{ at: [17, 40], rows: ['qmmmmmmmmmmmmmmmq', 'qnnnnnnnnnnnnnnnq', '.mq...........rR.', '.nq...........rR.', '..q...........Rr.', '..............rR.'] }],
    right: [{ at: [16, 40], rows: ['qmmmmmmmmmq', 'qnnnnnnnnnq', '.mq.....rR.', '.nq.....rR.', '..q.....Rr.'] }],
    back: [{ at: [16, 41], rows: ['qmmmmmmmmmmmmmmmmq', 'qnnnnnnnnnnnnnnnnq', '.......mnq........', '.......mnq........', '........q.........'] }],
  },
  wear: [wear(SALAKOT, { front: [14, 12], right: [13, 12], back: [14, 12] })],
  activities: {
    doze: { prop: EYELIDS, at: { front: [22, 22], right: [24, 23] } },
    polish: { prop: RAG, at: { front: [30, 42], right: [26, 42] }, palette: { h: SKIN } },
  },
  changes: ['salakot', 'sash knotted at the hip', 'rag tucked in the sash', 'dozing lids', 'polishing rag'],
};
