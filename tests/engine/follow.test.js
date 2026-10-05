import { describe, it, expect } from 'vitest';
import { createFollower, followStep, startFollowing, FOLLOW } from '../../src/engine/follow.js';

describe('followStep', () => {
  it('stands still while the leader is close', () => {
    const f = createFollower();
    startFollowing(f, { x: 1, z: 0 });
    expect(followStep(f, { x: 0, z: 0 }, { x: 1, z: 0 })).toEqual({ x: 0, z: 0, run: false });
  });

  it('walks toward the oldest footstep, then runs when far behind', () => {
    const f = createFollower();
    startFollowing(f, { x: 0, z: 0 });
    // Leader walks right then turns down; follower starts at the origin.
    for (let x = 0.3; x <= 2.1; x += 0.3) followStep(f, { x: 0, z: 0 }, { x, z: 0 });
    let m = followStep(f, { x: 0, z: 0 }, { x: 2.1, z: 0.9 });
    expect(m.x).toBeCloseTo(1);
    expect(m.run).toBe(false);
    m = followStep(f, { x: 0, z: 0 }, { x: 2.1, z: 4 });
    expect(m.run).toBe(true);
  });

  it('keeps following until within the gap (hysteresis)', () => {
    const f = createFollower();
    startFollowing(f, { x: 0, z: 0 });
    expect(followStep(f, { x: 0, z: 0 }, { x: 2, z: 0 }).x).toBeGreaterThan(0);
    // 1.5 away: would not set off, but keeps going once moving.
    expect(followStep(f, { x: 0.5, z: 0 }, { x: 2, z: 0 }).x).toBeGreaterThan(0);
    expect(followStep(f, { x: 2 - FOLLOW.gap, z: 0 }, { x: 2, z: 0 })).toEqual({ x: 0, z: 0, run: false });
  });

  it('follows the path around a corner instead of cutting across', () => {
    const f = createFollower();
    startFollowing(f, { x: 0, z: 0 });
    // Leader goes east 3 then south 3; the follower, still at the start, heads east first.
    const path = [[0.5, 0], [1, 0], [1.5, 0], [2, 0], [2.5, 0], [3, 0], [3, 0.5], [3, 1], [3, 1.5], [3, 2], [3, 2.5], [3, 3]];
    for (const [x, z] of path) followStep(f, { x: 0, z: 0 }, { x, z });
    const m = followStep(f, { x: 0, z: 0 }, { x: 3, z: 3 });
    expect(m.x).toBeCloseTo(1);
    expect(m.z).toBeCloseTo(0);
  });

  it('bounds the remembered trail', () => {
    const f = createFollower();
    startFollowing(f, { x: 0, z: 0 });
    for (let i = 1; i <= FOLLOW.maxTrail + 50; i++) followStep(f, { x: 0, z: 0 }, { x: i * FOLLOW.crumb, z: 0 });
    expect(f.trail.length).toBeLessThanOrEqual(FOLLOW.maxTrail);
  });
});
