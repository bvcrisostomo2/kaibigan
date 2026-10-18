// A recolour map for one garment: its source shades, sorted lightest first, spread across a target
// ramp (also lightest first). For packs whose frames carry many near-duplicate shades of a colour
// (anti-aliased art), so a dress file can list a garment's shades instead of pairing each by hand.
const luma = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

export function ramp(from, to) {
  const sorted = [...from].map((c) => c.toLowerCase()).sort((a, b) => luma(b) - luma(a));
  const out = {};
  sorted.forEach((c, i) => {
    const t = sorted.length === 1 ? (to.length - 1) / 2 : (i * (to.length - 1)) / (sorted.length - 1);
    out[c] = to[Math.round(t)];
  });
  return out;
}
