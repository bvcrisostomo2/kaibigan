// The game boot (spec §5): engine + story + UI for any chapter content.
//   startGame(container, { level, cast, chapter, glossary, notes, hints, letter })
// Title → letter or code → play → Quit or chapter end → title. main.js passes Chapter 1; the dev
// modes pass the Plan 3 demo. Cast members stand at their homeSpot (or wait offstage, hidden,
// when it is null); the level's examinables are Talk targets like people.
import * as THREE from 'three';
import '../ui/ui.css';
import { createRenderer, WebGLUnavailableError } from '../engine/renderer.js';
import { createFollowCamera, CAMERA_DEFAULTS } from '../engine/camera.js';
import { createInput, bindKeyboard } from '../engine/input.js';
import { buildWorld, animateWorld } from '../engine/world.js';
import { createActor, dirFromVector, WALK_SPEED, RUN_SPEED, TURN_SECONDS } from '../engine/actors.js';
import { createLighting } from '../engine/lighting.js';
import { createParticles } from '../engine/particles.js';
import { createStage } from '../engine/stage.js';
import { createFader } from '../engine/fader.js';
import { createAudio, LAYERS } from '../engine/audio.js';
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
import { composeHost, routePresses } from '../ui/host.js';
import { loadSettings, saveSettings, adjustSetting } from '../ui/settings.js';
import { markersFor, talkTarget } from '../ui/markers.js';
import { t } from '../ui/strings.js';
import { spawnPoint, ambienceFor, inPlay, placePlayer } from './rules.js';

const LOOK_RANGE = 3; // characters turn to face the player this close
const MARKER_HEIGHT = 1.9; // world units above a person's feet for "!" / "…"
const EXAMINE_HEIGHT = 1.2; // above an examinable's spot

export async function startGame(container, content) {
  const { level, cast, chapter, glossary, notes, hints, letter } = content;
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
  const world = buildWorld(level);
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
  const npcs = cast.map((c) => {
    const home = c.homeSpot ? world.spots[c.homeSpot].clone() : world.spawn.clone();
    const a = createActor({ id: c.id, costume: c.costume, position: home.clone(), dir: c.dir ?? 'down', turnSeconds: TURN_SECONDS });
    a.object.visible = c.homeSpot != null;
    scene.add(a.object);
    actors.set(c.id, a);
    return { id: c.id, actor: a, home, dir: c.dir ?? 'down', onstage: c.homeSpot != null };
  });
  const examinables = (level.examinables ?? []).map((e) => ({ id: e.id, at: world.spots[e.spot] }));
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

  // ---- Audio: volume, mute and ambience by place and time (spec §4.4) --------------------------
  let ambienceKey = null;
  function applyAudio() {
    audio.setVolume(settings.volume);
    if (audio.muted !== settings.muted) audio.toggleMute();
  }
  function applyAmbience(zone, time) {
    const key = `${zone}|${time}`;
    if (key === ambienceKey || !audio.unlocked) return;
    ambienceKey = key;
    const levels = ambienceFor(zone, time, level.indoorZones ?? []);
    for (const name of LAYERS) audio.setLayer(name, levels[name] ?? 0);
  }
  applyAudio();
  const unlockAudio = () => {
    audio.unlock();
    ambienceKey = null;
  };
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });

  // ---- Game sessions --------------------------------------------------------------------------
  let game = null; // { ctx, codes, ui, director, zone, offSave }
  const fps = createFpsMonitor(); // spec §7: suggest Low after 5 s under 30 fps on High

  // A failed dialogue or cutscene: log it, fade back in (it may have faded out) and play on.
  function reportError(err) {
    console.error('[game]', err);
    fader.fadeIn(0);
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
      fps.reset();
    }
  }

  // Back to the title's street at dusk: nothing from the last session carries over.
  function resetScene() {
    stage.cancel();
    lighting.setTime('dusk');
    player.object.position.copy(world.spawn);
    player.object.visible = true;
    player.stand();
    player.setMotion(0, 0);
    player.emote(null);
    for (const n of npcs) {
      n.actor.stand();
      n.actor.object.position.copy(n.home);
      n.actor.object.visible = n.onstage;
      n.actor.setMotion(0, 0);
      n.actor.face(n.dir);
      n.actor.emote(null);
    }
    cam.setDistance(CAMERA_DEFAULTS.distance);
    cam.follow(player.object, { snap: true });
    fader.fadeIn(0);
  }

  function onAction(action) {
    if (action === 'resetPosition') {
      placePlayer(player, spawnPoint(chapter, game?.director.beat, world.spots, world.spawn));
      cam.follow(player.object, { snap: true });
    } else if (action === 'quit') {
      endGame();
      showTitle();
    }
  }

  function startGame({ state, beatId }) {
    const bus = createBus({ onError: reportError });
    const ctx = { state, bus, hints };
    const codes = trackCheckpointCodes(ctx); // before the UI, so the Kodigo panel gets the fresh code
    const offSave = bus.on('beat:enter', () => storage && saveGame(storage, state));
    const ui = createGameUi({
      views, ctx, codes, settings,
      content: { chapter, cast, glossary, notes, hints },
      emote: (id, face) => actors.get(id)?.emote(face),
      onSettings: applySettings,
      onAction,
    });
    const director = createDirector({ chapter, ctx, host: composeHost({ stage, ui, cutscenes: chapter.cutscenes }) });
    dressPlayer(state.title === 'Doña' ? 'player_dona' : 'player_don');
    input.clear();
    game = { ctx, codes, ui, director, zone: null, offSave };
    fader.fadeOut(0);
    fader.fadeIn(1);
    director.start(beatId).catch(reportError);
  }

  function endGame() {
    if (!game) return;
    game.ui.dispose(); // from now on the old director's host never settles (host.js)
    game.codes.stop();
    game.offSave();
    stage.cancel();
    game = null;
  }

  function showTitle() {
    resetScene();
    runFrontScreens({ views, storage, chapters: [chapter], hints, letter })
      .then(startGame)
      .catch(reportError);
  }

  // ---- Frame loop -----------------------------------------------------------------------------
  const sameFloor = (a) => Math.abs(a.position.y - player.position.y) < 1;
  // Everyone and everything Talk or a marker can point at, with world positions.
  function targets() {
    return [
      ...npcs.filter((n) => n.actor.object.visible).map((n) => ({ id: n.id, x: n.actor.position.x, y: n.actor.position.y, z: n.actor.position.z, height: MARKER_HEIGHT })),
      ...examinables.map((e) => ({ id: e.id, x: e.at.x, y: e.at.y, z: e.at.z, height: EXAMINE_HEIGHT })),
    ];
  }

  function screenMarkers(list) {
    const shown = markersFor(list, player.position, {
      dialogueFor: (id) => game.director.interactionFor(id),
      seen: (d) => hasFlag(game.ctx.state, seenFlag(d)),
    });
    const { width, height } = container.getBoundingClientRect();
    return shown.map((m) => {
      const tg = list.find((x) => x.id === m.id);
      const p = new THREE.Vector3(tg.x, tg.y + tg.height, tg.z).project(cam.camera);
      return { ...m, x: Math.round(((p.x + 1) / 2) * width), y: Math.round(((1 - p.y) / 2) * height) };
    });
  }

  window.addEventListener('resize', () => cam.resize(view.resize().width / view.resize().height));
  container.addEventListener('wheel', (e) => {
    if (e.target.closest?.('.ui-page, .ui-letter, .ui-code')) return;
    cam.zoomBy(Math.sign(e.deltaY) * 1.2);
    e.preventDefault();
  }, { passive: false });

  let last = performance.now();
  let time = 0;
  function frame(now = performance.now()) {
    const dt = frameDt(now, last);
    last = now;
    time += dt;

    const presses = input.consumePressed();
    // On the front screens only M does anything; in play, a press can quit to the title, so
    // routePresses stops as soon as the session ends.
    if (!game) {
      if (presses.includes('mute')) applySettings(adjustSetting(settings, 'mute', 1));
    } else {
      routePresses(presses, () => game, () => {
        if (game.director.busy) return;
        const target = talkTarget(targets(), player.position, new Set(game.director.availableInteractions()));
        if (target) game.director.interact(target).catch(reportError);
      });
    }

    const playing = inPlay(game);
    const m = playing ? input.move() : { x: 0, z: 0, run: false };
    // A seated player who moves first steps clear of the chair.
    if (player.seated && (m.x || m.z)) stage.run(['stand', 'player']);
    const speed = (m.run ? RUN_SPEED : WALK_SPEED) * dt;
    const next = world.collision.move(player.object.position, m.x * speed, m.z * speed);
    player.object.position.set(next.x, next.y, next.z);
    player.setMotion(m.x, m.z, m.run);
    touch?.setVisible(game != null);
    touch?.setPlaying(playing);

    const zone = world.collision.zonesAt(player.position.x, player.position.z, player.position.y)[0] ?? null;
    // Dollhouse cutaway: downstairs inside, hide the storey above (and the people up there).
    const cut = world.cutaway != null && world.cutaway.zones.includes(zone);
    world.upper.visible = !cut;
    for (const n of npcs) {
      const hide = cut && n.actor.position.y >= world.cutaway.y - 0.01;
      for (const child of n.actor.object.children) child.visible = !hide;
    }
    if (game) {
      if (zone !== game.zone) {
        game.zone = zone;
        game.director.setZone(zone).catch(reportError);
      }
      if (playing) game.director.update(dt).catch(reportError);
      game.ui.update(dt);
      game.ui.setMarkers(screenMarkers(targets()));
      if (fps.sample(dt) && settings.quality === 'high') game.ui.notify(t('toast.lowFps'));
    }
    applyAmbience(zone, game?.ui.time ?? 'dusk');
    stage.update(dt);

    for (const n of npcs) {
      const a = n.actor;
      if (!a.object.visible || a.seated) continue; // diners keep facing the table
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
    particles.update(dt, player.position, preset, { outdoors: !(level.indoorZones ?? []).includes(zone) });
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
