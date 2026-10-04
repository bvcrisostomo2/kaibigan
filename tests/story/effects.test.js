import { describe, it, expect } from 'vitest';
import { applyEffects } from '../../src/story/effects.js';
import { createState } from '../../src/story/state.js';
import { createBus } from '../../src/story/events.js';

function makeCtx(hints = []) {
  const bus = createBus();
  const events = [];
  bus.on('*', (e) => events.push(e.type));
  return { ctx: { state: createState(), bus, hints }, events };
}

describe('applyEffects', () => {
  it('ignores null effects', () => {
    const { ctx, events } = makeCtx();
    applyEffects(ctx, null);
    expect(events).toEqual([]);
  });

  it('changes meters and affinity by deltas', () => {
    const { ctx } = makeCtx();
    applyEffects(ctx, { tiwala: 2, hinala: 1, affinity: { guevarra: 1, damaso: -2 } });
    applyEffects(ctx, { tiwala: -1, affinity: { guevarra: 1 } });
    expect(ctx.state).toMatchObject({ tiwala: 1, hinala: 1, affinity: { guevarra: 2, damaso: -2 } });
  });

  it('sets flags, insight, notes and bios without duplicates', () => {
    const { ctx, events } = makeCtx();
    applyEffects(ctx, { flag: 'a', flags: ['a', 'b'], insight: 'i1', note: 'n1', bio: 'ibarra' });
    applyEffects(ctx, { note: 'n1', bio: 'ibarra' });
    expect(ctx.state.flags).toEqual(['a', 'b']);
    expect(ctx.state.insight).toEqual(['i1']);
    expect(ctx.state.notes).toEqual(['n1']);
    expect(ctx.state.bios).toEqual(['ibarra']);
    expect(events.filter((t) => t === 'journal:note')).toHaveLength(1);
    expect(events.filter((t) => t === 'journal:bio')).toHaveLength(1);
  });

  it('emits state:changed without exposing meter values', () => {
    const bus = createBus();
    const payloads = [];
    bus.on('state:changed', (p) => payloads.push(p));
    applyEffects({ state: createState(), bus, hints: [] }, { tiwala: 1 });
    expect(payloads).toEqual([undefined]);
  });

  it('checks hints after applying', () => {
    const { ctx } = makeCtx([{ id: 'h', if: { hinalaAtLeast: 2 }, journal: 'x' }]);
    applyEffects(ctx, { hinala: 2 });
    expect(ctx.state.hintsShown).toEqual(['h']);
  });

  it('throws on unknown keys', () => {
    const { ctx } = makeCtx();
    expect(() => applyEffects(ctx, { trust: 1 })).toThrow('Unknown effect key: trust');
  });
});
