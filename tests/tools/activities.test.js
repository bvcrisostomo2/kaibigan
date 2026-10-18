import { describe, it, expect } from 'vitest';
import { paintActivity, nodFrames, activityFrames, paintedPixels } from '../../tools/activities.mjs';
import { blankFrame, pixel, BLUE } from './fixtures.js';

const P = { a: '#ff0000' };
const RED = [255, 0, 0, 255];
const layer = (x, y, rows) => ({ at: [x, y], rows, palette: P });

describe('paintedPixels', () => {
  it('lists painted pixels only, shifted', () => {
    expect(paintedPixels([layer(1, 2, ['a.-a'])], 10, 100)).toEqual([{ x: 101, y: 12 }, { x: 104, y: 12 }]);
  });
});

describe('paintActivity', () => {
  it('paints inside the frame without padding', () => {
    const [out] = paintActivity([{ img: blankFrame(), layers: [layer(5, 5, ['a'])] }]);
    expect([out.w, out.h]).toEqual([50, 70]);
    expect(pixel(out, 5, 5)).toEqual(RED);
  });

  it('pads both sides equally (plus a spare pixel) when a prop reaches past an edge', () => {
    const [out] = paintActivity([{ img: blankFrame(), layers: [layer(-3, 30, ['aaa'])] }]);
    expect([out.w, out.h]).toEqual([58, 70]);
    expect(pixel(out, 24, 40)).toEqual([...BLUE, 255]); // the body keeps its place, 4 to the right
    expect(pixel(out, 1, 30)).toEqual(RED);
    expect(pixel(out, 0, 0)[3]).toBe(0); // the top-left stays background
  });

  it('pads the top when a prop reaches above the frame', () => {
    const [out] = paintActivity([{ img: blankFrame(), layers: [layer(25, -2, ['a'])] }]);
    expect([out.w, out.h]).toEqual([50, 73]);
    expect(pixel(out, 25, 1)).toEqual(RED);
    expect(pixel(out, 25, 72)).toEqual([...BLUE, 255]); // feet still on the bottom row
  });

  it('keeps the top-left pixel free: a prop there adds a row', () => {
    const [out] = paintActivity([{ img: blankFrame(), layers: [layer(0, 0, ['a'])] }]);
    expect(out.h).toBe(71);
    expect(pixel(out, 0, 0)[3]).toBe(0);
    expect(pixel(out, 0, 1)).toEqual(RED);
  });

  it('rejects a prop below the feet', () => {
    expect(() => paintActivity([{ img: blankFrame(), layers: [layer(25, 69, ['a', 'a'])] }])).toThrow('a prop reaches below the feet (row 70, feet at row 69)');
  });

  it('puts every frame of an activity on one canvas size', () => {
    const outs = paintActivity([{ img: blankFrame(), layers: [layer(-2, 30, ['a'])] }, { img: blankFrame(), layers: [layer(5, 30, ['a'])] }]);
    expect(outs.map((o) => [o.w, o.h])).toEqual([[56, 70], [56, 70]]);
  });

  it('follows the frame bob and head offset', () => {
    const [out] = paintActivity([{ img: blankFrame(), layers: [layer(5, 5, ['a'])], bob: 1, dx: -1 }]);
    expect(pixel(out, 4, 6)).toEqual(RED);
  });
});

describe('nodFrames', () => {
  it('lowers everything above the neck by one pixel on the second frame', () => {
    const img = blankFrame();
    img.px.set([255, 0, 0, 255], (10 * 50 + 25) * 4); // a "head" pixel at (25, 10)
    const [a, b] = nodFrames(img, 20);
    expect(pixel(a, 25, 10)).toEqual(RED);
    expect(pixel(b, 25, 11)).toEqual(RED);
    expect(pixel(b, 25, 10)[3]).toBe(0);
    expect(pixel(b, 25, 45)).toEqual([...BLUE, 255]); // below the neck: unchanged
  });
});

describe('activityFrames', () => {
  const PROP = { palette: P, frames: [{ front: [{ at: [0, 0], rows: ['a'] }], right: [{ at: [0, 0], rows: ['a'] }] }, { front: [{ at: [1, 0], rows: ['a'] }], right: [{ at: [1, 0], rows: ['a'] }] }] };
  const idle = (view) => ({ anim: `idle_${view}`, file: '01.png', img: blankFrame(), bob: 0, dx: 0 });

  it('paints a prop on the idle frame, a file per prop frame, front and right', () => {
    const out = activityFrames({ activities: { sweep: { prop: PROP, at: { front: [10, 10], right: [12, 10] } } } }, [idle('front'), idle('right'), idle('back')]);
    expect(out.map((f) => `${f.anim}/${f.file}`)).toEqual(['act_sweep_front/01.png', 'act_sweep_front/02.png', 'act_sweep_right/01.png', 'act_sweep_right/02.png']);
    expect(pixel(out[1].img, 11, 10)).toEqual(RED);
    expect(pixel(out[2].img, 12, 10)).toEqual(RED);
  });

  it('paints a prop over source frames, cycling the prop frames', () => {
    const src = [1, 2, 3].map((k) => ({ anim: 'act_strum_front', file: `0${k}.png`, img: blankFrame(), bob: 0, dx: 0 }));
    const out = activityFrames({ activities: { strum: { source: { front: 'bard' }, prop: PROP, at: { front: [10, 10] } } } }, [idle('front'), ...src]);
    expect(out.map((f) => f.file)).toEqual(['01.png', '02.png', '03.png']);
    expect(pixel(out[2].img, 10, 10)).toEqual(RED); // frame 3 uses prop frame 1
  });

  it('keeps source frames as they are when there is no prop', () => {
    const src = { anim: 'act_carry_front', file: '01.png', img: blankFrame(), bob: 0, dx: 0 };
    const out = activityFrames({ activities: { carry: { source: { front: 'carry/front' } } } }, [idle('front'), src]);
    expect(out).toHaveLength(1);
    expect([out[0].img.w, out[0].img.h]).toEqual([50, 70]);
  });

  it('makes a nod from the neck row', () => {
    const out = activityFrames({ activities: { chat: { nod: { front: 20 } } } }, [idle('front')]);
    expect(out.map((f) => `${f.anim}/${f.file}`)).toEqual(['act_chat_front/01.png', 'act_chat_front/02.png']);
  });

  it('names a source view with a prop but no offset', () => {
    const src = { anim: 'act_strum_front', file: '01.png', img: blankFrame(), bob: 0, dx: 0 };
    expect(() => activityFrames({ activities: { strum: { source: { front: 'bard' }, prop: PROP } } }, [idle('front'), src])).toThrow("Activity 'strum': a prop needs an 'at' offset for the front view");
  });

  it('leaves a source view unpainted when its offset is false (the prop belongs to another view)', () => {
    const src = { anim: 'act_strum_right', file: '01.png', img: blankFrame(), bob: 0, dx: 0 };
    const out = activityFrames({ activities: { strum: { source: { right: 'bard' }, prop: PROP, at: { front: [10, 10], right: false } } } }, [idle('front'), src]);
    expect(out.map((f) => `${f.anim}/${f.file}`)).toEqual(['act_strum_front/01.png', 'act_strum_front/02.png', 'act_strum_right/01.png']);
    expect(pixel(out[2].img, 0, 0)[3]).toBe(0);
    expect([out[2].img.w, out[2].img.h]).toEqual([50, 70]);
  });

  it('names a source view that built no frames', () => {
    expect(() => activityFrames({ activities: { carry: { source: { front: 'carry/front' } } } }, [idle('front')])).toThrow("Activity 'carry': no frames for the front view");
  });
});
