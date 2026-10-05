// Plan 2 sandbox: walk around a test street and bahay na bato to check the engine and art.
// Keys: WASD/arrows move · Shift run · Space/E make a nearby character emote · T time of day
// · G graphics Low/High · wheel zoom. Replaced by the real game boot in Plan 4.
import * as THREE from 'three';
import { createRenderer, WebGLUnavailableError } from '../engine/renderer.js';
import { createFollowCamera } from '../engine/camera.js';
import { createInput, bindKeyboard } from '../engine/input.js';
import { buildWorld, animateWorld } from '../engine/world.js';
import { createActor, dirFromVector, WALK_SPEED, RUN_SPEED, TURN_SECONDS } from '../engine/actors.js';
import { createFollower, followStep, startFollowing } from '../engine/follow.js';
import { createLighting, TIME_ORDER } from '../engine/lighting.js';
import { createParticles } from '../engine/particles.js';
import { defaultQuality, detectDevice, createFpsMonitor, frameDt, QUALITY } from '../engine/quality.js';
import { sandboxLevel, sandboxCast } from './sandboxLevel.js';
import { loadLocalSprites } from '../art/localSprites.js';

const EMOTES = [null, 'smile', 'frown', 'shock', 'angry', 'bow', 'point', 'fan'];

export async function startSandbox(container) {
  const replaced = await loadLocalSprites();
  if (replaced.length) console.info('[sandbox] local sprites for', replaced.join(', '));
  let qualityName = defaultQuality(detectDevice());
  let view;
  try {
    view = createRenderer(container, qualityName);
  } catch (err) {
    if (err instanceof WebGLUnavailableError) {
      container.innerHTML = '<p class="fatal">Sorry — this browser can\'t run the game (WebGL is unavailable). Try a recent Chrome, Edge, Firefox or Safari.</p>';
      return null;
    }
    throw err;
  }

  const scene = new THREE.Scene();
  const world = buildWorld(sandboxLevel);
  scene.add(world.group);

  const q = QUALITY[qualityName];
  const lighting = createLighting(scene, { shadows: true, shadowMapSize: 2048, pointLights: q.pointLights });
  lighting.setSources(world.lightSources);
  const particles = createParticles(scene, { count: q.particles });

  const size = view.resize();
  const cam = createFollowCamera(size.width / size.height);

  const player = createActor({ id: 'player', costume: 'player_don', position: world.spawn.clone() });
  scene.add(player.object);
  const npcs = sandboxCast.map((c) => {
    const [x, z, y] = c.at;
    const pos = new THREE.Vector3(x, y ?? world.collision.heightAt(x, z, 0) ?? 0, z);
    const a = createActor({ id: c.id, costume: c.costume, position: pos, dir: c.dir, turnSeconds: TURN_SECONDS });
    scene.add(a.object);
    return { actor: a, emote: 0, home: c.dir, follower: c.companion ? createFollower() : null, following: false };
  });
  const LOOK_RANGE = 3; // NPCs turn to face the player within this distance
  const nearestTo = (list, range) => list
    .map((n) => ({ n, d: n.actor.position.distanceTo(player.position) }))
    .filter((e) => e.d < range)
    .sort((a, b) => a.d - b.d)[0]?.n;
  cam.follow(player.object, { snap: true });

  const input = createInput();
  bindKeyboard(input);
  const hud = document.createElement('div');
  hud.className = 'hud';
  container.appendChild(hud);

  window.addEventListener('resize', () => cam.resize(view.resize().width / view.resize().height));
  container.addEventListener('wheel', (e) => {
    cam.zoomBy(Math.sign(e.deltaY) * 1.2);
    e.preventDefault();
  }, { passive: false });

  let timeIndex = 0;
  const fps = createFpsMonitor();
  let fpsText = '';
  let suggestion = '';
  let frames = 0;
  let acc = 0;
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyT') {
      timeIndex = (timeIndex + 1) % TIME_ORDER.length;
      lighting.setTime(TIME_ORDER[timeIndex], 3);
    }
    if (e.code === 'KeyG') {
      qualityName = qualityName === 'high' ? 'low' : 'high';
      view.setQuality(qualityName);
      cam.resize(view.resize().width / view.resize().height);
      suggestion = '';
    }
    if (e.code === 'KeyF') {
      // Tell a following companion to wait here, or ask the nearest one to follow.
      const waiting = nearestTo(npcs.filter((n) => n.following), Infinity);
      const asked = waiting ?? nearestTo(npcs.filter((n) => n.follower), 2);
      if (asked) {
        asked.following = !asked.following;
        if (asked.following) startFollowing(asked.follower, player.position);
        else asked.home = asked.actor.facing;
      }
    }
  });

  let last = performance.now();
  let time = 0;
  function frame(now = performance.now()) {
    const dt = frameDt(now, last);
    last = now;
    time += dt;

    const m = input.move();
    const speed = (m.run ? RUN_SPEED : WALK_SPEED) * dt;
    const next = world.collision.move(player.object.position, m.x * speed, m.z * speed);
    player.object.position.set(next.x, next.y, next.z);
    player.setMotion(m.x, m.z, m.run);

    for (const press of input.consumePressed()) {
      if (press !== 'interact') continue;
      const near = nearestTo(npcs, 1.8);
      if (near) {
        near.emote = (near.emote + 1) % EMOTES.length;
        near.actor.emote(EMOTES[near.emote]);
      }
    }

    for (const n of npcs) {
      const a = n.actor;
      if (n.following) {
        const step = followStep(n.follower, a.position, player.position);
        const s = (step.run ? RUN_SPEED : WALK_SPEED) * dt;
        const p = world.collision.move(a.position, step.x * s, step.z * s);
        a.object.position.set(p.x, p.y, p.z);
        a.setMotion(step.x, step.z, step.run);
        if (step.x || step.z) {
          n.emote = 0; // walking ends an emote
          continue;
        }
      } else a.setMotion(0, 0);
      if (n.emote) continue; // an emote holds its pose
      // Standing: turn to face the player when near, back to the usual facing otherwise.
      const dx = player.position.x - a.position.x;
      const dz = player.position.z - a.position.z;
      const close = Math.hypot(dx, dz) < LOOK_RANGE && Math.abs(player.position.y - a.position.y) < 1;
      const want = close || n.following ? dirFromVector(dx, dz, a.facing) : n.home;
      if (want !== a.facing) a.face(want);
    }

    cam.update(dt);
    lighting.update(dt, player.position);
    const preset = lighting.preset;
    view.setGrade(preset.grade);
    for (const mat of world.windowMaterials) mat.emissiveIntensity = preset.windows * 0.9;
    const zones = world.collision.zonesAt(player.position.x, player.position.z, player.position.y);
    particles.update(dt, player.position, preset, { outdoors: zones.includes('calle') });
    animateWorld(world, time);
    player.update(dt, cam.camera);
    for (const n of npcs) n.actor.update(dt, cam.camera);
    cam.updateOccluders(world.occluders, player.position, dt);

    view.render(scene, cam.camera);

    frames++;
    acc += dt;
    if (acc >= 0.5) {
      fpsText = `${Math.round(frames / acc)} fps`;
      frames = 0;
      acc = 0;
    }
    if (fps.sample(dt) && qualityName === 'high') suggestion = 'Running slowly — press G for Low graphics.';
    hud.textContent = `Sandbox · ${TIME_ORDER[timeIndex]} · ${qualityName} · ${zones.join(', ') || '—'} · ${fpsText}\nWASD move · Shift run · Space emote · F follow/wait · T time · G graphics · wheel zoom${suggestion ? '\n' + suggestion : ''}`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return { scene, world, player, cam, lighting, view };
}
