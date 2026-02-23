/**
 * Face-pose extraction from MediaPipe landmarks.
 *
 * Chunk 4/5: position + scale + roll + yaw (head turn) + pitch (head tilt).
 */

import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

// ── Landmark indices (MediaPipe 478-point Face Mesh) ────────────────────────
const LM_LEFT_EYE    = 33;   // outer left eye corner  (camera-left = person's right)
const LM_RIGHT_EYE   = 263;  // outer right eye corner
const LM_NOSE_BRIDGE = 6;    // nose bridge centre (between eyes)
const LM_NOSE_TIP    = 1;    // tip of nose

// ── Calibration constants ────────────────────────────────────────────────────

/** Glasses centre shift above eye midpoint, as a fraction of IPD. */
const Y_OFFSET_FACTOR = 0.20;

/**
 * Yaw: z-depth asymmetry of the outer eye corners → radians.
 *
 * When the person turns right in the mirrored display, camera-left eye (33)
 * comes closer (z↓) and camera-right eye (263) recedes (z↑).
 * rawYaw = (lp.z − rp.z) × YAW_Z_SCALE → negative = turning right.
 * Three.js rotation.y is applied directly (negative = model turns right for
 * a front-facing model).
 */
const YAW_Z_SCALE = 3.5;

/**
 * Pitch: z-depth of nose tip vs nose bridge → radians.
 *
 * At a frontal pose the nose tip is ~0.065 normalised units closer to the
 * camera than the nose bridge. Subtracting PITCH_NEUTRAL_OFFSET centres pitch
 * at 0. Looking up → nose tip recedes (z↑) → positive deviation → negative
 * Three.js rotation.x (tilts model up). Looking down → opposite.
 */
const PITCH_Z_SCALE          = 3.5;
const PITCH_NEUTRAL_OFFSET   = -0.065;

/** Clamp limits to avoid wild extrapolation at extreme head angles. */
const YAW_MAX   = 0.60; // ≈ 34°
const PITCH_MAX = 0.40; // ≈ 23°

// ── Types ────────────────────────────────────────────────────────────────────

export interface FaceTransform {
  /** Glasses centre X in canvas pixels (mirrored-video space). */
  cx: number;
  /** Glasses centre Y in canvas pixels (mirrored-video space). */
  cy: number;
  /** Interpupillary distance in canvas pixels. */
  ipd: number;
  /** Z-rotation in radians (screen-space roll, right-hand rule). */
  roll: number;
  /** Y-axis rotation in radians — head turn left/right. */
  yaw: number;
  /** X-axis rotation in radians — head tilt up/down. */
  pitch: number;
}

// ── computeTransform ─────────────────────────────────────────────────────────

/**
 * Derive position, IPD, roll, yaw, and pitch from raw landmarks.
 *
 * @param landmarks  Normalised landmarks from FaceLandmarker.detectForVideo
 * @param canvasW    Width of the 2-D canvas (equals video.videoWidth)
 * @param canvasH    Height of the 2-D canvas (equals video.videoHeight)
 */
export function computeTransform(
  landmarks: NormalizedLandmark[],
  canvasW: number,
  canvasH: number,
): FaceTransform {
  const lp = landmarks[LM_LEFT_EYE];
  const rp = landmarks[LM_RIGHT_EYE];
  const nb = landmarks[LM_NOSE_BRIDGE];
  const nt = landmarks[LM_NOSE_TIP];

  // Mirror X — the 2-D canvas is drawn with ctx.scale(-1,1).
  const lx = (1 - lp.x) * canvasW;
  const ly = lp.y * canvasH;
  const rx = (1 - rp.x) * canvasW;
  const ry = rp.y * canvasH;

  let dx = rx - lx;
  let dy = ry - ly;
  // In mirrored space the eye order can invert; force a stable left->right
  // vector so roll doesn't jump by PI (180 deg).
  if (dx < 0) {
    dx = -dx;
    dy = -dy;
  }
  const ipd = Math.hypot(dx, dy);
  const roll = Math.atan2(dy, dx);

  // Midpoint of the two eye corners.
  const midX = (lx + rx) / 2;
  const midY = (ly + ry) / 2;

  // Shift glasses centre perpendicularly above the eye line.
  const cx = midX + Math.sin(roll) * ipd * Y_OFFSET_FACTOR;
  const cy = midY - Math.cos(roll) * ipd * Y_OFFSET_FACTOR;

  // ── Yaw (z-based) ──────────────────────────────────────────────────────────
  // z is not affected by the x-axis mirror transform.
  const rawYaw = (lp.z - rp.z) * YAW_Z_SCALE;
  const yaw = Math.max(-YAW_MAX, Math.min(YAW_MAX, rawYaw));

  // ── Pitch (z-based with neutral offset) ────────────────────────────────────
  const rawPitch = ((nt.z - nb.z) - PITCH_NEUTRAL_OFFSET) * PITCH_Z_SCALE;
  const pitch = Math.max(-PITCH_MAX, Math.min(PITCH_MAX, rawPitch));

  return { cx, cy, ipd, roll, yaw, pitch };
}

// ── smooth ───────────────────────────────────────────────────────────────────

/**
 * Linear interpolation between two transforms with independent alphas for
 * position/scale and rotation axes.
 *
 * @param prev      Last smoothed transform (seed with `next` on first frame)
 * @param next      Raw transform from computeTransform
 * @param posAlpha  Blend weight for cx, cy, ipd  (recommended: 0.18)
 * @param rotAlpha  Blend weight for roll, yaw, pitch (recommended: 0.12;
 *                  defaults to posAlpha if omitted)
 */
export function smooth(
  prev: FaceTransform,
  next: FaceTransform,
  posAlpha: number,
  rotAlpha = posAlpha,
): FaceTransform {
  return {
    cx:    prev.cx    + (next.cx    - prev.cx)    * posAlpha,
    cy:    prev.cy    + (next.cy    - prev.cy)    * posAlpha,
    ipd:   prev.ipd   + (next.ipd   - prev.ipd)   * posAlpha,
    roll:  prev.roll  + (next.roll  - prev.roll)  * rotAlpha,
    yaw:   prev.yaw   + (next.yaw   - prev.yaw)   * rotAlpha,
    pitch: prev.pitch + (next.pitch - prev.pitch) * rotAlpha,
  };
}
