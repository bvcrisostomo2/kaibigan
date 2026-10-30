import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { drawBust } from '../../src/art/busts.js';
import { portraitPixels, portraitSource, registerPortrait, clearPortraits, PORTRAIT_SIZE } from '../../src/art/portraits.js';
import { parsePortraitPath, loadLocalPortraits } from '../../src/art/localPortraits.js';

const same = (a, b) => Buffer.from(a.data).equals(Buffer.from(b.data));

describe('portraitPixels', () => {
  it('is the bust in the asked feeling', () => {
    expect(same(portraitPixels('damaso', 'angry'), drawBust('damaso', 'angry'))).toBe(true);
    expect(same(portraitPixels('damaso', 'angry'), portraitPixels('damaso', 'happy'))).toBe(false);
    expect(portraitPixels('tiago', 'sad').width).toBe(PORTRAIT_SIZE);
    expect(PORTRAIT_SIZE).toBe(96);
  });

  it('reuses a generated portrait instead of redrawing it', () => {
    expect(portraitPixels('damaso', 'angry')).toBe(portraitPixels('damaso', 'angry'));
    expect(portraitPixels('ibarra', 'happy')).toBe(portraitPixels('ibarra', 'happy'));
  });

  it('throws for an unknown costume', () => {
    expect(() => portraitPixels('nobody')).toThrow("Unknown costume 'nobody'");
  });
});

describe('portraitSource', () => {
  beforeEach(() => clearPortraits());

  it('prefers a local image for the expression, then the neutral image, then generated pixels', () => {
    expect(portraitSource('isabel', 'happy').kind).toBe('pixels');
    registerPortrait('isabel', 'neutral', '/isabel_neutral.png');
    expect(portraitSource('isabel', 'happy')).toEqual({ kind: 'image', url: '/isabel_neutral.png' });
    registerPortrait('isabel', 'happy', '/isabel_happy.png');
    expect(portraitSource('isabel', 'happy')).toEqual({ kind: 'image', url: '/isabel_happy.png' });
    clearPortraits();
    expect(portraitSource('isabel', 'happy').kind).toBe('pixels');
  });
});

describe('local portraits', () => {
  beforeEach(() => clearPortraits());

  it('parses <costumeId>_<expression>.png, including ids with underscores', () => {
    expect(parsePortraitPath('/local-assets/portraits/player_don_angry.png')).toEqual({ costumeId: 'player_don', expression: 'angry' });
    expect(parsePortraitPath('damaso_neutral.PNG')).toEqual({ costumeId: 'damaso', expression: 'neutral' });
    expect(parsePortraitPath('damaso_laughing.png')).toBe(null);
    expect(parsePortraitPath('a/damaso_embarrassed.png')).toEqual({ costumeId: 'damaso', expression: 'embarrassed' });
    expect(parsePortraitPath('a/player_dona_content.png')).toEqual({ costumeId: 'player_dona', expression: 'content' });
    expect(parsePortraitPath('a/damaso_smile.png')).toBe(null); // the old face names are gone
    expect(parsePortraitPath('_neutral.png')).toBe(null);
    expect(parsePortraitPath('notes.txt')).toBe(null);
  });

  it('registers the images it is given and skips badly named files', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const loaded = await loadLocalPortraits({ urls: { '/local-assets/portraits/isabel_happy.png': '/u/1.png', '/local-assets/portraits/oops.png': '/u/2.png' } });
    expect(loaded).toEqual(['isabel_happy']);
    expect(portraitSource('isabel', 'happy')).toEqual({ kind: 'image', url: '/u/1.png' });
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
