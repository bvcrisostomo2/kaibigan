// How each speaker's bust looks (Plan 5 spec §4.5), matched by eye to their kitbash head: the hair's
// shape and colours, any hat, facial hair, skin and clothes at the shoulders. Colours are sampled
// from the sets in local-assets/sprites. Anyone without an entry gets a bust from their costume
// data (busts.js lookFor).
//
// skin: [light, base, shadow] · face: { w: half-width, jaw: half-width at the chin }
// hair.style: tonsure | pompadour | curls | messy | long | spiky | bowl | short | swept
// hat.kind: bonnet | kepi | headband · beard.kind: stubble | mustache | full
// body.kind: hood | lace | coat (with neck: cravat | tie) | vest | panuelo | shirt | uniform | scarf
// Tones run light → deep.
export const SKIN = {
  fair: ['#ffdfb5', '#f79e5a', '#b54921'],
  ruddy: ['#ffdfb5', '#f09d59', '#b44b23'],
  hero: ['#f7dfbd', '#e79e6b', '#a55131'],
  tan: ['#f7be7b', '#c67531', '#943c18'],
  morena: ['#dba57c', '#c68b5e', '#94603c'],
  pale: ['#f4d2b0', '#e8b994', '#c08a62'],
};

const HABIT = ['#9a6a42', '#7a5233', '#5a3a24', '#3a2214'];

export const BUST_LOOKS = {
  player_don: {
    skin: SKIN.hero, face: { w: 11.5, jaw: 4.5 },
    hair: { style: 'messy', tones: ['#433b40', '#2d272a', '#1b1719', '#0e0c0d'] },
    brow: '#1b1719', iris: '#3a2a20',
    body: { kind: 'vest', tones: ['#9a9ca3', '#7c7f86', '#5e6168', '#45474d'], shirt: '#f4f0e8', tie: '#a8384a' },
  },
  player_dona: {
    skin: SKIN.morena, face: { w: 11, jaw: 4 }, lashes: true,
    hair: { style: 'long', tones: ['#4a3e42', '#2a2224', '#1d1615', '#0a0708'] },
    brow: '#1d1615', iris: '#3a2418',
    body: { kind: 'panuelo', tones: ['#fbf6ea', '#f1ead8', '#d6ccb4', '#a89e88'], shawl: ['#fbf6ea', '#e6d6ad', '#bab098', '#9a8a62'] },
  },
  ibarra: {
    skin: SKIN.fair, face: { w: 11.5, jaw: 4.5 },
    hair: { style: 'pompadour', tones: ['#5e5468', '#3d3546', '#241f2a', '#0d0b10'] },
    brow: '#241f2a', iris: '#3a2a20',
    body: { kind: 'coat', neck: 'cravat', tones: ['#7a5f50', '#6e5a50', '#54443d', '#33282a'], shirt: '#f7f3ea', tie: '#7d7488' },
  },
  tiago: {
    skin: SKIN.tan, face: { w: 12, jaw: 5.5 },
    hair: { style: 'spiky', tones: ['#4a4552', '#2e2a32', '#1e1b20', '#0e0c10'] },
    beard: { kind: 'stubble', color: '#7a4a2e' },
    brow: '#1e1b20', iris: '#2e2018',
    body: { kind: 'shirt', tones: ['#f6f2ea', '#e2dccf', '#c7bfb0', '#a0978a'] },
  },
  isabel: {
    skin: SKIN.fair, face: { w: 11, jaw: 4 }, age: 'old', lashes: true,
    hair: { style: 'long', tones: ['#6e625c', '#4e4440', '#362d2a', '#201816'] },
    brow: '#362d2a', iris: '#3a2a20',
    body: { kind: 'panuelo', tones: ['#f2e6c6', '#e4d6b0', '#d4cdbf', '#a8a092'], shawl: ['#f0ece4', '#d4cdbf', '#a8a092', '#6e675c'], trim: '#c04a4a' },
  },
  damaso: {
    skin: SKIN.fair, face: { w: 12.5, jaw: 6 }, age: 'old',
    hair: { style: 'tonsure', tones: ['#e4e0dc', '#b8b2ac', '#7e7874', '#4e4a48'] },
    brow: '#4e4a48', iris: '#4a3326',
    body: { kind: 'hood', tones: HABIT },
  },
  sibyla: {
    skin: SKIN.fair, face: { w: 11, jaw: 4 },
    hair: { style: 'bowl', tones: ['#5a4a40', '#2e2420', '#1a1412', '#0e0a08'] },
    brow: '#1a1412', iris: '#3a2a20',
    body: { kind: 'hood', tones: ['#7a5233', '#5a3a24', '#4a2c18', '#2e1a0e'] },
  },
  guevarra: {
    skin: SKIN.ruddy, face: { w: 12, jaw: 5 }, age: 'old',
    hair: { style: 'short', tones: ['#d6d8dc', '#a8abb2', '#8a8d96', '#6e717a'] },
    hat: { kind: 'kepi', tones: ['#4a4c56', '#34363c', '#1c1a22', '#0e0d12'], badge: '#c42a2a' },
    beard: { kind: 'mustache', size: 'big', color: '#a8abb2' },
    brow: '#8a8d96', iris: '#2e3448',
    body: { kind: 'uniform', tones: ['#5b6f9e', '#4a5c88', '#3e4e78', '#28324f'], collar: '#c42a2a', buttons: '#e8c050' },
  },
  laruja: {
    skin: SKIN.pale, face: { w: 11, jaw: 4.5 },
    hair: { style: 'short', tones: ['#3a3034', '#241c1e', '#1b1615', '#0e0a0b'] },
    beard: { kind: 'full', color: '#1b1615' },
    brow: '#1b1615', iris: '#2e2018',
    body: { kind: 'coat', neck: 'tie', tones: ['#7a6250', '#5a4636', '#46362a', '#2e231b'], shirt: '#c8c2b6', tie: '#7a2424' },
  },
  newcomer: {
    skin: SKIN.pale, face: { w: 11, jaw: 4 },
    hair: { style: 'spiky', tones: ['#f4dc98', '#c9a35a', '#a8823e', '#7a5c28'] },
    brow: '#7a5c28', iris: '#3a5a8a',
    body: { kind: 'coat', neck: 'tie', tones: ['#fbf7ef', '#d6d0c4', '#a49e92', '#867e6a'], shirt: '#efe9dd', tie: '#7a2e2e' },
  },
  victorina: {
    skin: SKIN.pale, face: { w: 11.5, jaw: 4 }, rouge: true, lashes: true,
    hair: { style: 'curls', tones: ['#a0624a', '#7e4634', '#5e3226', '#2e1610'] },
    hat: { kind: 'bonnet', tones: ['#fff3d6', '#e0c890', '#a88c5a', '#5e4a32'], rose: '#c42a2a', ribbon: '#8a4ab0' },
    brow: '#5e3226', iris: '#4a5cb0',
    body: { kind: 'lace', tones: ['#fff3d6', '#f0e2c0', '#e0c890', '#a88c5a'], ribbon: '#8a4ab0' },
  },
  tiburcio: {
    skin: SKIN.hero, face: { w: 11.5, jaw: 4.5 }, age: 'old',
    hair: { style: 'swept', tones: ['#eeecee', '#d6d3d6', '#a5a2a5', '#737173'] },
    beard: { kind: 'mustache', size: 'small', color: '#b89a5a' },
    brow: '#737173', iris: '#3a3a3a',
    body: { kind: 'coat', neck: 'tie', tones: ['#8a887f', '#6c6a63', '#55534d', '#3a3934'], shirt: '#efe9dd', tie: '#2e2d29' },
  },
  servant: {
    skin: SKIN.morena, face: { w: 11, jaw: 4.5 },
    hair: { style: 'short', tones: ['#3a3634', '#2a2624', '#1d1a19', '#121010'] },
    hat: { kind: 'headband', tones: ['#a8a4a0', '#8a8682', '#6a6662', '#4a4644'] },
    brow: '#1d1a19', iris: '#2e2018',
    body: { kind: 'scarf', tones: ['#ece4ce', '#d8cdb2', '#b0a68c', '#968c74'], scarf: '#8a8682' },
  },
};
