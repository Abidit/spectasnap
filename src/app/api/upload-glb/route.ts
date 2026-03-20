/**
 * API route for uploading, listing, and deleting GLB 3D model files.
 *
 * POST  — Upload a .glb file (multipart/form-data)
 * GET   — List all GLB models for a store (?store=...)
 * DELETE — Remove a GLB model (?id=...&store=...)
 *
 * Storage:
 *   - Binary: Vercel Blob
 *   - Metadata: Vercel KV  (key pattern: glb:{storeId}:{modelId})
 */

import { put, del as blobDel } from '@vercel/blob';
import { kv } from '@vercel/kv';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GLBModelMeta {
  id: string;
  name: string;
  storeId: string;
  blobUrl: string;
  fileSize: number;
  uploadedAt: string;
  calibration?: {
    scale?: number;
    yOffset?: number;
    zOffset?: number;
    boundingBox?: { width: number; height: number; depth: number };
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum upload size: 10 MB. */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** KV key helpers. */
function modelKey(storeId: string, modelId: string): string {
  return `glb:${storeId}:${modelId}`;
}

function storeIndexKey(storeId: string): string {
  return `glb-index:${storeId}`;
}

// ---------------------------------------------------------------------------
// POST — Upload a GLB file
// ---------------------------------------------------------------------------

export async function POST(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();

    const file = formData.get('file');
    if (!(file instanceof File)) {
      return Response.json(
        { ok: false, error: 'Missing "file" field in form data.' },
        { status: 400 },
      );
    }

    // Validate file extension.
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.glb')) {
      return Response.json(
        { ok: false, error: 'Only .glb files are accepted.' },
        { status: 400 },
      );
    }

    // Validate file size.
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { ok: false, error: `File exceeds the 10 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).` },
        { status: 400 },
      );
    }

    const name = (formData.get('name') as string | null)?.trim() || file.name.replace(/\.glb$/i, '');
    const storeId = (formData.get('storeId') as string | null)?.trim() || 'default';
    const modelId = `glb-${storeId}-${Date.now()}`;

    // Upload to Vercel Blob.
    const blob = await put(`models/${storeId}/${modelId}.glb`, file, {
      access: 'public',
      contentType: 'model/gltf-binary',
    });

    // Build metadata.
    const meta: GLBModelMeta = {
      id: modelId,
      name,
      storeId,
      blobUrl: blob.url,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
    };

    // Store metadata in KV.
    await kv.set(modelKey(storeId, modelId), JSON.stringify(meta));

    // Append model ID to the store index list (capped at 200 models per store).
    await kv.lpush(storeIndexKey(storeId), modelId);
    await kv.ltrim(storeIndexKey(storeId), 0, 199);

    return Response.json({ ok: true, modelId, blobUrl: blob.url, meta });
  } catch (err) {
    console.error('[upload-glb] POST error:', err);
    return Response.json(
      { ok: false, error: 'Failed to upload GLB model.' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// GET — List all GLB models for a store
// ---------------------------------------------------------------------------

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('store')?.trim() || 'default';

    // Fetch the index of model IDs for this store.
    const ids: string[] = (await kv.lrange(storeIndexKey(storeId), 0, -1)) ?? [];

    if (ids.length === 0) {
      return Response.json({ ok: true, models: [] });
    }

    // Fetch metadata for each model.
    const models: GLBModelMeta[] = [];
    for (const id of ids) {
      const raw = await kv.get<string>(modelKey(storeId, id));
      if (raw) {
        try {
          const parsed: GLBModelMeta = typeof raw === 'string' ? JSON.parse(raw) : (raw as unknown as GLBModelMeta);
          models.push(parsed);
        } catch {
          // Skip malformed entries.
        }
      }
    }

    return Response.json({ ok: true, models });
  } catch (err) {
    console.error('[upload-glb] GET error:', err);
    return Response.json(
      { ok: false, error: 'Failed to list GLB models.' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE — Remove a GLB model
// ---------------------------------------------------------------------------

export async function DELETE(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const modelId = searchParams.get('id')?.trim();
    const storeId = searchParams.get('store')?.trim() || 'default';

    if (!modelId) {
      return Response.json(
        { ok: false, error: 'Missing "id" query parameter.' },
        { status: 400 },
      );
    }

    // Fetch existing metadata so we can delete the blob.
    const raw = await kv.get<string>(modelKey(storeId, modelId));
    if (raw) {
      try {
        const meta: GLBModelMeta = typeof raw === 'string' ? JSON.parse(raw) : (raw as unknown as GLBModelMeta);
        // Delete from Vercel Blob.
        await blobDel(meta.blobUrl);
      } catch {
        // Continue even if blob deletion fails — clean up KV anyway.
      }
    }

    // Remove from KV.
    await kv.del(modelKey(storeId, modelId));

    // Remove from the store index.
    await kv.lrem(storeIndexKey(storeId), 0, modelId);

    return Response.json({ ok: true });
  } catch (err) {
    console.error('[upload-glb] DELETE error:', err);
    return Response.json(
      { ok: false, error: 'Failed to delete GLB model.' },
      { status: 500 },
    );
  }
}
