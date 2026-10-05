import { describe, it, expect } from 'vitest';
import { pixelRatioFor, WebGLUnavailableError, GradeShader } from '../../src/engine/renderer.js';
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
