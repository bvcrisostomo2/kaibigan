// DOM views for the non-blocking pieces: title card, Kodigo panel, toasts, HUD and markers.
import { h, createScreen } from '../dom.js';

export function createTitleCardView(root) {
  const s = createScreen(root, 'ui-titlecard');
  return {
    show(vm) {
      s.render(h('div', { class: `ui-titlecard-band is-${vm.phase}` },
        h('div', { class: 'ui-titlecard-title' }, vm.title),
        h('div', { class: 'ui-titlecard-sub' }, vm.subtitle)));
    },
    hide: () => s.hide(),
  };
}

export function createKodigoView(root) {
  const s = createScreen(root, 'ui-kodigo');
  return {
    show(vm, { onClose }) {
      const copy = vm.code && h('button', {
        type: 'button',
        class: 'ui-button',
        onclick() {
          navigator.clipboard?.writeText(vm.code).then(() => (copy.textContent = vm.copiedLabel), () => {});
        },
      }, vm.copyLabel);
      s.render(h('aside', { class: 'ui-paper ui-kodigo-card', 'aria-live': 'polite' },
        h('button', { type: 'button', class: 'ui-close', 'aria-label': vm.closeLabel, title: vm.closeLabel, onclick: onClose }, '×'),
        h('h3', {}, vm.heading),
        vm.words.length > 0 && h('ol', { class: 'ui-code-list' }, vm.words.map((w) => h('li', {}, w))),
        h('p', { class: 'ui-small' }, vm.hint),
        copy));
    },
    hide: () => s.hide(),
  };
}

export function createToastsView(root) {
  const s = createScreen(root, 'ui-toasts');
  return {
    render(items) {
      if (items.length === 0) return s.hide();
      s.render(items.map((i) => h('div', { class: 'ui-toast', role: 'status' }, i.text)));
    },
  };
}

export function createHudView(root) {
  const s = createScreen(root, 'ui-hud');
  return {
    render(vm) {
      s.render(
        (vm.place || vm.time) && h('div', { class: 'ui-paper ui-location' },
          vm.place && h('div', { class: 'ui-place' }, vm.place),
          vm.detail && h('div', { class: 'ui-small' }, vm.detail),
          vm.time && h('div', { class: 'ui-time' }, vm.time)),
        vm.controls && h('div', { class: 'ui-controls' }, vm.controls),
      );
    },
  };
}

export function createMarkersView(root) {
  const s = createScreen(root, 'ui-markers');
  return {
    render(list) {
      if (list.length === 0) return s.hide();
      s.render(list.map((m) => h('span', { class: `ui-marker${m.kind === '!' ? ' is-new' : ''}`, style: { left: `${m.x}px`, top: `${m.y}px` } }, m.kind)));
    },
  };
}
