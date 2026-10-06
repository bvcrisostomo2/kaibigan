import { describe, it, expect } from 'vitest';
import { createHeadlessGame } from '../support/headless.js';
import { miniChapter, miniHints } from '../fixtures/miniChapter.js';
import { createState } from '../../src/story/state.js';
import { createBus } from '../../src/story/events.js';
import { createDirector, findCheckpoint } from '../../src/story/director.js';

function game(chooser) {
  return createHeadlessGame({ chapter: miniChapter, state: createState({ name: 'Andres' }), hints: miniHints, chooser });
}

// A one-node dialogue, to keep the inline chapters below short.
function line(id) {
  return { id, start: 'a', nodes: { a: { who: 'isabel', text: id, next: null } } };
}

function headless(chapter) {
  return createHeadlessGame({ chapter, state: createState({ name: 'Andres' }) });
}

// A host whose run() stays pending until the test resolves it by hand, so the
// director can be observed mid-cutscene. Dialogues auto-play like the headless host.
function manualGame(chapter) {
  const state = createState({ name: 'Andres' });
  const bus = createBus({ onError: (error) => { throw error; } });
  const ctx = { state, bus, hints: [] };
  const log = [];
  const pending = [];
  const host = {
    run(action) {
      log.push(action);
      return new Promise((resolve) => pending.push(resolve));
    },
    async runDialogue(runner) {
      while (!runner.done) {
        log.push(['line', runner.id, runner.current().id]);
        runner.advance();
      }
    },
  };
  const director = createDirector({ chapter, ctx, host });
  return { director, state, bus, log, pending };
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
    const opened = [];
    g.bus.on('dialogue:start', (e) => opened.push(e.id));
    await g.director.start();
    opened.length = 0; // ignore the start beat's own dialogue
    expect(g.director.availableInteractions()).toEqual(['isabel']);
    expect(await g.director.interact('nobody')).toBe(false);
    expect(opened).toEqual([]);
    expect(await g.director.interact('isabel')).toBe(true);
    expect(opened[0]).toBe('isabel_chat'); // the flag it sets then chains into the next beat
    expect(g.log).toContainEqual(['line', 'isabel_chat', 'a']);
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

  it('picks the first matching { dialogue, if } entry and hides targets with no match', async () => {
    const talkChapter = {
      number: 1,
      startBeat: 'hub',
      dialogues: { isabel_chat: line('isabel_chat'), isabel_again: line('isabel_again'), guard_talk: line('guard_talk') },
      beats: [
        {
          id: 'hub',
          interactions: {
            isabel: [{ dialogue: 'isabel_again', if: { flag: 'seen:isabel_chat' } }, 'isabel_chat'],
            guard: [{ dialogue: 'guard_talk', if: { flag: 'never_set' } }],
          },
        },
      ],
    };
    const g = headless(talkChapter);
    await g.director.start();
    expect(g.director.availableInteractions()).toEqual(['isabel']);
    expect(await g.director.interact('guard')).toBe(false);
    expect(await g.director.interact('isabel')).toBe(true);
    expect(await g.director.interact('isabel')).toBe(true);
    expect(await g.director.interact('isabel')).toBe(true);
    expect(g.log).toEqual([
      ['line', 'isabel_chat', 'a'],
      ['line', 'isabel_again', 'a'],
      ['line', 'isabel_again', 'a'],
    ]);
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

  it('accumulates beat time across updates while idle', async () => {
    const g = game();
    await g.director.start();
    expect(g.director.beatTime).toBe(0);
    await g.director.update(5);
    await g.director.update(2.5);
    expect(g.director.beatTime).toBe(7.5);
  });

  it("fires an { interact } trigger once the target is used, even with no dialogue", async () => {
    const chapter = {
      number: 1,
      startBeat: 'a',
      dialogues: { d_last: line('d_last') },
      beats: [
        { id: 'a' },
        { id: 'last', trigger: { interact: 'door' }, actions: [['dialogue', 'd_last']] },
      ],
    };
    const g = headless(chapter);
    await g.director.start();
    expect(await g.director.update(100)).toBe(false);
    expect(await g.director.interact('window')).toBe(false);
    expect(g.director.beat).toBe('a');
    expect(await g.director.interact('door')).toBe(false); // 'door' opens no dialogue...
    expect(g.director.beat).toBe('last'); // ...but it still fired the trigger
    expect(g.log).toEqual([['line', 'd_last', 'a']]);
  });
});

describe('director: branches and chapter end', () => {
  it.each([
    [0, 'close_plans'],
    [1, 'close_alone'],
    [2, 'close_alone'],
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

    // On the plans branch the shadow never appears.
    const plans = game(() => 0);
    await plans.director.start();
    await plans.director.setZone('sala');
    await plans.director.update(60);
    expect(plans.log).toContainEqual(['line', 'close_plans', 'a']);
    expect(plans.log).not.toContainEqual(['cutscene', 'guardia_shadow']);
  });

  it('restarts a finished chapter from the start beat', async () => {
    const g = game(() => 2);
    await g.director.start();
    await g.director.interact('isabel');
    expect(g.director.ended).toBe(true);

    g.log.length = 0;
    await g.director.start();
    expect(g.director.ended).toBe(false);
    expect(g.director.beat).toBe('arrive');
    expect(g.log).toEqual([['titleCard', 1], ['line', 'greet', 'a']]);

    // Reaching the end again flips `ended` back on.
    await g.director.interact('isabel');
    expect(g.director.ended).toBe(true);
  });

  it('rejects an unknown beat without un-ending the chapter or touching state', async () => {
    const g = game(() => 2);
    await g.director.start();
    await g.director.interact('isabel');
    expect(g.director.ended).toBe(true);
    const before = JSON.stringify(g.state);
    await expect(g.director.start('nope')).rejects.toThrow("Beat 'nope' not found");
    expect(g.director.ended).toBe(true);
    expect(g.director.busy).toBe(false);
    expect(JSON.stringify(g.state)).toBe(before);
  });
});

describe('director: jumps, next overrides and effects', () => {
  // 'a' sets state with `effects`, then a branch case jumps to 'far' with setBeat.
  // 'far' says next: 'last', skipping the 'skipped' entry that follows it in the array.
  const flowChapter = {
    number: 1,
    startBeat: 'a',
    dialogues: {
      d_jump: line('d_jump'),
      d_after_jump: line('d_after_jump'),
      d_far: line('d_far'),
      d_skipped: line('d_skipped'),
      d_last: line('d_last'),
    },
    beats: [
      {
        id: 'a',
        actions: [
          ['effects', { flag: 'went_far', tiwala: 2 }],
          ['branch', [{ if: { flag: 'went_far' }, actions: [['dialogue', 'd_jump'], ['setBeat', 'far']] }]],
          ['dialogue', 'd_after_jump'],
        ],
      },
      { id: 'far', actions: [['dialogue', 'd_far']], next: 'last' },
      { id: 'skipped', actions: [['dialogue', 'd_skipped']] },
      { id: 'last', trigger: { interact: 'door' }, actions: [['dialogue', 'd_last']] },
    ],
  };

  function flowGame() {
    const g = headless(flowChapter);
    const entered = [];
    g.bus.on('beat:enter', (e) => entered.push(e.id));
    return { ...g, entered };
  }

  it('applies the effects action and jumps with setBeat from inside a branch case', async () => {
    const g = flowGame();
    await g.director.start();
    expect(g.state.flags).toContain('went_far');
    expect(g.state.tiwala).toBe(2);
    expect(g.director.beat).toBe('far');
    expect(g.entered).toEqual(['a', 'far']);
    // Actions after the jump are abandoned.
    expect(g.log).toEqual([['line', 'd_jump', 'a'], ['line', 'd_far', 'a']]);
  });

  it('honours a beat next override instead of the following array entry', async () => {
    const g = flowGame();
    await g.director.start();
    expect(g.director.busy).toBe(false);
    expect(g.director.beat).toBe('far'); // waits for 'last', does not roll into 'skipped'
    await g.director.interact('door');
    expect(g.director.beat).toBe('last');
    expect(g.entered).toEqual(['a', 'far', 'last']);
    expect(g.log).not.toContainEqual(['line', 'd_skipped', 'a']);
    expect(g.log).toContainEqual(['line', 'd_last', 'a']);
  });
});

describe('director: busy state (manual host)', () => {
  const busyChapter = {
    number: 1,
    startBeat: 'intro',
    dialogues: { hello: line('hello'), sala_talk: line('sala_talk') },
    beats: [
      {
        id: 'intro',
        actions: [['cutscene', 'intro_scene'], ['dialogue', 'hello']],
        interactions: { isabel: 'hello' },
      },
      { id: 'sala', trigger: { enterZone: 'sala' }, actions: [['sound', 'bell'], ['dialogue', 'sala_talk']] },
    ],
  };

  it('ignores updates, interactions and a second start while a cutscene action is pending', async () => {
    const g = manualGame(busyChapter);
    const interactions = [];
    g.bus.on('interact', (e) => interactions.push(e.target));

    const started = g.director.start();
    expect(g.director.busy).toBe(true);
    expect(g.pending).toHaveLength(1);

    expect(await g.director.update(10)).toBe(false);
    expect(g.director.beatTime).toBe(0);
    expect(await g.director.interact('isabel')).toBe(false);
    expect(interactions).toEqual([]);
    expect(g.director.availableInteractions()).toEqual([]);
    await expect(g.director.start()).rejects.toThrow('Director is busy');

    // The rejected start must not have run a second chain or cleared busy.
    expect(g.pending).toHaveLength(1);
    expect(g.director.busy).toBe(true);
    expect(g.log).toEqual([['cutscene', 'intro_scene']]);

    g.pending.shift()();
    await started;
    expect(g.director.busy).toBe(false);
    expect(g.log).toEqual([['cutscene', 'intro_scene'], ['line', 'hello', 'a']]);
    expect(g.director.availableInteractions()).toEqual(['isabel']);
  });

  it('fires a trigger satisfied while busy on the next update after the cutscene resolves', async () => {
    const g = manualGame(busyChapter);
    const started = g.director.start();
    expect(await g.director.setZone('sala')).toBe(false); // busy: zone recorded, nothing fires
    expect(g.director.zone).toBe('sala');
    expect(g.pending).toHaveLength(1);

    g.pending.shift()();
    await started;
    expect(g.director.beat).toBe('intro'); // still not fired by the end of the cutscene itself

    const fired = g.director.update(0.1);
    expect(g.director.busy).toBe(true);
    expect(g.pending).toHaveLength(1);
    expect(g.log).toContainEqual(['sound', 'bell']);
    g.pending.shift()();
    expect(await fired).toBe(true);
    expect(g.director.beat).toBe('sala');
    expect(g.director.busy).toBe(false);
    expect(g.log).toContainEqual(['line', 'sala_talk', 'a']);
  });

  it('releases busy and rejects a second start even if the first sequence fails', async () => {
    const g = manualGame({ ...busyChapter, beats: [{ id: 'intro', actions: [['cutscene', 'x'], ['nonsense']] }] });
    const started = g.director.start();
    const outcome = expect(started).rejects.toThrow("Unknown action 'nonsense'");
    expect(g.director.busy).toBe(true);
    g.pending.shift()();
    await outcome;
    expect(g.director.busy).toBe(false);
  });
});

describe('findCheckpoint', () => {
  it('finds the beat for a checkpoint number', () => {
    expect(findCheckpoint([miniChapter], 2).beat.id).toBe('dinner');
    expect(findCheckpoint([miniChapter], 9)).toBe(null);
  });
});

describe('interactionFor', () => {
  it('names the dialogue Talk would open now, following the beat\'s conditions', async () => {
    const { director, state } = createHeadlessGame({ chapter: miniChapter, state: createState({ name: 'Ana' }) });
    expect(director.interactionFor('isabel')).toBe(null); // not started
    await director.start();
    expect(director.interactionFor('isabel')).toBe('isabel_chat');
    expect(director.interactionFor('nobody')).toBe(null);
    state.flags.push('seen:isabel_chat'); // conditions are read live
    expect(director.interactionFor('isabel')).toBe('isabel_again');
  });
});
