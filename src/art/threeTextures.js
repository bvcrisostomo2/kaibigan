// three.js adapters for the generated art: cached DataTextures with crisp (nearest) filtering,
// and the sprite-sheet registry. A costume's sheet comes from, best first (spec §4.1):
//   1. a registered override (a git-ignored local sprite set, see localSprites.js)
//   2. a hand-authored character (art/cast/)
//   3. the procedural painter (art/characters.js)
import * as THREE from 'three';
import { drawTexture } from './textures.js';
import { drawCharacterSheet, drawPortrait, sheetAnims, CELL_W, CELL_H, SHEET_COLS, SHEET_ROWS } from './characters.js';
import { COSTUMES } from './costumes.js';
import { drawHandmadeSheet } from './handmade.js';
import { HANDMADE } from './cast/index.js';

export function toTexture(pixels, { repeat = false } = {}) {
  const tex = new THREE.DataTexture(pixels.toTextureData(), pixels.width, pixels.height, THREE.RGBAFormat);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

const tiles = new Map();
const overrides = new Map(); // costumeId → registered sheet
const built = new Map(); // costumeId → hand-authored or procedural sheet, built on first use

// Shared tile texture (repeat-wrapped). Callers that need their own repeat must clone().
export function tileTexture(name) {
  if (!tiles.has(name)) tiles.set(name, toTexture(drawTexture(name), { repeat: true }));
  return tiles.get(name);
}

// Replace a costume's sheet. meta = { texture, cellW, cellH, cols, rows, footMargin, anims }.
export function registerSheet(costumeId, meta) {
  overrides.set(costumeId, meta);
}

// Forget registered overrides (tests, and reloading local sets).
export function clearRegisteredSheets() {
  overrides.clear();
}

// Which art a costume uses: 'override' | 'handmade' | 'procedural'. Throws for unknown ids.
export function sheetSource(costumeId) {
  if (overrides.has(costumeId)) return 'override';
  if (HANDMADE[costumeId]) return 'handmade';
  if (COSTUMES[costumeId]) return 'procedural';
  throw new Error(`Unknown costume '${costumeId}'`);
}

// A costume's sprite sheet and its cell metrics. Actors clone() the texture so each can show
// its own frame. footMargin = empty pixel rows below the feet in a cell; anims maps animation
// names (walk_down, run_up_left, idle_down_right, expression_smile, ...) to cells.
export function sheetFor(costumeId) {
  const source = sheetSource(costumeId);
  if (source === 'override') return overrides.get(costumeId);
  if (!built.has(costumeId)) {
    if (source === 'handmade') {
      const s = drawHandmadeSheet(HANDMADE[costumeId]);
      built.set(costumeId, { texture: toTexture(s.pixels), cellW: CELL_W, cellH: CELL_H, cols: s.cols, rows: s.rows, footMargin: s.footMargin, anims: s.anims });
    } else {
      built.set(costumeId, { texture: toTexture(drawCharacterSheet(COSTUMES[costumeId])), cellW: CELL_W, cellH: CELL_H, cols: SHEET_COLS, rows: SHEET_ROWS, footMargin: 2, anims: sheetAnims() });
    }
  }
  return built.get(costumeId);
}

export function sheetTexture(costumeId) {
  return sheetFor(costumeId).texture;
}

export function portraitPixels(costumeId, expression = 'neutral') {
  const costume = COSTUMES[costumeId];
  if (!costume) throw new Error(`Unknown costume '${costumeId}'`);
  return drawPortrait(costume, expression);
}
