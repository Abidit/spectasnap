import * as THREE from 'three';
import type { ProceduralPreset } from './presets';

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
    depth: preset.frameDepth,
    bevelEnabled: true,
    bevelSize: 0.001,
    bevelThickness: 0.001,
    bevelSegments: 2,
    curveSegments: 32,
    steps: 1,
  });
}

export function createProceduralGlasses(preset: ProceduralPreset): THREE.Group {
  const group = new THREE.Group();

  const frameMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(preset.frameColor),
    metalness: preset.family === 'aviator' ? 0.6 : 0.25,
    roughness: preset.family === 'aviator' ? 0.3 : 0.48,
  });

  const lensMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(preset.lensTint),
    transparent: true,
    opacity: 0.26,
    transmission: 0.85,
    roughness: 0.08,
    thickness: 0.005,
    metalness: 0.0,
    ior: 1.5,
    envMapIntensity: 1.2,
  });

  const rimGeo = buildRimGeometry(preset);
  const halfIPD = preset.lensWidth + preset.lensGap;
  const lensZ = preset.frameDepth * 0.2;

  const leftRim = new THREE.Mesh(rimGeo, frameMat);
  leftRim.position.set(-halfIPD, 0, -preset.frameDepth * 0.5);
  group.add(leftRim);

  const rightRim = new THREE.Mesh(rimGeo, frameMat);
  rightRim.position.set(halfIPD, 0, -preset.frameDepth * 0.5);
  group.add(rightRim);

  const lensShape = makeLensShape({
    ...preset,
    lensWidth: Math.max(0.01, preset.lensWidth - preset.rimThickness * 1.1),
    lensHeight: Math.max(0.01, preset.lensHeight - preset.rimThickness * 1.1),
  });
  const lensGeo = new THREE.ShapeGeometry(lensShape, 20);

  const leftLens = new THREE.Mesh(lensGeo, lensMat);
  leftLens.position.set(-halfIPD, 0, lensZ);
  group.add(leftLens);

  const rightLens = new THREE.Mesh(lensGeo, lensMat);
  rightLens.position.set(halfIPD, 0, lensZ);
  group.add(rightLens);

  const bridgeGeo = new THREE.BoxGeometry(preset.bridgeWidth, preset.rimThickness * 0.9, preset.frameDepth * 0.9);
  const bridge = new THREE.Mesh(bridgeGeo, frameMat);
  bridge.position.set(0, preset.lensHeight * 0.14, -preset.frameDepth * 0.15);
  group.add(bridge);

  return group;
}

/**
 * Update the frame and lens colors of a procedural glasses model in-place.
 * MeshPhysicalMaterial (lenses) is checked before MeshStandardMaterial (rims/temples)
 * because Physical extends Standard.
 */
export function updateGlassesColor(
  model: THREE.Group,
  frameHex: string,
  lensHex: string,
): void {
  const frameColor = new THREE.Color(frameHex);
  const lensColor  = new THREE.Color(lensHex);

  model.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const mat of mats) {
      if (mat instanceof THREE.MeshPhysicalMaterial) {
        mat.color.copy(lensColor);
        mat.needsUpdate = true;
      } else if (mat instanceof THREE.MeshStandardMaterial) {
        mat.color.copy(frameColor);
        mat.needsUpdate = true;
      }
    }
  });
}
