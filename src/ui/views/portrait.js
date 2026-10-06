// A portrait <img>: the local image when one is registered, else the generated pixels drawn once
// into a canvas and reused (crisp scaling comes from the .pixelated CSS class).
import { h } from '../dom.js';
import { portraitSource } from '../../art/portraits.js';

const urls = new Map();

function pixelsToUrl(pixels) {
  const canvas = document.createElement('canvas');
  canvas.width = pixels.width;
  canvas.height = pixels.height;
  canvas.getContext('2d').putImageData(new ImageData(pixels.data, pixels.width, pixels.height), 0, 0);
  return canvas.toDataURL();
}

export function portraitImage(costume, face = 'neutral', className = 'ui-portrait') {
  const src = portraitSource(costume, face);
  if (src.kind === 'image') return h('img', { class: className, src: src.url, alt: '' });
  const key = `${costume}_${face}`;
  if (!urls.has(key)) urls.set(key, pixelsToUrl(src.pixels));
  return h('img', { class: `${className} pixelated`, src: urls.get(key), alt: '' });
}
