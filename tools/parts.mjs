// The parts library's helpers (spec §5): hand-drawn wearables and props kept in tools/parts/, in
// the dress files' pixel-map format ('.' keeps a pixel, '-' erases it, a letter paints that palette
// colour), placed on a set by an offset per view.
//
//   part: { palette, views: { front?, right?, back? } }      e.g. tools/parts/salakot.mjs
//   prop: { palette, frames: [{ front, right }, ...] }       e.g. tools/parts/broom.mjs
//   layer: { at: [x, y], rows: [...], palette? }

function shift(layers, dx, dy, palette) {
  return layers.map(({ at: [x, y], rows }) => ({ at: [x + dx, y + dy], rows, palette }));
}

// A part's layers moved into a set's walk-frame-1 coordinates: { view: [layer, ...] }. A view with
// no offset is not drawn. `palette` overrides some of the part's colours (a red headscarf).
export function wear(part, offsets, palette = {}) {
  const colours = { ...part.palette, ...palette };
  const out = {};
  for (const [view, [dx, dy]] of Object.entries(offsets)) {
    if (!part.views?.[view]) throw new Error(`The part has no '${view}' view`);
    out[view] = shift(part.views[view], dx, dy, colours);
  }
  return out;
}

// A prop's frames for one view: one shifted layer list per frame.
export function propLayers(prop, view, [dx, dy], palette = {}) {
  const colours = { ...prop.palette, ...palette };
  return prop.frames.map((frame, k) => {
    if (!frame[view]) throw new Error(`Prop frame ${k + 1} has no '${view}' view`);
    return shift(frame[view], dx, dy, colours);
  });
}

// The dressing with its `wear` list merged into `views`, after the dress file's own layers, which
// is how kitbash draws them.
export function withParts(dressing) {
  if (!dressing.wear?.length) return dressing;
  const views = { ...(dressing.views ?? {}) };
  for (const worn of dressing.wear) for (const [view, layers] of Object.entries(worn)) views[view] = [...(views[view] ?? []), ...layers];
  return { ...dressing, views };
}

// The same dressing with its recolours only: no painted layers, no parts (the "not just colour"
// check builds a set both ways and compares).
export function recolourOnly(dressing) {
  const { views, wear, ...rest } = dressing; // eslint-disable-line no-unused-vars
  return rest;
}
