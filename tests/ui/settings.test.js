import { describe, it, expect } from 'vitest';
import {
  SETTINGS_KEY, MENU_ITEMS, defaultSettings, normalizeSettings, loadSettings, saveSettings, adjustSetting, menuRows,
} from '../../src/ui/settings.js';

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; },
  };
}
const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };

describe('settings values', () => {
  it('defaults to the device quality, normal text and 80% volume', () => {
    expect(defaultSettings('low')).toEqual({ quality: 'low', textSpeed: 'normal', volume: 0.8, muted: false });
  });

  it('normalizes stored values: unknowns fall back, volume clamps to tenths', () => {
    expect(normalizeSettings({ quality: 'ultra', textSpeed: 'warp', volume: 7, muted: 'yes' }, 'low')).toEqual({ quality: 'low', textSpeed: 'normal', volume: 1, muted: false });
    expect(normalizeSettings({ quality: 'high', textSpeed: 'fast', volume: 0.349, muted: true })).toEqual({ quality: 'high', textSpeed: 'fast', volume: 0.3, muted: true });
    expect(normalizeSettings(null, 'low')).toEqual(defaultSettings('low'));
    expect(normalizeSettings({ volume: NaN }).volume).toBe(0.8);
  });
});

describe('settings storage', () => {
  it('round-trips through its own key', () => {
    const storage = memoryStorage();
    const s = { quality: 'low', textSpeed: 'instant', volume: 0.5, muted: true };
    expect(saveSettings(storage, s)).toBe(true);
    expect(Object.keys(storage.data)).toEqual([SETTINGS_KEY]);
    expect(loadSettings(storage, 'high')).toEqual(s);
  });

  it('falls back to defaults for missing, corrupt or blocked storage', () => {
    expect(loadSettings(memoryStorage(), 'low')).toEqual(defaultSettings('low'));
    expect(loadSettings(memoryStorage({ [SETTINGS_KEY]: '{oops' }), 'high')).toEqual(defaultSettings('high'));
    expect(loadSettings(blocked, 'low')).toEqual(defaultSettings('low'));
    expect(loadSettings(null, 'low')).toEqual(defaultSettings('low'));
    expect(saveSettings(blocked, defaultSettings())).toBe(false);
  });
});

describe('Esc menu', () => {
  const s = defaultSettings('high');

  it('adjusts each setting row and ignores action rows', () => {
    expect(adjustSetting(s, 'quality', 1).quality).toBe('low');
    expect(adjustSetting(s, 'textSpeed', 1).textSpeed).toBe('fast');
    expect(adjustSetting(s, 'textSpeed', -2).textSpeed).toBe('instant');
    expect(adjustSetting(s, 'volume', 1).volume).toBe(0.9);
    expect(adjustSetting({ ...s, volume: 1 }, 'volume', 1).volume).toBe(1);
    expect(adjustSetting({ ...s, volume: 0.1 }, 'volume', -1).volume).toBe(0);
    expect(adjustSetting(s, 'mute', 1).muted).toBe(true);
    expect(adjustSetting(s, 'quit', 1)).toBe(null);
  });

  it('lists every row with its label and value', () => {
    const rows = menuRows({ quality: 'low', textSpeed: 'fast', volume: 0.5, muted: true });
    expect(rows.map((r) => r.id)).toEqual(MENU_ITEMS);
    expect(rows.find((r) => r.id === 'quality')).toEqual({ id: 'quality', label: 'Graphics', value: 'Low' });
    expect(rows.find((r) => r.id === 'textSpeed').value).toBe('Fast');
    expect(rows.find((r) => r.id === 'volume').value).toBe('50%');
    expect(rows.find((r) => r.id === 'mute')).toEqual({ id: 'mute', label: 'Sound', value: 'Off' });
    expect(rows.find((r) => r.id === 'quit')).toEqual({ id: 'quit', label: 'Quit to title', value: null });
  });
});
