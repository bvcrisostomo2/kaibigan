// Runs a chapter with no rendering. Host actions resolve instantly and are logged;
// dialogues are auto-played, asking `chooser(dialogueId, nodeId, choices)` for each choice.
import { createBus } from '../../src/story/events.js';
import { createDirector } from '../../src/story/director.js';

export function createHeadlessGame({ chapter, state, hints = [], chooser = () => 0 }) {
  const bus = createBus({ onError: (error) => { throw error; } });
  const ctx = { state, bus, hints };
  const log = [];
  const host = {
    async run(action) {
      log.push(action);
    },
    async runDialogue(runner) {
      let guard = 0;
      while (!runner.done) {
        if (++guard > 500) throw new Error(`Dialogue ${runner.id} did not finish`);
        const cur = runner.current();
        log.push(['line', runner.id, cur.id]);
        if (cur.choices) runner.choose(chooser(runner.id, cur.id, cur.choices));
        else runner.advance();
      }
    },
  };
  const director = createDirector({ chapter, ctx, host });
  return { director, state, bus, log, ctx };
}
