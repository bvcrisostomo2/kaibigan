// The director's host (spec §5.1): engine actions go to the stage, the rest to the UI.
// setTime also updates the HUD's time-of-day badge. ['cutscene', id] runs the chapter's named
// action list (`cutscenes`) through this same host, in order. Once the UI is disposed (quit to the
// title), nothing the old director awaits ever settles, so a discarded chapter can never act again.
const never = () => new Promise(() => {});

export function composeHost({ stage, ui, cutscenes = {} }) {
  const gate = (p) => p.then((v) => (ui.disposed ? never() : v), (err) => (ui.disposed ? never() : Promise.reject(err)));
  async function runCutscene(id) {
    const list = cutscenes[id];
    if (!list) throw new Error(`Cutscene '${id}' not found`);
    for (const action of list) await host.run(action);
  }
  const host = {
    run(action) {
      if (ui.disposed) return never();
      if (action[0] === 'cutscene') return runCutscene(action[1]);
      if (action[0] === 'setTime') ui.setTime(action[1]);
      return gate(stage.handles(action[0]) ? stage.run(action) : ui.run(action));
    },
    runDialogue: (runner) => (ui.disposed ? never() : gate(ui.runDialogue(runner))),
  };
  return host;
}

// Routes one frame's presses: the UI first; an unused Talk goes to the game (onTalk). Stops as soon
// as the session ends (a press can quit to the title), so later presses never touch it.
export function routePresses(presses, session, onTalk) {
  for (const p of presses) {
    const s = session();
    if (!s) break;
    if (s.ui.command(p)) continue;
    if (p === 'interact') onTalk();
  }
}
