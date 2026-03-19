/**
 * Landmark-driven temple extension arms.
 *
 * Four thin bars are placed each frame:
 *   leftMain / rightMain  — horizontal portion (72% of temple length)
 *   leftTip  / rightTip   — ear-hook portion  (32% of temple length), angled ~26° downward
 *
 * Hinge positions can be supplied explicitly (from the model bounding box) or
 * fall back to a landmark-lerp approximation when the model is not yet loaded.
 *
 * Tuning knobs (exported constants):
 *   TEMPLE_HINGE_BLEND  — 0 = eye line, 1 = cheek landmark (fallback only; default 0.65)
 *   TEMPLE_LEN_FACTOR   — temple length as fraction of face width (default 0.55)
 */

import * as THREE from 'three';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

// ── Tunable constants ────────────────────────────────────────────────────────
/** How far toward the cheek landmark the hinge sits (0 = eye-line, 1 = cheek). */
export let TEMPLE_HINGE_BLEND = 0.65;
/** Temple length = faceWidth * this factor. */
export let TEMPLE_LEN_FACTOR  = 0.55;

export function setTempleHingeBlend(v: number) { TEMPLE_HINGE_BLEND = v; }
export function setTempleLenFactor(v: number)  { TEMPLE_LEN_FACTOR  = v; }

// LM indices
const LM_L_EYE_OUTER  = 33;
const LM_R_EYE_OUTER  = 263;
const LM_L_CHEEK      = 234;
const LM_R_CHEEK      = 454;

// Temple bar cross-section (world units)
const BAR_W = 0.006;
const BAR_H = 0.004;

// 2-segment proportions
const MAIN_FRAC = 0.72;   // main (horizontal) bar = 72% of total temple length
const TIP_FRAC  = 0.32;   // tip (ear-hook) bar   = 32% of total temple length
const TIP_ANGLE = 0.45;   // ~26° downward tilt on the tip (radians)

// module state
let leftMain:  THREE.Mesh | null = null;
let leftTip:   THREE.Mesh | null = null;
let rightMain: THREE.Mesh | null = null;
let rightTip:  THREE.Mesh | null = null;
let templeMat: THREE.MeshStandardMaterial | null = null;
let debugMat:  THREE.MeshStandardMaterial | null = null;
let debugMode = false;

// ── buildTempleMeshes ─────────────────────────────────────────────────────────

export function buildTempleMeshes(
  scene: THREE.Scene,
  frameColor: string | number = 0x333333,
): void {
  if (leftMain) return; // already built

  const color = new THREE.Color(frameColor);

  templeMat = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.3,
    roughness: 0.5,
  });
  debugMat = new THREE.MeshStandardMaterial({
    color: 0xff6600,
    metalness: 0,
    roughness: 0.5,
  });

  const geo = new THREE.BoxGeometry(1, BAR_H, BAR_W); // length=1 scaled per-frame

  leftMain  = new THREE.Mesh(geo, debugMode ? debugMat : templeMat);
  leftTip   = new THREE.Mesh(geo, debugMode ? debugMat : templeMat);
  rightMain = new THREE.Mesh(geo, debugMode ? debugMat : templeMat);
  rightTip  = new THREE.Mesh(geo, debugMode ? debugMat : templeMat);

  for (const bar of [leftMain, leftTip, rightMain, rightTip]) {
    bar.renderOrder = 1;
    bar.visible = false;
    bar.frustumCulled = false;
    scene.add(bar);
  }
}

// ── updateTempleColor ─────────────────────────────────────────────────────────

export function updateTempleColor(frameColor: string | number): void {
  if (!templeMat) return;
  templeMat.color.set(frameColor);
}

// ── setTempleDebug ────────────────────────────────────────────────────────────

export function setTempleDebug(on: boolean): void {
  debugMode = on;
  if (!leftMain || !leftTip || !rightMain || !rightTip || !templeMat || !debugMat) return;
  const mat = on ? debugMat : templeMat;
  leftMain.material  = mat;
  leftTip.material   = mat;
  rightMain.material = mat;
  rightTip.material  = mat;
}

// ── updateTemples ─────────────────────────────────────────────────────────────

const _xAxis    = new THREE.Vector3(1, 0, 0);
const _worldDown = new THREE.Vector3(0, -1, 0);

export function updateTemples(
  landmarks: NormalizedLandmark[],
  videoW: number,
  videoH: number,
  camera: THREE.PerspectiveCamera,
  hingeL?: THREE.Vector3 | null,
  hingeR?: THREE.Vector3 | null,
): void {
  if (!leftMain || !leftTip || !rightMain || !rightTip || landmarks.length < 468) {
    hideTemples();
    return;
  }

  // ── world-space helpers ───────────────────────────────────────────────────
  const tanHalfFOV = Math.tan((camera.fov / 2) * (Math.PI / 180));
  const halfH = camera.position.z * tanHalfFOV;
  const halfW = halfH * camera.aspect;

  function toWorld(lm: NormalizedLandmark): THREE.Vector3 {
    const nx = (1 - lm.x) * 2 - 1;
    const ny = -(lm.y * 2 - 1);
    return new THREE.Vector3(
      nx * halfW,
      ny * halfH,
      THREE.MathUtils.clamp(-lm.z * halfW * 2, -0.25, 0.25),
    );
  }

  const lEye   = toWorld(landmarks[LM_L_EYE_OUTER]);
  const rEye   = toWorld(landmarks[LM_R_EYE_OUTER]);
  const lCheek = toWorld(landmarks[LM_L_CHEEK]);
  const rCheek = toWorld(landmarks[LM_R_CHEEK]);

  // ── hinge points ─────────────────────────────────────────────────────────
  // Use supplied hinge positions if available; fall back to landmark lerp.
  const computedHingeL = hingeL ?? lEye.clone().lerp(lCheek, TEMPLE_HINGE_BLEND);
  const computedHingeR = hingeR ?? rEye.clone().lerp(rCheek, TEMPLE_HINGE_BLEND);

  // ── temple length ─────────────────────────────────────────────────────────
  const faceWidth = lCheek.distanceTo(rCheek);
  const templeLen = faceWidth * TEMPLE_LEN_FACTOR;

  // ── derive temple directions from face geometry ───────────────────────────
  const faceLeft  = new THREE.Vector3().subVectors(lCheek, rCheek).normalize();
  const faceRight = faceLeft.clone().negate();

  const worldUp  = new THREE.Vector3(0, 1, 0);
  const backward = new THREE.Vector3().crossVectors(worldUp, faceRight).normalize();

  const BACKWARD_BLEND = 0.7;
  const leftDir  = faceLeft.clone()
    .add(backward.clone().multiplyScalar(BACKWARD_BLEND))
    .normalize();
  const rightDir = faceRight.clone()
    .add(backward.clone().multiplyScalar(BACKWARD_BLEND))
    .normalize();

  // ── tip directions (blend outward + downward for ear hook) ───────────────
  const leftTipDir = leftDir.clone()
    .multiplyScalar(Math.cos(TIP_ANGLE))
    .add(_worldDown.clone().multiplyScalar(Math.sin(TIP_ANGLE)))
    .normalize();
  const rightTipDir = rightDir.clone()
    .multiplyScalar(Math.cos(TIP_ANGLE))
    .add(_worldDown.clone().multiplyScalar(Math.sin(TIP_ANGLE)))
    .normalize();

  // ── placeBar: position + scale + rotate a bar mesh ───────────────────────
  function placeBar(
    bar: THREE.Mesh,
    start: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
  ): void {
    bar.position.copy(start).addScaledVector(dir, len * 0.5);
    bar.scale.set(len, 1, 1);
    bar.quaternion.setFromUnitVectors(_xAxis, dir);
    bar.visible = true;
  }

  // ── left side ─────────────────────────────────────────────────────────────
  const leftMainEnd = computedHingeL.clone().addScaledVector(leftDir, templeLen * MAIN_FRAC);
  placeBar(leftMain, computedHingeL, leftDir,    templeLen * MAIN_FRAC);
  placeBar(leftTip,  leftMainEnd,    leftTipDir, templeLen * TIP_FRAC);

  // ── right side ────────────────────────────────────────────────────────────
  const rightMainEnd = computedHingeR.clone().addScaledVector(rightDir, templeLen * MAIN_FRAC);
  placeBar(rightMain, computedHingeR, rightDir,    templeLen * MAIN_FRAC);
  placeBar(rightTip,  rightMainEnd,   rightTipDir, templeLen * TIP_FRAC);
}

// ── hideTemples ───────────────────────────────────────────────────────────────

export function hideTemples(): void {
  if (leftMain)  leftMain.visible  = false;
  if (leftTip)   leftTip.visible   = false;
  if (rightMain) rightMain.visible = false;
  if (rightTip)  rightTip.visible  = false;
}

// ── disposeTemples ────────────────────────────────────────────────────────────

export function disposeTemples(): void {
  [leftMain, leftTip, rightMain, rightTip].forEach((bar) => {
    if (!bar) return;
    bar.parent?.remove(bar);
    bar.geometry.dispose();
  });
  templeMat?.dispose();
  debugMat?.dispose();
  leftMain = leftTip = rightMain = rightTip = templeMat = debugMat = null;
}
