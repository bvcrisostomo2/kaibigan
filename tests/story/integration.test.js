// End-to-end over the story core: play the fixture chapter headlessly on every path,
// save a code at a checkpoint, load it into a fresh game, and finish from there.
import { describe, it, expect } from 'vitest';
import { createHeadlessGame } from '../support/headless.js';
import { miniChapter, miniHints } from '../fixtures/miniChapter.js';
import { createState } from '../../src/story/state.js';
import { encodeCode, decodeCode, stateFromCode, trackCheckpointCodes } from '../../src/story/saveCode.js';
import { findCheckpoint } from '../../src/story/director.js';

async function playToEnd(g, { talk = false } = {}) {
  await g.director.start();
  if (talk) await g.director.interact('isabel');
  for (let i = 0; i < 100 && !g.director.ended; i++) {
    await g.director.setZone('sala');
    await g.director.update(10);
  }
  return g;
}

function closingOf(g) {
  return g.log.find((e) => e[0] === 'line' && e[1].startsWith('close_'))?.[1];
}

describe('fixture chapter, headless', () => {
  it.each([
    ['idle path (only afterSec fallbacks)', false],
    ['talkative path (optional interaction)', true],
  ])('reaches the end on the %s', async (_label, talk) => {
    const g = await playToEnd(createHeadlessGame({ chapter: miniChapter, state: createState(), hints: miniHints }), { talk });
    expect(g.director.ended).toBe(true);
  });

  it('reaches every closing scene across all choice combinations, without softlocks', async () => {
    const closings = new Set();
    for (const choice of [0, 1, 2]) {
      for (const startHinala of [0, 2]) {
        const state = createState();
        state.hinala = startHinala;
        const g = await playToEnd(createHeadlessGame({ chapter: miniChapter, state, hints: miniHints, chooser: () => choice }));
        expect(g.director.ended).toBe(true);
        closings.add(closingOf(g) + (g.log.some((e) => e[0] === 'cutscene') ? '+shadow' : ''));
      }
    }
    expect([...closings].sort()).toEqual(['close_alone', 'close_alone+shadow', 'close_plans']);
  });

  it('resumes from a save code at a checkpoint and finishes identically', async () => {
    // Play until the dinner checkpoint is reached, capturing the code there.
    const g1 = createHeadlessGame({ chapter: miniChapter, state: createState({ name: 'Andres', title: 'Doña' }), hints: miniHints, chooser: () => 0 });
    let code = null;
    g1.bus.on('checkpoint', (e) => { if (e.id === 2) code = encodeCode(g1.state); });
    await playToEnd(g1, { talk: true });
    expect(code).not.toBe(null);

    // Fresh device: decode, rebuild state, start at the checkpoint beat.
    const decoded = decodeCode(code);
    expect(decoded.ok).toBe(true);
    const { chapter, beat } = findCheckpoint([miniChapter], decoded.data.checkpoint);
    const state = stateFromCode(decoded.data, 'Andres', beat.restore, miniHints);
    expect(state.flags).toContain('seen:greet');
    expect(state.notes).toEqual(['note_indio']);
    const g2 = createHeadlessGame({ chapter, state, hints: miniHints, chooser: () => 0 });
    await g2.director.start(beat.id);
    expect(g2.director.ended).toBe(true);
    expect(closingOf(g1)).toBeDefined();
    expect(closingOf(g2)).toBe(closingOf(g1));
    expect(g2.state).toMatchObject({ tiwala: g1.state.tiwala, hinala: g1.state.hinala, title: 'Doña' });
  });
});

describe('trackCheckpointCodes', () => {
  function newGame() {
    return createHeadlessGame({
      chapter: miniChapter,
      state: createState({ name: 'Andres', title: 'Doña' }),
      hints: miniHints,
      chooser: () => 0,
    });
  }

  it('is null before any checkpoint', () => {
    const g = newGame();
    const tracker = trackCheckpointCodes(g.ctx);
    expect(tracker.latest).toBe(null);
  });

  it('keeps the code from checkpoint entry, not the state after later choices', async () => {
    const g = newGame();
    const tracker = trackCheckpointCodes(g.ctx);
    let atEntry = null;
    g.bus.on('checkpoint', (e) => { if (e.id === 2) atEntry = encodeCode(g.state); });
    await playToEnd(g, { talk: true });
    expect(atEntry).not.toBe(null);
    expect(tracker.latest).toBe(atEntry);
    // The insult choice changed tiwala, so the end state encodes differently.
    expect(encodeCode(g.state)).not.toBe(atEntry);
  });

  it('resumes from latest and finishes with the same outcome', async () => {
    const g1 = newGame();
    const tracker = trackCheckpointCodes(g1.ctx);
    await playToEnd(g1, { talk: true });
    expect(closingOf(g1)).toBeDefined();

    const decoded = decodeCode(tracker.latest);
    expect(decoded.ok).toBe(true);
    const { chapter, beat } = findCheckpoint([miniChapter], decoded.data.checkpoint);
    const state = stateFromCode(decoded.data, 'Andres', beat.restore, miniHints);
    const g2 = createHeadlessGame({ chapter, state, hints: miniHints, chooser: () => 0 });
    await g2.director.start(beat.id);
    expect(g2.director.ended).toBe(true);
    expect(closingOf(g2)).toBe(closingOf(g1));
    expect(g2.state).toMatchObject({ tiwala: g1.state.tiwala, hinala: g1.state.hinala, title: 'Doña' });
  });

  it('stops updating after stop()', async () => {
    const g = newGame();
    const tracker = trackCheckpointCodes(g.ctx);
    await g.director.start(); // checkpoint 1
    const first = tracker.latest;
    expect(first).not.toBe(null);
    tracker.stop();
    await g.director.interact('isabel'); // chains into checkpoint 2
    expect(g.director.beat).not.toBe('arrive');
    expect(tracker.latest).toBe(first);
  });
});
