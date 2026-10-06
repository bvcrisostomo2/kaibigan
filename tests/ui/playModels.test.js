import { describe, it, expect } from 'vitest';
import { createState } from '../../src/story/state.js';
import { journalView, nextTab, JOURNAL_TABS } from '../../src/ui/journal.js';
import { chapterEndView } from '../../src/ui/chapterEnd.js';
import { hudView } from '../../src/ui/hud.js';
import { markersFor, talkTarget, MARKER_RANGE } from '../../src/ui/markers.js';
import { createTitleCards, TITLE_CARD_TIMING } from '../../src/ui/titleCard.js';
import { createToasts } from '../../src/ui/toasts.js';
import { stickVector, STICK_RADIUS } from '../../src/ui/touchControls.js';

const cast = [{ id: 'isabel', name: 'Tía Isabel', bio: 'Your hostess.' }, { id: 'damaso', name: 'Padre Dámaso' }];
const notes = [{ id: 'note_a', title: 'A', body: 'aa' }, { id: 'note_b', title: 'B', body: 'bb' }, { id: 'note_c', title: 'C', body: 'cc' }];
const hints = [{ id: 'eyes', journal: 'You sense eyes on you.' }, { id: 'quiet', journal: 'Isabel is quiet.' }];

describe('journalView', () => {
  it('lists unlocked bios, found notes with the total, and felt hints, in unlock order', () => {
    const state = createState({ name: 'Ana' });
    state.bios.push('damaso', 'isabel', 'nobody');
    state.notes.push('note_c', 'note_a');
    state.hintsShown.push('eyes');
    expect(journalView(state, { cast, notes, hints })).toEqual({
      characters: [{ id: 'damaso', name: 'Padre Dámaso', bio: '' }, { id: 'isabel', name: 'Tía Isabel', bio: 'Your hostess.' }],
      notes: [{ id: 'note_c', title: 'C', body: 'cc' }, { id: 'note_a', title: 'A', body: 'aa' }],
      found: 2,
      total: 3,
      feelings: ['You sense eyes on you.'],
    });
  });

  it('never exposes meter values', () => {
    const state = createState({ name: 'Ana' });
    state.tiwala = 47;
    state.hinala = 59;
    expect(JSON.stringify(journalView(state, { cast, notes, hints }))).not.toMatch(/tiwala|hinala|47|59/);
  });

  it('cycles tabs', () => {
    expect(JOURNAL_TABS).toEqual(['characters', 'notes']);
    expect(nextTab('characters', 1)).toBe('notes');
    expect(nextTab('characters', -1)).toBe('notes');
    expect(nextTab('notes', 1)).toBe('characters');
  });
});

describe('chapterEndView', () => {
  it('shows only the standings whose conditions hold, in words', () => {
    const state = createState({ name: 'Ana' });
    state.tiwala = 2;
    state.notes.push('note_a', 'elsewhere');
    const endCard = {
      recap: 'Things happened.',
      prompts: ['Why?', 'How?', 'What if?'],
      standings: [
        { if: { tiwalaAtLeast: 2 }, text: 'Ibarra trusts you.' },
        { if: { tiwalaBelow: 2 }, text: 'Ibarra keeps his thoughts to himself.' },
        { text: 'The night is not over.' },
      ],
    };
    expect(chapterEndView(state, { chapter: 1, endCard, notes, code: 'a b c' })).toEqual({
      chapter: 1,
      recap: 'Things happened.',
      found: 1,
      total: 3,
      standings: ['Ibarra trusts you.', 'The night is not over.'],
      prompts: ['Why?', 'How?', 'What if?'],
      code: 'a b c',
    });
  });
});

describe('hudView', () => {
  it('shows the location, the time and, unless hidden, the controls', () => {
    expect(hudView({ location: { name: 'Casa', detail: 'Binondo · 1880s' }, time: 'dusk', controlsVisible: true })).toEqual({
      place: 'Casa',
      detail: 'Binondo · 1880s',
      time: 'Dusk',
      controls: expect.stringContaining('Esc: menu'),
    });
    expect(hudView({ location: null, time: null, controlsVisible: false })).toEqual({ place: '', detail: '', time: '', controls: null });
  });
});

describe('markersFor', () => {
  const player = { x: 0, y: 0, z: 0 };
  const dialogues = { isabel: 'isabel_chat', damaso: 'insult', tiago: null };
  const opts = { dialogueFor: (id) => dialogues[id] ?? null, seen: (d) => d === 'insult' };

  it('marks nearby interactables: "!" when new, "…" when seen', () => {
    const targets = [
      { id: 'isabel', x: 1, y: 0, z: 1 },
      { id: 'damaso', x: -2, y: 0, z: 0 },
      { id: 'tiago', x: 0.5, y: 0, z: 0 }, // nothing to say now
      { id: 'far', x: MARKER_RANGE + 0.1, y: 0, z: 0 },
    ];
    expect(markersFor(targets, player, opts)).toEqual([{ id: 'isabel', kind: '!' }, { id: 'damaso', kind: '…' }]);
  });

  it('skips someone on another floor', () => {
    expect(markersFor([{ id: 'isabel', x: 0.5, y: 3, z: 0 }], player, opts)).toEqual([]);
  });
});

describe('title cards', () => {
  const card = { title: 'Kabanata I: Isang Handaan', subtitle: 'Chapter I: A Gathering' };

  it('slides in, holds, slides out and then resolves', async () => {
    const cards = createTitleCards();
    let done = false;
    cards.show(card).then(() => (done = true));
    expect(cards.view()).toEqual({ ...card, phase: 'in' });
    cards.update(TITLE_CARD_TIMING.in + 0.1);
    expect(cards.view().phase).toBe('hold');
    cards.update(TITLE_CARD_TIMING.hold);
    expect(cards.view().phase).toBe('out');
    cards.update(TITLE_CARD_TIMING.out);
    await Promise.resolve();
    expect(done).toBe(true);
    expect(cards.view()).toBe(null);
  });

  it('queues cards, ignores bad frame times and clears (resolving) on quit', async () => {
    const cards = createTitleCards();
    const order = [];
    cards.show(card).then(() => order.push(1));
    cards.show({ ...card, title: 'II' }).then(() => order.push(2));
    cards.update(NaN);
    cards.update(Infinity);
    expect(cards.view().phase).toBe('in');
    cards.update(3);
    expect(cards.view().title).toBe('II');
    cards.clear();
    await Promise.resolve();
    expect(order).toEqual([1, 2]);
    expect(cards.view()).toBe(null);
  });
});

describe('toasts', () => {
  it('expire after their time and never stack the same text', () => {
    const toasts = createToasts({ seconds: 2 });
    toasts.push('Journal updated');
    toasts.update(1.5);
    toasts.push('Journal updated');
    expect(toasts.items).toHaveLength(1);
    expect(toasts.update(1.5)).toBe(false); // restarted
    expect(toasts.update(1)).toBe(true);
    expect(toasts.items).toEqual([]);
    expect(toasts.update(NaN)).toBe(false);
  });
});

describe('stickVector', () => {
  it('maps a drag to movement with a deadzone and a unit cap; screen up is north', () => {
    expect(stickVector(0, -STICK_RADIUS)).toEqual({ x: 0, z: -1 });
    expect(stickVector(STICK_RADIUS / 2, 0)).toEqual({ x: 0.5, z: 0 });
    expect(stickVector(2, 2)).toEqual({ x: 0, z: 0 });
    const far = stickVector(300, 400);
    expect(Math.hypot(far.x, far.z)).toBeCloseTo(1);
    expect(stickVector(NaN, 0)).toEqual({ x: 0, z: 0 });
  });
});

describe('talkTarget', () => {
  const player = { x: 0, y: 0, z: 0 };
  const targets = [
    { id: 'isabel', x: 1.5, y: 0, z: 0 },
    { id: 'staircase', x: 0.8, y: 0, z: 0.5 },
    { id: 'damaso', x: 0.5, y: 3.5, z: 0 }, // upstairs
    { id: 'far', x: MARKER_RANGE + 0.1, y: 0, z: 0 },
  ];

  it('picks the nearest open target on the same floor within the marker range', () => {
    expect(MARKER_RANGE).toBe(2);
    expect(talkTarget(targets, player, new Set(['isabel', 'staircase', 'damaso', 'far']))).toBe('staircase');
    expect(talkTarget(targets, player, new Set(['isabel', 'damaso', 'far']))).toBe('isabel');
    expect(talkTarget(targets, player, new Set(['damaso', 'far']))).toBe(null);
  });
});
