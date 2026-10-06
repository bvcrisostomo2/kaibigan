// Small rules the game boot follows, kept pure so they are tested without a browser.

// Where Reset position (Esc menu) puts the player (spec §7): the current beat's spawn spot,
// else the level's spawn.
export function spawnPoint(chapter, beatId, spots, fallback) {
  const spot = chapter.beats.find((b) => b.id === beatId)?.spawn;
  return (spot && spots[spot]) ?? fallback;
}

// Ambience layer levels (spec §4.4) for the player's zone and the time of day. indoorZones lists
// the level's indoor zones; anywhere else (or no zone) is outdoors.
export function ambienceFor(zone, time, indoorZones) {
  const indoors = indoorZones.includes(zone);
  return {
    chatter: indoors ? 0.25 : 0.05,
    river: indoors ? 0.1 : 0.5,
    crickets: indoors ? 0 : ({ evening: 0.15, night: 0.4 }[time] ?? 0),
    music: 0.3,
  };
}

// Put the player at a point (Reset position, spec §6.2): a seated player stands up first, so they
// never sit in mid-air.
export function placePlayer(player, point) {
  player.stand();
  player.object.position.copy(point);
}

// Whether the player walks this frame (spec §4.2, §6.2): only in a game, with no screen open and
// no scene running (a beat's actions or a conversation), so scenes play out undisturbed.
export function inPlay(game) {
  return game != null && !game.ui.isBlocking && !game.director.busy;
}
