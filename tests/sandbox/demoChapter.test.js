import { describe, it, expect } from 'vitest';
import { demoChapter, demoCast, demoGlossary, demoNotes, demoHints, demoLetter } from '../../src/sandbox/demoChapter.js';
import { sandboxLevel, sandboxCast } from '../../src/sandbox/sandboxLevel.js';
import { validateContent } from '../../src/story/validate.js';
import { createState } from '../../src/story/state.js';
import { trackCheckpointCodes, decodeCode, stateFromCode } from '../../src/story/saveCode.js';
import { findCheckpoint } from '../../src/story/director.js';
import { sheetSource } from '../../src/art/threeTextures.js';
import { TIME_ORDER } from '../../src/engine/lighting.js';
import { createHeadlessGame } from '../support/headless.js';

const actions = (beats) => beats.flatMap((b) => b.actions ?? []);

describe('demo chapter content', () => {
  // Save-code layout coverage is checked for the real Chapter 1 (Plan 4), not this demo.
  it('passes the content validator against the sandbox level', () => {
    const { errors } = validateContent({
      chapters: [demoChapter], cast: demoCast, glossary: demoGlossary, notes: demoNotes, hints: demoHints,
      level: { zones: Object.keys(sandboxLevel.zones), spots: Object.keys(sandboxLevel.spots) },
    });
    expect(errors).toEqual([]);
  });

  it('has a title card, a location and a real time of day for every reference', () => {
    for (const [type, arg] of actions(demoChapter.beats)) {
      if (type === 'titleCard') expect(demoChapter.titleCards[arg], `title card ${arg}`).toBeDefined();
      if (type === 'setTime') expect(TIME_ORDER).toContain(arg);
    }
    for (const b of demoChapter.beats) expect(demoChapter.locations[b.location], b.id).toBeDefined();
  });

  it('casts only sandbox actors with known costumes, and fills the letter and end card', () => {
    const actorIds = sandboxCast.map((c) => c.id);
    for (const c of demoCast) {
      expect(actorIds, c.id).toContain(c.id);
      expect(() => sheetSource(c.costume)).not.toThrow();
    }
    for (const b of demoChapter.beats) for (const target of Object.keys(b.interactions ?? {})) expect(actorIds).toContain(target);
    expect(demoLetter.paragraphs.length).toBeGreaterThan(0);
    expect(demoChapter.endCard.prompts).toHaveLength(3);
  });
});

describe('demo chapter playthrough (headless)', () => {
  function play(chooser) {
    const game = createHeadlessGame({ chapter: demoChapter, state: createState({ name: 'Ana', title: 'Doña' }), hints: demoHints, chooser });
    const events = [];
    game.bus.on('*', (e) => events.push(e.type));
    const codes = trackCheckpointCodes(game.ctx);
    return { ...game, events, codes };
  }

  it('reaches the chapter end through every screen-facing event when the player speaks up', async () => {
    const { director, state, events, codes } = play((id) => (id === 'demo_damaso' || id === 'demo_ibarra' ? 1 : 0));
    await director.start();
    expect(director.beat).toBe('demo_arrive');
    for (const target of ['ibarra', 'ibarra', 'guevarra', 'isabel']) await director.interact(target);
    await director.setZone('sala');
    expect(director.beat).toBe('demo_sala');
    for (const target of ['victorina', 'sibyla', 'tiago']) await director.interact(target);
    expect(director.ended).toBe(true);
    for (const type of ['checkpoint', 'hint', 'journal:note', 'journal:bio', 'dialogue:choice', 'chapter:end']) expect(events, type).toContain(type);
    expect(state.notes).toEqual(['note_bahay_na_bato', 'note_indio']);
    expect(state.hintsShown).toEqual(['demo_eyes']);
    const decoded = decodeCode(codes.latest);
    expect(decoded.ok).toBe(true);
    expect(decoded.data).toMatchObject({ checkpoint: 2, title: 'Doña', notes: ['note_bahay_na_bato', 'note_indio'] });
  });

  it('a code from the last checkpoint resumes at the end beat with its restore flags', async () => {
    const { director, codes } = play(() => 0);
    await director.start();
    await director.setZone('sala');
    await director.interact('tiago');
    const { data } = decodeCode(codes.latest);
    const { beat } = findCheckpoint([demoChapter], data.checkpoint);
    expect(beat.id).toBe('demo_end');
    expect(stateFromCode(data, 'Ana', beat.restore, demoHints).flags).toContain('seen:demo_damaso');
  });

  it('still reaches the end when the player does nothing (afterSec fallbacks)', async () => {
    const { director } = play(() => 0);
    await director.start();
    await director.update(301);
    expect(director.beat).toBe('demo_sala');
    await director.update(241);
    expect(director.ended).toBe(true);
  });
});

describe('demo content bundle (?demo)', () => {
  it('places every demo cast member at a real spot on the sandbox level', async () => {
    const { demoContent } = await import('../../src/sandbox/demoContent.js');
    const { buildWorld } = await import('../../src/engine/world.js');
    const world = buildWorld(demoContent.level);
    for (const c of demoContent.cast) expect(world.spots[c.homeSpot], c.id).toBeDefined();
    for (const z of demoContent.level.indoorZones) expect(Object.keys(demoContent.level.zones)).toContain(z);
    expect(demoContent.chapter).toBe(demoChapter);
  });
});
