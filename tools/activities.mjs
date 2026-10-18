// An extra's activity frames for a kitbash set (spec §4.3): a prop painted over the dressed idle
// frame, or over frames from one of the body pack's own animations (built by kitbash), or a
// two-frame nod. Front and right views; the game mirrors right for left.
//
// A frame stays 50×70 unless its prop reaches past an edge; then every frame of that activity
// view gets the same canvas, padded equally on both sides and on top, so the body keeps its column
// and baseline (the loader centres frames and bottom-aligns each animation). The pixel at the top
// left stays background, because the loader keys out its colour. A prop never reaches below the feet.
import { dress, bbox } from './kitbash.mjs';
import { propLayers } from './parts.mjs';

export const ACT_VIEWS = ['front', 'right'];

const fileName = (k) => `${String(k + 1).padStart(2, '0')}.png`;

// Every painted pixel of some layers ('.' keeps and '-' erases, so neither counts), shifted the
// way dress() shifts them.
export function paintedPixels(layers, bob = 0, dx = 0) {
  const out = [];
  for (const { at: [x0, y0], rows } of layers) {
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) if (row[i] !== '.' && row[i] !== '-') out.push({ x: x0 + i + dx, y: y0 + j + bob });
    });
  }
  return out;
}

// items: [{ img, layers, bob, dx }], all images the same size → the painted images, one canvas size.
export function paintActivity(items) {
  const { w } = items[0].img;
  let left = 0, right = 0, top = 0, corner = false;
  for (const { img, layers, bob = 0, dx = 0 } of items) {
    const feet = bbox(img).bottom;
    for (const p of paintedPixels(layers, bob, dx)) {
      if (p.y > feet) throw new Error(`a prop reaches below the feet (row ${p.y}, feet at row ${feet})`);
      left = Math.max(left, -p.x);
      right = Math.max(right, p.x - (w - 1));
      top = Math.max(top, -p.y);
      if (p.x === 0 && p.y === 0) corner = true;
    }
  }
  // One spare pixel beyond the prop keeps the top-left pixel background.
  const side = Math.max(left, right) ? Math.max(left, right) + 1 : 0;
  const pad = top ? top + 1 : !side && corner ? 1 : 0;
  return items.map(({ img, layers, bob = 0, dx = 0 }) => {
    const out = { w: img.w + 2 * side, h: img.h + pad, px: Buffer.alloc((img.w + 2 * side) * (img.h + pad) * 4) };
    for (let y = 0; y < img.h; y++) img.px.copy(out.px, ((y + pad) * out.w + side) * 4, y * img.w * 4, (y + 1) * img.w * 4);
    return dress(out, layers, {}, bob + pad, false, dx + side);
  });
}

// A two-frame nod: the frame as it is, then everything above `neck` one pixel lower.
export function nodFrames(img, neck) {
  const down = { ...img, px: Buffer.from(img.px) };
  for (let y = neck; y >= 1; y--) img.px.copy(down.px, y * img.w * 4, (y - 1) * img.w * 4, y * img.w * 4);
  down.px.fill(0, 0, img.w * 4);
  return [{ ...img, px: Buffer.from(img.px) }, down];
}

function idleFrame(frames, view) {
  const f = frames.find((x) => x.anim === `idle_${view}`);
  if (!f) throw new Error(`no idle_${view} frame`);
  return f;
}

// The act_<name>_<view> frames of a set: [{ anim, file, img }]. `frames` come from kitbash's
// buildFrames, which already holds the source-animation frames under the same anim names.
export function activityFrames(dressing, frames) {
  const out = [];
  for (const [name, act] of Object.entries(dressing.activities ?? {})) {
    for (const view of ACT_VIEWS) {
      const anim = `act_${name}_${view}`;
      let items;
      if (act.source?.[view]) {
        const src = frames.filter((f) => f.anim === anim);
        if (!src.length) throw new Error(`Activity '${name}': no frames for the ${view} view`);
        // at[view] === false: this view keeps the source frames as they are (the prop is another view's)
        const painted = act.prop && act.at?.[view] !== false;
        if (painted && !act.at?.[view]) throw new Error(`Activity '${name}': a prop needs an 'at' offset for the ${view} view`);
        const props = painted ? propLayers(act.prop, view, act.at[view], act.palette) : [];
        items = src.map((f, k) => ({ img: f.img, layers: props.length ? props[k % props.length] : [], bob: f.bob, dx: f.dx }));
      } else if (act.nod?.[view] != null) {
        nodFrames(idleFrame(frames, view).img, act.nod[view]).forEach((img, k) => out.push({ anim, file: fileName(k), img }));
        continue;
      } else if (act.prop && act.at?.[view]) {
        const idle = idleFrame(frames, view);
        items = propLayers(act.prop, view, act.at[view], act.palette).map((layers) => ({ img: idle.img, layers, bob: idle.bob, dx: idle.dx }));
      } else continue;
      paintActivity(items).forEach((img, k) => out.push({ anim, file: fileName(k), img }));
    }
  }
  return out;
}
