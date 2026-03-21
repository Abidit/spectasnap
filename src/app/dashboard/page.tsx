'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Download, Glasses } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';

// ─── Constants ────────────────────────────────────────────────────────────────

const CORRECT_PIN = '1234';
const STORE_NAME = 'Flagship Store';

// ─── Mock data (static, spec-defined) ─────────────────────────────────────────

const FACE_SHAPE_DATA = [
  { label: 'Oval',    pct: 38 },
  { label: 'Round',   pct: 24 },
  { label: 'Square',  pct: 18 },
  { label: 'Heart',   pct: 12 },
  { label: 'Oblong',  pct: 8  },
];

const TOP_FRAMES_DATA = [
  { name: "Avenue '24",    trend: '+14%', positive: true,  neutral: false },
  { name: 'Riviera Gold',  trend: '+8%',  positive: true,  neutral: false },
  { name: 'Oxford Noir',   trend: 'Stable', positive: false, neutral: true },
  { name: 'Parisian Mist', trend: '-2%',  positive: false, neutral: false },
];

const RECENT_SESSIONS = [
  { shape: 'Oval',    hash: '0x4E...D921', frames: 8,  duration: '2m 14s', timeAgo: '2 min ago'  },
  { shape: 'Round',   hash: '0x8A...F104', frames: 3,  duration: '0m 45s', timeAgo: '5 min ago'  },
  { shape: 'Oblong',  hash: '0x22...B330', frames: 12, duration: '4m 02s', timeAgo: '12 min ago' },
  { shape: 'Square',  hash: '0xFD...0021', frames: 5,  duration: '1m 30s', timeAgo: '18 min ago' },
  { shape: 'Heart',   hash: '0xCC...8891', frames: 2,  duration: '0m 22s', timeAgo: '24 min ago' },
  { shape: 'Oval',    hash: '0x91...A223', frames: 14, duration: '5m 55s', timeAgo: '29 min ago' },
  { shape: 'Oval',    hash: '0x44...C210', frames: 6,  duration: '2m 10s', timeAgo: '35 min ago' },
  { shape: 'Round',   hash: '0xBB...E882', frames: 1,  duration: '0m 12s', timeAgo: '41 min ago' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  delta,
  sub,
}: {
  label: string;
  value: string;
  delta?: string;
  sub?: string;
}) {
  return (
    <div
      className="bg-cream-50 border border-cream-400 p-5"
      style={{ borderRadius: 2 }}
    >
      <p className="text-[10px] font-sans font-semibold tracking-[0.1em] uppercase text-ink-300 mb-2">
        {label}
      </p>
      <p
        className="font-serif text-5xl text-ink-900 leading-none"
        style={{ fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)' }}
      >
        {value}
      </p>
      {delta && (
        <p className="text-xs text-emerald-600 mt-1 font-sans">{delta}</p>
      )}
      {sub && !delta && (
        <p className="text-xs text-ink-300 mt-1 font-sans">{sub}</p>
      )}
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
      <div className="flex-1 h-1.5 bg-cream-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-sm font-sans text-ink-500 w-8 text-right flex-shrink-0">{pct}%</span>
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
    // Only accept single digit
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
          setPin(['', '', '', '']);
          setError(false);
          inputRefs[0].current?.focus();
        }, 600);
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        const newPin = [...pin];
        newPin[index - 1] = '';
        setPin(newPin);
        inputRefs[index - 1].current?.focus();
      }
    }
  }

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <p className="font-serif text-2xl font-semibold text-ink-900">
            Specta<em style={{ color: '#C9A96E' }}>Snap</em>
          </p>
        </div>

        {/* Card */}
        <div
          className="bg-cream-50 border border-cream-400 p-10 text-center"
          style={{ borderRadius: 2 }}
        >
          <h2
            className="font-serif text-2xl font-semibold text-ink-900 mt-0"
            style={{ fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)', fontStyle: 'italic' }}
          >
            Store Access
          </h2>
          <p className="text-sm font-sans text-ink-500 mt-2">Enter your 4-digit PIN</p>

          {/* OTP boxes */}
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
                className="text-center font-serif text-3xl text-ink-900 outline-none
                           transition-colors duration-150"
                style={{
                  width: 56,
                  height: 64,
                  borderRadius: 2,
                  backgroundColor: error ? 'rgba(239,68,68,0.06)' : pin[i] ? 'rgba(201,169,110,0.08)' : '#F5F0E8',
                  border: error
                    ? '1px solid #f87171'
                    : pin[i]
                    ? '1px solid #C9A96E'
                    : '1px solid #DDD8CE',
                  fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)',
                }}
                aria-label={`PIN digit ${i + 1}`}
              />
            ))}
          </motion.div>

          {error && (
            <p className="text-xs font-sans text-red-400 mt-3 transition-opacity">
              Incorrect PIN. Try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard body ───────────────────────────────────────────────────────────

function DashboardContent() {
  const router = useRouter();

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      {/* Page header: "Go Live" button */}
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
        <button
          onClick={() => router.push('/trydemo')}
          className="px-5 py-2.5 font-sans font-semibold text-sm tracking-wide
                     hover:opacity-90 active:scale-[0.98] transition-all"
          style={{
            borderRadius: 2,
            backgroundColor: '#C9A96E',
            color: '#1A1612',
            minHeight: 40,
          }}
        >
          Go Live →
        </button>
      </div>

      {/* Stats row — 4 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Sessions Today"
          value="142"
          delta="↑ 12% vs yesterday"
        />
        <StatCard
          label="Sessions This Week"
          value="1,084"
          delta="↑ 4% vs last week"
        />
        <StatCard
          label="Most Tried"
          value="Avenue"
          sub="412 interactions"
        />
        <StatCard
          label="Top Face Shape"
          value="Oval"
          sub="38% of users"
        />
      </div>

      {/* Two-column: Face Shape + Top Frames */}
      <div className="grid grid-cols-5 gap-6 mb-6">
        {/* Left — Face Shape Distribution (col-span-3) */}
        <div
          className="col-span-5 md:col-span-3 bg-cream-50 border border-cream-400 p-6"
          style={{ borderRadius: 2 }}
        >
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
            <button
              className="text-ink-300 hover:text-ink-500 transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-4 mt-6">
            {FACE_SHAPE_DATA.map((item, i) => (
              <FaceShapeBar
                key={item.label}
                label={item.label}
                pct={item.pct}
                delay={i * 80}
              />
            ))}
          </div>
        </div>

        {/* Right — Top Frames This Week (col-span-2) */}
        <div
          className="col-span-5 md:col-span-2 bg-cream-50 border border-cream-400 p-6"
          style={{ borderRadius: 2 }}
        >
          <h2
            className="font-serif text-xl text-ink-900 mb-4"
            style={{ fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)', fontStyle: 'italic' }}
          >
            Top Frames This Week
          </h2>

          {/* Table header */}
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-cream-400">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-ink-300">
              Frame Name
            </span>
            <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-ink-300">
              Trend
            </span>
          </div>

          {TOP_FRAMES_DATA.map((f) => (
            <div
              key={f.name}
              className="flex justify-between items-center py-3 border-b border-cream-400 last:border-0"
            >
              <div className="flex items-center gap-2">
                <Glasses size={14} className="text-ink-300 flex-shrink-0" />
                <span
                  className="font-serif italic text-base text-ink-900"
                  style={{ fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)' }}
                >
                  {f.name}
                </span>
              </div>
              <span
                className="text-sm font-sans font-medium"
                style={{
                  color: f.neutral ? '#9A9490' : f.positive ? '#059669' : '#ef4444',
                }}
              >
                {f.trend}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions — full width */}
      <div
        className="bg-cream-50 border border-cream-400"
        style={{ borderRadius: 2 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-0">
          <div>
            <h2
              className="font-serif text-xl text-ink-900"
              style={{ fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)', fontStyle: 'italic' }}
            >
              Recent Sessions
            </h2>
            <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-ink-300 mt-0.5">
              Live Stream of Customer Interactions
            </p>
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 border border-cream-400 text-xs font-sans
                       font-semibold text-ink-500 hover:border-ink-900 hover:text-ink-900 transition-colors"
            style={{ borderRadius: 2 }}
          >
            <Download size={12} />
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-cream-400">
                {['Face Shape', 'User Hash', 'Frames Viewed', 'Duration', 'Time Ago'].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-[10px] font-sans font-semibold uppercase
                               tracking-[0.1em] text-ink-300 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_SESSIONS.map((s, i) => (
                <tr
                  key={i}
                  className="border-b border-cream-100 hover:bg-cream-100 transition-colors"
                >
                  {/* Face shape */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full bg-cream-200 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-sans text-ink-900">{s.shape}</span>
                    </div>
                  </td>
                  {/* User hash */}
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-ink-300">{s.hash}</span>
                  </td>
                  {/* Frames viewed */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-sans text-ink-900">{s.frames}</span>
                  </td>
                  {/* Duration */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-sans text-ink-900">{s.duration}</span>
                  </td>
                  {/* Time ago */}
                  <td className="px-6 py-4">
                    <span className="text-xs font-sans text-ink-300">{s.timeAgo}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-ink-300 text-[10px] font-sans tracking-wide py-6">
        SpectaSnap AR © 2026 · Analytics refresh every 30s
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = useCallback(() => {
    setUnlocked(true);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {!unlocked ? (
        <motion.div
          key="pin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
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
          {/* Sidebar */}
          <Sidebar />

          {/* Main area */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <TopBar pageTitle="Dashboard" storeName={STORE_NAME} />
            <main className="flex-1 overflow-y-auto">
              <DashboardContent />
            </main>
          </div>

          {/* Mobile bottom nav */}
          <BottomNav />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
