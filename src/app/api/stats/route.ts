import { kv } from '@vercel/kv';

interface Session {
  store: string;
  faceShape: string | null;
  framesTried: string[];
  duration: number;
  pd: number | null;
  comparedFrames: string[];
  timestamp: number;
  date: string;
}

function getTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDuration(secs: number): string {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const store = searchParams.get('store') || 'default';

    const raw = await kv.lrange(`sessions:${store}`, 0, 499);
    const sessions: Session[] = raw.map((s) =>
      typeof s === 'string' ? (JSON.parse(s) as Session) : (s as Session),
    );

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const todaySessions = sessions.filter((s) => s.date === today).length;
    const weekSessions = sessions.filter((s) => s.timestamp > weekAgo).length;

    // Top frame by try count
    const frameCounts: Record<string, number> = {};
    sessions.forEach((s) => {
      s.framesTried?.forEach((f) => {
        frameCounts[f] = (frameCounts[f] || 0) + 1;
      });
    });
    const topFrame =
      Object.entries(frameCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No data';

    // Face shape breakdown
    const shapes = ['oval', 'round', 'square', 'heart', 'oblong'] as const;
    const shapeCounts: Record<string, number> = Object.fromEntries(
      shapes.map((s) => [s, 0]),
    );
    sessions.forEach((s) => {
      const shape = s.faceShape?.toLowerCase();
      if (shape && shape in shapeCounts) shapeCounts[shape]++;
    });
    const total = sessions.length || 1;
    const shapeBreakdown = Object.fromEntries(
      shapes.map((s) => [s, Math.round((shapeCounts[s] / total) * 100)]),
    );
    const topShape = [...shapes].sort((a, b) => shapeCounts[b] - shapeCounts[a])[0];

    // Recent sessions (last 8)
    const recentSessions = sessions.slice(0, 8).map((s) => ({
      timeAgo: getTimeAgo(s.timestamp),
      faceShape: s.faceShape || 'Unknown',
      framesTried: s.framesTried?.length || 0,
      duration: formatDuration(s.duration),
    }));

    // PD distribution across buckets
    const pdBuckets = { '55-60': 0, '60-65': 0, '65-70': 0, '70+': 0 } as Record<string, number>;
    let pdCount = 0;
    sessions.forEach((s) => {
      const pd = s.pd;
      if (pd == null) return;
      pdCount++;
      if (pd < 60) pdBuckets['55-60']++;
      else if (pd < 65) pdBuckets['60-65']++;
      else if (pd < 70) pdBuckets['65-70']++;
      else pdBuckets['70+']++;
    });
    const pdDistribution = Object.fromEntries(
      Object.entries(pdBuckets).map(([k, v]) => [k, pdCount > 0 ? Math.round((v / pdCount) * 100) : 0]),
    );

    // Most compared frame pairs — find which frame IDs appear together most often
    const pairCounts: Record<string, number> = {};
    sessions.forEach((s) => {
      const frames = s.comparedFrames ?? [];
      if (frames.length < 2) return;
      // Generate all unique pairs from the compared frames
      for (let i = 0; i < frames.length; i++) {
        for (let j = i + 1; j < frames.length; j++) {
          const pair = [frames[i], frames[j]].sort().join(' + ');
          pairCounts[pair] = (pairCounts[pair] || 0) + 1;
        }
      }
    });
    const mostComparedPairs = Object.entries(pairCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pair, count]) => ({ pair, count }));

    return Response.json({
      todaySessions,
      weekSessions,
      topFrame,
      topShape,
      shapeBreakdown,
      recentSessions,
      totalSessions: sessions.length,
      pdDistribution,
      pdCount,
      mostComparedPairs,
    });
  } catch {
    return Response.json(
      { error: 'Failed to load stats' },
      { status: 500 },
    );
  }
}
