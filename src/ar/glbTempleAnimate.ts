/**
 * Per-frame animation for GLB temple arms.
 *
 * Drives temple arm geometry to track the user's ears using MediaPipe face
 * landmarks. Supports two articulation methods:
 *
 *   - **Bone-based** (`animateTempleBones`): The GLB has an armature with
 *     temple bones. We compute a hinge-opening angle from cheek landmarks and
 *     rotate each bone around its local Y-axis.
 *
 *   - **Split-group** (`animateTempleSplit`): The temples are separate
 *     THREE.Object3D groups detached from the front frame. We position each
 *     temple at the front frame's hinge point and orient it toward the ear.
 *
 * Both functions are designed to be called once per rAF frame, after
 * `applyFaceTransform` has positioned the model group.
 */

import * as THREE from 'three';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { FaceTransform } from './pose';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Animation context produced by the detection module (`glbTempleDetect.ts`).
 * Defined here so this file compiles independently of the detector.
 */
export interface TempleAnimationContext {
  method: 'bone' | 'split';
  leftTemple: THREE.Object3D | null;
  rightTemple: THREE.Object3D | null;
  leftBone: THREE.Bone | null;
  rightBone: THREE.Bone | null;
  frontFrame: THREE.Group;
}

// ---------------------------------------------------------------------------
// Landmark indices (MediaPipe 478-point Face Mesh)
// ---------------------------------------------------------------------------

/** Left cheek — approximates left ear / hinge target. */
const LM_LEFT_CHEEK = 234;
/** Right cheek — approximates right ear / hinge target. */
const LM_RIGHT_CHEEK = 454;
/** Left eye outer corner — used for face-width reference. */
const LM_LEFT_EYE_OUTER = 33;
/** Right eye outer corner — used for face-width reference. */
const LM_RIGHT_EYE_OUTER = 263;

// ---------------------------------------------------------------------------
// Bone animation constants
// ---------------------------------------------------------------------------

/** Minimum bone rotation (fully folded temples, in radians). */
const BONE_ANGLE_MIN = 0;
/** Maximum bone rotation (wide splay, ~15 degrees outward). */
const BONE_ANGLE_MAX = (15 * Math.PI) / 180;

/**
 * Rest-width ratio — when the detected cheek-to-cheek distance equals
 * the eye-to-eye distance multiplied by this factor, the bones sit at
 * their neutral open angle (~8 degrees).
 */
const REST_WIDTH_RATIO = 1.65;

/** Neutral bone angle when face width matches rest-width ratio. */
const BONE_NEUTRAL_ANGLE = (8 * Math.PI) / 180;

// ---------------------------------------------------------------------------
// Split animation constants
// ---------------------------------------------------------------------------

/**
 * Blend factor between the pure outward (cheek) direction and backward.
 * 0 = pure outward, 1 = pure backward. 0.7 matches procedural temples.ts.
 */
const BACKWARD_BLEND = 0.7;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Reusable vector temporaries to avoid per-frame allocation. */
const _v0 = new THREE.Vector3();
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _v4 = new THREE.Vector3();
const _v5 = new THREE.Vector3();
const _box = new THREE.Box3();
// const _mat4 = new THREE.Matrix4(); // reserved for future bone animation
const _quat = new THREE.Quaternion();

/**
 * Convert a normalised MediaPipe landmark to world-space coordinates
 * in the Three.js scene.
 *
 * The camera sits at z = 1 looking toward -z. We map the normalised
 * landmark (0..1 range, origin top-left, non-mirrored) into the
 * frustum slice at z = 0 (the model plane), mirroring X so the
 * result matches the mirrored camera feed.
 */
function toWorld(
  lm: NormalizedLandmark,
  camera: THREE.PerspectiveCamera,
): THREE.Vector3 {
  const tanHalfFOV = Math.tan((camera.fov / 2) * (Math.PI / 180));
  const halfH = camera.position.z * tanHalfFOV;
  const halfW = halfH * camera.aspect;

  // Mirror X to match the mirrored selfie-camera canvas transform.
  const nx = (1 - lm.x) * 2 - 1;
  const ny = -(lm.y * 2 - 1);

  return new THREE.Vector3(
    nx * halfW,
    ny * halfH,
    THREE.MathUtils.clamp(-lm.z * halfW * 2, -0.25, 0.25),
  );
}

// ---------------------------------------------------------------------------
// Mode A: Bone-based animation
// ---------------------------------------------------------------------------

/**
 * Animate temple bones by computing a hinge-opening angle derived from
 * the distance between the cheek landmarks relative to the model's rest
 * width.
 *
 * When the detected face is narrower than the rest width the temples fold
 * inward; when it is wider they splay outward, clamped to a physically
 * plausible range (0 -- ~15 degrees).
 *
 * @param ctx        Animation context with bone references.
 * @param landmarks  478-point normalised face landmarks.
 * @param transform  Smoothed FaceTransform (used for IPD reference).
 * @param camera     Scene perspective camera.
 */
export function animateTempleBones(
  ctx: TempleAnimationContext,
  landmarks: NormalizedLandmark[],
  transform: FaceTransform,
  camera: THREE.PerspectiveCamera,
): void {
  if (!ctx.leftBone && !ctx.rightBone) return;
  if (landmarks.length < 468) return;

  // Compute world-space positions for cheeks and eyes.
  const leftCheek = toWorld(landmarks[LM_LEFT_CHEEK], camera);
  const rightCheek = toWorld(landmarks[LM_RIGHT_CHEEK], camera);
  const leftEye = toWorld(landmarks[LM_LEFT_EYE_OUTER], camera);
  const rightEye = toWorld(landmarks[LM_RIGHT_EYE_OUTER], camera);

  // Face width measured between cheeks, eye width measured between outer eyes.
  const cheekDist = leftCheek.distanceTo(rightCheek);
  const eyeDist = leftEye.distanceTo(rightEye);

  // Avoid division by zero for degenerate face geometry.
  if (eyeDist < 0.001) return;

  // The ratio of cheek distance to eye distance indicates how wide
  // the face is relative to the eye span. Compare against the rest ratio
  // to determine how far the temples should open.
  const widthRatio = cheekDist / eyeDist;
  const deviation = widthRatio - REST_WIDTH_RATIO;

  // Map deviation to bone angle: positive deviation = wider face = more splay.
  // Scale factor chosen so a typical +-0.3 deviation covers the full range.
  const rawAngle = BONE_NEUTRAL_ANGLE + deviation * (BONE_ANGLE_MAX / 0.3);
  const angle = THREE.MathUtils.clamp(rawAngle, BONE_ANGLE_MIN, BONE_ANGLE_MAX);

  // Apply rotation to left bone (positive Y-axis rotation = outward on left side).
  if (ctx.leftBone) {
    ctx.leftBone.rotation.y = angle;
  }

  // Apply rotation to right bone (negative Y-axis rotation = outward on right side).
  if (ctx.rightBone) {
    ctx.rightBone.rotation.y = -angle;
  }

  // Factor in yaw: when the head turns, the near-side temple should close
  // slightly and the far-side should open. This prevents visual clipping.
  const yawBias = transform.yaw * 0.15; // subtle correction
  if (ctx.leftBone) {
    ctx.leftBone.rotation.y += yawBias;
  }
  if (ctx.rightBone) {
    ctx.rightBone.rotation.y -= yawBias;
  }
}

// ---------------------------------------------------------------------------
// Mode B: Split-group animation
// ---------------------------------------------------------------------------

/**
 * Animate detached temple groups by positioning them at the front frame's
 * hinge points and orienting them toward the user's ears.
 *
 * The hinge points are derived from the front frame's world-space bounding
 * box (left and right edges). Temple direction blends the outward cheek
 * vector with a backward vector (70% backward), matching the approach
 * used by the procedural temple system.
 *
 * @param frontGroup   The front frame group (already positioned by applyFaceTransform).
 * @param leftTemple   Left temple Object3D to position.
 * @param rightTemple  Right temple Object3D to position.
 * @param landmarks    478-point normalised face landmarks.
 * @param transform    Smoothed FaceTransform.
 * @param camera       Scene perspective camera.
 */
export function animateTempleSplit(
  frontGroup: THREE.Group,
  leftTemple: THREE.Object3D,
  rightTemple: THREE.Object3D,
  landmarks: NormalizedLandmark[],
  transform: FaceTransform,
  camera: THREE.PerspectiveCamera,
): void {
  if (landmarks.length < 468) return;

  // ── 1. Compute hinge positions from front frame bounding box ──────────

  // Update the front group's world matrix so getWorldPosition is accurate.
  frontGroup.updateMatrixWorld(true);

  // Get the front frame's axis-aligned bounding box in local space.
  _box.setFromObject(frontGroup);

  // Front frame world position (centre of model).
  const frontWorldPos = _v0;
  frontGroup.getWorldPosition(frontWorldPos);

  // Front frame world scale — use X component (uniform scale assumed).
  const frontWorldScale = _v1;
  frontGroup.getWorldScale(frontWorldScale);

  // Get the local bounding box extents relative to the front group.
  // We need the left and right edges in world space.
  const boxSize = _v2;
  _box.getSize(boxSize);
  const boxCenter = _v3;
  _box.getCenter(boxCenter);

  // Half-width of the bounding box in world space (already scaled by
  // the front group's world transform since setFromObject uses world coords).
  const halfWidth = boxSize.x / 2;

  // Left hinge: centre of bounding box minus half-width in X.
  const leftHinge = _v4.set(
    boxCenter.x - halfWidth,
    boxCenter.y,
    boxCenter.z,
  );

  // Right hinge: centre of bounding box plus half-width in X.
  const rightHinge = _v5.set(
    boxCenter.x + halfWidth,
    boxCenter.y,
    boxCenter.z,
  );

  // ── 2. Compute temple directions from face geometry ───────────────────

  const leftCheekWorld = toWorld(landmarks[LM_LEFT_CHEEK], camera);
  const rightCheekWorld = toWorld(landmarks[LM_RIGHT_CHEEK], camera);
  const leftEyeWorld = toWorld(landmarks[LM_LEFT_EYE_OUTER], camera);
  const rightEyeWorld = toWorld(landmarks[LM_RIGHT_EYE_OUTER], camera);

  // Face right direction: from left eye toward right eye (normalised).
  const faceRight = new THREE.Vector3()
    .subVectors(rightEyeWorld, leftEyeWorld)
    .normalize();

  // World up vector.
  const worldUp = new THREE.Vector3(0, 1, 0);

  // Backward direction: perpendicular to faceRight and worldUp,
  // pointing away from the camera (into the screen, -Z direction).
  const backward = new THREE.Vector3()
    .crossVectors(worldUp, faceRight)
    .normalize();

  // If the cross product is degenerate, fall back to a simple backward vector.
  if (backward.lengthSq() < 0.001) {
    backward.set(0, 0, -1);
  }

  // Left outward direction: from centre toward left cheek.
  const faceCentre = new THREE.Vector3()
    .addVectors(leftEyeWorld, rightEyeWorld)
    .multiplyScalar(0.5);
  const leftOutDir = new THREE.Vector3()
    .subVectors(leftCheekWorld, faceCentre)
    .normalize();

  // Right outward direction: from centre toward right cheek.
  const rightOutDir = new THREE.Vector3()
    .subVectors(rightCheekWorld, faceCentre)
    .normalize();

  // Blend outward direction with backward (70% backward, 30% outward),
  // matching the approach used in procedural temples.
  const leftBlended = new THREE.Vector3()
    .copy(leftOutDir)
    .addScaledVector(backward, BACKWARD_BLEND)
    .normalize();

  const rightBlended = new THREE.Vector3()
    .copy(rightOutDir)
    .addScaledVector(backward, BACKWARD_BLEND)
    .normalize();

  // ── 3. Position and orient temples ────────────────────────────────────

  positionTemple(leftTemple, leftHinge, leftBlended, frontWorldScale);
  positionTemple(rightTemple, rightHinge, rightBlended, frontWorldScale);
}

/**
 * Position a single temple group at the hinge point, oriented along the
 * given direction vector, and scaled to match the front frame.
 */
function positionTemple(
  temple: THREE.Object3D,
  hingePos: THREE.Vector3,
  direction: THREE.Vector3,
  worldScale: THREE.Vector3,
): void {
  // Place temple at the hinge point.
  temple.position.copy(hingePos);

  // Orient the temple to look along the blended direction.
  // We build a quaternion that rotates the temple's default forward
  // direction (-Z in Three.js convention) to align with `direction`.
  _quat.setFromUnitVectors(
    new THREE.Vector3(0, 0, -1),
    direction,
  );
  temple.quaternion.copy(_quat);

  // Match the front frame's world scale so the temple arm is proportional.
  temple.scale.copy(worldScale);
}
