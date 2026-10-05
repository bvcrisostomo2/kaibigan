// Walkability and collision for a level (pure math, no three.js).
//
// Units: 1 = one tile (32 texture px). x → east, z → south, y → up.
// A level provides:
//   floors:   [{ x, z, w, d, y }]                       walkable rectangles at height y
//   stairs:   [{ x, z, w, d, y0, y1, dir }]            ramps; dir = side that is HIGH: 'n' | 's' | 'e' | 'w'
//   blockers: [{ x, z, w, d, y0, y1 }]                 solid boxes (walls, furniture footprints)
//   zones:    { name: { x, z, w, d, y0?, y1? } }        named areas for triggers
export const STEP = 0.45; // max height change per move (stairs are continuous ramps, so small is fine)
export const RADIUS = 0.28; // actor footprint radius

const inRect = (r, x, z, pad = 0) => x >= r.x - pad && x <= r.x + r.w + pad && z >= r.z - pad && z <= r.z + r.d + pad;

export function stairHeight(s, x, z) {
  const t = {
    n: 1 - (z - s.z) / s.d,
    s: (z - s.z) / s.d,
    w: 1 - (x - s.x) / s.w,
    e: (x - s.x) / s.w,
  }[s.dir];
  if (t == null) throw new Error(`Bad stair dir '${s.dir}'`);
  return s.y0 + (s.y1 - s.y0) * Math.max(0, Math.min(1, t));
}

// Floors at a stair's base or top height whose rectangle overlaps the stair's footprint.
// Collision keeps actors at the nearest height, so such a floor hides the ramp going up (base)
// or blocks the way down (top). Returns [{ floor, stair, end: 'base' | 'top' }].
export function stairFloorOverlaps({ floors = [], stairs = [] }) {
  const found = [];
  for (const stair of stairs) {
    for (const floor of floors) {
      const end = floor.y === stair.y0 ? 'base' : floor.y === stair.y1 ? 'top' : null;
      if (!end) continue;
      const overlapX = Math.min(floor.x + floor.w, stair.x + stair.w) - Math.max(floor.x, stair.x);
      const overlapZ = Math.min(floor.z + floor.d, stair.z + stair.d) - Math.max(floor.z, stair.z);
      if (overlapX > 0 && overlapZ > 0) found.push({ floor, stair, end });
    }
  }
  return found;
}

export function createCollision(level) {
  const floors = level.floors ?? [];
  const stairs = level.stairs ?? [];
  const blockers = level.blockers ?? [];
  const zones = level.zones ?? {};

  // Ground height under (x, z) reachable from currentY, or null if nothing walkable.
  function heightAt(x, z, currentY = 0) {
    let best = null;
    const consider = (h) => {
      if (Math.abs(h - currentY) > STEP) return;
      if (best == null || Math.abs(h - currentY) < Math.abs(best - currentY)) best = h;
    };
    for (const f of floors) if (inRect(f, x, z)) consider(f.y);
    for (const s of stairs) if (inRect(s, x, z)) consider(stairHeight(s, x, z));
    return best;
  }

  function blocked(x, z, y, radius = RADIUS) {
    for (const b of blockers) {
      if (y < b.y0 - 0.05 || y >= b.y1) continue;
      // Circle vs rectangle.
      const cx = Math.max(b.x, Math.min(x, b.x + b.w));
      const cz = Math.max(b.z, Math.min(z, b.z + b.d));
      if ((x - cx) ** 2 + (z - cz) ** 2 < radius * radius) return true;
    }
    return false;
  }

  // Where an actor at `pos` ({x, y, z}) ends up after trying to move by (dx, dz).
  // Slides along walls by retrying each axis alone. Returns a new {x, y, z}.
  function move(pos, dx, dz, radius = RADIUS) {
    const attempt = (nx, nz) => {
      const h = heightAt(nx, nz, pos.y);
      if (h == null || blocked(nx, nz, h, radius)) return null;
      return { x: nx, y: h, z: nz };
    };
    return attempt(pos.x + dx, pos.z + dz) ?? attempt(pos.x + dx, pos.z) ?? attempt(pos.x, pos.z + dz) ?? { ...pos };
  }

  function canStand(x, z, y, radius = RADIUS) {
    const h = heightAt(x, z, y);
    return h != null && !blocked(x, z, h, radius);
  }

  // Names of zones containing the point (y range optional per zone).
  function zonesAt(x, z, y = 0) {
    return Object.entries(zones)
      .filter(([, r]) => inRect(r, x, z) && (r.y0 == null || (y >= r.y0 && y < r.y1)))
      .map(([name]) => name);
  }

  return { heightAt, blocked, move, canStand, zonesAt };
}
