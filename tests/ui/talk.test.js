import { describe, it, expect } from 'vitest';
import { createTalk } from '../../src/ui/talk.js';

// A runner line as dialogue.current() gives it.
const say = (who, extra = {}) => ({ who, face: null, move: null, to: undefined, choices: null, ...extra });

describe('createTalk', () => {
  it('aims a line at the last other person who spoke', () => {
    const t = createTalk();
    expect(t.line(say('damaso')).target).toBeNull();
    expect(t.line(say('sibyla')).target).toBe('damaso');
    expect(t.line(say('sibyla')).target).toBe('damaso'); // still the last *other* speaker
    expect(t.line(say('damaso', { face: 'angry' }))).toEqual({ actor: 'damaso', feeling: 'angry', move: null, target: 'sibyla' });
  });

  it('lets a line name its target, or no one', () => {
    const t = createTalk();
    t.line(say('tiago'));
    expect(t.line(say('ibarra', { to: 'player' })).target).toBe('player');
    expect(t.line(say('ibarra', { to: null })).target).toBeNull();
    expect(t.line(say('ibarra', { to: 'ibarra' })).target).toBeNull(); // never at oneself
  });

  it('passes the feeling (neutral when none) and the move through', () => {
    const t = createTalk();
    expect(t.line(say('victorina', { move: 'fan' }))).toMatchObject({ feeling: 'neutral', move: 'fan' });
  });

  it('skips narration and choice prompts; a picked choice is the player speaking', () => {
    const t = createTalk();
    t.line(say('tiago'));
    expect(t.line(say('narrator'))).toBeNull();
    expect(t.line(say(null))).toBeNull();
    expect(t.line(say('player', { choices: [{ index: 0, segments: [] }] }))).toBeNull();
    expect(t.last).toBe('tiago');
    t.chose();
    expect(t.last).toBe('player');
    expect(t.line(say('tiago')).target).toBe('player');
  });

  it('carries the last speaker across conversations until reset', () => {
    const t = createTalk();
    t.line(say('damaso'));
    expect(t.line(say('laruja')).target).toBe('damaso'); // a new conversation, the same talk
    t.reset();
    expect(t.last).toBeNull();
    expect(t.line(say('laruja')).target).toBeNull();
  });
});
