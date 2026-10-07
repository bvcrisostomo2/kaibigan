// Costume data for the cast (spec §4.1). Each entry is consumed by drawCharacterSheet().
// build: normal | slim | stout · top: barong | coat | suit | uniform | habit | baro | dress
// bottom: trousers | robe | skirt · sleeves: normal | wide | butterfly | puff
// hair.style: short | slick | bun | tonsure | curly
// accessories: panuelo, tapis, cord, cape, mustache, beard, rouge, tricornio, headscarf
// activities: the extras' looping activities this costume is drawn with (art/activities.js)
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
  laruja: {
    // A very small man with a black beard (Chapter I).
    build: 'slim', age: 'youth', skin: SKIN_SPANISH, top: 'suit', bottom: 'trousers',
    hair: { style: 'slick', color: '#1b1615' },
    accessories: ['mustache', 'beard'],
    colors: { top: '#5a4636', trousers: '#3e342c', shirt: '#efe9dd', tie: '#7a2e2e', shoes: '#1f1712' },
  },
  servant: {
    build: 'normal', skin: SKIN_MORENA, top: 'barong', bottom: 'trousers',
    hair: { style: 'short', color: '#1d1615' },
    colors: { top: '#d8cdb2', trousers: '#4a4033', shoes: '#3a2a20' },
  },

  // ---- The household (Plan 5a): working clothes of coarse cloth, no lace, no fine piña ----
  cook: {
    // the kusinera: an older woman, plain camisa, dark checked saya, work tapis, headscarf
    build: 'normal', skin: SKIN_MORENA, top: 'baro', bottom: 'skirt',
    hair: { style: 'bun', color: '#6a625a' },
    accessories: ['tapis', 'headscarf'],
    colors: { top: '#e2d9c4', skirt: '#3b3a4a', skirtStripe: '#56546a', tapis: '#2c2a30', scarf: '#8a3a2a' },
    activities: ['stir'],
  },
  maid: {
    // the criada: the same baro't saya as Tía Isabel's, in cheap cloth: faded stripes, small tapis
    build: 'slim', skin: SKIN_MORENA, top: 'baro', bottom: 'skirt',
    hair: { style: 'bun', color: '#1d1615' },
    accessories: ['tapis'],
    colors: { top: '#ebe4d2', skirt: '#7a6a5a', skirtStripe: '#5e5044', tapis: '#3a3430' },
    activities: ['chop', 'dust', 'sweep'],
  },
  muchacho: {
    // camisa de chino, loose trousers, barefoot
    build: 'slim', age: 'youth', skin: SKIN_MORENA, top: 'barong', bottom: 'trousers',
    hair: { style: 'slick', color: '#1d1615' },
    colors: { top: '#e9e1cc', trousers: '#6b6150', shoes: SKIN_MORENA },
    activities: ['carry', 'fan'],
  },
  // ---- The party's crowd ----
  lady_a: {
    build: 'slim', skin: SKIN_MESTIZO, top: 'baro', bottom: 'skirt', sleeves: 'butterfly',
    hair: { style: 'bun', color: '#1d1615' },
    accessories: ['panuelo', 'tapis'],
    colors: { top: '#f4eee0', skirt: '#2f6a5a', skirtStripe: '#245448', panuelo: '#efe2c4', tapis: '#1e2a28', fan: '#e8c06a' },
    activities: ['fan'],
  },
  lady_b: {
    build: 'slim', skin: SKIN_MORENA, top: 'baro', bottom: 'skirt', sleeves: 'butterfly',
    hair: { style: 'bun', color: '#2a1e18' },
    accessories: ['panuelo', 'tapis'],
    colors: { top: '#f2ece0', skirt: '#7a2a4a', skirtStripe: '#5e1e38', panuelo: '#f0e4cc', tapis: '#2a1a22', fan: '#d8a0b8' },
    activities: ['fan'],
  },
  lady_c: {
    build: 'slim', skin: SKIN_SPANISH, top: 'dress', bottom: 'skirt', sleeves: 'puff',
    hair: { style: 'bun', color: '#4a3020' },
    colors: { top: '#3a4a7a', skirt: '#3a4a7a', frill: '#e8e0cc', fan: '#f0d080' },
    activities: ['fan'],
  },
  cadet: {
    build: 'slim', age: 'youth', skin: SKIN_SPANISH, top: 'uniform', bottom: 'trousers',
    hair: { style: 'short', color: '#3a2a1a' },
    colors: { top: '#2a3a5a', trousers: '#e6e2d6', trim: '#c8a040', belt: '#1a1618', shoes: '#151319' },
    activities: ['chat'],
  },
  foreigner: {
    // "two foreigners dressed in white, promenading" (Chapter I)
    build: 'normal', skin: SKIN_SPANISH, top: 'suit', bottom: 'trousers',
    hair: { style: 'slick', color: '#9a7a4a' },
    colors: { top: '#f0ece0', trousers: '#e8e4d8', shirt: '#ffffff', tie: '#5a5a6a', shoes: '#6a4a2a' },
    activities: ['chat'],
  },
  harpist: {
    build: 'slim', skin: SKIN_MORENA, top: 'baro', bottom: 'skirt', sleeves: 'butterfly',
    hair: { style: 'bun', color: '#1d1615' },
    accessories: ['panuelo'],
    colors: { top: '#f1ead8', skirt: '#3a3a3a', skirtStripe: '#2a2a2a', panuelo: '#e6d6ad' },
    activities: ['pluck'],
  },
  guitarist: {
    build: 'normal', skin: SKIN_MORENA, top: 'barong', bottom: 'trousers',
    hair: { style: 'short', color: '#1d1615' },
    colors: { top: '#efe7d0', trousers: '#2a2a32', shoes: '#2a1c16' },
    activities: ['strum'],
  },
  violinist: {
    build: 'slim', skin: SKIN_MESTIZO, top: 'barong', bottom: 'trousers',
    hair: { style: 'slick', color: '#2a1e18' },
    accessories: ['mustache'],
    colors: { top: '#f3ebd6', trousers: '#33303a', shoes: '#2a1c16' },
    activities: ['bow'],
  },
  // ---- The street and the river ----
  vendor: {
    build: 'stout', skin: SKIN_MORENA, top: 'baro', bottom: 'skirt',
    hair: { style: 'bun', color: '#2a1e18' },
    accessories: ['tapis', 'headscarf'],
    colors: { top: '#e6dcc4', skirt: '#4a6a3a', skirtStripe: '#3a5430', tapis: '#2a2a1e', scarf: '#c8a040' },
    activities: ['fan', 'chat'],
  },
  sweeper: {
    build: 'normal', skin: SKIN_MORENA, top: 'barong', bottom: 'trousers',
    hair: { style: 'short', color: '#1d1615' },
    colors: { top: '#d8cdb2', trousers: '#5a5040', shoes: SKIN_MORENA },
    activities: ['sweep'],
  },
  cochero: {
    build: 'normal', skin: SKIN_MORENA, top: 'barong', bottom: 'trousers',
    hair: { style: 'short', color: '#1d1615' },
    colors: { top: '#c9bfa6', trousers: '#3a3428', shoes: '#2a1c16' },
    activities: ['doze', 'polish'],
  },
  passerby_a: {
    build: 'normal', skin: SKIN_MESTIZO, top: 'barong', bottom: 'trousers',
    hair: { style: 'slick', color: '#1d1615' },
    colors: { top: '#f0e8d4', trousers: '#3a3a4a', shoes: '#2a1c16' },
  },
  passerby_b: {
    build: 'slim', skin: SKIN_MORENA, top: 'baro', bottom: 'skirt', sleeves: 'butterfly',
    hair: { style: 'bun', color: '#1d1615' },
    accessories: ['panuelo', 'tapis'],
    colors: { top: '#efe8d6', skirt: '#5a4a7a', skirtStripe: '#463a60', panuelo: '#e8dcc0', tapis: '#22202a' },
    activities: ['chat'],
  },
  washerwoman: {
    build: 'normal', skin: SKIN_MORENA, top: 'baro', bottom: 'skirt',
    hair: { style: 'bun', color: '#2a1e18' },
    accessories: ['tapis', 'headscarf'],
    colors: { top: '#e4dac4', skirt: '#5a3a3a', skirtStripe: '#463030', tapis: '#2a2420', scarf: '#5a7a9a' },
    activities: ['wash'],
  },
  boatman: {
    build: 'normal', skin: SKIN_MORENA, top: 'barong', bottom: 'trousers',
    hair: { style: 'short', color: '#1d1615' },
    colors: { top: '#c4b89c', trousers: '#4a4234', shoes: SKIN_MORENA },
    activities: ['pole'],
  },
  fisherman: {
    build: 'normal', skin: SKIN_MORENA, top: 'barong', bottom: 'trousers',
    hair: { style: 'short', color: '#3a3a3a' },
    accessories: ['headscarf'],
    colors: { top: '#b8ae94', trousers: '#4a4436', shoes: SKIN_MORENA, scarf: '#d8d0b8' },
  },
};
