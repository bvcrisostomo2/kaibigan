// Entry point: Chapter 1. Dev modes: ?demo plays the Plan 3 demo chapter on the sandbox level,
// ?engine opens the Plan 2 engine sandbox.
import { startGame } from './boot/game.js';
import { startSandbox } from './sandbox/sandbox.js';
import { chapter1Content } from './content/chapter1/index.js';
import { demoContent } from './sandbox/demoContent.js';
import { t } from './ui/strings.js';

const app = document.getElementById('app');
const params = new URLSearchParams(location.search);
const started = params.has('engine') ? startSandbox(app)
  : startGame(app, params.has('demo') ? demoContent : chapter1Content);

started.then((game) => {
  // Exposed for debugging on the dev server only, never in a production build.
  if (import.meta.env.DEV) window.__kaibigan = game;
}).catch((err) => {
  console.error('[main]', err);
  const p = document.createElement('p');
  p.className = 'fatal';
  p.textContent = t('fatal.start');
  app.replaceChildren(p);
});
