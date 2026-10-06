// Stand-ins for the DOM views: they remember the last view model and handlers they were given,
// so tests can read what is on screen and act like a player (handlers.onSelect('newGame'), …).
function screen() {
  return {
    vm: null,
    handlers: null,
    visible: false,
    shows: 0,
    show(vm, handlers) {
      this.vm = vm;
      this.handlers = handlers;
      this.visible = true;
      this.shows++;
    },
    hide() {
      this.visible = false;
    },
  };
}

function renderer() {
  return {
    vm: null,
    renders: 0,
    render(vm) {
      this.vm = vm;
      this.renders++;
    },
  };
}

export function fakeViews() {
  return {
    title: screen(),
    letter: screen(),
    code: screen(),
    dialogue: screen(),
    glossary: screen(),
    titleCard: screen(),
    kodigo: screen(),
    journal: screen(),
    menu: screen(),
    chapterEnd: screen(),
    hud: renderer(),
    toasts: renderer(),
    markers: renderer(),
  };
}

// Lets pending promise callbacks (director sequences, dialogue resolutions) run.
export const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
