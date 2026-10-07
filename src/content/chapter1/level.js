// Chapter 1's level (Plan 5 spec §3.1, §3.4): six maps joined by doors, each in its own region of
// one world. Every map looks north, so the creek is at the back (north) of every map and Calle
// Anloague is on the camera side (south).
//   street     Calle Anloague: the house fronts, the lane to the river
//   riverbank  the landing, the creek, the bridge, the far bank
//   ground     the zaguán, with the stairs up
//   upper      the sala, the caída (the dinner), the azotea over the creek
//   kusina     the kitchen, behind the caída
//   oratorio   Capitan Tiago's prayer room, in the cuartos wing behind the sala
// Spot and zone names are unique across maps. Plan 2's stair rule holds map by map.
import { street } from './maps/street.js';
import { riverbank } from './maps/riverbank.js';
import { ground } from './maps/ground.js';
import { upper } from './maps/upper.js';
import { kusina, oratorio } from './maps/rooms.js';

export const chapter1Level = {
  maps: { street, riverbank, ground, upper, kusina, oratorio },
  // Walk into a rect (map-local tiles) to arrive at `to` on another map, facing `face`.
  doors: [
    { id: 'front_door', map: 'street', rect: { x: 19.2, z: 2.9, w: 1.6, d: 0.4 }, to: 'zaguan_entry', face: 'up', sound: 'door' },
    { id: 'house_exit', map: 'ground', rect: { x: 6, z: 7.6, w: 2, d: 0.4 }, to: 'street_door', face: 'down', sound: 'door' },
    { id: 'stairs_up', map: 'ground', rect: { x: 10.4, z: 1.4, w: 2.2, d: 0.5 }, to: 'caida_from_stairs', face: 'left', sound: 'stairs' },
    { id: 'stairs_down', map: 'upper', rect: { x: 27.4, z: 9.3, w: 2.2, d: 0.7 }, to: 'zaguan_from_stairs', face: 'down', sound: 'stairs' },
    { id: 'lane_north', map: 'street', rect: { x: 35, z: -2, w: 3.6, d: 0.7 }, to: 'landing_from_lane', face: 'up' },
    { id: 'lane_south', map: 'riverbank', rect: { x: 25, z: 13.3, w: 3, d: 0.7 }, to: 'lane_from_river', face: 'down' },
    { id: 'kusina_door', map: 'upper', rect: { x: 28.5, z: 0, w: 1.2, d: 0.5 }, to: 'kusina_entry', face: 'up', sound: 'door' },
    { id: 'kusina_exit', map: 'kusina', rect: { x: 4, z: 6.6, w: 2, d: 0.4 }, to: 'caida_from_kusina', face: 'down', sound: 'door' },
    { id: 'oratorio_door', map: 'upper', rect: { x: 8.5, z: 0, w: 1.2, d: 0.5 }, to: 'oratorio_entry', face: 'up', sound: 'door' },
    { id: 'oratorio_exit', map: 'oratorio', rect: { x: 3, z: 5.6, w: 2, d: 0.4 }, to: 'sala_from_oratorio', face: 'down', sound: 'door' },
  ],
  // Shut doors: Talk targets with a line (chapter-wide interactions), never passable.
  locked: [
    { id: 'tiago_room', spot: 'tiago_room_door' },
    { id: 'clara_room', spot: 'clara_room_door' },
    { id: 'pawnshop', spot: 'pawnshop_door' },
    { id: 'neighbour_house', spot: 'neighbour_door' },
  ],
  // Things Talk can examine.
  examinables: [
    { id: 'staircase', spot: 'stair_view' },
    { id: 'bridge', spot: 'bridge_end' },
    { id: 'tiago_portrait', spot: 'tiago_portrait' },
    { id: 'altar', spot: 'altar_view' },
  ],
  indoorZones: ['zaguan', 'caida', 'sala', 'kusina', 'oratorio'],
  // Layer levels per zone (boot/rules.js ambienceFor): the party's murmur and the orchestra louder
  // near the crowd, the kitchen's sizzle in the kusina, the creek loudest on its banks.
  ambience: {
    sala: { chatter: 0.3, strings: 0.18 },
    caida: { chatter: 0.3, strings: 0.35, kitchen: 0.04 },
    azotea: { chatter: 0.15, strings: 0.18, river: 0.5 },
    zaguan: { chatter: 0.1, strings: 0.06 },
    kusina: { chatter: 0.08, kitchen: 0.45 },
    oratorio: { chatter: 0.05, music: 0.15 },
    riverbank: { river: 0.65 },
  },
  spawn: 'street_spawn',
};

// Every spot and zone name across the maps (for the content validator).
export const levelNames = (level) => ({
  spots: Object.values(level.maps).flatMap((m) => Object.keys(m.spots ?? {})),
  zones: Object.values(level.maps).flatMap((m) => Object.keys(m.zones ?? {})),
});
