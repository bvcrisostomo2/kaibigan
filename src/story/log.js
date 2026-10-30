// The conversation log (Plan 5 spec §4.7): every line of the chapter as it is said, and the choice
// picked at each decision, kept in state.log as references ([dialogueId, nodeId] or [dialogueId,
// nodeId, choice]) rather than text, so it stays small and shows in the current language. It is
// part of the autosave; a save code can't carry it.
export const LOG_LIMIT = 1000; // the newest entries kept, so the autosave stays small

// Log lines and choices from the bus until the returned stop() is called. Choice prompts aren't
// logged: the choice picked there is.
export function trackLog(ctx, dialogues) {
  const { state, bus } = ctx;
  const push = (entry) => {
    state.log.push(entry);
    if (state.log.length > LOG_LIMIT) state.log.splice(0, state.log.length - LOG_LIMIT);
  };
  const offs = [
    bus.on('dialogue:node', ({ id, node }) => {
      if (!dialogues[id]?.nodes[node]?.choices) push([id, node]);
    }),
    bus.on('dialogue:choice', ({ id, node, choice }) => push([id, node, choice])),
  ];
  return () => offs.forEach((off) => off());
}
