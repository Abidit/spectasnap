/**
 * Iris-based Pupillary Distance (PD) measurement engine.
 *
 * Uses MediaPipe's 478-point face mesh iris landmarks to compute the
 * interpupillary distance in millimeters. The measurement is calibrated
 * against the medical standard human iris diameter of 11.7 mm.
 *
 * Iris landmark indices (MediaPipe 478-point model):
 *   Left iris:  468 (centre), 469-472 (cardinal N/E/S/W)
 *   Right iris: 473 (centre), 474-477 (cardinal N/E/S/W)
 */

import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import KalmanFilter from 'kalmanjs';

// ── Constants ────────────────────────────────────────────────────────────────

/** Medical standard human iris horizontal diameter in millimeters. */
const IRIS_DIAMETER_MM = 11.7;

/** Iris landmark indices (MediaPipe 478-point face mesh). */
const LM_LEFT_IRIS_CENTER = 468;
const LM_LEFT_IRIS_RIGHT = 469;  // camera-right cardinal point (horizontal)
const LM_LEFT_IRIS_LEFT = 471;   // camera-left cardinal point (horizontal)

const LM_RIGHT_IRIS_CENTER = 473;
const LM_RIGHT_IRIS_RIGHT = 474; // camera-right cardinal point (horizontal)
const LM_RIGHT_IRIS_LEFT = 476;  // camera-left cardinal point (horizontal)

/** Minimum number of frames before a measurement can be marked stable. */
const STABILITY_WINDOW = 30;

/** Standard deviation threshold in mm for marking a measurement as stable. */
const STABILITY_THRESHOLD_MM = 0.3;

// ── Types ────────────────────────────────────────────────────────────────────

export interface PDMeasurement {
  /** Pupillary distance in millimeters. */
  pdMm: number;
  /** Confidence score 0-1 (based on measurement stability over frames). */
  confidence: number;
  /** True when standard deviation < 0.3 mm over the last 30 frames. */
  stable: boolean;
}

export interface PDMeasurer {
  /** Feed a new frame of landmarks and receive the current PD measurement. */
  update(landmarks: NormalizedLandmark[], canvasW: number, canvasH: number): PDMeasurement;
  /** Reset all internal state (e.g. when restarting measurement). */
  reset(): void;
}

// ── Factory ──────────────────────────────────────────────────────────────────

/**
 * Create a new PD measurer instance.
 *
 * Each call returns an independent measurer with its own Kalman filter
 * and rolling statistics window.
 */
export function createPDMeasurer(): PDMeasurer {
  // Kalman filter for smoothing the raw PD value.
  // R = measurement noise (lower = trust sensor more).
  // Q = process noise (higher = follow movement faster).
  let kalman = new KalmanFilter({ R: 0.02, Q: 0.5 });

  // Rolling window of recent smoothed PD values for stability analysis.
  let history: number[] = [];

  return {
    update(
      landmarks: NormalizedLandmark[],
      canvasW: number,
      canvasH: number,
    ): PDMeasurement {
      // ── 1. Extract iris centres (mirrored X, same as pose.ts line 84) ──
      const lcRaw = landmarks[LM_LEFT_IRIS_CENTER];
      const rcRaw = landmarks[LM_RIGHT_IRIS_CENTER];

      const lcX = (1 - lcRaw.x) * canvasW;
      const lcY = lcRaw.y * canvasH;
      const rcX = (1 - rcRaw.x) * canvasW;
      const rcY = rcRaw.y * canvasH;

      // Distance between iris centres in pixels.
      const irisDistancePx = Math.hypot(rcX - lcX, rcY - lcY);

      // ── 2. Compute iris diameter in pixels (average of both eyes) ──────
      // Left iris horizontal span
      const llRaw = landmarks[LM_LEFT_IRIS_LEFT];
      const lrRaw = landmarks[LM_LEFT_IRIS_RIGHT];
      const leftIrisWidthPx = Math.hypot(
        (1 - lrRaw.x) * canvasW - (1 - llRaw.x) * canvasW,
        lrRaw.y * canvasH - llRaw.y * canvasH,
      );

      // Right iris horizontal span
      const rlRaw = landmarks[LM_RIGHT_IRIS_LEFT];
      const rrRaw = landmarks[LM_RIGHT_IRIS_RIGHT];
      const rightIrisWidthPx = Math.hypot(
        (1 - rrRaw.x) * canvasW - (1 - rlRaw.x) * canvasW,
        rrRaw.y * canvasH - rlRaw.y * canvasH,
      );

      // Average iris width in pixels (more robust than using a single eye).
      const avgIrisWidthPx = (leftIrisWidthPx + rightIrisWidthPx) / 2;

      // ── 3. Convert pixel distance to millimeters ───────────────────────
      // pdMm = (distance between iris centres in px / iris width in px) * 11.7mm
      const rawPdMm = avgIrisWidthPx > 0
        ? (irisDistancePx / avgIrisWidthPx) * IRIS_DIAMETER_MM
        : 0;

      // ── 4. Kalman smoothing ────────────────────────────────────────────
      const smoothedPdMm = kalman.filter(rawPdMm);

      // ── 5. Rolling window for stability analysis ───────────────────────
      history.push(smoothedPdMm);
      if (history.length > STABILITY_WINDOW) {
        history = history.slice(-STABILITY_WINDOW);
      }

      // ── 6. Compute standard deviation and stability ────────────────────
      const sigma = computeStdDev(history);
      const stable = history.length >= STABILITY_WINDOW && sigma < STABILITY_THRESHOLD_MM;
      const confidence = 1 - Math.min(1, sigma / 1.0);

      return {
        pdMm: Math.round(smoothedPdMm * 10) / 10, // round to 0.1 mm
        confidence: Math.round(confidence * 100) / 100,
        stable,
      };
    },

    reset() {
      kalman = new KalmanFilter({ R: 0.02, Q: 0.5 });
      history = [];
    },
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Compute the standard deviation of an array of numbers. */
function computeStdDev(values: number[]): number {
  if (values.length < 2) return Infinity;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}
