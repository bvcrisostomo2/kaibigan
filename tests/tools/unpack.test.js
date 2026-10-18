import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { isPackZip, overworldDir } from '../../tools/unpack.mjs';
import { figure, tmpDir, writePack } from './fixtures.js';

describe('isPackZip', () => {
  it('takes overworld and NPC zips, not battle ones', () => {
    expect(isPackZip('Mobile - Suikoden STAR LEAP - NPCs - Male 01.zip')).toBe(true);
    expect(isPackZip('Mobile - Suikoden STAR LEAP - Characters (Overworld) - Suikoden I - Gaspar.zip')).toBe(true);
    expect(isPackZip('Mobile - Suikoden STAR LEAP - Characters (Battle) - Suikoden I - Gaspar.zip')).toBe(false);
    expect(isPackZip('Mobile - Suikoden STAR LEAP - Animals - Cat 01.zip')).toBe(false);
    expect(isPackZip('notes.txt')).toBe(false);
  });
});

describe('overworldDir', () => {
  it("finds a pack's Overworld folder", () => {
    const root = tmpDir();
    const ow = writePack(root, 'male01', { walk_front: [figure()] });
    expect(overworldDir(root, 'male01')).toBe(ow);
  });

  it('says to unpack when the pack is missing', () => {
    const root = tmpDir();
    expect(() => overworldDir(root, 'male99')).toThrow(/Pack 'male99' not found .*run node tools\/unpack\.mjs/);
  });

  it('says so when a pack has no Overworld folder', () => {
    const root = tmpDir();
    fs.mkdirSync(path.join(root, 'odd', 'odd', 'Battle'), { recursive: true });
    expect(() => overworldDir(root, 'odd')).toThrow(/no Overworld folder/);
  });
});
