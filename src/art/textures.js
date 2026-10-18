// Procedural tile textures (spec §4.1): narra floors, volcanic adobe, lime plaster, capiz, clay
// roof tiles, cobblestone, piedra china and more. Every texture is drawn at 32 px per world unit,
// close to the sprites' 40, so walls and characters share a pixel density. Most cover several
// units (TEXTURE_SPANS) so their pattern doesn't visibly repeat, and carry a height (the material's
// bump map) so lamps and the sun pick out their relief. Every texture tiles seamlessly and is
// deterministic: each uses its own seeds.
import { rng, shade } from './pixel.js';
import { Surface, valueNoise, fbm, stoneCells, rgb, mix, scale } from './surface.js';

export const PX_PER_UNIT = 32;
export const TILE = PX_PER_UNIT; // one world unit of texture, in pixels

// World units each texture's tile covers (its size is span × PX_PER_UNIT pixels).
export const TEXTURE_SPANS = {
  narra: 4, adobe: 4, plaster: 4, wood: 2, capiz: 1, roof: 4, cobble: 4, dirt: 4, grass: 4, water: 4, tablecloth: 1, carpet: 1, tiles: 2,
};

const wrap = (v, n) => ((v % n) + n) % n;
const pick = (list, r) => list[Math.floor(r() * list.length)];
const clamp01 = (v) => Math.max(0, Math.min(1, v));

// Darken the bottom rows (the foot of a wall: canvas rows run top to bottom) toward a damp colour.
function risingDamp(s, rows, colour, amount, noise) {
  const n = s.size;
  const damp = rgb(colour);
  for (let y = n - rows; y < n; y++) {
    const t = (y - (n - rows)) / rows;
    for (let x = 0; x < n; x++) s.setRGB(x, y, mix(s.getRGB(x, y), damp, t * t * amount * (0.5 + noise[y * n + x])));
  }
}

// Courses of blocks across a tile: calls block(x, y, w, h, r) for each, x possibly past the edge
// (Surface wraps). Block widths vary between min and max; each course starts at its own offset.
function courses(n, heights, min, max, seed, block) {
  const r = rng(seed);
  let y = 0;
  for (const h of heights) {
    const start = Math.floor(r() * n);
    let x = 0;
    while (x < n) {
      let w = min + Math.floor(r() * (max - min));
      if (n - x - w < min) w = n - x; // no sliver at the end
      block(start + x, y, w, h, r);
      x += w;
    }
    y += h;
  }
}

const GENERATORS = {
  narra(s) {
    // Narra planks 8 px wide in rows, of uneven lengths, with long grain, butt joints, nails and
    // the odd knot; a dark seam between rows.
    const n = s.size;
    const grain = valueNoise(n, 4, 64, 11);
    const fine = fbm(n, 13, { cells: 16, octaves: 2 });
    const mottle = fbm(n, 17, { cells: 2 });
    const tones = ['#8b5a35', '#93603a', '#83532f', '#9a6640', '#7f5030', '#8e5c38'].map(rgb);
    courses(n, Array(n / 8).fill(8), 36, 90, 19, (x0, y0, w, h, r) => {
      const base = scale(pick(tones, r), 0.92 + r() * 0.16);
      const knot = r() < 0.35 ? [x0 + 6 + Math.floor(r() * (w - 12)), y0 + 2 + Math.floor(r() * 4)] : null;
      for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
          const x = x0 + i;
          const y = y0 + j;
          const k = wrap(y, n) * n + wrap(x, n);
          let c = scale(base, (0.84 + grain[k] * 0.3) * (0.95 + mottle[k] * 0.1) * (0.97 + fine[k] * 0.06));
          let hgt = 0.7 + grain[k] * 0.12;
          if (knot) {
            const d = Math.hypot((x - knot[0]) / 2.2, y - knot[1]);
            if (d < 1) c = scale(c, 0.62);
            else if (d < 1.8) c = scale(c, 0.82);
          }
          if (j === h - 1) { c = rgb('#2f1e12'); hgt = 0.15; } // the seam
          else if (j === 0) c = scale(c, 1.08);
          if (i === 0 && j < h - 1) { c = scale(c, 0.55); hgt = 0.3; } // butt joint
          if (i === 2 && (j === 2 || j === 5)) { c = rgb('#3b2a1d'); hgt = 0.6; } // nails
          s.setRGB(x, y, c);
          s.setHeight(x, y, hgt);
        }
      }
    });
    s.bakeLight(0.25);
  },
  adobe(s) {
    // Volcanic tuff (adobe) blocks in uneven courses: pitted faces, mottled ochre-grey tones,
    // weathering streaks, recessed mortar, chipped corners and rising damp at the foot.
    const n = s.size;
    const pits = fbm(n, 701, { cells: 64, octaves: 1 });
    const grit = rng(703);
    const mottle = fbm(n, 709, { cells: 4 });
    const streak = valueNoise(n, 24, 2, 719);
    const tuff = ['#b3a07c', '#a99673', '#bca983', '#a0906f', '#b8a27a', '#9d8e74', '#ab9a7a'].map(rgb);
    const mortar = rgb('#8f8670');
    courses(n, [14, 16, 15, 17, 16, 18, 16, 16], 22, 38, 23, (x0, y0, w, h, r) => {
      const base = scale(pick(tuff, r), 0.93 + r() * 0.14);
      const chip = r() < 0.4 ? Math.floor(r() * 4) : -1; // which corner is chipped
      for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
          const x = x0 + i;
          const y = y0 + j;
          const k = wrap(y, n) * n + wrap(x, n);
          if (j >= h - 2 || i >= w - 2) {
            s.setRGB(x, y, scale(mortar, 0.86 + pits[k] * 0.24));
            s.setHeight(x, y, 0.12);
            continue;
          }
          const bevel = Math.min(j, h - 3 - j, i, w - 3 - i);
          const corner = (j < 3 ? 0 : j > h - 6 ? 2 : -9) + (i < 3 ? 0 : i > w - 6 ? 1 : -9);
          let c = scale(base, (0.9 + mottle[k] * 0.2) * (0.9 + streak[k] * 0.14));
          let hgt = 0.6 + Math.min(1, bevel / 2) * 0.35 + (pits[k] - 0.5) * 0.08;
          if (pits[k] > 0.8 || grit() < 0.02) { c = scale(c, 0.7); hgt -= 0.25; }
          if (corner === chip) { c = scale(c, 0.8); hgt -= 0.25; }
          s.setRGB(x, y, c);
          s.setHeight(x, y, clamp01(hgt));
        }
      }
    });
    risingDamp(s, 26, '#5f5a42', 0.55, mottle);
    s.bakeLight(0.3);
  },
  plaster(s) {
    // Lime plaster: mottled warm white, faint trowel marks, hairline cracks, two patches where it
    // has fallen away to show the adobe, rain streaks and damp at the foot.
    const n = s.size;
    const mottle = fbm(n, 31, { cells: 3 });
    const fine = fbm(n, 33, { cells: 24, octaves: 2 });
    const trowel = valueNoise(n, 3, 20, 35);
    const streak = valueNoise(n, 14, 1, 39);
    const ragged = fbm(n, 41, { cells: 8, octaves: 2 });
    const light = rgb('#ece3cb');
    const dark = rgb('#d6c7a4');
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const k = y * n + x;
        let c = scale(mix(dark, light, mottle[k]), (0.97 + fine[k] * 0.05) * (0.985 + trowel[k] * 0.03));
        // Rain streaks running down from the eaves (the tile's upper rows sit at the top of a wall).
        const fall = clamp01((y - 20) / 60) * (1 - clamp01((y - 80) / 30));
        c = scale(c, 1 - fall * Math.max(0, streak[k] - 0.55) * 0.35);
        s.setRGB(x, y, c);
        s.setHeight(x, y, 0.62 + fine[k] * 0.06 + mottle[k] * 0.04);
      }
    }
    // Fallen patches: the adobe blocks beneath, behind a ragged lip of plaster.
    const tuff = rgb('#a99673');
    for (const [cx, cy, rad] of [[30, 58, 9], [98, 100, 6]]) {
      for (let y = cy - rad * 2; y <= cy + rad * 2; y++) {
        for (let x = cx - rad * 2; x <= cx + rad * 2; x++) {
          const k = wrap(y, n) * n + wrap(x, n);
          const d = Math.hypot((x - cx) / 1.6, y - cy) / (rad * (0.4 + ragged[k] * 1.1));
          if (d < 1) {
            const mortar = wrap(y, 6) === 0 || wrap(x + (Math.floor(y / 6) % 2) * 6, 12) === 0;
            s.setRGB(x, y, mortar ? rgb('#7d735f') : scale(tuff, 0.85 + fine[k] * 0.25));
            s.setHeight(x, y, mortar ? 0.2 : 0.38);
          } else if (d < 1.12) {
            s.setRGB(x, y, scale(s.getRGB(x, y), 0.9));
            s.setHeight(x, y, 0.7);
          }
        }
      }
    }
    // Hairline cracks.
    const r = rng(37);
    for (let k = 0; k < 4; k++) {
      let x = Math.floor(r() * n);
      let y = 30 + Math.floor(r() * 80);
      const len = 14 + Math.floor(r() * 26);
      for (let i = 0; i < len; i++) {
        s.setRGB(x, y, scale(s.getRGB(x, y), 0.72));
        s.setHeight(x, y, 0.45);
        x += 1;
        y += r() < 0.45 ? 1 : r() < 0.2 ? -1 : 0;
      }
    }
    risingDamp(s, 30, '#9c8d6c', 0.4, mottle);
    s.bakeLight(0.22);
  },
  wood(s) {
    // Dark wood panelling and doors: vertical boards 8 px wide with long grain, a few knots and a
    // dark gap between boards.
    const n = s.size;
    const grain = valueNoise(n, 32, 3, 41);
    const mottle = fbm(n, 43, { cells: 2 });
    const r = rng(45);
    const tones = ['#5a3a22', '#553620', '#60402a', '#4e321d'].map(rgb);
    for (let b = 0; b < n / 8; b++) {
      const base = scale(pick(tones, r), 0.92 + r() * 0.16);
      const knot = r() < 0.5 ? [b * 8 + 3, Math.floor(r() * n)] : null;
      for (let y = 0; y < n; y++) {
        for (let i = 0; i < 8; i++) {
          const x = b * 8 + i;
          const k = y * n + x;
          let c = scale(base, (0.82 + grain[k] * 0.32) * (0.94 + mottle[k] * 0.12));
          let hgt = 0.7 + grain[k] * 0.1;
          if (knot && Math.hypot(x - knot[0], (y - knot[1]) / 2) < 1.4) c = scale(c, 0.6);
          if (i === 7) { c = rgb('#2c1b0f'); hgt = 0.2; }
          else if (i === 0) c = scale(c, 1.12);
          s.setRGB(x, y, c);
          s.setHeight(x, y, hgt);
        }
      }
    }
    s.bakeLight(0.25);
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
  roof(s) {
    // Clay barrel tiles (tejas): caps and channels 8 px wide in courses 16 px long, each tile's
    // lip lit and its tail shaded under the next; mixed fired tones, a few blackened tiles, lichen.
    const n = s.size;
    const lichen = fbm(n, 61, { cells: 32, octaves: 2 });
    const grime = fbm(n, 63, { cells: 2 });
    const r = rng(65);
    const tones = ['#a8512f', '#b45b34', '#9c4a2c', '#b8653d', '#8f4428', '#ad5a36'].map(rgb);
    for (let row = 0; row < n / 16; row++) {
      for (let col = 0; col < n / 8; col++) {
        let base = scale(pick(tones, r), 0.9 + r() * 0.18);
        if (r() < 0.08) base = scale(base, 0.62);
        const cap = col % 2 === 0;
        for (let v = 0; v < 16; v++) {
          for (let u = 0; u < 8; u++) {
            const x = col * 8 + u;
            const y = row * 16 + v;
            const k = y * n + x;
            const bow = Math.sin((Math.PI * (u + 0.5)) / 8);
            let hgt = cap ? 0.5 + 0.45 * bow : 0.38 - 0.22 * bow;
            let c = scale(base, (cap ? 1 : 0.86) * (0.88 + grime[k] * 0.2));
            if (v === 0) c = scale(c, 1.12);
            if (v >= 14) { c = scale(c, 0.7); hgt -= 0.15; }
            if (lichen[k] > 0.74) c = mix(c, rgb('#b3ad86'), 0.4);
            s.setRGB(x, y, c);
            s.setHeight(x, y, clamp01(hgt));
          }
        }
      }
    }
    s.bakeLight(0.3);
  },
  cobble(s) {
    // Rounded cobbles of mixed grey and brown stone, worn smooth on top, set in dark grit with
    // moss in the joints and patches of dirt.
    const n = s.size;
    const { id, edge } = stoneCells(n, 11, 67, 0.85);
    const grime = fbm(n, 601, { cells: 2 });
    const fine = fbm(n, 607, { cells: 16, octaves: 2 });
    const moss = fbm(n, 613, { cells: 4 });
    const gap = fbm(n, 619, { cells: 8, octaves: 2 });
    const stones = ['#8a8379', '#7c766f', '#938877', '#776e64', '#858077', '#9a9182', '#80776b'].map(rgb);
    const tones = new Map();
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const k = y * n + x;
        const g = 0.8 + gap[k] * 0.9;
        const dirt = 0.88 + grime[k] * 0.26;
        if (edge[k] < g) {
          let c = mix(rgb('#352f29'), rgb('#4a4239'), fine[k]);
          if (moss[k] > 0.58) c = mix(c, rgb('#4e5a31'), Math.min(1, (moss[k] - 0.58) * 4));
          s.setRGB(x, y, scale(c, dirt));
          s.setHeight(x, y, 0.08 + fine[k] * 0.1);
          continue;
        }
        if (!tones.has(id[k])) {
          const r = rng(id[k] * 7919 + 67);
          tones.set(id[k], scale(pick(stones, r), 0.88 + r() * 0.24));
        }
        const t = Math.min(1, (edge[k] - g) / 4);
        let c = scale(tones.get(id[k]), (0.92 + fine[k] * 0.16) * dirt);
        if (t > 0.85) c = scale(c, 1.07); // worn, polished crown
        s.setRGB(x, y, c);
        s.setHeight(x, y, clamp01(0.35 + 0.6 * Math.sqrt(t) + (fine[k] - 0.5) * 0.08));
      }
    }
    s.bakeLight(0.35);
  },
  dirt(s) {
    // Packed earth: mottled browns, scattered pebbles, cart ruts and a few tufts of grass.
    const n = s.size;
    const mottle = fbm(n, 71, { cells: 3 });
    const fine = fbm(n, 73, { cells: 24, octaves: 2 });
    const ruts = valueNoise(n, 2, 10, 75);
    const tufts = fbm(n, 77, { cells: 6 });
    const { edge, centre, id } = stoneCells(n, 20, 79, 1);
    const pebbles = new Map(); // stone id → pebble radius (0: none)
    const rngPebble = rng(81);
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const k = y * n + x;
        let c = scale(mix(rgb('#7a6043'), rgb('#9a7f5c'), mottle[k]), 0.92 + fine[k] * 0.16);
        let hgt = 0.45 + mottle[k] * 0.1 + fine[k] * 0.08;
        const rut = Math.max(0, ruts[k] - 0.66) * 2.5;
        c = scale(c, 1 - rut * 0.22);
        hgt -= rut * 0.3;
        const pebble = pebbles.get(id[k]) ?? pebbles.set(id[k], rngPebble() < 0.22 ? 0.8 + rngPebble() * 1.6 : 0).get(id[k]);
        if (pebble && centre[k] < pebble && edge[k] > 0.5) {
          c = mix(rgb('#8c867a'), rgb('#b0a898'), fine[k]);
          hgt = 0.75;
        }
        if (tufts[k] > 0.74 && fine[k] > 0.5) {
          c = mix(rgb('#5a7434'), rgb('#7b9446'), fine[k]);
          hgt = 0.6;
        }
        s.setRGB(x, y, c);
        s.setHeight(x, y, clamp01(hgt));
      }
    }
    s.bakeLight(0.3);
  },
  grass(s) {
    // Grass: mottled greens with blades in light and shade, bare patches and a few small flowers.
    const n = s.size;
    const mottle = fbm(n, 83, { cells: 3 });
    const bare = fbm(n, 85, { cells: 4 });
    const fine = fbm(n, 87, { cells: 24, octaves: 2 });
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const k = y * n + x;
        let c = scale(mix(rgb('#4a672c'), rgb('#6b883c'), mottle[k]), 0.93 + fine[k] * 0.14);
        if (bare[k] > 0.72) c = mix(c, rgb('#80694a'), Math.min(1, (bare[k] - 0.72) * 5));
        s.setRGB(x, y, c);
        s.setHeight(x, y, 0.4 + fine[k] * 0.1);
      }
    }
    const r = rng(89);
    for (let k = 0; k < 1100; k++) {
      const x = Math.floor(r() * n);
      const y = Math.floor(r() * n);
      if (bare[y * n + x] > 0.74) continue;
      const lit = r() < 0.5;
      const len = 2 + Math.floor(r() * 2);
      for (let i = 0; i < len; i++) {
        s.setRGB(x, y - i, lit ? rgb(i === len - 1 ? '#93ac58' : '#7c9849') : rgb('#3a5224'));
        s.setHeight(x, y - i, 0.55 + i * 0.12);
      }
    }
    for (let k = 0; k < 18; k++) {
      const x = Math.floor(r() * n);
      const y = Math.floor(r() * n);
      s.set(x, y, k % 3 === 0 ? '#e3c64a' : '#ece6cc');
      s.setHeight(x, y, 0.85);
    }
    s.bakeLight(0.25);
  },
  water(s) {
    // River water: deep and shallow blues, and pale crests where the swell turns. The height is
    // the swell, which the water's material turns into a moving normal map.
    const n = s.size;
    const depth = fbm(n, 97, { cells: 2 });
    const swell = fbm(n, 99, { cells: 4, octaves: 3, stretch: 0.5 });
    const fine = fbm(n, 95, { cells: 16, octaves: 1, stretch: 0.5 });
    const glint = fbm(n, 93, { cells: 4, octaves: 2, stretch: 1 / 8 }); // short streaks along the flow
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const k = y * n + x;
        let c = scale(mix(rgb('#22465a'), rgb('#3a6c7c'), depth[k] * 0.7 + swell[k] * 0.3), 0.95 + fine[k] * 0.1);
        if (swell[k] > 0.62 && glint[k] > 0.7) c = mix(c, rgb('#9cc6cb'), Math.min(0.6, (glint[k] - 0.7) * 3));
        s.setRGB(x, y, c);
        s.setHeight(x, y, swell[k]);
      }
    }
  },
  tablecloth(c) {
    const r = rng(101);
    for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) c.set(x, y, r() < 0.2 ? shade('#efe7d6', (r() - 0.5) * 0.08) : '#efe7d6');
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
  tiles(s) {
    // Piedra china: square granite slabs (ballast stone from the galleon trade) with speckled
    // grain, slightly different greys, bevelled edges and dark joints.
    const n = s.size;
    const speck = fbm(n, 111, { cells: 32, octaves: 1 });
    const mottle = fbm(n, 113, { cells: 3 });
    const r = rng(115);
    const greys = ['#9a958c', '#8f8a81', '#a39e94', '#94908a', '#a09a8e'].map(rgb);
    const slab = 32;
    for (let sy = 0; sy < n / slab; sy++) {
      for (let sx = 0; sx < n / slab; sx++) {
        const base = scale(pick(greys, r), 0.94 + r() * 0.12);
        for (let j = 0; j < slab; j++) {
          for (let i = 0; i < slab; i++) {
            const x = sx * slab + i;
            const y = sy * slab + j;
            const k = y * n + x;
            if (i >= slab - 2 || j >= slab - 2) {
              s.setRGB(x, y, scale(rgb('#5a544b'), 0.9 + speck[k] * 0.2));
              s.setHeight(x, y, 0.15);
              continue;
            }
            let c = scale(base, 0.92 + mottle[k] * 0.14);
            if (speck[k] > 0.8) c = scale(c, 0.8);
            else if (speck[k] < 0.18) c = scale(c, 1.08);
            const bevel = Math.min(i, j, slab - 3 - i, slab - 3 - j);
            s.setRGB(x, y, c);
            s.setHeight(x, y, 0.55 + Math.min(1, bevel / 2) * 0.35);
          }
        }
      }
    }
    s.bakeLight(0.25);
  },
};

export const TEXTURE_NAMES = Object.keys(GENERATORS);

export function textureSpan(name) {
  return TEXTURE_SPANS[name] ?? 1;
}

// The texture as a Surface (colour and height).
export function drawSurface(name) {
  const gen = GENERATORS[name];
  if (!gen) throw new Error(`Unknown texture '${name}'`);
  const s = new Surface(textureSpan(name) * PX_PER_UNIT);
  gen(s);
  return s;
}

// The texture's colour as a PixelCanvas.
export function drawTexture(name) {
  return drawSurface(name).toCanvas();
}
