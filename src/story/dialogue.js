// Steps through one dialogue graph. The UI (or a headless test host) drives it:
//   const d = createDialogue(def, ctx);
//   while (!d.done) { const c = d.current(); c.choices ? d.choose(i) : d.advance(); }
// Entering a node applies its effects once. Nodes whose `if` is false are skipped
// (their `next` is followed), as are choice nodes with no visible choices.
import { evaluate } from './conditions.js';
import { applyEffects } from './effects.js';
import { parseText } from './text.js';

// Flag set automatically when a dialogue finishes, e.g. 'seen:isabel_greet'.
export function seenFlag(dialogueId) {
  return `seen:${dialogueId}`;
}

export function createDialogue(def, ctx) {
  const { state, bus } = ctx;
  let nodeId = null;
  let done = false;
  const vars = () => ({ name: state.name, title: state.title });
  const visibleChoices = (node) => (node.choices ?? []).filter((c) => evaluate(c.if, state));

  function enter(id) {
    let guard = 0;
    while (id != null) {
      if (++guard > 1000) throw new Error(`Dialogue ${def.id}: endless skip loop`);
      const node = def.nodes[id];
      if (!node) throw new Error(`Dialogue ${def.id}: node '${id}' not found`);
      const skip = !evaluate(node.if, state) || (node.choices && visibleChoices(node).length === 0);
      if (skip) {
        id = node.next ?? null;
        continue;
      }
      nodeId = id;
      applyEffects(ctx, node.effects);
      bus?.emit('dialogue:node', { id: def.id, node: id });
      return;
    }
    nodeId = null;
    done = true;
    // Through applyEffects so state:changed fires and hints watching 'seen:<id>' are checked.
    applyEffects(ctx, { flag: seenFlag(def.id) });
    bus?.emit('dialogue:end', { id: def.id });
  }

  const runner = {
    id: def.id,
    get done() {
      return done;
    },
    // { id, who, face, segments, choices: [{ index, segments }] | null }, or null when done.
    current() {
      if (done) return null;
      const node = def.nodes[nodeId];
      return {
        id: nodeId,
        who: node.who ?? null,
        face: node.face ?? null,
        segments: node.text != null ? parseText(node.text, vars()) : null,
        choices: node.choices
          ? visibleChoices(node).map((c, index) => ({ index, segments: parseText(c.text, vars()) }))
          : null,
      };
    },
    advance() {
      if (done) return;
      const node = def.nodes[nodeId];
      if (node.choices) throw new Error(`Dialogue ${def.id}: node '${nodeId}' needs a choice`);
      enter(node.next ?? null);
    },
    // index is a position in current().choices (visible choices only).
    choose(index) {
      if (done) return;
      const node = def.nodes[nodeId];
      const choice = node.choices ? visibleChoices(node)[index] : undefined;
      if (!choice) throw new Error(`Dialogue ${def.id}: no choice ${index} at '${nodeId}'`);
      bus?.emit('dialogue:choice', { id: def.id, node: nodeId, index });
      applyEffects(ctx, choice.effects);
      enter(choice.next ?? null);
    },
  };

  enter(def.start);
  return runner;
}
