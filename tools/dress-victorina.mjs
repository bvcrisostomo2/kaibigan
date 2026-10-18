// Doña Victorina — overdressed in European fashion and caked in make-up: purple bodice over a
// clashing emerald skirt, gold-cream frills, dark auburn false curls, bonnet with a red rose;
// powdered face, blue eyeshadow, round rouge, red lips and a beauty mark. Painted over a kitbash composite
// (tools/kitbash.mjs). Original pixels only.
//
// Usage: node tools/kitbash.mjs <bodyDir> <bodyDir> victorina_kb tools/dress-victorina.mjs
const pairs = (list, to) => Object.fromEntries(list.flatMap((cs, i) => cs.map((c) => [c, to[i]])));

const PINK = [['#ffc7de', '#ffc7d9'], ['#ff92b5', '#fb92b4'], ['#c6597b', '#c45a7c', '#c15175', '#c65173'], ['#8c344a', '#88344f'], ['#5a1829', '#59192e']];

export default {
  // Below the waist the gown is a clashing emerald.
  zones: [{ fromRow: 41, map: pairs(PINK, ['#8fdca0', '#52b070', '#2e8050', '#1c5434', '#0e2e1c']) }],
  compose: { front: { bodyFrom: 20, headTo: 19, dx: 0 }, right: { bodyFrom: 20, headTo: 19, dx: 0 }, back: { bodyFrom: 20, headTo: 19, dx: 0 } },
  recolor: {
    // blonde ringlets → dark auburn false curls
    ...pairs([['#fffb94', '#fffa95'], ['#ffe352', '#f9e254'], ['#deb600', '#dbb500'], ['#b57d08', '#b77d08'], ['#734108', '#764009'], ['#391c00', '#3b1f03']],
      ['#a0624a', '#7e4634', '#5e3226', '#44221a', '#2e1610', '#1a0c08']),
    // pink gown → loud purple
    ...pairs([['#ffc7de', '#ffc7d9'], ['#ff92b5', '#fb92b4'], ['#c6597b', '#c45a7c', '#c15175', '#c65173'], ['#8c344a', '#88344f'], ['#5a1829', '#59192e']],
      ['#e0b8e8', '#b67ac8', '#8a4aa0', '#5e2e74', '#3a1a4a']),
    // white frills → gold-cream
    ...pairs([['#fffff7', '#fffff6'], ['#ceb6d6', '#c9b5d1'], ['#947d9c', '#917e98'], ['#5a5163', '#5e5063']],
      ['#fff3d6', '#e0c890', '#a88c5a', '#5e4a32']),
    // powdered skin
    '#ffdfb6': '#fff4ee', '#ffdfb5': '#fff4ee', '#f09d59': '#f0cfc4', '#f79e5a': '#f0cfc4', '#b44b23': '#c88478', '#b54921': '#c88478',
    // green eyes → brown
    ...pairs([['#108e10', '#168d12'], ['#085508', '#0e550b']], ['#6a3a1a', '#4a2810']),
  },
  palette: { b: '#4a5ae0', r: '#ec5a78', l: '#d01030', L: '#8a0a20', m: '#1a1010' },
  views: {
    front: [{ at: [21, 23], rows: ['.b.....b.', '.........', '.........', '.rr...rr.', '...lllm..', '....L....'] }],
    right: [{ at: [24, 23], rows: ['.b....', '......', '......', '.rr.m.', '....l.'] }],
  },
};
