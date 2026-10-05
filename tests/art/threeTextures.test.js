import { describe, it, expect, afterEach } from 'vitest';
import * as THREE from 'three';
import { sheetFor, sheetSource, registerSheet, clearRegisteredSheets, tileTexture, portraitPixels } from '../../src/art/threeTextures.js';

afterEach(() => clearRegisteredSheets());

const fakeSheet = () => ({ texture: new THREE.Texture(), cellW: 50, cellH: 74, cols: 4, rows: 3, footMargin: 3, anims: { walk_down: [{ col: 0, row: 0 }], idle_down: [{ col: 0, row: 1 }] } });

describe('sheet registry', () => {
  it('uses hand-authored art, else procedural', () => {
    expect(sheetSource('ibarra')).toBe('handmade');
    expect(sheetSource('damaso')).toBe('procedural');
    expect(() => sheetSource('nobody')).toThrow("Unknown costume 'nobody'");
  });

  it('a registered override wins, and clearing restores the shipped art', () => {
    const meta = fakeSheet();
    registerSheet('ibarra', meta);
    expect(sheetSource('ibarra')).toBe('override');
    expect(sheetFor('ibarra')).toBe(meta);
    clearRegisteredSheets();
    expect(sheetSource('ibarra')).toBe('handmade');
    expect(sheetFor('ibarra')).not.toBe(meta);
  });

  it('builds each sheet once', () => {
    const a = sheetFor('guevarra');
    expect(sheetFor('guevarra')).toBe(a);
    expect(a.texture).toBeInstanceOf(THREE.DataTexture);
    expect(a.texture.magFilter).toBe(THREE.NearestFilter);
    expect(a.anims.walk_down).toHaveLength(4);
  });

  it('hand-authored sheets carry their own layout', () => {
    const s = sheetFor('ibarra');
    expect(s.cols).toBe(4);
    expect(s.anims.walk_left).toHaveLength(4);
  });
});

describe('tile textures and portraits', () => {
  it('shares one repeat-wrapped texture per tile', () => {
    const t = tileTexture('narra');
    expect(tileTexture('narra')).toBe(t);
    expect(t.wrapS).toBe(THREE.RepeatWrapping);
    expect(t.image.width).toBe(32);
  });

  it('draws pixel portraits for known costumes only', () => {
    expect(portraitPixels('isabel').width).toBe(64);
    expect(() => portraitPixels('nobody')).toThrow("Unknown costume 'nobody'");
  });
});
