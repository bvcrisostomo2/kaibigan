// Plan 3 boot: the sandbox scene driven by the story core and the UI, playing the throwaway demo
// chapter (spec §5.1): title → letter or code → play → chapter-end card → title. Plan 4 replaces
// this with the real game boot. main.js opens the Plan 2 engine sandbox instead with ?engine.
import * as THREE from 'three';
import '../ui/ui.css';
import { createRenderer, WebGLUnavailableError } from '../engine/renderer.js';
import { createFollowCamera } from '../engine/camera.js';
import { createInput, bindKeyboard } from '../engine/input.js';
import { buildWorld, animateWorld } from '../engine/world.js';
import { createActor, dirFromVector, WALK_SPEED, RUN_SPEED, TURN_SECONDS } from '../engine/actors.js';
import { createLighting } from '../engine/lighting.js';
import { createParticles } from '../engine/particles.js';
import { createStage } from '../engine/stage.js';
import { createFader } from '../engine/fader.js';
import { createAudio } from '../engine/audio.js';
import { defaultQuality, detectDevice, createFpsMonitor, frameDt, QUALITY } from '../engine/quality.js';
import { loadLocalSprites } from '../art/localSprites.js';
import { loadLocalPortraits } from '../art/localPortraits.js';
import { createBus } from '../story/events.js';
import { createDirector } from '../story/director.js';
import { seenFlag } from '../story/dialogue.js';
import { hasFlag } from '../story/state.js';
import { browserStorage, saveGame } from '../story/save.js';
import { trackCheckpointCodes } from '../story/saveCode.js';
import { h } from '../ui/dom.js';
import { createDomViews } from '../ui/views/index.js';
import { createTouchView, createBannerView } from '../ui/views/touchView.js';
import { runFrontScreens } from '../ui/frontScreens.js';
import { createGameUi } from '../ui/gameUi.js';
import { composeHost } from '../ui/host.js';
import { loadSettings, saveSettings } from '../ui/settings.js';
import { markersFor } from '../ui/markers.js';
import { t } from '../ui/strings.js';
import { sandboxLevel, sandboxCast } from './sandboxLevel.js';
import { demoChapter, demoCast, demoGlossary, demoNotes, demoHints, demoLetter } from './demoChapter.js';

const TALK_RANGE = 1.8; // Talk reaches the nearest character this close
const LOOK_RANGE = 3; // characters turn to face the player this close
const MARKER_HEIGHT = 1.9; // world units above an actor's feet for its "!" / "…"
const CONTENT = { chapter: demoChapter, cast: demoCast, glossary: demoGlossary, notes: demoNotes, hints: demoHints };

export async function startSandboxGame(container) {
  const [sprites, portraits] = await Promise.all([loadLocalSprites(), loadLocalPortraits()]);
  if (sprites.length || portraits.length) console.info('[game] local art:', [...sprites, ...portraits].join(', '));
  const device = detectDevice();
  const storage = browserStorage();
  let settings = loadSettings(storage, defaultQuality(device));
  let view;
  try {
    view = createRenderer(container, settings.quality);
  } catch (err) {
    if (err instanceof WebGLUnavailableError) {
      container.replaceChildren(h('p', { class: 'fatal' }, t('fatal.webgl')));
      return null;
    }
    throw err;
  }

  // ---- Scene ----------------------------------------------------------------------------------
  const scene = new THREE.Scene();
  const world = buildWorld(sandboxLevel);
  scene.add(world.group);
  const q = QUALITY[settings.quality];
  const lighting = createLighting(scene, { shadows: true, shadowMapSize: 2048, pointLights: q.pointLights });
  lighting.setSources(world.lightSources);
  const particles = createParticles(scene, { count: q.particles });
  const size = view.resize();
  const cam = createFollowCamera(size.width / size.height);

  let player = createActor({ id: 'player', costume: 'player_don', position: world.spawn.clone() });
  scene.add(player.object);
  const actors = new Map([['player', player]]);
  // Don or Doña: the player's sheet is fixed per actor, so a new title means a new actor.
  function dressPlayer(costume) {
    if (player.costume === costume) return;
    scene.remove(player.object);
    player = createActor({ id: 'player', costume, position: player.position.clone() });
    scene.add(player.object);
    actors.set('player', player);
    cam.follow(player.object, { snap: true });
  }
  const npcs = sandboxCast.map((c) => {
    const [x, z, y] = c.at;
    const home = new THREE.Vector3(x, y ?? world.collision.heightAt(x, z, 0) ?? 0, z);
    const a = createActor({ id: c.id, costume: c.costume, position: home.clone(), dir: c.dir, turnSeconds: TURN_SECONDS });
    scene.add(a.object);
    actors.set(c.id, a);
    return { id: c.id, actor: a, home, dir: c.dir };
  });
  cam.follow(player.object, { snap: true });

  const fader = createFader(container);
  const audio = createAudio();
  const stage = createStage({ world, actors, camera: cam, lighting, audio, fader });

  // ---- UI -------------------------------------------------------------------------------------
  const uiRoot = h('div', { class: 'ui' });
  container.append(uiRoot);
  const views = createDomViews(uiRoot);
  const banner = createBannerView(uiRoot);
  const input = createInput();
  bindKeyboard(input);
  const touch = device.coarsePointer
    ? createTouchView(uiRoot, {
      labels: { talk: t('touch.talk'), journal: t('touch.journal'), menu: t('touch.menu') },
      onMove: (x, z) => input.setVirtualMove(x, z),
      onPress: (button) => input.press(button),
    })
    : null;

  function applyAudio() {
    audio.setVolume(settings.volume);
    if (audio.muted !== settings.muted) audio.toggleMute();
  }
  applyAudio();
  const unlockAudio = () => {
    audio.unlock();
    audio.setLayer('music', 0.35);
    audio.setLayer('crickets', 0.2);
  };
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });

  // ---- Game sessions --------------------------------------------------------------------------
  let game = null; // { ctx, codes, ui, director, zone }

  function reportError(err) {
    console.error('[game]', err);
    if (import.meta.env.DEV) banner.show(t('error.banner', { message: err?.message ?? String(err) }));
  }

  function applySettings(next) {
    const qualityChanged = next.quality !== settings.quality;
    settings = next;
    saveSettings(storage, settings);
    applyAudio();
    if (qualityChanged) {
      view.setQuality(settings.quality);
      cam.resize(view.resize().width / view.resize().height);
    }
  }

  function resetScene() {
    player.object.position.copy(world.spawn);
    player.setMotion(0, 0);
    for (const n of npcs) {
      n.actor.object.position.copy(n.home);
      n.actor.face(n.dir);
      n.actor.emote(null);
    }
    cam.follow(player.object, { snap: true });
  }

  function onAction(action) {
    if (action === 'resetPosition') {
      player.object.position.copy(world.spawn);
      cam.follow(player.object, { snap: true });
    } else if (action === 'quit') {
      endGame();
      showTitle();
    }
  }

  function startGame({ state, beatId }) {
    const bus = createBus({ onError: reportError });
    const ctx = { state, bus, hints: demoHints };
    const codes = trackCheckpointCodes(ctx); // before the UI, so the Kodigo panel gets the fresh code
    bus.on('beat:enter', () => storage && saveGame(storage, state));
    const ui = createGameUi({
      views, ctx, codes, settings, content: CONTENT,
      emote: (id, face) => actors.get(id)?.emote(face),
      onSettings: applySettings,
      onAction,
    });
    const director = createDirector({ chapter: demoChapter, ctx, host: composeHost({ stage, ui }) });
    dressPlayer(state.title === 'Doña' ? 'player_dona' : 'player_don');
    input.clear();
    game = { ctx, codes, ui, director, zone: null };
    fader.fadeOut(0);
    fader.fadeIn(1);
    director.start(beatId).catch(reportError);
  }

  function endGame() {
    if (!game) return;
    game.ui.dispose();
    game.codes.stop();
    game = null;
  }

  function showTitle() {
    resetScene();
    runFrontScreens({ views, storage, chapters: [demoChapter], hints: demoHints, letter: demoLetter })
      .then(startGame)
      .catch(reportError);
  }

  // ---- Frame loop -----------------------------------------------------------------------------
  const sameFloor = (a) => Math.abs(a.position.y - player.position.y) < 1;
  function nearestTalkable() {
    const open = new Set(game.director.availableInteractions());
    return npcs
      .filter((n) => open.has(n.id) && sameFloor(n.actor))
      .map((n) => ({ n, d: n.actor.position.distanceTo(player.position) }))
      .filter((e) => e.d < TALK_RANGE)
      .sort((a, b) => a.d - b.d)[0]?.n.id ?? null;
  }

  function screenMarkers() {
    const list = markersFor(npcs.map((n) => ({ id: n.id, x: n.actor.position.x, y: n.actor.position.y, z: n.actor.position.z })), player.position, {
      dialogueFor: (id) => game.director.interactionFor(id),
      seen: (d) => hasFlag(game.ctx.state, seenFlag(d)),
    });
    const { width, height } = container.getBoundingClientRect();
    return list.map((m) => {
      const p = actors.get(m.id).position.clone();
      p.y += MARKER_HEIGHT;
      p.project(cam.camera);
      return { ...m, x: ((p.x + 1) / 2) * width, y: ((1 - p.y) / 2) * height };
    });
  }

  window.addEventListener('resize', () => cam.resize(view.resize().width / view.resize().height));
  container.addEventListener('wheel', (e) => {
    if (e.target.closest?.('.ui-page, .ui-letter, .ui-code')) return;
    cam.zoomBy(Math.sign(e.deltaY) * 1.2);
    e.preventDefault();
  }, { passive: false });

  const fps = createFpsMonitor(); // spec §7: suggest Low after 5 s under 30 fps on High
  let last = performance.now();
  let time = 0;
  function frame(now = performance.now()) {
    const dt = frameDt(now, last);
    last = now;
    time += dt;

    const presses = input.consumePressed();
    if (game) {
      for (const p of presses) {
        if (game.ui.command(p)) continue;
        if (p === 'interact' && !game.director.busy) {
          const target = nearestTalkable();
          if (target) game.director.interact(target).catch(reportError);
        }
      }
    }

    const playing = game != null && !game.ui.isBlocking;
    const m = playing ? input.move() : { x: 0, z: 0, run: false };
    const speed = (m.run ? RUN_SPEED : WALK_SPEED) * dt;
    const next = world.collision.move(player.object.position, m.x * speed, m.z * speed);
    player.object.position.set(next.x, next.y, next.z);
    player.setMotion(m.x, m.z, m.run);
    touch?.setPlaying(playing);

    const zones = world.collision.zonesAt(player.position.x, player.position.z, player.position.y);
    if (game) {
      const zone = zones[0] ?? null;
      if (zone !== game.zone) {
        game.zone = zone;
        game.director.setZone(zone).catch(reportError);
      }
      if (playing) game.director.update(dt).catch(reportError);
      game.ui.update(dt);
      game.ui.setMarkers(screenMarkers());
      if (fps.sample(dt) && settings.quality === 'high') game.ui.notify(t('toast.lowFps'));
    }
    stage.update(dt);

    for (const n of npcs) {
      const a = n.actor;
      const dx = player.position.x - a.position.x;
      const dz = player.position.z - a.position.z;
      const close = Math.hypot(dx, dz) < LOOK_RANGE && sameFloor(a);
      const want = close ? dirFromVector(dx, dz, a.facing) : n.dir;
      if (want !== a.facing) a.face(want);
    }

    cam.update(dt);
    lighting.update(dt, player.position);
    const preset = lighting.preset;
    view.setGrade(preset.grade);
    for (const mat of world.windowMaterials) mat.emissiveIntensity = preset.windows * 0.9;
    particles.update(dt, player.position, preset, { outdoors: zones.includes('calle') });
    animateWorld(world, time);
    for (const a of actors.values()) a.update(dt, cam.camera);
    cam.updateOccluders(world.occluders, player.position, dt);
    view.render(scene, cam.camera);
    requestAnimationFrame(frame);
  }

  showTitle();
  requestAnimationFrame(frame);
  return {
    scene, world, cam, lighting, view, stage,
    get player() {
      return player;
    },
    get game() {
      return game;
    },
  };
}
