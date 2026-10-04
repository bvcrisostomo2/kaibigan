// The beat machine: runs a chapter's screenplay (content/chapterN/beats.js).
//
// A chapter is { number, startBeat, beats: [...], dialogues: { id: def } }.
// A beat is { id, checkpoint?, restore?, trigger?, next?, actions?, interactions? }:
//  - Entering a beat runs its `actions` (a cutscene). While actions run the director is busy.
//  - After that the player roams. The director watches the *next* beat's `trigger`
//    (next = beat.next, or the following beat in the array). A next beat with no trigger
//    starts as soon as the current beat's actions finish.
//  - `interactions` maps a target id to a dialogue id, or to a list of
//    'dialogueId' / { dialogue, if } entries (first match wins).
//
// The host performs everything visual and drives dialogues:
//   host.run(action) → Promise   for HOST_ACTIONS, e.g. ['moveTo', 'tiago', 'sala_door']
//   host.runDialogue(runner) → Promise, resolved once runner.done is true
//
// start() rejects with 'Director is busy' if a sequence is running, and with
// "Beat '<id>' not found" for an unknown beat (state and `ended` stay untouched). A valid
// start() resets `ended` so a finished chapter can be restarted.
//
// Saving and resuming:
//  - Autosave only on 'beat:enter'. It fires before the beat's actions run, which is what
//    replay-on-resume needs: resuming calls start(state.beat), which runs that beat's actions
//    again. Saving at any other moment would double-apply a beat's actions on resume.
//  - Resuming an autosave uses start(state.beat). If that beat no longer exists (content
//    changed between versions), fall back to findCheckpoint(chapters, state.checkpoint) or
//    discard the save; start() rejects rather than guessing.
//  - findCheckpoint() returns null for an unknown checkpoint number.
//  - Save codes are produced by saveCode.trackCheckpointCodes(), never mid-beat.
//
// Render loop: update() and interact() return promises that resolve only after a whole
// cutscene has played, and they may reject (bad content, host failure). The render loop must
// not await them (it would stall the frame) and must attach .catch to them.
import { evaluate } from './conditions.js';
import { applyEffects } from './effects.js';
import { createDialogue } from './dialogue.js';

export const DIRECTOR_ACTIONS = ['dialogue', 'branch', 'setBeat', 'effects', 'endChapter'];
export const HOST_ACTIONS = [
  'titleCard', 'moveTo', 'face', 'teleport', 'emote', 'fadeOut', 'fadeIn',
  'setTime', 'wait', 'cutscene', 'camera', 'show', 'hide', 'sound',
];
export const TRIGGER_KEYS = ['enterZone', 'interact', 'afterSec', 'or'];

export function createDirector({ chapter, ctx, host }) {
  const { state, bus } = ctx;
  const beats = new Map(chapter.beats.map((b) => [b.id, b]));
  const order = chapter.beats.map((b) => b.id);
  let beat = null;
  let beatTime = 0;
  let busy = false;
  let ended = false;
  let zone = null;
  let interacted = new Set();

  async function sequence(fn) {
    busy = true;
    try {
      await fn();
    } finally {
      busy = false;
    }
  }

  function nextBeat() {
    if (!beat) return null;
    const id = beat.next ?? order[order.indexOf(beat.id) + 1];
    return id ? beats.get(id) ?? null : null;
  }

  async function enterBeat(id) {
    const b = beats.get(id);
    if (!b) throw new Error(`Beat '${id}' not found`);
    beat = b;
    beatTime = 0;
    interacted = new Set();
    state.chapter = chapter.number;
    state.beat = id;
    if (b.checkpoint != null) state.checkpoint = b.checkpoint;
    bus?.emit('beat:enter', { id, checkpoint: b.checkpoint ?? null });
    if (b.checkpoint != null) bus?.emit('checkpoint', { id: b.checkpoint, beat: id });
    const jump = b.actions ? await runActions(b.actions) : null;
    if (ended) return;
    if (jump) return enterBeat(jump);
    const next = nextBeat();
    if (next && !next.trigger) return enterBeat(next.id);
  }

  // Returns a beat id when a setBeat was reached, otherwise null.
  async function runActions(actions) {
    for (const action of actions) {
      const [type, arg] = action;
      switch (type) {
        case 'dialogue':
          await runDialogue(arg);
          break;
        case 'branch': {
          const chosen = arg.find((br) => evaluate(br.if, state));
          if (chosen) {
            const jump = await runActions(chosen.actions);
            if (jump) return jump;
          }
          break;
        }
        case 'setBeat':
          return arg;
        case 'effects':
          applyEffects(ctx, arg);
          break;
        case 'endChapter':
          ended = true;
          bus?.emit('chapter:end', { chapter: chapter.number });
          break;
        default:
          if (!HOST_ACTIONS.includes(type)) throw new Error(`Unknown action '${type}'`);
          await host.run(action);
      }
      if (ended) return null;
    }
    return null;
  }

  async function runDialogue(id) {
    const def = chapter.dialogues[id];
    if (!def) throw new Error(`Dialogue '${id}' not found`);
    const runner = createDialogue(def, ctx);
    bus?.emit('dialogue:start', { id });
    await host.runDialogue(runner);
    if (!runner.done) throw new Error(`Host returned before dialogue '${id}' finished`);
  }

  function triggerFires(t) {
    const { or, enterZone, interact, afterSec, ...cond } = t;
    const hasPrimary = enterZone != null || interact != null || afterSec != null || Object.keys(cond).length > 0;
    if (!hasPrimary && or == null) return true;
    const primary =
      hasPrimary &&
      (enterZone == null || zone === enterZone) &&
      (interact == null || interacted.has(interact)) &&
      (afterSec == null || beatTime >= afterSec) &&
      evaluate(cond, state);
    return primary || (or != null && triggerFires(or));
  }

  async function checkTriggers() {
    if (busy || ended || !beat) return false;
    const next = nextBeat();
    if (next && next.trigger && triggerFires(next.trigger)) {
      await sequence(() => enterBeat(next.id));
      return true;
    }
    return false;
  }

  function resolveInteraction(entry) {
    if (!entry) return null;
    for (const e of Array.isArray(entry) ? entry : [entry]) {
      if (typeof e === 'string') return e;
      if (evaluate(e.if, state)) return e.dialogue;
    }
    return null;
  }

  return {
    get beat() { return beat?.id ?? null; },
    get busy() { return busy; },
    get ended() { return ended; },
    get zone() { return zone; },
    get beatTime() { return beatTime; },

    // Enter a beat (default: the chapter's start beat). Resolves when its actions finish.
    // Rejects with 'Director is busy' if a sequence is already running, or if the beat does not
    // exist (checked before anything changes). Clears `ended`, so a
    // director can be restarted after a chapter ends (the player's zone persists).
    start(beatId = chapter.startBeat) {
      if (busy) return Promise.reject(new Error('Director is busy'));
      if (!beats.has(beatId)) return Promise.reject(new Error(`Beat '${beatId}' not found`));
      ended = false;
      return sequence(() => enterBeat(beatId));
    },

    // Advance the beat timer (seconds; paused while busy) and check the next beat's trigger.
    update(dt) {
      if (busy || ended || !beat) return Promise.resolve(false);
      beatTime += dt;
      return checkTriggers();
    },

    setZone(zoneId) {
      zone = zoneId;
      return checkTriggers();
    },

    // The player pressed Talk on a target. Resolves true if a dialogue ran.
    async interact(target) {
      if (busy || ended || !beat) return false;
      interacted.add(target);
      bus?.emit('interact', { target });
      const dialogueId = resolveInteraction(beat.interactions?.[target]);
      if (dialogueId) await sequence(() => runDialogue(dialogueId));
      await checkTriggers();
      return dialogueId != null;
    },

    // Targets that would open a dialogue right now (for "!" markers).
    availableInteractions() {
      if (busy || ended || !beat) return [];
      return Object.keys(beat.interactions ?? {}).filter((t) => resolveInteraction(beat.interactions[t]) != null);
    },
  };
}

// Finds the beat carrying a checkpoint number across chapters (used when loading a save code).
export function findCheckpoint(chapters, checkpoint) {
  for (const chapter of chapters) {
    const beat = chapter.beats.find((b) => b.checkpoint === checkpoint);
    if (beat) return { chapter, beat };
  }
  return null;
}
