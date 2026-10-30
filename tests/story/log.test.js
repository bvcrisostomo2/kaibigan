import { describe, it, expect } from 'vitest';
import { trackLog, LOG_LIMIT } from '../../src/story/log.js';
import { createState } from '../../src/story/state.js';
import { createBus } from '../../src/story/events.js';
import { createDialogue } from '../../src/story/dialogue.js';

const dialogues = {
  k: {
    id: 'k',
    start: 'a',
    nodes: {
      a: { who: 'ibarra', text: 'x', next: 'b' },
      b: { who: 'player', text: 'q', choices: [{ text: 'one', if: { flag: 'never' }, next: null }, { text: 'two', next: null }] },
    },
  },
};

function setup() {
  const state = createState({ name: 'Ana' });
  const bus = createBus({ onError: (e) => { throw e; } });
  const stop = trackLog({ state, bus }, dialogues);
  return { state, bus, stop };
}

describe('trackLog', () => {
  it('logs each line and the picked choice as references, not text', () => {
    const { state, bus } = setup();
    bus.emit('dialogue:node', { id: 'k', node: 'a' });
    bus.emit('dialogue:node', { id: 'k', node: 'b' }); // a choice prompt is not logged
    bus.emit('dialogue:choice', { id: 'k', node: 'b', index: 0, choice: 1 });
    expect(state.log).toEqual([['k', 'a'], ['k', 'b', 1]]);
  });

  it('logs a dialogue as it plays', () => {
    const { state, bus } = setup();
    const d = createDialogue(dialogues.k, { state, bus });
    d.advance();
    d.choose(0); // the only visible choice: the second one
    expect(state.log).toEqual([['k', 'a'], ['k', 'b', 1]]);
  });

  it('keeps the newest LOG_LIMIT entries', () => {
    const { state, bus } = setup();
    for (let i = 0; i < LOG_LIMIT + 5; i++) bus.emit('dialogue:node', { id: 'k', node: 'a' });
    expect(state.log).toHaveLength(LOG_LIMIT);
  });

  it('stops logging when stopped', () => {
    const { state, bus, stop } = setup();
    stop();
    bus.emit('dialogue:node', { id: 'k', node: 'a' });
    expect(state.log).toEqual([]);
  });
});
