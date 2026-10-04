// What each save-code layout version stores, in bit order (spec §3.9).
// FROZEN once shipped: to store more, add a new version and keep the old ones forever.
// Version numbers use 4 bits, so at most 15 layouts.
export const CODE_LAYOUTS = Object.freeze({
  1: Object.freeze({
    checkpointBits: 6,
    meterBits: 5, // tiwala and hinala, clamped to -16..15
    affinityBits: 3, // clamped to -4..3
    flags: [
      'ch1_defied_damaso',
      'ch1_tactful',
      'ch1_silent',
      'ch1_honest',
      'ch1_hid_truth',
      'ch1_defended_indios',
      'ch1_sided_damaso',
      'guardia_watching',
    ],
    affinity: ['guevarra', 'isabel', 'tiago', 'sibyla', 'victorina'],
    notes: [
      'note_friars',
      'note_guardia_civil',
      'note_bahay_na_bato',
      'note_binondo',
      'note_indio',
      'note_principalia',
      'note_tinola',
      'note_rizal_europe',
    ],
  }),
});

export const CURRENT_LAYOUT = 1;
