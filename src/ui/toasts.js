// Brief notices such as "Journal updated" (spec §4.2). Pushing a text already on screen
// restarts its timer instead of stacking a copy.
export function createToasts({ seconds = 2.5 } = {}) {
  let items = [];
  let nextId = 1;
  return {
    push(text) {
      const same = items.find((i) => i.text === text);
      if (same) same.left = seconds;
      else items.push({ id: nextId++, text, left: seconds });
    },
    // True when a toast expired.
    update(dt) {
      if (!Number.isFinite(dt) || dt <= 0 || items.length === 0) return false;
      const before = items.length;
      for (const i of items) i.left -= dt;
      items = items.filter((i) => i.left > 0);
      return items.length !== before;
    },
    get items() {
      return items.map(({ id, text }) => ({ id, text }));
    },
  };
}
