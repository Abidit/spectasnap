'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { MoreHorizontal, Download, Glasses, RefreshCw } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';

// ─── Constants ────────────────────────────────────────────────────────────────

const CORRECT_PIN = '1234';
const REFRESH_INTERVAL = 30_000; // 30 seconds

// ─── API types (mirrors /api/stats response) ──────────────────────────────────

interface RecentSession {
  timeAgo: string;
  faceShape: string;
  framesTried: number;
  duration: string;
}

interface StatsData {
  todaySessions: number;
  weekSessions: number;
  topFrame: string;
  topShape: string;
  shapeBreakdown: Record<string, number>;
  recentSessions: RecentSession[];
  totalSessions: number;
  conversionRate: number;
  avgDuration: number;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-cream-200 ${className ?? ''}`}
      style={{ borderRadius: 2 }}
    />
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-cream-50 border border-cream-400 p-5" style={{ borderRadius: 2 }}>
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className="h-10 w-16 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, delta, sub }: {
  label: string;
  value: string;
  delta?: string;
  sub?: string;
}) {
  return (
    <div className="bg-cream-50 border border-cream-400 p-5" style={{ borderRadius: 2 }}>
      <p className="text-[10px] font-sans font-semibold tracking-[0.1em] uppercase text-ink-300 mb-2">
        {label}
      </p>
      <p
        className="font-serif text-5xl text-ink-900 leading-none"
        style={{ fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)' }}
      >
        {value}
      </p>
      {delta && <p className="text-xs text-emerald-600 mt-1 font-sans">{delta}</p>}
      {sub && !delta && <p className="text-xs text-ink-300 mt-1 font-sans">{sub}</p>}
    </div>
  );
}

function FaceShapeBar({ label, pct, delay }: { label: string; pct: number; delay: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), delay);
    return () => clearTimeout(timer);
  }, [pct, delay]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-sans text-ink-900 w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-cream-200 overflow-hidden" style={{ borderRadius: 2 }}>
        <div
          className="h-full bg-gold-500 transition-all duration-700 ease-out"
          style={{ width: `${width}%`, borderRadius: 2 }}
        />
      </div>
      <span className="text-sm font-sans text-ink-500 w-8 text-right flex-shrink-0">{pct}%</span>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onGoLive }: { onGoLive: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <div
        className="w-14 h-14 flex items-center justify-center bg-cream-200 border border-cream-400 mb-5"
        style={{ borderRadius: 2 }}
      >
        <Glasses size={22} className="text-ink-300" />
      </div>
      <p
        className="font-serif italic text-xl text-ink-500 mb-2"
        style={{ fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)' }}
      >
        No sessions yet
      </p>
      <p className="text-sm font-sans text-ink-300 mt-1 max-w-xs leading-relaxed">
        Go live in your store to start collecting data.
      </p>
      <button
        onClick={onGoLive}
        className="mt-6 px-6 py-2.5 font-sans font-semibold text-sm hover:opacity-90 transition-opacity"
        style={{ borderRadius: 2, backgroundColor: '#C9A96E', color: '#1A1612' }}
      >
        Go Live →
      </button>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <p className="text-sm font-sans text-ink-500">Could not load data. Refresh to retry.</p>
      <button
        onClick={onRetry}
        className="mt-4 flex items-center gap-2 px-4 py-2 border border-cream-400 font-sans font-semibold text-xs text-ink-900 hover:border-ink-900 transition-colors"
        style={{ borderRadius: 2 }}
      >
        <RefreshCw size={12} />
        Retry
      </button>
    </div>
  );
}

// ─── PIN Gate ─────────────────────────────────────────────────────────────────

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  function handleInput(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setError(false);

    if (digit && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (digit && index === 3) {
      const full = [...newPin.slice(0, 3), digit].join('');
      if (full === CORRECT_PIN) {
        onUnlock();
      } else {
        setShake(true);
        setError(true);
        setTimeout(() => {
          setShake(false);
          setError(false);
          setPin(['', '', '', '']);
          inputRefs[0].current?.focus();
        }, 600);
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const newPin = [...pin];
      newPin[index - 1] = '';
      setPin(newPin);
      inputRefs[index - 1].current?.focus();
    }
  }

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-serif text-2xl font-semibold text-ink-900">
            Specta<em style={{ color: '#C9A96E' }}>Snap</em>
          </p>
        </div>

        <div className="bg-cream-50 border border-cream-400 p-10 text-center" style={{ borderRadius: 2 }}>
          <h2
            className="font-serif text-2xl font-semibold text-ink-900"
            style={{ fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)', fontStyle: 'italic' }}
          >
            Store Access
          </h2>
          <p className="text-sm font-sans text-ink-500 mt-2">Enter your 4-digit PIN</p>

          <motion.div
            className="flex gap-3 justify-center mt-8"
            animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {[0, 1, 2, 3].map((i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={pin[i]}
                onChange={(e) => handleInput(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={(e) => e.target.select()}
                autoFocus={i === 0}
                className="text-center font-serif text-3xl text-ink-900 outline-none transition-colors duration-150"
                style={{
                  width: 56,
                  height: 64,
                  borderRadius: 2,
                  backgroundColor: error ? 'rgba(239,68,68,0.06)' : pin[i] ? 'rgba(201,169,110,0.08)' : '#F5F0E8',
                  border: error ? '1px solid #f87171' : pin[i] ? '1px solid #C9A96E' : '1px solid #DDD8CE',
                  fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)',
                }}
                aria-label={`PIN digit ${i + 1}`}
              />
            ))}
          </motion.div>

          {error && (
            <p className="text-xs font-sans text-red-400 mt-3">Incorrect PIN. Try again.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard body ───────────────────────────────────────────────────────────

function DashboardContent({ storeParam }: { storeParam: string }) {
  const router = useRouter();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/stats?store=${encodeURIComponent(storeParam)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as StatsData;
      setData(json);
      setHasError(false);
      setLastRefreshed(new Date());
    } catch {
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, [storeParam]);

  // Initial fetch + auto-refresh
  useEffect(() => {
    void fetchStats();
    intervalRef.current = setInterval(() => void fetchStats(), REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchStats]);

  const isEmpty = !loading && !hasError && data?.totalSessions === 0;
  const storeName = storeParam !== 'default' ? storeParam : 'Flagship Store';

  // Shape breakdown → sorted array
  const shapeData = data?.shapeBreakdown
    ? Object.entries(data.shapeBreakdown)
        .map(([label, pct]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), pct }))
        .sort((a, b) => b.pct - a.pct)
    : [];

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-sans font-semibold tracking-[0.14em] uppercase text-ink-300">
            Overview
          </p>
          <h1
            className="font-serif text-3xl font-semibold text-ink-900 leading-tight"
            style={{ fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)', fontStyle: 'italic' }}
          >
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="hidden sm:block text-[10px] font-sans text-ink-300">
              Updated {lastRefreshed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => router.push(`/trydemo?store=${encodeURIComponent(storeParam)}`)}
            className="px-5 py-2.5 font-sans font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
            style={{ borderRadius: 2, backgroundColor: '#C9A96E', color: '#1A1612', minHeight: 40 }}
          >
            Go Live →
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[0, 1, 2, 3].map(i => <StatCardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-5 gap-6 mb-6">
            <div className="col-span-5 md:col-span-3 bg-cream-50 border border-cream-400 p-6" style={{ borderRadius: 2 }}>
              <Skeleton className="h-5 w-48 mb-6" />
              {[0, 1, 2, 3, 4].map(i => <Skeleton key={i} className="h-3 w-full mb-4" />)}
            </div>
            <div className="col-span-5 md:col-span-2 bg-cream-50 border border-cream-400 p-6" style={{ borderRadius: 2 }}>
              <Skeleton className="h-5 w-40 mb-4" />
              {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full mb-2" />)}
            </div>
          </div>
        </>
      )}

      {/* Error state */}
      {!loading && hasError && <ErrorState onRetry={() => void fetchStats()} />}

      {/* Empty state */}
      {isEmpty && (
        <EmptyState onGoLive={() => router.push(`/trydemo?store=${encodeURIComponent(storeParam)}`)} />
      )}

      {/* Real data */}
      {!loading && !hasError && data && data.totalSessions > 0 && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Sessions Today"
              value={data.todaySessions.toLocaleString()}
            />
            <StatCard
              label="Sessions This Week"
              value={data.weekSessions.toLocaleString()}
            />
            <StatCard
              label="Most Tried"
              value={data.topFrame}
              sub="Top frame this week"
            />
            <StatCard
              label="Top Face Shape"
              value={data.topShape.charAt(0).toUpperCase() + data.topShape.slice(1)}
              sub={`${data.shapeBreakdown[data.topShape.toLowerCase()] ?? 0}% of users`}
            />
          </div>

          {/* Face Shape + Top Frames */}
          <div className="grid grid-cols-5 gap-6 mb-6">
            <div className="col-span-5 md:col-span-3 bg-cream-50 border border-cream-400 p-6" style={{ borderRadius: 2 }}>
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h2
                    className="font-serif text-xl text-ink-900"
                    style={{ fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)', fontStyle: 'italic' }}
                  >
                    Face Shape Distribution
                  </h2>
                  <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-300 mt-0.5">
                    Historical Biometric Data
                  </p>
                </div>
                <button className="text-ink-300 hover:text-ink-500 transition-colors" aria-label="More options">
                  <MoreHorizontal size={18} />
                </button>
              </div>
              <div className="flex flex-col gap-4 mt-6">
                {shapeData.map((item, i) => (
                  <FaceShapeBar key={item.label} label={item.label} pct={item.pct} delay={i * 80} />
                ))}
              </div>
            </div>

            <div className="col-span-5 md:col-span-2 bg-cream-50 border border-cream-400 p-6" style={{ borderRadius: 2 }}>
              <h2
                className="font-serif text-xl text-ink-900 mb-4"
                style={{ fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)', fontStyle: 'italic' }}
              >
                Top Frames This Week
              </h2>
              <div>
                <div className="flex justify-between pb-2 border-b border-cream-400">
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-ink-300">Frame Name</span>
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-ink-300">Trend</span>
                </div>
                {([
                  { name: data.topFrame, abbrev: data.topFrame.slice(0, 2).toUpperCase(), trend: '+14%', trendColor: '#16a34a' },
                  { name: 'Riviera Gold', abbrev: 'RG', trend: '+8%', trendColor: '#16a34a' },
                  { name: 'Oxford Noir', abbrev: 'ON', trend: 'Stable', trendColor: '#9A9490' },
                  { name: 'Parisian Mist', abbrev: 'PM', trend: '-2%', trendColor: '#dc2626' },
                ] as { name: string; abbrev: string; trend: string; trendColor: string }[]).map((f) => (
                  <div key={f.name} className="flex items-center justify-between py-3 border-b border-cream-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 bg-cream-200 flex items-center justify-center flex-shrink-0"
                        style={{ borderRadius: 2 }}
                      >
                        <span className="text-[9px] font-sans font-semibold text-ink-500 uppercase">{f.abbrev}</span>
                      </div>
                      <span
                        className="font-serif text-sm text-ink-900 italic"
                        style={{ fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)' }}
                      >
                        {f.name}
                      </span>
                    </div>
                    <span style={{ color: f.trendColor, fontSize: 12 }} className="font-sans font-semibold">
                      {f.trend}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-cream-50 border border-cream-400" style={{ borderRadius: 2 }}>
            <div className="flex items-start justify-between p-6 pb-0">
              <div>
                <h2
                  className="font-serif text-xl text-ink-900"
                  style={{ fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)', fontStyle: 'italic' }}
                >
                  Recent Sessions
                </h2>
                <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-ink-300 mt-0.5">
                  Live Stream · {storeName}
                </p>
              </div>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 border border-cream-400 text-xs font-sans font-semibold text-ink-500 hover:border-ink-900 hover:text-ink-900 transition-colors"
                style={{ borderRadius: 2 }}
              >
                <Download size={12} />
                Export CSV
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b border-cream-400">
                    {['Face Shape', 'User Hash', 'Frames Viewed', 'Duration', 'Time Ago'].map((col) => (
                      <th key={col} className="px-6 py-3 text-left text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-ink-300 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentSessions.map((s, i) => {
                    const hashSuffix = (((i + 1) * 0x2021 + 0x4E00) % 0x10000).toString(16).toUpperCase().padStart(4, '0');
                    const userHash = `0x4E...${hashSuffix}`;
                    return (
                      <tr key={i} className="border-b border-cream-100 hover:bg-cream-100 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-cream-200 flex-shrink-0" aria-hidden="true" />
                            <span className="text-sm font-sans text-ink-900">{s.faceShape}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono text-ink-300">{userHash}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-sans text-ink-900">{s.framesTried}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-sans text-ink-900">{s.duration}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-sans text-ink-300">{s.timeAgo}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <p className="text-center text-ink-300 text-[10px] font-sans tracking-wide py-6">
        SpectaSnap AR © 2026 · Analytics refresh every 30s
      </p>
    </div>
  );
}

// ─── Wrapper with searchParams ────────────────────────────────────────────────

function DashboardWithParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const storeParam = searchParams.get('store') ?? 'default';
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = useCallback(() => setUnlocked(true), []);
  const storeName = storeParam !== 'default' ? storeParam : 'Flagship Store';

  return (
    <AnimatePresence mode="wait">
      {!unlocked ? (
        <motion.div key="pin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <PinGate onUnlock={handleUnlock} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="flex h-screen overflow-hidden bg-cream-100"
        >
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <TopBar pageTitle="Dashboard" storeName={storeName} />
            <main className="flex-1 overflow-y-auto">
              <DashboardContent storeParam={storeParam} />
            </main>
          </div>
          <BottomNav />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardWithParams />
    </Suspense>
  );
}
