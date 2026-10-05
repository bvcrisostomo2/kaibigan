import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { noteFreq, pluck, renderMusic, renderRiver, renderCrickets, renderChatter, createAudio, LAYERS, SAMPLE_RATE, BPM, KUNDIMAN_BARS } from '../../src/engine/audio.js';
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
    expect(LAYERS).toEqual(['chatter', 'crickets', 'river', 'music']);
    expect(() => audio.setLayer('music', 0.5)).not.toThrow();
    expect(() => audio.setLayer('thunder', 1)).toThrow("Unknown audio layer 'thunder'");
    expect(audio.toggleMute()).toBe(true);
    expect(audio.muted).toBe(true);
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
