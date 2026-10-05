// A tiny RGBA pixel buffer for procedural pixel art. Pure JS (no DOM), so it runs in tests.
// Colors are '#rrggbb' strings (or null for transparent). Row 0 is the TOP of the image.

const cache = new Map();

export function parseHex(hex) {
  if (cache.has(hex)) return cache.get(hex);
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`Bad color '${hex}'`);
  const n = parseInt(m[1], 16);
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  cache.set(hex, rgb);
  return rgb;
}

export function toHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}

// Lighten (amount > 0) or darken (amount < 0) a color by mixing toward white/black.
export function shade(hex, amount) {
  const [r, g, b] = parseHex(hex);
  const t = amount > 0 ? 255 : 0;
  const k = Math.abs(amount);
  return toHex([r + (t - r) * k, g + (t - g) * k, b + (t - b) * k]);
}

// [highlight, base, shadow] — the 3-tone ramp used for shading.
export function ramp(hex, light = 0.22, dark = 0.28) {
  return [shade(hex, light), hex, shade(hex, -dark)];
}

// Deterministic PRNG so generated art is identical on every run and in tests.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class PixelCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }

  inside(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  set(x, y, hex) {
    x = Math.round(x);
    y = Math.round(y);
    if (!this.inside(x, y)) return;
    const i = (y * this.width + x) * 4;
    if (hex == null) {
      this.data[i + 3] = 0;
      return;
    }
    const [r, g, b] = parseHex(hex);
    this.data[i] = r;
    this.data[i + 1] = g;
    this.data[i + 2] = b;
    this.data[i + 3] = 255;
  }

  // Returns '#rrggbb' or null when transparent / outside.
  get(x, y) {
    if (!this.inside(x, y)) return null;
    const i = (y * this.width + x) * 4;
    if (this.data[i + 3] === 0) return null;
    return toHex([this.data[i], this.data[i + 1], this.data[i + 2]]);
  }

  opaque(x, y) {
    return this.inside(x, y) && this.data[(y * this.width + x) * 4 + 3] > 0;
  }

  fillRect(x, y, w, h, hex) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, hex);
  }

  // Filled ellipse inside the box [x0, x1] × [y0, y1] (inclusive).
  ellipse(x0, y0, x1, y1, hex) {
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const rx = (x1 - x0) / 2 + 0.5;
    const ry = (y1 - y0) / 2 + 0.5;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, hex);
      }
    }
  }

  line(x0, y0, x1, y1, hex) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let s = 0; s <= steps; s++) this.set(x0 + ((x1 - x0) * s) / steps, y0 + ((y1 - y0) * s) / steps, hex);
  }

  // Replace every opaque pixel matching `fromHex` with `toHex`.
  recolor(fromHex, toHexColor) {
    for (let y = 0; y < this.height; y++) for (let x = 0; x < this.width; x++) if (this.get(x, y) === fromHex) this.set(x, y, toHexColor);
  }

  // Copy opaque pixels of `src` onto this canvas at (dx, dy), optionally mirrored horizontally.
  blit(src, dx = 0, dy = 0, { flipX = false } = {}) {
    for (let y = 0; y < src.height; y++) {
      for (let x = 0; x < src.width; x++) {
        const c = src.get(x, y);
        if (c == null) continue;
        this.set(dx + (flipX ? src.width - 1 - x : x), dy + y, c);
      }
    }
  }

  // Add a 1px outline in `hex` around every opaque shape (4-neighbourhood, outside only).
  outline(hex) {
    const marks = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.opaque(x, y)) continue;
        if (this.opaque(x - 1, y) || this.opaque(x + 1, y) || this.opaque(x, y - 1) || this.opaque(x, y + 1)) marks.push([x, y]);
      }
    }
    for (const [x, y] of marks) this.set(x, y, hex);
    return this;
  }

  clone() {
    const c = new PixelCanvas(this.width, this.height);
    c.data.set(this.data);
    return c;
  }

  // Number of opaque pixels (handy in tests).
  coverage() {
    let n = 0;
    for (let i = 3; i < this.data.length; i += 4) if (this.data[i] > 0) n++;
    return n;
  }

  // RGBA rows flipped bottom-up, as THREE.DataTexture expects (row 0 = bottom).
  toTextureData() {
    const out = new Uint8Array(this.data.length);
    const row = this.width * 4;
    for (let y = 0; y < this.height; y++) out.set(this.data.subarray(y * row, (y + 1) * row), (this.height - 1 - y) * row);
    return out;
  }
}
