import { describe, it, expect } from 'vitest';
import { createDialogue, seenFlag } from '../../src/story/dialogue.js';
import { plainText } from '../../src/story/text.js';
import { createState } from '../../src/story/state.js';
import { createBus } from '../../src/story/events.js';

const def = {
  id: 'damaso_test',
  start: 'a',
  nodes: {
    a: { who: 'damaso', face: 'angry', text: 'You there, {title} {name}!', effects: { insight: 'met_damaso' }, next: 'secret' },
    secret: { who: 'narrator', text: 'Only the honest see this.', if: { flag: 'honest' }, next: 'c' },
    c: {
      who: 'player',
      text: 'How do you answer?',
      choices: [
        { text: 'Defy him.', effects: { tiwala: 2, hinala: 2 }, next: 'd' },
        { text: 'Hidden choice.', if: { flag: 'never' }, next: 'd' },
        { text: 'Stay silent.', effects: { tiwala: -1 }, next: null },
      ],
    },
    d: { who: 'damaso', text: 'Insolence!', next: null },
  },
};

function makeCtx() {
  const state = createState({ name: 'Andres', title: 'Don' });
  return { state, bus: createBus(), hints: [] };
}

describe('createDialogue', () => {
  it('starts at the start node, substitutes text and applies node effects', () => {
    const ctx = makeCtx();
    const d = createDialogue(def, ctx);
    const cur = d.current();
    expect(cur).toMatchObject({ id: 'a', who: 'damaso', face: 'angry', choices: null });
    expect(plainText(cur.segments)).toBe('You there, Don Andres!');
    expect(ctx.state.insight).toEqual(['met_damaso']);
  });

  it('skips nodes whose condition is false', () => {
    const d = createDialogue(def, makeCtx());
    d.advance();
    expect(d.current().id).toBe('c');
  });

  it('shows nodes whose condition is true', () => {
    const ctx = makeCtx();
    ctx.state.flags.push('honest');
    const d = createDialogue(def, ctx);
    d.advance();
    expect(d.current().id).toBe('secret');
  });

  it('lists only visible choices, indexed from 0', () => {
    const d = createDialogue(def, makeCtx());
    d.advance();
    expect(d.current().choices.map((c) => [c.index, plainText(c.segments)])).toEqual([
      [0, 'Defy him.'],
      [1, 'Stay silent.'],
    ]);
  });

  it('applies choice effects and follows the choice', () => {
    const ctx = makeCtx();
    const d = createDialogue(def, ctx);
    d.advance();
    d.choose(0);
    expect(ctx.state).toMatchObject({ tiwala: 2, hinala: 2 });
    expect(d.current().id).toBe('d');
  });

  it('finishes, sets the seen flag and emits dialogue:end', () => {
    const ctx = makeCtx();
    const ends = [];
    ctx.bus.on('dialogue:end', (e) => ends.push(e.id));
    const d = createDialogue(def, ctx);
    d.advance();
    d.choose(1);
    expect(d.done).toBe(true);
    expect(d.current()).toBe(null);
    expect(ctx.state.tiwala).toBe(-1);
    expect(ctx.state.flags).toContain(seenFlag('damaso_test'));
    expect(ends).toEqual(['damaso_test']);
  });

  it('skips a choice node with no visible choices', () => {
    const d = createDialogue(
      { id: 'x', start: 'a', nodes: { a: { choices: [{ text: 'no', if: { flag: 'never' }, next: null }], next: 'b' }, b: { who: 'narrator', text: 'B', next: null } } },
      makeCtx(),
    );
    expect(d.current().id).toBe('b');
  });

  it('rejects advance on a choice node and bad choice indexes', () => {
    const d = createDialogue(def, makeCtx());
    d.advance();
    expect(() => d.advance()).toThrow('needs a choice');
    expect(() => d.choose(5)).toThrow('no choice 5');
  });

  it('throws on a missing node', () => {
    expect(() => createDialogue({ id: 'bad', start: 'nope', nodes: {} }, makeCtx())).toThrow("node 'nope' not found");
  });
});
