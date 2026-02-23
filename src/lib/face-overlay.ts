import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { GlassesFrame } from './glasses-data';

// MediaPipe Face Mesh 478-point model key landmark indices
const LM = {
  LEFT_EYE_OUTER: 33,
  RIGHT_EYE_OUTER: 263,
  LEFT_EYE_INNER: 133,
  RIGHT_EYE_INNER: 362,
  NOSE_BRIDGE: 168,
  NOSE_TIP: 4,
  LEFT_CHEEK: 234,
  RIGHT_CHEEK: 454,
  FOREHEAD: 10,
  CHIN: 152,
} as const;

function lm(landmarks: NormalizedLandmark[], idx: number, w: number, h: number) {
  const p = landmarks[idx];
  // Landmarks come in un-mirrored; canvas is CSS-mirrored, so we flip x
  return { x: (1 - p.x) * w, y: p.y * h };
}

export function drawGlassesOnCanvas(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  glassesImg: HTMLImageElement,
  frame: GlassesFrame,
  canvasW: number,
  canvasH: number,
) {
  if (!glassesImg.complete || glassesImg.naturalWidth === 0) return;

  const leftOuter = lm(landmarks, LM.LEFT_EYE_OUTER, canvasW, canvasH);
  const rightOuter = lm(landmarks, LM.RIGHT_EYE_OUTER, canvasW, canvasH);
  const leftCheek = lm(landmarks, LM.LEFT_CHEEK, canvasW, canvasH);
  const rightCheek = lm(landmarks, LM.RIGHT_CHEEK, canvasW, canvasH);
  const noseBridge = lm(landmarks, LM.NOSE_BRIDGE, canvasW, canvasH);

  // Face width (cheek-to-cheek)
  const faceWidth = Math.hypot(rightCheek.x - leftCheek.x, rightCheek.y - leftCheek.y);

  // Glasses width scaled to face
  const glassesW = faceWidth * frame.scaleFactor;
  // Preserve SVG aspect ratio (viewBox 500 × 200 for most styles)
  const svgAspect = glassesImg.naturalWidth / glassesImg.naturalHeight;
  const glassesH = glassesW / svgAspect;

  // Eye midpoint
  const eyeMidX = (leftOuter.x + rightOuter.x) / 2;
  const eyeMidY = (leftOuter.y + rightOuter.y) / 2;

  // Rotation from left-outer to right-outer eye
  const angle = Math.atan2(rightOuter.y - leftOuter.y, rightOuter.x - leftOuter.x);

  // Center: between eyes, nudged up by yOffset fraction
  const cx = eyeMidX + Math.sin(angle) * glassesH * frame.yOffset;
  const cy = eyeMidY - Math.cos(angle) * glassesH * frame.yOffset;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.drawImage(glassesImg, -glassesW / 2, -glassesH / 2, glassesW, glassesH);
  ctx.restore();

  // Debug: uncomment to show landmark dots
  // [LM.LEFT_EYE_OUTER, LM.RIGHT_EYE_OUTER, LM.LEFT_CHEEK, LM.RIGHT_CHEEK].forEach(idx => {
  //   const p = lm(landmarks, idx, canvasW, canvasH);
  //   ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
  //   ctx.fillStyle = 'lime'; ctx.fill();
  // });
}

export function preloadGlassesImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
