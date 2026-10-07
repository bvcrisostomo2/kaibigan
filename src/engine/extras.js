// Extras (Plan 5 spec §3.5): unnamed background people who make a map feel alive. The boot drives
// them every frame, whatever the story is doing. Each extra stands, sits, or walks a loop of
// spots, and may have an activity: a looping animation such as sweeping or playing the harp.
//
//   createExtras(list, { spots, collision, spawn })
//     list   world.extras: [{ id, costume, map, spot?, dir?, pose?: 'sit', activity?, loop?, pause? }]
//            spot or loop[0] places it; loop visits spots in order (and back to the first),
//            pausing `pause` seconds (default 2) at each, doing its activity while paused
//     spawn({ id, costume, position, dir }) → an actor (engine/actors.js)
//   → { actors: Map(id → actor), update(dt) }
import { WALK_SPEED } from './actors.js';

export const STROLL = WALK_SPEED * 0.55; // walkers stroll
const ARRIVE = 0.1;
const STUCK_SECONDS = 1;

export function createExtras(list, { spots, collision, spawn }) {
  const actors = new Map();
  const walkers = [];
  for (const e of list) {
    const first = e.loop?.[0] ?? e.spot;
    const at = spots[first];
    if (!at) throw new Error(`Extra '${e.id}': spot '${first}' not found`);
    const actor = spawn({ id: e.id, costume: e.costume, position: at.clone(), dir: e.dir ?? 'down' });
    actor.face(e.dir ?? 'down');
    if (e.pose === 'sit') actor.sit(e.dir ?? 'down');
    if (e.activity) actor.act(e.activity);
    actors.set(e.id, actor);
    if (e.loop?.length > 1) {
      for (const s of e.loop) if (!spots[s]) throw new Error(`Extra '${e.id}': loop spot '${s}' not found`);
      walkers.push({ e, actor, next: 1, wait: e.pause ?? 2, stuck: 0 });
    }
  }

  function update(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    for (const w of walkers) {
      if (w.wait > 0) {
        w.wait -= dt;
        if (w.wait <= 0) w.actor.act(null);
        continue;
      }
      const target = spots[w.e.loop[w.next]];
      const p = w.actor.position;
      const dx = target.x - p.x;
      const dz = target.z - p.z;
      const dist = Math.hypot(dx, dz);
      if (dist < ARRIVE || w.stuck > STUCK_SECONDS) {
        if (dist >= ARRIVE) w.actor.object.position.copy(target);
        w.actor.setMotion(0, 0);
        if (w.e.activity) w.actor.act(w.e.activity);
        w.next = (w.next + 1) % w.e.loop.length;
        w.wait = w.e.pause ?? 2;
        w.stuck = 0;
        continue;
      }
      const step = Math.min(dist, STROLL * dt);
      const next = collision.move(p, (dx / dist) * step, (dz / dist) * step);
      const moved = Math.hypot(next.x - p.x, next.z - p.z);
      w.actor.object.position.set(next.x, next.y, next.z);
      w.actor.setMotion(dx, dz);
      w.stuck = moved < step * 0.25 ? w.stuck + dt : 0;
    }
  }

  return { actors, update };
}
