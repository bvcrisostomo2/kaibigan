// The player character's endings (spec §3.8), checked top to bottom; first match wins.
// Thresholds are indicative and get tuned when the final chapter is written.
// Flags 'testified_against_ibarra' and 'family_protection' are set in later chapters.
export const ENDINGS = [
  { id: 'taksil', title: 'Ang Taksil', sceneId: 'ending_taksil', if: { flag: 'testified_against_ibarra' } },
  { id: 'ipinatapon', title: 'Ang Ipinatapon', sceneId: 'ending_ipinatapon', if: { tiwalaAtLeast: 6, hinalaAtLeast: 6, flag: 'family_protection' } },
  { id: 'tapat', title: 'Ang Tapat na Kaibigan', sceneId: 'ending_tapat', if: { tiwalaAtLeast: 6, hinalaBelow: 6 } },
  { id: 'martir', title: 'Ang Martir', sceneId: 'ending_martir', if: { tiwalaAtLeast: 6, hinalaAtLeast: 6 } },
  { id: 'wasak', title: 'Ang Wasak', sceneId: 'ending_wasak', if: { hinalaAtLeast: 6 } },
  { id: 'nakaligtas', title: 'Ang Nakaligtas', sceneId: 'ending_nakaligtas' },
];
