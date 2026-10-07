import { describe, it, expect, afterEach } from 'vitest';
import * as THREE from 'three';
import {
  dirFromVector, sheetDir, animCandidates, pickAnim, cellUV, animFrame, turnToward, createActor,
  DIRECTIONS, WALK_FPS, IDLE_SECONDS, TURN_SECONDS, ACT_FPS,
} from '../../src/engine/actors.js';
import { registerSheet, clearRegisteredSheets } from '../../src/art/threeTextures.js';

afterEach(() => clearRegisteredSheets());

describe('facing', () => {
  it('maps movement to 8 screen directions (+z is down)', () => {
    expect(dirFromVector(1, 0)).toBe('right');
    expect(dirFromVector(0, 1)).toBe('down');
    expect(dirFromVector(-1, -1)).toBe('up_left');
    expect(dirFromVector(1, 1)).toBe('down_right');
    expect(dirFromVector(0, 0, 'up')).toBe('up');
  });

  it('diagonals fall back to the side views', () => {
    expect(sheetDir('down_left')).toBe('left');
    expect(sheetDir('up_right')).toBe('right');
    expect(sheetDir('up')).toBe('up');
  });

  it('turns 45° at a time, the short way round', () => {
    expect(turnToward('down', 'right')).toBe('down_right');
    expect(turnToward('down', 'left')).toBe('down_left');
    expect(turnToward('up_left', 'down_right')).toMatch(/^(up|left)$/);
    expect(turnToward('right', 'right')).toBe('right');
    expect(() => turnToward('north', 'up')).toThrow("Bad direction 'north'");
  });
});

describe('animation choice', () => {
  it('prefers the back view for up-diagonals, the side view for down-diagonals', () => {
    expect(animCandidates({ mode: 'walk', dir: 'up_left' })).toEqual(['walk_up_left', 'run_up_left', 'walk_up', 'walk_left', 'walk_down']);
    expect(animCandidates({ mode: 'idle', dir: 'down_right' })).toEqual(['idle_down_right', 'idle_right', 'idle_down']);
    expect(animCandidates({ mode: 'run', dir: 'right' })).toEqual(['run_right', 'walk_right', 'run_right', 'walk_right', 'walk_down']);
  });

  it('expressions and gestures fall back to standing', () => {
    expect(animCandidates({ mode: 'walk', dir: 'up', expression: 'smile' })).toEqual(['expression_smile', 'idle_down']);
    expect(animCandidates({ mode: 'idle', dir: 'up', gesture: 'bow' })).toEqual(['gesture_bow', 'idle_down']);
  });

  it('seated actors keep their seat through expressions, falling back to standing idle without seated art', () => {
    expect(animCandidates({ mode: 'sit', dir: 'down', expression: 'angry' })).toEqual(['sit_down', 'sit_down', 'idle_down', 'idle_down', 'idle_down']);
    expect(animCandidates({ mode: 'sit', dir: 'up_left' })).toEqual(['sit_up_left', 'sit_up', 'sit_left', 'idle_up_left', 'idle_up', 'idle_left', 'idle_down']);
    expect(animFrame('sit', 99)).toBe(0);
  });

  it('plays an activity while standing, front or side; facing away or without the art it stands idle', () => {
    expect(animCandidates({ mode: 'idle', dir: 'left', activity: 'sweep' })).toEqual(['act_sweep_left', 'act_sweep_left', 'act_sweep_down', 'idle_left', 'idle_left', 'idle_down']);
    expect(animCandidates({ mode: 'idle', dir: 'up', activity: 'stir' })).toEqual(['act_stir_up', 'act_stir_up', 'idle_up', 'idle_up', 'idle_down']);
    expect(animCandidates({ mode: 'walk', dir: 'down', activity: 'sweep' })[0]).toBe('walk_down'); // walking, no activity
    expect(animCandidates({ mode: 'sit', dir: 'down', activity: 'fan' })[0]).toBe('sit_down'); // seated wins
    expect(animFrame('act', 1)).toBe(ACT_FPS);
  });

  it('a sheet with only walk_down and idle_down still animates every state', () => {
    const anims = { walk_down: [{ col: 0, row: 0 }], idle_down: [{ col: 0, row: 1 }] };
    for (const dir of DIRECTIONS) {
      for (const mode of ['idle', 'walk', 'run']) expect(pickAnim(anims, animCandidates({ mode, dir })).length).toBeGreaterThan(0);
    }
    expect(pickAnim(anims, animCandidates({ mode: 'idle', dir: 'up', expression: 'angry' }))).toBe(anims.idle_down);
  });

  it('pickAnim reports what it looked for', () => {
    expect(() => pickAnim({}, ['walk_up', 'walk_down'])).toThrow('No animation among walk_up, walk_down');
  });

  it('cellUV addresses a cell from the top-left of the sheet', () => {
    expect(cellUV({ col: 1, row: 0 }, 4, 2)).toEqual({ offsetX: 0.25, offsetY: 0.5, repeatX: 0.25, repeatY: 0.5 });
  });

  it('animFrame advances at the walk rate and idles slowly', () => {
    expect(animFrame('walk', 1)).toBe(WALK_FPS);
    expect(animFrame('idle', IDLE_SECONDS * 3)).toBe(3);
  });
});

describe('createActor', () => {
  const camera = { position: new THREE.Vector3(0, 10, 10) };
  const sheet = () => ({
    texture: new THREE.Texture(), cellW: 48, cellH: 64, cols: 4, rows: 4, footMargin: 2,
    anims: {
      idle_down: [{ col: 0, row: 0 }], walk_down: [{ col: 0, row: 1 }, { col: 1, row: 1 }],
      walk_right: [{ col: 0, row: 2 }], idle_right: [{ col: 1, row: 2 }], walk_up: [{ col: 0, row: 3 }],
    },
  });

  it('walks, runs and idles from its motion', () => {
    registerSheet('test', sheet());
    const a = createActor({ id: 'a', costume: 'test' });
    a.setMotion(1, 0);
    expect(a.mode).toBe('walk');
    expect(a.dir).toBe('right');
    a.setMotion(0, -1, true);
    expect(a.mode).toBe('run');
    expect(a.dir).toBe('up');
    a.setMotion(0, 0);
    expect(a.mode).toBe('idle');
    expect(a.dir).toBe('up');
  });

  it('shows the chosen cell on its texture', () => {
    registerSheet('test', sheet());
    const a = createActor({ id: 'a', costume: 'test' });
    a.setMotion(1, 0);
    a.update(0, camera);
    const tex = a.sprite.material.map;
    expect(tex.offset.x).toBe(0);
    expect(tex.offset.y).toBeCloseTo(0.25); // row 2 of 4, counted from the top
  });

  it('turns through every in-between facing when turnSeconds is set', () => {
    registerSheet('test', sheet());
    const a = createActor({ id: 'a', costume: 'test', dir: 'down', turnSeconds: TURN_SECONDS });
    a.face('up');
    expect(a.facing).toBe('up');
    expect(a.dir).toBe('down');
    const seen = [];
    for (let i = 0; i < 4; i++) {
      a.update(TURN_SECONDS, camera);
      seen.push(a.dir);
    }
    expect(seen).toHaveLength(4);
    expect(seen.at(-1)).toBe('up');
    expect(new Set(seen).size).toBe(4); // one 45° step per update
  });

  it('survives bad frame times (NaN, Infinity)', () => {
    registerSheet('test', sheet());
    const a = createActor({ id: 'a', costume: 'test' });
    a.setMotion(0, 1);
    expect(() => a.update(NaN, camera)).not.toThrow();
    expect(() => a.update(Infinity, camera)).not.toThrow();
    expect(() => a.update(1 / 60, camera)).not.toThrow();
  });

  it('sits facing a direction, stays seated while still, and stands to walk', () => {
    registerSheet('test', { ...sheet(), anims: { ...sheet().anims, sit_left: [{ col: 3, row: 3 }] } });
    const a = createActor({ id: 'a', costume: 'test', turnSeconds: TURN_SECONDS });
    a.sit('left');
    expect(a.seated).toBe(true);
    expect(a.dir).toBe('left'); // snaps round, no turning
    a.setMotion(0, 0);
    a.emote('angry');
    a.update(1, camera);
    expect(a.seated).toBe(true);
    expect(a.sprite.material.map.offset.x).toBe(0.75); // the sit_left cell
    a.setMotion(1, 0);
    expect(a.seated).toBe(false);
    expect(a.mode).toBe('walk');
    a.sit('down');
    a.stand();
    expect(a.mode).toBe('idle');
    expect(() => a.sit('north')).toThrow("Bad direction 'north'");
  });

  it('loops an activity until it moves or is told to stop', () => {
    registerSheet('test', { ...sheet(), anims: { ...sheet().anims, act_sweep_down: [{ col: 2, row: 0 }, { col: 3, row: 0 }] } });
    const a = createActor({ id: 'a', costume: 'test' });
    a.act('sweep');
    expect(a.activity).toBe('sweep');
    a.update(0, camera);
    expect([0.5, 0.75]).toContain(a.sprite.material.map.offset.x); // one of the two sweep cells
    a.setMotion(0, 0);
    expect(a.activity).toBe('sweep'); // standing still keeps it
    a.setMotion(1, 0);
    expect(a.activity).toBe(null); // walking stops it
    a.act('sweep');
    a.act(null);
    expect(a.activity).toBe(null);
  });

  it('emotes and rejects unknown emotes and directions', () => {
    registerSheet('test', sheet());
    const a = createActor({ id: 'a', costume: 'test' });
    a.emote('smile');
    a.emote(null);
    expect(() => a.emote('wink')).toThrow("Unknown expression or gesture 'wink'");
    expect(() => a.face('north')).toThrow("Bad direction 'north'");
  });

  it('billboards toward the camera around Y only', () => {
    registerSheet('test', sheet());
    const a = createActor({ id: 'a', costume: 'test' });
    a.update(0, { position: new THREE.Vector3(5, 3, 0) });
    expect(a.sprite.rotation.y).toBeCloseTo(Math.PI / 2);
  });

  it('builds real sheets for shipped costumes', () => {
    const a = createActor({ id: 'd', costume: 'damaso', position: new THREE.Vector3(1, 2, 3) });
    expect(a.position.toArray()).toEqual([1, 2, 3]);
    expect(a.object.userData.actorId).toBe('d');
  });
});
