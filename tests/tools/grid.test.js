import { describe, it, expect } from 'vitest';
import { gridText } from '../../tools/grid.mjs';

describe('gridText', () => {
  it('prints rulers, a letter per colour, dots for transparent and a legend', () => {
    const img = { w: 12, h: 2, px: Buffer.alloc(12 * 2 * 4) };
    img.px.set([255, 0, 0, 255], 0);
    img.px.set([0, 0, 255, 255], (1 * 12 + 11) * 4);
    expect(gridText(img).split('\n')).toEqual([
      ' '.repeat(14) + '11',
      '    012345678901',
      '  0 A...........',
      '  1 ...........B',
      '',
      'A #ff0000',
      'B #0000ff',
    ]);
  });

  it('prints a region only', () => {
    const img = { w: 4, h: 4, px: Buffer.alloc(64) };
    expect(gridText(img, [1, 2, 2, 3]).split('\n').slice(2, 4)).toEqual(['  2 ..', '  3 ..']);
  });
});
