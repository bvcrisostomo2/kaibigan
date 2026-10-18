import { describe, it, expect } from 'vitest';
import { ramp } from '../../tools/ramp.mjs';

describe('ramp', () => {
  it('maps source shades, lightest first, across the target ramp', () => {
    expect(ramp(['#000000', '#ffffff', '#808080'], ['#eeeeee', '#777777', '#111111'])).toEqual({ '#ffffff': '#eeeeee', '#808080': '#777777', '#000000': '#111111' });
  });

  it('spreads more sources than targets evenly, ends to ends', () => {
    const m = ramp(['#ffffff', '#cccccc', '#999999', '#666666', '#333333'], ['#aaaaaa', '#222222']);
    expect(m['#ffffff']).toBe('#aaaaaa');
    expect(m['#333333']).toBe('#222222');
    expect(m['#cccccc']).toBe('#aaaaaa');
    expect(m['#666666']).toBe('#222222');
  });

  it('maps a single source to the middle of the ramp', () => {
    expect(ramp(['#123456'], ['#aaaaaa', '#888888', '#444444'])).toEqual({ '#123456': '#888888' });
  });

  it('lower-cases keys so they match the build', () => {
    expect(Object.keys(ramp(['#ABCDEF'], ['#111111']))).toEqual(['#abcdef']);
  });
});
