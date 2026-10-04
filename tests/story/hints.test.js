import { describe, it, expect } from 'vitest';
import { checkHints } from '../../src/story/hints.js';
import { createState } from '../../src/story/state.js';
import { createBus } from '../../src/story/events.js';
import { createDialogue, seenFlag } from '../../src/story/dialogue.js';

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

  it('fires several hints in one call, returned and emitted in order', () => {
    const s = createState();
    const bus = createBus();
    const seen = [];
    bus.on('hint', (h) => seen.push(h.id));
    s.hinala = 2;
    s.tiwala = 2;
    expect(checkHints(s, hints, bus).map((h) => h.id)).toEqual(['eyes', 'trust']);
    expect(seen).toEqual(['eyes', 'trust']);
    expect(s.hintsShown).toEqual(['eyes', 'trust']);
  });

  it('fires a hint without setFlag and leaves flags alone', () => {
    const s = createState();
    s.tiwala = 2;
    expect(checkHints(s, hints).map((h) => h.id)).toEqual(['trust']);
    expect(s.hintsShown).toEqual(['trust']);
    expect(s.flags).toEqual([]);
  });

  it('fires a hint exactly when a dialogue ends, via its seen: flag', () => {
    const dialogue = { id: 'chat', start: 'a', nodes: { a: { who: 'isabel', text: 'Hi', next: 'b' }, b: { who: 'isabel', text: 'Bye', next: null } } };
    const state = createState();
    const bus = createBus();
    const order = [];
    bus.on('*', (e) => order.push(e.type));
    const ctx = { state, bus, hints: [{ id: 'h', if: { flag: seenFlag('chat') }, journal: 'x' }] };
    const d = createDialogue(dialogue, ctx);
    expect(state.hintsShown).toEqual([]);
    d.advance(); // now on the last node, not yet done
    expect(d.done).toBe(false);
    expect(order).not.toContain('hint');
    expect(state.hintsShown).toEqual([]);
    d.advance();
    expect(d.done).toBe(true);
    expect(state.hintsShown).toEqual(['h']);
    expect(order.filter((t) => t === 'hint')).toHaveLength(1);
  });
});
