import { kv } from '@vercel/kv';

interface SessionPayload {
  store?: string;
  faceShape?: string;
  framesTried?: string[];
  duration?: number;
  pd?: number | null;
  comparedFrames?: string[];
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as SessionPayload;
    const { store, faceShape, framesTried, duration, pd, comparedFrames } = body;

    const session = {
      store: store || 'default',
      faceShape: faceShape || null,
      framesTried: framesTried || [],
      duration: duration || 0,
      pd: pd ?? null,
      comparedFrames: comparedFrames || [],
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
    };

    const key = `sessions:${session.store}`;
    await kv.lpush(key, JSON.stringify(session));
    await kv.ltrim(key, 0, 499); // keep last 500 sessions per store

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: 'Failed to save session' }, { status: 500 });
  }
}
