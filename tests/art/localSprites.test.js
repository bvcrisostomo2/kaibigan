import { describe, it, expect, vi } from 'vitest';
import { groupFrames, planAnimations, loadLocalSprites, VIEW_TO_DIR } from '../../src/art/localSprites.js';

describe('groupFrames', () => {
  it('groups frame urls by set and folder, sorted by file name', () => {
    const sets = groupFrames({
      '/local-assets/sprites/hero/walk_front/02.png': 'u2',
      '/local-assets/sprites/hero/walk_front/01.png': 'u1',
      '/local-assets/sprites/hero/idle_back/01.png': 'u3',
      '/local-assets/sprites/other/run_right/01.png': 'u4',
      '/local-assets/readme.png': 'ignored',
    });
    expect(sets).toEqual({
      hero: { walk_front: ['u1', 'u2'], idle_back: ['u3'] },
      other: { run_right: ['u4'] },
    });
  });
});

describe('planAnimations', () => {
  it('maps folders to animation names', () => {
    const plan = planAnimations({ walk_front: ['a'], idle_back: ['b'], run_right_front: ['c'] });
    expect(plan.walk_down).toEqual({ urls: ['a'], mirror: false });
    expect(plan.idle_up).toEqual({ urls: ['b'], mirror: false });
    expect(plan.run_down_right).toEqual({ urls: ['c'], mirror: false });
  });

  it('mirrors missing left views from right ones (and right from left)', () => {
    const plan = planAnimations({ walk_right: ['r'], run_right_back: ['rb'], idle_left: ['l'] });
    expect(plan.walk_left).toEqual({ urls: ['r'], mirror: true });
    expect(plan.run_up_left).toEqual({ urls: ['rb'], mirror: true });
    expect(plan.idle_right).toEqual({ urls: ['l'], mirror: true });
  });

  it('never replaces a drawn view with a mirror', () => {
    const plan = planAnimations({ walk_right: ['r'], walk_left: ['l'] });
    expect(plan.walk_left).toEqual({ urls: ['l'], mirror: false });
  });

  it('ignores folders that are not animations', () => {
    expect(planAnimations({ sickle: ['x'], fishing_cast: ['y'], walk_sideways: ['z'] })).toEqual({});
  });

  it('knows all eight views', () => {
    expect(Object.keys(VIEW_TO_DIR)).toHaveLength(8);
  });
});

describe('loadLocalSprites', () => {
  it('resolves to nothing when there are no local sets (fresh clone, public build)', async () => {
    await expect(loadLocalSprites({ urls: {}, overrides: {} })).resolves.toEqual([]);
  });

  it('never rejects: a missing set is reported and the shipped art is kept', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(loadLocalSprites({ urls: {}, overrides: { ibarra: 'ibarra_kb' } })).resolves.toEqual([]);
    expect(warn).toHaveBeenCalledWith("[local sprites] set 'ibarra_kb' for 'ibarra' not found in local-assets/sprites");
    warn.mockRestore();
  });
});
