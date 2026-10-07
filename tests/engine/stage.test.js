import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import { createStage, STAGE_ACTIONS } from '../../src/engine/stage.js';
import { createCollision } from '../../src/engine/collision.js';
import { createFader } from '../../src/engine/fader.js';

function fakeActor(x = 0, z = 0) {
  return {
    object: { position: new THREE.Vector3(x, 0, z), visible: true },
    get position() { return this.object.position; },
    dir: 'down',
    setMotion: vi.fn(),
    face: vi.fn(),
    emote: vi.fn(),
    seated: false,
    sit: vi.fn(function (dir) { this.seated = true; this.dir = dir; }),
    stand: vi.fn(function () { this.seated = false; }),
  };
}

function setup({ blockers = [] } = {}) {
  const world = {
    spots: { door: new THREE.Vector3(5, 0, 0), far: new THREE.Vector3(0, 0, 8) },
    collision: createCollision({ floors: [{ x: -20, z: -20, w: 40, d: 40, y: 0 }], blockers }),
  };
  const actors = new Map([['ibarra', fakeActor()], ['tiago', fakeActor(3, 3)]]);
  const camera = { follow: vi.fn(), setDistance: vi.fn() };
  const lighting = { setTime: vi.fn(() => Promise.resolve()) };
  const audio = { setLayer: vi.fn() };
  const fader = { fadeOut: vi.fn(() => Promise.resolve()), fadeIn: vi.fn(() => Promise.resolve()) };
  const stage = createStage({ world, actors, camera, lighting, audio, fader });
  return { stage, world, actors, camera, lighting, audio, fader };
}

const run = (stage, seconds, dt = 1 / 30) => {
  for (let t = 0; t < seconds; t += dt) stage.update(dt);
};

describe('createStage', () => {
  it('claims only engine actions', () => {
    const { stage } = setup();
    for (const a of STAGE_ACTIONS) expect(stage.handles(a)).toBe(true);
    expect(stage.handles('dialogue')).toBe(false);
    expect(stage.handles('titleCard')).toBe(false);
  });

  it('walks an actor to a spot and resolves on arrival', async () => {
    const { stage, actors } = setup();
    let arrived = false;
    stage.run(['moveTo', 'ibarra', 'door']).then(() => (arrived = true));
    expect(stage.busy).toBe(true);
    run(stage, 4);
    await Promise.resolve();
    expect(arrived).toBe(true);
    expect(actors.get('ibarra').position.x).toBeCloseTo(5, 0);
    expect(actors.get('ibarra').setMotion).toHaveBeenCalled();
    expect(stage.busy).toBe(false);
  });

  it('teleports an actor that is stuck behind a wall (no dead ends)', async () => {
    const { stage, actors } = setup({ blockers: [{ x: 2, z: -10, w: 0.5, d: 20, y0: 0, y1: 3 }] });
    let arrived = false;
    stage.run(['moveTo', 'ibarra', 'door']).then(() => (arrived = true));
    run(stage, 6);
    await Promise.resolve();
    expect(arrived).toBe(true);
    expect(actors.get('ibarra').position.toArray()).toEqual([5, 0, 0]);
  });

  it('faces a direction, a spot or another actor', async () => {
    const { stage, actors } = setup();
    await stage.run(['face', 'ibarra', 'down_left']);
    expect(actors.get('ibarra').face).toHaveBeenLastCalledWith('down_left');
    await stage.run(['face', 'ibarra', 'tiago']);
    expect(actors.get('ibarra').face).toHaveBeenLastCalledWith('down_right');
    await stage.run(['face', 'ibarra', 'far']);
    expect(actors.get('ibarra').face).toHaveBeenLastCalledWith('down');
  });

  it('teleports, shows and hides, and emotes', async () => {
    const { stage, actors } = setup();
    await stage.run(['teleport', 'tiago', 'door']);
    expect(actors.get('tiago').position.toArray()).toEqual([5, 0, 0]);
    await stage.run(['hide', 'tiago']);
    expect(actors.get('tiago').object.visible).toBe(false);
    await stage.run(['show', 'tiago']);
    expect(actors.get('tiago').object.visible).toBe(true);
    await stage.run(['emote', 'tiago', 'smile']);
    expect(actors.get('tiago').emote).toHaveBeenCalledWith('smile');
  });

  it('drives the camera, lighting, audio and fader', async () => {
    const { stage, camera, lighting, audio, fader, actors } = setup();
    await stage.run(['camera', 'follow', 'tiago']);
    expect(camera.follow).toHaveBeenCalledWith(actors.get('tiago').object);
    await stage.run(['camera', 'focus', 'door']);
    expect(camera.follow.mock.calls.at(-1)[0].toArray()).toEqual([5, 0, 0]);
    await stage.run(['camera', 'zoom', 12]);
    expect(camera.setDistance).toHaveBeenCalledWith(12);
    await stage.run(['setTime', 'night', 3]);
    expect(lighting.setTime).toHaveBeenCalledWith('night', 3);
    await stage.run(['sound', 'music', 0.5]);
    expect(audio.setLayer).toHaveBeenCalledWith('music', 0.5);
    await stage.run(['fadeOut', 0.5]);
    await stage.run(['fadeIn']);
    expect(fader.fadeOut).toHaveBeenCalledWith(0.5);
    expect(fader.fadeIn).toHaveBeenCalled();
  });

  it('seats an actor on a spot, and stands it up clear of the chair', async () => {
    const chair = { x: 4.75, z: -0.25, w: 0.5, d: 0.5, y0: 0, y1: 2 };
    const { stage, actors } = setup({ blockers: [chair] });
    const ibarra = actors.get('ibarra');
    stage.run(['moveTo', 'ibarra', 'far']);
    await stage.run(['sit', 'ibarra', 'door', 'down']);
    expect(stage.busy).toBe(false); // the pending walk is dropped
    expect(ibarra.position.toArray()).toEqual([5, 0, 0]);
    expect(ibarra.sit).toHaveBeenCalledWith('down');
    await stage.run(['stand', 'ibarra']);
    expect(ibarra.stand).toHaveBeenCalled();
    expect(ibarra.position.z).toBeLessThan(-0.4); // stepped back, away from the table side it faced
    expect(Math.abs(ibarra.position.x - 5)).toBeLessThan(0.01);
    await stage.run(['stand', 'tiago']); // not seated: nothing moves
    expect(actors.get('tiago').position.toArray()).toEqual([3, 0, 3]);
  });

  it('plays a one-shot sound effect', async () => {
    const { stage, audio } = setup();
    audio.play = vi.fn();
    await stage.run(['sfx', 'plate']);
    await stage.run(['sfx', 'glasses', 0.5]);
    expect(audio.play.mock.calls).toEqual([['plate', 1], ['glasses', 0.5]]);
  });

  it('waits for the given seconds', async () => {
    const { stage } = setup();
    let done = false;
    stage.run(['wait', 1]).then(() => (done = true));
    run(stage, 0.5);
    await Promise.resolve();
    expect(done).toBe(false);
    run(stage, 0.6);
    await Promise.resolve();
    expect(done).toBe(true);
  });

  it('reports bad actions clearly', async () => {
    const { stage } = setup();
    expect(() => stage.run(['face', 'nobody', 'up'])).toThrow("Unknown actor 'nobody'");
    expect(() => stage.run(['moveTo', 'ibarra', 'nowhere'])).toThrow("Unknown spot or actor 'nowhere'");
    await expect(stage.run(['camera', 'spin'])).rejects.toThrow("Unknown camera mode 'spin'");
    await expect(stage.run(['dance'])).rejects.toThrow("Stage cannot run 'dance'");
  });
});

describe('createFader', () => {
  it('fades a full-screen overlay and resolves after the duration', async () => {
    vi.useFakeTimers();
    const el = { style: {} };
    const doc = { createElement: () => el };
    const container = { appendChild: vi.fn() };
    const fader = createFader(container, doc);
    expect(container.appendChild).toHaveBeenCalledWith(el);
    let done = false;
    fader.fadeOut(1).then(() => (done = true));
    expect(el.style.opacity).toBe('1');
    expect(el.style.transition).toBe('opacity 1s linear');
    await vi.advanceTimersByTimeAsync(1000);
    expect(done).toBe(true);
    fader.fadeIn(0.5);
    expect(el.style.opacity).toBe('0');
    vi.useRealTimers();
  });
});

describe('createStage edge cases', () => {
  it('does not count a walk as arrived on the floor below the spot', async () => {
    const world = {
      spots: { sala: new THREE.Vector3(1, 3, 1) },
      collision: createCollision({ floors: [{ x: -5, z: -5, w: 10, d: 10, y: 0 }, { x: -5, z: -5, w: 10, d: 10, y: 3 }] }),
    };
    const actors = new Map([['tiago', fakeActor(0, 0)]]);
    const stage = createStage({ world, actors, camera: {}, lighting: {}, audio: {}, fader: {} });
    let arrived = false;
    stage.run(['moveTo', 'tiago', 'sala']).then(() => (arrived = true));
    run(stage, 4);
    await Promise.resolve();
    expect(arrived).toBe(true);
    expect(actors.get('tiago').position.toArray()).toEqual([1, 3, 1]);
  });

  it('ignores bad frame times (NaN, Infinity) in walks and waits', async () => {
    const { stage, actors } = setup();
    let waited = false;
    let arrived = false;
    stage.run(['wait', 0.5]).then(() => (waited = true));
    stage.run(['moveTo', 'ibarra', 'door']).then(() => (arrived = true));
    stage.update(NaN);
    stage.update(Infinity);
    expect(stage.busy).toBe(true);
    run(stage, 4);
    await Promise.resolve();
    expect(waited).toBe(true);
    expect(arrived).toBe(true);
    expect(actors.get('ibarra').position.x).toBeCloseTo(5, 0);
  });
});

describe('stage.cancel', () => {
  it('drops pending walks and waits without finishing them (quitting to the title)', async () => {
    const { stage, actors } = setup();
    let settled = false;
    stage.run(['moveTo', 'ibarra', 'door']).then(() => (settled = true));
    stage.run(['wait', 0.5]).then(() => (settled = true));
    stage.cancel();
    expect(stage.busy).toBe(false);
    run(stage, 2);
    await Promise.resolve();
    expect(settled).toBe(false);
    expect(actors.get('ibarra').position.x).toBe(0);
  });
});
