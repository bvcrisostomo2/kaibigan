// The vendor: a market woman at her stall on Calle Anloague in a plain camisa and a green striped
// saya under a dark tapis, a golden headscarf knotted at the nape; she fans herself with a pamaypay
// and chats with passers-by. Body and head: Female 12 (.packs/female12); her hood becomes the
// headscarf, her brown robe the camisa above the waist and the saya below it, its green hem the
// saya's dark border. Changes beyond colour: the tapis (its wrap, edge and stripes), the waist tie, the
// headscarf's knot and tails at the nape, the pamaypay, the chat from her pack's talking animation.
// Painted over a kitbash composite (tools/kitbash.mjs); built by: node tools/build-sets.mjs vendor
import { PAMAYPAY } from './parts/pamaypay.mjs';

const SAME_PACK = { bodyFrom: 25, headTo: 24, dx: 0 };
const SKIN = '#c68b5e';
const map = (from, to) => Object.fromEntries(from.map((c, i) => [c, to[i]]));
const ROBE = ['#ffba6b', '#bd8e4a', '#8c6542', '#5a4129', '#311c10'];
const SCARF = ['#f0d078', '#c8a040', '#9a7a2a', '#6a5218', '#3a2c0c'];
const CAMISA = ['#f6eedc', '#e6dcc4', '#c8bea4', '#9a907a', '#5e584a'];
const SAYA = ['#6a8a52', '#4a6a3a', '#3a5430', '#2a3e22', '#182614'];
const STRIPE = ['#d8d0a8', '#b8ae84', '#3a5430', '#2a3e22', '#182614'];
const HEM = ['#9cae42', '#5a7139', '#395d39', '#213c29'];
const WAIST = 48; // output row: below it the robe is the saya

export default {
  compose: { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK },
  zones: [
    { fromRow: WAIST, map: {}, stripes: { width: 2, maps: [map(ROBE, SAYA), map(ROBE, STRIPE)] } },
    { fromRow: WAIST, map: map(HEM, ['#2a3e22', '#1e2e18', '#16220f', '#0e160a']) },
  ],
  bodyRecolor: map(ROBE, CAMISA),
  recolor: {
    // the hood (what is left of the robe's browns on the head) → the headscarf
    ...map(ROBE, SCARF),
    // the hood's lining and her fringe → dark brown hair
    '#4a2800': '#2a1e18', '#a56931': '#4a3a30', '#734929': '#33281f', '#d6925a': '#5a4a40', '#f7ba6b': '#5a4a40', '#ffefbd': '#6a5a50',
    // green eyes → brown
    '#297963': '#4a2e1c',
    // skin → morena
    '#ffdfb5': '#dba57c', '#f79e5a': SKIN, '#b54921': '#94603c', '#ffe7ce': '#dba57c', '#e79663': SKIN, '#a54118': '#94603c',
  },
  // The tapis painted over the saya: a dark wrap (T, its woven stripes t, its overlapping edge e, o its
  // outline) under a waist tie (k); at the nape the headscarf's knot and two tails (K, S).
  palette: { k: '#6a5218', T: '#2a2a1e', t: '#46462e', e: '#5a5a3e', o: '#12120c', K: '#9a7a2a', S: '#c8a040' },
  views: {
    front: [{ at: [16, 48], rows: ['kkkkkkkkkkkkkkkkk', '.oTTeTTTTTTTTTTo.', '.oTTTeTTTTTTTTTo.', '.ottttetttttttto.', '.oTTTTTeTTTTTTTo.', '.oTTTTTTeTTTTTTo.', '.otttttttettttto.', '.ooooooooooooooo.'] }],
    right: [{ at: [16, 48], rows: ['kkkkkkkkkkkkkkk', '.oTTTTTTTTTTTo.', '.oTTTTTTTTTTTo.', '.ottttttttttto.', '.oTTTTTTTTTTTo.', '.oTTTTTTTTTTTo.', '.ottttttttttto.', '.ooooooooooooo.'] }],
    back: [
      { at: [16, 48], rows: ['kkkkkkkkkkkkkkkkk', '.oTTTTTTTTTTTTTo.', '.oTTTTTTTTTTTTTo.', '.ottttttttttttto.', '.oTTTTTTTTTTTTTo.', '.oTTTTTTTTTTTTTo.', '.ottttttttttttto.', '.ooooooooooooooo.'] },
      { at: [23, 28], rows: ['.KKK.', 'KSKSK', '.S.S.', '.S..S'] },
    ],
  },
  activities: {
    fan: { prop: PAMAYPAY, at: { front: [31, 38], right: [27, 38] }, palette: { h: SKIN } },
    chat: { source: { right: { folder: 'talk_left', mirror: true } }, nod: { front: 30 } },
  },
  changes: ['tapis painted as a wrap with its edge and woven stripes', 'waist tie', 'headscarf knot and tails at the nape', 'pamaypay', 'chat'],
};
