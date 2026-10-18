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

  it('maps seated folders and mirrors them like the others', () => {
    const plan = planAnimations({ sit_front: ['f'], sit_back: ['b'], sit_right: ['r'] });
    expect(plan.sit_down).toEqual({ urls: ['f'], mirror: false });
    expect(plan.sit_up).toEqual({ urls: ['b'], mirror: false });
    expect(plan.sit_left).toEqual({ urls: ['r'], mirror: true });
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

  it('maps activity folders and mirrors their side views', () => {
    const plan = planAnimations({ act_sweep_front: ['f1', 'f2'], act_sweep_right: ['r1', 'r2'], act_fan_right_front: ['d'] });
    expect(plan.act_sweep_down).toEqual({ urls: ['f1', 'f2'], mirror: false });
    expect(plan.act_sweep_right).toEqual({ urls: ['r1', 'r2'], mirror: false });
    expect(plan.act_sweep_left).toEqual({ urls: ['r1', 'r2'], mirror: true });
    expect(plan.act_fan_down_right).toEqual({ urls: ['d'], mirror: false });
    expect(plan.act_fan_down_left).toEqual({ urls: ['d'], mirror: true });
  });

  it('keeps a drawn left activity view', () => {
    const plan = planAnimations({ act_wash_right: ['r'], act_wash_left: ['l'] });
    expect(plan.act_wash_left).toEqual({ urls: ['l'], mirror: false });
  });

  it('skips activity folders with an unknown view or a malformed name', () => {
    expect(planAnimations({ act_sweep_sideways: ['x'], act__front: ['y'], act_front: ['z'] })).toEqual({});
  });

  it('plans a set that has only activity folders', () => {
    expect(Object.keys(planAnimations({ act_pole_front: ['a'] }))).toEqual(['act_pole_down']);
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
