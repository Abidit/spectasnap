import * as THREE from 'three';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { TRIANGULATION } from './triangulation';

const FACE_VERTEX_COUNT = 478;

let occluderMesh: THREE.Mesh | null = null;
let occluderGeometry: THREE.BufferGeometry | null = null;
let positionAttr: THREE.BufferAttribute | null = null;
let occluderCamera: THREE.PerspectiveCamera | null = null;
let occlusionEnabled = true;

export function buildOccluderMesh(
  scene: THREE.Scene,
  camera?: THREE.PerspectiveCamera,
): THREE.Mesh {
  if (occluderMesh) {
    if (camera) occluderCamera = camera;
    return occluderMesh;
  }

  const positions = new Float32Array(FACE_VERTEX_COUNT * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(TRIANGULATION);

  const material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    colorWrite: false,
    depthWrite: true,
    depthTest: true,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 0;
  mesh.visible = false;
  mesh.frustumCulled = false;

  scene.add(mesh);

  occluderMesh = mesh;
  occluderGeometry = geometry;
  positionAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
  if (camera) occluderCamera = camera;

  return mesh;
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

    positionAttr.array[offset] = ndcX * halfW;
    positionAttr.array[offset + 1] = ndcY * halfH;
    positionAttr.array[offset + 2] = THREE.MathUtils.clamp(-lm.z * depthScale, -0.25, 0.25);
  }

  // Zero any trailing vertices if only 468 landmarks are provided.
  for (let i = count; i < FACE_VERTEX_COUNT; i++) {
    const offset = i * 3;
    positionAttr.array[offset] = 0;
    positionAttr.array[offset + 1] = 0;
    positionAttr.array[offset + 2] = 0;
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

  occluderMesh = null;
  occluderGeometry = null;
  positionAttr = null;
  occluderCamera = null;
}
