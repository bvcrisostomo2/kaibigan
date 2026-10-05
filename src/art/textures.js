// Procedural 32×32 tile textures (spec §4.1): narra floors, adobe stone, plaster, capiz, clay roof
// tiles, cobblestone and more. One tile covers one world unit, close to the sprites' 40 px per
// unit, so walls and characters share a pixel density. Every texture tiles seamlessly and is
// deterministic: each uses its own seeded RNG.
import { PixelCanvas, rng, shade } from './pixel.js';

export const TILE = 32;

const wrap = (v) => ((v % TILE) + TILE) % TILE;

function noise(c, base, amount, seed, spread = 0.08) {
  const r = rng(seed);
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const v = r();
      c.set(x, y, v < amount ? shade(base, (r() - 0.5) * spread * 2) : base);
    }
  }
}

const GENERATORS = {
  narra(c) {
    // Four planks 8 px tall: a lit top edge, a dark seam, grain streaks, a butt joint with nails.
    const r = rng(11);
    const tones = ['#8b5a35', '#93603a', '#83532f', '#8f5d37'];
    for (let p = 0; p < 4; p++) {
      const base = tones[p];
      const y0 = p * 8;
      for (let y = y0; y < y0 + 8; y++) for (let x = 0; x < TILE; x++) c.set(x, y, y === y0 ? shade(base, 0.1) : y === y0 + 7 ? shade(base, -0.35) : base);
      for (let k = 0; k < 6; k++) {
        const gy = y0 + 1 + Math.floor(r() * 5);
        const gx = Math.floor(r() * TILE);
        const len = 3 + Math.floor(r() * 5);
        for (let i = 0; i < len; i++) c.set(wrap(gx + i), gy, shade(base, -0.14));
      }
      const seam = (p * 13 + 6) % TILE;
      for (let y = y0; y < y0 + 7; y++) c.set(seam, y, shade(base, -0.32));
      c.set(wrap(seam - 2), y0 + 3, '#3f2a1a');
      c.set(wrap(seam + 2), y0 + 3, '#3f2a1a');
    }
  },
  adobe(c) {
    // Volcanic adobe blocks (15×7) in staggered courses with mortar lines and chipped faces.
    c.fillRect(0, 0, TILE, TILE, '#8a7d66');
    const r = rng(23);
    for (let row = 0; row < 4; row++) {
      const y = row * 8;
      const offset = row % 2 ? 8 : 0;
      for (let b = 0; b < 2; b++) {
        const x = b * 16 + offset;
        const base = shade('#b4a585', (r() - 0.5) * 0.14);
        for (let j = y; j < y + 7; j++) for (let i = x; i < x + 15; i++) c.set(wrap(i), j, j === y ? shade(base, 0.12) : j === y + 6 ? shade(base, -0.14) : base);
        for (let k = 0; k < 6; k++) c.set(wrap(x + 1 + Math.floor(r() * 13)), y + 1 + Math.floor(r() * 5), shade(base, r() < 0.5 ? -0.2 : 0.08));
      }
    }
  },
  plaster(c) {
    noise(c, '#e6d9bd', 0.35, 31, 0.05);
    const r = rng(37);
    for (let k = 0; k < 2; k++) {
      let x = Math.floor(r() * TILE);
      let y = 4 + Math.floor(r() * 20);
      for (let i = 0; i < 6; i++) {
        c.set(wrap(x), y, '#cdbf9f');
        x += 1;
        y += r() < 0.5 ? 1 : 0;
      }
    }
  },
  wood(c) {
    // Dark wood panelling / doors: vertical boards 8 px wide with grain and a few knots.
    const r = rng(41);
    for (let x = 0; x < TILE; x++) {
      const base = x % 8 === 7 ? '#3d2716' : x % 8 === 0 ? '#664429' : '#5a3a22';
      for (let y = 0; y < TILE; y++) c.set(x, y, r() < 0.12 ? shade(base, -0.12) : base);
    }
    for (let k = 0; k < 3; k++) {
      const x = Math.floor(r() * 4) * 8 + 2 + Math.floor(r() * 4);
      const y = Math.floor(r() * 30);
      c.set(x, y, '#3a2414');
      c.set(x, y + 1, '#3a2414');
    }
  },
  capiz(c) {
    // Capiz shell window: pearly 7×7 panes in a wooden lattice, each with a small highlight.
    const r = rng(53);
    for (let y = 0; y < TILE; y++) {
      for (let x = 0; x < TILE; x++) {
        const frame = x % 8 === 0 || y % 8 === 0;
        const lit = (x % 8 === 2 || x % 8 === 3) && y % 8 === 2;
        c.set(x, y, frame ? '#5b3a24' : shade('#ece4cf', (r() - 0.5) * 0.08 + (lit ? 0.14 : 0)));
      }
    }
  },
  roof(c) {
    // Clay tiles: rows 8 px tall with a lit top, curved shading, a dark lower edge, staggered seams.
    for (let y = 0; y < TILE; y++) {
      const row = Math.floor(y / 8);
      for (let x = 0; x < TILE; x++) {
        const sx = (x + (row % 2) * 4) % 8;
        let col = '#a8512f';
        if (y % 8 === 7) col = '#6d3019';
        else if (sx === 0) col = '#8a4026';
        else if (y % 8 === 0) col = '#bd6640';
        else if (y % 8 >= 5) col = '#9a4a2b';
        c.set(x, y, col);
      }
    }
  },
  cobble(c) {
    // Rounded stones on dark grit, each lit at the top left and shaded at the bottom right.
    c.fillRect(0, 0, TILE, TILE, '#4b4540');
    const r = rng(67);
    for (let gy = 0; gy < 4; gy++) {
      for (let gx = 0; gx < 4; gx++) {
        const x0 = gx * 8 + (gy % 2) * 4 + Math.floor(r() * 2);
        const y0 = gy * 8 + Math.floor(r() * 2);
        const w = 5 + Math.floor(r() * 2);
        const h = 5 + Math.floor(r() * 2);
        const base = shade('#7a726a', (r() - 0.5) * 0.18);
        const cx = x0 + (w - 1) / 2;
        const cy = y0 + (h - 1) / 2;
        for (let y = y0; y < y0 + h; y++) {
          for (let x = x0; x < x0 + w; x++) {
            const dx = (x - cx) / (w / 2 + 0.3);
            const dy = (y - cy) / (h / 2 + 0.3);
            if (dx * dx + dy * dy > 1) continue;
            const lit = dx + dy < -0.6;
            const dark = dx + dy > 0.7;
            c.set(wrap(x), wrap(y), lit ? shade(base, 0.18) : dark ? shade(base, -0.18) : base);
          }
        }
      }
    }
  },
  dirt(c) {
    noise(c, '#8a6e4e', 0.45, 71, 0.1);
    const r = rng(73);
    for (let k = 0; k < 8; k++) {
      const x = Math.floor(r() * TILE);
      const y = Math.floor(r() * TILE);
      c.set(x, y, '#a28766');
      c.set(wrap(x + 1), y, '#6e563c');
    }
  },
  grass(c) {
    noise(c, '#587636', 0.5, 83, 0.12);
    const r = rng(89);
    for (let k = 0; k < 24; k++) {
      const x = Math.floor(r() * TILE);
      const y = Math.floor(r() * (TILE - 2));
      c.set(x, y, '#6f8f42');
      c.set(x, y + 1, '#4a6430');
    }
  },
  water(c) {
    const r = rng(97);
    c.fillRect(0, 0, TILE, TILE, '#2c566a');
    for (let k = 0; k < 14; k++) {
      const x = Math.floor(r() * TILE);
      const y = Math.floor(r() * TILE);
      const len = 3 + Math.floor(r() * 5);
      const col = k % 3 === 0 ? '#244a5c' : '#4b7f92';
      for (let i = 0; i < len; i++) c.set(wrap(x + i), y, col);
    }
  },
  tablecloth(c) {
    noise(c, '#efe7d6', 0.2, 101, 0.04);
    for (let x = 0; x < TILE; x += 4) {
      c.set(x, 0, '#d8cdb5');
      c.set(x, 16, '#e2d8c2');
    }
  },
  carpet(c) {
    for (let y = 0; y < TILE; y++) {
      for (let x = 0; x < TILE; x++) {
        const d = Math.abs((x % 16) - 8) + Math.abs((y % 16) - 8);
        c.set(x, y, d === 6 ? '#c9a24a' : d === 2 ? '#a3843c' : (x + y) % 2 === 0 ? '#7a2b2b' : '#732828');
      }
    }
  },
  tiles(c) {
    // Checkered stone floor tiles (entrance hall / zaguán): 16 px tiles, grout, a lit bevel.
    for (let y = 0; y < TILE; y++) {
      for (let x = 0; x < TILE; x++) {
        const dark = (Math.floor(x / 16) + Math.floor(y / 16)) % 2 === 0;
        const base = dark ? '#8f8577' : '#b3a995';
        const col = x % 16 === 15 || y % 16 === 15 ? '#5e564c' : x % 16 === 0 || y % 16 === 0 ? shade(base, 0.1) : base;
        c.set(x, y, col);
      }
    }
  },
};

export const TEXTURE_NAMES = Object.keys(GENERATORS);

export function drawTexture(name) {
  const gen = GENERATORS[name];
  if (!gen) throw new Error(`Unknown texture '${name}'`);
  const c = new PixelCanvas(TILE, TILE);
  gen(c);
  return c;
}
