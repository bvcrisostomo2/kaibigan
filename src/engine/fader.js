// Full-screen fade to/from black for scene transitions (director actions fadeOut / fadeIn).
export function createFader(container, doc = document) {
  const el = doc.createElement('div');
  el.className = 'fader';
  Object.assign(el.style, { position: 'absolute', inset: '0', background: '#000', opacity: '0', pointerEvents: 'none', transition: 'opacity 0s linear' });
  container.appendChild(el);

  function to(opacity, seconds) {
    el.style.transition = `opacity ${seconds}s linear`;
    el.style.opacity = String(opacity);
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  return {
    element: el,
    fadeOut: (seconds = 0.8) => to(1, seconds),
    fadeIn: (seconds = 0.8) => to(0, seconds),
  };
}
