import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { GlassesFrame } from './glasses-data';

const LM = {
  LEFT_EYE_OUTER:  33,
  RIGHT_EYE_OUTER: 263,
  LEFT_CHEEK:      234,
  RIGHT_CHEEK:     454,
  NOSE_BRIDGE:     168,
} as const;

function lm(landmarks: NormalizedLandmark[], idx: number, w: number, h: number) {
  const p = landmarks[idx];
  // Video is CSS-mirrored — flip x so overlay aligns
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

  const leftOuter  = lm(landmarks, LM.LEFT_EYE_OUTER,  canvasW, canvasH);
  const rightOuter = lm(landmarks, LM.RIGHT_EYE_OUTER, canvasW, canvasH);
  const leftCheek  = lm(landmarks, LM.LEFT_CHEEK,      canvasW, canvasH);
  const rightCheek = lm(landmarks, LM.RIGHT_CHEEK,     canvasW, canvasH);
  const nosePt     = lm(landmarks, LM.NOSE_BRIDGE,     canvasW, canvasH);

  const faceWidth  = Math.hypot(rightCheek.x - leftCheek.x, rightCheek.y - leftCheek.y);
  const glassesW   = faceWidth * frame.scaleFactor;
  const svgAspect  = glassesImg.naturalWidth / glassesImg.naturalHeight;
  const glassesH   = glassesW / svgAspect;

  const eyeMidX = (leftOuter.x + rightOuter.x) / 2;
  const eyeMidY = (leftOuter.y + rightOuter.y) / 2;
  let eyeDx = rightOuter.x - leftOuter.x;
  let eyeDy = rightOuter.y - leftOuter.y;
  // Keep a stable left->right vector in mirrored space to avoid PI flips.
  if (eyeDx < 0) {
    eyeDx = -eyeDx;
    eyeDy = -eyeDy;
  }
  const angle = Math.atan2(eyeDy, eyeDx);

  const cx = eyeMidX + Math.sin(angle) * glassesH * frame.yOffset;
  const cy = eyeMidY - Math.cos(angle) * glassesH * frame.yOffset;

  // ── Nose bridge soft shadow (drawn before glasses) ─────────────────────────
  const sRx = glassesW * 0.065;
  const sRy = glassesW * 0.038;
  const bridgeGrad = ctx.createRadialGradient(nosePt.x, nosePt.y, 0, nosePt.x, nosePt.y, sRx);
  bridgeGrad.addColorStop(0, 'rgba(0,0,0,0.15)');
  bridgeGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.fillStyle = bridgeGrad;
  ctx.beginPath();
  ctx.ellipse(nosePt.x, nosePt.y + sRy * 0.4, sRx, sRy, angle, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Glasses with drop shadow ────────────────────────────────────────────────
  ctx.save();
  ctx.shadowColor     = 'rgba(0,0,0,0.42)';
  ctx.shadowBlur      = 12;
  ctx.shadowOffsetX   = 0;
  ctx.shadowOffsetY   = 3;
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.drawImage(glassesImg, -glassesW / 2, -glassesH / 2, glassesW, glassesH);
  ctx.restore();
}

export function preloadGlassesImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
