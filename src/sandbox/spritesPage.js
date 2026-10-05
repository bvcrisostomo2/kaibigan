// Dev page (sprites.html): a lineup of every costume (front, side, back, expressions, gestures),
// then each full sheet and portraits, so the procedural art can be reviewed at a glance.
import { COSTUMES } from '../art/costumes.js';
import { drawCharacterSheet, drawFrame, drawPortrait, EXPRESSIONS, GESTURES } from '../art/characters.js';

function toCanvas(pixels, scale) {
  const canvas = document.createElement('canvas');
  canvas.width = pixels.width * scale;
  canvas.height = pixels.height * scale;
  const small = document.createElement('canvas');
  small.width = pixels.width;
  small.height = pixels.height;
  small.getContext('2d').putImageData(new ImageData(pixels.data, pixels.width, pixels.height), 0, 0);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(small, 0, 0, canvas.width, canvas.height);
  return canvas;
}

const out = document.getElementById('out');
const params = new URLSearchParams(location.search);
const scale = Number(params.get('scale') ?? 2);

// Lineup: one row per costume (?only=a,b limits the list).
const only = params.get('only')?.split(',');
for (const [id, costume] of Object.entries(COSTUMES)) {
  if (only && !only.includes(id)) continue;
  const row = document.createElement('div');
  row.className = 'row';
  const label = document.createElement('div');
  label.textContent = id;
  label.style.width = '90px';
  row.append(label);
  const frames = [
    { dir: 'down' }, { dir: 'left' }, { dir: 'right' }, { dir: 'up' },
    { dir: 'down', mode: 'walk', frame: 0 }, { dir: 'left', mode: 'walk', frame: 0 },
    ...EXPRESSIONS.slice(1).map((expression) => ({ expression })),
    ...GESTURES.map((gesture) => ({ gesture })),
  ];
  for (const f of frames) row.append(toCanvas(drawFrame(costume, f), scale));
  row.append(toCanvas(drawPortrait(costume, 'neutral'), scale / 2));
  out.append(row);
}

if (params.has('sheets')) {
  for (const [id, costume] of Object.entries(COSTUMES)) {
    const h = document.createElement('h2');
    h.textContent = id;
    out.append(h, toCanvas(drawCharacterSheet(costume), 2));
  }
}
