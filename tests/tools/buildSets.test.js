import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { mergeOverrides, selectCast, buildSet } from '../../tools/build-sets.mjs';
import { figure, tmpDir, writePack } from './fixtures.js';

describe('mergeOverrides', () => {
  it('keeps the existing entries and their order, adding or replacing the built ones', () => {
    const merged = mergeOverrides({ player_don: 'hero_kb', ibarra: 'ibarra_kb' }, { sweeper: 'sweeper_kb', ibarra: 'ibarra_kb' });
    expect(Object.entries(merged)).toEqual([['player_don', 'hero_kb'], ['ibarra', 'ibarra_kb'], ['sweeper', 'sweeper_kb']]);
  });
});

describe('selectCast', () => {
  const cast = [{ id: 'a' }, { id: 'b' }];
  it('takes everything when no id is given', () => {
    expect(selectCast(cast, [])).toEqual({ entries: cast, unknown: [] });
  });
  it('reports ids not in the list', () => {
    expect(selectCast(cast, ['b', 'zz'])).toEqual({ entries: [{ id: 'b' }], unknown: ['zz'] });
  });
});

describe('buildSet', () => {
  it("fails on a costume activity the dress file doesn't draw, leaving the old set in place", async () => {
    const packs = tmpDir(), out = tmpDir();
    const f = figure();
    writePack(packs, 'p', { walk_front: [f], walk_back: [f], walk_right: [f] });
    fs.mkdirSync(path.join(out, 'sweeper_kb'), { recursive: true });
    fs.writeFileSync(path.join(out, 'sweeper_kb', 'old.txt'), 'old');
    // The sweeper's costume lists 'sweep'; this entry has no dress file at all.
    await expect(buildSet({ id: 'sweeper', set: 'sweeper_kb', body: 'p', head: 'p' }, { packs, outRoot: out })).rejects.toThrow("sweeper: no frames for the costume's activities: sweep");
    expect(fs.readFileSync(path.join(out, 'sweeper_kb', 'old.txt'), 'utf8')).toBe('old');
    expect(fs.existsSync(path.join(out, '.tmp-sweeper_kb'))).toBe(false);
  });

  it('fails a colour-only set with the counts, writing nothing', async () => {
    const packs = tmpDir(), out = tmpDir();
    const f = figure();
    writePack(packs, 'p', { walk_front: [f], walk_back: [f], walk_right: [f] });
    // passerby_a has no activities; an undressed set changes 0 pixels.
    await expect(buildSet({ id: 'passerby_a', set: 'passerby_a_kb', body: 'p', head: 'p' }, { packs, outRoot: out })).rejects.toThrow(/passerby_a: only colour changes .*"front":0/);
    expect(fs.readdirSync(out)).toEqual([]);
  });

  it('fails a set whose changes are all on the head (nothing below the neck)', async () => {
    const packs = tmpDir(), out = tmpDir();
    const f = figure();
    writePack(packs, 'p', { walk_front: [f], walk_back: [f], walk_right: [f] });
    // The 8×12 figure sits on rows 58–69; with bodyFrom 5 the neck is row 63. A 6×8 patch on rows
    // 55–60 changes 48 pixels, all on the head.
    const dressFile = path.join(tmpDir(), 'dress.mjs');
    fs.writeFileSync(dressFile, [
      "const v = { bodyFrom: 5, headTo: 4, dx: 0 };",
      "const hat = [{ at: [0, 55], rows: Array(6).fill('aaaaaaaa') }];",
      "export default { compose: { front: v, right: v, back: v }, palette: { a: '#ff0000' }, views: { front: hat, right: hat, back: hat } };",
    ].join('\n'));
    await expect(buildSet({ id: 'passerby_a', set: 'passerby_a_kb', body: 'p', head: 'p', dress: dressFile }, { packs, outRoot: out })).rejects.toThrow(/below the neck \{"front":0,"right":0,"back":0\}/);
  });

  it('builds a set without the check (the main cast), with seated frames', async () => {
    const packs = tmpDir(), out = tmpDir();
    const f = figure();
    writePack(packs, 'p', { walk_front: [f, f], walk_back: [f], walk_right: [f] });
    // A dress file anywhere (an absolute path) that keeps the 8×12 figure's own head.
    const dressFile = path.join(tmpDir(), 'dress.mjs');
    fs.writeFileSync(dressFile, "const v = { bodyFrom: 5, headTo: 4, dx: 0 };\nexport default { compose: { front: v, right: v, back: v } };\n");
    const dir = await buildSet({ id: 'tiago', set: 'tiago_kb', body: 'p', head: 'p', dress: dressFile, check: false }, { packs, outRoot: out });
    expect(fs.readdirSync(dir).sort()).toEqual(['idle_back', 'idle_front', 'idle_right', 'sit_back', 'sit_front', 'sit_right', 'walk_back', 'walk_front', 'walk_right']);
  });

  it('copies the set into place when Windows refuses the rename (a watched folder)', async () => {
    const packs = tmpDir(), out = tmpDir();
    const f = figure();
    writePack(packs, 'p', { walk_front: [f], walk_back: [f], walk_right: [f] });
    const dressFile = path.join(tmpDir(), 'dress.mjs');
    fs.writeFileSync(dressFile, "const v = { bodyFrom: 5, headTo: 4, dx: 0 };\nexport default { compose: { front: v, right: v, back: v } };\n");
    const refuse = vi.spyOn(fs, 'renameSync').mockImplementation(() => {
      throw Object.assign(new Error('operation not permitted'), { code: 'EPERM' });
    });
    try {
      const dir = await buildSet({ id: 'tiago', set: 'tiago_kb', body: 'p', head: 'p', dress: dressFile, check: false }, { packs, outRoot: out });
      expect(fs.existsSync(path.join(dir, 'idle_front', '01.png'))).toBe(true);
      expect(fs.readdirSync(out)).toEqual(['tiago_kb']);
    } finally {
      refuse.mockRestore();
    }
  });

  it('says to unpack when a pack is missing', async () => {
    await expect(buildSet({ id: 'tiago', set: 't', body: 'nope', head: 'nope', check: false }, { packs: tmpDir(), outRoot: tmpDir() })).rejects.toThrow(/run node tools\/unpack\.mjs/);
  });
});
