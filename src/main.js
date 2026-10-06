// Entry point. Plan 3 boots the demo game over the sandbox; ?engine opens the Plan 2 engine
// sandbox instead. Plan 4 replaces this with the real game.
import { startSandbox } from './sandbox/sandbox.js';
import { startSandboxGame } from './sandbox/sandboxGame.js';

const start = new URLSearchParams(location.search).has('engine') ? startSandbox : startSandboxGame;
start(document.getElementById('app')).then((game) => {
  // Exposed for debugging in the browser console.
  window.__kaibigan = game;
});
