import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { noteFreq, pluck, renderMusic, renderRiver, renderCrickets, renderChatter, renderKitchen, renderStrings, createAudio, LAYERS, SFX, SAMPLE_RATE, BPM, KUNDIMAN_BARS } from '../../src/engine/audio.js';
import { wrap, createParticles } from '../../src/engine/particles.js';

const rms = (a) => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length);

describe('synthesized audio', () => {
  it('converts note names to frequencies', () => {
    expect(noteFreq('A4')).toBe(440);
    expect(noteFreq('A5')).toBe(880);
    expect(noteFreq('C4')).toBeCloseTo(261.63, 1);
    expect(noteFreq('G#3')).toBeCloseTo(207.65, 1);
    expect(() => noteFreq('H2')).toThrow("Bad note 'H2'");
  });

  it('plucks a decaying string of the right length', () => {
    const s = pluck(220, 1, 8000);
    expect(s).toHaveLength(8000);
    expect(rms(s.slice(-800))).toBeLessThan(rms(s.slice(0, 800)));
  });

  it('renders a normalised kundiman loop of whole bars', () => {
    const m = renderMusic(8000);
    const beat = 60 / BPM;
    expect(m.length).toBe(Math.round(KUNDIMAN_BARS.length * 3 * beat * 8000));
    let peak = 0;
    for (const v of m) peak = Math.max(peak, Math.abs(v));
    expect(peak).toBeCloseTo(0.8, 5);
  });

  it('renders ambience loops of the requested length', () => {
    expect(renderRiver(1, 8000)).toHaveLength(8000);
    expect(renderCrickets(1, 8000)).toHaveLength(8000);
    expect(renderChatter(1, 8000)).toHaveLength(8000);
    expect(SAMPLE_RATE).toBe(22050);
  });

  it('does nothing until unlocked, and validates layers', () => {
    const audio = createAudio({ AudioContextClass: undefined });
    audio.unlock();
    expect(audio.unlocked).toBe(false);
    expect(LAYERS).toEqual(['chatter', 'crickets', 'river', 'music', 'kitchen', 'strings']);
    expect(() => audio.play('plate')).not.toThrow(); // silently, before unlock
    expect(() => audio.play('thunder')).toThrow("Unknown sound effect 'thunder'");
    expect(() => audio.setLayer('music', 0.5)).not.toThrow();
    expect(() => audio.setLayer('thunder', 1)).toThrow("Unknown audio layer 'thunder'");
    expect(audio.toggleMute()).toBe(true);
    expect(audio.muted).toBe(true);
  });
});

describe('sound effects and the new layers', () => {
  const peak = (buf) => buf.reduce((m, v) => Math.max(m, Math.abs(v)), 0);

  it.each(Object.keys(SFX))('renders the %s effect: short, audible, never clipping', (name) => {
    const buf = SFX[name](SAMPLE_RATE);
    expect(buf.length).toBeGreaterThan(0.2 * SAMPLE_RATE);
    expect(buf.length).toBeLessThanOrEqual(1.2 * SAMPLE_RATE);
    expect(buf.every(Number.isFinite)).toBe(true);
    expect(peak(buf)).toBeGreaterThan(0.4);
    expect(peak(buf)).toBeLessThanOrEqual(0.8001);
  });

  it('has the effects the house needs', () => {
    expect(Object.keys(SFX).sort()).toEqual(['cutlery', 'door', 'glasses', 'lap', 'laugh', 'plate', 'pole', 'stairs']);
  });

  it('renders the kitchen and the orchestra as soft loops, the orchestra in step with the music', () => {
    const kitchen = renderKitchen(2);
    expect(kitchen.length).toBe(2 * SAMPLE_RATE);
    expect(peak(kitchen)).toBeCloseTo(0.4, 5);
    const strings = renderStrings();
    expect(strings.length).toBe(renderMusic().length);
    expect(peak(strings)).toBeCloseTo(0.45, 5);
  });

  it('plays an effect once through the master volume after unlock', () => {
    const made = [];
    class FakeContext {
      constructor() { this.currentTime = 0; this.destination = {}; }
      createGain() { const g = { gain: { value: 1, setTargetAtTime() {} }, connect: (n) => n }; made.push(['gain', g]); return g; }
      createBuffer(ch, len) { return { len, copyToChannel() {} }; }
      createBufferSource() { const src = { connect: (n) => n, start: () => made.push(['start', src]) }; return src; }
    }
    const audio = createAudio({ AudioContextClass: FakeContext });
    audio.unlock();
    const before = made.filter(([k]) => k === 'start').length;
    audio.play('glasses', 0.5);
    audio.play('glasses', 2);
    const starts = made.filter(([k]) => k === 'start');
    expect(starts.length - before).toBe(2);
    expect(starts.at(-1)[1].buffer).toBe(starts.at(-2)[1].buffer); // rendered once, reused
    expect(made.filter(([k]) => k === 'gain').at(-1)[1].gain.value).toBe(1); // clamped
  });
});

describe('particles', () => {
  it('wrap keeps values in [-half, half)', () => {
    expect(wrap(0, 9)).toBe(0);
    expect(wrap(10, 9)).toBe(-8);
    expect(wrap(-9, 9)).toBe(-9);
    expect(wrap(9, 9)).toBe(-9);
    expect(wrap(-10, 9)).toBe(8);
  });

  it('adds dust and fireflies; fireflies only outdoors at night', () => {
    const scene = new THREE.Scene();
    const p = createParticles(scene, { count: 40 });
    const clouds = scene.children.filter((c) => c.isPoints);
    expect(clouds).toHaveLength(2);
    const focus = new THREE.Vector3();
    p.update(0.016, focus, { lamps: 1 }, { outdoors: true });
    expect(clouds[1].visible).toBe(true);
    p.update(0.016, focus, { lamps: 1 }, { outdoors: false });
    expect(clouds[1].visible).toBe(false);
    p.update(0.016, focus, { lamps: 0.3 }, { outdoors: true });
    expect(clouds[1].visible).toBe(false);
  });
});

describe('party chatter', () => {
  it('is a soft, low murmur rather than a hiss', () => {
    const c = renderChatter(2, SAMPLE_RATE);
    let peak = 0;
    let energy = 0;
    let change = 0;
    for (let i = 1; i < c.length; i++) {
      peak = Math.max(peak, Math.abs(c[i]));
      energy += c[i] * c[i];
      change += (c[i] - c[i - 1]) ** 2;
    }
    expect(peak).toBeLessThanOrEqual(0.3001);
    expect(Math.sqrt(change / energy)).toBeLessThan(0.12); // little high-frequency content
  });
});
