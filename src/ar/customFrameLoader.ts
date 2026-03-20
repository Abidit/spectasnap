/**
 * Custom frame loader — stores and retrieves user-uploaded frame images
 * as transparent PNGs in localStorage, and creates Three.js meshes from them.
 *
 * The PNG is resized to max 800px (largest dimension) before saving to stay
 * within localStorage's ~5 MB limit.
 */

import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CustomFrameData {
  /** Transparent PNG as a data-URL. */
  dataUrl: string;
  /** Original image width (after resize). */
  width: number;
  /** Original image height (after resize). */
  height: number;
  /** Calibration: bridge X position as fraction 0–1 of image width. */
  bridgeX: number;
  /** Calibration: bridge Y position as fraction 0–1 of image height. */
  bridgeY: number;
  /** Calibration: width scale multiplier (0.5–2.0). */
  widthScale: number;
  /** User-given name for the custom frame. */
  name: string;
}

// ---------------------------------------------------------------------------
// LocalStorage key
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'spectasnap_custom_frame';

// ---------------------------------------------------------------------------
// Save / Load / Clear
// ---------------------------------------------------------------------------

/**
 * Resize the image to max 800px on its longest side, then save to localStorage.
 */
export async function saveCustomFrame(data: CustomFrameData): Promise<void> {
  const resized = await resizeDataUrl(data.dataUrl, 800);
  const toStore: CustomFrameData = {
    ...data,
    dataUrl: resized.dataUrl,
    width: resized.width,
    height: resized.height,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
}

/**
 * Load the saved custom frame from localStorage, or null if none exists.
 */
export function loadCustomFrame(): CustomFrameData | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CustomFrameData;
  } catch {
    return null;
  }
}

/**
 * Remove the saved custom frame from localStorage.
 */
export function clearCustomFrame(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ---------------------------------------------------------------------------
// Three.js mesh creation
// ---------------------------------------------------------------------------

/**
 * Create a PlaneGeometry textured with the transparent PNG.
 * The plane is sized so its width in world units ≈ 0.14 * widthScale,
 * preserving the image aspect ratio.
 */
export function createCustomFrameMesh(data: CustomFrameData): THREE.Group {
  const group = new THREE.Group();

  const tex = new THREE.TextureLoader().load(data.dataUrl);
  tex.colorSpace = THREE.SRGBColorSpace;

  const aspect = data.width / (data.height || 1);
  const worldWidth = 0.14 * data.widthScale;
  const worldHeight = worldWidth / aspect;

  const geo = new THREE.PlaneGeometry(worldWidth, worldHeight);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.role = 'custom-frame';

  // Offset so the bridge point (calibration) sits at the origin.
  // bridgeX/bridgeY are fractions 0–1 from top-left of the image.
  const offsetX = -(data.bridgeX - 0.5) * worldWidth;
  const offsetY = (data.bridgeY - 0.5) * worldHeight;
  mesh.position.set(offsetX, offsetY, 0);

  group.add(mesh);
  return group;
}

// ---------------------------------------------------------------------------
// Image resize helper
// ---------------------------------------------------------------------------

async function resizeDataUrl(
  dataUrl: string,
  maxDim: number,
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { naturalWidth: w, naturalHeight: h } = img;
      if (w <= maxDim && h <= maxDim) {
        resolve({ dataUrl, width: w, height: h });
        return;
      }
      const scale = maxDim / Math.max(w, h);
      w = Math.round(w * scale);
      h = Math.round(h * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get 2D context'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve({ dataUrl: canvas.toDataURL('image/png'), width: w, height: h });
    };
    img.onerror = () => reject(new Error('Failed to load image for resize'));
    img.src = dataUrl;
  });
}
