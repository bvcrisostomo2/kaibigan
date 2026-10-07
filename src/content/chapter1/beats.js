// Chapter 1's beat script (spec §3.3, §6.2). Plan 4b-1: Kabanata I–III, from the street to the
// end of the dinner, ending on a "to be continued" card. Checkpoint numbers are stable (1 = the
// start of Kabanata I, 2 = Kabanata II, 3 = Kabanata III) so save codes keep working across plans.
// Beat ids shipped earlier stay too, so autosaves resume. Every beat sets up its own scene (time,
// who is visible, where people stand), because Continue replays a beat's actions from the top.

// The flag a finished dialogue sets (story/dialogue.js seenFlag); content stays plain data.
const seenFlag = (dialogueId) => `seen:${dialogueId}`;

const opening = { staircase: 'k1_staircase', bridge: 'k1_bridge' };

// Before the argument: anyone in Dámaso's group draws you into it.
const salaTalk = {
  sibyla: 'k1_sibyla',
  guevarra: 'k1_guevarra',
  damaso: 'k1_join_group',
  laruja: 'k1_join_group',
  newcomer: 'k1_join_group',
  tiago_portrait: 'k1_portrait',
};

// After the argument, with the Espadañas arrived.
const guestTalk = {
  sibyla: 'k1_sibyla_after',
  guevarra: 'k1_guevarra_after',
  damaso: 'k1_damaso_after',
  laruja: 'k1_laruja',
  newcomer: 'k1_newcomer',
  victorina: 'k1_victorina',
  tiburcio: 'k1_tiburcio',
  tiago_portrait: 'k1_portrait',
};
// Kabanata II starts once the player has talked with 3 guests since the argument.
const GUESTS_MET = Object.entries(guestTalk).filter(([id]) => id !== 'tiago_portrait').map(([, d]) => seenFlag(d));

export const chapter1Beats = [
  {
    id: 'k1_arrive',
    checkpoint: 1,
    location: 'calle',
    spawn: 'street_spawn',
    actions: [['setTime', 'dusk'], ['titleCard', 1], ['dialogue', 'k1_street']],
    interactions: opening,
  },
  {
    id: 'k1_greeting',
    location: 'casa',
    spawn: 'caida_spawn',
    trigger: { enterZone: 'caida', or: { afterSec: 180 } },
    actions: [
      ['setTime', 'dusk'], ['fadeOut', 0.3], ['teleport', 'player', 'caida_spawn'], ['face', 'player', 'isabel'], ['face', 'isabel', 'player'], ['fadeIn', 0.3],
      ['dialogue', 'k1_isabel'],
      ['sfx', 'plate'],
      ['dialogue', 'k1_isabel_exit'],
      ['hide', 'isabel'],
    ],
    interactions: opening,
  },
  {
    id: 'k1_sala',
    location: 'casa',
    spawn: 'sala_spawn',
    trigger: { enterZone: 'sala', or: { afterSec: 120 } },
    actions: [
      ['setTime', 'dusk'], ['hide', 'isabel'], ['fadeOut', 0.3], ['teleport', 'player', 'sala_spawn'], ['face', 'player', 'left'], ['fadeIn', 0.3],
      ['dialogue', 'k1_sala_scene'],
    ],
    interactions: salaTalk,
  },
  {
    id: 'k1_argument',
    location: 'casa',
    spawn: 'sala_spawn',
    trigger: { flag: seenFlag('k1_join_group'), or: { afterSec: 150 } },
    actions: [
      ['setTime', 'dusk'], ['hide', 'isabel'], ['fadeOut', 0.3], ['teleport', 'player', 'sala_spawn'], ['face', 'player', 'left'], ['fadeIn', 0.3],
      ['dialogue', 'k1_argument'],
      // Guevarra walks away to the window; the Espadañas come in from the caída.
      ['moveTo', 'guevarra', 'guevarra_via'], ['moveTo', 'guevarra', 'guevarra_window'], ['face', 'guevarra', 'down'],
      ['teleport', 'victorina', 'sala_door'], ['teleport', 'tiburcio', 'sala_door'], ['show', 'victorina'], ['show', 'tiburcio'],
      ['moveTo', 'victorina', 'victorina_spot'], ['moveTo', 'tiburcio', 'tiburcio_spot'], ['face', 'victorina', 'down'], ['face', 'tiburcio', 'down'],
      ['dialogue', 'k1_espadanas'],
    ],
    interactions: guestTalk,
  },
  {
    id: 'k2_entrance',
    checkpoint: 2,
    // A code loaded here rebuilds the Journal's Characters page (codes don't store bios).
    restore: { bios: ['isabel', 'damaso', 'sibyla', 'guevarra', 'laruja', 'newcomer', 'victorina', 'tiburcio'] },
    location: 'casa',
    spawn: 'sala_spawn',
    trigger: { countAtLeast: { n: 3, flags: GUESTS_MET }, or: { afterSec: 120 } },
    actions: [
      ['setTime', 'evening'], ['hide', 'isabel'], ['hide', 'servant'], ['fadeOut', 0.3],
      ['teleport', 'guevarra', 'guevarra_window'], ['teleport', 'victorina', 'victorina_spot'], ['teleport', 'tiburcio', 'tiburcio_spot'], ['show', 'victorina'], ['show', 'tiburcio'],
      ['teleport', 'player', 'sala_spawn'], ['face', 'player', 'right'],
      ['teleport', 'tiago', 'sala_door'], ['teleport', 'ibarra', 'sala_door'], ['show', 'tiago'], ['show', 'ibarra'],
      ['fadeIn', 0.3], ['titleCard', 2],
      ['moveTo', 'tiago', 'tiago_spot'], ['moveTo', 'ibarra', 'ibarra_spot'], ['face', 'ibarra', 'player'], ['face', 'player', 'ibarra'], ['face', 'tiago', 'left'],
      ['dialogue', 'k2_entrance'],
      ['teleport', 'servant', 'sala_door'], ['show', 'servant'], ['moveTo', 'servant', 'sala_entry'], ['face', 'servant', 'down'],
      ['dialogue', 'k2_dinner_call'],
      // The guests file out to the table; the player follows on foot.
      ['fadeOut', 0.4], ['cutscene', 'seat_guests'], ['fadeIn', 0.4],
    ],
    interactions: { tiago_portrait: 'k1_portrait' },
  },
  {
    id: 'k3_dinner',
    checkpoint: 3,
    restore: { bios: ['isabel', 'damaso', 'sibyla', 'guevarra', 'laruja', 'newcomer', 'victorina', 'tiburcio', 'tiago', 'ibarra'] },
    location: 'casa',
    spawn: 'caida_spawn',
    trigger: { enterZone: 'caida', or: { afterSec: 60 } },
    actions: [
      ['setTime', 'night'], ['hide', 'isabel'], ['fadeOut', 0.3],
      ['cutscene', 'seat_guests'], ['sit', 'player', 'seat_player', 'down'],
      ['fadeIn', 0.3], ['titleCard', 3],
      ['dialogue', 'k3_seating'],
      ['sfx', 'cutlery', 0.6],
      ['dialogue', 'k3_table_talk'],
      ['sfx', 'glasses'],
      ['dialogue', 'k3_exit'],
      ['stand', 'ibarra'], ['moveTo', 'ibarra', 'ibarra_exit_1'], ['moveTo', 'ibarra', 'ibarra_exit_2'], ['moveTo', 'ibarra', 'isabel_stairhead'], ['hide', 'ibarra'],
      ['dialogue', 'k3_after'],
      ['endChapter'],
    ],
  },
];

// Named action lists (spec §6.2): everyone at the caída's table, Tiago standing (he has no seat).
export const chapter1Cutscenes = {
  seat_guests: [
    ['show', 'sibyla'], ['show', 'damaso'], ['show', 'ibarra'], ['show', 'guevarra'], ['show', 'laruja'],
    ['show', 'newcomer'], ['show', 'victorina'], ['show', 'tiburcio'], ['show', 'tiago'],
    ['sit', 'sibyla', 'seat_head', 'right'],
    ['sit', 'damaso', 'seat_damaso', 'down'], ['sit', 'ibarra', 'seat_ibarra', 'down'],
    ['sit', 'guevarra', 'seat_guevarra', 'down'], ['sit', 'laruja', 'seat_laruja', 'down'],
    ['sit', 'newcomer', 'seat_newcomer', 'up'], ['sit', 'victorina', 'seat_victorina', 'up'], ['sit', 'tiburcio', 'seat_tiburcio', 'up'],
    ['teleport', 'tiago', 'tiago_table'], ['face', 'tiago', 'down'],
    ['teleport', 'servant', 'servant_spot'], ['face', 'servant', 'down'],
  ],
};
