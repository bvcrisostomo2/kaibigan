import { describe, it, expect } from 'vitest';
import { createHeadlessGame } from '../support/headless.js';
import { miniChapter, miniHints } from '../fixtures/miniChapter.js';
import { createState } from '../../src/story/state.js';
import { findCheckpoint } from '../../src/story/director.js';

function game(chooser) {
  return createHeadlessGame({ chapter: miniChapter, state: createState({ name: 'Andres' }), hints: miniHints, chooser });
}

describe('director: entering beats', () => {
  it('runs the start beat actions and records beat + checkpoint', async () => {
    const g = game();
    const events = [];
    g.bus.on('checkpoint', (e) => events.push(e));
    await g.director.start();
    expect(g.director.beat).toBe('arrive');
    expect(g.state).toMatchObject({ beat: 'arrive', checkpoint: 1, chapter: 1 });
    expect(g.log).toEqual([['titleCard', 1], ['line', 'greet', 'a']]);
    expect(events).toEqual([{ id: 1, beat: 'arrive' }]);
    expect(g.director.busy).toBe(false);
  });

  it('throws on an unknown beat', async () => {
    await expect(game().director.start('nope')).rejects.toThrow("Beat 'nope' not found");
  });
});

describe('director: interactions', () => {
  it('opens the first matching dialogue and lists available targets', async () => {
    const g = game();
    await g.director.start();
    expect(g.director.availableInteractions()).toEqual(['isabel']);
    expect(await g.director.interact('nobody')).toBe(false);
    expect(g.director.beat).toBe('arrive');
  });

  it('a flag set by an interaction fires the next beat trigger', async () => {
    const g = game(() => 2);
    await g.director.start();
    expect(await g.director.interact('isabel')).toBe(true);
    expect(g.state.notes).toEqual(['note_indio']);
    // seen:isabel_chat triggered dinner, which auto-ran into close and ended the chapter
    expect(g.director.ended).toBe(true);
    expect(g.log).toContainEqual(['moveTo', 'damaso', 'table']);
  });
});

describe('director: triggers', () => {
  it('waits for afterSec and the zone together (or-branch)', async () => {
    const g = game(() => 2);
    await g.director.start();
    expect(await g.director.update(61)).toBe(false); // time passed, but not in the sala
    expect(await g.director.setZone('sala')).toBe(true);
    expect(g.director.ended).toBe(true);
  });

  it('does not count time while busy', async () => {
    const g = game();
    await g.director.start();
    expect(g.director.beatTime).toBe(0);
    await g.director.update(5);
    expect(g.director.beatTime).toBe(5);
  });
});

describe('director: branches and chapter end', () => {
  it.each([
    [0, 'close_plans', false],
    [1, 'close_alone', false],
    [2, 'close_alone', false],
  ])('choice %i at the insult leads to %s', async (choice, closing) => {
    const g = game(() => choice);
    const ends = [];
    g.bus.on('chapter:end', (e) => ends.push(e));
    await g.director.start();
    await g.director.setZone('sala');
    await g.director.update(60);
    expect(g.log).toContainEqual(['line', closing, 'a']);
    expect(ends).toEqual([{ chapter: 1 }]);
    expect(g.director.availableInteractions()).toEqual([]);
  });

  it('plays the shadow cutscene only on the hinala branch', async () => {
    const g = game(() => 0);
    g.state.tiwala = -5; // force tiwala below 2 even after defying (+2)
    await g.director.start();
    await g.director.setZone('sala');
    await g.director.update(60);
    expect(g.log).toContainEqual(['line', 'close_alone', 'a']);
    expect(g.log).toContainEqual(['cutscene', 'guardia_shadow']);
    expect(g.state.flags).toContain('guardia_watching');
  });
});

describe('findCheckpoint', () => {
  it('finds the beat for a checkpoint number', () => {
    expect(findCheckpoint([miniChapter], 2).beat.id).toBe('dinner');
    expect(findCheckpoint([miniChapter], 9)).toBe(null);
  });
});
