// Synthesized audio (spec §4.4) — no audio files. Each layer is a short procedurally generated
// loop (pure generator functions below, testable without Web Audio), played through gains:
//   chatter (party murmur), crickets, river, music (plucked-guitar kundiman loop).
export const SAMPLE_RATE = 22050;
export const LAYERS = ['chatter', 'crickets', 'river', 'music'];

function prng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// One-pole low-pass in place.
function lowpass(buf, k) {
  let y = 0;
  for (let i = 0; i < buf.length; i++) {
    y += k * (buf[i] - y);
    buf[i] = y;
  }
  return buf;
}

// Plucked string (Karplus–Strong). Returns `seconds` of samples.
export function pluck(freq, seconds, sampleRate = SAMPLE_RATE, damping = 0.996, seed = 1) {
  const r = prng(seed);
  const period = Math.max(2, Math.round(sampleRate / freq));
  const ring = new Float32Array(period).map(() => r() * 2 - 1);
  const out = new Float32Array(Math.round(seconds * sampleRate));
  let idx = 0;
  for (let i = 0; i < out.length; i++) {
    const a = ring[idx];
    const b = ring[(idx + 1) % period];
    const v = damping * 0.5 * (a + b);
    ring[idx] = v;
    out[i] = a;
    idx = (idx + 1) % period;
  }
  return out;
}

const NOTE_INDEX = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
export function noteFreq(name) {
  const m = /^([A-G])(#|b)?(\d)$/.exec(name);
  if (!m) throw new Error(`Bad note '${name}'`);
  const semis = NOTE_INDEX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) - 4) * 12;
  return 440 * 2 ** (semis / 12);
}

// A gentle kundiman-style waltz in A minor: [bass, chord tones...] per bar (3/4).
export const KUNDIMAN_BARS = [
  ['A2', 'C4', 'E4'], ['A2', 'C4', 'E4'], ['D3', 'D4', 'F4'], ['E2', 'B3', 'E4'],
  ['A2', 'C4', 'E4'], ['F2', 'C4', 'A4'], ['E2', 'G#3', 'B3'], ['A2', 'C4', 'E4'],
];
export const MELODY = [
  'E5', 'D5', 'C5', 'B4', 'C5', 'A4', 'D5', 'F5', 'E5', 'B4', 'E5', 'D5',
  'C5', 'E5', 'A5', 'A5', 'G5', 'F5', 'E5', 'D5', 'B4', 'A4', 'C5', 'A4',
];
export const BPM = 84;

export function renderMusic(sampleRate = SAMPLE_RATE) {
  const beat = 60 / BPM;
  const total = Math.round(KUNDIMAN_BARS.length * 3 * beat * sampleRate);
  const out = new Float32Array(total);
  const mix = (samples, start, gain) => {
    for (let i = 0; i < samples.length && start + i < total; i++) out[start + i] += samples[i] * gain;
  };
  KUNDIMAN_BARS.forEach(([bass, ...chord], bar) => {
    const t0 = bar * 3 * beat;
    mix(pluck(noteFreq(bass), 3 * beat, sampleRate, 0.997, bar + 1), Math.round(t0 * sampleRate), 0.5);
    for (const b of [1, 2]) chord.forEach((n, k) => mix(pluck(noteFreq(n), beat, sampleRate, 0.994, bar * 7 + b + k), Math.round((t0 + b * beat) * sampleRate), 0.22));
  });
  MELODY.forEach((n, i) => mix(pluck(noteFreq(n), beat * 1.5, sampleRate, 0.996, 100 + i), Math.round(i * beat * sampleRate), 0.32));
  let peak = 0;
  for (const v of out) peak = Math.max(peak, Math.abs(v));
  if (peak > 0) for (let i = 0; i < out.length; i++) out[i] *= 0.8 / peak;
  return out;
}

export function renderRiver(seconds = 6, sampleRate = SAMPLE_RATE) {
  const r = prng(5);
  const out = new Float32Array(Math.round(seconds * sampleRate));
  let brown = 0;
  for (let i = 0; i < out.length; i++) {
    brown = (brown + (r() * 2 - 1) * 0.02) * 0.998;
    out[i] = brown * 3;
  }
  return lowpass(out, 0.08);
}

export function renderCrickets(seconds = 4, sampleRate = SAMPLE_RATE) {
  const r = prng(9);
  const out = new Float32Array(Math.round(seconds * sampleRate));
  for (let chirp = 0; chirp < seconds * 3; chirp++) {
    const start = Math.floor(r() * (out.length - sampleRate * 0.12));
    const freq = 4200 + r() * 600;
    for (let p = 0; p < 3; p++) {
      const s0 = start + Math.round(p * 0.035 * sampleRate);
      const len = Math.round(0.02 * sampleRate);
      for (let i = 0; i < len && s0 + i < out.length; i++) out[s0 + i] += Math.sin((2 * Math.PI * freq * i) / sampleRate) * Math.sin((Math.PI * i) / len) * 0.25;
    }
  }
  return out;
}

export function renderChatter(seconds = 6, sampleRate = SAMPLE_RATE) {
  const r = prng(17);
  const out = new Float32Array(Math.round(seconds * sampleRate));
  for (let i = 0; i < out.length; i++) out[i] = r() * 2 - 1;
  lowpass(out, 0.12);
  // Syllable-like swells from several voices.
  const env = new Float32Array(out.length);
  for (let v = 0; v < 6; v++) {
    let t = Math.floor(r() * sampleRate * 0.3);
    while (t < out.length) {
      const len = Math.round(sampleRate * (0.12 + r() * 0.25));
      for (let i = 0; i < len && t + i < out.length; i++) env[t + i] += Math.sin((Math.PI * i) / len) * 0.4;
      t += len + Math.round(sampleRate * r() * 0.5);
    }
  }
  for (let i = 0; i < out.length; i++) out[i] *= env[i] * 2.5;
  return out;
}

const GENERATORS = { chatter: renderChatter, crickets: renderCrickets, river: renderRiver, music: renderMusic };

// Web Audio wrapper. Nothing plays until unlock() is called from a user gesture.
export function createAudio({ AudioContextClass = globalThis.AudioContext } = {}) {
  let ctx = null;
  let master = null;
  const gains = {};
  const levels = { chatter: 0, crickets: 0, river: 0, music: 0 };
  let volume = 0.8;
  let muted = false;

  function applyLevels(ramp = 1.5) {
    if (!ctx) return;
    for (const name of LAYERS) gains[name].gain.setTargetAtTime(levels[name], ctx.currentTime, ramp / 3);
    master.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.05);
  }

  return {
    get muted() { return muted; },
    get unlocked() { return ctx != null; },
    unlock() {
      if (ctx || !AudioContextClass) return;
      ctx = new AudioContextClass();
      master = ctx.createGain();
      master.connect(ctx.destination);
      for (const name of LAYERS) {
        const data = GENERATORS[name](undefined, SAMPLE_RATE);
        const buffer = ctx.createBuffer(1, data.length, SAMPLE_RATE);
        buffer.copyToChannel(data, 0);
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        gains[name] = ctx.createGain();
        gains[name].gain.value = 0;
        src.connect(gains[name]).connect(master);
        src.start();
      }
      applyLevels(0.1);
    },
    // Set one layer's level (0–1).
    setLayer(name, level) {
      if (!LAYERS.includes(name)) throw new Error(`Unknown audio layer '${name}'`);
      levels[name] = Math.max(0, Math.min(1, level));
      applyLevels();
    },
    setVolume(v) {
      volume = Math.max(0, Math.min(1, v));
      applyLevels();
    },
    toggleMute() {
      muted = !muted;
      applyLevels();
      return muted;
    },
  };
}
