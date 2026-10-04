import { describe, it, expect } from 'vitest';
import { checkHints } from '../../src/story/hints.js';
import { createState } from '../../src/story/state.js';
import { createBus } from '../../src/story/events.js';

const hints = [
  { id: 'eyes', if: { hinalaAtLeast: 2 }, journal: 'You sense eyes on you.', setFlag: 'guardia_watching' },
  { id: 'trust', if: { tiwalaAtLeast: 2 }, journal: 'Ibarra speaks freely with you.' },
];

describe('checkHints', () => {
  it('fires nothing while conditions are false', () => {
    const s = createState();
    expect(checkHints(s, hints)).toEqual([]);
    expect(s.hintsShown).toEqual([]);
  });

  it('fires once, records it, sets its flag and emits', () => {
    const s = createState();
    const bus = createBus();
    const seen = [];
    bus.on('hint', (h) => seen.push(h));
    s.hinala = 2;
    expect(checkHints(s, hints, bus).map((h) => h.id)).toEqual(['eyes']);
    expect(s.hintsShown).toEqual(['eyes']);
    expect(s.flags).toContain('guardia_watching');
    expect(seen).toEqual([{ id: 'eyes', journal: 'You sense eyes on you.' }]);
    expect(checkHints(s, hints, bus)).toEqual([]);
    expect(seen).toHaveLength(1);
  });
});
