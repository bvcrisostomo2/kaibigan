// Optional, LOCAL-ONLY sprite sets that replace a costume's procedural sheet.
//
//   local-assets/sprites/<set>/<anim>/<NN>.png      frames (sizes may differ between anims)
//   local-assets/sprites/overrides.json             { "<costumeId>": "<set>" }
//
// local-assets/ is git-ignored: third-party art used as a stand-in must never be committed or
// deployed. The file list comes from localSpritesFiles.js, which is imported only on the dev
// server: a production build never bundles local frames, even when the folder exists. When the
// folder is absent (a fresh clone) nothing is loaded and every character keeps its shipped art.
//
// Animation folders are <kind>_<view>, kind = walk | run | idle | sit, view = front | back | left |
// right | right_front | right_back | left_front | left_back. Missing left diagonals are mirrored
// from the right ones. A solid background colour (each frame's top-left pixel) is keyed out.
// Frames of different sizes are packed into uniform cells, centred and bottom-aligned per
// animation so feet stay planted.
import * as THREE from 'three';
import { registerSheet } from './threeTextures.js';

export const VIEW_TO_DIR = {
  front: 'down',
  back: 'up',
  left: 'left',
  right: 'right',
  right_front: 'down_right',
  right_back: 'up_right',
  left_front: 'down_left',
  left_back: 'up_left',
};
const MIRROR = { down_right: 'down_left', up_right: 'up_left', right: 'left', left: 'right' };

// The local files, on the dev server only (see the header).
async function localFiles() {
  if (!import.meta.env.DEV) return { urls: {}, overrides: {} };
  const files = await import('./localSpritesFiles.js');
  return { urls: files.frameUrls, overrides: Object.values(files.overrideFiles)[0] ?? {} };
}

// { set: { folder: [url, ...sorted by file name] } } from glob paths (pure).
export function groupFrames(urlsByPath) {
  const sets = {};
  for (const [path, url] of Object.entries(urlsByPath)) {
    const m = /\/sprites\/([^/]+)\/([^/]+)\/([^/]+)\.png$/.exec(path);
    if (!m) continue;
    const [, set, folder, file] = m;
    ((sets[set] ??= {})[folder] ??= []).push({ file, url });
  }
  for (const folders of Object.values(sets)) for (const k of Object.keys(folders)) folders[k] = folders[k].sort((a, b) => a.file.localeCompare(b.file)).map((f) => f.url);
  return sets;
}

// Map folder names to animation names and add mirrored left variants (pure).
// Returns { animName: { urls: [...], mirror: boolean } }.
export function planAnimations(folders) {
  const anims = {};
  for (const [folder, urls] of Object.entries(folders)) {
    const m = /^(walk|run|idle|sit)_(.+)$/.exec(folder);
    if (!m || !VIEW_TO_DIR[m[2]]) continue;
    anims[`${m[1]}_${VIEW_TO_DIR[m[2]]}`] = { urls, mirror: false };
  }
  for (const [name, a] of Object.entries({ ...anims })) {
    const [kind, ...rest] = name.split('_');
    const target = MIRROR[rest.join('_')];
    if (target && !anims[`${kind}_${target}`]) anims[`${kind}_${target}`] = { urls: a.urls, mirror: true };
  }
  return anims;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load sprite frame ${url}`));
    img.src = url;
  });
}

// Key out the background and return { canvas, bottom } for one frame.
function keyed(img) {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height);
  const d = data.data;
  const [kr, kg, kb] = [d[0], d[1], d[2]];
  let bottom = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] === kr && d[i + 1] === kg && d[i + 2] === kb) d[i + 3] = 0;
    else if (d[i + 3] > 0) bottom = Math.max(bottom, Math.floor(i / 4 / img.width));
  }
  ctx.putImageData(data, 0, 0);
  return { canvas: c, bottom };
}

async function buildSheet(folders) {
  const plan = planAnimations(folders);
  const names = Object.keys(plan);
  if (!names.length) throw new Error('no walk_/run_/idle_ folders');
  const urls = [...new Set(names.flatMap((n) => plan[n].urls))];
  const frames = new Map();
  await Promise.all(urls.map(async (u) => frames.set(u, keyed(await loadImage(u)))));

  const cellW = Math.max(...[...frames.values()].map((f) => f.canvas.width));
  const cellH = Math.max(...[...frames.values()].map((f) => f.canvas.height)) + 4;
  const baseline = cellH - 3; // feet row in every cell
  const cols = Math.max(...names.map((n) => plan[n].urls.length));
  const rows = names.length;
  const sheet = document.createElement('canvas');
  sheet.width = cellW * cols;
  sheet.height = cellH * rows;
  const ctx = sheet.getContext('2d');
  const anims = {};
  names.forEach((name, row) => {
    const { urls: list, mirror } = plan[name];
    // One baseline per animation keeps the motion (bobbing, hops) within it intact.
    const lowest = Math.max(...list.map((u) => frames.get(u).bottom));
    anims[name] = list.map((u, col) => {
      const f = frames.get(u);
      const x = col * cellW + Math.round((cellW - f.canvas.width) / 2);
      const y = row * cellH + (baseline - lowest);
      if (mirror) {
        ctx.save();
        ctx.translate(x + f.canvas.width, y);
        ctx.scale(-1, 1);
        ctx.drawImage(f.canvas, 0, 0);
        ctx.restore();
      } else ctx.drawImage(f.canvas, x, y);
      return { col, row };
    });
  });
  const texture = new THREE.CanvasTexture(sheet);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  return { texture, cellW, cellH, cols, rows, footMargin: cellH - 1 - baseline, anims };
}

// Load every override listed in overrides.json. Resolves to the costume ids replaced.
// Never rejects: a broken local set is reported and the procedural sheet is kept.
export async function loadLocalSprites(options = {}) {
  const { urls, overrides } = options.urls && options.overrides ? options : { ...(await localFiles()), ...options };
  const sets = groupFrames(urls);
  const replaced = [];
  for (const [costumeId, set] of Object.entries(overrides)) {
    if (!sets[set]) {
      console.warn(`[local sprites] set '${set}' for '${costumeId}' not found in local-assets/sprites`);
      continue;
    }
    try {
      registerSheet(costumeId, await buildSheet(sets[set]));
      replaced.push(costumeId);
    } catch (err) {
      console.warn(`[local sprites] could not build '${set}':`, err);
    }
  }
  return replaced;
}
