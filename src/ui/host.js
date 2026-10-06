// The director's host (spec §5.1): engine actions go to the stage, the rest to the UI.
// setTime also updates the HUD's time-of-day badge.
export function composeHost({ stage, ui }) {
  return {
    run(action) {
      if (action[0] === 'setTime') ui.setTime(action[1]);
      return stage.handles(action[0]) ? stage.run(action) : ui.run(action);
    },
    runDialogue: (runner) => ui.runDialogue(runner),
  };
}
