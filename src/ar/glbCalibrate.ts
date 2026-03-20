/**
 * Auto-calibration utility for uploaded GLB glasses models.
 *
 * Computes scale, Y offset, and Z offset so that any arbitrary GLB model
 * fits within the standard glasses dimensions used by the procedural system
 * (~0.14 world units wide).
 */

import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GLBCalibration {
  /** Scale so the model fits within standard glasses dimensions (~0.14 world units wide). */
  scale: number;
  /** Y offset to align with eye line. */
  yOffset: number;
  /** Z offset to sit on face. */
  zOffset: number;
  /** Bounding box dimensions for reference. */
  boundingBox: { width: number; height: number; depth: number };
}

// ---------------------------------------------------------------------------
// calibrateGLB
// ---------------------------------------------------------------------------

/**
 * Standard procedural glasses width in world units.
 * All 55 built-in frames span roughly this width when rendered, so uploaded
 * GLB models are normalised to match.
 */
const TARGET_WIDTH = 0.14;

/**
 * Compute calibration values from a loaded GLTF scene.
 *
 * Uses the model's axis-aligned bounding box to:
 *   1. Normalise scale so the widest dimension maps to TARGET_WIDTH.
 *   2. Compute Y and Z offsets that re-centre the model at the origin,
 *      accounting for authoring-tool coordinate differences.
 *
 * The returned values are intended to be applied *before* the per-frame
 * face-transform positioning in `applyFaceTransform`.
 */
export function calibrateGLB(scene: THREE.Group): GLBCalibration {
  const box = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  // Guard against degenerate (empty or zero-width) bounding boxes.
  const width = Math.max(size.x, 0.001);
  const scale = TARGET_WIDTH / width;

  return {
    scale,
    // Shift the model so its bounding-box centre lands at the origin after scaling.
    yOffset: -center.y * scale,
    zOffset: -center.z * scale,
    boundingBox: {
      width: size.x,
      height: size.y,
      depth: size.z,
    },
  };
}
