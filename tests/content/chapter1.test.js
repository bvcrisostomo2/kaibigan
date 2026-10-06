import { describe, it, expect } from 'vitest';
import { chapter1, chapter1Content } from '../../src/content/chapter1/index.js';
import { validateContent } from '../../src/story/validate.js';
import { createState } from '../../src/story/state.js';
import { trackCheckpointCodes, decodeCode, codeLength, stateFromCode } from '../../src/story/saveCode.js';
import { findCheckpoint } from '../../src/story/director.js';
import { chapterEndView } from '../../src/ui/chapterEnd.js';
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

describe('Chapter 1, Kabanata I–III (headless)', () => {
  // choices: { 'dialogueId.nodeId': index }; unlisted choice nodes take the first choice.
  function play(choices = {}, state = createState({ name: 'Ana', title: 'Doña' })) {
    const game = createHeadlessGame({ chapter: chapter1, state, hints, chooser: (id, node) => choices[`${id}.${node}`] ?? 0 });
    const codes = trackCheckpointCodes(game.ctx);
    const events = [];
    game.bus.on('checkpoint', (e) => events.push(e));
    return { ...game, codes, events };
  }

  // The active path: up the stairs, into the sala, into Dámaso's group, three guests, the table.
  async function playThrough(choices) {
    const game = play(choices);
    const { director } = game;
    await director.start();
    await director.setZone('caida');
    await director.setZone('sala');
    expect(director.beat).toBe('k1_sala');
    await director.interact('damaso');
    expect(director.beat).toBe('k1_argument');
    for (const guest of ['newcomer', 'victorina', 'sibyla']) await director.interact(guest);
    expect(director.beat).toBe('k2_entrance');
    await director.setZone('caida');
    expect(director.beat).toBe('k3_dinner');
    expect(director.ended).toBe(true);
    return game;
  }

  const standings = (state) => chapterEndView(state, { chapter: 1, endCard: chapter1.endCard, notes, code: null }).standings;

  it('openly: Dámaso remembers you, and Ibarra trusts you', async () => {
    const { state, events, log } = await playThrough({ 'k1_argument.n': 2, 'k1_newcomer.b': 1, 'k3_table_talk.p': 0 });
    expect(state.flags).toEqual(expect.arrayContaining(['ch1_defied_damaso', 'guardia_watching']));
    expect(state.flags).not.toContain('ch1_defended_indios');
    expect([state.tiwala, state.hinala]).toEqual([2, 2]);
    expect(state.affinity).toMatchObject({ victorina: 1, tiago: 1 });
    expect(state.hintsShown).toEqual(expect.arrayContaining(['eyes', 'damaso_eyes']));
    expect(standings(state)).toEqual(['Padre Dámaso will remember your name.']);
    expect(events.map((e) => e.id)).toEqual([1, 2, 3]);
    // Everyone is seated before the dinner talk; Ibarra stands, leaves, and is gone.
    expect(log).toContainEqual(['sit', 'player', 'seat_player', 'down']);
    expect(log.findIndex((a) => a[0] === 'stand' && a[1] === 'ibarra')).toBeGreaterThan(log.findIndex((a) => a[1] === 'k3_table_talk'));
    expect(log).toContainEqual(['hide', 'ibarra']);
  });

  it('with tact: Ibarra noticed, and nobody is watching', async () => {
    const { state } = await playThrough({ 'k1_argument.n': 2, 'k1_newcomer.b': 1, 'k3_table_talk.p': 1 });
    expect(state.flags).toContain('ch1_tactful');
    expect([state.tiwala, state.hinala]).toEqual([1, 0]);
    expect(state.hintsShown).toEqual([]);
    expect(standings(state)).toEqual(['Ibarra noticed you speak up for him.']);
  });

  it('silent, after two risky minor moments: watched all the same', async () => {
    const { state } = await playThrough({ 'k1_argument.n': 0, 'k1_newcomer.b': 0, 'k3_table_talk.p': 2 });
    expect(state.flags).toEqual(expect.arrayContaining(['ch1_silent', 'ch1_defended_indios', 'guardia_watching']));
    expect([state.tiwala, state.hinala]).toEqual([-1, 2]);
    expect(state.affinity.guevarra).toBe(1);
    expect(state.notes).toContain('note_indio');
    expect(standings(state)).toEqual([
      'Ibarra looked for you when Dámaso spoke. You looked at your plate.',
      'Teniente Guevarra counts you among the decent ones.',
    ]);
  });

  it('silent and agreeable throughout: safe, and alone', async () => {
    const { state } = await playThrough({ 'k1_argument.n': 1, 'k1_newcomer.b': 1, 'k1_victorina.c': 1, 'k3_seating.m': 1, 'k3_table_talk.p': 2 });
    expect(state.flags).toEqual(expect.arrayContaining(['ch1_silent', 'ch1_sided_damaso']));
    expect([state.tiwala, state.hinala]).toEqual([-1, -1]);
    expect(state.affinity).toMatchObject({ guevarra: -1, victorina: -1 });
    expect(state.affinity.tiago ?? 0).toBe(0);
    expect(standings(state)).toEqual([
      'Ibarra looked for you when Dámaso spoke. You looked at your plate.',
      'Padre Dámaso thinks you a sensible young person.',
    ]);
  });

  it('finds the notes of Kabanata I–III by exploring and talking', async () => {
    const { director, state } = play();
    await director.start();
    await director.interact('staircase');
    await director.interact('bridge');
    await director.setZone('caida');
    await director.setZone('sala');
    for (const target of ['sibyla', 'guevarra', 'tiago_portrait']) await director.interact(target);
    expect(director.beat).toBe('k1_sala');
    await director.interact('laruja');
    expect(director.beat).toBe('k1_argument');
    await director.interact('newcomer');
    expect(state.notes).toEqual(['note_bahay_na_bato', 'note_binondo', 'note_friars', 'note_guardia_civil', 'note_principalia', 'note_indio']);
    for (const guest of ['victorina', 'tiburcio']) await director.interact(guest);
    await director.setZone('caida');
    expect(director.ended).toBe(true);
    expect(state.notes).toHaveLength(7);
    expect(state.bios).toEqual(expect.arrayContaining(['isabel', 'damaso', 'sibyla', 'guevarra', 'laruja', 'newcomer', 'victorina', 'tiburcio', 'tiago', 'ibarra']));
  });

  it('still reaches the card when the player does nothing', async () => {
    const { director, events } = play();
    await director.start();
    for (const [seconds, beat] of [[181, 'k1_greeting'], [121, 'k1_sala'], [151, 'k1_argument'], [121, 'k2_entrance']]) {
      await director.update(seconds);
      expect(director.beat).toBe(beat);
    }
    await director.update(61);
    expect(director.beat).toBe('k3_dinner');
    expect(director.ended).toBe(true);
    expect(events.map((e) => e.id)).toEqual([1, 2, 3]);
  });

  it('codes from checkpoints 1, 2 and 3 load and resume at their beats, the diners seated again', async () => {
    const { director, codes } = play({ 'k3_table_talk.p': 1 });
    const seen = {};
    const record = () => (seen[director.beat] = codes.latest);
    await director.start();
    record();
    await director.setZone('caida');
    await director.setZone('sala');
    await director.interact('damaso');
    for (const guest of ['newcomer', 'victorina', 'sibyla']) await director.interact(guest);
    record();
    await director.setZone('caida');
    record();
    expect(Object.keys(seen)).toEqual(['k1_arrive', 'k2_entrance', 'k3_dinner']);
    for (const [beatId, code] of Object.entries(seen)) {
      expect(code.split(' ')).toHaveLength(codeLength());
      expect(codeLength()).toBeLessThanOrEqual(7);
      const { data } = decodeCode(code);
      const { beat } = findCheckpoint([chapter1], data.checkpoint);
      expect(beat.id).toBe(beatId);
      const resumed = play({}, stateFromCode(data, 'Ana', beat.restore, hints));
      await resumed.director.start(beat.id);
      expect(resumed.director.ended).toBe(beatId === 'k3_dinner');
      if (beatId === 'k3_dinner') {
        expect(resumed.log).toContainEqual(['cutscene', 'seat_guests']);
        expect(resumed.log).toContainEqual(['sit', 'player', 'seat_player', 'down']);
        expect(resumed.state.bios).toContain('ibarra');
      }
    }
  });

  it('resumes 4a autosaves at k1_greeting and k1_sala into the new story', async () => {
    for (const beat of ['k1_greeting', 'k1_sala']) {
      const { director } = play();
      await director.start(beat);
      if (beat === 'k1_greeting') await director.setZone('sala');
      expect(director.beat).toBe('k1_sala');
      expect(director.ended).toBe(false);
      await director.interact('newcomer');
      expect(director.beat).toBe('k1_argument');
    }
  });

  it('gives a resumed game its save code straight away, and a new game none', () => {
    const resumed = createState({ name: 'Ana', title: 'Doña' });
    resumed.checkpoint = 1;
    const a = createHeadlessGame({ chapter: chapter1, state: resumed, hints });
    expect(decodeCode(trackCheckpointCodes(a.ctx).latest).data).toMatchObject({ checkpoint: 1, title: 'Doña' });
    const b = createHeadlessGame({ chapter: chapter1, state: createState({ name: 'Ana', title: 'Doña' }), hints });
    expect(trackCheckpointCodes(b.ctx).latest).toBeNull();
  });

  it('gives each book line to the character who says it in the book', () => {
    const text = (id) => Object.values(chapter1.dialogues[id].nodes).map((n) => n.text ?? '').join(' ');
    expect(text('k1_laruja')).not.toContain('made of the right stuff'); // Dámaso's line in Chapter I
    const told = Object.keys(chapter1.dialogues).filter((id) => text(id).includes('gunpowder'));
    expect(told).toEqual(['k1_espadanas']); // the gunpowder joke is told once
  });

  it('sets the time and keeps Isabel offstage in every beat that can be resumed', () => {
    const times = { k1_greeting: 'dusk', k1_sala: 'dusk', k1_argument: 'dusk', k2_entrance: 'evening', k3_dinner: 'night' };
    for (const [id, time] of Object.entries(times)) {
      const beat = chapter1.beats.find((b) => b.id === id);
      expect(beat.actions, id).toContainEqual(['setTime', time]);
      if (id !== 'k1_greeting') expect(beat.actions, id).toContainEqual(['hide', 'isabel']);
    }
  });
});
