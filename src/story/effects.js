// Applies a content `effects` object to state, then checks felt hints.
// ctx = { state, bus, hints } is shared by dialogue and the director.
import { addUnique } from './state.js';
import { checkHints } from './hints.js';

export const EFFECT_KEYS = ['tiwala', 'hinala', 'affinity', 'flag', 'flags', 'insight', 'note', 'bio'];

export function applyEffects(ctx, effects) {
  if (!effects) return;
  const { state, bus } = ctx;
  for (const [key, v] of Object.entries(effects)) {
    switch (key) {
      case 'tiwala': state.tiwala += v; break;
      case 'hinala': state.hinala += v; break;
      case 'affinity':
        for (const [id, delta] of Object.entries(v)) state.affinity[id] = (state.affinity[id] ?? 0) + delta;
        break;
      case 'flag': addUnique(state.flags, v); break;
      case 'flags': v.forEach((f) => addUnique(state.flags, f)); break;
      case 'insight': addUnique(state.insight, v); break;
      case 'note': if (addUnique(state.notes, v)) bus?.emit('journal:note', { id: v }); break;
      case 'bio': if (addUnique(state.bios, v)) bus?.emit('journal:bio', { id: v }); break;
      default: throw new Error(`Unknown effect key: ${key}`);
    }
  }
  // No payload on purpose: meter values must never reach the UI.
  bus?.emit('state:changed');
  checkHints(state, ctx.hints ?? [], bus);
}
