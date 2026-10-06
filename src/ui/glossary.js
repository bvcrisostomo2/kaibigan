// The glossary popup's entry for a term id (spec §3.4). The content validator guarantees ids
// exist; an unknown one still shows its id rather than failing mid-dialogue.
export function glossaryEntry(glossary, id) {
  const g = glossary.find((e) => e.id === id);
  return g ? { id, title: g.title, body: g.body } : { id, title: id.replace(/_/g, ' '), body: '' };
}
