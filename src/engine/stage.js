// The engine side of the story director's host (spec §5.1): performs cutscene actions on the 3D
// world. Plan 4 composes the full host as
//   { run: (a) => stage.handles(a[0]) ? stage.run(a) : ui.run(a), runDialogue: ui.runDialogue }.
//
// Actions handled here (args after the action name):
//   moveTo   actorId, spotOrActorId        walk there; teleports if stuck or too slow (spec §7)
//   teleport actorId, spotOrActorId
//   face     actorId, direction (8-way, e.g. 'down_left') | actorId
//   emote    actorId, expressionOrGesture|null
//   show / hide  actorId
//   sit      actorId, spot, direction       snap onto a seat, seated, facing direction
//   stand    actorId                         stand up, stepping clear of the chair
//   setTime  'dusk'|'evening'|'night', seconds?
//   camera   'follow', actorId  |  'focus', spotOrActorId  |  'zoom', distance
//   wait     seconds
//   fadeOut / fadeIn  seconds?
//   sound    layer, level                  ambience/music layer level 0–1
import { dirFromVector, DIRECTIONS, WALK_SPEED } from './actors.js';
import { STEP } from './collision.js';

export const STAGE_ACTIONS = ['moveTo', 'teleport', 'face', 'emote', 'show', 'hide', 'sit', 'stand', 'setTime', 'camera', 'wait', 'fadeOut', 'fadeIn', 'sound'];
const ARRIVE = 0.12;
const STUCK_SECONDS = 0.6;
// Unit steps for each facing (+z is down), used to step back from a chair when standing.
const STEP_OF = { right: [1, 0], down_right: [1, 1], down: [0, 1], down_left: [-1, 1], left: [-1, 0], up_left: [-1, -1], up: [0, -1], up_right: [1, -1] };

export function createStage({ world, actors, camera, lighting, audio, fader }) {
  const moves = new Map(); // actorId → { target, resolve, elapsed, stuck, limit }
  const waits = [];

  function actor(id) {
    const a = actors.get(id);
    if (!a) throw new Error(`Unknown actor '${id}'`);
    return a;
  }

  function point(name) {
    if (world.spots[name]) return world.spots[name].clone();
    if (actors.has(name)) return actors.get(name).position.clone();
    throw new Error(`Unknown spot or actor '${name}'`);
  }

  function teleport(a, p) {
    a.object.position.copy(p);
    a.setMotion(0, 0);
  }

  // The nearest point beside p where an actor can stand (a seat sits inside its chair's
  // blocker), trying straight back from the facing first. Falls back to p itself.
  function clearOf(p, facing) {
    const [fx, fz] = STEP_OF[facing] ?? [0, 1];
    const back = Math.atan2(-fz, -fx);
    for (const r of [0.55, 0.8, 1.1, 1.5]) {
      for (let i = 0; i < 8; i++) {
        const a = back + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * (Math.PI / 4);
        const x = p.x + Math.cos(a) * r;
        const z = p.z + Math.sin(a) * r;
        if (world.collision.canStand(x, z, p.y)) return p.clone().set(x, world.collision.heightAt(x, z, p.y), z);
      }
    }
    return p.clone();
  }

  return {
    handles: (type) => STAGE_ACTIONS.includes(type),
    // True while any walk or wait is in progress.
    get busy() { return moves.size > 0 || waits.length > 0; },

    run(action) {
      const [type, a1, a2] = action;
      switch (type) {
        case 'moveTo': {
          const a = actor(a1);
          const target = point(a2);
          moves.get(a1)?.resolve();
          const dist = a.position.distanceTo(target);
          return new Promise((resolve) => moves.set(a1, { target, resolve, elapsed: 0, stuck: 0, limit: dist / WALK_SPEED * 2 + 2 }));
        }
        case 'teleport':
          teleport(actor(a1), point(a2));
          return Promise.resolve();
        case 'face': {
          const a = actor(a1);
          if (DIRECTIONS.includes(a2)) a.face(a2);
          else {
            const p = point(a2);
            a.face(dirFromVector(p.x - a.position.x, p.z - a.position.z, a.dir));
          }
          return Promise.resolve();
        }
        case 'emote':
          actor(a1).emote(a2 ?? null);
          return Promise.resolve();
        case 'sit': {
          const a = actor(a1);
          moves.get(a1)?.resolve();
          moves.delete(a1);
          a.object.position.copy(point(a2));
          a.sit(action[3]);
          return Promise.resolve();
        }
        case 'stand': {
          const a = actor(a1);
          if (a.seated) {
            a.stand();
            a.object.position.copy(clearOf(a.position, a.dir));
          }
          return Promise.resolve();
        }
        case 'show':
        case 'hide':
          actor(a1).object.visible = type === 'show';
          return Promise.resolve();
        case 'setTime':
          return lighting.setTime(a1, a2 ?? 0);
        case 'camera':
          if (a1 === 'follow') camera.follow(actor(a2).object);
          else if (a1 === 'focus') camera.follow(point(a2));
          else if (a1 === 'zoom') camera.setDistance(a2);
          else return Promise.reject(new Error(`Unknown camera mode '${a1}'`));
          return Promise.resolve();
        case 'wait':
          return new Promise((resolve) => waits.push({ left: a1, resolve }));
        case 'fadeOut':
          return fader.fadeOut(a1);
        case 'fadeIn':
          return fader.fadeIn(a1);
        case 'sound':
          audio.setLayer(a1, a2);
          return Promise.resolve();
        default:
          return Promise.reject(new Error(`Stage cannot run '${type}'`));
      }
    },

    // Drop every pending walk and wait without finishing them (quitting to the title).
    cancel() {
      for (const id of moves.keys()) actor(id).setMotion(0, 0);
      moves.clear();
      waits.length = 0;
    },

    // Advance walks and waits. Call every frame with the frame time.
    update(dt) {
      if (!Number.isFinite(dt)) dt = 0;
      for (const [id, m] of moves) {
        const a = actor(id);
        m.elapsed += dt;
        const dx = m.target.x - a.position.x;
        const dz = m.target.z - a.position.z;
        const dist = Math.hypot(dx, dz);
        // Close in x/z but on another floor (e.g. under the sala) is not arrival: teleport there.
        const arrived = dist < ARRIVE && Math.abs(m.target.y - a.position.y) < STEP;
        if (dist < ARRIVE || m.elapsed > m.limit || m.stuck > STUCK_SECONDS) {
          if (!arrived) teleport(a, m.target);
          else a.setMotion(0, 0);
          moves.delete(id);
          m.resolve();
          continue;
        }
        const step = Math.min(dist, WALK_SPEED * dt);
        const before = a.position.clone();
        const next = world.collision.move(a.position, (dx / dist) * step, (dz / dist) * step);
        a.object.position.set(next.x, next.y, next.z);
        a.setMotion(dx, dz);
        m.stuck = a.position.distanceTo(before) < step * 0.25 ? m.stuck + dt : 0;
      }
      for (let i = waits.length - 1; i >= 0; i--) {
        waits[i].left -= dt;
        if (waits[i].left <= 0) {
          waits[i].resolve();
          waits.splice(i, 1);
        }
      }
    },
  };
}
