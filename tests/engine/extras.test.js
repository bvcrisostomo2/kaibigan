import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createExtras, STROLL } from '../../src/engine/extras.js';
import { createCollision } from '../../src/engine/collision.js';

function fakeActor({ id, position, dir }) {
  return {
    id,
    object: { position },
    get position() { return this.object.position; },
    dir,
    seated: false,
    activity: null,
    moves: [],
    face(d) { this.dir = d; },
    sit(d) { this.seated = true; this.dir = d; },
    act(name) { this.activity = name; },
    setMotion(dx, dz) { this.moves.push([dx, dz]); },
  };
}

function setup(list, blockers = []) {
  const spots = {
    stall: new THREE.Vector3(2, 0, 2),
    bench: new THREE.Vector3(4, 0, 2),
    walk_w: new THREE.Vector3(0, 0, 5),
    walk_e: new THREE.Vector3(6, 0, 5),
  };
  const collision = createCollision({ floors: [{ x: -10, z: -10, w: 30, d: 30, y: 0 }], blockers });
  return { spots, extras: createExtras(list, { spots, collision, spawn: fakeActor }) };
}

const run = (extras, seconds, dt = 1 / 30) => {
  for (let t = 0; t < seconds; t += dt) extras.update(dt);
};

describe('createExtras', () => {
  it('places each extra at its spot, facing, seated or at work', () => {
    const { extras } = setup([
      { id: 'vendor', costume: 'vendor', spot: 'stall', dir: 'left', activity: 'fan' },
      { id: 'lady', costume: 'lady_a', spot: 'bench', pose: 'sit' },
    ]);
    const vendor = extras.actors.get('vendor');
    expect(vendor.position.toArray()).toEqual([2, 0, 2]);
    expect(vendor.dir).toBe('left');
    expect(vendor.activity).toBe('fan');
    expect(extras.actors.get('lady').seated).toBe(true);
  });

  it('walks a loop at a stroll, pausing at each end to do its activity, and back again', () => {
    const { extras, spots } = setup([{ id: 'foreigners', costume: 'foreigner', loop: ['walk_w', 'walk_e'], pause: 1, activity: 'chat' }]);
    const a = extras.actors.get('foreigners');
    expect(a.position.toArray()).toEqual([0, 0, 5]);
    run(extras, 1.05); // the first pause
    expect(a.activity).toBe(null);
    run(extras, 6 / STROLL + 0.2);
    expect(a.position.distanceTo(spots.walk_e)).toBeLessThan(0.11);
    expect(a.activity).toBe('chat');
    run(extras, 1.05 + 6 / STROLL + 0.2);
    expect(a.position.distanceTo(spots.walk_w)).toBeLessThan(0.11);
  });

  it('teleports a walker that is stuck behind something to its next spot', () => {
    const wall = { x: 2.8, z: 0, w: 0.4, d: 10, y0: 0, y1: 3 };
    const { extras, spots } = setup([{ id: 'boy', costume: 'muchacho', loop: ['walk_w', 'walk_e'], pause: 2 }], [wall]);
    run(extras, 6); // pause 2 s, walk 2.1 s to the wall, stuck 1 s, teleported; now pausing there
    expect(extras.actors.get('boy').position.distanceTo(spots.walk_e)).toBeLessThan(0.11);
  });

  it('reports a missing spot by name', () => {
    expect(() => setup([{ id: 'ghost', costume: 'servant', spot: 'nowhere' }])).toThrow("Extra 'ghost': spot 'nowhere' not found");
    expect(() => setup([{ id: 'ghost', costume: 'servant', loop: ['walk_w', 'nowhere'] }])).toThrow("Extra 'ghost': loop spot 'nowhere' not found");
  });

  it('ignores bad frame times', () => {
    const { extras } = setup([{ id: 'boy', costume: 'muchacho', loop: ['walk_w', 'walk_e'], pause: 0 }]);
    expect(() => { extras.update(NaN); extras.update(Infinity); extras.update(-1); }).not.toThrow();
    expect(extras.actors.get('boy').position.toArray()).toEqual([0, 0, 5]);
  });
});
