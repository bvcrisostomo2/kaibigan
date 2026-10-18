// Extracts the Suikoden Star Leap character packs (the overworld and NPC zips) into .packs/
// (git-ignored), one folder per pack, and finds a pack's Overworld folder for the build tools.
// Only finished sets are committed, never these packs.
//
// Usage: node tools/unpack.mjs <zipDir>   e.g. node tools/unpack.mjs "D:\repos\Suikoden Starleap"
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const PACKS = '.packs';
// Windows' own tar (bsdtar) reads zips; Git Bash's GNU tar doesn't.
const TAR = process.platform === 'win32' ? 'C:\\Windows\\System32\\tar.exe' : 'tar';

// Character packs only: the "(Battle)" zips would land on top of the overworld ones.
export const isPackZip = (name) => /\.zip$/i.test(name) && /\(Overworld\)|NPCs/.test(name);

// The Overworld folder of a pack: <root>/<pack>/<anything>/Overworld.
export function overworldDir(root, pack) {
  const dir = path.join(root, pack);
  if (!fs.existsSync(dir)) throw new Error(`Pack '${pack}' not found in ${root}: run node tools/unpack.mjs "<zipDir>" first`);
  for (const sub of fs.readdirSync(dir).sort()) {
    const ow = path.join(dir, sub, 'Overworld');
    if (fs.existsSync(ow)) return ow;
  }
  throw new Error(`Pack '${pack}' has no Overworld folder`);
}

function tar(args) {
  const r = spawnSync(TAR, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error((r.stderr || `tar exited with ${r.status}`).trim());
  return r.stdout;
}

// The pack's folder name: the first path segment inside the zip (e.g. 'male01').
const packName = (zip) => tar(['-tf', zip]).split(/\r?\n/)[0].split('/')[0];

export function unpack(zipDir, root = PACKS) {
  fs.mkdirSync(root, { recursive: true });
  const done = [], skipped = [], failed = [];
  for (const name of fs.readdirSync(zipDir).filter(isPackZip).sort()) {
    const zip = path.join(zipDir, name);
    try {
      const pack = packName(zip);
      if (fs.existsSync(path.join(root, pack))) {
        skipped.push(pack);
        continue;
      }
      tar(['-xf', zip, '-C', root]);
      done.push(pack);
    } catch (err) {
      failed.push(`${name}: ${err.message}`);
    }
  }
  return { done, skipped, failed };
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [zipDir] = process.argv.slice(2);
  if (!zipDir) {
    console.error('usage: node tools/unpack.mjs <zipDir>');
    process.exit(2);
  }
  const { done, skipped, failed } = unpack(zipDir);
  console.log(`unpacked ${done.length}, already there ${skipped.length}`);
  for (const f of failed) console.error('FAILED', f);
  process.exitCode = failed.length ? 1 : 0;
}
