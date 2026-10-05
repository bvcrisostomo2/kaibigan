// Entry point. Plan 2 boots the engine sandbox; Plan 4 replaces this with the game.
import { startSandbox } from './sandbox/sandbox.js';

startSandbox(document.getElementById('app')).then((game) => {
  // Exposed for debugging in the browser console.
  window.__kaibigan = game;
});
