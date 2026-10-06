// DOM views for the dialogue box and the glossary popup (see gameUi.js for their view models).
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

export function createDialogueView(root) {
  const s = createScreen(root, 'ui-dialogue');
  return {
    show(vm, { onConfirm, onChoice, onTerm }) {
      const narrator = vm.speaker.kind === 'narrator';
      s.render(h('div', { class: `ui-paper ui-dialogue-box${narrator ? ' is-narrator' : ''}`, onclick: () => onConfirm() },
        !narrator && vm.speaker.costume && h('div', { class: 'ui-cameo' }, portraitImage(vm.speaker.costume, vm.face)),
        h('div', { class: 'ui-dialogue-body' },
          !narrator && h('div', { class: 'ui-nameplate' }, vm.speaker.name),
          vm.segments.length > 0 && h('p', { class: 'ui-dialogue-text' }, textNodes(vm.segments, onTerm)),
          vm.choices && h('ol', { class: 'ui-choices' }, vm.choices.map((c, i) => h('li', {},
            h('button', { type: 'button', class: `ui-choice${i === vm.cursor ? ' is-on' : ''}`, onclick: stop(() => onChoice(c.index)) },
              textNodes(c.segments, null))))),
          !vm.typing && !vm.choices && h('span', { class: 'ui-next', title: vm.nextLabel, 'aria-label': vm.nextLabel }, '▾'))));
    },
    hide: () => s.hide(),
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
