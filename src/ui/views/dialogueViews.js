// DOM views for the dialogue (bubble or box) and the glossary popup (see gameUi.js for their view
// models).
import { h, createScreen } from '../dom.js';
import { portraitImage } from './portrait.js';

const stop = (fn) => (e) => {
  e.stopPropagation();
  fn();
};

function textNodes(segments, onTerm) {
  return segments.map((seg) => (seg.kind === 'term' && onTerm
    ? h('button', { type: 'button', class: 'ui-term', onclick: stop(() => onTerm(seg.id)) }, seg.text)
    : seg.text));
}

// The dialogue (Plan 5 spec §4.4): a speech bubble at the speaker, placed by gameUi through
// place(), or the bottom box for narration, choices and a speaker who can't be placed. Both carry
// a hexagonal portrait and a button that opens the conversation so far.
export function createDialogueView(root) {
  const s = createScreen(root, 'ui-dialogue');
  let vm = null;
  let handlers = null;
  let placement = null;
  let placed = false; // place() was called for this conversation (null then means: no anchor)
  let size = { w: 320, h: 110 }; // the bubble's last measured size, for when the box shows
  const NOWHERE = { mode: 'above', x: 0, y: 0, tail: { side: 'bottom', at: 24 } };

  const portrait = (cls) => vm.speaker.costume && h('div', { class: `ui-hex ${cls}` }, portraitImage(vm.speaker.costume, vm.face));
  const nextMark = () => !vm.typing && !vm.choices && h('span', { class: 'ui-next', title: vm.nextLabel, 'aria-label': vm.nextLabel }, '▾');
  const logButton = () => h('button', { type: 'button', class: 'ui-log-button', title: vm.logLabel, 'aria-label': vm.logLabel, onclick: stop(() => handlers.onLog()) }, '☰');

  function bottomBox() {
    const narrator = vm.speaker.kind === 'narrator';
    return h('div', { class: `ui-paper ui-dialogue-box${narrator ? ' is-narrator' : ''}`, onclick: () => handlers.onConfirm() },
      !narrator && portrait('ui-cameo'),
      h('div', { class: 'ui-dialogue-body' },
        !narrator && h('div', { class: 'ui-nameplate' }, vm.speaker.name),
        vm.segments.length > 0 && h('p', { class: 'ui-dialogue-text' }, textNodes(vm.segments, handlers.onTerm)),
        vm.choices && h('ol', { class: 'ui-choices' }, vm.choices.map((c, i) => h('li', {},
          h('button', { type: 'button', class: `ui-choice${i === vm.cursor ? ' is-on' : ''}`, onclick: stop(() => handlers.onChoice(c.index)) },
            textNodes(c.segments, null))))),
        nextMark()),
      logButton());
  }

  // The bubble: its paper with the text, the tail on the side placement gives, and the portrait and
  // name plate over its upper-left corner. `measuring` draws it unseen, to read its size.
  function speechBubble(p, measuring = false) {
    const along = p.tail.side === 'left' || p.tail.side === 'right';
    return h('div', {
      class: `ui-bubble is-${p.mode}`,
      style: { left: `${p.x}px`, top: `${p.y}px`, visibility: measuring ? 'hidden' : '' },
      onclick: () => handlers.onConfirm(),
    },
    h('div', { class: 'ui-paper ui-bubble-paper' },
      h('p', { class: 'ui-dialogue-text' }, textNodes(vm.segments, handlers.onTerm)),
      nextMark(),
      logButton()),
    h('span', { class: `ui-bubble-tail is-${p.tail.side}`, style: along ? { top: `${p.tail.at}px` } : { left: `${p.tail.at}px` } }),
    portrait('ui-bubble-face'),
    h('div', { class: 'ui-nameplate ui-bubble-name' }, vm.speaker.name));
  }

  function draw() {
    if (!vm) return;
    if (vm.style === 'bubble' && !placed) s.render(speechBubble(NOWHERE, true));
    else s.render(vm.style === 'bubble' && placement ? speechBubble(placement) : bottomBox());
  }

  return {
    show(next, nextHandlers) {
      vm = next;
      handlers = nextHandlers;
      draw();
    },
    place(p) {
      placement = p;
      placed = true;
      draw();
    },
    measure() {
      if (!vm) return null;
      const bubble = s.el.querySelector('.ui-bubble');
      if (bubble) size = { w: bubble.offsetWidth, h: bubble.offsetHeight };
      return { bubble: size, screen: { w: root.clientWidth, h: root.clientHeight } };
    },
    hide() {
      vm = null;
      placement = null;
      placed = false;
      s.hide();
    },
  };
}

export function createGlossaryView(root) {
  const s = createScreen(root, 'ui-glossary');
  return {
    show(vm, { onClose }) {
      s.render(h('aside', { class: 'ui-paper ui-glossary-card', role: 'dialog', 'aria-label': vm.title },
        h('h3', { class: 'ui-glossary-term' }, vm.title),
        vm.body && h('p', {}, vm.body),
        h('button', { type: 'button', class: 'ui-button', onclick: onClose }, vm.closeLabel)));
    },
    hide: () => s.hide(),
  };
}
