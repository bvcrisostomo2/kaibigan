// three.js renderer + HD-2D post-processing (spec §4.1): bloom, a depth-of-field blur, warm grade
// and vignette on High; grade only on Low. The blur leaves a band across the screen sharp around
// the player wherever they stand, and softens what lies above it (the distance) and, more
// strongly, below it (the foreground).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { QUALITY } from './quality.js';

export class WebGLUnavailableError extends Error {
  constructor(cause) {
    super('WebGL is not available in this browser');
    this.name = 'WebGLUnavailableError';
    this.cause = cause;
  }
}

export const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    warmth: { value: 0.06 },
    saturation: { value: 1.05 },
    vignette: { value: 0.4 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float warmth;
    uniform float saturation;
    uniform float vignette;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec3 col = c.rgb;
      float l = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(vec3(l), col, saturation);
      col += vec3(warmth, warmth * 0.4, -warmth * 0.6) * l;
      float d = distance(vUv, vec2(0.5));
      col *= 1.0 - vignette * smoothstep(0.3, 0.85, d);
      gl_FragColor = vec4(col, c.a);
    }`,
};

// The focus band: sharp within `band` of the focus line (fractions of the screen's height), easing
// to full blur over `spread`; `strength` is the full blur's reach in pixels, `near` scales it below
// the line.
export const FOCUS_BLUR = { band: 0.16, spread: 0.32, strength: 2, near: 1.7 };

// How far a pixel at screen height y (0 = bottom, 1 = top) is blurred, in pixels, for a focus line.
// Mirrors FocusBlurShader.
export function focusBlurReach(y, focus, opts = FOCUS_BLUR) {
  const d = y - focus;
  const t = Math.min(1, Math.max(0, (Math.abs(d) - opts.band) / opts.spread));
  const eased = t * t * (3 - 2 * t);
  return eased * opts.strength * (d < 0 ? opts.near : 1);
}

// How far above the feet of whoever the camera follows the focus line runs: about mid-body.
export const FOCUS_HEIGHT = 0.8;

// Where a world point sits on screen (0 = bottom, 1 = top), clamped to the screen.
export function focusLine(point, camera) {
  const p = point.clone().project(camera);
  return Math.min(1, Math.max(0, (p.y + 1) / 2));
}

// One direction of the focus blur (run once across, once down): a 9-tap Gaussian whose reach
// follows focusBlurReach.
export const FocusBlurShader = {
  uniforms: {
    tDiffuse: { value: null },
    texel: { value: new THREE.Vector2(1 / 1024, 0) }, // one pixel along the blur's direction, in uv
    focus: { value: 0.4 },
    band: { value: FOCUS_BLUR.band },
    spread: { value: FOCUS_BLUR.spread },
    strength: { value: FOCUS_BLUR.strength },
    near: { value: FOCUS_BLUR.near },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 texel;
    uniform float focus;
    uniform float band;
    uniform float spread;
    uniform float strength;
    uniform float near;
    varying vec2 vUv;
    void main() {
      float d = vUv.y - focus;
      float reach = smoothstep(band, band + spread, abs(d)) * strength * (d < 0.0 ? near : 1.0);
      vec2 s = texel * reach;
      vec4 sum = texture2D(tDiffuse, vUv) * 0.2270;
      sum += (texture2D(tDiffuse, vUv + s) + texture2D(tDiffuse, vUv - s)) * 0.1945;
      sum += (texture2D(tDiffuse, vUv + s * 2.0) + texture2D(tDiffuse, vUv - s * 2.0)) * 0.1216;
      sum += (texture2D(tDiffuse, vUv + s * 3.0) + texture2D(tDiffuse, vUv - s * 3.0)) * 0.0540;
      sum += (texture2D(tDiffuse, vUv + s * 4.0) + texture2D(tDiffuse, vUv - s * 4.0)) * 0.0162;
      gl_FragColor = sum;
    }`,
};

// The pixel ratio to render at: the device's, capped by the preset, and never below 1 (zoomed-out
// browsers report devicePixelRatio < 1, which breaks the composer).
export function pixelRatioFor(devicePixelRatio, quality) {
  return Math.max(1, Math.min(devicePixelRatio || 1, quality.pixelRatio));
}

export function createRenderer(container, qualityName = 'high') {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  } catch (err) {
    throw new WebGLUnavailableError(err);
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  container.appendChild(renderer.domElement);

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.45, 0.82);
  const blurX = new ShaderPass(FocusBlurShader);
  const blurY = new ShaderPass(FocusBlurShader);
  const grade = new ShaderPass(GradeShader);
  composer.addPass(renderPass);
  composer.addPass(bloom);
  composer.addPass(blurX);
  composer.addPass(blurY);
  composer.addPass(grade);
  composer.addPass(new OutputPass());

  let quality = QUALITY[qualityName];

  function resize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    const ratio = pixelRatioFor(window.devicePixelRatio, quality);
    renderer.setPixelRatio(ratio);
    renderer.setSize(w, h);
    composer.setPixelRatio(ratio);
    composer.setSize(w, h);
    // The reach is in CSS pixels, so the blur looks the same at any pixel ratio.
    blurX.uniforms.texel.value.set(1 / w, 0);
    blurY.uniforms.texel.value.set(0, 1 / h);
    return { width: w, height: h };
  }

  function setQuality(name) {
    if (!QUALITY[name]) throw new Error(`Unknown quality '${name}'`);
    quality = QUALITY[name];
    renderer.shadowMap.enabled = quality.shadows;
    bloom.enabled = quality.bloom;
    blurX.enabled = quality.tiltShift;
    blurY.enabled = quality.tiltShift;
    resize();
  }
  setQuality(qualityName);

  return {
    renderer,
    get quality() { return quality; },
    get canvas() { return renderer.domElement; },
    setQuality,
    resize,
    // Apply a lighting preset's grade values.
    setGrade({ warmth, saturation, vignette }) {
      grade.uniforms.warmth.value = warmth;
      grade.uniforms.saturation.value = saturation;
      grade.uniforms.vignette.value = vignette;
    },
    // focus: the world point to keep sharp (the player); without one the band stays put.
    render(scene, camera, focus = null) {
      if (focus) {
        const y = focusLine(focus, camera);
        blurX.uniforms.focus.value = y;
        blurY.uniforms.focus.value = y;
      }
      renderPass.scene = scene;
      renderPass.camera = camera;
      composer.render();
    },
  };
}
