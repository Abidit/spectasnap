/**
 * Three.js WebGL overlay for SpectaSnap AR try-on.
 *
 * Renders 3D glasses models (.glb) with a transparent background
 * so the layer composites cleanly on top of the camera viewport.
 *
 * Face-pose alignment is NOT handled here — a separate module will
 * transform the active model each frame based on MediaPipe landmarks.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { FaceTransform } from './pose';
import {
  buildOccluderMesh,
  disposeOccluder,
  hideOccluder,
  setOccluderCamera,
  setOccluderDebug,
  setOcclusionEnabled as setOccluderEnabled,
  updateOccluder,
} from './occluder';
import { createProceduralGlasses, updateGlassesColor } from './proceduralGlasses';
import { getProceduralPreset } from './presets';
import {
  buildTempleMeshes,
  disposeTemples,
  hideTemples,
  setTempleDebug,
  updateTemples,
  updateTempleColor,
} from './temples';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModelConfig {
  id: string;
  name: string;
  type: 'glb' | 'procedural';
  modelPath?: string;
  presetId?: string;
  frameColor?: string;
  scaleMultiplier: number;
  offset: { x: number; y: number; z: number };
  rotationOffset: { x: number; y: number; z: number };
}

interface OverlayState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  modelGroup: THREE.Group;
  loader: GLTFLoader;
  /** Keyed by model id (not path). */
  cache: Map<string, THREE.Group>;
  registry: Map<string, ModelConfig>;
  activeId: string | null;
  occlusionEnabled: boolean;
}

// ---------------------------------------------------------------------------
// Module-level singleton
// ---------------------------------------------------------------------------

let state: OverlayState | null = null;
const DEFAULT_OCCLUSION_ENABLED = true;

// ---------------------------------------------------------------------------
// initThreeOverlay
// ---------------------------------------------------------------------------

/**
 * Create renderer, scene, camera, and lights, then kick off an async preload
 * of the aviator model (falls back to procedural geometry if the GLB is absent).
 */
export function initThreeOverlay(containerEl: HTMLElement): HTMLCanvasElement {
  if (state) {
    state.renderer.dispose();
    state.renderer.domElement.remove();
  }

  // ── Renderer ──────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const w = containerEl.clientWidth;
  const h = containerEl.clientHeight;
  renderer.setSize(w, h);

  const canvas = renderer.domElement;
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  containerEl.appendChild(canvas);

  // ── Scene ─────────────────────────────────────────────────────────────────
  const scene = new THREE.Scene();

  // ── Camera ────────────────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(45, w / h || 1, 0.01, 100);
  camera.position.set(0, 0, 1);

  // ── Lights (ambient + key directional + fill) ─────────────────────────────
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(0.5, 1.0, 1.0);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xb0c4de, 0.4);
  fill.position.set(-0.5, 0.0, 0.5);
  scene.add(fill);

  // Hemisphere light for warm underside fill
  const hemi = new THREE.HemisphereLight(0xffffff, 0x443322, 0.5);
  scene.add(hemi);

  // ── Model group (holds the active model) ──────────────────────────────────
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);
  buildOccluderMesh(scene, camera);
  buildTempleMeshes(scene);

  state = {
    renderer,
    scene,
    camera,
    modelGroup,
    loader: new GLTFLoader(),
    cache: new Map(),
    registry: new Map(),
    activeId: null,
    occlusionEnabled: DEFAULT_OCCLUSION_ENABLED,
  };
  setOccluderEnabled(DEFAULT_OCCLUSION_ENABLED);
  setOccluderCamera(camera);

  // Load registry then preload the first (aviator) model.
  loadRegistry('/models/models.json').then(() => {
    const first = state?.registry.values().next().value;
    if (first) preloadModel(first);
  });

  return canvas;
}

// ---------------------------------------------------------------------------
// loadRegistry (private)
// ---------------------------------------------------------------------------

async function loadRegistry(registryPath: string): Promise<void> {
  if (!state) return;
  try {
    const res = await fetch(registryPath);
    const configs: ModelConfig[] = await res.json();
    for (const cfg of configs) state.registry.set(cfg.id, cfg);
  } catch {
    console.warn('[ThreeOverlay] Could not load models.json; using built-in aviator fallback.');
    const fallback: ModelConfig = {
      id: 'glb-aviator',
      name: 'Featured Aviator',
      type: 'glb',
      modelPath: '/models/aviator.glb',
      scaleMultiplier: 1.0,
      offset: { x: 0, y: 0, z: 0 },
      rotationOffset: { x: 0, y: 0, z: 0 },
    };
    state.registry.set(fallback.id, fallback);
  }
}

// ---------------------------------------------------------------------------
// preloadModel (private)
// ---------------------------------------------------------------------------

async function preloadModel(cfg: ModelConfig): Promise<void> {
  try {
    const model = await loadModel(cfg);
    centerModel(model);
    setActiveModel(cfg.id);
  } catch {
    console.info(`[ThreeOverlay] Could not preload model "${cfg.id}", using procedural fallback.`);
    if (!state) return;
    const fallback = buildFallbackGlasses();
    state.modelGroup.add(fallback);
    state.cache.set(cfg.id, fallback);
    setActiveModel(cfg.id);
  }
}

// ---------------------------------------------------------------------------
// buildFallbackGlasses (private)
// ---------------------------------------------------------------------------

/**
 * Construct a minimal procedural glasses shape so the overlay renders
 * even when the real GLB asset is absent.
 *
 * Two oval lens rings + a nose bridge + two temple arms,
 * all in a warm gold metallic material.
 */
function buildFallbackGlasses(): THREE.Group {
  const group = new THREE.Group();

  const mat = new THREE.MeshStandardMaterial({
    color: 0xc9a96e,
    metalness: 0.75,
    roughness: 0.25,
  });

  // Shared lens ring geometry (circular; we scale Y to make it oval).
  const lensGeo = new THREE.TorusGeometry(0.03, 0.004, 10, 32);

  const leftLens = new THREE.Mesh(lensGeo, mat);
  leftLens.scale.set(1, 0.72, 1);
  leftLens.position.set(-0.045, 0, 0);
  group.add(leftLens);

  const rightLens = new THREE.Mesh(lensGeo, mat);
  rightLens.scale.set(1, 0.72, 1);
  rightLens.position.set(0.045, 0, 0);
  group.add(rightLens);

  // Nose bridge: short horizontal bar at the top of the lenses.
  const bridgeGeo = new THREE.BoxGeometry(0.012, 0.004, 0.004);
  const bridge = new THREE.Mesh(bridgeGeo, mat);
  bridge.position.set(0, 0.008, 0);
  group.add(bridge);

  // Temple arms: thin horizontal bars extending outward.
  const templeGeo = new THREE.BoxGeometry(0.065, 0.004, 0.004);

  const leftTemple = new THREE.Mesh(templeGeo, mat);
  leftTemple.position.set(-0.1, 0, -0.005);
  group.add(leftTemple);

  const rightTemple = new THREE.Mesh(templeGeo, mat);
  rightTemple.position.set(0.1, 0, -0.005);
  group.add(rightTemple);

  setRenderOrderRecursive(group, 1);
  return group;
}

// ---------------------------------------------------------------------------
// centerModel (private)
// ---------------------------------------------------------------------------

/** Translate a loaded model so its bounding-box centre sits at the origin. */
function centerModel(model: THREE.Group): void {
  const box = new THREE.Box3().setFromObject(model);
  const centre = new THREE.Vector3();
  box.getCenter(centre);
  model.position.sub(centre);
}

// ---------------------------------------------------------------------------
// loadGlassesModel
// ---------------------------------------------------------------------------

/**
 * Fetch and parse a .glb file. The model is added to modelGroup hidden and
 * cached by model id so subsequent calls for the same id are instant.
 */
async function loadGlassesModel(cfg: ModelConfig): Promise<THREE.Group> {
  if (!state) throw new Error('ThreeOverlay not initialised — call initThreeOverlay first');
  const modelPath = cfg.modelPath;
  if (!modelPath) throw new Error(`Missing modelPath for glb model "${cfg.id}"`);

  const cached = state.cache.get(cfg.id);
  if (cached) return cached;

  return new Promise<THREE.Group>((resolve, reject) => {
    state!.loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        setRenderOrderRecursive(model, 1);
        model.visible = false;
        state!.modelGroup.add(model);
        state!.cache.set(cfg.id, model);
        resolve(model);
      },
      undefined,
      (err) => reject(err),
    );
  });
}

async function loadProceduralModel(cfg: ModelConfig): Promise<THREE.Group> {
  if (!state) throw new Error('ThreeOverlay not initialised — call initThreeOverlay first');
  const preset = getProceduralPreset(cfg.presetId ?? cfg.id);
  if (!preset) throw new Error(`Unknown procedural preset "${cfg.presetId ?? cfg.id}"`);

  const model = createProceduralGlasses(preset);
  setRenderOrderRecursive(model, 1);
  model.visible = false;
  state.modelGroup.add(model);
  state.cache.set(cfg.id, model);
  return model;
}

async function loadModel(cfg: ModelConfig): Promise<THREE.Group> {
  const cached = state?.cache.get(cfg.id);
  if (cached) return cached;
  if (cfg.type === 'procedural') return loadProceduralModel(cfg);
  return loadGlassesModel(cfg);
}

export async function selectModel(id: string | null): Promise<void> {
  if (!state || !id) {
    setActiveModel(null);
    return;
  }

  const cfg = state.registry.get(id);
  if (!cfg) {
    setActiveModel(null);
    return;
  }

  try {
    const model = await loadModel(cfg);
    centerModel(model);
    setActiveModel(cfg.id);
  } catch {
    const fallback = buildFallbackGlasses();
    fallback.visible = false;
    setRenderOrderRecursive(fallback, 1);
    state.modelGroup.add(fallback);
    state.cache.set(cfg.id, fallback);
    setActiveModel(cfg.id);
  }
}

// ---------------------------------------------------------------------------
// setActiveModel
// ---------------------------------------------------------------------------

/**
 * Show only the model with the given `id` (must already be loaded or cached).
 * Pass `null` to hide everything.
 */
export function setActiveModel(id: string | null): void {
  if (!state) return;

  state.cache.forEach((model) => {
    model.visible = false;
  });

  state.activeId = id;

  if (id) {
    const model = state.cache.get(id);
    if (model) {
      setRenderOrderRecursive(model, 1);
      model.visible = true;
    }
    // Sync temple color with the newly active frame.
    // models.json rarely has frameColor, so fall back to the preset's frameColor.
    const cfg = state.registry.get(id);
    let syncColor: string | undefined = cfg?.frameColor;
    if (!syncColor && cfg?.type === 'procedural') {
      const preset = getProceduralPreset(cfg.presetId ?? id);
      if (preset) syncColor = preset.frameColor;
    }
    if (syncColor) updateTempleColor(syncColor);
  }
}

// ---------------------------------------------------------------------------
// renderFrame
// ---------------------------------------------------------------------------

/** Render one frame. Call this inside a requestAnimationFrame loop. */
export function renderFrame(): void {
  if (!state) return;
  state.renderer.render(state.scene, state.camera);
}

// ---------------------------------------------------------------------------
// resize
// ---------------------------------------------------------------------------

/** Update renderer size and camera aspect to stay aligned with the viewport. */
export function resize(w: number, h: number): void {
  if (!state) return;
  state.camera.aspect = w / h || 1;
  state.camera.updateProjectionMatrix();
  state.renderer.setSize(w, h);
  setOccluderCamera(state.camera);
}

// ---------------------------------------------------------------------------
// dispose
// ---------------------------------------------------------------------------

/** Tear down the renderer, free GPU memory, remove the canvas from the DOM. */
export function dispose(): void {
  if (!state) return;

  state.cache.forEach((model) => {
    model.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => m.dispose());
      }
    });
  });

  state.cache.clear();
  disposeOccluder();
  disposeTemples();
  state.renderer.dispose();
  state.renderer.domElement.remove();
  state = null;
}

// ---------------------------------------------------------------------------
// applyFaceTransform
// ---------------------------------------------------------------------------

/**
 * Calibration constants — tune these to adjust glasses fit without touching
 * the tracking math.
 *
 * BASE_SCALE_FACTOR: multiplied against IPD-derived world scale.
 *   Increase to make glasses larger relative to the face, decrease to shrink.
 */
const BASE_SCALE_FACTOR = 0.85;
// Global correction for meshes that are authored facing the opposite direction.
const MODEL_BASE_ROTATION_Y = Math.PI;

/**
 * Position, scale, and roll-rotate the active model to match the detected face.
 *
 * Coordinate mapping:
 *   The camera sits at z=1 looking toward -z; the model group lives at z=0.
 *   We unproject the pixel-space (cx, cy) through the camera frustum to get
 *   the equivalent world-space (x, y) at that plane.
 *
 * @param transform  Smoothed FaceTransform from pose.smooth()
 * @param canvasW    Width of the 2-D video canvas in pixels
 * @param canvasH    Height of the 2-D video canvas in pixels
 */
export function applyFaceTransform(
  transform: FaceTransform,
  canvasW: number,
  canvasH: number,
): void {
  if (!state) return;
  const model = getActiveModel();
  if (!model) return;

  const { camera } = state;

  // Per-model rotation offsets from models.json (default to 0).
  const cfg = state.activeId ? state.registry.get(state.activeId) : undefined;
  const rotOff = cfg?.rotationOffset ?? { x: 0, y: 0, z: 0 };
  const posOff = cfg?.offset ?? { x: 0, y: 0, z: 0 };
  const scaleMultiplier = cfg?.scaleMultiplier ?? 1;

  // Half-extents of the world-space frustum slice at z=0 (model plane).
  // camera.position.z = 1, so:  halfH = 1 * tan(fov/2),  halfW = halfH * aspect
  const tanHalfFOV = Math.tan((camera.fov / 2) * (Math.PI / 180));
  const halfH = camera.position.z * tanHalfFOV;
  const halfW = halfH * camera.aspect;

  // Normalised device coordinates (NDC): -1 … +1.
  // Flip Y because canvas Y grows down but Three.js world Y grows up.
  const ndcX =  (transform.cx / canvasW) * 2 - 1;
  const ndcY = -((transform.cy / canvasH) * 2 - 1);

  model.position.x = ndcX * halfW + posOff.x;
  model.position.y = ndcY * halfH + posOff.y;
  model.position.z = posOff.z;

  // Scale proportional to IPD expressed in world units.
  const ipdWorld = (transform.ipd / canvasW) * (halfW * 2);
  model.scale.setScalar(ipdWorld * BASE_SCALE_FACTOR * scaleMultiplier);

  // Rotations — roll is negated because screen-space angle is CW but
  // Three.js rotation is CCW. Yaw and pitch are applied directly from pose.ts
  // (sign conventions are documented there). rotationOffset lets per-model
  // JSON config correct any mesh-orientation mismatch.
  model.rotation.x = transform.pitch + rotOff.x;
  model.rotation.y = transform.yaw + rotOff.y + MODEL_BASE_ROTATION_Y;
  model.rotation.z = -transform.roll + rotOff.z;
}

// Called every frame alongside applyFaceTransform.
export function updateTempleExtensions(
  _landmarks: import('@mediapipe/tasks-vision').NormalizedLandmark[],
  _transform: FaceTransform,
  _canvasW: number,
  _canvasH: number,
): void {
  // Temples hidden — infrastructure preserved for re-enabling later.
  hideTemples();
}

export function clearTempleExtensions(): void {
  hideTemples();
}

// ---------------------------------------------------------------------------
// setModelOpacity
// ---------------------------------------------------------------------------

/**
 * Set the opacity of every material on the active model.
 * Used for hold-then-fade-out when the face disappears.
 */
export function setModelOpacity(opacity: number): void {
  if (!state) return;
  const model = getActiveModel();
  if (!model) return;

  const clamped = Math.max(0, Math.min(1, opacity));
  model.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const mat of mats as THREE.Material[]) {
      if (!('opacity' in mat)) continue;
      (mat as THREE.MeshStandardMaterial).transparent = clamped < 1;
      (mat as THREE.MeshStandardMaterial).opacity = clamped;
      mat.needsUpdate = true;
    }
  });
}

/**
 * Update the frame and lens colors of the active model in-place.
 * Also syncs the landmark-driven temple arm color.
 */
export function setModelColor(frameHex: string, lensHex: string): void {
  if (!state) return;
  const model = getActiveModel();
  if (model) updateGlassesColor(model, frameHex, lensHex);
  updateTempleColor(frameHex);
}

export function updateFaceOccluder(
  landmarks: NormalizedLandmark[],
  canvasW: number,
  canvasH: number,
): void {
  if (!state) return;
  updateOccluder(landmarks, canvasW, canvasH);
}

export function clearFaceOccluder(): void {
  hideOccluder();
}

export function setOcclusionEnabled(enabled: boolean): void {
  if (!state) return;
  state.occlusionEnabled = enabled;
  setOccluderEnabled(enabled);
}

export function setOcclusionDebug(on: boolean): void {
  setOccluderDebug(on);
}

export function setTempleExtensionDebug(on: boolean): void {
  setTempleDebug(on);
}

// ---------------------------------------------------------------------------
// Accessors — for future agents (face-pose, occlusion, etc.)
// ---------------------------------------------------------------------------

export function getActiveModel(): THREE.Group | null {
  if (!state?.activeId) return null;
  return state.cache.get(state.activeId) ?? null;
}

export function getCamera(): THREE.PerspectiveCamera | null {
  return state?.camera ?? null;
}

export function getScene(): THREE.Scene | null {
  return state?.scene ?? null;
}

function setRenderOrderRecursive(obj: THREE.Object3D, renderOrder: number): void {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) child.renderOrder = renderOrder;
  });
}
