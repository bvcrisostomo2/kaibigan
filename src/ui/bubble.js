// Where a speech bubble goes (Plan 5 spec §4.4): above the speaker with its tail at them, flipped
// below when above would leave the top, held inside the screen, or pinned to the nearest edge
// (tail pointing off-screen) when the speaker can't be seen. Pure: CSS pixels in, placement out.
export const BUBBLE_MARGIN = 8;
export const BUBBLE_GAP = 10;
export const TAIL_INSET = 18;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// anchor: { head: { x, y }, foot: { x, y }, behind } or null; size and screen: { w, h }.
// → { mode: 'above' | 'below' | 'edge', x, y, tail: { side, at } } (x, y: the top left), or null.
export function placeBubble({ anchor, size, screen, margin = BUBBLE_MARGIN, gap = BUBBLE_GAP }) {
  if (!anchor) return null;
  const maxX = screen.w - margin - size.w;
  const maxY = screen.h - margin - size.h;
  const tailAt = (point, start, length) => Math.round(clamp(point - start, TAIL_INSET, length - TAIL_INSET));
  let { head, foot } = anchor;
  if (anchor.behind) {
    // Behind the camera the projection flips: mirror it and treat the speaker as below the screen.
    head = { x: screen.w - head.x, y: screen.h + size.h };
    foot = head;
  }
  const inX = head.x >= 0 && head.x <= screen.w;
  const inY = (head.y >= 0 && head.y <= screen.h) || (foot.y >= 0 && foot.y <= screen.h);
  if (!anchor.behind && inX && inY) {
    const x = Math.round(clamp(head.x - size.w / 2, margin, Math.max(margin, maxX)));
    const above = head.y - gap - size.h;
    if (above >= margin) return { mode: 'above', x, y: Math.round(above), tail: { side: 'bottom', at: tailAt(head.x, x, size.w) } };
    const y = Math.round(clamp(foot.y + gap, margin, Math.max(margin, maxY)));
    return { mode: 'below', x, y, tail: { side: 'top', at: tailAt(foot.x, x, size.w) } };
  }
  // Off-screen: the bubble sits at the edge nearest the speaker, its tail toward them.
  const x = Math.round(clamp(head.x - size.w / 2, margin, Math.max(margin, maxX)));
  const y = Math.round(clamp(head.y - size.h / 2, margin, Math.max(margin, maxY)));
  const over = { left: -head.x, right: head.x - screen.w, top: -head.y, bottom: head.y - screen.h };
  const side = Object.keys(over).reduce((a, b) => (over[b] > over[a] ? b : a));
  const along = side === 'left' || side === 'right';
  const at = along ? tailAt(head.y, y, size.h) : tailAt(head.x, x, size.w);
  return { mode: 'edge', x, y, tail: { side, at } };
}
