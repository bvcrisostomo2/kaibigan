// Optional, LOCAL-ONLY portrait images (spec §4.1):
//   local-assets/portraits/<costumeId>_<expression>.png     e.g. player_don_neutral.png
//
// local-assets/ is git-ignored: third-party art used as a stand-in must never be committed or
// deployed. The file list comes from localPortraitsFiles.js, which is imported only on the dev
// server, so a production build never bundles these images. A fresh clone has none and keeps the
// generated portraits.
import { registerPortrait } from './portraits.js';
import { EXPRESSIONS } from './characters.js';

// '…/player_don_angry.png' → { costumeId: 'player_don', expression: 'angry' }, else null.
export function parsePortraitPath(path) {
  const m = /([^/\\]+)\.png$/i.exec(path);
  if (!m) return null;
  for (const expression of EXPRESSIONS) {
    const suffix = `_${expression}`;
    if (m[1].endsWith(suffix) && m[1].length > suffix.length) {
      return { costumeId: m[1].slice(0, -suffix.length), expression };
    }
  }
  return null;
}

// The local files, on the dev server only (see the header).
async function localFiles() {
  if (!import.meta.env.DEV) return {};
  const files = await import('./localPortraitsFiles.js');
  return files.portraitUrls;
}

// Registers every local portrait image. Resolves to the 'costumeId_expression' keys loaded.
// Never rejects: a file with an unrecognised name is skipped with a warning.
export async function loadLocalPortraits(options = {}) {
  let urls = options.urls;
  try {
    urls ??= await localFiles();
  } catch (err) {
    console.warn('[local portraits] could not list files:', err);
    return [];
  }
  const loaded = [];
  for (const [path, url] of Object.entries(urls)) {
    const p = parsePortraitPath(path);
    if (!p) {
      console.warn(`[local portraits] skipped '${path}': name it <castId>_<expression>.png`);
      continue;
    }
    registerPortrait(p.costumeId, p.expression, url);
    loaded.push(`${p.costumeId}_${p.expression}`);
  }
  return loaded;
}
