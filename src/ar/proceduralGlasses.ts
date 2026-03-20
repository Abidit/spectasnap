import * as THREE from 'three';
import type { ProceduralPreset } from './presets';

// ---------------------------------------------------------------------------
// Lens material presets — per-style variant (Task 1)
// ---------------------------------------------------------------------------

interface LensMaterialConfig {
  color: number;
  metalness: number;
  roughness: number;
  transmission: number;
  thickness: number;
  ior: number;
  opacity: number;
  envMapIntensity: number;
}

const LENS_PRESETS: Record<string, LensMaterialConfig> = {
  default: {
    color: 0x88aacc, metalness: 0.0, roughness: 0.05,
    transmission: 0.92, thickness: 0.5, ior: 1.5,
    opacity: 0.18, envMapIntensity: 1.2,
  },
  dark: {
    color: 0x111111, metalness: 0.0, roughness: 0.08,
    transmission: 0.35, thickness: 0.5, ior: 1.5,
    opacity: 0.65, envMapIntensity: 1.2,
  },
  gold: {
    color: 0xc9a96e, metalness: 0.3, roughness: 0.05,
    transmission: 0.45, thickness: 0.5, ior: 1.5,
    opacity: 0.55, envMapIntensity: 1.2,
  },
  clear: {
    color: 0xccddee, metalness: 0.0, roughness: 0.02,
    transmission: 0.96, thickness: 0.5, ior: 1.5,
    opacity: 0.08, envMapIntensity: 1.2,
  },
  rose: {
    color: 0xc4826a, metalness: 0.0, roughness: 0.06,
    transmission: 0.5, thickness: 0.5, ior: 1.5,
    opacity: 0.5, envMapIntensity: 1.2,
  },
};

/** Resolve which lens material preset to use based on frame family/color. */
function resolveLensKey(preset: ProceduralPreset): string {
  if (preset.family === 'aviator') return 'gold';
  if (preset.family === 'cat-eye') return 'rose';
  if (preset.frameColor === '#c8c8c8') return 'clear';
  if (preset.frameColor === '#1b1b1d' || preset.frameColor === '#6a4d3c') return 'dark';
  return 'default';
}

function createLensMaterial(preset: ProceduralPreset): THREE.MeshPhysicalMaterial {
  const key = resolveLensKey(preset);
  const cfg = LENS_PRESETS[key] ?? LENS_PRESETS.default;
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(cfg.color),
    metalness: cfg.metalness,
    roughness: cfg.roughness,
    transmission: cfg.transmission,
    thickness: cfg.thickness,
    ior: cfg.ior,
    transparent: true,
    opacity: cfg.opacity,
    envMapIntensity: cfg.envMapIntensity,
    side: THREE.DoubleSide,
    depthWrite: false,
    // AR coating support (Task 8.2) — initialized off, toggled by setLensCoating()
    iridescence: 0,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [200, 400],
  });
}

// ---------------------------------------------------------------------------
// Frame material — acetate vs metal (Task 3)
// ---------------------------------------------------------------------------

function createFrameMaterial(preset: ProceduralPreset): THREE.MeshPhysicalMaterial {
  const isMetal = preset.family === 'aviator' || preset.family === 'sport-wrap';
  if (isMetal) {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(preset.frameColor),
      metalness: 0.95,
      roughness: 0.15,
      reflectivity: 1.0,
      envMapIntensity: 1.4,
    });
  }
  // Acetate: round, rectangle, cat-eye
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(preset.frameColor),
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    roughness: 0.35,
    metalness: 0.05,
    envMapIntensity: 0.8,
  });
}

// ---------------------------------------------------------------------------
// Shape generators (unchanged)
// ---------------------------------------------------------------------------

function makeLensShape(preset: ProceduralPreset): THREE.Shape {
  const w = preset.lensWidth;
  const h = preset.lensHeight;
  const shape = new THREE.Shape();

  if (preset.family === 'round') {
    shape.absellipse(0, 0, w, h, 0, Math.PI * 2, false, 0);
    return shape;
  }

  if (preset.family === 'rectangle' || preset.family === 'sport-wrap') {
    const r = Math.min(w, h) * (preset.family === 'sport-wrap' ? 0.35 : 0.26);
    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);
    return shape;
  }

  if (preset.family === 'aviator') {
    const top = h + preset.browLift;
    shape.moveTo(-w * 0.7, top * 0.9);
    shape.bezierCurveTo(-w * 1.05, top * 0.5, -w * 1.05, -h * 0.55, -w * 0.4, -h);
    shape.bezierCurveTo(0, -h * 1.06, w * 0.4, -h, w * 0.9, -h * 0.42);
    shape.bezierCurveTo(w * 1.02, -h * 0.05, w * 0.98, top * 0.62, w * 0.56, top);
    shape.bezierCurveTo(w * 0.23, top * 1.1, -w * 0.28, top * 1.06, -w * 0.7, top * 0.9);
    return shape;
  }

  // cat-eye
  shape.moveTo(-w * 0.96, -h * 0.15);
  shape.bezierCurveTo(-w, h * 0.55, -w * 0.55, h + preset.browLift, 0, h * 0.93);
  shape.bezierCurveTo(w * 0.45, h * 0.88, w * 1.05, h * 0.7 + preset.browLift, w * 1.04, h * 0.08);
  shape.bezierCurveTo(w * 0.98, -h * 0.62, w * 0.3, -h, -w * 0.54, -h * 0.83);
  shape.bezierCurveTo(-w * 0.8, -h * 0.75, -w * 0.95, -h * 0.55, -w * 0.96, -h * 0.15);
  return shape;
}

// ---------------------------------------------------------------------------
// Rim extrude geometry — refined bevel (Task 3)
// ---------------------------------------------------------------------------

function buildRimGeometry(preset: ProceduralPreset): THREE.ExtrudeGeometry {
  const outer = makeLensShape(preset);
  const inner = makeLensShape({
    ...preset,
    lensWidth: Math.max(0.01, preset.lensWidth - preset.rimThickness),
    lensHeight: Math.max(0.008, preset.lensHeight - preset.rimThickness),
    browLift: Math.max(0, preset.browLift - preset.rimThickness * 0.2),
  });
  outer.holes.push(inner);

  return new THREE.ExtrudeGeometry(outer, {
    depth: 0.007,
    bevelEnabled: true,
    bevelSize: 0.0015,
    bevelThickness: 0.0025,
    bevelSegments: 4,
    curveSegments: 24,
    steps: 1,
  });
}

// ---------------------------------------------------------------------------
// createProceduralGlasses — main factory
// ---------------------------------------------------------------------------

export function createProceduralGlasses(preset: ProceduralPreset): THREE.Group {
  const group = new THREE.Group();

  // ── Materials ──────────────────────────────────────────────────────────────
  const frameMat = createFrameMaterial(preset);
  const lensMat = createLensMaterial(preset);

  // ── Geometry ───────────────────────────────────────────────────────────────
  const rimGeo = buildRimGeometry(preset);
  const halfIPD = preset.lensWidth + preset.lensGap;
  const lensZ = 0.007 * 0.6; // depth * 0.6 — forward enough to clear nose occluder at steep angles

  // ── Rims ───────────────────────────────────────────────────────────────────
  const leftRim = new THREE.Mesh(rimGeo, frameMat);
  leftRim.position.set(-halfIPD, 0, -0.007 * 0.5);
  leftRim.userData.role = 'frame';
  group.add(leftRim);

  const rightRim = new THREE.Mesh(rimGeo, frameMat);
  rightRim.position.set(halfIPD, 0, -0.007 * 0.5);
  rightRim.userData.role = 'frame';
  group.add(rightRim);

  // ── Lenses ─────────────────────────────────────────────────────────────────
  const lensShape = makeLensShape({
    ...preset,
    lensWidth: Math.max(0.01, preset.lensWidth - preset.rimThickness * 1.1),
    lensHeight: Math.max(0.01, preset.lensHeight - preset.rimThickness * 1.1),
  });
  const lensGeo = new THREE.ShapeGeometry(lensShape, 20);

  const leftLens = new THREE.Mesh(lensGeo, lensMat);
  leftLens.position.set(-halfIPD, 0, lensZ);
  leftLens.userData.role = 'lens';
  group.add(leftLens);

  const rightLens = new THREE.Mesh(lensGeo, lensMat);
  rightLens.position.set(halfIPD, 0, lensZ);
  rightLens.userData.role = 'lens';
  group.add(rightLens);

  // ── Lens glare highlights (Task 6) ─────────────────────────────────────────
  const glareShape = new THREE.Shape();
  glareShape.moveTo(-0.018, 0.012);
  glareShape.quadraticCurveTo(-0.008, 0.022, 0.005, 0.018);
  glareShape.quadraticCurveTo(0.002, 0.008, -0.018, 0.012);

  const glareGeo = new THREE.ShapeGeometry(glareShape);
  const glareMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  const leftGlare = new THREE.Mesh(glareGeo, glareMat);
  leftGlare.position.set(-halfIPD, preset.lensHeight * 0.15, lensZ + 0.001);
  leftGlare.userData.role = 'glare';
  group.add(leftGlare);

  const rightGlare = new THREE.Mesh(glareGeo, glareMat);
  rightGlare.position.set(halfIPD, preset.lensHeight * 0.15, lensZ + 0.001);
  rightGlare.scale.x = -1; // Mirror for right lens
  rightGlare.userData.role = 'glare';
  group.add(rightGlare);

  // ── Bridge ─────────────────────────────────────────────────────────────────
  const bridgeGeo = new THREE.BoxGeometry(
    preset.bridgeWidth,
    preset.rimThickness * 0.9,
    0.007 * 0.9,
  );
  const bridge = new THREE.Mesh(bridgeGeo, frameMat);
  bridge.position.set(0, preset.lensHeight * 0.14, -0.007 * 0.15);
  bridge.userData.role = 'frame';
  group.add(bridge);

  // ── Soft shadow (Task 4) ───────────────────────────────────────────────────
  const shadowGeo = new THREE.PlaneGeometry(0.18, 0.04);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.set(0, -0.012, 0.001);
  shadow.rotation.x = -Math.PI / 2;
  shadow.userData.role = 'shadow';
  group.add(shadow);

  return group;
}

// ---------------------------------------------------------------------------
// updateGlassesColor — uses userData.role instead of instanceof (Task 3)
// ---------------------------------------------------------------------------

/**
 * Update the frame and lens colors of a procedural glasses model in-place.
 * Uses userData.role tags to distinguish mesh types, allowing both frame and
 * lens materials to be MeshPhysicalMaterial.
 */
export function updateGlassesColor(
  model: THREE.Group,
  frameHex: string,
  lensHex: string,
): void {
  const frameColor = new THREE.Color(frameHex);
  const lensColor = new THREE.Color(lensHex);

  model.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const mat of mats) {
      if (obj.userData.role === 'lens') {
        mat.color.copy(lensColor);
        mat.needsUpdate = true;
      } else if (obj.userData.role === 'frame') {
        mat.color.copy(frameColor);
        mat.needsUpdate = true;
      }
      // 'glare' and 'shadow' are not recolored
    }
  });
}
