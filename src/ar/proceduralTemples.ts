/**
 * Procedural 3D temple arm generator.
 *
 * Builds realistic temple arms from a CatmullRomCurve3 path with a tapering
 * rectangular cross-section. Material is chosen based on the preset's frame
 * family (metal vs acetate). Each mesh is tagged with `userData.role = 'temple'`
 * so callers can identify and manipulate them uniformly.
 *
 * Exports:
 *   createTempleArm(preset, side)   - single arm for the given side
 *   createTemplePair(preset)        - { left, right } convenience wrapper
 */

import * as THREE from 'three';
import type { ProceduralPreset } from './presets';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of sample points along the CatmullRom curve. */
const CURVE_SAMPLES = 18;

/** Number of vertices per cross-section ring (rectangular with rounded corners). */
const RING_VERTS = 8;

// Cross-section dimensions at the hinge end (wider/thicker).
const HINGE_WIDTH = 0.008;
const HINGE_HEIGHT = 0.005;

// Cross-section dimensions at the tip end (narrower/thinner).
const TIP_WIDTH = 0.003;
const TIP_HEIGHT = 0.003;

// Hinge barrel dimensions.
const BARREL_RADIUS = 0.002;
const BARREL_HEIGHT = 0.003;
const BARREL_SEGMENTS = 8;

// ---------------------------------------------------------------------------
// Material factories
// ---------------------------------------------------------------------------

/** Metal families use highly reflective MeshPhysicalMaterial. */
const METAL_FAMILIES: ReadonlySet<string> = new Set(['aviator', 'sport-wrap']);

/**
 * Create the appropriate temple material based on the preset's frame family.
 *
 * Metal families (aviator, sport-wrap) get a polished metallic look.
 * Acetate families (round, rectangle, cat-eye) get a glossy clearcoat plastic.
 */
function createTempleMaterial(preset: ProceduralPreset): THREE.MeshPhysicalMaterial {
  const color = new THREE.Color(preset.frameColor);

  if (METAL_FAMILIES.has(preset.family)) {
    return new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.95,
      roughness: 0.15,
      reflectivity: 1.0,
      envMapIntensity: 1.4,
    });
  }

  // Acetate / plastic
  return new THREE.MeshPhysicalMaterial({
    color,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    roughness: 0.35,
    metalness: 0.05,
    envMapIntensity: 0.8,
  });
}

// ---------------------------------------------------------------------------
// Curve construction
// ---------------------------------------------------------------------------

/**
 * Build the 5-point CatmullRom spine for a temple arm on the given side.
 *
 * Control points (for 'left' side, +X outward, -Z backward from face):
 *   0. Hinge        (0, 0, 0)
 *   1. Straight run  at ~40% length — extends backward (-Z)
 *   2. Slight droop  at ~70% length — small Y decrease begins
 *   3. Ear curve     at ~95% length — bends downward toward the ear
 *   4. Tip           at 100% length — ear hook endpoint
 *
 * For 'right' side the X coordinates are mirrored (negated).
 */
function buildTempleCurve(
  templeLength: number,
  side: 'left' | 'right',
): THREE.CatmullRomCurve3 {
  // Sign multiplier: left arm extends in +X, right in -X.
  const sx = side === 'left' ? 1 : -1;

  // Small lateral offset so the arm angles slightly outward from the hinge.
  const lateralSpread = templeLength * 0.12;

  const points: THREE.Vector3[] = [
    // 0 - Hinge point (origin)
    new THREE.Vector3(0, 0, 0),

    // 1 - Straight section at 40% of length
    new THREE.Vector3(
      sx * lateralSpread * 0.4,
      0,
      -templeLength * 0.4,
    ),

    // 2 - Slight droop at 70% of length
    new THREE.Vector3(
      sx * lateralSpread * 0.7,
      -templeLength * 0.015,
      -templeLength * 0.7,
    ),

    // 3 - Ear curve at 95% of length — starts bending downward
    new THREE.Vector3(
      sx * lateralSpread * 0.9,
      -templeLength * 0.06,
      -templeLength * 0.95,
    ),

    // 4 - Tip — ear hook endpoint
    new THREE.Vector3(
      sx * lateralSpread * 0.85,
      -templeLength * 0.14,
      -templeLength,
    ),
  ];

  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
}

// ---------------------------------------------------------------------------
// Cross-section ring generation
// ---------------------------------------------------------------------------

/**
 * Generate RING_VERTS vertices for a rectangular cross-section with slightly
 * rounded corners, centred at the origin in the XY plane.
 *
 * The rectangle has half-extents (hw, hh). The corners are approximated by
 * shifting the 4 corner vertices inward by a small chamfer amount.
 */
function rectangularRing(hw: number, hh: number): THREE.Vector2[] {
  // Corner chamfer — 20% of the smaller half-extent gives a subtle rounding.
  const chamfer = Math.min(hw, hh) * 0.2;

  // 8 vertices going clockwise from top-right:
  //   top-right corner (2 verts), bottom-right (2), bottom-left (2), top-left (2)
  return [
    new THREE.Vector2(hw - chamfer, hh),          // top edge, right of centre
    new THREE.Vector2(hw, hh - chamfer),           // right edge, above centre
    new THREE.Vector2(hw, -(hh - chamfer)),        // right edge, below centre
    new THREE.Vector2(hw - chamfer, -hh),          // bottom edge, right of centre
    new THREE.Vector2(-(hw - chamfer), -hh),       // bottom edge, left of centre
    new THREE.Vector2(-hw, -(hh - chamfer)),       // left edge, below centre
    new THREE.Vector2(-hw, hh - chamfer),          // left edge, above centre
    new THREE.Vector2(-(hw - chamfer), hh),        // top edge, left of centre
  ];
}

// ---------------------------------------------------------------------------
// Tube geometry builder
// ---------------------------------------------------------------------------

/**
 * Build a BufferGeometry tube by sweeping a tapering rectangular cross-section
 * along the given CatmullRom curve.
 *
 * At each of `CURVE_SAMPLES` points along the curve:
 *   - A Frenet-like reference frame (tangent, normal, binormal) is computed.
 *   - A rectangular ring of `RING_VERTS` vertices is placed, scaled by a
 *     linearly interpolated width/height that tapers from hinge to tip.
 *   - Adjacent rings are connected by quads (2 triangles each).
 */
function buildTubeGeometry(curve: THREE.CatmullRomCurve3): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  // Pre-compute Frenet frames along the curve.
  const frames = curve.computeFrenetFrames(CURVE_SAMPLES - 1, false);

  // Generate vertex rings along the curve.
  for (let i = 0; i < CURVE_SAMPLES; i++) {
    const t = i / (CURVE_SAMPLES - 1);

    // Interpolate cross-section size (taper from hinge to tip).
    const hw = THREE.MathUtils.lerp(HINGE_WIDTH * 0.5, TIP_WIDTH * 0.5, t);
    const hh = THREE.MathUtils.lerp(HINGE_HEIGHT * 0.5, TIP_HEIGHT * 0.5, t);

    // Profile vertices in local 2D.
    const profile = rectangularRing(hw, hh);

    // Curve point and frame vectors.
    const point = curve.getPointAt(t);
    const normal = frames.normals[i];
    const binormal = frames.binormals[i];

    // Place each profile vertex in world space.
    for (let j = 0; j < RING_VERTS; j++) {
      const pv = profile[j];

      // World position = curvePoint + pv.x * normal + pv.y * binormal
      const wx = point.x + pv.x * normal.x + pv.y * binormal.x;
      const wy = point.y + pv.x * normal.y + pv.y * binormal.y;
      const wz = point.z + pv.x * normal.z + pv.y * binormal.z;
      positions.push(wx, wy, wz);

      // Approximate normal: direction from curve centre to vertex.
      const nx = pv.x * normal.x + pv.y * binormal.x;
      const ny = pv.x * normal.y + pv.y * binormal.y;
      const nz = pv.x * normal.z + pv.y * binormal.z;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      normals.push(nx / len, ny / len, nz / len);
    }
  }

  // Connect adjacent rings with quads (2 triangles per quad).
  for (let i = 0; i < CURVE_SAMPLES - 1; i++) {
    for (let j = 0; j < RING_VERTS; j++) {
      const a = i * RING_VERTS + j;
      const b = i * RING_VERTS + ((j + 1) % RING_VERTS);
      const c = (i + 1) * RING_VERTS + ((j + 1) % RING_VERTS);
      const d = (i + 1) * RING_VERTS + j;

      // Two triangles: (a, b, c) and (a, c, d)
      indices.push(a, b, c);
      indices.push(a, c, d);
    }
  }

  // Cap the hinge end (ring index 0).
  capRing(indices, 0);

  // Cap the tip end (last ring).
  capRing(indices, (CURVE_SAMPLES - 1) * RING_VERTS);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals(); // Smooth out the approximated normals.

  return geometry;
}

/**
 * Add a triangle fan to cap one end of the tube (flat cap).
 * `baseIndex` is the index of the first vertex in the ring to cap.
 */
function capRing(indices: number[], baseIndex: number): void {
  for (let j = 1; j < RING_VERTS - 1; j++) {
    indices.push(
      baseIndex,
      baseIndex + j,
      baseIndex + j + 1,
    );
  }
}

// ---------------------------------------------------------------------------
// Hinge barrel
// ---------------------------------------------------------------------------

/**
 * Create a small cylindrical hinge barrel that sits at the hinge point,
 * oriented perpendicular to the initial temple direction.
 */
function createHingeBarrel(
  material: THREE.MeshPhysicalMaterial,
  curve: THREE.CatmullRomCurve3,
): THREE.Mesh {
  const geometry = new THREE.CylinderGeometry(
    BARREL_RADIUS,
    BARREL_RADIUS,
    BARREL_HEIGHT,
    BARREL_SEGMENTS,
  );

  const barrel = new THREE.Mesh(geometry, material);

  // Position at the very start of the curve (the hinge point).
  const hingePoint = curve.getPointAt(0);
  barrel.position.copy(hingePoint);

  // Orient the cylinder perpendicular to the temple direction.
  // The cylinder's default axis is Y, so we rotate it to align with
  // the curve's initial normal (roughly vertical at the hinge).
  const tangent = curve.getTangentAt(0);
  const up = new THREE.Vector3(0, 1, 0);
  const barrelAxis = new THREE.Vector3().crossVectors(tangent, up).normalize();

  // If the cross product is degenerate, fall back to a simple rotation.
  if (barrelAxis.lengthSq() > 0.001) {
    barrel.quaternion.setFromUnitVectors(up, barrelAxis);
  } else {
    barrel.rotation.z = Math.PI / 2;
  }

  barrel.userData.role = 'temple';
  return barrel;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a single procedural temple arm for the specified side.
 *
 * The returned Group contains:
 *   - A swept tube mesh (tapering rectangular cross-section along a
 *     CatmullRom curve).
 *   - A small cylindrical hinge barrel at the origin (hinge point).
 *
 * All child meshes have `userData.role = 'temple'`.
 *
 * @param preset - The procedural preset describing the glasses frame.
 * @param side   - 'left' for the wearer's left arm (+X direction),
 *                 'right' for the wearer's right arm (-X direction).
 * @returns A THREE.Group positioned at the local origin (hinge point at 0,0,0).
 */
export function createTempleArm(
  preset: ProceduralPreset,
  side: 'left' | 'right',
): THREE.Group {
  const group = new THREE.Group();
  group.name = `temple-${side}`;

  // Build the spine curve.
  const curve = buildTempleCurve(preset.templeLength, side);

  // Material — metal or acetate depending on family.
  const material = createTempleMaterial(preset);

  // Main tube geometry.
  const tubeGeometry = buildTubeGeometry(curve);
  const tubeMesh = new THREE.Mesh(tubeGeometry, material);
  tubeMesh.userData.role = 'temple';
  group.add(tubeMesh);

  // Hinge barrel.
  const barrel = createHingeBarrel(material, curve);
  group.add(barrel);

  return group;
}

/**
 * Convenience wrapper that generates both temple arms for a preset.
 *
 * @param preset - The procedural preset describing the glasses frame.
 * @returns An object with `left` and `right` THREE.Group temple arms.
 */
export function createTemplePair(
  preset: ProceduralPreset,
): { left: THREE.Group; right: THREE.Group } {
  return {
    left: createTempleArm(preset, 'left'),
    right: createTempleArm(preset, 'right'),
  };
}
