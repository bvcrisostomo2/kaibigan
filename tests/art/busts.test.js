import { describe, it, expect } from 'vitest';
import { FEELINGS } from '../../src/art/characters.js';
import { COSTUMES } from '../../src/art/costumes.js';
import { FACE_PARTS } from '../../src/art/faces.js';
import { BUST_LOOKS } from '../../src/art/bustLooks.js';
import { drawBust, bustFaceBox, lookFor, BUST_SIZE } from '../../src/art/busts.js';

const key = (c) => Buffer.from(c.data).toString('base64');

describe('the face system', () => {
  it('gives every feeling its own face', () => {
    expect(Object.keys(FACE_PARTS).sort()).toEqual([...FEELINGS].sort());
    const faces = FEELINGS.map((f) => JSON.stringify(FACE_PARTS[f]));
    expect(new Set(faces).size).toBe(FEELINGS.length);
  });
});

describe('drawBust', () => {
  it.each(Object.keys(BUST_LOOKS))('draws %s as a 96×96 bust, different in each feeling', (id) => {
    const busts = FEELINGS.map((f) => drawBust(id, f));
    expect([busts[0].width, busts[0].height]).toEqual([BUST_SIZE, BUST_SIZE]);
    expect(busts[0].coverage()).toBeGreaterThan(BUST_SIZE * BUST_SIZE * 0.4);
    expect(new Set(busts.map(key)).size).toBe(FEELINGS.length);
  });

  it.each(Object.keys(BUST_LOOKS))('never covers the eyes of %s with hair or a hat', (id) => {
    const look = BUST_LOOKS[id];
    const cover = new Set([...look.hair.tones, ...(look.hat?.tones ?? [])]);
    const bust = drawBust(id, 'neutral');
    const { x, y, w, h } = bustFaceBox();
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) expect(cover.has(bust.get(i, j))).toBe(false);
  });

  it('is deterministic and refuses unknown names', () => {
    expect(key(drawBust('damaso', 'angry'))).toBe(key(drawBust('damaso', 'angry')));
    expect(() => drawBust('nobody')).toThrow("Unknown costume 'nobody'");
    expect(() => drawBust('damaso', 'smile')).toThrow("Unknown feeling 'smile'");
  });

  it('draws a bust from the costume data for anyone without a matched look', () => {
    const extra = Object.keys(COSTUMES).find((id) => !BUST_LOOKS[id]);
    expect(lookFor(extra).skin).toHaveLength(3);
    expect(drawBust(extra, 'shocked').width).toBe(BUST_SIZE);
  });
});
