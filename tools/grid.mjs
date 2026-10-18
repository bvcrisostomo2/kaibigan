// Prints a frame as text, for drawing dress maps and placing parts (spec §5): one character per
// pixel, '.' for transparent, a letter per colour (legend below), the column number on top (tens,
// then units) and the row number on the left. Coordinates are the frame's own.
//
// Usage: node tools/grid.mjs <frame.png> [x0 y0 x1 y1]
//   e.g. node tools/grid.mjs local-assets/sprites/sweeper_kb/idle_front/01.png 10 0 40 30
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { decode } from './kitbash.mjs';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$%&*+=?@';

export function gridText(img, [x0, y0, x1, y1] = [0, 0, img.w - 1, img.h - 1]) {
  const keys = new Map();
  const cols = Array.from({ length: x1 - x0 + 1 }, (_, i) => x0 + i);
  const lines = [
    '    ' + cols.map((x) => (x >= 10 ? String(Math.floor(x / 10) % 10) : ' ')).join(''),
    '    ' + cols.map((x) => String(x % 10)).join(''),
  ];
  for (let y = y0; y <= y1; y++) {
    let row = '';
    for (const x of cols) {
      const i = (y * img.w + x) * 4;
      if (!img.px[i + 3]) {
        row += '.';
        continue;
      }
      const hex = '#' + [0, 1, 2].map((k) => img.px[i + k].toString(16).padStart(2, '0')).join('');
      if (!keys.has(hex)) {
        if (keys.size === LETTERS.length) throw new Error('too many colours: print a smaller region');
        keys.set(hex, LETTERS[keys.size]);
      }
      row += keys.get(hex);
    }
    lines.push(String(y).padStart(3) + ' ' + row);
  }
  return [...lines, '', ...[...keys].map(([hex, ch]) => `${ch} ${hex}`)].join('\n');
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [file, ...region] = process.argv.slice(2);
  if (!file) {
    console.error('usage: node tools/grid.mjs <frame.png> [x0 y0 x1 y1]');
    process.exit(2);
  }
  const img = decode(file);
  console.log(gridText(img, region.length === 4 ? region.map(Number) : undefined));
}
