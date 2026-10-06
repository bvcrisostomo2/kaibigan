// Chapter 1's beat script (spec §6.2). Plan 4a: the true opening of Kabanata I, ending on a
// "to be continued" card. Checkpoint numbers are stable from here on (1 = the start of Kabanata I),
// so save codes made now keep working when Plan 4b adds the rest of the chapter.
const opening = { staircase: 'k1_staircase', bridge: 'k1_bridge' };

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
      ['endChapter'],
    ],
  },
];
