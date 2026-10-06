// The Plan 3 demo as a content bundle for startGame: the demo chapter on the sandbox level, with
// the sandbox's actor positions as home spots. Opened with ?demo (main.js).
import { sandboxLevel, sandboxCast } from './sandboxLevel.js';
import { demoChapter, demoCast, demoGlossary, demoNotes, demoHints, demoLetter } from './demoChapter.js';

const homes = Object.fromEntries(sandboxCast.map((c) => [`home_${c.id}`, c.at]));

export const demoContent = {
  level: { ...sandboxLevel, spots: { ...sandboxLevel.spots, ...homes }, examinables: [], indoorZones: ['zaguan', 'sala'] },
  cast: demoCast.map((c) => ({ ...c, homeSpot: `home_${c.id}`, dir: sandboxCast.find((s) => s.id === c.id)?.dir ?? 'down' })),
  chapter: demoChapter,
  glossary: demoGlossary,
  notes: demoNotes,
  hints: demoHints,
  letter: demoLetter,
};
