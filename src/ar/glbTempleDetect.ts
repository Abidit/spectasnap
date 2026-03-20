/**
 * GLB Temple Detection Module
 *
 * Analyzes a loaded GLB model's scene graph to determine if it contains
 * temple (arm) geometry and how best to animate it. Supports three detection
 * strategies: name-based, bone-based, and bounding-box heuristic fallback.
 */

import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Result of temple detection analysis on a GLB model. */
export interface TempleDetectionResult {
  /** Whether the model contains identifiable temple arm geometry. */
  hasTemples: boolean;
  /** The articulation method determined for the temples. */
  method: 'bone' | 'split' | 'none';
  /** Reference to the detected left temple object (name-based or heuristic). */
  leftTemple: THREE.Object3D | null;
  /** Reference to the detected right temple object (name-based or heuristic). */
  rightTemple: THREE.Object3D | null;
  /** Reference to the left temple bone (bone-based detection only). */
  leftBone: THREE.Bone | null;
  /** Reference to the right temple bone (bone-based detection only). */
  rightBone: THREE.Bone | null;
  /** The portion of the model that is NOT temple arms. */
  frontFrame: THREE.Group;
}

/** Configuration hints passed from ModelConfig to guide detection. */
interface TempleDetectConfig {
  hasTemples?: boolean;
  templeMeshNames?: string[];
  templeMethod?: 'bone' | 'split' | 'none';
}

// ---------------------------------------------------------------------------
// Pattern matching helpers
// ---------------------------------------------------------------------------

/** Regex patterns for identifying left temple objects by name. */
const LEFT_TEMPLE_PATTERNS = [
  /temple.*(?:left|_l\b|_L\b)/i,
  /(?:left|_l\b|_L\b).*temple/i,
  /arm.*(?:left|_l\b|_L\b)/i,
  /(?:left|_l\b|_L\b).*arm/i,
];

/** Regex patterns for identifying right temple objects by name. */
const RIGHT_TEMPLE_PATTERNS = [
  /temple.*(?:right|_r\b|_R\b)/i,
  /(?:right|_r\b|_R\b).*temple/i,
  /arm.*(?:right|_r\b|_R\b)/i,
  /(?:right|_r\b|_R\b).*arm/i,
];

/**
 * Test whether an object's name matches any of the given patterns.
 */
function matchesPatterns(name: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(name));
}

// ---------------------------------------------------------------------------
// No-temples result factory
// ---------------------------------------------------------------------------

/**
 * Build a TempleDetectionResult indicating no temples were found.
 * The entire model is placed into `frontFrame`.
 */
function noTemplesResult(model: THREE.Group): TempleDetectionResult {
  return {
    hasTemples: false,
    method: 'none',
    leftTemple: null,
    rightTemple: null,
    leftBone: null,
    rightBone: null,
    frontFrame: model,
  };
}

// ---------------------------------------------------------------------------
// Tier 1 — Config override / explicit mesh names
// ---------------------------------------------------------------------------

/**
 * Attempt detection using explicit mesh names from the config.
 * Returns null if no explicit names are provided.
 */
function detectByExplicitNames(
  model: THREE.Group,
  meshNames: string[],
): TempleDetectionResult | null {
  let leftTemple: THREE.Object3D | null = null;
  let rightTemple: THREE.Object3D | null = null;

  model.traverse((obj) => {
    if (!meshNames.includes(obj.name)) return;

    // Determine left vs right from the explicit name using standard patterns.
    if (matchesPatterns(obj.name, LEFT_TEMPLE_PATTERNS)) {
      leftTemple = obj;
    } else if (matchesPatterns(obj.name, RIGHT_TEMPLE_PATTERNS)) {
      rightTemple = obj;
    } else {
      // If name doesn't indicate side, use X position as fallback.
      const worldPos = new THREE.Vector3();
      obj.getWorldPosition(worldPos);
      if (worldPos.x <= 0) {
        leftTemple = leftTemple ?? obj;
      } else {
        rightTemple = rightTemple ?? obj;
      }
    }
  });

  if (!leftTemple && !rightTemple) return null;

  return {
    hasTemples: true,
    method: 'split',
    leftTemple,
    rightTemple,
    leftBone: null,
    rightBone: null,
    frontFrame: model,
  };
}

// ---------------------------------------------------------------------------
// Tier 2 — Name-based detection
// ---------------------------------------------------------------------------

/**
 * Traverse the model scene graph looking for objects whose names match
 * temple/arm patterns. Returns null if no matches found.
 */
function detectByName(model: THREE.Group): TempleDetectionResult | null {
  let leftTemple: THREE.Object3D | null = null;
  let rightTemple: THREE.Object3D | null = null;

  model.traverse((obj) => {
    if (!leftTemple && matchesPatterns(obj.name, LEFT_TEMPLE_PATTERNS)) {
      leftTemple = obj;
    }
    if (!rightTemple && matchesPatterns(obj.name, RIGHT_TEMPLE_PATTERNS)) {
      rightTemple = obj;
    }
  });

  if (!leftTemple && !rightTemple) return null;

  return {
    hasTemples: true,
    method: 'split',
    leftTemple,
    rightTemple,
    leftBone: null,
    rightBone: null,
    frontFrame: model,
  };
}

// ---------------------------------------------------------------------------
// Tier 3 — Bone-based detection
// ---------------------------------------------------------------------------

/**
 * If the model contains SkinnedMesh instances, search their skeletons
 * for bones matching temple naming patterns. Returns null if no
 * SkinnedMesh or matching bones are found.
 */
function detectByBones(model: THREE.Group): TempleDetectionResult | null {
  let leftBone: THREE.Bone | null = null;
  let rightBone: THREE.Bone | null = null;
  let hasSkinnedMesh = false;

  model.traverse((obj) => {
    if (!(obj instanceof THREE.SkinnedMesh)) return;
    hasSkinnedMesh = true;

    const skeleton = obj.skeleton;
    for (const bone of skeleton.bones) {
      if (!leftBone && matchesPatterns(bone.name, LEFT_TEMPLE_PATTERNS)) {
        leftBone = bone;
      }
      if (!rightBone && matchesPatterns(bone.name, RIGHT_TEMPLE_PATTERNS)) {
        rightBone = bone;
      }
    }
  });

  if (!hasSkinnedMesh || (!leftBone && !rightBone)) return null;

  return {
    hasTemples: true,
    method: 'bone',
    leftTemple: null,
    rightTemple: null,
    leftBone,
    rightBone,
    frontFrame: model,
  };
}

// ---------------------------------------------------------------------------
// Tier 4 — Bounding-box heuristic
// ---------------------------------------------------------------------------

/**
 * Fallback detection using bounding-box geometry analysis.
 * If the model extends significantly in Z (depth > width * 0.5), it likely
 * has temple arms. Meshes whose center-Z is far behind the model's overall
 * center are classified as temples, with left/right assigned by X position.
 */
function detectByBoundingBox(model: THREE.Group): TempleDetectionResult | null {
  const fullBox = new THREE.Box3().setFromObject(model);
  const fullSize = new THREE.Vector3();
  fullBox.getSize(fullSize);
  const fullCenter = new THREE.Vector3();
  fullBox.getCenter(fullCenter);

  // The model must extend significantly in depth relative to width
  // to suggest the presence of temple arms.
  if (fullSize.z <= fullSize.x * 0.5) return null;

  const depthThreshold = fullSize.x * 0.3;
  const templeCandidates: { mesh: THREE.Mesh; centerX: number }[] = [];

  model.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;

    const meshBox = new THREE.Box3().setFromObject(obj);
    const meshCenter = new THREE.Vector3();
    meshBox.getCenter(meshCenter);

    // Meshes whose center-Z is significantly behind the overall center
    // are likely temple arm geometry.
    if (fullCenter.z - meshCenter.z > depthThreshold) {
      templeCandidates.push({ mesh: obj, centerX: meshCenter.x });
    }
  });

  if (templeCandidates.length === 0) return null;

  // Partition candidates into left (negative X) and right (positive X).
  let leftTemple: THREE.Object3D | null = null;
  let rightTemple: THREE.Object3D | null = null;
  let leftMinX = Infinity;
  let rightMaxX = -Infinity;

  for (const candidate of templeCandidates) {
    if (candidate.centerX <= 0) {
      // Negative X = left side; pick the leftmost mesh.
      if (candidate.centerX < leftMinX) {
        leftMinX = candidate.centerX;
        leftTemple = candidate.mesh;
      }
    } else {
      // Positive X = right side; pick the rightmost mesh.
      if (candidate.centerX > rightMaxX) {
        rightMaxX = candidate.centerX;
        rightTemple = candidate.mesh;
      }
    }
  }

  if (!leftTemple && !rightTemple) return null;

  return {
    hasTemples: true,
    method: 'split',
    leftTemple,
    rightTemple,
    leftBone: null,
    rightBone: null,
    frontFrame: model,
  };
}

// ---------------------------------------------------------------------------
// Main export — detectTemples
// ---------------------------------------------------------------------------

/**
 * Analyze a loaded GLB model to determine if it contains temple geometry
 * and how best to animate it.
 *
 * Detection runs through four tiers in order:
 *   1. Config override (explicit method or mesh names)
 *   2. Name-based scene graph traversal
 *   3. Bone-based skeleton analysis
 *   4. Bounding-box geometry heuristic
 *
 * @param model  The root THREE.Group from a loaded GLTF scene.
 * @param config Optional hints from ModelConfig to guide or short-circuit detection.
 * @returns A TempleDetectionResult describing what was found.
 */
export function detectTemples(
  model: THREE.Group,
  config?: TempleDetectConfig,
): TempleDetectionResult {
  // --- Tier 1: Config override ---
  if (config?.templeMethod === 'none') {
    return noTemplesResult(model);
  }

  if (config?.templeMeshNames && config.templeMeshNames.length > 0) {
    const explicitResult = detectByExplicitNames(model, config.templeMeshNames);
    if (explicitResult) return explicitResult;
    // Fall through if the explicit names weren't found in the model.
  }

  // --- Tier 2: Name-based detection ---
  const nameResult = detectByName(model);
  if (nameResult) return nameResult;

  // --- Tier 3: Bone-based detection ---
  const boneResult = detectByBones(model);
  if (boneResult) return boneResult;

  // --- Tier 4: Bounding-box heuristic ---
  const bbResult = detectByBoundingBox(model);
  if (bbResult) return bbResult;

  // --- No temples detected ---
  return noTemplesResult(model);
}

// ---------------------------------------------------------------------------
// splitModelByTemples
// ---------------------------------------------------------------------------

/**
 * Split a model into three groups based on a prior TempleDetectionResult:
 *   - `frontGroup`: Everything that is NOT a temple arm.
 *   - `leftTempleGroup`: The detected left temple object(s).
 *   - `rightTempleGroup`: The detected right temple object(s).
 *
 * Objects are reparented (moved) into the new groups. The original model's
 * hierarchy is modified in-place; callers should not continue to use the
 * original model group directly after calling this function.
 *
 * @param model  The root THREE.Group from a loaded GLTF scene.
 * @param result A TempleDetectionResult from detectTemples().
 * @returns Three groups containing the split geometry.
 */
export function splitModelByTemples(
  model: THREE.Group,
  result: TempleDetectionResult,
): {
  frontGroup: THREE.Group;
  leftTempleGroup: THREE.Group;
  rightTempleGroup: THREE.Group;
} {
  const frontGroup = new THREE.Group();
  frontGroup.name = 'frontFrame';

  const leftTempleGroup = new THREE.Group();
  leftTempleGroup.name = 'leftTemple';

  const rightTempleGroup = new THREE.Group();
  rightTempleGroup.name = 'rightTemple';

  if (!result.hasTemples || result.method === 'none') {
    // No temples detected — everything goes into frontGroup.
    // Clone children array to avoid mutation during iteration.
    const children = [...model.children];
    for (const child of children) {
      frontGroup.add(child);
    }
    return { frontGroup, leftTempleGroup, rightTempleGroup };
  }

  // Collect the set of objects identified as temples so we can
  // efficiently check membership during reparenting.
  const templeObjects = new Set<THREE.Object3D>();
  if (result.leftTemple) templeObjects.add(result.leftTemple);
  if (result.rightTemple) templeObjects.add(result.rightTemple);

  // Move detected temple objects into their respective groups.
  if (result.leftTemple) {
    leftTempleGroup.add(result.leftTemple);
  }
  if (result.rightTemple) {
    rightTempleGroup.add(result.rightTemple);
  }

  // Everything remaining in the model goes into frontGroup.
  // Clone children array to avoid mutation during iteration.
  const remaining = [...model.children];
  for (const child of remaining) {
    frontGroup.add(child);
  }

  return { frontGroup, leftTempleGroup, rightTempleGroup };
}
