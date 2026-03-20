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

let occluderMesh: THREE.Mesh | null = null;
let occluderGeometry: THREE.BufferGeometry | null = null;
let positionAttr: THREE.BufferAttribute | null = null;
let occluderCamera: THREE.PerspectiveCamera | null = null;
let occlusionEnabled = true;
let debugOcclusion = false;

let solidMat: THREE.MeshBasicMaterial | null = null;
let debugOccMat: THREE.MeshBasicMaterial | null = null;

export function buildOccluderMesh(
  scene: THREE.Scene,
  camera?: THREE.PerspectiveCamera,
): THREE.Mesh {
  if (occluderMesh) {
    if (camera) occluderCamera = camera;
    return occluderMesh;
  }

  // Allocate enough for 478 face verts + 6 side anchors.
  const TOTAL_VERTS = FACE_VERTEX_COUNT + SIDE_LM.length;
  const positions = new Float32Array(TOTAL_VERTS * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Combine base triangulation with side-face extension triangles.
  const allIndices = [...TRIANGULATION, ...SIDE_TRIANGLES];
  geometry.setIndex(allIndices);

  solidMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    colorWrite: false,
    depthWrite: true,
    depthTest: true,
    side: THREE.FrontSide,
  });

  debugOccMat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    colorWrite: true,
    depthWrite: true,
    depthTest: true,
    transparent: true,
    opacity: 0.35,
    side: THREE.FrontSide,
    wireframe: false,
  });

  const mesh = new THREE.Mesh(geometry, solidMat);
  mesh.renderOrder = 0;
  mesh.visible = false;
  mesh.frustumCulled = false;
  mesh.scale.setScalar(1.01); // Slight enlargement for face coverage — 1.01 avoids nose-bridge clipping lenses

  scene.add(mesh);

  occluderMesh = mesh;
  occluderGeometry = geometry;
  positionAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
  if (camera) occluderCamera = camera;

  return mesh;
}

export function setOccluderDebug(on: boolean): void {
  debugOcclusion = on;
  if (!occluderMesh || !solidMat || !debugOccMat) return;
  occluderMesh.material = on ? debugOccMat : solidMat;
}

export function setOccluderCamera(camera: THREE.PerspectiveCamera): void {
  occluderCamera = camera;
}

export function setOcclusionEnabled(enabled: boolean): void {
  occlusionEnabled = enabled;
  if (!enabled && occluderMesh) occluderMesh.visible = false;
}

export function hideOccluder(): void {
  if (occluderMesh) occluderMesh.visible = false;
}

export function updateOccluder(
  landmarks: NormalizedLandmark[],
  videoW: number,
  videoH: number,
): void {
  if (!occlusionEnabled || !occluderMesh || !occluderGeometry || !positionAttr || !occluderCamera) {
    if (occluderMesh) occluderMesh.visible = false;
    return;
  }

  if (landmarks.length < 468 || videoW <= 0 || videoH <= 0) {
    occluderMesh.visible = false;
    return;
  }

  const tanHalfFOV = Math.tan((occluderCamera.fov / 2) * (Math.PI / 180));
  const halfH = occluderCamera.position.z * tanHalfFOV;
  const halfW = halfH * occluderCamera.aspect;
  const depthScale = halfW * 2;

  const count = Math.min(landmarks.length, FACE_VERTEX_COUNT);
  for (let i = 0; i < count; i++) {
    const lm = landmarks[i];
    const offset = i * 3;

    // Mirror X to match the camera canvas transform in ARCamera.
    const ndcX = (1 - lm.x) * 2 - 1;
    const ndcY = -(lm.y * 2 - 1);

    positionAttr.array[offset]     = ndcX * halfW;
    positionAttr.array[offset + 1] = ndcY * halfH;
    positionAttr.array[offset + 2] = THREE.MathUtils.clamp(-lm.z * depthScale, -0.25, 0.25);
  }

  // Zero any trailing face vertices (iris region 468-477 if landmarks < 478).
  for (let i = count; i < FACE_VERTEX_COUNT; i++) {
    const offset = i * 3;
    positionAttr.array[offset] = 0;
    positionAttr.array[offset + 1] = 0;
    positionAttr.array[offset + 2] = 0;
  }

  // ── Side-face anchor vertices (beyond FACE_VERTEX_COUNT) ──────────────────
  // Push them slightly forward (toward camera) so they reliably occlude temples.
  for (let s = 0; s < SIDE_LM.length; s++) {
    const srcIdx = SIDE_LM[s];
    const dstBase = (FACE_VERTEX_COUNT + s) * 3;
    positionAttr.array[dstBase]     = positionAttr.array[srcIdx * 3];
    positionAttr.array[dstBase + 1] = positionAttr.array[srcIdx * 3 + 1];
    // Slightly in front of face surface to ensure occlusion.
    positionAttr.array[dstBase + 2] = positionAttr.array[srcIdx * 3 + 2] + 0.012;
  }

  positionAttr.needsUpdate = true;
  occluderMesh.visible = true;
}

export function disposeOccluder(): void {
  if (occluderMesh) {
    occluderMesh.parent?.remove(occluderMesh);
    const material = occluderMesh.material;
    if (Array.isArray(material)) {
      material.forEach((mat) => mat.dispose());
    } else {
      material.dispose();
    }
  }
  occluderGeometry?.dispose();
  solidMat?.dispose();
  debugOccMat?.dispose();

  occluderMesh = null;
  occluderGeometry = null;
  positionAttr = null;
  occluderCamera = null;
  solidMat = null;
  debugOccMat = null;
}
