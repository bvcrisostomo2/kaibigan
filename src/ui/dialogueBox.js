// The dialogue box (spec §4.2): who is speaking, the typed-out text and the choice cursor.
// Pure: gameUi.js feeds it the runner's lines and turns its answers into runner calls.
import { createTypewriter, revealSegments, segmentsLength } from './typewriter.js';
import { wrapIndex } from './cursor.js';

// A node's `who` → { kind: 'npc' | 'player' | 'narrator', name, costume }.
export function speakerFor(who, { cast, state }) {
  if (who == null || who === 'narrator') return { kind: 'narrator', name: null, costume: null };
  if (who === 'player') {
    return { kind: 'player', name: `${state.title} ${state.name}`, costume: state.title === 'Doña' ? 'player_dona' : 'player_don' };
  }
  const c = cast.find((x) => x.id === who);
  return { kind: 'npc', name: c?.name ?? who, costume: c?.costume ?? null };
}

export function createDialogueBox({ speed = 'normal' } = {}) {
  let line = null;
  let typewriter = null;
  let cursor = 0;
  let paused = false;
  const choicesShown = () => line?.choices != null && typewriter.done;

  return {
    // `next` is runner.current() plus { speaker } from speakerFor().
    setLine(next) {
      line = next;
      cursor = 0;
      typewriter = createTypewriter(next.segments ? segmentsLength(next.segments) : 0, speed);
    },
    // Takes effect from the next line.
    setSpeed(s) {
      speed = s;
    },
    get paused() {
      return paused;
    },
    pause(p) {
      paused = p;
    },
    // True when the view needs redrawing.
    update(dt) {
      return line != null && !paused ? typewriter.update(dt) : false;
    },
    // Talk or a click: finish typing, else take the highlighted choice, else go on.
    // Returns { type: 'finish' } | { type: 'choose', index } | { type: 'advance' } | null.
    confirm() {
      if (!line) return null;
      if (!typewriter.done) {
        typewriter.finish();
        return { type: 'finish' };
      }
      if (line.choices) return { type: 'choose', index: line.choices[cursor].index };
      return { type: 'advance' };
    },
    // Move the choice cursor. False while there are no choices on screen.
    move(delta) {
      if (!choicesShown()) return false;
      cursor = wrapIndex(cursor + delta, line.choices.length);
      return true;
    },
    // A tap or click on a choice.
    pick(index) {
      if (!choicesShown() || !line.choices.some((c) => c.index === index)) return null;
      return { type: 'choose', index };
    },
    view() {
      if (!line) return null;
      return {
        speaker: line.speaker,
        face: line.face ?? 'neutral',
        segments: revealSegments(line.segments ?? [], typewriter.visible),
        typing: !typewriter.done,
        choices: choicesShown() ? line.choices : null,
        cursor,
      };
    },
  };
}
