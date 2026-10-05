// three.js renderer + HD-2D post-processing (spec §4.1): bloom, tilt-shift blur, warm grade and
// vignette on High; grade only on Low.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { HorizontalTiltShiftShader } from 'three/addons/shaders/HorizontalTiltShiftShader.js';
import { VerticalTiltShiftShader } from 'three/addons/shaders/VerticalTiltShiftShader.js';
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
  const tiltH = new ShaderPass(HorizontalTiltShiftShader);
  const tiltV = new ShaderPass(VerticalTiltShiftShader);
  const grade = new ShaderPass(GradeShader);
  composer.addPass(renderPass);
  composer.addPass(bloom);
  composer.addPass(tiltH);
  composer.addPass(tiltV);
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
    tiltH.uniforms.h.value = 2.2 / (w * ratio);
    tiltV.uniforms.v.value = 2.2 / (h * ratio);
    tiltH.uniforms.r.value = 0.48;
    tiltV.uniforms.r.value = 0.48;
    return { width: w, height: h };
  }

  function setQuality(name) {
    if (!QUALITY[name]) throw new Error(`Unknown quality '${name}'`);
    quality = QUALITY[name];
    renderer.shadowMap.enabled = quality.shadows;
    bloom.enabled = quality.bloom;
    tiltH.enabled = quality.tiltShift;
    tiltV.enabled = quality.tiltShift;
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
    render(scene, camera) {
      renderPass.scene = scene;
      renderPass.camera = camera;
      composer.render();
    },
  };
}
