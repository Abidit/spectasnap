import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

/**
 * Detect if the user is currently wearing glasses.
 *
 * Uses z-depth analysis: glasses push eye landmarks forward relative to
 * the nose bridge and cheeks. When the z-depth difference between eye
 * contour landmarks and the nose bridge exceeds a threshold, glasses
 * are likely present.
 *
 * MediaPipe landmarks used:
 * - 6: nose tip
 * - 33: left eye outer corner
 * - 263: right eye outer corner
 * - 159: left eye upper
 * - 386: right eye upper
 */

const THRESHOLD = 0.012; // z-depth difference threshold
const HISTORY_SIZE = 15;

export class GlassesDetector {
  private history: boolean[] = [];

  /**
   * Returns true if glasses are detected with confidence.
   * Uses a rolling majority vote over HISTORY_SIZE frames.
   */
  detect(landmarks: NormalizedLandmark[]): boolean {
    const noseBridge = landmarks[6];
    const leftEyeOuter = landmarks[33];
    const rightEyeOuter = landmarks[263];
    const leftEyeUpper = landmarks[159];
    const rightEyeUpper = landmarks[386];

    if (!noseBridge || !leftEyeOuter || !rightEyeOuter || !leftEyeUpper || !rightEyeUpper) {
      return false;
    }

    // Average z-depth of eye landmarks
    const eyeZ = (leftEyeOuter.z + rightEyeOuter.z + leftEyeUpper.z + rightEyeUpper.z) / 4;
    const noseZ = noseBridge.z;

    // Glasses push eye landmarks forward (more negative z)
    const detected = (noseZ - eyeZ) > THRESHOLD;

    this.history.push(detected);
    if (this.history.length > HISTORY_SIZE) this.history.shift();

    // Majority vote
    const positiveCount = this.history.filter(v => v).length;
    return positiveCount > this.history.length / 2;
  }

  reset(): void {
    this.history = [];
  }
}

export function createGlassesDetector(): GlassesDetector {
  return new GlassesDetector();
}
