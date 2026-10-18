// Builds the kitbash sets listed in tools/cast.mjs (spec §3): kitbash (with the dress file and its
// parts) → the activities → seated frames, into local-assets/sprites/<set>/, and lists each built
// set in local-assets/sprites/overrides.json. A new set must pass the "not just colour" check and
// draw every activity its costume lists. A set is written to a temporary folder first, so a failed
// build leaves the old one (and overrides.json) as they were.
//
// Usage: node tools/build-sets.mjs [--out <dir>] [id ...]   (every set when no id is given)
//   --out <dir>  writes there instead and leaves overrides.json alone (to compare a rebuild)
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildFrames, encode, decode, VIEWS } from './kitbash.mjs';
import { seatSet } from './sit.mjs';
import { withParts, recolourOnly } from './parts.mjs';
import { activityFrames } from './activities.mjs';
import { colourOnlyCheck, missingActivities, MIN_CHANGED, MIN_BODY } from './check.mjs';
import { overworldDir, PACKS } from './unpack.mjs';
import { CAST } from './cast.mjs';
import { COSTUMES } from '../src/art/costumes.js';

export const SPRITES = path.join('local-assets', 'sprites');

// overrides.json after a build: the old entries in their order, the built ones added or replaced.
export function mergeOverrides(current, built) {
  return { ...current, ...built };
}

export function selectCast(cast, ids) {
  if (!ids.length) return { entries: cast, unknown: [] };
  return { entries: cast.filter((e) => ids.includes(e.id)), unknown: ids.filter((id) => !cast.some((e) => e.id === id)) };
}

// Put a freshly built set in place. On Windows a folder the dev server is watching can refuse a
// rename (EPERM, EBUSY); the files are copied over instead.
function swapIn(tmp, final) {
  fs.rmSync(final, { recursive: true, force: true });
  try {
    fs.renameSync(tmp, final);
  } catch (err) {
    if (err.code !== 'EPERM' && err.code !== 'EBUSY') throw err;
    fs.cpSync(tmp, final, { recursive: true });
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

// The first body row of each idle view in output coordinates: kitbash cuts the body pack at
// `bodyFrom` and bottom-aligns it in a 70-row frame. The right view may come from walk_left.
export function neckRows(bodyDir, compose) {
  const out = {};
  for (const view of ['front', 'right', 'back']) {
    const folder = [`walk_${view}`, view === 'right' ? 'walk_left' : null].filter(Boolean).find((f) => fs.existsSync(path.join(bodyDir, f, '01.png')));
    const h = folder ? decode(path.join(bodyDir, folder, '01.png')).h : 70;
    out[view] = (compose?.[view] ?? VIEWS[view]).bodyFrom + 70 - h;
  }
  return out;
}

async function loadDress(file) {
  if (!file) return {};
  return (await import(pathToFileURL(path.resolve('tools', file)).href)).default ?? {};
}

export async function buildSet(entry, { packs = PACKS, outRoot = SPRITES } = {}) {
  const bodyDir = overworldDir(packs, entry.body);
  const headDir = overworldDir(packs, entry.head ?? entry.body);
  const raw = await loadDress(entry.dress);
  const dressing = withParts(raw);
  const checked = entry.check !== false;
  if (checked) {
    const missing = missingActivities(COSTUMES[entry.id]?.activities ?? [], raw);
    if (missing.length) throw new Error(`${entry.id}: no frames for the costume's activities: ${missing.join(', ')}`);
  }
  const frames = buildFrames(bodyDir, headDir, { dressing });
  if (checked) {
    const { counts, body, ok } = colourOnlyCheck(frames, buildFrames(bodyDir, headDir, { dressing: recolourOnly(raw) }), neckRows(bodyDir, raw.compose));
    if (!ok) throw new Error(`${entry.id}: only colour changes in some views, changed pixels ${JSON.stringify(counts)}, below the neck ${JSON.stringify(body)} (need ${MIN_CHANGED} in each, ${MIN_BODY} below the neck)`);
  }
  const acts = activityFrames(dressing, frames);
  const tmp = path.join(outRoot, `.tmp-${entry.set}`);
  fs.rmSync(tmp, { recursive: true, force: true });
  try {
    for (const { anim, file, img } of [...frames.filter((f) => !f.anim.startsWith('act_')), ...acts]) encode(img, path.join(tmp, anim, file));
    seatSet(tmp);
  } catch (err) {
    fs.rmSync(tmp, { recursive: true, force: true });
    throw err;
  }
  const final = path.join(outRoot, entry.set);
  swapIn(tmp, final);
  return final;
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  let outRoot = SPRITES;
  const ids = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out') outRoot = args[++i];
    else ids.push(args[i]);
  }
  const { entries, unknown } = selectCast(CAST, ids);
  const failed = unknown.map((id) => `${id}: not in tools/cast.mjs`);
  const built = {};
  for (const entry of entries) {
    try {
      console.log('built', await buildSet(entry, { outRoot }));
      built[entry.id] = entry.set;
    } catch (err) {
      failed.push(err.message.startsWith(`${entry.id}:`) ? err.message : `${entry.id}: ${err.message}`);
    }
  }
  if (outRoot === SPRITES && Object.keys(built).length) {
    const file = path.join(SPRITES, 'overrides.json');
    const current = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
    fs.writeFileSync(file, JSON.stringify(mergeOverrides(current, built), null, 2) + '\n');
  }
  for (const f of failed) console.error('FAILED', f);
  process.exitCode = failed.length ? 1 : 0;
}
