// Book-chapter title cards (spec §4.2): slide in, hold, slide out, about 3 seconds, without
// blocking play. show() resolves when the card has slid out; cards queue one after another.
export const TITLE_CARD_TIMING = { in: 0.5, hold: 2, out: 0.5 };

export function createTitleCards(timing = TITLE_CARD_TIMING) {
  const total = timing.in + timing.hold + timing.out;
  const queue = [];
  let current = null;
  let time = 0;
  const begin = () => {
    current = queue.shift() ?? null;
    time = 0;
  };

  return {
    // card = { title, subtitle }.
    show(card) {
      return new Promise((resolve) => {
        queue.push({ card, resolve });
        if (!current) begin();
      });
    },
    update(dt) {
      if (!current || !Number.isFinite(dt) || dt <= 0) return;
      time += dt;
      if (time >= total) {
        const done = current;
        begin();
        done.resolve();
      }
    },
    // { title, subtitle, phase: 'in' | 'hold' | 'out' } or null.
    view() {
      if (!current) return null;
      const phase = time < timing.in ? 'in' : time < timing.in + timing.hold ? 'hold' : 'out';
      return { ...current.card, phase };
    },
    // Drop every card, resolving their promises (quitting to the title).
    clear() {
      for (const c of [current, ...queue]) c?.resolve();
      queue.length = 0;
      current = null;
    },
  };
}
