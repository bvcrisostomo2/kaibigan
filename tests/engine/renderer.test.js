import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { pixelRatioFor, WebGLUnavailableError, GradeShader, FocusBlurShader, FOCUS_BLUR, focusBlurReach, focusLine } from '../../src/engine/renderer.js';
import { QUALITY } from '../../src/engine/quality.js';

describe('pixelRatioFor', () => {
  it('caps the device ratio at the preset', () => {
    expect(pixelRatioFor(3, QUALITY.high)).toBe(2);
    expect(pixelRatioFor(1.5, QUALITY.high)).toBe(1.5);
    expect(pixelRatioFor(2, QUALITY.low)).toBe(1);
  });

  it('never drops below 1 (zoomed-out browsers) and tolerates a missing ratio', () => {
    expect(pixelRatioFor(0.5, QUALITY.high)).toBe(1);
    expect(pixelRatioFor(undefined, QUALITY.high)).toBe(1);
    expect(pixelRatioFor(0, QUALITY.low)).toBe(1);
  });
});

describe('renderer helpers', () => {
  it('WebGLUnavailableError carries its cause', () => {
    const cause = new Error('no context');
    const err = new WebGLUnavailableError(cause);
    expect(err.name).toBe('WebGLUnavailableError');
    expect(err.cause).toBe(cause);
    expect(err).toBeInstanceOf(Error);
  });

  it('the grade shader exposes warmth, saturation and vignette', () => {
    expect(Object.keys(GradeShader.uniforms)).toEqual(['tDiffuse', 'warmth', 'saturation', 'vignette']);
  });
});

describe('focus blur', () => {
  it('keeps a band round the focus line sharp and blurs beyond it, more below than above', () => {
    expect(focusBlurReach(0.4, 0.4)).toBe(0);
    expect(focusBlurReach(0.4 + FOCUS_BLUR.band * 0.9, 0.4)).toBe(0);
    expect(focusBlurReach(0.4 - FOCUS_BLUR.band * 0.9, 0.4)).toBe(0);
    expect(focusBlurReach(1, 0.4)).toBeCloseTo(FOCUS_BLUR.strength);
    expect(focusBlurReach(0, 0.6)).toBeCloseTo(FOCUS_BLUR.strength * FOCUS_BLUR.near);
    expect(focusBlurReach(0.4 + FOCUS_BLUR.band + FOCUS_BLUR.spread / 2, 0.4)).toBeCloseTo(FOCUS_BLUR.strength / 2);
  });

  it('puts the focus line where the point sits on screen, clamped to the screen', () => {
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    expect(focusLine(new THREE.Vector3(0, 0, 0), camera)).toBeCloseTo(0.5);
    expect(focusLine(new THREE.Vector3(0, 1, 0), camera)).toBeGreaterThan(0.5);
    expect(focusLine(new THREE.Vector3(0, -100, 0), camera)).toBe(0);
  });

  it('the shader takes its band settings as uniforms', () => {
    expect(Object.keys(FocusBlurShader.uniforms)).toEqual(['tDiffuse', 'texel', 'focus', 'band', 'spread', 'strength', 'near']);
  });
});
