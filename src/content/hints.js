// Felt hints (spec §3.6, §6.3): once-only Journal lines when a hidden condition first holds.
export const HINTS = [
  { id: 'eyes', if: { hinalaAtLeast: 2 }, journal: 'You sense eyes on you.', setFlag: 'guardia_watching' },
  { id: 'damaso_eyes', if: { flag: 'ch1_defied_damaso' }, journal: "Padre Dámaso's eyes find you whenever you speak." },
];
