import { kv } from '@vercel/kv';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StoreConfig {
  storeId: string;
  storeName: string;
  accentColor?: string;
  allowedFrameIds?: string[];
  showPD: boolean;
  contactMethod: 'whatsapp' | 'email' | 'none';
  contactValue?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const STORE_ID_REGEX = /^[a-zA-Z0-9-]{3,50}$/;

function validateStoreId(id: unknown): id is string {
  return typeof id === 'string' && STORE_ID_REGEX.test(id);
}

function validateContactMethod(
  method: unknown,
): method is 'whatsapp' | 'email' | 'none' {
  return method === 'whatsapp' || method === 'email' || method === 'none';
}

function kvKey(storeId: string): string {
  return `store:config:${storeId}`;
}

// ---------------------------------------------------------------------------
// GET  /api/store?store={storeId}
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

    const config = await kv.get<StoreConfig>(kvKey(storeId));

    if (!config) {
      return Response.json(
        { ok: false, error: `No configuration found for store "${storeId}".` },
        { status: 404 },
      );
    }

    return Response.json({ ok: true, config });
  } catch {
    return Response.json(
      { ok: false, error: 'Failed to fetch store configuration.' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST  /api/store   — Create or update a store config
// ---------------------------------------------------------------------------

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as Partial<StoreConfig>;

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

    if (!body.storeName || typeof body.storeName !== 'string' || body.storeName.trim().length === 0) {
      return Response.json(
        { ok: false, error: 'storeName is required.' },
        { status: 400 },
      );
    }

    if (body.contactMethod !== undefined && !validateContactMethod(body.contactMethod)) {
      return Response.json(
        { ok: false, error: 'contactMethod must be "whatsapp", "email", or "none".' },
        { status: 400 },
      );
    }

    if (
      body.accentColor !== undefined &&
      body.accentColor !== '' &&
      !/^#[0-9a-fA-F]{6}$/.test(body.accentColor)
    ) {
      return Response.json(
        { ok: false, error: 'accentColor must be a valid hex color (e.g. #C9A96E).' },
        { status: 400 },
      );
    }

    // ── Build the config ──────────────────────────────────────────────────
    const now = new Date().toISOString();
    const existing = await kv.get<StoreConfig>(kvKey(body.storeId));

    const config: StoreConfig = {
      storeId: body.storeId,
      storeName: body.storeName.trim(),
      accentColor: body.accentColor || undefined,
      allowedFrameIds:
        Array.isArray(body.allowedFrameIds) && body.allowedFrameIds.length > 0
          ? body.allowedFrameIds
          : undefined,
      showPD: body.showPD === true,
      contactMethod: body.contactMethod ?? 'none',
      contactValue: body.contactValue?.trim() || undefined,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await kv.set(kvKey(config.storeId), JSON.stringify(config));

    return Response.json({ ok: true, config });
  } catch {
    return Response.json(
      { ok: false, error: 'Failed to save store configuration.' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE  /api/store?store={storeId}
// ---------------------------------------------------------------------------

export async function DELETE(req: Request): Promise<Response> {
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

    const existing = await kv.get<StoreConfig>(kvKey(storeId));

    if (!existing) {
      return Response.json(
        { ok: false, error: `No configuration found for store "${storeId}".` },
        { status: 404 },
      );
    }

    await kv.del(kvKey(storeId));

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { ok: false, error: 'Failed to delete store configuration.' },
      { status: 500 },
    );
  }
}
