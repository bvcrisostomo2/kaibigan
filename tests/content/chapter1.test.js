import { describe, it, expect } from 'vitest';
import { chapter1, chapter1Content } from '../../src/content/chapter1/index.js';
import { validateContent } from '../../src/story/validate.js';
import { createState } from '../../src/story/state.js';
import { trackCheckpointCodes, decodeCode, codeLength } from '../../src/story/saveCode.js';
import { buildWorld } from '../../src/engine/world.js';
import { sheetSource } from '../../src/art/threeTextures.js';
import { TIME_ORDER } from '../../src/engine/lighting.js';
import { createHeadlessGame } from '../support/headless.js';

const { level, cast, glossary, notes, hints, letter } = chapter1Content;

describe('Chapter 1 content', () => {
  it('passes the content validator against its level', () => {
    const { errors } = validateContent({
      chapters: [chapter1], cast, glossary, notes, hints,
      level: { zones: Object.keys(level.zones), spots: Object.keys(level.spots) },
    });
    expect(errors).toEqual([]);
  });

  it('casts known costumes at real spots', () => {
    const world = buildWorld(level);
    for (const c of cast) {
      expect(() => sheetSource(c.costume), c.id).not.toThrow();
      if (c.homeSpot != null) expect(world.spots[c.homeSpot], c.id).toBeDefined();
    }
  });

  it('only interacts with cast members and the level’s examinables', () => {
    const targets = new Set([...cast.map((c) => c.id), ...level.examinables.map((e) => e.id)]);
    for (const b of chapter1.beats) for (const t of Object.keys(b.interactions ?? {})) expect(targets, `${b.id}.${t}`).toContain(t);
  });

  it('has a title card, a location and a real time for every reference, and a letter', () => {
    for (const b of chapter1.beats) {
      for (const [type, arg] of b.actions ?? []) {
        if (type === 'titleCard') expect(chapter1.titleCards[arg]).toBeDefined();
        if (type === 'setTime') expect(TIME_ORDER).toContain(arg);
      }
      expect(chapter1.locations[b.location], b.id).toBeDefined();
    }
    expect(letter.paragraphs.length).toBeGreaterThan(0);
    expect(chapter1.endCard.prompts).toHaveLength(3);
  });
});

describe('Chapter 1 opening (headless)', () => {
  function play() {
    const game = createHeadlessGame({ chapter: chapter1, state: createState({ name: 'Ana', title: 'Doña' }), hints });
    const codes = trackCheckpointCodes(game.ctx);
    return { ...game, codes };
  }

  it('plays to the card when the player explores: notes, Isabel, the sala', async () => {
    const { director, state, codes } = play();
    await director.start();
    expect(director.beat).toBe('k1_arrive');
    await director.interact('staircase');
    await director.interact('bridge');
    expect(state.notes).toEqual(['note_bahay_na_bato', 'note_binondo']);
    await director.setZone('caida');
    expect(director.beat).toBe('k1_greeting');
    expect(state.bios).toContain('isabel');
    await director.setZone('sala');
    expect(director.ended).toBe(true);
    const code = codes.latest;
    expect(code.split(' ')).toHaveLength(codeLength());
    expect(codeLength()).toBeLessThanOrEqual(7);
    expect(decodeCode(code).data).toMatchObject({ checkpoint: 1, title: 'Doña' });
  });

  it('still reaches the card when the player does nothing', async () => {
    const { director } = play();
    await director.start();
    await director.update(181);
    expect(director.beat).toBe('k1_greeting');
    await director.update(121);
    expect(director.ended).toBe(true);
  });
});
