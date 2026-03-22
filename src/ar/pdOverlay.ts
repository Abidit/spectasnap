/**
 * PD (Pupillary Distance) measurement overlay for the 2D camera canvas.
 *
 * Draws iris markers, a connecting dashed line, and the current PD value
 * on top of the mirrored video frame. Called every frame from the render
 * loop in ARCamera when PD measuring is active.
 *
 * Design tokens: brand-gold (#C9A96E), Inter, lightweight for 60fps.
 */

import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

// ── Iris landmark indices (MediaPipe 478-point face mesh) ────────────────────
const LM_LEFT_IRIS_CENTER = 468;
const LM_RIGHT_IRIS_CENTER = 473;

// ── Visual constants ─────────────────────────────────────────────────────────
const GOLD = '#C9A96E';
const MARKER_RADIUS = 4;
const LINE_OPACITY = 0.6;
const MARKER_OPACITY = 0.85;
const TEXT_OPACITY = 0.95;
const DASH_PATTERN: [number, number] = [6, 4];
const LINE_WIDTH = 1.5;

/**
 * Draw the PD measurement overlay on the 2D canvas.
 *
 * @param ctx        - The 2D rendering context of the camera canvas.
 * @param landmarks  - Full 478-point face landmark array from MediaPipe.
 * @param canvasW    - Current canvas width in pixels.
 * @param canvasH    - Current canvas height in pixels.
 * @param pdMm       - Current PD value in millimeters, or null if not yet available.
 */
export function drawPDOverlay(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  canvasW: number,
  canvasH: number,
  pdMm: number | null,
): void {
  // ── 1. Extract mirrored iris centre positions ──────────────────────────────
  const lc = landmarks[LM_LEFT_IRIS_CENTER];
  const rc = landmarks[LM_RIGHT_IRIS_CENTER];
  if (!lc || !rc) return;

  const lx = (1 - lc.x) * canvasW;
  const ly = lc.y * canvasH;
  const rx = (1 - rc.x) * canvasW;
  const ry = rc.y * canvasH;

  // Midpoint for text placement
  const mx = (lx + rx) / 2;
  const my = (ly + ry) / 2;

  ctx.save();

  // ── 2. Dashed line connecting iris centres ─────────────────────────────────
  ctx.globalAlpha = LINE_OPACITY;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = LINE_WIDTH;
  ctx.setLineDash(DASH_PATTERN);
  ctx.beginPath();
  ctx.moveTo(lx, ly);
  ctx.lineTo(rx, ry);
  ctx.stroke();
  ctx.setLineDash([]); // reset dash

  // ── 3. Filled circles at each iris centre ──────────────────────────────────
  ctx.globalAlpha = MARKER_OPACITY;
  ctx.fillStyle = GOLD;

  ctx.beginPath();
  ctx.arc(lx, ly, MARKER_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(rx, ry, MARKER_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  // ── 4. PD value text above the midpoint ────────────────────────────────────
  if (pdMm !== null) {
    const fontSize = Math.max(14, Math.round(canvasW * 0.018));
    ctx.globalAlpha = TEXT_OPACITY;
    ctx.fillStyle = GOLD;
    ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    const label = `PD ${pdMm.toFixed(1)} mm`;
    const textY = my - MARKER_RADIUS - 8;

    // Subtle dark backdrop behind text for readability
    const metrics = ctx.measureText(label);
    const padX = 6;
    const padY = 3;
    const bgX = mx - metrics.actualBoundingBoxLeft - padX;
    const bgY = textY - fontSize - padY;
    const bgW = metrics.width + padX * 2;
    const bgH = fontSize + padY * 2;

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'rgba(10, 10, 10, 0.7)';
    ctx.fillRect(bgX, bgY, bgW, bgH);

    // Draw the text
    ctx.globalAlpha = TEXT_OPACITY;
    ctx.fillStyle = GOLD;
    ctx.fillText(label, mx, textY);
  }

  ctx.restore();
}
