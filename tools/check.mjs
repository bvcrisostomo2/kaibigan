// The kitbash art rules the build enforces (spec §6): a new set changes at least MIN_CHANGED pixels
// in each idle view beyond its recolours, MIN_BODY of them below the neck (the body changes of
// spec §5.4), and draws every activity its costume lists.
export const MIN_CHANGED = 40;
export const MIN_BODY = 30;

// Pixels that differ between two images of one size, on rows fromRow and below: a different colour,
// or opaque in one only.
export function changedPixels(a, b, fromRow = 0) {
  if (a.w !== b.w || a.h !== b.h) throw new Error('images differ in size');
  let n = 0;
  for (let i = Math.max(0, fromRow) * a.w * 4; i < a.px.length; i += 4) {
    const inA = a.px[i + 3] > 0, inB = b.px[i + 3] > 0;
    if (inA !== inB || (inA && (a.px[i] !== b.px[i] || a.px[i + 1] !== b.px[i + 1] || a.px[i + 2] !== b.px[i + 2]))) n++;
  }
  return n;
}

// Compare the idle frames of a set built fully dressed with the same set built with recolours only.
// neck: the first body row per view (rows above it are the head).
export function colourOnlyCheck(dressed, plain, neck = { front: 0, right: 0, back: 0 }) {
  const counts = {}, body = {};
  for (const view of ['front', 'right', 'back']) {
    const pick = (list) => list.find((f) => f.anim === `idle_${view}`);
    const a = pick(dressed), b = pick(plain);
    if (!a || !b) throw new Error(`no idle_${view} frame`);
    counts[view] = changedPixels(a.img, b.img);
    body[view] = changedPixels(a.img, b.img, neck[view] ?? 0);
  }
  const ok = Object.keys(counts).every((v) => counts[v] >= MIN_CHANGED && body[v] >= MIN_BODY);
  return { counts, body, ok };
}

// The costume's activities (src/art/costumes.js) that the dress file draws no frames for.
export function missingActivities(costumeActivities, dressing) {
  return costumeActivities.filter((name) => !dressing.activities?.[name]);
}
