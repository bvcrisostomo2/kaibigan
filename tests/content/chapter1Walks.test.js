import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { chapter1, chapter1Content } from '../../src/content/chapter1/index.js';
import { buildWorld } from '../../src/engine/world.js';
import { createStage } from '../../src/engine/stage.js';
import { createExtras, STROLL } from '../../src/engine/extras.js';
import { WALK_SPEED } from '../../src/engine/actors.js';

const { level, cast } = chapter1Content;
const world = buildWorld(level);
const DT = 1 / 30;
const JUMP = Math.max(WALK_SPEED, STROLL) * DT * 1.6; // a bigger step in one frame is a teleport

function fakeActor(position) {
  return {
    object: { position: position.clone(), visible: true },
    get position() { return this.object.position; },
    seated: false,
    dir: 'down',
    setMotion() {},
    face() {},
    emote() {},
    act() {},
    sit(d) { this.seated = true; this.dir = d; },
    stand() { this.seated = false; },
  };
}

// Plays a chapter's staged actions (moves, teleports, seating) in order through the real stage over
// the real world. Returns the first frame where anyone jumped (a stuck walker being teleported),
// and every point each actor stood at or walked between, for the extras to keep clear of.
function playStagedActions() {
  const actors = new Map([['player', fakeActor(world.spawn)]]);
  for (const c of cast) actors.set(c.id, fakeActor(c.homeSpot ? world.spots[c.homeSpot] : world.spawn));
  const camera = { follow() {}, setDistance() {} };
  const lighting = { setTime: () => Promise.resolve() };
  const audio = { setLayer() {}, play() {} };
  const fader = { fadeOut: () => Promise.resolve(), fadeIn: () => Promise.resolve() };
  const stage = createStage({ world, actors, camera, lighting, audio, fader });
  const jumps = [];
  // actor → polylines: each is a stand (one point) or a walk (moveTo legs); a teleport, a seat or a
  // stand-up starts a new one, since those are jumps, not walks.
  const routes = new Map();
  const note = (id, walking) => {
    const p = actors.get(id).position;
    const lines = routes.get(id) ?? [];
    if (walking && lines.length) lines.at(-1).push([p.x, p.z]);
    else lines.push([[p.x, p.z]]);
    routes.set(id, lines);
  };
  for (const id of actors.keys()) note(id, false);

  const expand = (actions) => actions.flatMap((a) => (a[0] === 'cutscene' ? expand(chapter1.cutscenes[a[1]]) : a[0] === 'branch' ? [] : [a]));
  return (async () => {
    for (const beat of chapter1.beats) {
      for (const action of expand(beat.actions ?? [])) {
        if (!stage.handles(action[0])) continue;
        let done = false;
        const run = stage.run(action);
        run.then(() => (done = true));
        for (let t = 0; !done && t < 60; t += DT) {
          const before = new Map([...actors].map(([id, a]) => [id, a.position.clone()]));
          stage.update(DT);
          for (const [id, a] of actors) {
            if (a.position.distanceTo(before.get(id)) > JUMP) jumps.push(`${beat.id} ${JSON.stringify(action)}: ${id} jumped to ${a.position.x.toFixed(1)},${a.position.z.toFixed(1)}`);
          }
          await Promise.resolve();
        }
        expect(done, `${beat.id} ${JSON.stringify(action)}`).toBe(true);
        if (actors.has(action[1])) note(action[1], action[0] === 'moveTo');
      }
    }
    return { jumps, routes };
  })();
}

// Distance from point p to segment a–b.
function distanceToSegment(p, a, b) {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const len2 = dx * dx + dz * dz;
  const t = len2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / len2)) : 0;
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dz));
}

describe('Chapter 1 walks', () => {
  it("sends every story walk round the furniture: nobody is stuck and teleported on screen", async () => {
    const { jumps } = await playStagedActions();
    expect(jumps).toEqual([]);
  });

  it('lets every extra walk its loop round the furniture, minute after minute, without being teleported', () => {
    const actors = [];
    const extras = createExtras(world.extras, {
      spots: world.spots,
      collision: world.collision,
      spawn: ({ position }) => {
        const a = fakeActor(position);
        actors.push(a);
        return a;
      },
    });
    const jumps = [];
    for (let t = 0; t < 120; t += DT) {
      const before = actors.map((a) => a.position.clone());
      extras.update(DT);
      actors.forEach((a, i) => {
        if (a.position.distanceTo(before[i]) > JUMP) jumps.push(`${[...extras.actors].find(([, x]) => x === a)[0]} at ${t.toFixed(0)}s`);
      });
    }
    expect(jumps).toEqual([]);
  });

  it("keeps extras off the story's spots and the walks it sends people on", async () => {
    const { routes } = await playStagedActions();
    const standing = new Set(world.extras.flatMap((e) => (e.loop ? [] : [e.spot])));
    const clear = 0.7;
    const bad = [];
    for (const e of world.extras) {
      // the places an extra stands, or the segments it walks
      const own = e.loop ? e.loop.map((s) => world.spots[s]) : [world.spots[e.spot]];
      const legs = e.loop ? e.loop.map((s, i) => [world.spots[s], world.spots[e.loop[(i + 1) % e.loop.length]]]) : [[own[0], own[0]]];
      for (const [id, lines] of routes) for (const route of lines) {
        if (id === 'player' || world.mapAt(world.spots[e.loop?.[0] ?? e.spot]) !== world.mapAt(new THREE.Vector3(route[0][0], 0, route[0][1]))) continue;
        for (let i = 0; i < route.length; i++) {
          const a = route[i];
          const b = route[i + 1] ?? route[i];
          for (const [p, q] of legs) {
            // distance between two segments: the smallest of the four endpoint-to-segment distances
            const d = Math.min(
              distanceToSegment([p.x, p.z], a, b), distanceToSegment([q.x, q.z], a, b),
              distanceToSegment(a, [p.x, p.z], [q.x, q.z]), distanceToSegment(b, [p.x, p.z], [q.x, q.z]),
            );
            if (d < clear) bad.push(`${e.id} is ${d.toFixed(2)} from ${id}'s walk at ${a.map((v) => v.toFixed(1))}`);
          }
        }
      }
    }
    expect([...new Set(bad)]).toEqual([]);
    expect(standing.size).toBeGreaterThan(5);
  });
});
