import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createStrings, t } from '../../src/ui/strings.js';
import { EN } from '../../src/content/strings/en.js';
import { TIME_ORDER } from '../../src/engine/lighting.js';
import { TEXT_SPEED_ORDER, QUALITY_NAMES, MENU_ITEMS } from '../../src/ui/settings.js';
import { JOURNAL_TABS } from '../../src/ui/journal.js';

describe('createStrings', () => {
  it('looks up keys and fills {placeholders}', () => {
    const tt = createStrings({ hi: 'Hello, {name}! {n} new', plain: 'Plain' });
    expect(tt('hi', { name: 'Ana', n: 2 })).toBe('Hello, Ana! 2 new');
    expect(tt('plain')).toBe('Plain');
    expect(tt('hi', { name: 'Ana' })).toBe('Hello, Ana! {n} new');
    expect(tt.has('plain')).toBe(true);
    expect(tt.has('nope')).toBe(false);
  });

  it('shows the key for a missing string, or throws when strict', () => {
    expect(createStrings({})('menu.nope')).toBe('menu.nope');
    expect(() => createStrings({}, { strict: true })('menu.nope')).toThrow("Missing string 'menu.nope'");
  });

  it('is strict under Vitest', () => {
    expect(() => t('no.such.key')).toThrow("Missing string 'no.such.key'");
    expect(t('menu.resume')).toBe('Resume');
  });
});

describe('strings/en.js', () => {
  const sourceFiles = (dir) => readdirSync(dir, { recursive: true })
    .filter((f) => f.endsWith('.js'))
    .map((f) => join(dir, f));

  it('has every literal key that src/ui and src/sandbox pass to t()', () => {
    const missing = [];
    for (const file of [...sourceFiles('src/ui'), ...sourceFiles('src/sandbox')]) {
      for (const m of readFileSync(file, 'utf8').matchAll(/\bt\('([a-zA-Z0-9_.]+)'/g)) {
        if (EN[m[1]] == null) missing.push(`${file}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('has the keys built at run time (title items, time of day, menu rows and values, journal tabs, errors)', () => {
    const dynamic = [
      ...['continue', 'newGame', 'enterCode'].map((x) => `title.${x}`),
      ...TIME_ORDER.map((x) => `hud.time.${x}`),
      ...MENU_ITEMS.map((x) => `menu.${x}`),
      ...TEXT_SPEED_ORDER.map((x) => `menu.textSpeed.${x}`),
      ...QUALITY_NAMES.map((x) => `menu.quality.${x}`),
      ...['on', 'off'].map((x) => `menu.mute.${x}`),
      ...JOURNAL_TABS.map((x) => `journal.tab.${x}`),
      ...['empty', 'long', 'chars'].map((x) => `letter.nameError.${x}`),
      ...['empty', 'unknownWord', 'ambiguousWord', 'length', 'checksum', 'newerVersion', 'unknownCheckpoint'].map((x) => `code.error.${x}`),
    ];
    expect(dynamic.filter((k) => EN[k] == null)).toEqual([]);
  });

  it('keeps every value a non-empty string', () => {
    for (const [k, v] of Object.entries(EN)) expect(typeof v === 'string' && v.length > 0, k).toBe(true);
  });
});
