'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// ─── Seed data (generated once at module level) ──────────────────────────────

const FRAME_NAMES = [
  'Featured Aviator', 'Featured Round', 'Featured Wayfarer', 'Featured Cat-Eye', 'Featured Wrap',
  'Classic Rectangle', 'Slim Oval', 'Bold Aviator', 'Retro Round', 'Modern Cat-Eye',
];
const FACE_SHAPES = ['Oval', 'Round', 'Square', 'Heart', 'Diamond', 'Oblong'];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 0xffffffff);
  };
}

interface Session {
  id: string;
  timestamp: number;
  frame: string;
  faceShape: string;
  duration: number; // seconds
}

interface Settings {
  storeName: string;
  city: string;
  hours: string;
}

const rng = seededRandom(42);
const SEED_SESSIONS: Session[] = Array.from({ length: 50 }, (_, i) => {
  const daysAgo = Math.floor(rng() * 7);
  const hoursAgo = Math.floor(rng() * 10);
  const ts = Date.now() - (daysAgo * 86400 + hoursAgo * 3600) * 1000 + i * 60000;
  return {
    id: `s${i}`,
    timestamp: ts,
    frame: FRAME_NAMES[Math.floor(rng() * FRAME_NAMES.length)],
    faceShape: FACE_SHAPES[Math.floor(rng() * FACE_SHAPES.length)],
    duration: 45 + Math.floor(rng() * 195),
  };
});

const DEFAULT_SETTINGS: Settings = { storeName: 'Visionary Optics', city: 'New York', hours: 'Mon–Sat 9am–6pm' };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatTimestamp(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function mode(arr: string[]): string {
  const counts: Record<string, number> = {};
  for (const v of arr) counts[v] = (counts[v] ?? 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
}

function isToday(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-brand-panel border border-brand-border p-4" style={{ borderRadius: 2 }}>
      <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-brand-muted mb-1">{label}</p>
      <p className="font-serif text-3xl font-semibold text-brand-text leading-none">{value}</p>
      {sub && <p className="text-brand-muted text-xs font-sans mt-1">{sub}</p>}
    </div>
  );
}

function ShapeBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-sans text-brand-muted w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-brand-secondary" style={{ borderRadius: 2 }}>
        <div
          className="h-2 transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: '#C9A96E', borderRadius: 2 }}
        />
      </div>
      <span className="text-xs font-sans text-brand-muted w-8 text-right flex-shrink-0">{pct}%</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type View = 'pin' | 'dashboard';

const CORRECT_PIN = '1234';

export default function Dashboard() {
  const router = useRouter();
  const [view, setView] = useState<View>('pin');
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  // Seed data used as fallback while real KV data loads
  const [sessions] = useState<Session[]>(() => {
    if (typeof window === 'undefined') return SEED_SESSIONS;
    const raw = localStorage.getItem('spectasnap_dashboard');
    if (raw) return JSON.parse(raw) as Session[];
    localStorage.setItem('spectasnap_dashboard', JSON.stringify(SEED_SESSIONS));
    return SEED_SESSIONS;
  });
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const raw = localStorage.getItem('spectasnap_settings');
    return raw ? (JSON.parse(raw) as Settings) : DEFAULT_SETTINGS;
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Live data from Vercel KV API
  const [liveStats, setLiveStats] = useState<{
    todaySessions: number;
    weekSessions: number;
    topFrame: string;
    topShape: string;
    shapeBreakdown: Record<string, number>;
    recentSessions: { timeAgo: string; faceShape: string; framesTried: number; duration: string }[];
    totalSessions: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(false);

  const fetchStats = useCallback(async () => {
    const store =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('store') || 'default'
        : 'default';
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/stats?store=${store}`);
      const data = (await res.json()) as {
        todaySessions: number;
        weekSessions: number;
        topFrame: string;
        topShape: string;
        shapeBreakdown: Record<string, number>;
        recentSessions: { timeAgo: string; faceShape: string; framesTried: number; duration: string }[];
        totalSessions: number;
        error?: string;
      };
      if (!res.ok || data?.error) throw new Error(data?.error ?? 'Failed');
      setLiveStats(data);
      setStatsError(false);
    } catch {
      setStatsError(true);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch real data when dashboard unlocks; auto-refresh every 30s
  useEffect(() => {
    if (view !== 'dashboard') return;
    void fetchStats();
    const interval = setInterval(() => void fetchStats(), 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  function handleDigit(d: string) {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      if (next === CORRECT_PIN) {
        setView('dashboard');
      } else {
        setShake(true);
        setTimeout(() => { setShake(false); setPin(''); }, 600);
      }
    }
  }

  function saveSettings() {
    localStorage.setItem('spectasnap_settings', JSON.stringify(settings));
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  }

  // Stats — prefer live API data, fall back to seed data
  const total = liveStats?.totalSessions ?? sessions.length;
  const todaySessions = sessions.filter((s) => isToday(s.timestamp));
  const todayCount = liveStats?.todaySessions ?? todaySessions.length;
  const avgDuration = sessions.length > 0
    ? Math.round(sessions.reduce((a, s) => a + s.duration, 0) / sessions.length)
    : 0;
  const mostTriedFrame = liveStats?.topFrame ?? mode(sessions.map((s) => s.frame));

  // Face shape distribution
  const shapeCounts = FACE_SHAPES.map((sh) => ({
    label: sh,
    count: sessions.filter((s) => s.faceShape === sh).length,
  })).sort((a, b) => b.count - a.count);
  const maxShapeCount = shapeCounts[0]?.count ?? 1;

  // Popular frames
  const frameCounts: Record<string, number> = {};
  for (const s of sessions) frameCounts[s.frame] = (frameCounts[s.frame] ?? 0) + 1;
  const popularFrames = Object.entries(frameCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }));

  // Recent sessions (last 10, newest first)
  const recentSessions = [...sessions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

  return (
    <div className="min-h-screen bg-brand-page">
      <AnimatePresence mode="wait">
        {/* ── PIN Gate ─────────────────────────────────────────────────────── */}
        {view === 'pin' && (
          <motion.div
            key="pin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center gap-8 px-6"
          >
            <div className="text-center">
              <p className="font-sans text-xs tracking-[0.2em] uppercase text-brand-muted mb-2">SpectaSnap</p>
              <h1 className="font-serif text-3xl font-semibold text-brand-text">Store Dashboard</h1>
              <p className="text-brand-muted text-sm font-sans mt-2">Enter your PIN to continue</p>
            </div>

            {/* PIN dots */}
            <motion.div
              className="flex gap-3"
              animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-3.5 h-3.5 border border-brand-border"
                  style={{
                    borderRadius: '50%',
                    backgroundColor: i < pin.length ? '#C9A96E' : 'transparent',
                    transition: 'background-color 0.1s',
                  }}
                />
              ))}
            </motion.div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-2" style={{ width: 200 }}>
              {['1','2','3','4','5','6','7','8','9'].map((d) => (
                <button
                  key={d}
                  onClick={() => handleDigit(d)}
                  className="font-sans font-medium text-lg text-brand-text bg-brand-secondary
                             border border-brand-border hover:bg-brand-border transition-colors
                             flex items-center justify-center"
                  style={{ borderRadius: 2, height: 56 }}
                >
                  {d}
                </button>
              ))}
              <div /> {/* spacer */}
              <button
                onClick={() => handleDigit('0')}
                className="font-sans font-medium text-lg text-brand-text bg-brand-secondary
                           border border-brand-border hover:bg-brand-border transition-colors
                           flex items-center justify-center"
                style={{ borderRadius: 2, height: 56 }}
              >
                0
              </button>
              <button
                onClick={() => setPin((p) => p.slice(0, -1))}
                className="font-sans font-medium text-sm text-brand-muted bg-brand-secondary
                           border border-brand-border hover:bg-brand-border transition-colors
                           flex items-center justify-center"
                style={{ borderRadius: 2, height: 56 }}
              >
                ⌫
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Dashboard ────────────────────────────────────────────────────── */}
        {view === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-5xl mx-auto px-5 py-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
              <div>
                <p className="text-[10px] font-sans font-semibold tracking-[0.14em] uppercase text-brand-muted">
                  SpectaSnap
                </p>
                <h1 className="font-serif text-3xl font-semibold text-brand-text leading-tight">Dashboard</h1>
                <p className="text-brand-muted text-sm font-sans mt-0.5">{settings.storeName}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <p className="text-brand-muted text-xs font-sans hidden sm:block">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <button
                  onClick={() => router.push('/trydemo')}
                  className="px-5 py-2.5 font-sans font-semibold text-sm tracking-wide
                             bg-brand-text text-brand-page hover:opacity-90 transition-opacity"
                  style={{ borderRadius: 2 }}
                >
                  Go Live →
                </button>
              </div>
            </div>

            {/* Stat cards */}
            {statsError && (
              <div className="mb-4 px-4 py-2 border border-brand-border text-brand-muted text-xs font-sans" style={{ borderRadius: 2 }}>
                Could not load live data. Showing demo data. Refresh to retry.
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Try-Ons" value={statsLoading ? '…' : String(total)} />
              <StatCard label="Today's Sessions" value={statsLoading ? '…' : String(todayCount)} sub={liveStats ? 'live' : 'demo data'} />
              <StatCard label="Avg Session Time" value={formatDuration(avgDuration)} />
              <StatCard label="Most Tried Frame" value={mostTriedFrame.split(' ').slice(-1)[0]} sub={mostTriedFrame} />
            </div>

            {/* Two-column section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Face Shape Distribution */}
              <div className="bg-brand-panel border border-brand-border p-5" style={{ borderRadius: 2 }}>
                <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-brand-muted mb-4">
                  Face Shape Distribution
                </p>
                <div className="flex flex-col gap-3">
                  {shapeCounts.map((sc) => (
                    <ShapeBar key={sc.label} label={sc.label} count={sc.count} max={maxShapeCount} />
                  ))}
                </div>
              </div>

              {/* Recent Sessions */}
              <div className="bg-brand-panel border border-brand-border p-5" style={{ borderRadius: 2 }}>
                <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-brand-muted mb-4">
                  Recent Sessions
                </p>
                <div className="flex flex-col divide-y divide-brand-border">
                  {recentSessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2 gap-2">
                      <span className="text-brand-muted text-[10px] font-sans flex-shrink-0">
                        {formatTimestamp(s.timestamp)}
                      </span>
                      <span className="text-brand-text text-xs font-sans flex-1 text-center truncate">{s.frame}</span>
                      <span className="text-brand-muted text-[10px] font-sans flex-shrink-0">
                        {formatDuration(s.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Popular Frames Table */}
            <div className="bg-brand-panel border border-brand-border mb-8" style={{ borderRadius: 2 }}>
              <div className="p-5 border-b border-brand-border">
                <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-brand-muted">
                  Popular Frames
                </p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-border">
                    <th className="text-left px-5 py-2.5 text-[10px] font-sans font-semibold tracking-[0.1em] uppercase text-brand-muted">Frame</th>
                    <th className="text-right px-5 py-2.5 text-[10px] font-sans font-semibold tracking-[0.1em] uppercase text-brand-muted">Try-Ons</th>
                    <th className="text-right px-5 py-2.5 text-[10px] font-sans font-semibold tracking-[0.1em] uppercase text-brand-muted hidden sm:table-cell">% Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {popularFrames.map((f, i) => (
                    <tr
                      key={f.name}
                      className="border-b border-brand-border last:border-0"
                      style={{ backgroundColor: i % 2 === 0 ? '#FDFAF4' : '#F5F0E8' }}
                    >
                      <td className="px-5 py-3 text-sm font-sans text-brand-text">{f.name}</td>
                      <td className="px-5 py-3 text-sm font-sans text-brand-text text-right font-semibold">{f.count}</td>
                      <td className="px-5 py-3 text-sm font-sans text-brand-muted text-right hidden sm:table-cell">{f.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Store Settings */}
            <div className="bg-brand-panel border border-brand-border p-5 mb-8" style={{ borderRadius: 2 }}>
              <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-brand-muted mb-4">
                Store Settings
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {([
                  ['Store Name', 'storeName', 'e.g. Visionary Optics'],
                  ['City', 'city', 'e.g. New York'],
                  ['Hours', 'hours', 'e.g. Mon–Sat 9am–6pm'],
                ] as const).map(([label, key, placeholder]) => (
                  <div key={key}>
                    <label className="text-[10px] font-sans font-semibold tracking-[0.1em] uppercase text-brand-muted block mb-1.5">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={settings[key]}
                      placeholder={placeholder}
                      onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                      className="w-full px-3 py-2 bg-brand-page border border-brand-border text-sm font-sans text-brand-text
                                 focus:outline-none focus:border-brand-gold transition-colors"
                      style={{ borderRadius: 2 }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={saveSettings}
                  className="px-5 py-2 font-sans font-semibold text-sm border border-brand-text
                             text-brand-text hover:bg-brand-secondary transition-colors"
                  style={{ borderRadius: 2 }}
                >
                  Save Settings
                </button>
                {settingsSaved && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-sans text-brand-muted"
                  >
                    Saved ✓
                  </motion.span>
                )}
              </div>
            </div>

            <p className="text-center text-brand-muted text-[10px] font-sans tracking-wide pb-4">
              SpectaSnap AR © 2026 · Dashboard data stored locally on this device
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
