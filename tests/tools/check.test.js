import { describe, it, expect } from 'vitest';
import { changedPixels, colourOnlyCheck, missingActivities, MIN_CHANGED, MIN_BODY } from '../../tools/check.mjs';
import { blankFrame } from './fixtures.js';

function withChanges(n) {
  const img = blankFrame();
  for (let k = 0; k < n; k++) img.px.set([255, 0, 0, 255], k * 4); // the top rows, left to right
  return img;
}
const frames = (img) => ['front', 'right', 'back'].map((v) => ({ anim: `idle_${v}`, img }));

describe('changedPixels', () => {
  it('counts colour changes and pixels that appear or vanish, not transparent ones', () => {
    const a = blankFrame(), b = blankFrame();
    b.px.set([1, 2, 3, 255], 0); // appears
    b.px.set([9, 9, 9, 255], (45 * 50 + 25) * 4); // recoloured body pixel
    b.px.set([7, 7, 7, 0], 4); // transparent either way
    expect(changedPixels(a, b)).toBe(2);
  });

  it('refuses images of different sizes', () => {
    expect(() => changedPixels(blankFrame(), blankFrame(52, 70))).toThrow('images differ in size');
  });
});

describe('colourOnlyCheck', () => {
  it(`passes at ${MIN_CHANGED} changed pixels in every idle view (the default neck counts everything as body)`, () => {
    const r = colourOnlyCheck(frames(withChanges(40)), frames(blankFrame()));
    expect(r).toEqual({ counts: { front: 40, right: 40, back: 40 }, body: { front: 40, right: 40, back: 40 }, ok: true });
  });

  // Changes on row 0 (the head) and on row 60 (the body), against a neck at row 30.
  function headAndBody(head, body) {
    const img = blankFrame();
    for (let k = 0; k < head; k++) img.px.set([255, 0, 0, 255], k * 4);
    for (let k = 0; k < body; k++) img.px.set([255, 0, 0, 255], (60 * 50 + k) * 4);
    return img;
  }
  const NECK = { front: 30, right: 30, back: 30 };

  it(`fails a set whose changes are all above the neck (fewer than ${MIN_BODY} below it)`, () => {
    const r = colourOnlyCheck(frames(headAndBody(60, 0)), frames(blankFrame()), NECK);
    expect(r.body).toEqual({ front: 0, right: 0, back: 0 });
    expect(r.ok).toBe(false);
  });

  it(`passes ${MIN_CHANGED} changes with ${MIN_BODY} of them below the neck`, () => {
    const r = colourOnlyCheck(frames(headAndBody(10, 30)), frames(blankFrame()), NECK);
    expect(r).toEqual({ counts: { front: 40, right: 40, back: 40 }, body: { front: 30, right: 30, back: 30 }, ok: true });
  });

  it('fails when one view has 39', () => {
    const dressed = [{ anim: 'idle_front', img: withChanges(40) }, { anim: 'idle_right', img: withChanges(39) }, { anim: 'idle_back', img: withChanges(50) }];
    expect(colourOnlyCheck(dressed, frames(blankFrame())).ok).toBe(false);
  });

  it('names a missing idle frame', () => {
    expect(() => colourOnlyCheck([], frames(blankFrame()))).toThrow('no idle_front frame');
  });
});

describe('missingActivities', () => {
  it("lists the costume's activities the dress file doesn't draw", () => {
    expect(missingActivities(['chop', 'dust', 'sweep'], { activities: { sweep: {} } })).toEqual(['chop', 'dust']);
    expect(missingActivities([], {})).toEqual([]);
  });
});
