import { describe, it, expect } from 'vitest';
import { spawnPoint, ambienceFor, inPlay, placePlayer, turnsToPlayer, enteredDoor } from '../../src/boot/rules.js';

describe('spawnPoint', () => {
  const chapter = { beats: [{ id: 'a', spawn: 'door' }, { id: 'b' }, { id: 'c', spawn: 'gone' }] };
  const spots = { door: { x: 1, y: 0, z: 2 } };
  const fallback = { x: 9, y: 0, z: 9 };

  it("uses the current beat's spawn spot, else the level spawn", () => {
    expect(spawnPoint(chapter, 'a', spots, fallback)).toBe(spots.door);
    expect(spawnPoint(chapter, 'b', spots, fallback)).toBe(fallback);
    expect(spawnPoint(chapter, 'c', spots, fallback)).toBe(fallback);
    expect(spawnPoint(chapter, null, spots, fallback)).toBe(fallback);
  });
});

describe('ambienceFor', () => {
  const indoor = ['zaguan', 'sala'];

  it('plays chatter indoors and the river outdoors, crickets outdoors after dusk, music always', () => {
    expect(ambienceFor('sala', 'dusk', indoor)).toEqual({ chatter: 0.25, river: 0.1, crickets: 0, music: 0.3, kitchen: 0, strings: 0 });
    expect(ambienceFor('calle', 'dusk', indoor)).toEqual({ chatter: 0.05, river: 0.5, crickets: 0, music: 0.3, kitchen: 0, strings: 0 });
    expect(ambienceFor('calle', 'evening', indoor).crickets).toBe(0.15);
    expect(ambienceFor('calle', 'night', indoor).crickets).toBe(0.4);
    expect(ambienceFor('sala', 'night', indoor).crickets).toBe(0);
    expect(ambienceFor(null, 'dusk', indoor).river).toBe(0.5);
  });

  it("lets the level set layers per zone: the orchestra near the caída, the kitchen's sizzle", () => {
    const table = { caida: { strings: 0.35, chatter: 0.3 }, kusina: { kitchen: 0.45 } };
    expect(ambienceFor('caida', 'night', ['caida', 'kusina'], table)).toMatchObject({ strings: 0.35, chatter: 0.3, kitchen: 0, river: 0.1 });
    expect(ambienceFor('kusina', 'night', ['caida', 'kusina'], table)).toMatchObject({ kitchen: 0.45, strings: 0 });
  });
});

describe('inPlay', () => {
  const game = (isBlocking, busy) => ({ ui: { isBlocking }, director: { busy } });

  it('lets the player walk only between scenes, with no screen open', () => {
    expect(inPlay(game(false, false))).toBe(true);
    expect(inPlay(game(true, false))).toBe(false); // a dialogue, the Journal or a menu
    expect(inPlay(game(false, true))).toBe(false); // a scene: a beat's actions are running
    expect(inPlay(null)).toBe(false); // the front screens
    expect(inPlay(game(false, false), true)).toBe(false); // going through a door
  });
});

describe('placePlayer', () => {
  it('stands a seated player up before moving them, so Reset never leaves them sitting in mid-air', () => {
    const calls = [];
    const player = {
      object: { position: { copy: (p) => calls.push(['move', p]) } },
      stand: () => calls.push(['stand']),
    };
    placePlayer(player, { x: 1, y: 0, z: 2 });
    expect(calls).toEqual([['stand'], ['move', { x: 1, y: 0, z: 2 }]]);
  });
});

describe('turnsToPlayer', () => {
  const actor = (mode, { visible = true, seated = false } = {}) => ({ mode, seated, object: { visible } });

  it('turns only standing, unseated, visible characters toward the player, never one who is walking or sitting', () => {
    expect(turnsToPlayer(actor('idle'))).toBe(true);
    expect(turnsToPlayer(actor('walk'))).toBe(false); // Ibarra walking out keeps facing where he walks
    expect(turnsToPlayer(actor('run'))).toBe(false);
    expect(turnsToPlayer(actor('idle', { seated: true }))).toBe(false); // diners keep facing the table
    expect(turnsToPlayer(actor('idle', { visible: false }))).toBe(false);
  });
});

describe('enteredDoor', () => {
  const door = { id: 'front_door' };
  const world = { doorAt: (p) => (p.z < 1 ? door : null) };

  it('takes a door only when the player steps into it', () => {
    expect(enteredDoor(world, { z: 2 }, { z: 0.5 })).toBe(door);
    expect(enteredDoor(world, { z: 0.6 }, { z: 0.5 })).toBe(null); // already standing in it
    expect(enteredDoor(world, { z: 3 }, { z: 2 })).toBe(null);
  });
});
