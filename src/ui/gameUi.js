// The in-game UI (spec §4.2, §5.1): dialogue box, glossary popup, title cards, toasts, Kodigo
// panel, Journal, Esc menu, chapter-end card, HUD and markers. It is the UI half of the director
// host (host.js) and listens to the story bus. It reads names, flags, notes, bios and code words
// only, never meter values.
//
// Views are injected: DOM views in the game (views/index.js), fakes in tests. Each is
//   { show(vm, handlers), hide() }   dialogue, glossary, titleCard, kodigo, journal, menu, chapterEnd
//   { render(vm) }                   hud, toasts, markers
//
// Input arrives as commands named like the engine's presses: 'interact', 'nav_up', 'nav_down',
// 'nav_left', 'nav_right', 'journal', 'menu', 'toggleControls', 'mute'. command() returns true when
// the UI used it; an unused 'interact' is the boot loop's cue to call director.interact().
//
// trackCheckpointCodes(ctx) must subscribe to the bus before this UI so `codes.latest` is fresh
// when the 'checkpoint' event reaches the Kodigo panel.
import { createDialogueBox, speakerFor } from './dialogueBox.js';
import { glossaryEntry } from './glossary.js';
import { createTitleCards } from './titleCard.js';
import { createToasts } from './toasts.js';
import { journalView, nextTab, JOURNAL_TABS } from './journal.js';
import { MENU_ITEMS, adjustSetting, menuRows } from './settings.js';
import { chapterEndView } from './chapterEnd.js';
import { hudView } from './hud.js';
import { wrapIndex } from './cursor.js';
import { t } from './strings.js';

export const KODIGO_SECONDS = 20;
const never = () => new Promise(() => {});

export function createGameUi({ views, ctx, content, codes, settings, emote = () => {}, onSettings = () => {}, onAction = () => {} }) {
  const { state, bus } = ctx;
  const { chapter, cast, glossary, notes, hints } = content;
  let current = { ...settings };
  let dialogue = null; // { runner, model, resolve, reject, emoted }
  let glossaryOpen = false;
  let journalTab = null;
  let menuCursor = null;
  let ended = false;
  let kodigoLeft = 0;
  let cardPhase = null;
  let disposed = false;
  let markersKey = null;
  const hud = { location: null, time: null, controlsVisible: true };
  const cards = createTitleCards();
  const toasts = createToasts();

  const blocking = () => dialogue != null || glossaryOpen || journalTab != null || menuCursor != null || ended;
  const renderHud = () => views.hud.render(hudView(hud));
  const renderToasts = () => views.toasts.render(toasts.items);
  const resumeTyping = () => {
    if (dialogue && !glossaryOpen && menuCursor == null) dialogue.model.pause(false);
  };

  // ---- Dialogue -------------------------------------------------------------------------------
  const dialogueHandlers = {
    // A click on the box finishes or advances text; only the choice buttons pick a choice.
    onConfirm: () => {
      if (!dialogue?.model.view()?.choices) command('interact');
    },
    onChoice: (index) => answer(dialogue?.model.pick(index)),
    onTerm: (id) => openGlossary(id),
  };
  const renderDialogue = () => views.dialogue.show({ ...dialogue.model.view(), nextLabel: t('dialogue.next') }, dialogueHandlers);

  function showLine() {
    const line = dialogue.runner.current();
    if (!line) return finishDialogue();
    const speaker = speakerFor(line.who, { cast, state });
    dialogue.model.setLine({ ...line, speaker });
    const actor = speaker.kind === 'player' ? 'player' : speaker.kind === 'npc' ? line.who : null;
    if (actor) {
      emote(actor, line.face && line.face !== 'neutral' ? line.face : null);
      dialogue.emoted.add(actor);
    }
    renderDialogue();
  }

  function closeDialogue() {
    const d = dialogue;
    dialogue = null;
    closeGlossary();
    views.dialogue.hide();
    for (const actor of d.emoted) emote(actor, null);
    return d;
  }
  const finishDialogue = () => closeDialogue().resolve();
  const failDialogue = (err) => closeDialogue().reject(err);

  function answer(result) {
    if (!result || !dialogue) return;
    try {
      if (result.type === 'finish') return renderDialogue();
      if (result.type === 'choose') dialogue.runner.choose(result.index);
      else dialogue.runner.advance();
      showLine();
    } catch (err) {
      failDialogue(err);
    }
  }

  function runDialogue(runner) {
    if (disposed) return never();
    if (dialogue) return Promise.reject(new Error('A dialogue is already open'));
    return new Promise((resolve, reject) => {
      dialogue = { runner, model: createDialogueBox({ speed: current.textSpeed }), resolve, reject, emoted: new Set() };
      if (menuCursor != null) dialogue.model.pause(true);
      try {
        showLine();
      } catch (err) {
        failDialogue(err);
      }
    });
  }

  // ---- Glossary -------------------------------------------------------------------------------
  function openGlossary(id) {
    if (!dialogue || menuCursor != null) return;
    glossaryOpen = true;
    dialogue.model.pause(true);
    views.glossary.show({ ...glossaryEntry(glossary, id), closeLabel: t('glossary.close') }, { onClose: closeGlossary });
  }
  function closeGlossary() {
    if (!glossaryOpen) return;
    glossaryOpen = false;
    views.glossary.hide();
    resumeTyping();
  }

  // ---- Kodigo panel ---------------------------------------------------------------------------
  function showKodigo(seconds) {
    const code = codes.latest;
    kodigoLeft = seconds;
    views.kodigo.show({
      code,
      words: code ? code.split(' ') : [],
      heading: t('kodigo.heading'),
      hint: code ? t('kodigo.hint') : t('kodigo.none'),
      copyLabel: t('kodigo.copy'),
      copiedLabel: t('kodigo.copied'),
      closeLabel: t('kodigo.close'),
    }, { onClose: hideKodigo });
  }
  function hideKodigo() {
    kodigoLeft = 0;
    views.kodigo.hide();
  }

  // ---- Journal --------------------------------------------------------------------------------
  function renderJournal() {
    const v = journalView(state, { cast, notes, hints });
    views.journal.show({
      ...v,
      tab: journalTab,
      title: t('journal.title'),
      tabs: JOURNAL_TABS.map((id) => ({ id, label: t(`journal.tab.${id}`) })),
      countLabel: t('journal.notesCount', { found: v.found, total: v.total }),
      feelingsLabel: t('journal.feelings'),
      emptyLabel: t('journal.empty'),
      closeLabel: t('journal.close'),
    }, {
      onTab(id) {
        journalTab = id;
        renderJournal();
      },
      onClose: closeJournal,
    });
  }
  function openJournal() {
    journalTab = JOURNAL_TABS[0];
    renderJournal();
  }
  function closeJournal() {
    if (journalTab == null) return;
    journalTab = null;
    views.journal.hide();
  }

  // ---- Esc menu -------------------------------------------------------------------------------
  function renderMenu() {
    views.menu.show({
      title: t('menu.title'),
      rows: menuRows(current),
      cursor: menuCursor,
      labels: { less: t('menu.less'), more: t('menu.more'), close: t('menu.close') },
    }, {
      onSelect(i) {
        menuCursor = i;
        activate();
      },
      onAdjust(i, delta) {
        menuCursor = i;
        adjust(delta);
      },
      onClose: closeMenu,
    });
  }
  function openMenu() {
    closeGlossary();
    closeJournal();
    menuCursor = 0;
    dialogue?.model.pause(true);
    renderMenu();
  }
  function closeMenu() {
    if (menuCursor == null) return;
    menuCursor = null;
    views.menu.hide();
    resumeTyping();
  }
  function applySettings(s) {
    current = s;
    dialogue?.model.setSpeed(s.textSpeed);
    onSettings(s);
  }
  function adjust(delta) {
    const s = adjustSetting(current, MENU_ITEMS[menuCursor], delta);
    if (!s) return;
    applySettings(s);
    renderMenu();
  }
  function activate() {
    const item = MENU_ITEMS[menuCursor];
    if (item === 'resume') return closeMenu();
    if (item === 'saveCode') {
      closeMenu();
      return showKodigo(Infinity);
    }
    if (item === 'resetPosition' || item === 'quit') {
      closeMenu();
      return onAction(item);
    }
    adjust(1);
  }

  // ---- Chapter end ----------------------------------------------------------------------------
  function showEnd() {
    closeMenu();
    closeJournal();
    hideKodigo();
    ended = true;
    const v = chapterEndView(state, { chapter: chapter.number, endCard: chapter.endCard, notes, code: codes.latest });
    views.chapterEnd.show({
      ...v,
      words: v.code ? v.code.split(' ') : [],
      labels: {
        heading: t('end.heading', { chapter: v.chapter }),
        recap: t('end.recap'),
        notes: t('end.notes', { found: v.found, total: v.total }),
        standing: t('end.standing'),
        think: t('end.think'),
        code: t('end.code'),
        continue: t('end.continue'),
      },
    }, { onContinue: () => onAction('quit') });
  }

  // ---- Title cards ----------------------------------------------------------------------------
  function renderCard() {
    const v = cards.view();
    if ((v?.phase ?? null) === cardPhase) return;
    cardPhase = v?.phase ?? null;
    if (v) views.titleCard.show(v);
    else views.titleCard.hide();
  }

  // ---- Bus --------------------------------------------------------------------------------------
  const journalToast = () => {
    toasts.push(t('toast.journal'));
    renderToasts();
  };
  const offs = [
    bus.on('checkpoint', () => showKodigo(KODIGO_SECONDS)),
    bus.on('hint', journalToast),
    bus.on('journal:note', journalToast),
    bus.on('journal:bio', journalToast),
    bus.on('chapter:end', showEnd),
    bus.on('beat:enter', ({ id }) => {
      const where = chapter.beats.find((b) => b.id === id)?.location;
      if (where && chapter.locations?.[where]) {
        hud.location = chapter.locations[where];
        renderHud();
      }
    }),
  ];

  // ---- Commands ---------------------------------------------------------------------------------
  function command(cmd) {
    if (disposed) return false;
    // M and H work everywhere (spec §4.3), whatever screen is open.
    if (cmd === 'mute') {
      applySettings(adjustSetting(current, 'mute', 1));
      if (menuCursor != null) renderMenu();
      return true;
    }
    if (cmd === 'toggleControls') {
      hud.controlsVisible = !hud.controlsVisible;
      renderHud();
      return true;
    }
    if (ended) {
      if (cmd === 'interact') onAction('quit');
      return true;
    }
    if (glossaryOpen) {
      if (cmd === 'interact' || cmd === 'menu') closeGlossary();
      return true;
    }
    if (menuCursor != null) {
      if (cmd === 'nav_up' || cmd === 'nav_down') {
        menuCursor = wrapIndex(menuCursor + (cmd === 'nav_up' ? -1 : 1), MENU_ITEMS.length);
        renderMenu();
      } else if (cmd === 'nav_left' || cmd === 'nav_right') adjust(cmd === 'nav_left' ? -1 : 1);
      else if (cmd === 'interact') activate();
      else if (cmd === 'menu') closeMenu();
      return true;
    }
    if (journalTab != null) {
      if (cmd === 'nav_left' || cmd === 'nav_right') {
        journalTab = nextTab(journalTab, cmd === 'nav_left' ? -1 : 1);
        renderJournal();
      } else if (cmd === 'journal' || cmd === 'menu' || cmd === 'interact') closeJournal();
      return true;
    }
    if (dialogue) {
      if ((cmd === 'nav_up' || cmd === 'nav_down') && dialogue.model.move(cmd === 'nav_up' ? -1 : 1)) renderDialogue();
      else if (cmd === 'interact') answer(dialogue.model.confirm());
      else if (cmd === 'menu') openMenu();
      return true;
    }
    switch (cmd) {
      case 'journal':
        openJournal();
        return true;
      case 'menu':
        openMenu();
        return true;
      default:
        return false;
    }
  }

  renderHud();

  return {
    // Host actions the UI performs ('titleCard'); anything else is an error.
    run(action) {
      if (disposed) return never();
      const [type, arg] = action;
      if (type !== 'titleCard') return Promise.reject(new Error(`UI cannot run '${type}'`));
      const card = chapter.titleCards?.[arg];
      if (!card) return Promise.reject(new Error(`Title card '${arg}' not found`));
      const shown = cards.show(card);
      renderCard();
      return shown;
    },
    runDialogue,
    command,
    update(dt) {
      if (disposed) return;
      if (!Number.isFinite(dt) || dt < 0) dt = 0;
      if (dialogue?.model.update(dt)) renderDialogue();
      cards.update(dt);
      renderCard();
      if (toasts.update(dt)) renderToasts();
      if (kodigoLeft > 0 && kodigoLeft !== Infinity) {
        kodigoLeft -= dt;
        if (kodigoLeft <= 0) hideKodigo();
      }
    },
    setTime(time) {
      if (disposed) return;
      hud.time = time;
      renderHud();
    },
    // A brief notice from the game, such as the low frame-rate suggestion (spec §7).
    notify(text) {
      if (disposed) return;
      toasts.push(text);
      renderToasts();
    },
    // [{ id, kind, x, y }] in screen pixels; hidden while a blocking screen is open. Redrawn only
    // when something changed.
    setMarkers(list) {
      if (disposed) return;
      const shown = blocking() ? [] : list;
      const key = JSON.stringify(shown);
      if (key === markersKey) return;
      markersKey = key;
      views.markers.render(shown);
    },
    get isBlocking() {
      return blocking();
    },
    get settings() {
      return current;
    },
    get disposed() {
      return disposed;
    },
    // The current time of day ('dusk', …) as set by the chapter, or null before the first setTime.
    get time() {
      return hud.time;
    },
    // Quitting to the title: unsubscribe and hide everything. A dialogue still open is abandoned
    // (its promise never settles; the director it belongs to is discarded with it), and from now on
    // run() and runDialogue() never settle and command() does nothing.
    dispose() {
      disposed = true;
      for (const off of offs) off();
      cards.clear();
      if (dialogue) {
        views.dialogue.hide();
        dialogue = null;
      }
      for (const v of [views.glossary, views.titleCard, views.kodigo, views.journal, views.menu, views.chapterEnd]) v.hide();
      views.markers.render([]);
      views.toasts.render([]);
      views.hud.render(hudView({ location: null, time: null, controlsVisible: false }));
    },
  };
}
