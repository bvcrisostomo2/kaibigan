// The title screen's options (spec §3.9, §4.2) for an autosave load result.
import { findCheckpoint } from '../story/director.js';

// Where a saved game resumes: its beat if that beat still exists, else its checkpoint's beat
// (content changed between versions), else null (the save can't be resumed).
export function resumeBeat(state, chapters) {
  if (chapters.some((ch) => ch.beats.some((b) => b.id === state.beat))) return state.beat;
  return findCheckpoint(chapters, state.checkpoint)?.beat.id ?? null;
}

// load = loadGame() result. Returns { items, notice, resume }: Continue only for a resumable save;
// notice is a string key when a save had to be discarded.
export function titleMenu(load, chapters) {
  const resume = load.state ? resumeBeat(load.state, chapters) : null;
  const items = resume ? ['continue', 'newGame', 'enterCode'] : ['newGame', 'enterCode'];
  const discarded = load.error === 'corrupt' || load.error === 'version' || (load.state != null && resume == null);
  return { items, notice: discarded ? 'title.saveDiscarded' : null, resume };
}
