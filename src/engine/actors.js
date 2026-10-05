// Billboard sprite actors (spec §4.1): a lit, alpha-tested quad that always faces the camera
// (rotating around Y only), animated from a costume's sprite sheet, with a soft blob shadow.
import * as THREE from 'three';
import { sheetFor } from '../art/threeTextures.js';
import { EXPRESSIONS, GESTURES } from '../art/characters.js';

export const PX_PER_UNIT = 40; // character pixels per world unit → 48×64 sprite = 1.2 × 1.6 units
export const WALK_FPS = 8;
export const RUN_FPS = 12;
export const IDLE_SECONDS = 0.8;
export const WALK_SPEED = 2.2; // units per second
export const RUN_SPEED = 3.8;
export const TURN_SECONDS = 0.08; // per 45° step, for actors that turn gradually

// 8-way facing. The camera looks north (−z), so +z is 'down'.
export const DIRECTIONS = ['right', 'down_right', 'down', 'down_left', 'left', 'up_left', 'up', 'up_right'];

// Screen-relative 8-way facing for a movement vector.
export function dirFromVector(dx, dz, previous = 'down') {
  if (Math.abs(dx) < 1e-6 && Math.abs(dz) < 1e-6) return previous;
  const sector = Math.round(Math.atan2(dz, dx) / (Math.PI / 4));
  return DIRECTIONS[(sector + 8) % 8];
}

// The 4-way side of a direction: diagonals fall back to the 3/4 side views.
export function sheetDir(dir) {
  if (dir.endsWith('_left')) return 'left';
  if (dir.endsWith('_right')) return 'right';
  return dir;
}

// Animation names to try, best first, for a state (pure). Sheets without diagonal or run art
// fall back to what they have: walk diagonals use run diagonals, then the nearest view — the
// back view for up-diagonals (side views in these sheets are front three-quarter), else the side.
export function animCandidates({ mode, dir, expression = null, gesture = null }) {
  if (gesture) return [`gesture_${gesture}`, 'idle_down'];
  if (expression) return [`expression_${expression}`, 'idle_down'];
  const side = sheetDir(dir);
  const away = dir.startsWith('up_');
  if (mode === 'idle') return [`idle_${dir}`, ...(away ? ['idle_up'] : []), `idle_${side}`, 'idle_down'];
  if (mode === 'run') return [`run_${dir}`, `walk_${dir}`, ...(away ? ['run_up', 'walk_up'] : []), `run_${side}`, `walk_${side}`, 'walk_down'];
  return [`walk_${dir}`, `run_${dir}`, ...(away ? ['walk_up'] : []), `walk_${side}`, 'walk_down'];
}

// One 45° step from `current` toward `target`, the short way round (pure).
export function turnToward(current, target) {
  const a = DIRECTIONS.indexOf(current);
  const b = DIRECTIONS.indexOf(target);
  if (a < 0 || b < 0) throw new Error(`Bad direction '${a < 0 ? current : target}'`);
  const diff = (b - a + 8) % 8;
  if (diff === 0) return current;
  return DIRECTIONS[(a + (diff <= 4 ? 1 : 7)) % 8];
}

export function pickAnim(anims, candidates) {
  for (const name of candidates) if (anims[name]?.length) return anims[name];
  throw new Error(`No animation among ${candidates.join(', ')}`);
}

// texture.offset / texture.repeat for a cell in a cols × rows sheet (row 0 = top of the image).
export function cellUV({ col, row }, cols, rows) {
  return { offsetX: col / cols, offsetY: (rows - 1 - row) / rows, repeatX: 1 / cols, repeatY: 1 / rows };
}

// Pure animation clock: which frame index to show after `time` seconds in a mode.
export function animFrame(mode, time) {
  if (mode === 'walk') return Math.floor(time * WALK_FPS);
  if (mode === 'run') return Math.floor(time * RUN_FPS);
  return Math.floor(time / IDLE_SECONDS);
}

let blobTexture = null;
function blob() {
  if (blobTexture) return blobTexture;
  const size = 32;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot((x - 15.5) / 15.5, (y - 15.5) / 15.5);
      const a = Math.max(0, 1 - d) ** 1.5;
      data.set([0, 0, 0, Math.round(a * 150)], (y * size + x) * 4);
    }
  }
  blobTexture = new THREE.DataTexture(data, size, size);
  blobTexture.needsUpdate = true;
  return blobTexture;
}

// turnSeconds > 0 turns through each in-between facing instead of snapping.
export function createActor({ id, costume, position = new THREE.Vector3(), dir = 'down', turnSeconds = 0 }) {
  const sheet = sheetFor(costume);
  const tex = sheet.texture.clone();
  tex.needsUpdate = true;
  const w = sheet.cellW / PX_PER_UNIT;
  const h = sheet.cellH / PX_PER_UNIT;
  const geo = new THREE.PlaneGeometry(w, h);
  geo.translate(0, h / 2 - sheet.footMargin / PX_PER_UNIT, 0); // feet at the origin
  const mat = new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide });
  const sprite = new THREE.Mesh(geo, mat);
  sprite.castShadow = true;
  sprite.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), new THREE.MeshBasicMaterial({ map: blob(), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;

  const object = new THREE.Group();
  object.add(sprite, shadow);
  object.position.copy(position);
  object.userData.actorId = id;

  const state = { dir, target: dir, turnClock: 0, mode: 'idle', time: 0, expression: null, gesture: null };
  function turnTo(d) {
    state.target = d;
    if (!turnSeconds) state.dir = d;
  }

  function applyCell() {
    const frames = pickAnim(sheet.anims, animCandidates(state));
    const i = animFrame(state.mode, state.time);
    const cell = frames[Number.isFinite(i) ? ((i % frames.length) + frames.length) % frames.length : 0];
    const uv = cellUV(cell, sheet.cols, sheet.rows);
    tex.offset.set(uv.offsetX, uv.offsetY);
    tex.repeat.set(uv.repeatX, uv.repeatY);
  }
  applyCell();

  const actor = {
    id,
    costume,
    object,
    sprite,
    get dir() { return state.dir; },
    get facing() { return state.target; },
    get mode() { return state.mode; },
    get position() { return object.position; },
    // Movement this frame decides walk/run/idle and facing.
    setMotion(dx, dz, run = false) {
      const moving = Math.abs(dx) > 1e-6 || Math.abs(dz) > 1e-6;
      const mode = moving ? (run ? 'run' : 'walk') : 'idle';
      if (mode !== state.mode) state.time = 0;
      state.mode = mode;
      turnTo(dirFromVector(dx, dz, state.target));
      if (moving) {
        state.expression = null;
        state.gesture = null;
      }
    },
    face(dir) {
      if (!DIRECTIONS.includes(dir)) throw new Error(`Bad direction '${dir}'`);
      turnTo(dir);
      state.expression = null;
      state.gesture = null;
    },
    // Show an expression ('smile', ...) or gesture ('bow', 'point', 'fan'); null returns to idle.
    emote(name) {
      state.expression = null;
      state.gesture = null;
      if (name == null) return;
      if (GESTURES.includes(name)) state.gesture = name;
      else if (EXPRESSIONS.includes(name)) state.expression = name;
      else throw new Error(`Unknown expression or gesture '${name}'`);
    },
    update(dt, camera) {
      if (Number.isFinite(dt)) state.time += dt;
      if (state.dir !== state.target) {
        state.turnClock += Number.isFinite(dt) ? dt : 0;
        while (state.dir !== state.target && state.turnClock >= turnSeconds) {
          state.turnClock -= turnSeconds;
          state.dir = turnToward(state.dir, state.target);
        }
      } else state.turnClock = 0;
      applyCell();
      // Cylindrical billboard: face the camera around Y only.
      sprite.rotation.y = Math.atan2(camera.position.x - object.position.x, camera.position.z - object.position.z);
    },
  };
  return actor;
}
