// DOM views for the front screens: title, letter intro and code entry (see frontScreens.js for
// the view models and handlers they receive).
import { h, createScreen } from '../dom.js';

// Arrow keys move focus between a screen's buttons (Tab and Enter work natively).
function arrowFocus(el) {
  el.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const buttons = [...el.querySelectorAll('button')];
    const i = buttons.indexOf(document.activeElement);
    const next = buttons[(i + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length];
    next?.focus();
    e.preventDefault();
  });
}

export function createTitleView(root) {
  const s = createScreen(root, 'ui-title');
  arrowFocus(s.el);
  return {
    show(vm, { onSelect }) {
      s.render(
        h('div', { class: 'ui-title-card' },
          h('h1', { class: 'ui-title-name' }, vm.title),
          h('p', { class: 'ui-title-sub' }, vm.subtitle),
          vm.notice && h('p', { class: 'ui-notice', role: 'status' }, vm.notice),
          h('div', { class: 'ui-title-menu' },
            vm.items.map((item) => h('button', { type: 'button', class: 'ui-button', onclick: () => onSelect(item.id) },
              item.label, item.sub && h('small', {}, item.sub))))),
      );
      s.el.querySelector('button')?.focus();
    },
    hide: () => s.hide(),
  };
}

export function createLetterView(root) {
  const s = createScreen(root, 'ui-letter');
  return {
    show(vm, { onSign }) {
      const name = h('input', { class: 'ui-input', id: 'ui-letter-name', value: vm.name, maxLength: 40, autocomplete: 'off', spellcheck: false });
      const titles = vm.titles.map((title) => h('label', { class: 'ui-radio' },
        h('input', { type: 'radio', name: 'ui-letter-title', value: title, checked: title === vm.title }), title));
      const form = h('form', {
        class: 'ui-letter-form',
        onsubmit(e) {
          e.preventDefault();
          const picked = form.querySelector('input[name="ui-letter-title"]:checked')?.value ?? vm.titles[0];
          onSign(name.value, picked);
        },
      },
      h('label', { class: 'ui-label', htmlFor: 'ui-letter-name' }, vm.labels.name), name,
      h('fieldset', { class: 'ui-radios' }, h('legend', { class: 'ui-label' }, vm.labels.title), titles),
      vm.error && h('p', { class: 'ui-error', role: 'alert' }, vm.error),
      h('button', { type: 'submit', class: 'ui-button ui-seal' }, vm.labels.sign));
      s.render(h('article', { class: 'ui-paper ui-letter-page' },
        h('p', { class: 'ui-letter-heading' }, vm.letter.heading),
        vm.letter.paragraphs.map((p) => h('p', {}, p)),
        h('p', { class: 'ui-letter-closing' }, vm.letter.closing),
        h('p', { class: 'ui-letter-signature' }, vm.letter.signature),
        form));
      name.focus();
    },
    hide: () => s.hide(),
  };
}

export function createCodeView(root) {
  const s = createScreen(root, 'ui-code');
  return {
    show(vm, { onSubmit, onBack }) {
      const words = h('textarea', { class: `ui-input ui-code-words${vm.field === 'words' ? ' is-wrong' : ''}`, id: 'ui-code-words', rows: 3, value: vm.words, spellcheck: false, autocomplete: 'off' });
      const name = h('input', { class: `ui-input${vm.field === 'name' ? ' is-wrong' : ''}`, id: 'ui-code-name', value: vm.name, maxLength: 40, autocomplete: 'off', spellcheck: false });
      s.render(h('form', {
        class: 'ui-paper ui-code-page',
        onsubmit(e) {
          e.preventDefault();
          onSubmit(words.value, name.value);
        },
      },
      h('h2', {}, vm.labels.heading),
      h('label', { class: 'ui-label', htmlFor: 'ui-code-words' }, vm.labels.words), words,
      h('label', { class: 'ui-label', htmlFor: 'ui-code-name' }, vm.labels.name), name,
      vm.error && h('p', { class: 'ui-error', role: 'alert' }, vm.error),
      h('div', { class: 'ui-row' },
        h('button', { type: 'button', class: 'ui-button', onclick: onBack }, vm.labels.back),
        h('button', { type: 'submit', class: 'ui-button ui-seal' }, vm.labels.submit))));
      (vm.field === 'name' ? name : words).focus();
    },
    hide: () => s.hide(),
  };
}
