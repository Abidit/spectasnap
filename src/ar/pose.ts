/**
 * Face-pose extraction from MediaPipe landmarks.
 *
 * Chunk 4/5: position + scale + roll + yaw (head turn) + pitch (head tilt).
 */

import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import KalmanFilter from 'kalmanjs';

// ── Landmark indices (MediaPipe 478-point Face Mesh) ────────────────────────
const LM_LEFT_EYE    = 33;   // outer left eye corner  (camera-left = person's right)
const LM_RIGHT_EYE   = 263;  // outer right eye corner
const LM_NOSE_BRIDGE = 6;    // nose bridge centre (between eyes)
const LM_NOSE_TIP    = 1;    // tip of nose

// ── Calibration constants ────────────────────────────────────────────────────

/** Glasses centre shift above eye midpoint, as a fraction of IPD. */
const Y_OFFSET_FACTOR = 0.30;

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

// ── Kalman filter smoothing (Task 5) ─────────────────────────────────────────

export interface KalmanBank {
  cx: KalmanFilter;
  cy: KalmanFilter;
  ipd: KalmanFilter;
  roll: KalmanFilter;
  yaw: KalmanFilter;
  pitch: KalmanFilter;
}

/**
 * Create a fresh Kalman filter bank — one filter per FaceTransform channel.
 * R = measurement noise (lower = trust sensor more).
 * Q = process noise (higher = follow movement faster).
 */
export function createKalmanBank(): KalmanBank {
  return {
    cx:    new KalmanFilter({ R: 0.008, Q: 2 }),
    cy:    new KalmanFilter({ R: 0.008, Q: 2 }),
    ipd:   new KalmanFilter({ R: 0.005, Q: 1 }),
    pitch: new KalmanFilter({ R: 0.01,  Q: 3 }),
    yaw:   new KalmanFilter({ R: 0.01,  Q: 3 }),
    roll:  new KalmanFilter({ R: 0.006, Q: 2 }),
  };
}

/**
 * Pass a raw FaceTransform through the Kalman bank.
 * Returns a smoothed transform with near-zero jitter.
 */
export function smoothKalman(
  bank: KalmanBank,
  raw: FaceTransform,
): FaceTransform {
  return {
    cx:    bank.cx.filter(raw.cx),
    cy:    bank.cy.filter(raw.cy),
    ipd:   bank.ipd.filter(raw.ipd),
    roll:  bank.roll.filter(raw.roll),
    yaw:   bank.yaw.filter(raw.yaw),
    pitch: bank.pitch.filter(raw.pitch),
  };
}

// ── computeFaceShape ──────────────────────────────────────────────────────────

/**
 * Infers face shape from landmark geometry using normalised landmark coordinates.
 *
 * Uses:
 *  - Face width  : cheek-to-cheek (landmarks 234 → 454)
 *  - Face height : forehead top → chin (landmarks 10 → 152)
 *  - Jaw width   : jaw corners (landmarks 58 → 288)
 *  - Forehead    : forehead side points (landmarks 54 → 284)
 */
export function computeFaceShape(
  landmarks: NormalizedLandmark[],
): 'oval' | 'round' | 'square' | 'heart' | 'oblong' {
  function dist(a: NormalizedLandmark, b: NormalizedLandmark): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  const faceW = dist(landmarks[234], landmarks[454]); // cheek-to-cheek
  const faceH = dist(landmarks[10],  landmarks[152]); // forehead to chin
  const jawW  = dist(landmarks[58],  landmarks[288]); // jaw width
  const foreW = dist(landmarks[54],  landmarks[284]); // forehead width
  const ratio = faceW / (faceH || 0.001);             // width-to-height ratio

  if (foreW > jawW * 1.1)                    return 'heart';   // wider forehead than jaw
  if (ratio < 0.63)                          return 'oblong';  // tall & narrow
  if (ratio > 0.88)                          return 'round';   // wide & full
  if (jawW > faceW * 0.92 && ratio > 0.78)  return 'square';  // strong jaw + wide
  return 'oval';
}
