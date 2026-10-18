import { describe, it, expect } from 'vitest';
import { dress, buildFrames } from '../../tools/kitbash.mjs';
import { figure, tmpDir, writePack, pixel, MAGENTA, YELLOW } from './fixtures.js';

const SAME_PACK = { bodyFrom: 5, headTo: 4, dx: 0 };
const COMPOSE = { front: SAME_PACK, right: SAME_PACK, back: SAME_PACK };

function pack(extraFolders = {}) {
  const f = figure();
  return writePack(tmpDir(), 'p', { walk_front: [f, f], walk_back: [f], walk_right: [f], ...extraFolders });
}

describe('dress', () => {
  it("uses a layer's own palette before the dress palette", () => {
    const img = { w: 2, h: 1, px: Buffer.alloc(8) };
    dress(img, [{ at: [0, 0], rows: ['a'], palette: { a: '#ff0000' } }, { at: [1, 0], rows: ['a'] }], { a: '#00ff00' }, 0);
    expect(pixel(img, 0, 0)).toEqual([255, 0, 0, 255]);
    expect(pixel(img, 1, 0)).toEqual([0, 255, 0, 255]);
  });

  it('names a letter missing from the palette', () => {
    const img = { w: 1, h: 1, px: Buffer.alloc(4) };
    expect(() => dress(img, [{ at: [0, 0], rows: ['q'] }], {}, 0)).toThrow("No colour for 'q'");
  });
});

describe('buildFrames activity sources', () => {
  // The figure is composed at columns 0–7 of a 50×70 frame, bottom-aligned: source row y → 58 + y.
  it("builds act_ frames from the body pack's own animation, per view", () => {
    const carry = figure([[6, 6, MAGENTA]]);
    const dir = pack({ 'carry/front': [carry, carry], 'carry/left': [carry] });
    const dressing = { compose: COMPOSE, activities: { carry: { source: { front: 'carry/front', right: { folder: 'carry/left', mirror: true } } } } };
    const frames = buildFrames(dir, dir, { dressing });
    const front = frames.filter((f) => f.anim === 'act_carry_front');
    const right = frames.filter((f) => f.anim === 'act_carry_right');
    expect(front.map((f) => f.file)).toEqual(['01.png', '02.png']);
    expect(right).toHaveLength(1);
    expect(pixel(front[0].img, 6, 64)).toEqual([...MAGENTA, 255]);
    // Mirrored: column 6 → 1, and the yellow foot at column 2 → 5.
    expect(pixel(right[0].img, 1, 64)).toEqual([...MAGENTA, 255]);
    expect(pixel(right[0].img, 5, 69)).toEqual([...YELLOW, 255]);
  });

  it('names a source folder the pack lacks', () => {
    const dir = pack();
    const dressing = { compose: COMPOSE, activities: { carry: { source: { front: 'carry/front' } } } };
    expect(() => buildFrames(dir, dir, { dressing })).toThrow("Activity 'carry': no folder 'carry/front'");
  });

  it('builds no act_ frames for painted activities (no source)', () => {
    const dir = pack();
    const frames = buildFrames(dir, dir, { dressing: { compose: COMPOSE, activities: { sweep: { prop: {}, at: {} } } } });
    expect(frames.some((f) => f.anim.startsWith('act_'))).toBe(false);
  });
});
