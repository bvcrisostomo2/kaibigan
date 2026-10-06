import { describe, it, expect } from 'vitest';
import { wrapIndex } from '../../src/ui/cursor.js';
import { createTypewriter, revealSegments, segmentsLength, TEXT_SPEEDS } from '../../src/ui/typewriter.js';
import { createDialogueBox, speakerFor } from '../../src/ui/dialogueBox.js';
import { glossaryEntry } from '../../src/ui/glossary.js';
import { parseText } from '../../src/story/text.js';
import { createState } from '../../src/story/state.js';

describe('wrapIndex', () => {
  it('wraps both ways and tolerates empty lists', () => {
    expect(wrapIndex(3, 3)).toBe(0);
    expect(wrapIndex(-1, 3)).toBe(2);
    expect(wrapIndex(7, 3)).toBe(1);
    expect(wrapIndex(5, 0)).toBe(0);
  });
});

describe('typewriter', () => {
  it('reveals characters at the chosen speed and stops at the end', () => {
    const tw = createTypewriter(10, 'normal'); // 60 chars/s
    expect(tw.visible).toBe(0);
    expect(tw.update(0.05)).toBe(true);
    expect(tw.visible).toBe(3);
    tw.update(1);
    expect(tw.visible).toBe(10);
    expect(tw.done).toBe(true);
    expect(tw.update(1)).toBe(false);
  });

  it('shows everything at once on instant, and finish() skips ahead', () => {
    expect(createTypewriter(40, 'instant').done).toBe(true);
    const tw = createTypewriter(40, 'slow');
    tw.finish();
    expect(tw.visible).toBe(40);
    expect(TEXT_SPEEDS.slow).toBeLessThan(TEXT_SPEEDS.fast);
  });

  it('ignores bad frame times', () => {
    const tw = createTypewriter(10);
    for (const dt of [NaN, Infinity, -1, 0]) expect(tw.update(dt)).toBe(false);
    expect(tw.visible).toBe(0);
  });

  it('reveals segments by character count, keeping glossary terms', () => {
    const segs = parseText('I know the {g:indio|indios} well.', { name: '', title: '' });
    expect(segmentsLength(segs)).toBe('I know the indios well.'.length);
    expect(revealSegments(segs, 13)).toEqual([{ kind: 'text', text: 'I know the ' }, { kind: 'term', id: 'indio', text: 'in' }]);
    expect(revealSegments(segs, 0)).toEqual([]);
    expect(revealSegments(segs, 99)).toEqual(segs);
  });
});

describe('speakerFor', () => {
  const cast = [{ id: 'isabel', name: 'Tía Isabel', costume: 'isabel' }];

  it('names cast members, the player (with title) and the narrator', () => {
    const state = createState({ name: 'Ana', title: 'Doña' });
    expect(speakerFor('isabel', { cast, state })).toEqual({ kind: 'npc', name: 'Tía Isabel', costume: 'isabel' });
    expect(speakerFor('player', { cast, state })).toEqual({ kind: 'player', name: 'Doña Ana', costume: 'player_dona' });
    expect(speakerFor('player', { cast, state: createState({ name: 'Juan' }) }).costume).toBe('player_don');
    expect(speakerFor('narrator', { cast, state })).toEqual({ kind: 'narrator', name: null, costume: null });
    expect(speakerFor(null, { cast, state }).kind).toBe('narrator');
    expect(speakerFor('stranger', { cast, state })).toEqual({ kind: 'npc', name: 'stranger', costume: null });
  });
});

describe('createDialogueBox', () => {
  const speaker = { kind: 'npc', name: 'Padre Dámaso', costume: 'damaso' };
  const seg = (text) => parseText(text, { name: 'Ana', title: 'Doña' });

  it('types a line, finishes it on confirm, then advances', () => {
    const box = createDialogueBox({ speed: 'normal' });
    box.setLine({ id: 'a', who: 'damaso', face: 'angry', segments: seg('Twenty years!'), choices: null, speaker });
    expect(box.view()).toMatchObject({ speaker, face: 'angry', segments: [], typing: true, choices: null });
    expect(box.update(0.05)).toBe(true);
    expect(box.view().segments[0].text).toBe('Twe');
    expect(box.confirm()).toEqual({ type: 'finish' });
    expect(box.view()).toMatchObject({ typing: false, segments: seg('Twenty years!') });
    expect(box.confirm()).toEqual({ type: 'advance' });
  });

  it('shows choices once the text is typed, moves the cursor and picks', () => {
    const box = createDialogueBox({ speed: 'instant' });
    const choices = [{ index: 0, segments: seg('Listen.') }, { index: 1, segments: seg('Object.') }, { index: 2, segments: seg('Leave.') }];
    box.setLine({ id: 'c', who: 'player', face: null, segments: seg('How do you answer?'), choices, speaker });
    expect(box.view()).toMatchObject({ face: 'neutral', choices, cursor: 0 });
    expect(box.move(-1)).toBe(true);
    expect(box.view().cursor).toBe(2);
    expect(box.confirm()).toEqual({ type: 'choose', index: 2 });
    expect(box.pick(1)).toEqual({ type: 'choose', index: 1 });
    expect(box.pick(9)).toBe(null);
  });

  it('hides choices while typing, and handles a choice-only node', () => {
    const box = createDialogueBox({ speed: 'slow' });
    const choices = [{ index: 0, segments: seg('Yes.') }];
    box.setLine({ id: 'c', who: 'player', segments: seg('Well?'), choices, speaker });
    expect(box.view().choices).toBe(null);
    expect(box.move(1)).toBe(false);
    expect(box.pick(0)).toBe(null);
    box.setLine({ id: 'd', who: 'player', segments: null, choices, speaker });
    expect(box.view().choices).toEqual(choices);
  });

  it('pauses typing (glossary or menu open) and applies a new speed from the next line', () => {
    const box = createDialogueBox({ speed: 'slow' });
    box.setLine({ id: 'a', segments: seg('Hello there'), choices: null, speaker });
    box.pause(true);
    expect(box.update(1)).toBe(false);
    box.pause(false);
    box.setSpeed('instant');
    box.setLine({ id: 'b', segments: seg('Next line'), choices: null, speaker });
    expect(box.view().typing).toBe(false);
  });

  it('returns nothing before the first line', () => {
    const box = createDialogueBox();
    expect(box.view()).toBe(null);
    expect(box.confirm()).toBe(null);
    expect(box.update(1)).toBe(false);
  });
});

describe('glossaryEntry', () => {
  it('finds a term, and falls back to its id', () => {
    const glossary = [{ id: 'indio', title: 'indio', body: 'A colonial label.' }];
    expect(glossaryEntry(glossary, 'indio')).toEqual({ id: 'indio', title: 'indio', body: 'A colonial label.' });
    expect(glossaryEntry(glossary, 'guardia_civil')).toEqual({ id: 'guardia_civil', title: 'guardia civil', body: '' });
  });
});
