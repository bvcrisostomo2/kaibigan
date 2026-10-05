// Costume data for the cast (spec §4.1). Each entry is consumed by drawCharacterSheet().
// build: normal | slim | stout · top: barong | coat | suit | uniform | habit | baro | dress
// bottom: trousers | robe | skirt · sleeves: normal | wide | butterfly | puff
// hair.style: short | slick | bun | tonsure | curly
// accessories: panuelo, tapis, cord, cape, mustache, rouge, tricornio
const SKIN_MORENA = '#c68b5e';
const SKIN_MESTIZO = '#d9a37a';
const SKIN_SPANISH = '#e8b994';

export const COSTUMES = {
  player_don: {
    build: 'normal', skin: SKIN_MORENA, top: 'barong', bottom: 'trousers',
    hair: { style: 'short', color: '#1d1615' },
    colors: { top: '#efe5cc', trousers: '#2d2b3d', shoes: '#3a2418' },
  },
  player_dona: {
    build: 'slim', skin: SKIN_MORENA, top: 'baro', bottom: 'skirt', sleeves: 'butterfly',
    hair: { style: 'bun', color: '#1d1615' },
    accessories: ['panuelo', 'tapis'],
    colors: { top: '#f1ead8', skirt: '#3d5a8a', skirtStripe: '#31497a', panuelo: '#e6d6ad', tapis: '#24263a' },
  },
  ibarra: {
    build: 'normal', skin: SKIN_MESTIZO, top: 'coat', bottom: 'trousers',
    hair: { style: 'slick', color: '#1a1414' },
    colors: { top: '#383545', trousers: '#2e2c38', shirt: '#f4efe4', tie: '#16141c', cuff: '#ece6da', trimLine: '#5e5a70', chain: '#d9b35a', eyes: '#3a2a20', shoes: '#141218' },
  },
  damaso: {
    build: 'stout', skin: SKIN_SPANISH, top: 'habit', bottom: 'robe', sleeves: 'wide',
    hair: { style: 'tonsure', color: '#6a4c35' },
    accessories: ['cord'],
    colors: { top: '#6b4a2f', robe: '#6b4a2f', shoes: '#4a3424' },
  },
  sibyla: {
    build: 'slim', skin: SKIN_SPANISH, top: 'habit', bottom: 'robe', sleeves: 'wide',
    hair: { style: 'tonsure', color: '#3a2c22' },
    accessories: ['cord'],
    colors: { top: '#6b4a2f', robe: '#6b4a2f', shoes: '#2a2420' },
  },
  guevarra: {
    build: 'normal', skin: SKIN_SPANISH, top: 'uniform', bottom: 'trousers',
    hair: { style: 'short', color: '#a9a5a0' },
    accessories: ['mustache', 'tricornio'],
    colors: { top: '#27355e', trousers: '#7d808a', trim: '#b8322e', belt: '#1a1618', shoes: '#151319' },
  },
  tiago: {
    build: 'stout', skin: SKIN_MORENA, top: 'barong', bottom: 'trousers',
    hair: { style: 'short', color: '#211a18' },
    colors: { top: '#f3ead2', trousers: '#3a2f2a', shoes: '#2a1c16' },
  },
  isabel: {
    build: 'slim', skin: SKIN_MORENA, top: 'baro', bottom: 'skirt', sleeves: 'butterfly',
    hair: { style: 'bun', color: '#57504a' },
    accessories: ['panuelo', 'tapis'],
    colors: { top: '#efe7d4', skirt: '#9a2434', skirtStripe: '#221c20', panuelo: '#f2e6c6', tapis: '#281e22' },
  },
  victorina: {
    build: 'slim', skin: SKIN_MORENA, top: 'dress', bottom: 'skirt', sleeves: 'puff',
    hair: { style: 'curly', color: '#7a4a2a' },
    accessories: ['rouge'],
    colors: { top: '#8a4aa0', skirt: '#2e8050', frill: '#e0c890', fan: '#f0c75e' },
  },
  tiburcio: {
    build: 'slim', skin: SKIN_SPANISH, top: 'suit', bottom: 'trousers',
    hair: { style: 'short', color: '#6e6a66' },
    colors: { top: '#6c6a63', trousers: '#5a5852', shirt: '#efe9dd', tie: '#3b2a2a', shoes: '#1f1b1b' },
  },
  newcomer: {
    build: 'normal', skin: SKIN_SPANISH, top: 'suit', bottom: 'trousers',
    hair: { style: 'slick', color: '#c9a35a' },
    colors: { top: '#c9bfa8', trousers: '#a89f8a', shirt: '#fbf7ef', tie: '#7a2e2e', shoes: '#3a2a20' },
  },
  servant: {
    build: 'normal', skin: SKIN_MORENA, top: 'barong', bottom: 'trousers',
    hair: { style: 'short', color: '#1d1615' },
    colors: { top: '#d8cdb2', trousers: '#4a4033', shoes: '#3a2a20' },
  },
};
