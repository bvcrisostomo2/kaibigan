import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { PixelCanvas } from '../../src/art/pixel.js';
import { drawPortrait } from '../../src/art/characters.js';
import { COSTUMES } from '../../src/art/costumes.js';
import { handmadeFrames } from '../../src/art/handmade.js';
import { HANDMADE } from '../../src/art/cast/index.js';
import { headCrop, portraitPixels, portraitSource, registerPortrait, clearPortraits, PORTRAIT_SIZE } from '../../src/art/portraits.js';
import { parsePortraitPath, loadLocalPortraits } from '../../src/art/localPortraits.js';

const same = (a, b) => Buffer.from(a.data).equals(Buffer.from(b.data));

describe('headCrop', () => {
  it('crops 21×21 around the head and scales it ×3', () => {
    const frame = new PixelCanvas(48, 64);
    frame.fillRect(20, 5, 8, 8, '#aa5533'); // head: rows 5–12, columns 20–27
    frame.fillRect(14, 13, 20, 30, '#223344'); // body below
    const p = headCrop(frame);
    expect([p.width, p.height]).toEqual([PORTRAIT_SIZE, PORTRAIT_SIZE]);
    // Window starts 2 rows above the head (y 3) and 10 columns left of its centre (x 14).
    expect(p.get((20 - 14) * 3, (5 - 3) * 3)).toBe('#aa5533');
    expect(p.get((20 - 14) * 3 - 1, (5 - 3) * 3)).toBe(null);
    expect(p.get(0, 63)).toBe(null); // the 64th row/column stays empty (21 × 3 = 63)
  });

  it('gives an empty portrait for an empty frame', () => {
    expect(headCrop(new PixelCanvas(48, 64)).coverage()).toBe(0);
  });
});

describe('portraitPixels', () => {
  it('crops a hand-authored character from its own front sprite', () => {
    const expected = headCrop(handmadeFrames(HANDMADE.ibarra).idle_down[0]);
    expect(same(portraitPixels('ibarra', 'angry'), expected)).toBe(true);
    expect(portraitPixels('ibarra').coverage()).toBeGreaterThan(400);
  });

  it('uses the procedural portrait otherwise, per expression', () => {
    expect(same(portraitPixels('damaso', 'angry'), drawPortrait(COSTUMES.damaso, 'angry'))).toBe(true);
    expect(same(portraitPixels('damaso', 'angry'), portraitPixels('damaso', 'smile'))).toBe(false);
  });

  it('throws for an unknown costume', () => {
    expect(() => portraitPixels('nobody')).toThrow("Unknown costume 'nobody'");
  });
});

describe('portraitSource', () => {
  beforeEach(() => clearPortraits());

  it('prefers a local image for the expression, then the neutral image, then generated pixels', () => {
    expect(portraitSource('isabel', 'smile').kind).toBe('pixels');
    registerPortrait('isabel', 'neutral', '/isabel_neutral.png');
    expect(portraitSource('isabel', 'smile')).toEqual({ kind: 'image', url: '/isabel_neutral.png' });
    registerPortrait('isabel', 'smile', '/isabel_smile.png');
    expect(portraitSource('isabel', 'smile')).toEqual({ kind: 'image', url: '/isabel_smile.png' });
    clearPortraits();
    expect(portraitSource('isabel', 'smile').kind).toBe('pixels');
  });
});

describe('local portraits', () => {
  beforeEach(() => clearPortraits());

  it('parses <costumeId>_<expression>.png, including ids with underscores', () => {
    expect(parsePortraitPath('/local-assets/portraits/player_don_angry.png')).toEqual({ costumeId: 'player_don', expression: 'angry' });
    expect(parsePortraitPath('damaso_neutral.PNG')).toEqual({ costumeId: 'damaso', expression: 'neutral' });
    expect(parsePortraitPath('damaso_laughing.png')).toBe(null);
    expect(parsePortraitPath('_neutral.png')).toBe(null);
    expect(parsePortraitPath('notes.txt')).toBe(null);
  });

  it('registers the images it is given and skips badly named files', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const loaded = await loadLocalPortraits({ urls: { '/local-assets/portraits/isabel_smile.png': '/u/1.png', '/local-assets/portraits/oops.png': '/u/2.png' } });
    expect(loaded).toEqual(['isabel_smile']);
    expect(portraitSource('isabel', 'smile')).toEqual({ kind: 'image', url: '/u/1.png' });
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('resolves to nothing when there are no local portraits (a fresh clone)', async () => {
    await expect(loadLocalPortraits()).resolves.toEqual([]);
  });

  it('keeps the glob in its own module, imported only under import.meta.env.DEV', () => {
    const loader = readFileSync('src/art/localPortraits.js', 'utf8');
    expect(loader).not.toMatch(/import\.meta\.glob/);
    expect(loader).toMatch(/if \(!import\.meta\.env\.DEV\) return \{\};\r?\n\s+const files = await import\('\.\/localPortraitsFiles\.js'\);/);
    expect(loader).not.toMatch(/^import .*localPortraitsFiles/m);
  });
});
