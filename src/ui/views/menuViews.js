// DOM views for the blocking pages: Journal, Esc menu and chapter-end card.
import { h, createScreen } from '../dom.js';
import { portraitImage } from './portrait.js';

// One line of the conversation log: a small portrait in the line's feeling, the name and the text.
function logEntry(e) {
  return h('div', { class: `ui-log-entry is-${e.kind}` },
    e.costume ? h('div', { class: 'ui-hex ui-log-face' }, portraitImage(e.costume, e.feeling)) : h('div', { class: 'ui-log-face' }),
    h('div', { class: 'ui-log-line' },
      e.name && h('div', { class: 'ui-log-name' }, e.name),
      h('p', {}, e.segments.map((seg) => seg.text).join(''))));
}

export function createJournalView(root) {
  const s = createScreen(root, 'ui-journal');
  return {
    show(vm, { onTab, onClose }) {
      const empty = h('p', { class: 'ui-small' }, vm.emptyLabel);
      const characters = vm.characters.length
        ? vm.characters.map((c) => h('section', { class: 'ui-entry' }, h('h4', {}, c.name), c.bio && h('p', {}, c.bio)))
        : empty;
      const notes = [
        h('p', { class: 'ui-small' }, vm.countLabel),
        vm.notes.length ? vm.notes.map((n) => h('section', { class: 'ui-entry' }, h('h4', {}, n.title), h('p', {}, n.body))) : empty,
        vm.feelings.length > 0 && h('section', { class: 'ui-entry ui-feelings' }, h('h4', {}, vm.feelingsLabel), vm.feelings.map((f) => h('p', {}, h('em', {}, f)))),
      ];
      const conversation = vm.conversation.length
        ? h('div', { class: 'ui-log' }, vm.conversation.map(logEntry))
        : h('p', { class: 'ui-small' }, vm.conversationEmptyLabel);
      s.render(h('div', { class: 'ui-paper ui-page', role: 'dialog', 'aria-label': vm.title },
        h('button', { type: 'button', class: 'ui-close', 'aria-label': vm.closeLabel, title: vm.closeLabel, onclick: onClose }, '×'),
        h('h2', {}, vm.title),
        h('div', { class: 'ui-tabs', role: 'tablist' }, vm.tabs.map((tab) => h('button', {
          type: 'button', role: 'tab', class: `ui-tab${tab.id === vm.tab ? ' is-on' : ''}`, 'aria-selected': String(tab.id === vm.tab), onclick: () => onTab(tab.id),
        }, tab.label))),
        h('div', { class: 'ui-page-body' }, vm.tab === 'notes' ? notes : vm.tab === 'conversation' ? conversation : characters)));
      // The conversation opens at its latest line.
      if (vm.tab === 'conversation') {
        const body = s.el.querySelector('.ui-page');
        body.scrollTop = body.scrollHeight;
      }
    },
    hide: () => s.hide(),
  };
}

export function createMenuView(root) {
  const s = createScreen(root, 'ui-menu');
  return {
    show(vm, { onSelect, onAdjust, onClose }) {
      s.render(h('div', { class: 'ui-paper ui-page ui-menu-page', role: 'dialog', 'aria-label': vm.title },
        h('button', { type: 'button', class: 'ui-close', 'aria-label': vm.labels.close, title: vm.labels.close, onclick: onClose }, '×'),
        h('h2', {}, vm.title),
        h('ul', { class: 'ui-menu-rows' }, vm.rows.map((row, i) => h('li', { class: `ui-menu-row${i === vm.cursor ? ' is-on' : ''}` },
          h('button', { type: 'button', class: 'ui-menu-label', onclick: () => onSelect(i) }, row.label),
          row.value != null && h('span', { class: 'ui-menu-value' },
            h('button', { type: 'button', class: 'ui-arrow', 'aria-label': vm.labels.less, title: vm.labels.less, onclick: () => onAdjust(i, -1) }, '‹'),
            h('span', {}, row.value),
            h('button', { type: 'button', class: 'ui-arrow', 'aria-label': vm.labels.more, title: vm.labels.more, onclick: () => onAdjust(i, 1) }, '›')))))));
    },
    hide: () => s.hide(),
  };
}

export function createChapterEndView(root) {
  const s = createScreen(root, 'ui-end');
  return {
    show(vm, { onContinue }) {
      const l = vm.labels;
      s.render(h('article', { class: 'ui-paper ui-page ui-end-page' },
        h('h2', {}, l.heading),
        h('h3', {}, l.recap), h('p', {}, vm.recap),
        h('p', { class: 'ui-small' }, l.notes),
        vm.standings.length > 0 && [h('h3', {}, l.standing), h('ul', {}, vm.standings.map((x) => h('li', {}, x)))],
        h('h3', {}, l.think), h('ol', {}, vm.prompts.map((p) => h('li', {}, p))),
        vm.words.length > 0 && [h('h3', {}, l.code), h('ol', { class: 'ui-code-list' }, vm.words.map((w) => h('li', {}, w)))],
        h('button', { type: 'button', class: 'ui-button ui-seal', onclick: onContinue }, l.continue)));
      s.el.querySelector('.ui-seal')?.focus();
    },
    hide: () => s.hide(),
  };
}
