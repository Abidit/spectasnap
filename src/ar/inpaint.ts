import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

/**
 * Eye contour landmark indices for glasses region definition.
 * These form the approximate boundary of where glasses frames sit.
 */
const LEFT_EYE_CONTOUR = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const RIGHT_EYE_CONTOUR = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

// Cheek landmarks for skin tone sampling
const LEFT_CHEEK = 234;
const RIGHT_CHEEK = 454;
// Forehead for additional skin sampling
const FOREHEAD_LEFT = 67;
const FOREHEAD_RIGHT = 297;

/**
 * Remove existing glasses by inpainting the eye/bridge region with skin tone.
 *
 * Strategy:
 * 1. Define glasses region as expanded convex hull of eye contour landmarks
 * 2. Sample skin tone from cheek + forehead landmarks
 * 3. Fill the region with sampled skin color using gradient blending
 * 4. The new AR frames will mostly cover the inpainted area anyway
 *
 * @param ctx - 2D canvas context (same canvas as the video frame)
 * @param landmarks - 478-point face landmarks
 * @param canvasW - Canvas width
 * @param canvasH - Canvas height
 */
export function inpaintGlasses(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  canvasW: number,
  canvasH: number,
): void {
  // 1. Sample skin color from cheeks and forehead
  const skinColor = sampleSkinColor(ctx, landmarks, canvasW, canvasH);
  if (!skinColor) return;

  // 2. Define the glasses region (both eyes + bridge)
  const region = getGlassesRegion(landmarks, canvasW, canvasH);
  if (region.length < 6) return;

  // 3. Fill the region with skin tone using feathered edges
  ctx.save();

  // Create clipping path from the region
  ctx.beginPath();
  ctx.moveTo(region[0][0], region[0][1]);
  for (let i = 1; i < region.length; i++) {
    ctx.lineTo(region[i][0], region[i][1]);
  }
  ctx.closePath();
  ctx.clip();

  // Fill with sampled skin color
  ctx.fillStyle = `rgb(${skinColor[0]}, ${skinColor[1]}, ${skinColor[2]})`;
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.restore();

  // 4. Soften edges by drawing a blurred overlay along the region boundary
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.filter = 'blur(4px)';
  ctx.beginPath();
  ctx.moveTo(region[0][0], region[0][1]);
  for (let i = 1; i < region.length; i++) {
    ctx.lineTo(region[i][0], region[i][1]);
  }
  ctx.closePath();
  ctx.fillStyle = `rgb(${skinColor[0]}, ${skinColor[1]}, ${skinColor[2]})`;
  ctx.fill();
  ctx.filter = 'none';
  ctx.restore();
}

function sampleSkinColor(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  canvasW: number,
  canvasH: number,
): [number, number, number] | null {
  const points = [LEFT_CHEEK, RIGHT_CHEEK, FOREHEAD_LEFT, FOREHEAD_RIGHT];
  let r = 0, g = 0, b = 0, count = 0;

  for (const idx of points) {
    const lm = landmarks[idx];
    if (!lm) continue;

    // Mirror x for the mirrored video
    const px = Math.round((1 - lm.x) * canvasW);
    const py = Math.round(lm.y * canvasH);

    if (px < 0 || px >= canvasW || py < 0 || py >= canvasH) continue;

    // Sample a 5x5 area around the point
    const imgData = ctx.getImageData(
      Math.max(0, px - 2), Math.max(0, py - 2),
      5, 5,
    );

    for (let i = 0; i < imgData.data.length; i += 4) {
      r += imgData.data[i];
      g += imgData.data[i + 1];
      b += imgData.data[i + 2];
      count++;
    }
  }

  if (count === 0) return null;
  return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
}

function getGlassesRegion(
  landmarks: NormalizedLandmark[],
  canvasW: number,
  canvasH: number,
): [number, number][] {
  const allIndices = [...LEFT_EYE_CONTOUR, ...RIGHT_EYE_CONTOUR];
  const points: [number, number][] = [];

  for (const idx of allIndices) {
    const lm = landmarks[idx];
    if (!lm) continue;
    // Mirror x
    const px = (1 - lm.x) * canvasW;
    const py = lm.y * canvasH;
    points.push([px, py]);
  }

  if (points.length < 6) return [];

  // Expand the region slightly outward from center for full coverage
  const cx = points.reduce((s, p) => s + p[0], 0) / points.length;
  const cy = points.reduce((s, p) => s + p[1], 0) / points.length;

  const EXPAND = 1.3; // 30% expansion for glasses frame coverage
  return points.map(([x, y]) => [
    cx + (x - cx) * EXPAND,
    cy + (y - cy) * EXPAND,
  ]);
}
