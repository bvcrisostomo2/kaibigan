// Player settings (spec §4.2): graphics, text speed, volume and mute. Saved under their own
// localStorage key, separate from the autosave; every storage call is wrapped like save.js.
import { wrapIndex } from './cursor.js';
import { t } from './strings.js';

export const SETTINGS_KEY = 'kaibigan.settings';
export const QUALITY_NAMES = ['low', 'high'];
export const TEXT_SPEED_ORDER = ['slow', 'normal', 'fast', 'instant'];

// quality defaults to the device's (phones start on Low, spec §7).
export function defaultSettings(quality = 'high') {
  return { quality, textSpeed: 'normal', volume: 0.8, muted: false };
}

// Any stored value → valid settings: unknown values fall back, volume is clamped to 0–1 in tenths.
export function normalizeSettings(raw, fallbackQuality = 'high') {
  const d = defaultSettings(fallbackQuality);
  if (!raw || typeof raw !== 'object') return d;
  return {
    quality: QUALITY_NAMES.includes(raw.quality) ? raw.quality : d.quality,
    textSpeed: TEXT_SPEED_ORDER.includes(raw.textSpeed) ? raw.textSpeed : d.textSpeed,
    volume: Number.isFinite(raw.volume) ? Math.round(Math.min(1, Math.max(0, raw.volume)) * 10) / 10 : d.volume,
    muted: typeof raw.muted === 'boolean' ? raw.muted : d.muted,
  };
}

export function loadSettings(storage, fallbackQuality = 'high') {
  try {
    return normalizeSettings(JSON.parse(storage?.getItem(SETTINGS_KEY) ?? 'null'), fallbackQuality);
  } catch {
    return defaultSettings(fallbackQuality);
  }
}

// Returns true when the settings were written.
export function saveSettings(storage, settings) {
  try {
    storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

// The Esc menu's rows, top to bottom.
export const MENU_ITEMS = ['resume', 'quality', 'textSpeed', 'volume', 'mute', 'saveCode', 'resetPosition', 'quit'];

// Left/right on a setting row (confirm counts as +1). New settings, or null for a non-setting row.
export function adjustSetting(settings, item, delta) {
  switch (item) {
    case 'quality':
      return { ...settings, quality: settings.quality === 'high' ? 'low' : 'high' };
    case 'textSpeed':
      return { ...settings, textSpeed: TEXT_SPEED_ORDER[wrapIndex(TEXT_SPEED_ORDER.indexOf(settings.textSpeed) + delta, TEXT_SPEED_ORDER.length)] };
    case 'volume':
      return normalizeSettings({ ...settings, volume: settings.volume + delta * 0.1 }, settings.quality);
    case 'mute':
      return { ...settings, muted: !settings.muted };
    default:
      return null;
  }
}

// [{ id, label, value }] for the menu view; value is null for action rows.
export function menuRows(settings) {
  const value = {
    quality: t(`menu.quality.${settings.quality}`),
    textSpeed: t(`menu.textSpeed.${settings.textSpeed}`),
    volume: `${Math.round(settings.volume * 100)}%`,
    mute: t(`menu.mute.${settings.muted ? 'on' : 'off'}`),
  };
  return MENU_ITEMS.map((id) => ({ id, label: t(`menu.${id}`), value: value[id] ?? null }));
}
