// Synthesized audio (spec §4.4; Plan 5 spec §3.7) — no audio files. Each layer is a short
// procedurally generated loop (pure generator functions below, testable without Web Audio),
// played through gains: chatter (party murmur), crickets, river, music (plucked-guitar kundiman
// loop), kitchen (fire and sizzle), strings (the party's orchestra). One-shot effects (SFX) are
// rendered once and played on demand: a plate crashing, doors, stairs, glasses, cutlery,
// a laugh, water lapping, a banca's pole.
export const SAMPLE_RATE = 22050;
export const LAYERS = ['chatter', 'crickets', 'river', 'music', 'kitchen', 'strings'];

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

// Party chatter heard through the walls: noise low-passed twice into a dull murmur, swelling with
// several slow voices, normalised to a soft peak (0.3) so it never clips or hisses.
export function renderChatter(seconds = 6, sampleRate = SAMPLE_RATE) {
  const r = prng(17);
  const out = new Float32Array(Math.round(seconds * sampleRate));
  for (let i = 0; i < out.length; i++) out[i] = r() * 2 - 1;
  lowpass(out, 0.05);
  lowpass(out, 0.05);
  const env = new Float32Array(out.length);
  for (let v = 0; v < 5; v++) {
    let t = Math.floor(r() * sampleRate * 0.5);
    while (t < out.length) {
      const len = Math.round(sampleRate * (0.3 + r() * 0.5));
      for (let i = 0; i < len && t + i < out.length; i++) env[t + i] += Math.sin((Math.PI * i) / len) * 0.3;
      t += len + Math.round(sampleRate * r() * 0.6);
    }
  }
  let peak = 0;
  for (let i = 0; i < out.length; i++) {
    out[i] *= 0.4 + env[i];
    peak = Math.max(peak, Math.abs(out[i]));
  }
  const gain = peak > 0 ? 0.3 / peak : 0;
  for (let i = 0; i < out.length; i++) out[i] *= gain;
  return out;
}

// Scale a buffer so its loudest sample is `peak` (all effects stay well clear of clipping).
function normalise(out, peak) {
  let max = 0;
  for (let i = 0; i < out.length; i++) max = Math.max(max, Math.abs(out[i]));
  const g = max > 0 ? peak / max : 0;
  for (let i = 0; i < out.length; i++) out[i] *= g;
  return out;
}

// A damped sine added into out from a start sample.
function ping(out, start, freq, seconds, decay, amp, sampleRate) {
  const len = Math.round(seconds * sampleRate);
  for (let i = 0; i < len && start + i < out.length; i++) out[start + i] += Math.sin((2 * Math.PI * freq * i) / sampleRate) * Math.exp(-i / (decay * sampleRate)) * amp;
}

// A creak: a thin, slowly falling buzz under a swell.
function creak(out, start, seconds, from, to, amp, sampleRate) {
  const len = Math.round(seconds * sampleRate);
  let phase = 0;
  for (let i = 0; i < len && start + i < out.length; i++) {
    phase = (phase + (from + ((to - from) * i) / len) / sampleRate) % 1;
    out[start + i] += (phase < 0.14 ? 1 : -0.16) * amp * Math.sin((Math.PI * i) / len);
  }
}

// The kitchen: a soft sizzle (high, fizzing noise) with the odd crackle of the wood fire.
export function renderKitchen(seconds = 5, sampleRate = SAMPLE_RATE) {
  const r = prng(31);
  const out = new Float32Array(Math.round(seconds * sampleRate));
  let y = 0;
  for (let i = 0; i < out.length; i++) {
    const n = r() * 2 - 1;
    y += 0.5 * (n - y);
    out[i] = (n - y) * (0.5 + 0.5 * Math.sin((i / sampleRate) * 1.3) ** 2) * 0.35; // fizz, gently swelling
  }
  for (let t = 0; t < out.length; t += Math.round(sampleRate * (0.08 + r() * 0.5))) {
    const len = Math.round(sampleRate * 0.006);
    const amp = 0.4 + r() * 0.6;
    for (let i = 0; i < len && t + i < out.length; i++) out[t + i] += (r() * 2 - 1) * amp * (1 - i / len);
  }
  return normalise(out, 0.4);
}

// The orchestra in the caída: harp and guitars arpeggiating the kundiman's chords an octave up
// in the music loop's 3/4 bars (so the two loops line up), over a bowed violin holding each
// chord's top note (a soft sawtooth with vibrato).
export function renderStrings(sampleRate = SAMPLE_RATE) {
  const beat = 60 / BPM;
  const out = new Float32Array(Math.round(KUNDIMAN_BARS.length * 3 * beat * sampleRate));
  KUNDIMAN_BARS.forEach((chord, bar) => {
    for (let n = 0; n < 6; n++) {
      const start = Math.round((bar * 3 + n * 0.5) * beat * sampleRate);
      const tone = pluck(noteFreq(chord[n % chord.length]) * 2, beat * 1.5, sampleRate, 0.994, bar * 8 + n + 3);
      for (let i = 0; i < tone.length && start + i < out.length; i++) out[start + i] += tone[i] * 0.22;
    }
    const top = noteFreq(chord[chord.length - 1]) * 2;
    const start = Math.round(bar * 3 * beat * sampleRate);
    const len = Math.round(3 * beat * sampleRate);
    let phase = 0;
    for (let i = 0; i < len && start + i < out.length; i++) {
      const vib = 1 + 0.006 * Math.sin((2 * Math.PI * 5.5 * i) / sampleRate);
      phase = (phase + (top * vib) / sampleRate) % 1;
      const env = Math.min(1, i / (0.25 * sampleRate)) * Math.min(1, (len - i) / (0.3 * sampleRate));
      out[start + i] += (phase * 2 - 1) * 0.06 * env;
    }
  });
  lowpass(out, 0.35);
  return normalise(out, 0.45);
}

// One-shot effects, each a short buffer peaking at 0.5–0.8.
export const SFX = {
  // A plate shattering on a tiled floor: a crash of bright noise, then shards ringing and skittering.
  plate(sampleRate = SAMPLE_RATE) {
    const r = prng(41);
    const out = new Float32Array(Math.round(0.9 * sampleRate));
    for (let i = 0; i < 0.12 * sampleRate; i++) out[i] = (r() * 2 - 1) * Math.exp(-i / (0.03 * sampleRate));
    for (let k = 0; k < 14; k++) ping(out, Math.round(r() * 0.6 * sampleRate), 2200 + r() * 3200, 0.15, 0.03 + r() * 0.04, 0.5, sampleRate);
    return normalise(out, 0.8);
  },
  // A heavy wooden door: the latch, a creak, and the thud of it closing.
  door(sampleRate = SAMPLE_RATE) {
    const out = new Float32Array(Math.round(0.7 * sampleRate));
    ping(out, 0, 1900, 0.04, 0.008, 0.5, sampleRate);
    creak(out, Math.round(0.05 * sampleRate), 0.35, 310, 270, 0.12, sampleRate);
    ping(out, Math.round(0.45 * sampleRate), 70, 0.25, 0.06, 1, sampleRate);
    return normalise(lowpass(out, 0.5), 0.7);
  },
  // Wooden stairs taking a step: a low knock and a short creak.
  stairs(sampleRate = SAMPLE_RATE) {
    const out = new Float32Array(Math.round(0.35 * sampleRate));
    ping(out, 0, 110, 0.12, 0.03, 1, sampleRate);
    creak(out, Math.round(0.03 * sampleRate), 0.27, 260, 240, 0.2, sampleRate);
    return normalise(lowpass(out, 0.45), 0.6);
  },
  // Two glasses touching in a toast.
  glasses(sampleRate = SAMPLE_RATE) {
    const out = new Float32Array(Math.round(1.2 * sampleRate));
    for (const [t, freq] of [[0, 2600], [0.09, 3150]]) {
      ping(out, Math.round(t * sampleRate), freq, 1.1, 0.35, 0.6, sampleRate);
      ping(out, Math.round(t * sampleRate), freq * 2.7, 0.5, 0.12, 0.25, sampleRate);
    }
    return normalise(out, 0.6);
  },
  // Spoons and forks on plates: a few quick metallic ticks.
  cutlery(sampleRate = SAMPLE_RATE) {
    const r = prng(53);
    const out = new Float32Array(Math.round(0.8 * sampleRate));
    for (let k = 0; k < 6; k++) ping(out, Math.round(r() * 0.7 * sampleRate), 3800 + r() * 2400, 0.06, 0.012, 0.6, sampleRate);
    return normalise(out, 0.6);
  },
  // A short burst of laughter: "ha-ha-ha-ha", a voiced pulse through the two resonances of "a".
  laugh(sampleRate = SAMPLE_RATE) {
    const out = new Float32Array(Math.round(0.9 * sampleRate));
    for (let k = 0; k < 4; k++) {
      const start = Math.round((0.05 + k * 0.19) * sampleRate);
      const len = Math.round(0.13 * sampleRate);
      const pitch = 210 - k * 12;
      for (let i = 0; i < len && start + i < out.length; i++) {
        const t = i / sampleRate;
        const voice = Math.sin(2 * Math.PI * 750 * t) * 0.6 + Math.sin(2 * Math.PI * 1250 * t) * 0.35;
        const pulse = 0.5 + 0.5 * Math.cos(2 * Math.PI * pitch * t);
        out[start + i] += voice * pulse ** 3 * Math.sin((Math.PI * i) / len);
      }
    }
    return normalise(lowpass(out, 0.6), 0.5);
  },
  // Water slapping against the stone landing.
  lap(sampleRate = SAMPLE_RATE) {
    const r = prng(61);
    const out = new Float32Array(Math.round(0.8 * sampleRate));
    for (let i = 0; i < out.length; i++) out[i] = (r() * 2 - 1) * Math.sin((Math.PI * i) / out.length) ** 2;
    lowpass(out, 0.08);
    return normalise(out, 0.5);
  },
  // A banca's pole dipping and pushing off: a soft splash and a knock on the hull.
  pole(sampleRate = SAMPLE_RATE) {
    const r = prng(67);
    const out = new Float32Array(Math.round(0.6 * sampleRate));
    for (let i = 0; i < 0.25 * sampleRate; i++) out[i] = (r() * 2 - 1) * Math.exp(-i / (0.06 * sampleRate));
    lowpass(out, 0.25);
    ping(out, Math.round(0.3 * sampleRate), 160, 0.2, 0.04, 0.8, sampleRate);
    return normalise(out, 0.6);
  },
};

const GENERATORS = { chatter: renderChatter, crickets: renderCrickets, river: renderRiver, music: renderMusic, kitchen: renderKitchen, strings: renderStrings };

// Web Audio wrapper. Nothing plays until unlock() is called from a user gesture.
export function createAudio({ AudioContextClass = globalThis.AudioContext } = {}) {
  let ctx = null;
  let master = null;
  const gains = {};
  const levels = Object.fromEntries(LAYERS.map((name) => [name, 0]));
  const sfxBuffers = {};
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
    // Play a one-shot effect (an SFX key) at a level (0–1). Before unlock, nothing plays.
    play(name, level = 1) {
      if (!SFX[name]) throw new Error(`Unknown sound effect '${name}'`);
      if (!ctx) return;
      if (!sfxBuffers[name]) {
        const data = SFX[name](SAMPLE_RATE);
        sfxBuffers[name] = ctx.createBuffer(1, data.length, SAMPLE_RATE);
        sfxBuffers[name].copyToChannel(data, 0);
      }
      const src = ctx.createBufferSource();
      src.buffer = sfxBuffers[name];
      const g = ctx.createGain();
      g.gain.value = Math.max(0, Math.min(1, level));
      src.connect(g).connect(master);
      src.start();
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
