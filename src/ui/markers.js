// Interaction markers (spec §4.2): within MARKER_RANGE of the player and on the same floor, an
// interactable with a dialogue to open now gets "!" until that dialogue is seen, then "…".
// Talk reaches the same range (talkTarget), so a marker always means Talk works from here.
//   targets: [{ id, x, y, z }]   world positions
//   dialogueFor(id) → dialogue id | null   (director.interactionFor)
//   seen(dialogueId) → boolean              (its seen: flag is set)
export const MARKER_RANGE = 2;
const SAME_FLOOR = 1.5;

export function markersFor(targets, player, { dialogueFor, seen }) {
  const out = [];
  for (const tg of targets) {
    if (Math.abs(tg.y - player.y) > SAME_FLOOR) continue;
    if (Math.hypot(tg.x - player.x, tg.z - player.z) > MARKER_RANGE) continue;
    const dialogue = dialogueFor(tg.id);
    if (dialogue) out.push({ id: tg.id, kind: seen(dialogue) ? '…' : '!' });
  }
  return out;
}

// The target Talk would reach: the nearest one within MARKER_RANGE, on the same floor, whose id
// is in `open` (the ids the current beat lists). null when none.
export function talkTarget(targets, player, open) {
  let best = null;
  let bestDistance = Infinity;
  for (const tg of targets) {
    if (!open.has(tg.id) || Math.abs(tg.y - player.y) > SAME_FLOOR) continue;
    const d = Math.hypot(tg.x - player.x, tg.z - player.z);
    if (d <= MARKER_RANGE && d < bestDistance) {
      best = tg.id;
      bestDistance = d;
    }
  }
  return best;
}
