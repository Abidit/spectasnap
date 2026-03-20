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
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { FaceTransform } from './pose';
import type { LensTint } from './presets';
import {
  buildOccluderMesh,
  disposeOccluder,
  hideOccluder,
  setOccluderCamera,
  setOccluderDebug,
  setOcclusionEnabled as setOccluderEnabled,
  updateOccluder,
  buildOccluderForFace,
  updateOccluderForFace,
  hideOccluderForFace,
  disposeAllOccluders,
} from './occluder';
import { createProceduralGlasses, updateGlassesColor } from './proceduralGlasses';
import { getProceduralPreset } from './presets';
import { createCustomFrameMesh, type CustomFrameData } from './customFrameLoader';
import { calibrateGLB, calibrateGLBFrontFrame } from './glbCalibrate';
import { detectTemples } from './glbTempleDetect';
import type { TempleDetectionResult } from './glbTempleDetect';
import { animateTempleSplit, animateTempleBones, type TempleAnimationContext } from './glbTempleAnimate';
import { createTemplePair } from './proceduralTemples';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModelConfig {
  id: string;
  name: string;
  type: 'glb' | 'procedural' | 'custom';
  modelPath?: string;
  presetId?: string;
  frameColor?: string;
  scaleMultiplier: number;
  offset: { x: number; y: number; z: number };
  rotationOffset: { x: number; y: number; z: number };
  /** Custom frame data — only present for type: 'custom'. */
  customData?: CustomFrameData;
  // — temple metadata for GLB models —
  /** Whether the GLB includes temple arm meshes. */
  hasTemples?: boolean;
  /** Explicit mesh names for temple detection (overrides auto-detect). */
  templeMeshNames?: string[];
  /** Temple articulation method. Default: auto-detect. */
  templeMethod?: 'bone' | 'split' | 'none';
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
  envTexture: THREE.Texture | null;
  /** Temple detection results keyed by model id. */
  templeData: Map<string, TempleDetectionResult>;
}

// ---------------------------------------------------------------------------
// Module-level singleton
// ---------------------------------------------------------------------------

let state: OverlayState | null = null;

// ---------------------------------------------------------------------------
// Multi-face slot system — renders glasses on up to 3 faces simultaneously
// ---------------------------------------------------------------------------

const MAX_FACES = 3;

interface FaceSlot {
  model: THREE.Group;
  modelId: string; // tracks which activeId this was cloned from
  lastOpacity: number;
}

/** Face slots: index 0 is always the primary (uses existing active model). */
const faceSlots: (FaceSlot | null)[] = [null, null, null];

/**
 * Deep-clone a THREE.Group including material instances so each face
 * can have independent opacity / color without affecting others.
 */
function cloneWithMaterials(source: THREE.Group): THREE.Group {
  const clone = source.clone(true);
  clone.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      if (Array.isArray(obj.material)) {
        obj.material = obj.material.map((m: THREE.Material) => m.clone());
      } else {
        obj.material = obj.material.clone();
      }
    }
  });
  return clone;
}
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

  // ── Environment map (RoomEnvironment for realistic reflections) ───────────
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const roomEnv = new RoomEnvironment();
  const envTexture = pmremGenerator.fromScene(roomEnv).texture;
  scene.environment = envTexture;
  scene.background = null; // Keep transparent for AR compositing
  roomEnv.dispose();
  pmremGenerator.dispose();

  // ── Lights ────────────────────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const front = new THREE.DirectionalLight(0xffffff, 0.8);
  front.position.set(0, 2, 4);
  scene.add(front);

  const rim = new THREE.DirectionalLight(0xffeedd, 0.3);
  rim.position.set(-3, 1, -2);
  scene.add(rim);

  const fillLight = new THREE.DirectionalLight(0xddeeff, 0.2);
  fillLight.position.set(3, 0, 2);
  scene.add(fillLight);

  // ── Model group (holds the active model) ──────────────────────────────────
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);
  buildOccluderMesh(scene, camera);

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
    envTexture,
    templeData: new Map(),
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
  leftLens.userData.role = 'frame';
  group.add(leftLens);

  const rightLens = new THREE.Mesh(lensGeo, mat);
  rightLens.scale.set(1, 0.72, 1);
  rightLens.position.set(0.045, 0, 0);
  rightLens.userData.role = 'frame';
  group.add(rightLens);

  // Nose bridge: short horizontal bar at the top of the lenses.
  const bridgeGeo = new THREE.BoxGeometry(0.012, 0.004, 0.004);
  const bridge = new THREE.Mesh(bridgeGeo, mat);
  bridge.position.set(0, 0.008, 0);
  bridge.userData.role = 'frame';
  group.add(bridge);

  // Temple arms: thin horizontal bars extending outward.
  const templeGeo = new THREE.BoxGeometry(0.065, 0.004, 0.004);

  const leftTemple = new THREE.Mesh(templeGeo, mat);
  leftTemple.position.set(-0.1, 0, -0.005);
  leftTemple.userData.role = 'frame';
  group.add(leftTemple);

  const rightTemple = new THREE.Mesh(templeGeo, mat);
  rightTemple.position.set(0.1, 0, -0.005);
  rightTemple.userData.role = 'frame';
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
// tagGLBMeshRoles — label meshes for color/tint/coating systems (Task B.6)
// ---------------------------------------------------------------------------

/**
 * Tag meshes in a loaded GLB with userData.role so the color/tint/coating
 * systems can identify them. Temples get 'temple', lenses get 'lens',
 * everything else gets 'frame'.
 */
function tagGLBMeshRoles(model: THREE.Group, detection: TempleDetectionResult): void {
  // Tag temple meshes
  if (detection.leftTemple) {
    detection.leftTemple.traverse((obj) => {
      if (obj instanceof THREE.Mesh) obj.userData.role = 'temple';
    });
  }
  if (detection.rightTemple) {
    detection.rightTemple.traverse((obj) => {
      if (obj instanceof THREE.Mesh) obj.userData.role = 'temple';
    });
  }

  // Tag remaining meshes
  model.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    if (obj.userData.role) return; // already tagged (temple)

    const name = obj.name.toLowerCase();
    if (name.includes('lens')) {
      obj.userData.role = 'lens';
    } else if (
      obj.material &&
      !Array.isArray(obj.material) &&
      (obj.material as THREE.MeshPhysicalMaterial).transparent === true &&
      (obj.material as THREE.MeshPhysicalMaterial).opacity < 0.8
    ) {
      // Transparent material → likely a lens
      obj.userData.role = 'lens';
    } else {
      obj.userData.role = 'frame';
    }
  });
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

        // Auto-calibrate GLB to match standard procedural glasses dimensions.
        const calibration = calibrateGLB(model);
        model.scale.setScalar(calibration.scale);
        model.position.y += calibration.yOffset;
        model.position.z += calibration.zOffset;

        // Detect temples in the loaded GLB (Task B.4)
        const templeConfig = {
          hasTemples: cfg.hasTemples,
          templeMeshNames: cfg.templeMeshNames,
          templeMethod: cfg.templeMethod,
        };
        const detection = detectTemples(model, templeConfig);
        state!.templeData.set(cfg.id, detection);

        // Tag meshes with userData.role for color/tint/coating systems (Task B.6)
        tagGLBMeshRoles(model, detection);

        // If temples were detected, recalibrate using front frame only (Task B.4)
        if (detection.hasTemples && detection.method === 'split') {
          const frontCal = calibrateGLBFrontFrame(model, detection.frontFrame);
          model.scale.setScalar(frontCal.scale);
          model.position.set(0, frontCal.yOffset, frontCal.zOffset);
        }

        // If GLB has no temples, attach procedural fallback (Task B.7)
        if (!detection.hasTemples) {
          let templePresetId = cfg.presetId;
          if (!templePresetId) {
            // Guess from model name
            const name = cfg.name.toLowerCase();
            if (name.includes('aviator')) templePresetId = 'aviator-01';
            else if (name.includes('round')) templePresetId = 'round-01';
            else if (name.includes('cat')) templePresetId = 'cat-eye-01';
            else if (name.includes('sport')) templePresetId = 'sport-wrap-01';
            else templePresetId = 'rectangle-01';
          }

          const templePreset = getProceduralPreset(templePresetId ?? 'rectangle-01');
          if (templePreset) {
            const temples = createTemplePair(templePreset);

            // Position at outer edges of the front frame
            const frontBox = new THREE.Box3().setFromObject(model);
            const frontSize = new THREE.Vector3();
            frontBox.getSize(frontSize);

            temples.left.position.set(-frontSize.x / 2, 0, 0);
            temples.right.position.set(frontSize.x / 2, 0, 0);

            model.add(temples.left);
            model.add(temples.right);
          }
        }

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

async function loadCustomModel(cfg: ModelConfig): Promise<THREE.Group> {
  if (!state) throw new Error('ThreeOverlay not initialised — call initThreeOverlay first');
  if (!cfg.customData) throw new Error(`Missing customData for custom model "${cfg.id}"`);

  const model = createCustomFrameMesh(cfg.customData);
  setRenderOrderRecursive(model, 1);
  model.visible = false;
  state.modelGroup.add(model);
  state.cache.set(cfg.id, model);
  return model;
}

async function loadModel(cfg: ModelConfig): Promise<THREE.Group> {
  const cached = state?.cache.get(cfg.id);
  if (cached) return cached;
  if (cfg.type === 'custom') return loadCustomModel(cfg);
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
  }

  // Re-create secondary face slots for the new active model.
  syncFaceSlotsToActiveModel();
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
  // Clean up all face slots and occluders.
  for (let i = 1; i < MAX_FACES; i++) clearFaceSlot(i);
  disposeAllOccluders();
  state.envTexture?.dispose();
  state.scene.environment = null;
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
const BASE_SCALE_FACTOR = 0.72;

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
  model.rotation.y = transform.yaw + rotOff.y;
  model.rotation.z = -transform.roll + rotOff.z;
}

// ---------------------------------------------------------------------------
// animateGLBTemples — per-frame temple arm animation (Task B.4)
// ---------------------------------------------------------------------------

/**
 * Animate GLB temple arms to track the user's ears.
 * Called each frame from ARCamera's render loop.
 */
export function animateGLBTemples(
  landmarks: NormalizedLandmark[],
  transform: FaceTransform,
  _canvasW: number,
  _canvasH: number,
): void {
  if (!state?.activeId) return;
  const detection = state.templeData.get(state.activeId);
  if (!detection?.hasTemples) return;

  const { camera } = state;
  if (detection.method === 'bone') {
    animateTempleBones(detection as TempleAnimationContext, landmarks, transform, camera);
  } else if (detection.method === 'split') {
    const frontGroup = state.cache.get(state.activeId);
    if (frontGroup && detection.leftTemple && detection.rightTemple) {
      animateTempleSplit(
        frontGroup,
        detection.leftTemple,
        detection.rightTemple,
        landmarks,
        transform,
        camera,
      );
    }
  }
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
 */
export function setModelColor(frameHex: string, lensHex: string): void {
  if (!state) return;
  const model = getActiveModel();
  if (model) updateGlassesColor(model, frameHex, lensHex);
  // Propagate to secondary face slots.
  for (let i = 1; i < MAX_FACES; i++) {
    if (faceSlots[i]?.model) updateGlassesColor(faceSlots[i]!.model, frameHex, lensHex);
  }
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

// ---------------------------------------------------------------------------
// setLensTint — apply lens tint variant (Task 9)
// ---------------------------------------------------------------------------

/**
 * Update only the lens material properties for a tint variant.
 * Leaves frame color unchanged.
 */
/** Apply a lens tint to a specific model group. */
function applyTintToModel(model: THREE.Group, tint: LensTint): void {
  const lensColor = new THREE.Color(tint.lensHex);
  model.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh) || obj.userData.role !== 'lens') return;
    const mat = obj.material as THREE.MeshPhysicalMaterial;
    mat.color.copy(lensColor);
    mat.transmission = tint.transmission;
    mat.opacity = tint.opacity;
    if (tint.metalness !== undefined) mat.metalness = tint.metalness;
    if (tint.roughness !== undefined) mat.roughness = tint.roughness;
    mat.needsUpdate = true;
  });
}

export function setLensTint(tint: LensTint): void {
  if (!state) return;
  const model = getActiveModel();
  if (model) applyTintToModel(model, tint);
  // Propagate to secondary face slots.
  for (let i = 1; i < MAX_FACES; i++) {
    if (faceSlots[i]?.model) applyTintToModel(faceSlots[i]!.model, tint);
  }
}

// ---------------------------------------------------------------------------
// setLensCoating — toggle anti-reflective coating simulation (Task 8.2)
// ---------------------------------------------------------------------------

/**
 * Toggle anti-reflective coating simulation on lens materials.
 * Uses Three.js iridescence properties (available in r149+).
 */
/** Apply lens coating to a specific model group. */
function applyCoatingToModel(model: THREE.Group, enabled: boolean): void {
  model.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh) || obj.userData.role !== 'lens') return;
    const mat = obj.material as THREE.MeshPhysicalMaterial;
    if (enabled) {
      mat.iridescence = 0.5;
      mat.iridescenceIOR = 1.3;
      mat.iridescenceThicknessRange = [200, 400]; // green/purple nm range
    } else {
      mat.iridescence = 0;
    }
    mat.needsUpdate = true;
  });
}

export function setLensCoating(enabled: boolean): void {
  if (!state) return;
  const model = getActiveModel();
  if (model) applyCoatingToModel(model, enabled);
  // Propagate to secondary face slots.
  for (let i = 1; i < MAX_FACES; i++) {
    if (faceSlots[i]?.model) applyCoatingToModel(faceSlots[i]!.model, enabled);
  }
}

// ---------------------------------------------------------------------------
// registerCustomFrame — inject a user-uploaded frame into the registry
// ---------------------------------------------------------------------------

/**
 * Register a custom (PNG-overlay) frame so it can be selected via selectModel().
 * Returns the generated model config ID.
 */
export function registerCustomFrame(data: CustomFrameData): string {
  if (!state) throw new Error('ThreeOverlay not initialised');
  const id = `custom-${Date.now()}`;
  const cfg: ModelConfig = {
    id,
    name: data.name || 'Custom Frame',
    type: 'custom',
    scaleMultiplier: 1.0,
    offset: { x: 0, y: 0, z: 0 },
    rotationOffset: { x: 0, y: 0, z: 0 },
    customData: data,
  };
  state.registry.set(id, cfg);
  return id;
}

// ---------------------------------------------------------------------------
// registerGLBModel — inject a store-uploaded GLB model into the registry
// ---------------------------------------------------------------------------

/**
 * Register a GLB model from a Blob URL so it can be loaded via selectModel().
 * Optionally accepts calibration overrides for scale and position offsets.
 */
export function registerGLBModel(
  id: string,
  name: string,
  blobUrl: string,
  calibration?: { scale?: number; yOffset?: number; zOffset?: number },
): void {
  if (!state) return;
  const cfg: ModelConfig = {
    id,
    name,
    type: 'glb',
    modelPath: blobUrl,
    scaleMultiplier: calibration?.scale ?? 1.0,
    offset: { x: 0, y: calibration?.yOffset ?? 0, z: calibration?.zOffset ?? 0 },
    rotationOffset: { x: 0, y: 0, z: 0 },
  };
  state.registry.set(id, cfg);
}

// ---------------------------------------------------------------------------
// Multi-face slot API
// ---------------------------------------------------------------------------

/**
 * Ensure a face slot exists for the given face index.
 * Slot 0 always uses the existing active model (no-op).
 * Slots 1-2 clone the active model for independent transforms.
 */
export function ensureFaceSlot(faceIndex: number): void {
  if (faceIndex === 0 || !state || !state.activeId) return;
  if (faceIndex >= MAX_FACES) return;

  const slot = faceSlots[faceIndex];
  // Already created for the current active model — skip.
  if (slot && slot.modelId === state.activeId) return;

  // Tear down old slot if model changed.
  if (slot) clearFaceSlot(faceIndex);

  const cfg = state.registry.get(state.activeId);
  if (!cfg) return;

  let model: THREE.Group;
  if (cfg.type === 'procedural' && cfg.presetId) {
    // Create a fresh procedural model (independent geometry + materials).
    const preset = getProceduralPreset(cfg.presetId);
    if (!preset) return;
    model = createProceduralGlasses(preset);
  } else {
    // Clone the primary model with independent materials.
    const primary = state.cache.get(state.activeId);
    if (!primary) return;
    model = cloneWithMaterials(primary);
  }

  setRenderOrderRecursive(model, 1);
  model.visible = true;
  state.modelGroup.add(model);

  // Build occluder for this face.
  buildOccluderForFace(faceIndex, state.scene, state.camera);

  faceSlots[faceIndex] = {
    model,
    modelId: state.activeId,
    lastOpacity: 1,
  };
}

/**
 * Apply face transform to a specific face index.
 * Index 0 delegates to the existing applyFaceTransform.
 */
export function applyFaceTransformMulti(
  faceIndex: number,
  transform: FaceTransform,
  canvasW: number,
  canvasH: number,
): void {
  if (!state) return;

  if (faceIndex === 0) {
    applyFaceTransform(transform, canvasW, canvasH);
    return;
  }

  const slot = faceSlots[faceIndex];
  if (!slot) return;

  const { camera } = state;
  const cfg = state.activeId ? state.registry.get(state.activeId) : undefined;
  const rotOff = cfg?.rotationOffset ?? { x: 0, y: 0, z: 0 };
  const posOff = cfg?.offset ?? { x: 0, y: 0, z: 0 };
  const scaleMultiplier = cfg?.scaleMultiplier ?? 1;

  const tanHalfFOV = Math.tan((camera.fov / 2) * (Math.PI / 180));
  const halfH = camera.position.z * tanHalfFOV;
  const halfW = halfH * camera.aspect;

  const ndcX =  (transform.cx / canvasW) * 2 - 1;
  const ndcY = -((transform.cy / canvasH) * 2 - 1);

  slot.model.position.x = ndcX * halfW + posOff.x;
  slot.model.position.y = ndcY * halfH + posOff.y;
  slot.model.position.z = posOff.z;

  const ipdWorld = (transform.ipd / canvasW) * (halfW * 2);
  slot.model.scale.setScalar(ipdWorld * BASE_SCALE_FACTOR * scaleMultiplier);

  slot.model.rotation.x = transform.pitch + rotOff.x;
  slot.model.rotation.y = transform.yaw + rotOff.y;
  slot.model.rotation.z = -transform.roll + rotOff.z;
}

/**
 * Update the face occluder for a specific face index.
 * Index 0 delegates to the existing updateFaceOccluder.
 */
export function updateFaceOccluderMulti(
  faceIndex: number,
  landmarks: NormalizedLandmark[],
  canvasW: number,
  canvasH: number,
): void {
  if (!state) return;
  if (faceIndex === 0) {
    updateOccluder(landmarks, canvasW, canvasH);
  } else {
    updateOccluderForFace(faceIndex, landmarks, canvasW, canvasH);
  }
}

/**
 * Set opacity for a specific face slot.
 * Index 0 delegates to the existing setModelOpacity.
 */
export function setFaceSlotOpacity(faceIndex: number, opacity: number): void {
  if (!state) return;

  if (faceIndex === 0) {
    setModelOpacity(opacity);
    return;
  }

  const slot = faceSlots[faceIndex];
  if (!slot) return;

  const clamped = Math.max(0, Math.min(1, opacity));
  slot.lastOpacity = clamped;
  slot.model.traverse((obj) => {
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
 * Clear a face slot — remove its model from the scene and dispose resources.
 * Index 0 just hides the active model + occluder.
 */
export function clearFaceSlot(faceIndex: number): void {
  if (faceIndex === 0) {
    setModelOpacity(0);
    hideOccluder();
    return;
  }

  const slot = faceSlots[faceIndex];
  if (!slot) return;

  slot.model.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => m.dispose());
    }
  });
  state?.modelGroup.remove(slot.model);
  hideOccluderForFace(faceIndex);
  faceSlots[faceIndex] = null;
}

/**
 * Re-create all secondary face slots to match the current active model.
 * Called internally when the user switches frames.
 */
function syncFaceSlotsToActiveModel(): void {
  for (let i = 1; i < MAX_FACES; i++) {
    if (faceSlots[i]) {
      clearFaceSlot(i);
      // Slot will be re-created on next ensureFaceSlot() call from ARCamera.
    }
  }
}

// ---------------------------------------------------------------------------
// Accessors — for future agents (face-pose, occlusion, etc.)
// ---------------------------------------------------------------------------

/** Returns true once initThreeOverlay() has completed (state is non-null). */
export function isReady(): boolean {
  return state !== null;
}

export function getActiveModel(): THREE.Group | null {
  if (!state?.activeId) return null;
  return state.cache.get(state.activeId) ?? null;
}

export function getCamera(): THREE.PerspectiveCamera | null {
  return state?.camera ?? null;
}

export function getCanvas(): HTMLCanvasElement | null {
  return state?.renderer.domElement ?? null;
}

export function getScene(): THREE.Scene | null {
  return state?.scene ?? null;
}

function setRenderOrderRecursive(obj: THREE.Object3D, renderOrder: number): void {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) child.renderOrder = renderOrder;
  });
}
