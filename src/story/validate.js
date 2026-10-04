// Cross-checks content so broken references fail loudly at startup/test time
// instead of silently mid-game. Returns { errors: string[], warnings: string[] }.
//
// validateContent({
//   chapters,            // [{ number, startBeat, beats, dialogues }]
//   cast, glossary, notes, // [{ id, ... }]
//   hints, endings,      // optional arrays
//   codeLayouts,         // optional { version: layout } — save-code coverage checks
//   level,               // optional { zones: string[], spots: string[] }
// })
import { CONDITION_KEYS, flagsReadBy } from './conditions.js';
import { EFFECT_KEYS } from './effects.js';
import { DIRECTOR_ACTIONS, HOST_ACTIONS } from './director.js';
import { glossaryRefs } from './text.js';
import { seenFlag } from './dialogue.js';

const SPEAKERS = ['player', 'narrator'];
const ACTOR_ACTIONS = ['moveTo', 'face', 'teleport', 'emote', 'show', 'hide'];
const SPOT_ACTIONS = ['moveTo', 'teleport'];
// Flags named like 'ch1_...' are persistent choices and must be stored in save codes.
const PERSISTENT_FLAG = /^ch\d+_/;

export function validateContent({ chapters, cast, glossary, notes, hints = [], endings = [], codeLayouts = null, level = null }) {
  const errors = [];
  const warnings = [];
  const castIds = new Set(cast.map((c) => c.id));
  const glossaryIds = new Set(glossary.map((g) => g.id));
  const noteIds = new Set(notes.map((n) => n.id));
  const flagsSet = new Set();
  const flagsRead = [];

  const checkCondition = (cond, where) => {
    if (cond == null) return;
    if (typeof cond !== 'object' || Array.isArray(cond)) {
      errors.push(`${where}: condition must be an object`);
      return;
    }
    for (const [k, v] of Object.entries(cond)) {
      if (!CONDITION_KEYS.includes(k)) errors.push(`${where}: unknown condition key '${k}'`);
      else if (k === 'all' || k === 'any') v.forEach((c, i) => checkCondition(c, `${where}.${k}[${i}]`));
      else if (k === 'affinityAtLeast') Object.keys(v).forEach((id) => castIds.has(id) || errors.push(`${where}: unknown cast '${id}'`));
    }
    for (const flag of flagsReadBy(cond)) flagsRead.push({ flag, where });
  };

  const checkTrigger = (t, where) => {
    // enterZone / interact / afterSec / or are trigger keys; everything else is a condition.
    const { or, enterZone, interact: _interact, afterSec, ...cond } = t;
    if (enterZone != null && level && !level.zones.includes(enterZone)) errors.push(`${where}: zone '${enterZone}' not found`);
    if (afterSec != null && !(afterSec > 0)) errors.push(`${where}: afterSec must be a positive number`);
    checkCondition(cond, where);
    if (or != null) checkTrigger(or, `${where}.or`);
  };

  const checkEffects = (effects, where) => {
    if (!effects) return;
    for (const [k, v] of Object.entries(effects)) {
      if (!EFFECT_KEYS.includes(k)) {
        errors.push(`${where}: unknown effect '${k}'`);
        continue;
      }
      if (k === 'flag') flagsSet.add(v);
      if (k === 'flags') v.forEach((f) => flagsSet.add(f));
      if (k === 'note' && !noteIds.has(v)) errors.push(`${where}: note '${v}' not found`);
      if (k === 'bio' && !castIds.has(v)) errors.push(`${where}: bio cast '${v}' not found`);
      if (k === 'affinity') Object.keys(v).forEach((id) => castIds.has(id) || errors.push(`${where}: unknown cast '${id}'`));
    }
  };

  const checkText = (text, where) => {
    for (const id of glossaryRefs(text ?? '')) if (!glossaryIds.has(id)) errors.push(`${where}: glossary term '${id}' not found`);
  };

  const checkpoints = new Map();

  for (const ch of chapters) {
    const dialogueIds = new Set(Object.keys(ch.dialogues));
    const beatIds = new Set();
    for (const b of ch.beats) {
      if (beatIds.has(b.id)) errors.push(`beat '${b.id}' is duplicated`);
      beatIds.add(b.id);
    }
    if (!beatIds.has(ch.startBeat)) errors.push(`chapter ${ch.number}: startBeat '${ch.startBeat}' not found`);

    for (const [id, d] of Object.entries(ch.dialogues)) {
      flagsSet.add(seenFlag(id));
      if (d.id !== id) errors.push(`dialogue '${id}': id field is '${d.id}'`);
      if (!d.nodes?.[d.start]) errors.push(`${id}: start '${d.start}' not found`);
      for (const [nid, node] of Object.entries(d.nodes ?? {})) {
        const where = `${id}.${nid}`;
        if (node.next != null && !d.nodes[node.next]) errors.push(`${where} → next '${node.next}' not found`);
        if (node.who != null && !SPEAKERS.includes(node.who) && !castIds.has(node.who)) errors.push(`${where}: speaker '${node.who}' not found`);
        if (node.text == null && !node.choices) errors.push(`${where}: node has neither text nor choices`);
        checkText(node.text, where);
        checkCondition(node.if, where);
        checkEffects(node.effects, where);
        (node.choices ?? []).forEach((c, i) => {
          const cw = `${where}.choices[${i}]`;
          if (c.next != null && !d.nodes[c.next]) errors.push(`${cw} → next '${c.next}' not found`);
          checkText(c.text, cw);
          checkCondition(c.if, cw);
          checkEffects(c.effects, cw);
        });
      }
    }

    const checkActions = (actions, where) =>
      actions.forEach((a, i) => {
        const aw = `${where}[${i}]`;
        const [type, arg] = a;
        if (!DIRECTOR_ACTIONS.includes(type) && !HOST_ACTIONS.includes(type)) errors.push(`${aw}: unknown action '${type}'`);
        if (type === 'dialogue' && !dialogueIds.has(arg)) errors.push(`${aw}: dialogue '${arg}' not found`);
        if (type === 'setBeat' && !beatIds.has(arg)) errors.push(`${aw}: beat '${arg}' not found`);
        if (type === 'effects') checkEffects(arg, aw);
        if (ACTOR_ACTIONS.includes(type) && arg !== 'player' && !castIds.has(arg)) errors.push(`${aw}: actor '${arg}' not found`);
        if (SPOT_ACTIONS.includes(type) && level && !level.spots.includes(a[2])) errors.push(`${aw}: spot '${a[2]}' not found`);
        if (type === 'branch') {
          if (!Array.isArray(arg) || arg.length === 0) errors.push(`${aw}: branch needs at least one case`);
          else if (arg.at(-1).if != null) errors.push(`${aw}: branch must end with a default case (no 'if')`);
          (arg ?? []).forEach((br, j) => {
            checkCondition(br.if, `${aw}.case[${j}]`);
            checkActions(br.actions ?? [], `${aw}.case[${j}]`);
          });
        }
      });

    for (const b of ch.beats) {
      const where = `beat '${b.id}'`;
      if (b.next != null && !beatIds.has(b.next)) errors.push(`${where}: next '${b.next}' not found`);
      if (b.trigger) checkTrigger(b.trigger, `${where}.trigger`);
      if (b.actions) checkActions(b.actions, `${where}.actions`);
      for (const [target, entry] of Object.entries(b.interactions ?? {})) {
        for (const e of Array.isArray(entry) ? entry : [entry]) {
          const dlg = typeof e === 'string' ? e : e.dialogue;
          if (!dialogueIds.has(dlg)) errors.push(`${where}.interactions.${target}: dialogue '${dlg}' not found`);
          if (typeof e !== 'string') checkCondition(e.if, `${where}.interactions.${target}`);
        }
      }
      if (b.checkpoint != null) {
        if (checkpoints.has(b.checkpoint)) errors.push(`${where}: checkpoint ${b.checkpoint} already used by '${checkpoints.get(b.checkpoint)}'`);
        checkpoints.set(b.checkpoint, b.id);
      }
      (b.restore?.bios ?? []).forEach((id) => castIds.has(id) || errors.push(`${where}.restore: bio cast '${id}' not found`));
    }
  }

  hints.forEach((h) => {
    const where = `hint '${h.id}'`;
    if (h.if == null) errors.push(`${where}: needs an 'if' condition`);
    checkCondition(h.if, where);
    if (h.setFlag) flagsSet.add(h.setFlag);
  });

  if (endings.length) {
    if (endings.at(-1).if != null) errors.push(`endings: the last ending must have no 'if' (default)`);
    endings.forEach((e) => checkCondition(e.if, `ending '${e.id}'`));
  }

  if (codeLayouts) {
    const stored = new Set();
    for (const [version, l] of Object.entries(codeLayouts)) {
      l.flags.forEach((f) => {
        stored.add(f);
        if (!flagsSet.has(f)) errors.push(`code layout ${version}: flag '${f}' is never set by content`);
      });
      l.affinity.forEach((id) => castIds.has(id) || errors.push(`code layout ${version}: affinity cast '${id}' not found`));
      l.notes.forEach((id) => noteIds.has(id) || errors.push(`code layout ${version}: note '${id}' not found`));
    }
    for (const f of flagsSet) {
      if (PERSISTENT_FLAG.test(f) && !stored.has(f)) errors.push(`flag '${f}' is a persistent choice but no code layout stores it`);
    }
  }

  for (const { flag, where } of flagsRead) {
    if (!flagsSet.has(flag)) warnings.push(`${where}: flag '${flag}' is never set (fine only if a later chapter sets it)`);
  }

  return { errors, warnings };
}
