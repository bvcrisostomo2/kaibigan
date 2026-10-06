import { describe, it, expect, vi } from 'vitest';
import { createBus } from '../../src/story/events.js';
import { createState } from '../../src/story/state.js';
import { createDirector } from '../../src/story/director.js';
import { trackCheckpointCodes, decodeCode } from '../../src/story/saveCode.js';
import { plainText } from '../../src/story/text.js';
import { createGameUi, KODIGO_SECONDS } from '../../src/ui/gameUi.js';
import { composeHost } from '../../src/ui/host.js';
import { defaultSettings, MENU_ITEMS } from '../../src/ui/settings.js';
import { miniChapter, miniCast, miniGlossary, miniNotes, miniHints } from '../fixtures/miniChapter.js';
import { fakeViews, flush } from '../support/fakeViews.js';

// The mini chapter plus the UI content a real chapter carries.
const chapter = {
  ...miniChapter,
  titleCards: { 1: { title: 'Kabanata I', subtitle: 'Chapter I' }, 2: { title: 'Kabanata III', subtitle: 'Chapter III' } },
  locations: { casa: { name: 'Casa de Capitan Tiago', detail: 'Binondo · 1880s' } },
  endCard: { recap: 'A dinner.', prompts: ['One?', 'Two?', 'Three?'], standings: [{ if: { tiwalaAtLeast: 1 }, text: 'Ibarra trusts you.' }, { if: { tiwalaBelow: 1 }, text: 'Ibarra is wary.' }] },
  beats: miniChapter.beats.map((b) => (b.id === 'arrive' ? { ...b, location: 'casa' } : b)),
};
const cast = miniCast.map((c) => ({ ...c, name: { isabel: 'Tía Isabel', damaso: 'Padre Dámaso', ibarra: 'Ibarra' }[c.id], costume: c.id }));

function setup() {
  const views = fakeViews();
  const state = createState({ name: 'Ana', title: 'Doña' });
  const bus = createBus({ onError: (e) => { throw e; } });
  const ctx = { state, bus, hints: miniHints };
  const codes = trackCheckpointCodes(ctx); // before the UI, so codes.latest is fresh at 'checkpoint'
  const emote = vi.fn();
  const onSettings = vi.fn();
  const onAction = vi.fn();
  const ui = createGameUi({
    views, ctx, codes, emote, onSettings, onAction,
    content: { chapter, cast, glossary: miniGlossary, notes: miniNotes, hints: miniHints },
    settings: defaultSettings('high'),
  });
  const stage = { handles: (type) => ['moveTo', 'setTime', 'emote'].includes(type), run: vi.fn(async () => {}) };
  const director = createDirector({ chapter, ctx, host: composeHost({ stage, ui }) });
  return { views, state, bus, ctx, codes, ui, director, stage, emote, onSettings, onAction };
}

// Press Talk until the open dialogue's typing is done (one press finishes a line).
const say = (ui) => ui.command('interact');

describe('createGameUi: a chapter played through the UI', () => {
  it('shows the title card, then types and advances a dialogue with expressions', async () => {
    const { views, ui, director, emote } = setup();
    let started = false;
    director.start().then(() => (started = true));
    await flush();
    expect(views.titleCard.vm).toEqual({ title: 'Kabanata I', subtitle: 'Chapter I', phase: 'in' });
    expect(views.dialogue.visible).toBe(false);
    ui.update(3.1);
    await flush();
    expect(views.titleCard.visible).toBe(false);
    expect(views.dialogue.vm).toMatchObject({ speaker: { kind: 'npc', name: 'Tía Isabel' }, face: 'neutral', typing: true, segments: [] });
    expect(emote).toHaveBeenCalledWith('isabel', null);
    ui.update(0.1);
    expect(plainText(views.dialogue.vm.segments)).toBe('Welcom'); // 0.1 s at 60 characters a second
    say(ui); // finish typing
    expect(plainText(views.dialogue.vm.segments)).toBe('Welcome, Doña Ana!');
    expect(ui.isBlocking).toBe(true);
    say(ui); // advance: the dialogue ends
    await flush();
    expect(views.dialogue.visible).toBe(false);
    expect(started).toBe(true);
    expect(ui.isBlocking).toBe(false);
  });

  it('opens glossary terms, picks choices with the cursor and ends on the chapter-end card', async () => {
    const { views, ui, director, emote, state } = setup();
    director.start();
    await flush();
    ui.update(3.1);
    await flush();
    say(ui);
    say(ui);
    await flush();

    director.interact('isabel');
    await flush();
    const term = views.dialogue.vm;
    views.dialogue.handlers.onTerm('indio');
    expect(views.glossary.vm).toMatchObject({ id: 'indio', title: 'indio', body: 'Colonial label for native Filipinos.' });
    ui.update(5);
    expect(views.dialogue.vm).toBe(term); // typing paused while the glossary is open
    say(ui); // closes the glossary
    expect(views.glossary.visible).toBe(false);
    say(ui);
    say(ui);
    await flush(); // dinner beat: title card 2, moveTo, then Dámaso
    ui.update(3.1);
    await flush();
    expect(views.dialogue.vm.speaker.name).toBe('Padre Dámaso');
    expect(emote).toHaveBeenCalledWith('damaso', 'angry');
    say(ui);
    say(ui);
    expect(views.dialogue.vm.speaker).toMatchObject({ kind: 'player', name: 'Doña Ana', costume: 'player_dona' });
    expect(views.dialogue.vm.choices).toBe(null); // still typing
    say(ui);
    expect(views.dialogue.vm.choices).toHaveLength(3);
    ui.command('nav_down');
    expect(views.dialogue.vm.cursor).toBe(1);
    say(ui); // "Change the subject with tact."
    await flush();
    expect(state.flags).toContain('ch1_tactful');
    expect(emote).toHaveBeenCalledWith('damaso', null); // expressions cleared when the dialogue ends
    say(ui);
    say(ui);
    await flush();
    expect(director.ended).toBe(true);
    expect(views.chapterEnd.vm).toMatchObject({ recap: 'A dinner.', standings: ['Ibarra trusts you.'], found: 1, total: 1 });
    expect(views.chapterEnd.vm.labels.heading).toBe('End of Chapter 1');
    expect(ui.isBlocking).toBe(true);
  });

  it('shows the Kodigo panel with the checkpoint code, then hides it', async () => {
    const { views, ui, director, codes } = setup();
    director.start();
    await flush();
    expect(views.kodigo.visible).toBe(true);
    expect(views.kodigo.vm.words.join(' ')).toBe(codes.latest);
    expect(decodeCode(codes.latest).data.checkpoint).toBe(1);
    expect(ui.isBlocking).toBe(false); // the panel never blocks play
    ui.update(KODIGO_SECONDS + 1);
    expect(views.kodigo.visible).toBe(false);
  });

  it('updates the HUD location on beat entry and the time from setTime', async () => {
    const { views, ui, director } = setup();
    director.start();
    await flush();
    expect(views.hud.vm).toMatchObject({ place: 'Casa de Capitan Tiago', detail: 'Binondo · 1880s' });
    ui.setTime('night');
    expect(views.hud.vm.time).toBe('Night');
    ui.command('toggleControls');
    expect(views.hud.vm.controls).toBe(null);
  });

  it('shows a notice toast on request (e.g. the low frame-rate suggestion)', () => {
    const { views, ui } = setup();
    ui.notify('Running slowly');
    expect(views.toasts.vm).toEqual([{ id: 1, text: 'Running slowly' }]);
  });

  it('toasts "Journal updated" once for a note, a bio or a hint', () => {
    const { views, bus } = setup();
    bus.emit('journal:note', { id: 'note_indio' });
    bus.emit('hint', { id: 'eyes', journal: 'x' });
    expect(views.toasts.vm).toEqual([{ id: 1, text: 'Journal updated' }]);
  });
});

describe('createGameUi: screens and commands', () => {
  it('opens the Journal, switches tabs and closes it; markers hide while it is open', () => {
    const { views, ui, state } = setup();
    state.bios.push('isabel');
    state.notes.push('note_indio');
    ui.setMarkers([{ id: 'isabel', kind: '!', x: 10, y: 20 }]);
    expect(views.markers.vm).toHaveLength(1);
    expect(ui.command('journal')).toBe(true);
    expect(views.journal.vm).toMatchObject({ tab: 'characters', characters: [{ id: 'isabel', name: 'Tía Isabel' }], countLabel: '1 of 1 found' });
    ui.setMarkers([{ id: 'isabel', kind: '!', x: 10, y: 20 }]);
    expect(views.markers.vm).toEqual([]);
    ui.command('nav_right');
    expect(views.journal.vm.tab).toBe('notes');
    ui.command('journal');
    expect(views.journal.visible).toBe(false);
    expect(ui.isBlocking).toBe(false);
  });

  it('runs the Esc menu: cursor, settings, save code, reset position and quit', () => {
    const { views, ui, onSettings, onAction } = setup();
    ui.command('menu');
    expect(views.menu.vm.rows.map((r) => r.id)).toEqual(MENU_ITEMS);
    expect(views.menu.vm.cursor).toBe(0);
    ui.command('nav_up');
    expect(views.menu.vm.cursor).toBe(MENU_ITEMS.length - 1);
    ui.command('nav_down');
    ui.command('nav_down');
    ui.command('nav_down'); // text speed
    ui.command('nav_right');
    expect(onSettings).toHaveBeenLastCalledWith(expect.objectContaining({ textSpeed: 'fast' }));
    expect(ui.settings.textSpeed).toBe('fast');
    views.menu.handlers.onSelect(MENU_ITEMS.indexOf('saveCode'));
    expect(views.menu.visible).toBe(false);
    expect(views.kodigo.vm.hint).toBe('No save code yet. One appears at the start of each part of the story.');
    ui.update(KODIGO_SECONDS + 1);
    expect(views.kodigo.visible).toBe(true); // opened from the menu: stays until closed
    views.kodigo.handlers.onClose();
    ui.command('menu');
    views.menu.handlers.onSelect(MENU_ITEMS.indexOf('resetPosition'));
    expect(onAction).toHaveBeenLastCalledWith('resetPosition');
    ui.command('menu');
    views.menu.handlers.onSelect(MENU_ITEMS.indexOf('quit'));
    expect(onAction).toHaveBeenLastCalledWith('quit');
    ui.command('menu');
    ui.command('menu'); // Esc again closes it
    expect(views.menu.visible).toBe(false);
  });

  it('toggles mute from M and leaves Talk to the game when nothing is open', () => {
    const { ui, onSettings } = setup();
    expect(ui.command('mute')).toBe(true);
    expect(onSettings).toHaveBeenLastCalledWith(expect.objectContaining({ muted: true }));
    expect(ui.command('interact')).toBe(false);
    expect(ui.command('nav_up')).toBe(false);
  });

  it('rejects host actions it does not perform and unknown title cards', async () => {
    const { ui } = setup();
    await expect(ui.run(['cutscene', 'x'])).rejects.toThrow("UI cannot run 'cutscene'");
    await expect(ui.run(['titleCard', 9])).rejects.toThrow("Title card '9' not found");
  });

  it('closes the box and rejects when a dialogue fails, so the game is never stuck', async () => {
    const { views, ui } = setup();
    const broken = { id: 'x', done: false, current() { throw new Error('bad content'); } };
    await expect(ui.runDialogue(broken)).rejects.toThrow('bad content');
    expect(views.dialogue.visible).toBe(false);
    expect(ui.isBlocking).toBe(false);
  });

  it('refuses a second dialogue while one is open', async () => {
    const { ui } = setup();
    const line = { id: 'a', who: 'isabel', face: null, segments: [{ kind: 'text', text: 'Hi' }], choices: null };
    const runner = { id: 'r', done: false, current: () => line, advance() {} };
    ui.runDialogue(runner);
    await expect(ui.runDialogue(runner)).rejects.toThrow('A dialogue is already open');
  });

  it('ignores bad frame times', () => {
    const { ui } = setup();
    expect(() => ui.update(NaN)).not.toThrow();
    expect(() => ui.update(-1)).not.toThrow();
  });

  it('disposes: hides every screen and stops listening to the story', async () => {
    const { views, ui, bus } = setup();
    ui.command('journal');
    ui.dispose();
    expect(views.journal.visible).toBe(false);
    bus.emit('checkpoint', { id: 1, beat: 'arrive' });
    expect(views.kodigo.visible).toBe(false);
  });
});

describe('composeHost', () => {
  it('sends engine actions to the stage and the rest to the UI; setTime also reaches the HUD', async () => {
    const stage = { handles: (type) => type === 'setTime' || type === 'moveTo', run: vi.fn(async () => 'stage') };
    const ui = { run: vi.fn(async () => 'ui'), runDialogue: vi.fn(async () => 'dialogue'), setTime: vi.fn() };
    const host = composeHost({ stage, ui });
    await expect(host.run(['moveTo', 'tiago', 'door'])).resolves.toBe('stage');
    await expect(host.run(['titleCard', 1])).resolves.toBe('ui');
    await host.run(['setTime', 'night', 2]);
    expect(ui.setTime).toHaveBeenCalledWith('night');
    await expect(host.runDialogue('runner')).resolves.toBe('dialogue');
  });
});
