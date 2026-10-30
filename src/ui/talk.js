// Who a line is aimed at (Plan 5 spec §4.6). A spoken line is aimed at the last other person who
// spoke, unless it names its own `to` (null: the whole room). Narration and choice prompts aren't
// speech; a picked choice is the player speaking. The last speaker carries over from one
// conversation to the next until reset() (the player changed map).
export function createTalk() {
  let last = null;
  let before = null; // the speaker before `last` who isn't `last`

  function spoke(who) {
    if (who === last) return;
    before = last;
    last = who;
  }

  return {
    get last() {
      return last;
    },
    // A runner line → { actor, feeling, move, target }, or null when no one speaks it.
    line({ who, face = null, move = null, to, choices = null }) {
      if (who == null || who === 'narrator' || choices) return null;
      let target = to !== undefined ? to : last !== who ? last : before;
      if (target === who) target = null;
      spoke(who);
      return { actor: who, feeling: face ?? 'neutral', move: move ?? null, target: target ?? null };
    },
    chose() {
      spoke('player');
    },
    reset() {
      last = null;
      before = null;
    },
  };
}
