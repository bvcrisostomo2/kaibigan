// The Enter Code screen's logic (spec §3.9): decode the typed words, find the checkpoint beat,
// check the retyped name, and word every error the way the spec does.
import { decodeCode, codeLength } from '../story/saveCode.js';
import { findCheckpoint } from '../story/director.js';
import { validateName } from './letterIntro.js';
import { t } from './strings.js';

export function codeErrorMessage(error) {
  switch (error.kind) {
    case 'unknownWord':
    case 'ambiguousWord':
      return t(`code.error.${error.kind}`, { word: error.word, position: error.position });
    case 'length':
      return t('code.error.length', { count: codeLength() });
    default:
      return t(`code.error.${error.kind}`);
  }
}

// { ok: true, data, name, chapter, beat } or { ok: false, field: 'words' | 'name', message }.
export function submitCode(words, rawName, chapters) {
  const r = decodeCode(words);
  if (!r.ok) return { ok: false, field: 'words', message: codeErrorMessage(r.error) };
  const found = findCheckpoint(chapters, r.data.checkpoint);
  if (!found) return { ok: false, field: 'words', message: t('code.error.unknownCheckpoint') };
  const n = validateName(rawName);
  if (!n.ok) return { ok: false, field: 'name', message: t(`letter.nameError.${n.error}`) };
  return { ok: true, data: r.data, name: n.name, chapter: found.chapter, beat: found.beat };
}
