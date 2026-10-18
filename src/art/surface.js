// The painter behind the tile textures (textures.js): seamless noise, stones that wrap round a
// tile's edges, and a Surface that holds a colour and a height per pixel. The height becomes the
// material's bump map, so lamps and the sun pick out mortar, grain and cobbles; bakeLight also
// shades it into the colour, for the pixel-art look at any light. Pure JS, deterministic per seed.
import { PixelCanvas, parseHex, toHex, rng } from './pixel.js';

const smooth = (t) => t * t * (3 - 2 * t);
const mod = (v, n) => ((v % n) + n) % n;

// Value noise over a size × size tile with cellsX × cellsY lattice cells, in 0..1. Whole cells
// wrap, so the tile repeats without a seam; fewer cells down than across stretches it into streaks.
export function valueNoise(size, cellsX, cellsY, seed) {
  const r = rng(seed);
  const lattice = Array.from({ length: cellsX * cellsY }, () => r());
  const at = (i, j) => lattice[mod(j, cellsY) * cellsX + mod(i, cellsX)];
  const out = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    const fy = (y / size) * cellsY;
    const j = Math.floor(fy);
    const ty = smooth(fy - j);
    for (let x = 0; x < size; x++) {
      const fx = (x / size) * cellsX;
      const i = Math.floor(fx);
      const tx = smooth(fx - i);
      const top = at(i, j) + (at(i + 1, j) - at(i, j)) * tx;
      const bottom = at(i, j + 1) + (at(i + 1, j + 1) - at(i, j + 1)) * tx;
      out[y * size + x] = top + (bottom - top) * ty;
    }
  }
  return out;
}

// Fractal noise: octaves of value noise from `cells` cells up, each finer one weaker, in 0..1.
// stretch > 1 draws it out down the tile, below 1 across it.
export function fbm(size, seed, { cells = 2, octaves = 4, gain = 0.5, stretch = 1 } = {}) {
  const out = new Float32Array(size * size);
  let amp = 1;
  let total = 0;
  for (let o = 0; o < octaves; o++) {
    const c = cells * 2 ** o;
    const n = valueNoise(size, c, Math.max(1, Math.round(c / stretch)), seed + o * 101);
    for (let i = 0; i < out.length; i++) out[i] += n[i] * amp;
    total += amp;
    amp *= gain;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

// Stones: one jittered point per cell of a count × count grid; every pixel belongs to its nearest
// point. id: the stone; edge: how far (px) the pixel lies inside its stone's border (the gap to
// the second-nearest point, halved); centre: its distance from the stone's point. Wraps.
export function stoneCells(size, count, seed, jitter = 0.8) {
  const r = rng(seed);
  const cell = size / count;
  const points = [];
  for (let j = 0; j < count; j++) {
    for (let i = 0; i < count; i++) points.push([(i + 0.5 + (r() - 0.5) * jitter) * cell, (j + 0.5 + (r() - 0.5) * jitter) * cell]);
  }
  const id = new Int32Array(size * size);
  const edge = new Float32Array(size * size);
  const centre = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const ci = Math.floor(x / cell);
      const cj = Math.floor(y / cell);
      let d1 = Infinity;
      let d2 = Infinity;
      let best = 0;
      for (let dj = -2; dj <= 2; dj++) {
        for (let di = -2; di <= 2; di++) {
          const i = mod(ci + di, count);
          const j = mod(cj + dj, count);
          const [px, py] = points[j * count + i];
          // The point's copy nearest this pixel (it may sit across the wrap).
          const dx = px + (ci + di - i) * cell - x - 0.5;
          const dy = py + (cj + dj - j) * cell - y - 0.5;
          const d = Math.hypot(dx, dy);
          if (d < d1) {
            d2 = d1;
            d1 = d;
            best = j * count + i;
          } else if (d < d2) d2 = d;
        }
      }
      const k = y * size + x;
      id[k] = best;
      edge[k] = (d2 - d1) / 2;
      centre[k] = d1;
    }
  }
  return { id, edge, centre };
}

// A square tile with a colour (0..255 RGB) and a height (0..1) per pixel. It draws like a
// PixelCanvas (set, fillRect, ...) so simple textures paint it the same way; coordinates wrap.
export class Surface {
  constructor(size) {
    this.size = size;
    this.width = size;
    this.height = size;
    this.rgb = new Float32Array(size * size * 3);
    this.h = new Float32Array(size * size).fill(0.5);
  }

  index(x, y) {
    return mod(Math.round(y), this.size) * this.size + mod(Math.round(x), this.size);
  }

  setRGB(x, y, [r, g, b]) {
    const i = this.index(x, y) * 3;
    this.rgb[i] = r;
    this.rgb[i + 1] = g;
    this.rgb[i + 2] = b;
  }

  getRGB(x, y) {
    const i = this.index(x, y) * 3;
    return [this.rgb[i], this.rgb[i + 1], this.rgb[i + 2]];
  }

  set(x, y, hex) {
    this.setRGB(x, y, parseHex(hex));
  }

  get(x, y) {
    return toHex(this.getRGB(x, y));
  }

  fillRect(x, y, w, h, hex) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, hex);
  }

  setHeight(x, y, v) {
    this.h[this.index(x, y)] = v;
  }

  heightAt(x, y) {
    return this.h[this.index(x, y)];
  }

  hasRelief() {
    const first = this.h[0];
    return this.h.some((v) => v !== first);
  }

  // Shade the colour by the height's slope, lit from the top left (strength 0..1).
  bakeLight(strength = 0.3) {
    const out = new Float32Array(this.rgb.length);
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const slope = (this.heightAt(x + 1, y) - this.heightAt(x - 1, y) + this.heightAt(x, y + 1) - this.heightAt(x, y - 1)) / 2;
        const k = 1 + Math.max(-0.6, Math.min(0.6, slope * strength * 2));
        const i = this.index(x, y) * 3;
        out[i] = this.rgb[i] * k;
        out[i + 1] = this.rgb[i + 1] * k;
        out[i + 2] = this.rgb[i + 2] * k;
      }
    }
    this.rgb = out;
    return this;
  }

  toCanvas() {
    const c = new PixelCanvas(this.size, this.size);
    for (let y = 0; y < this.size; y++) for (let x = 0; x < this.size; x++) c.set(x, y, toHex(this.getRGB(x, y)));
    return c;
  }

  // The height as a tangent-space normal map (x right, y up the image), steeper with strength.
  normalCanvas(strength = 4) {
    const c = new PixelCanvas(this.size, this.size);
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const dx = (this.heightAt(x + 1, y) - this.heightAt(x - 1, y)) * strength;
        const dy = (this.heightAt(x, y - 1) - this.heightAt(x, y + 1)) * strength; // rows run down
        const len = Math.hypot(dx, dy, 1);
        c.set(x, y, toHex([((-dx / len) * 0.5 + 0.5) * 255, ((-dy / len) * 0.5 + 0.5) * 255, ((1 / len) * 0.5 + 0.5) * 255]));
      }
    }
    return c;
  }

  // The height as a grey image (black low, white high), for a bump map.
  heightCanvas() {
    const c = new PixelCanvas(this.size, this.size);
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const v = Math.max(0, Math.min(1, this.heightAt(x, y))) * 255;
        c.set(x, y, toHex([v, v, v]));
      }
    }
    return c;
  }
}

// Colour helpers on [r, g, b] arrays.
export const rgb = (hex) => parseHex(hex);
export const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const scale = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
