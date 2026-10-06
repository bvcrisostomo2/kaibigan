import { describe, it, expect } from 'vitest';
import { validateName, signLetter, NAME_MAX } from '../../src/ui/letterIntro.js';
import { submitCode, codeErrorMessage } from '../../src/ui/codeEntry.js';
import { titleMenu, resumeBeat } from '../../src/ui/titleScreen.js';
import { createState } from '../../src/story/state.js';
import { encodeCode, codeLength } from '../../src/story/saveCode.js';
import { miniChapter } from '../fixtures/miniChapter.js';

describe('validateName', () => {
  it('accepts names with ñ, accents, spaces, apostrophes and hyphens, tidying spaces', () => {
    expect(validateName('  Juan   dela Cruz ')).toEqual({ ok: true, name: 'Juan dela Cruz' });
    expect(validateName('Begoña')).toEqual({ ok: true, name: 'Begoña' });
    expect(validateName('Begoña').ok).toBe(true); // ñ typed as n + combining tilde
    expect(validateName("O'Brien-Íñiguez").ok).toBe(true);
  });

  it('rejects empty, too long and other characters', () => {
    expect(validateName('   ')).toEqual({ ok: false, error: 'empty' });
    expect(validateName(undefined)).toEqual({ ok: false, error: 'empty' });
    expect(validateName('a'.repeat(NAME_MAX)).ok).toBe(true);
    expect(validateName('a'.repeat(NAME_MAX + 1))).toEqual({ ok: false, error: 'long' });
    expect(validateName('Ana2')).toEqual({ ok: false, error: 'chars' });
    expect(validateName('<b>')).toEqual({ ok: false, error: 'chars' });
    expect(validateName("'Ana")).toEqual({ ok: false, error: 'chars' });
  });
});

describe('signLetter', () => {
  it('returns the name and title, or the name error', () => {
    expect(signLetter(' Ana ', 'Doña')).toEqual({ ok: true, name: 'Ana', title: 'Doña' });
    expect(signLetter('', 'Don')).toEqual({ ok: false, error: 'empty' });
    expect(() => signLetter('Ana', 'Sir')).toThrow('Unknown title: Sir');
  });
});

describe('submitCode', () => {
  const chapters = [miniChapter];
  const codeFor = (checkpoint) => {
    const s = createState({ name: 'x', title: 'Doña' });
    s.checkpoint = checkpoint;
    s.flags.push('ch1_tactful');
    return encodeCode(s);
  };

  it('finds the checkpoint beat and checks the retyped name', () => {
    const r = submitCode(codeFor(2), ' Ana ', chapters);
    expect(r).toMatchObject({ ok: true, name: 'Ana', beat: { id: 'dinner' } });
    expect(r.data).toMatchObject({ checkpoint: 2, title: 'Doña', flags: ['ch1_tactful'] });
    expect(submitCode(codeFor(2), '', chapters)).toEqual({ ok: false, field: 'name', message: 'Please write your name.' });
  });

  it("uses the spec's messages for bad codes", () => {
    const words = codeFor(1).split(' ');
    const wrong = [...words];
    wrong[3] = 'zzzz';
    expect(submitCode(wrong.join(' '), 'Ana', chapters)).toEqual({ ok: false, field: 'words', message: "I don't recognize the word 'zzzz' (word 4)." });
    expect(submitCode('', 'Ana', chapters).message).toBe('Please type the words of your code.');
    expect(submitCode([words[1], words[0], ...words.slice(2)].join(' '), 'Ana', chapters).message).toBe("Something's wrong with this code. Please check the words.");
    expect(submitCode(codeFor(40), 'Ana', chapters).message).toBe("This code is for a part of the story this version doesn't have yet.");
  });

  it('words every decode error kind', () => {
    expect(codeErrorMessage({ kind: 'length' })).toBe(`This code has the wrong number of words. A code has ${codeLength()} words.`);
    expect(codeErrorMessage({ kind: 'newerVersion' })).toBe('This code is from a newer version of the game');
    expect(codeErrorMessage({ kind: 'ambiguousWord', word: 'bah', position: 2 })).toContain("'bah' (word 2)");
  });
});

describe('titleMenu', () => {
  const chapters = [miniChapter];
  const saved = (beat, checkpoint = 1) => ({ ...createState({ name: 'Ana' }), beat, checkpoint });

  it('offers Continue only for a resumable save', () => {
    expect(titleMenu({ state: saved('dinner', 2) }, chapters)).toEqual({ items: ['continue', 'newGame', 'enterCode'], notice: null, resume: 'dinner' });
    expect(titleMenu({ error: 'none' }, chapters)).toEqual({ items: ['newGame', 'enterCode'], notice: null, resume: null });
    expect(titleMenu({ error: 'unavailable' }, chapters).notice).toBe(null);
  });

  it('says the save was discarded when it is corrupt, too old, or points nowhere', () => {
    expect(titleMenu({ error: 'corrupt' }, chapters).notice).toBe('title.saveDiscarded');
    expect(titleMenu({ error: 'version' }, chapters).notice).toBe('title.saveDiscarded');
    expect(titleMenu({ state: saved('gone', 9) }, chapters)).toMatchObject({ items: ['newGame', 'enterCode'], notice: 'title.saveDiscarded' });
  });

  it('resumes a removed beat at its checkpoint', () => {
    expect(resumeBeat(saved('gone', 2), chapters)).toBe('dinner');
    expect(resumeBeat(saved('close', 2), chapters)).toBe('close');
  });
});
