import { kv } from '@vercel/kv';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CatalogFrame {
  id: string;           // auto-generated: "store-{storeId}-{timestamp}"
  storeId: string;
  name: string;
  style: string;        // e.g. "Aviator", "Round", "Cat-Eye"
  price?: string;       // e.g. "$149.99"
  sku?: string;         // Store's internal SKU
  basePresetId: string; // ID of a built-in procedural preset to use as 3D model
  colorHex?: string;    // Custom frame color override
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const STORE_ID_REGEX = /^[a-zA-Z0-9-]{3,50}$/;

function validateStoreId(id: unknown): id is string {
  return typeof id === 'string' && STORE_ID_REGEX.test(id);
}

function kvKey(storeId: string): string {
  return `store:catalog:${storeId}`;
}

const VALID_PRESET_IDS = [
  'round-01',
  'round-02',
  'rectangle-01',
  'rectangle-02',
  'aviator-01',
  'aviator-02',
  'cat-eye-01',
  'cat-eye-02',
  'sport-wrap-01',
  'sport-wrap-02',
];

// ---------------------------------------------------------------------------
// GET  /api/catalog?store={storeId}
// ---------------------------------------------------------------------------

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('store');

    if (!validateStoreId(storeId)) {
      return Response.json(
        {
          ok: false,
          error:
            'Invalid or missing store ID. Must be 3-50 alphanumeric characters or hyphens.',
        },
        { status: 400 },
      );
    }

    const raw = await kv.get<string>(kvKey(storeId));
    const frames: CatalogFrame[] = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) as CatalogFrame[] : [];

    return Response.json({ ok: true, frames });
  } catch {
    return Response.json(
      { ok: false, error: 'Failed to fetch catalog.' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST  /api/catalog  — Add a frame to the store catalog
// ---------------------------------------------------------------------------

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as Partial<CatalogFrame>;

    // ── Validate required fields ──────────────────────────────────────────
    if (!validateStoreId(body.storeId)) {
      return Response.json(
        {
          ok: false,
          error:
            'Invalid storeId. Must be 3-50 alphanumeric characters or hyphens.',
        },
        { status: 400 },
      );
    }

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return Response.json(
        { ok: false, error: 'name is required.' },
        { status: 400 },
      );
    }

    if (
      !body.basePresetId ||
      typeof body.basePresetId !== 'string' ||
      !VALID_PRESET_IDS.includes(body.basePresetId)
    ) {
      return Response.json(
        {
          ok: false,
          error: `basePresetId is required and must be one of: ${VALID_PRESET_IDS.join(', ')}`,
        },
        { status: 400 },
      );
    }

    if (
      body.colorHex !== undefined &&
      body.colorHex !== '' &&
      !/^#[0-9a-fA-F]{6}$/.test(body.colorHex)
    ) {
      return Response.json(
        { ok: false, error: 'colorHex must be a valid hex color (e.g. #C9A96E).' },
        { status: 400 },
      );
    }

    // ── Build frame entry ─────────────────────────────────────────────────
    const now = new Date();
    const frame: CatalogFrame = {
      id: `store-${body.storeId}-${now.getTime()}`,
      storeId: body.storeId,
      name: body.name.trim(),
      style: typeof body.style === 'string' ? body.style.trim() : 'Round',
      price: typeof body.price === 'string' ? body.price.trim() || undefined : undefined,
      sku: typeof body.sku === 'string' ? body.sku.trim() || undefined : undefined,
      basePresetId: body.basePresetId,
      colorHex: typeof body.colorHex === 'string' && body.colorHex.trim() ? body.colorHex.trim() : undefined,
      createdAt: now.toISOString(),
    };

    // ── Append to existing array ──────────────────────────────────────────
    const key = kvKey(body.storeId);
    const raw = await kv.get<string>(key);
    const existing: CatalogFrame[] = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) as CatalogFrame[] : [];
    existing.push(frame);
    await kv.set(key, JSON.stringify(existing));

    return Response.json({ ok: true, frame });
  } catch {
    return Response.json(
      { ok: false, error: 'Failed to add frame to catalog.' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE  /api/catalog?store={storeId}&id={frameId}
// ---------------------------------------------------------------------------

export async function DELETE(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('store');
    const frameId = searchParams.get('id');

    if (!validateStoreId(storeId)) {
      return Response.json(
        {
          ok: false,
          error:
            'Invalid or missing store ID. Must be 3-50 alphanumeric characters or hyphens.',
        },
        { status: 400 },
      );
    }

    if (!frameId || typeof frameId !== 'string') {
      return Response.json(
        { ok: false, error: 'Missing frame id parameter.' },
        { status: 400 },
      );
    }

    const key = kvKey(storeId);
    const raw = await kv.get<string>(key);
    const existing: CatalogFrame[] = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) as CatalogFrame[] : [];

    const filtered = existing.filter((f) => f.id !== frameId);

    if (filtered.length === existing.length) {
      return Response.json(
        { ok: false, error: `Frame "${frameId}" not found in catalog.` },
        { status: 404 },
      );
    }

    await kv.set(key, JSON.stringify(filtered));

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { ok: false, error: 'Failed to delete frame from catalog.' },
      { status: 500 },
    );
  }
}
