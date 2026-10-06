// Small DOM helpers for the views (the only UI modules that touch the document).

// h('button', { class: 'x', onclick: fn, hidden: true }, 'text', child, [more]) → element.
// Props: class, style (object), on* listeners, element properties, else attributes.
// Children: nodes, strings and numbers; null/false/undefined are skipped; arrays are flattened.
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k in el && !k.includes('-')) el[k] = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : String(c));
  }
  return el;
}

// One UI screen: an element under the UI root that is re-rendered whole on every show.
export function createScreen(root, className) {
  const el = h('div', { class: `ui-screen ${className}`, hidden: true });
  root.append(el);
  return {
    el,
    render(...children) {
      el.replaceChildren(...children.flat(Infinity).filter((c) => c != null && c !== false));
      el.hidden = false;
    },
    hide() {
      el.hidden = true;
      el.replaceChildren();
    },
    get visible() {
      return !el.hidden;
    },
  };
}
