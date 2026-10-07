// Small rules the game boot follows, kept pure so they are tested without a browser.

// Where Reset position (Esc menu) puts the player (spec §7): the current beat's spawn spot,
// else the level's spawn.
export function spawnPoint(chapter, beatId, spots, fallback) {
  const spot = chapter.beats.find((b) => b.id === beatId)?.spawn;
  return (spot && spots[spot]) ?? fallback;
}

// Ambience layer levels (spec §4.4; Plan 5 spec §3.7) for the player's zone and the time of day.
// indoorZones lists the level's indoor zones; anywhere else (or no zone) is outdoors. A level's
// `ambience` table can set layers per zone, so the party's murmur and the orchestra grow louder
// near the crowd and the kitchen sizzles in the kusina.
export function ambienceFor(zone, time, indoorZones, table = {}) {
  const indoors = indoorZones.includes(zone);
  return {
    chatter: indoors ? 0.25 : 0.05,
    river: indoors ? 0.1 : 0.5,
    crickets: indoors ? 0 : ({ evening: 0.15, night: 0.4 }[time] ?? 0),
    music: 0.3,
    kitchen: 0,
    strings: 0,
    ...(table[zone] ?? {}),
  };
}

// Put the player at a point (Reset position, spec §6.2): a seated player stands up first, so they
// never sit in mid-air.
export function placePlayer(player, point) {
  player.stand();
  player.object.position.copy(point);
}

// Whether the player walks this frame (spec §4.2, §6.2): only in a game, with no screen open, no
// scene running (a beat's actions or a conversation) and no door's fade under way (Plan 5a).
export function inPlay(game, crossing = false) {
  return game != null && !game.ui.isBlocking && !game.director.busy && !crossing;
}

// The door the player has just walked into (Plan 5 spec §3.3): standing in its rectangle now but
// not a moment ago, so arriving next to a door never sends you back through it.
export function enteredDoor(world, before, after) {
  const door = world.doorAt(after);
  return door && world.doorAt(before) !== door ? door : null;
}

// Whether a cast member turns to face the player when close: only one who is standing still, so a
// character walking away (Ibarra leaving the dinner) keeps facing where he walks, and diners keep
// facing the table.
export function turnsToPlayer(actor) {
  return actor.object.visible && !actor.seated && actor.mode === 'idle';
}
