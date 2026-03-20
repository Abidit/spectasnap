import * as THREE from 'three';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { TRIANGULATION } from './triangulation';

const FACE_VERTEX_COUNT = 478;

// Lateral expansion: extra virtual vertices (indices 468–477 are iris/unused in
// 468-point meshes). We repurpose indices 468–473 as side-face anchor points
// derived from landmarks 234, 454, 356, 127, 162, 389 to widen coverage.
const SIDE_LM = [234, 454, 356, 127, 162, 389] as const; // 6 extra anchors
const SIDE_BASE = 468; // starting virtual-vertex index

// Extra triangles stitched to the side landmark anchors so the occluder
// extends across cheeks and temples (beyond what TRIANGULATION covers alone).
const SIDE_TRIANGLES: number[] = [
  // left cheek fan: verts 234 (SB+0), 162 (SB+4), 127 (SB+3), and edge lms
  SIDE_BASE + 0, 234, SIDE_BASE + 4,
  SIDE_BASE + 0, SIDE_BASE + 4, SIDE_BASE + 3,
  // right cheek fan: 454 (SB+1), 389 (SB+5), 356 (SB+2)
  SIDE_BASE + 1, SIDE_BASE + 5, 454,
  SIDE_BASE + 1, SIDE_BASE + 2, SIDE_BASE + 5,
  // connect side anchors to nearby face-oval lms
  SIDE_BASE + 0, 132, 234,
  SIDE_BASE + 0, 127, 132,
  SIDE_BASE + 3, 162, SIDE_BASE + 0,
  SIDE_BASE + 1, 454, 361,
  SIDE_BASE + 1, 361, SIDE_BASE + 2,
  SIDE_BASE + 2, 356, 389,
];

const TOTAL_VERTS = FACE_VERTEX_COUNT + SIDE_LM.length;

// ---------------------------------------------------------------------------
// FaceOccluder — per-face occluder instance
// ---------------------------------------------------------------------------

/**
 * Self-contained face occluder. Each instance owns its own mesh, geometry,
 * and position buffer so multiple faces can be occluded independently.
 */
export class FaceOccluder {
  mesh: THREE.Mesh;
  geometry: THREE.BufferGeometry;
  positionAttr: THREE.BufferAttribute;
  solidMat: THREE.MeshBasicMaterial;
  debugMat: THREE.MeshBasicMaterial;
  camera: THREE.PerspectiveCamera | null = null;
  enabled = true;
  debug = false;

  constructor(scene: THREE.Scene, camera?: THREE.PerspectiveCamera) {
    const positions = new Float32Array(TOTAL_VERTS * 3);
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const allIndices = [...TRIANGULATION, ...SIDE_TRIANGLES];
    this.geometry.setIndex(allIndices);

    this.solidMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      colorWrite: false,
      depthWrite: true,
      depthTest: true,
      side: THREE.FrontSide,
    });

    this.debugMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      colorWrite: true,
      depthWrite: true,
      depthTest: true,
      transparent: true,
      opacity: 0.35,
      side: THREE.FrontSide,
      wireframe: false,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.solidMat);
    this.mesh.renderOrder = 0;
    this.mesh.visible = false;
    this.mesh.frustumCulled = false;
    this.mesh.scale.setScalar(1.01);

    this.positionAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    if (camera) this.camera = camera;

    scene.add(this.mesh);
  }

  update(landmarks: NormalizedLandmark[], videoW: number, videoH: number): void {
    if (!this.enabled || !this.camera) {
      this.mesh.visible = false;
      return;
    }

    if (landmarks.length < 468 || videoW <= 0 || videoH <= 0) {
      this.mesh.visible = false;
      return;
    }

    const tanHalfFOV = Math.tan((this.camera.fov / 2) * (Math.PI / 180));
    const halfH = this.camera.position.z * tanHalfFOV;
    const halfW = halfH * this.camera.aspect;
    const depthScale = halfW * 2;

    const count = Math.min(landmarks.length, FACE_VERTEX_COUNT);
    for (let i = 0; i < count; i++) {
      const lm = landmarks[i];
      const offset = i * 3;

      // Mirror X to match the camera canvas transform in ARCamera.
      const ndcX = (1 - lm.x) * 2 - 1;
      const ndcY = -(lm.y * 2 - 1);

      this.positionAttr.array[offset]     = ndcX * halfW;
      this.positionAttr.array[offset + 1] = ndcY * halfH;
      this.positionAttr.array[offset + 2] = THREE.MathUtils.clamp(-lm.z * depthScale, -0.25, 0.25);
    }

    // Zero any trailing face vertices (iris region 468-477 if landmarks < 478).
    for (let i = count; i < FACE_VERTEX_COUNT; i++) {
      const offset = i * 3;
      this.positionAttr.array[offset] = 0;
      this.positionAttr.array[offset + 1] = 0;
      this.positionAttr.array[offset + 2] = 0;
    }

    // ── Side-face anchor vertices (beyond FACE_VERTEX_COUNT) ──────────────────
    for (let s = 0; s < SIDE_LM.length; s++) {
      const srcIdx = SIDE_LM[s];
      const dstBase = (FACE_VERTEX_COUNT + s) * 3;
      this.positionAttr.array[dstBase]     = this.positionAttr.array[srcIdx * 3];
      this.positionAttr.array[dstBase + 1] = this.positionAttr.array[srcIdx * 3 + 1];
      this.positionAttr.array[dstBase + 2] = this.positionAttr.array[srcIdx * 3 + 2] + 0.012;
    }

    this.positionAttr.needsUpdate = true;
    this.mesh.visible = true;
  }

  hide(): void {
    this.mesh.visible = false;
  }

  setDebug(on: boolean): void {
    this.debug = on;
    this.mesh.material = on ? this.debugMat : this.solidMat;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.mesh.visible = false;
  }

  setCamera(camera: THREE.PerspectiveCamera): void {
    this.camera = camera;
  }

  dispose(): void {
    this.mesh.parent?.remove(this.mesh);
    this.solidMat.dispose();
    this.debugMat.dispose();
    this.geometry.dispose();
  }
}

// ---------------------------------------------------------------------------
// Per-face occluder pool
// ---------------------------------------------------------------------------

const occluderPool: (FaceOccluder | null)[] = [null, null, null];

// ---------------------------------------------------------------------------
// Backward-compatible API (wraps pool slot 0)
// ---------------------------------------------------------------------------

export function buildOccluderMesh(
  scene: THREE.Scene,
  camera?: THREE.PerspectiveCamera,
): THREE.Mesh {
  if (!occluderPool[0]) {
    occluderPool[0] = new FaceOccluder(scene, camera);
  } else if (camera) {
    occluderPool[0].setCamera(camera);
  }
  return occluderPool[0].mesh;
}

export function setOccluderDebug(on: boolean): void {
  occluderPool[0]?.setDebug(on);
}

export function setOccluderCamera(camera: THREE.PerspectiveCamera): void {
  occluderPool[0]?.setCamera(camera);
}

export function setOcclusionEnabled(enabled: boolean): void {
  for (const occ of occluderPool) {
    occ?.setEnabled(enabled);
  }
}

export function hideOccluder(): void {
  occluderPool[0]?.hide();
}

export function updateOccluder(
  landmarks: NormalizedLandmark[],
  videoW: number,
  videoH: number,
): void {
  occluderPool[0]?.update(landmarks, videoW, videoH);
}

export function disposeOccluder(): void {
  for (let i = 0; i < occluderPool.length; i++) {
    occluderPool[i]?.dispose();
    occluderPool[i] = null;
  }
}

// ---------------------------------------------------------------------------
// Multi-face occluder API
// ---------------------------------------------------------------------------

/**
 * Create (or return existing) occluder for a specific face index.
 * Face 0 uses the backward-compatible slot; faces 1-2 are additional.
 */
export function buildOccluderForFace(
  faceIndex: number,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
): FaceOccluder {
  if (!occluderPool[faceIndex]) {
    occluderPool[faceIndex] = new FaceOccluder(scene, camera);
  } else {
    occluderPool[faceIndex]!.setCamera(camera);
  }
  return occluderPool[faceIndex]!;
}

export function updateOccluderForFace(
  faceIndex: number,
  landmarks: NormalizedLandmark[],
  videoW: number,
  videoH: number,
): void {
  occluderPool[faceIndex]?.update(landmarks, videoW, videoH);
}

export function hideOccluderForFace(faceIndex: number): void {
  occluderPool[faceIndex]?.hide();
}

export function disposeAllOccluders(): void {
  for (let i = 0; i < occluderPool.length; i++) {
    occluderPool[i]?.dispose();
    occluderPool[i] = null;
  }
}
