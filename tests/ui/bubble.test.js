import { describe, it, expect } from 'vitest';
import { placeBubble, BUBBLE_MARGIN, BUBBLE_GAP, TAIL_INSET } from '../../src/ui/bubble.js';

const screen = { w: 800, h: 375 };
const size = { w: 240, h: 90 };
const at = (x, y, foot = y + 60) => ({ head: { x, y }, foot: { x, y: foot }, behind: false });

describe('placeBubble', () => {
  it('puts the bubble above the speaker with its tail at them', () => {
    const p = placeBubble({ anchor: at(400, 200), size, screen });
    expect(p.mode).toBe('above');
    expect(p.y + size.h).toBe(200 - BUBBLE_GAP);
    expect(p.x).toBe(400 - size.w / 2);
    expect(p.tail).toEqual({ side: 'bottom', at: size.w / 2 });
  });

  it('flips below when above would leave the top, clear of the face', () => {
    const p = placeBubble({ anchor: at(400, 40), size, screen });
    expect(p.mode).toBe('below');
    expect(p.y).toBe(40 + 60 + BUBBLE_GAP);
    expect(p.tail.side).toBe('top');
  });

  it('flips below for a speaker whose head is above the screen but whose feet are on it', () => {
    expect(placeBubble({ anchor: at(400, -20, 50), size, screen }).mode).toBe('below');
  });

  it('holds the bubble inside the screen at the sides, the tail still at the speaker', () => {
    const left = placeBubble({ anchor: at(10, 200), size, screen });
    expect(left.x).toBe(BUBBLE_MARGIN);
    expect(left.tail.at).toBe(TAIL_INSET);
    const right = placeBubble({ anchor: at(700, 200), size, screen });
    expect(right.x + size.w).toBe(screen.w - BUBBLE_MARGIN);
    expect(right.x + right.tail.at).toBe(700);
  });

  it('keeps a bubble below on screen at the bottom', () => {
    const p = placeBubble({ anchor: at(400, 30, 340), size, screen });
    expect(p.y + size.h).toBeLessThanOrEqual(screen.h - BUBBLE_MARGIN);
  });

  it('pins to the nearest edge for a speaker off-screen, tail toward them', () => {
    const right = placeBubble({ anchor: at(1000, 200), size, screen });
    expect(right.mode).toBe('edge');
    expect(right.x + size.w).toBe(screen.w - BUBBLE_MARGIN);
    expect(right.tail.side).toBe('right');
    const left = placeBubble({ anchor: at(-300, 100), size, screen });
    expect(left).toMatchObject({ mode: 'edge', x: BUBBLE_MARGIN, tail: { side: 'left' } });
    const below = placeBubble({ anchor: at(300, 600, 700), size, screen });
    expect(below.tail.side).toBe('bottom');
    expect(below.y + size.h).toBe(screen.h - BUBBLE_MARGIN);
  });

  it('treats a speaker behind the camera as off the bottom, mirrored', () => {
    const p = placeBubble({ anchor: { ...at(100, 200), behind: true }, size, screen });
    expect(p.mode).toBe('edge');
    expect(p.tail.side).toBe('bottom');
    expect(p.x + p.tail.at).toBeCloseTo(700, 0);
  });

  it('gives no placement without an anchor', () => {
    expect(placeBubble({ anchor: null, size, screen })).toBeNull();
  });

  it('places on whole pixels', () => {
    const p = placeBubble({ anchor: at(400.4, 200.6), size, screen });
    expect(Number.isInteger(p.x) && Number.isInteger(p.y) && Number.isInteger(p.tail.at)).toBe(true);
  });
});
