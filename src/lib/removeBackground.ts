/**
 * Browser-side background removal using @imgly/background-removal.
 *
 * The library downloads ~50 MB of ONNX models from CDN on first use
 * (cached afterwards). We dynamic-import to keep the main bundle small.
 */

export interface BgRemovalResult {
  /** Transparent PNG as a data-URL. */
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Remove the background from an image file.
 *
 * @param file   The user-selected image file (JPEG / PNG).
 * @param onProgress  Optional callback receiving 0–1 progress.
 * @returns Transparent PNG as a data-URL + dimensions.
 */
export async function removeBackground(
  file: File,
  onProgress?: (p: number) => void,
): Promise<BgRemovalResult> {
  // Dynamic import keeps main bundle small (~1.1 MB JS lazy-loaded).
  const { removeBackground: remove } = await import('@imgly/background-removal');

  const blob: Blob = await remove(file, {
    progress: (key: string, current: number, total: number) => {
      if (onProgress && total > 0) {
        onProgress(current / total);
      }
      // Suppress unused variable warning — key identifies the pipeline step
      void key;
    },
  });

  // Convert the result blob → data URL + measure dimensions.
  const dataUrl = await blobToDataUrl(blob);
  const { width, height } = await measureImage(dataUrl);
  return { dataUrl, width, height };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
}

function measureImage(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Failed to measure image'));
    img.src = dataUrl;
  });
}
