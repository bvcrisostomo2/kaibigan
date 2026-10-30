import { describe, it, expect } from 'vitest';
import { MOVES, FEELING_MOVES, FOOT_MOVES, MOVE_SECONDS, movementFor, motionAt } from '../../src/engine/motion.js';
import { FEELINGS } from '../../src/art/characters.js';

describe('movementFor', () => {
  it('gives each feeling its movement from the spec', () => {
    expect(movementFor('angry')).toBe('shake');
    expect(movementFor('shocked')).toBe('hop_back');
    expect(movementFor('sad')).toBe('head_down');
    expect(movementFor('happy')).toBe('bounce');
    expect(movementFor('embarrassed')).toBe('turn_away');
    expect(movementFor('annoyed')).toBe('turn_away');
    expect(movementFor('thoughtful')).toBe('still');
    expect(movementFor('neutral')).toBe('nod');
    expect(movementFor('content')).toBe('nod');
    expect(Object.keys(FEELING_MOVES).sort()).toEqual([...FEELINGS].sort());
  });

  it("takes a line's own move over the feeling's", () => {
    expect(movementFor('angry', { move: 'bow' })).toBe('bow');
    expect(movementFor('angry', { move: 'none' })).toBe('none');
  });

  it('keeps seated characters in their chairs', () => {
    for (const m of FOOT_MOVES) expect(movementFor('neutral', { move: m, seated: true })).toBe('none');
    expect(movementFor('angry', { seated: true })).toBe('shake');
    expect(movementFor('sad', { seated: true })).toBe('head_down');
    expect(movementFor('neutral', { move: 'bow', seated: true })).toBe('nod');
    for (let t = 0; t <= 2; t += 0.05) expect(motionAt('head_down', t, { seated: true }).toward).toBe(0);
  });
});

describe('motionAt', () => {
  it.each(MOVES)('%s ends at rest and stays small', (m) => {
    const d = MOVE_SECONDS[m];
    expect(d).toBeGreaterThanOrEqual(0);
    expect(motionAt(m, d)).toEqual({ toward: 0, up: 0, tilt: 0, squash: 1, turn: false, done: true });
    for (let t = 0; t < d; t += 0.02) {
      const p = motionAt(m, t);
      expect(p.done).toBe(false);
      expect(Math.abs(p.toward)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(p.tilt)).toBeLessThanOrEqual(0.3);
      expect(p.up).toBeGreaterThanOrEqual(0);
    }
  });

  it('leans toward the target when angry and hops away when shocked', () => {
    const mid = (m) => motionAt(m, MOVE_SECONDS[m] * 0.4);
    expect(mid('shake').tilt).toBeGreaterThan(0);
    expect(mid('shake').toward).toBeGreaterThan(0);
    expect(motionAt('hop_back', MOVE_SECONDS.hop_back * 0.25).toward).toBeLessThan(-0.3);
    expect(mid('turn_away').turn).toBe(true);
  });

  it('is at rest before it starts and for unknown names', () => {
    expect(motionAt('nod', -1).done).toBe(true);
    expect(motionAt('dance', 0.1).done).toBe(true);
  });
});
