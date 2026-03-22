'use client';

import type { SavedLook } from './CompareTray';

/**
 * Generate a 2x2 collage image from saved looks.
 * Uses an offscreen canvas to composite the thumbnails with frame names
 * and a SpectaSnap watermark.
 *
 * @returns A JPEG dataUrl of the collage, or null if not enough looks.
 */
export function generateCompareCollage(looks: SavedLook[]): string | null {
  if (looks.length < 2) return null;

  const CANVAS_W = 800;
  const CANVAS_H = 800;
  const CELL_W = CANVAS_W / 2;
  const CELL_H = CANVAS_H / 2;
  const PADDING = 4;

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Dark background
  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Cell positions for 2x2 grid
  const positions = [
    { x: 0, y: 0 },
    { x: CELL_W, y: 0 },
    { x: 0, y: CELL_H },
    { x: CELL_W, y: CELL_H },
  ];

  // Draw up to 4 looks synchronously (dataUrls are same-origin, load instantly)
  looks.slice(0, 4).forEach((look, i) => {
    const img = new Image();
    img.src = look.dataUrl;
    const pos = positions[i];

    try {
      const scale = Math.max(CELL_W / img.width, CELL_H / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      const sx = pos.x + (CELL_W - sw) / 2;
      const sy = pos.y + (CELL_H - sh) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.rect(
        pos.x + PADDING,
        pos.y + PADDING,
        CELL_W - PADDING * 2,
        CELL_H - PADDING * 2,
      );
      ctx.clip();
      ctx.drawImage(img, sx, sy, sw, sh);
      ctx.restore();

      // Frame name label at bottom of cell
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(
        pos.x + PADDING,
        pos.y + CELL_H - 36,
        CELL_W - PADDING * 2,
        32,
      );
      ctx.font = '600 14px "Cormorant Garamond", Georgia, serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(look.frameName, pos.x + CELL_W / 2, pos.y + CELL_H - 20);
    } catch {
      // Skip if image can't be drawn
    }
  });

  // SpectaSnap watermark
  ctx.font = '500 11px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(201,169,110,0.7)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('SpectaSnap AR Try-On', CANVAS_W / 2, CANVAS_H - 8);

  return canvas.toDataURL('image/jpeg', 0.9);
}
