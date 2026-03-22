'use client';

import { useState } from 'react';
import { Search, Heart } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';

// ── Frame data ────────────────────────────────────────────────────────────────

interface CatalogFrame {
  id: string;
  name: string;
  tag: string;
  style: string;
  badge: 'TRENDING' | 'NEW ARRIVAL' | 'LIMITED' | null;
  tries: string;
  colors: string[];
  bgColor: string;
}

const CATALOG_FRAMES: CatalogFrame[] = [
  { id: '1', name: 'The Lumiere',    tag: 'ROUND HERITAGE',          style: 'round',      badge: 'TRENDING',    tries: '1.4k', colors: ['#1A1612','#4A3728','#C9A96E','#8B7355','#2C4A6E','#DDD8CE'], bgColor: '#2C2C28'  },
  { id: '2', name: 'The Pilot',      tag: 'AVIATOR CLASSIC',         style: 'aviator',    badge: 'NEW ARRIVAL', tries: '843',  colors: ['#C9A96E','#A8844A','#1A1612','#8B7355','#B8A898'],           bgColor: '#1C1A14'  },
  { id: '3', name: 'The Architect',  tag: 'RECTANGLE MINIMALIST',    style: 'rectangle',  badge: null,          tries: '2.1k', colors: ['#1A1612','#2C2C28','#4A3728','#6B6560','#C9A96E','#3A3530'], bgColor: '#E8E3DA'  },
  { id: '4', name: 'The Diva',       tag: 'CAT-EYE GLAMOUR',         style: 'cat-eye',    badge: null,          tries: '367',  colors: ['#8B2635','#1A1612','#C9A96E','#4A1520','#DDD8CE'],           bgColor: '#1A0A0E'  },
  { id: '5', name: 'The Ghost',      tag: 'WRAP PERFORMANCE',        style: 'sport-wrap', badge: null,          tries: '312',  colors: ['#DDD8CE','#F5F0E8','#9A9490','#6B6560','#1A1612'],           bgColor: '#1C3A2E'  },
  { id: '6', name: 'The Muse',       tag: 'ROUND WIRE',              style: 'round',      badge: 'LIMITED',     tries: '921',  colors: ['#C9A96E','#A8844A','#DDD8CE','#B8A898','#8B7355'],           bgColor: '#F0EAD8'  },
  { id: '7', name: 'The Sovereign',  tag: 'RECTANGLE BOLD',          style: 'rectangle',  badge: null,          tries: '588',  colors: ['#1A1612','#4A3728','#8B7355','#C9A96E'],                     bgColor: '#1E1C18'  },
  { id: '8', name: 'The Falcon',     tag: 'AVIATOR SLIM',            style: 'aviator',    badge: 'TRENDING',    tries: '1.1k', colors: ['#C9A96E','#1A1612','#9A9490','#DDD8CE','#4A3728'],           bgColor: '#0E1A14'  },
  { id: '9', name: 'The Rebel',      tag: 'CAT-EYE RETRO',           style: 'cat-eye',    badge: null,          tries: '430',  colors: ['#8B2635','#C9A96E','#1A1612','#DDD8CE'],                     bgColor: '#F5EFE8'  },
];

// ── Filter config ─────────────────────────────────────────────────────────────

interface FilterPill {
  label: string;
  value: string;
}

const FILTER_PILLS: FilterPill[] = [
  { label: 'All',       value: 'all'        },
  { label: 'Round',     value: 'round'      },
  { label: 'Aviator',   value: 'aviator'    },
  { label: 'Cat-Eye',   value: 'cat-eye'    },
  { label: 'Rectangle', value: 'rectangle'  },
  { label: 'Wrap',      value: 'sport-wrap' },
];

const SORT_OPTIONS = [
  { label: 'Most tried',  value: 'tries-desc' },
  { label: 'Name A–Z',    value: 'name-asc'   },
  { label: 'Name Z–A',    value: 'name-desc'  },
];

// ── Glasses schematics per style ──────────────────────────────────────────────

function RoundSchematic({ light }: { light: boolean }) {
  const stroke = light ? 'rgba(26,22,18,0.55)' : '#C9A96E';
  const fill   = light ? 'rgba(26,22,18,0.06)' : 'rgba(201,169,110,0.10)';
  return (
    <svg width="88" height="44" viewBox="0 0 88 44" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="15" stroke={stroke} strokeWidth="2" fill={fill} />
      <circle cx="66" cy="22" r="15" stroke={stroke} strokeWidth="2" fill={fill} />
      <line x1="37" y1="22" x2="51" y2="22" stroke={stroke} strokeWidth="1.5" />
      <line x1="7"  y1="16" x2="0"  y2="13" stroke={stroke} strokeWidth="1.5" />
      <line x1="81" y1="16" x2="88" y2="13" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}

function AviatorSchematic({ light }: { light: boolean }) {
  const stroke = light ? 'rgba(26,22,18,0.55)' : '#C9A96E';
  const fill   = light ? 'rgba(26,22,18,0.06)' : 'rgba(201,169,110,0.10)';
  return (
    <svg width="92" height="50" viewBox="0 0 92 50" fill="none" aria-hidden="true">
      <path d="M4 10 Q4 38 24 38 Q42 38 42 22 Q42 10 22 10 Z" stroke={stroke} strokeWidth="2" fill={fill} />
      <path d="M88 10 Q88 38 68 38 Q50 38 50 22 Q50 10 70 10 Z" stroke={stroke} strokeWidth="2" fill={fill} />
      <line x1="42" y1="15" x2="50" y2="15" stroke={stroke} strokeWidth="1.5" />
      <line x1="4"  y1="14" x2="0"  y2="11" stroke={stroke} strokeWidth="1.5" />
      <line x1="88" y1="14" x2="92" y2="11" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}

function RectangleSchematic({ light }: { light: boolean }) {
  const stroke = light ? 'rgba(26,22,18,0.55)' : '#C9A96E';
  const fill   = light ? 'rgba(26,22,18,0.06)' : 'rgba(201,169,110,0.10)';
  return (
    <svg width="92" height="40" viewBox="0 0 92 40" fill="none" aria-hidden="true">
      <rect x="2"  y="8" width="38" height="24" stroke={stroke} strokeWidth="2" fill={fill} />
      <rect x="52" y="8" width="38" height="24" stroke={stroke} strokeWidth="2" fill={fill} />
      <line x1="40" y1="20" x2="52" y2="20" stroke={stroke} strokeWidth="1.5" />
      <line x1="2"  y1="14" x2="0"  y2="11" stroke={stroke} strokeWidth="1.5" />
      <line x1="90" y1="14" x2="92" y2="11" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}

function CatEyeSchematic({ light }: { light: boolean }) {
  const stroke = light ? 'rgba(26,22,18,0.55)' : '#C9A96E';
  const fill   = light ? 'rgba(26,22,18,0.06)' : 'rgba(201,169,110,0.10)';
  return (
    <svg width="92" height="44" viewBox="0 0 92 44" fill="none" aria-hidden="true">
      <path d="M2 28 Q2 10 20 8 Q36 6 40 20 Q40 32 22 34 Q6 36 2 28 Z" stroke={stroke} strokeWidth="2" fill={fill} />
      <path d="M90 28 Q90 10 72 8 Q56 6 52 20 Q52 32 70 34 Q86 36 90 28 Z" stroke={stroke} strokeWidth="2" fill={fill} />
      <line x1="40" y1="20" x2="52" y2="20" stroke={stroke} strokeWidth="1.5" />
      <line x1="2"  y1="18" x2="0"  y2="14" stroke={stroke} strokeWidth="1.5" />
      <line x1="90" y1="18" x2="92" y2="14" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}

function WrapSchematic({ light }: { light: boolean }) {
  const stroke = light ? 'rgba(26,22,18,0.55)' : '#C9A96E';
  const fill   = light ? 'rgba(26,22,18,0.06)' : 'rgba(201,169,110,0.10)';
  return (
    <svg width="96" height="40" viewBox="0 0 96 40" fill="none" aria-hidden="true">
      <path d="M0 20 Q0 6 14 6 L44 8 Q46 8 46 20 Q46 32 44 32 L14 34 Q0 34 0 20 Z" stroke={stroke} strokeWidth="2" fill={fill} />
      <path d="M96 20 Q96 6 82 6 L52 8 Q50 8 50 20 Q50 32 52 32 L82 34 Q96 34 96 20 Z" stroke={stroke} strokeWidth="2" fill={fill} />
      <line x1="46" y1="20" x2="50" y2="20" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}

function GlassesSchematic({ style, light }: { style: string; light: boolean }) {
  switch (style) {
    case 'aviator':    return <AviatorSchematic   light={light} />;
    case 'rectangle':  return <RectangleSchematic  light={light} />;
    case 'cat-eye':    return <CatEyeSchematic     light={light} />;
    case 'sport-wrap': return <WrapSchematic        light={light} />;
    default:           return <RoundSchematic       light={light} />;
  }
}

// ── Badge ─────────────────────────────────────────────────────────────────────

function Badge({ type }: { type: 'TRENDING' | 'NEW ARRIVAL' | 'LIMITED' }) {
  const styles: Record<string, React.CSSProperties> = {
    'TRENDING':    { backgroundColor: '#C9A96E', color: '#1A1612' },
    'NEW ARRIVAL': { backgroundColor: '#1A1612', color: '#F5F0E8' },
    'LIMITED':     { backgroundColor: '#8B2635', color: '#FFFFFF' },
  };
  return (
    <span
      className="absolute top-2 left-2 text-[8px] font-sans font-semibold uppercase tracking-[0.12em] px-2 py-0.5"
      style={{ borderRadius: 2, ...styles[type] }}
    >
      {type}
    </span>
  );
}

// ── Frame card ────────────────────────────────────────────────────────────────

function FrameCard({ frame }: { frame: CatalogFrame }) {
  // Decide if the card bg is light (use dark ink schematic) or dark (use gold schematic)
  const isLightBg = ['#E8E3DA', '#F0EAD8', '#F5EFE8'].includes(frame.bgColor);

  return (
    <div
      className="bg-cream-50 border border-cream-400 overflow-hidden cursor-pointer hover:border-gold-500 transition-colors group"
      style={{ borderRadius: 2 }}
    >
      {/* Preview area */}
      <div
        className="relative flex items-center justify-center border-b border-cream-400"
        style={{ backgroundColor: frame.bgColor, paddingTop: '62%' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <GlassesSchematic style={frame.style} light={isLightBg} />
        </div>
        {frame.badge && <Badge type={frame.badge} />}
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Name row */}
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <h3 className="font-serif italic text-lg text-ink-900 leading-tight">
            {frame.name}
          </h3>
          <span className="font-serif italic text-sm text-ink-300 whitespace-nowrap flex-shrink-0">
            {frame.tries} tries
          </span>
        </div>

        {/* Style tag */}
        <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-300 mb-2">
          {frame.tag}
        </p>

        {/* Color dots */}
        <div className="flex items-center gap-1 mb-3">
          {frame.colors.map((color, i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full border border-cream-400 flex-shrink-0"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <Link
            href="/trydemo"
            className="text-xs font-sans font-semibold uppercase tracking-[0.08em] no-underline transition-opacity hover:opacity-70"
            style={{ color: '#C9A96E' }}
          >
            TRY ON →
          </Link>
          <button
            aria-label={`Save ${frame.name} to wishlist`}
            className="text-ink-300 hover:text-ink-900 transition-colors"
          >
            <Heart size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <p className="font-serif italic text-xl text-ink-900 mb-1">No frames found</p>
      <p className="text-sm font-sans text-ink-500 mb-6">
        Try adjusting your search or filter.
      </p>
      <button
        onClick={onClear}
        className="font-sans text-xs font-semibold uppercase tracking-[0.08em] px-4 py-2
                   bg-ink-900 text-cream-50 transition-colors hover:bg-ink-500"
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
  const [sortBy, setSortBy]             = useState('tries-desc');

  const parseTries = (t: string) =>
    t.endsWith('k') ? parseFloat(t) * 1000 : parseFloat(t);

  const filtered = CATALOG_FRAMES
    .filter(f => activeFilter === 'all' || f.style === activeFilter)
    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name-asc')   return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc')  return b.name.localeCompare(a.name);
      if (sortBy === 'tries-desc') return parseTries(b.tries) - parseTries(a.tries);
      return 0;
    });

  function clearFilters() {
    setSearch('');
    setActiveFilter('all');
    setSortBy('tries-desc');
  }

  return (
    <div className="flex h-screen bg-cream-100">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar pageTitle="Frames" />

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">

          {/* Page header */}
          <div className="px-6 pt-8 pb-2">
            <h1 className="font-serif italic text-ink-900 leading-none mb-1" style={{ fontSize: '2.8rem' }}>
              Frames
            </h1>
            <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-300">
              55 STYLES IN YOUR CATALOG
            </p>
          </div>

          {/* Search bar */}
          <div className="px-6 pt-5 pb-3">
            <div className="relative max-w-md">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search catalog…"
                className="w-full bg-cream-50 border border-cream-400 text-ink-900 text-sm font-sans
                           pl-9 pr-3 py-2 outline-none focus:border-ink-900 transition-colors
                           placeholder:text-ink-300"
                style={{ borderRadius: 2 }}
              />
            </div>
          </div>

          {/* Filter pills + sort */}
          <div className="px-6 pb-5 flex items-center justify-between gap-3 flex-wrap">
            {/* Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {FILTER_PILLS.map(pill => {
                const isActive = activeFilter === pill.value;
                return (
                  <button
                    key={pill.value}
                    onClick={() => setActiveFilter(pill.value)}
                    className={[
                      'text-[11px] font-sans font-semibold uppercase tracking-[0.09em] px-3 py-1.5 transition-colors border',
                      isActive
                        ? 'bg-ink-900 text-cream-50 border-transparent'
                        : 'bg-transparent border-cream-400 text-ink-500 hover:border-ink-900 hover:text-ink-900',
                    ].join(' ')}
                    style={{ borderRadius: 2 }}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-300">
                SORT BY:
              </span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-cream-50 border border-cream-400 text-ink-900 text-xs font-sans font-semibold
                           px-3 py-1.5 outline-none focus:border-ink-900 transition-colors cursor-pointer"
                style={{ borderRadius: 2 }}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Frame grid or empty state */}
          {filtered.length === 0 ? (
            <EmptyState onClear={clearFilters} />
          ) : (
            <div className="px-6 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(frame => (
                <FrameCard key={frame.id} frame={frame} />
              ))}
            </div>
          )}

        </main>

        <BottomNav />
      </div>
    </div>
  );
}
