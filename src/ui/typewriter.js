// Types a line out a character at a time (spec §4.2). Speeds are characters per second.
export const TEXT_SPEEDS = { slow: 30, normal: 60, fast: 120, instant: Infinity };

export function createTypewriter(length, speed = 'normal') {
  const cps = TEXT_SPEEDS[speed] ?? TEXT_SPEEDS.normal;
  let shown = cps === Infinity ? length : 0;
  return {
    get visible() {
      return Math.min(length, Math.floor(shown));
    },
    get done() {
      return shown >= length;
    },
    // Advance by dt seconds (bad frame times are ignored). True when more text became visible.
    update(dt) {
      if (shown >= length || !Number.isFinite(dt) || dt <= 0) return false;
      const before = Math.floor(shown);
      shown = Math.min(length, shown + cps * dt);
      return Math.floor(shown) !== before;
    },
    finish() {
      shown = length;
    },
  };
}

export function segmentsLength(segments) {
  return segments.reduce((n, s) => n + s.text.length, 0);
}

// The first `count` characters of parsed text segments; a glossary term cut short stays a term.
export function revealSegments(segments, count) {
  const out = [];
  let left = count;
  for (const s of segments) {
    if (left <= 0) break;
    const text = s.text.slice(0, left);
    out.push({ ...s, text });
    left -= text.length;
  }
  return out;
}
