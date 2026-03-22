'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import { FramePreview } from '@/components/frames/FramePreview';
import { GLASSES_COLLECTION } from '@/lib/glasses-data';

// ── Filter config ─────────────────────────────────────────────────────────────

const FILTER_PILLS = [
  { label: 'All',        value: 'all'        },
  { label: 'Round',      value: 'round'      },
  { label: 'Rectangle',  value: 'rectangle'  },
  { label: 'Aviator',    value: 'aviator'    },
  { label: 'Cat-Eye',    value: 'cat-eye'    },
  { label: 'Sport Wrap', value: 'sport-wrap' },
];

// Deterministic "tries" count from frame index
function triesLabel(idx: number): string {
  const base = 800 + idx * 137;
  if (base >= 1000) return `${(base / 1000).toFixed(1)}k tries`;
  return `${base} tries`;
}

// ── Frame card ────────────────────────────────────────────────────────────────

function FrameCard({ frame, idx }: { frame: typeof GLASSES_COLLECTION[0]; idx: number }) {
  return (
    <div
      className="bg-cream-50 border border-cream-400 overflow-hidden cursor-pointer hover:border-gold-500 transition-colors group"
      style={{ borderRadius: 2 }}
    >
      {/* Canvas preview */}
      <div className="bg-cream-100 border-b border-cream-400 flex items-center justify-center p-4" style={{ height: 120 }}>
        <FramePreview
          frameId={frame.id}
          frameColor={frame.color}
          width={200}
          height={88}
        />
        {frame.styleTag === 'FEATURED' && (
          <span
            className="absolute top-2 left-2 text-[9px] font-sans font-semibold uppercase tracking-[0.1em] px-2 py-0.5"
            style={{ backgroundColor: '#C9A96E', color: '#1A1612', borderRadius: 2 }}
          >
            Featured
          </span>
        )}
      </div>

      {/* Card content */}
      <div className="p-3">
        <p
          className="text-[9px] font-sans font-semibold uppercase tracking-[0.14em] mb-0.5"
          style={{ color: '#C9A96E' }}
        >
          {frame.styleTag}
        </p>
        <h3 className="font-serif text-base font-semibold text-ink-900 leading-tight truncate mb-0.5">
          {frame.name}
        </h3>
        <p className="text-[10px] font-sans text-ink-500 mb-2">{frame.style}</p>

        <div className="flex items-center justify-between">
          <span className="text-xs font-sans text-ink-300">{triesLabel(idx)}</span>
          <Link
            href="/trydemo"
            className="text-[10px] font-sans font-semibold uppercase tracking-[0.08em] no-underline transition-colors"
            style={{ color: '#C9A96E' }}
          >
            Try →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <span className="text-4xl mb-4" role="img" aria-label="glasses">👓</span>
      <p className="font-serif text-xl font-semibold text-ink-900 mb-1">No frames found</p>
      <p className="text-sm font-sans text-ink-500 mb-6">
        Try adjusting your search or filter.
      </p>
      <button
        onClick={onClear}
        className="font-sans text-xs font-semibold uppercase tracking-[0.08em] px-4 py-2
                   bg-ink-900 text-cream-50 transition-colors hover:opacity-90"
        style={{ borderRadius: 2 }}
      >
        Clear Filters
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FramesPage() {
  const [search, setSearch]             = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy]             = useState('name-asc');

  const filtered = useMemo(() => {
    return GLASSES_COLLECTION
      .filter(f => activeFilter === 'all' || f.style.toLowerCase().replace(/\s+/g, '-') === activeFilter)
      .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'name-asc')  return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        return 0;
      });
  }, [search, activeFilter, sortBy]);

  function clearFilters() {
    setSearch('');
    setActiveFilter('all');
    setSortBy('name-asc');
  }

  return (
    <div className="flex h-screen bg-cream-100">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar pageTitle="Frame Catalog" />

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">

          {/* Header row */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-semibold text-ink-900 leading-none">
                Frame Catalog
              </h1>
              <span
                className="text-xs font-sans font-semibold text-ink-500 px-2 py-0.5 bg-cream-200"
                style={{ borderRadius: 2 }}
              >
                {filtered.length}
              </span>
            </div>

            <button
              onClick={() => alert('Upload coming soon')}
              className="font-sans text-sm font-semibold text-cream-50 bg-ink-900 px-4 py-2
                         hover:opacity-90 transition-opacity flex-shrink-0"
              style={{ borderRadius: 2 }}
            >
              + Upload Frame
            </button>
          </div>

          {/* Search + sort bar */}
          <div className="px-6 pb-4 flex gap-3 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search frames…"
                className="w-full bg-cream-50 border border-cream-400 text-ink-900 text-sm font-sans
                           pl-9 pr-3 py-2 outline-none focus:border-ink-900 transition-colors
                           placeholder:text-ink-300"
                style={{ borderRadius: 2 }}
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-cream-50 border border-cream-400 text-ink-900 text-sm font-sans
                         px-3 py-2 outline-none focus:border-ink-900 transition-colors cursor-pointer"
              style={{ borderRadius: 2 }}
            >
              <option value="name-asc">A–Z</option>
              <option value="name-desc">Z–A</option>
            </select>

            {/* Filter icon */}
            <button
              className="bg-cream-50 border border-cream-400 text-ink-500 p-2
                         hover:border-ink-900 transition-colors flex-shrink-0"
              style={{ borderRadius: 2 }}
              aria-label="Filter options"
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>

          {/* Filter pills */}
          <div className="px-6 pb-4 flex gap-2 flex-wrap">
            {FILTER_PILLS.map(pill => {
              const isActive = activeFilter === pill.value;
              return (
                <button
                  key={pill.value}
                  onClick={() => setActiveFilter(pill.value)}
                  className={[
                    'text-xs font-sans font-semibold uppercase tracking-[0.08em] px-3 py-1.5 transition-colors',
                    isActive
                      ? 'bg-ink-900 text-cream-50 border border-ink-900'
                      : 'bg-cream-50 border border-cream-400 text-ink-500 hover:border-ink-900',
                  ].join(' ')}
                  style={{ borderRadius: 2 }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Frame grid or empty state */}
          {filtered.length === 0 ? (
            <EmptyState onClear={clearFilters} />
          ) : (
            <div className="px-6 pb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((frame, idx) => (
                <FrameCard key={frame.id} frame={frame} idx={idx} />
              ))}
            </div>
          )}

        </main>

        <BottomNav />
      </div>
    </div>
  );
}
