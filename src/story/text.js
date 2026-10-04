// Dialogue text tokens: {name}, {title}, {g:term} and {g:term|shown text}.
const TOKEN = /\{(name|title|g:([a-z0-9_]+)(?:\|([^}]+))?)\}/g;

// Returns segments: { kind: 'text', text } | { kind: 'term', id, text }.
export function parseText(text, { name, title }) {
  const segments = [];
  const pushText = (t) => {
    if (!t) return;
    const prev = segments[segments.length - 1];
    if (prev && prev.kind === 'text') prev.text += t;
    else segments.push({ kind: 'text', text: t });
  };
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    pushText(text.slice(last, m.index));
    if (m[1] === 'name') pushText(name);
    else if (m[1] === 'title') pushText(title);
    else segments.push({ kind: 'term', id: m[2], text: m[3] ?? m[2].replace(/_/g, ' ') });
    last = m.index + m[0].length;
  }
  pushText(text.slice(last));
  return segments;
}

export function plainText(segments) {
  return segments.map((s) => s.text).join('');
}

// Glossary ids referenced by a text (used by the content validator).
export function glossaryRefs(text) {
  return [...text.matchAll(TOKEN)].filter((m) => m[2]).map((m) => m[2]);
}
