'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';

// ── Frame data ────────────────────────────────────────────────────────────────

interface CatalogFrame {
  id: string;
  name: string;
  style: string;
  material: string;
  price: string;
  colors: string[];
  occasions: string[];
  featured: boolean;
}

const CATALOG_FRAMES: CatalogFrame[] = [
  { id: 'featured-aviator',  name: 'Classic Aviator',  style: 'aviator',    material: 'Metal',   price: '₹4,200', colors: ['#1A1612', '#C9A96E', '#8B7355'], occasions: ['Work', 'Casual'],    featured: true  },
  { id: 'featured-wayfarer', name: 'Modern Wayfarer',  style: 'rectangle',  material: 'Acetate', price: '₹3,800', colors: ['#1A1612', '#4A3728', '#2C4A6E'], occasions: ['Casual', 'Social'],  featured: true  },
  { id: 'featured-round',    name: 'Round Gold',       style: 'round',      material: 'Metal',   price: '₹5,100', colors: ['#C9A96E', '#A8844A', '#1A1612'], occasions: ['Creative', 'Social'], featured: true  },
  { id: 'cat-eye-01',        name: 'Cat-Eye Classic',  style: 'cat-eye',    material: 'Acetate', price: '₹4,500', colors: ['#1A1612', '#8B2635', '#C9A96E'], occasions: ['Social', 'Evening'],  featured: true  },
  { id: 'rectangle-01',      name: 'Slim Rectangle',   style: 'rectangle',  material: 'Metal',   price: '₹3,200', colors: ['#1A1612', '#C9A96E', '#6B6560'], occasions: ['Work', 'Meetings'],  featured: false },
  { id: 'round-01',          name: 'Round Thin',       style: 'round',      material: 'Metal',   price: '₹2,900', colors: ['#C9A96E', '#1A1612', '#6B6560'], occasions: ['Casual', 'Creative'], featured: false },
  { id: 'aviator-02',        name: 'Aviator Dark',     style: 'aviator',    material: 'Metal',   price: '₹4,800', colors: ['#1A1612', '#2C2C2C', '#4A3728'], occasions: ['Casual', 'Outdoors'], featured: false },
  { id: 'sport-01',          name: 'Sport Wrap',       style: 'sport-wrap', material: 'TR90',    price: '₹3,600', colors: ['#1A1612', '#2C4A6E', '#4A3728'], occasions: ['Sports', 'Outdoors'], featured: false },
  { id: 'rectangle-02',      name: 'Bold Rectangle',   style: 'rectangle',  material: 'Acetate', price: '₹3,400', colors: ['#4A3728', '#1A1612', '#2C4A6E'], occasions: ['Work', 'Bold'],      featured: false },
  { id: 'cat-eye-02',        name: 'Cat-Eye Slim',     style: 'cat-eye',    material: 'Acetate', price: '₹4,100', colors: ['#8B2635', '#1A1612', '#C9A96E'], occasions: ['Evening', 'Social'],  featured: false },
  { id: 'round-02',          name: 'Round Thick',      style: 'round',      material: 'Acetate', price: '₹3,700', colors: ['#4A3728', '#1A1612', '#8B7355'], occasions: ['Creative', 'Casual'], featured: false },
  { id: 'aviator-03',        name: 'Aviator Gold',     style: 'aviator',    material: 'Metal',   price: '₹5,500', colors: ['#C9A96E', '#A8844A', '#1A1612'], occasions: ['Work', 'Special'],   featured: false },
];

// ── Filter config ─────────────────────────────────────────────────────────────

interface FilterPill {
  label: string;
  value: string;
}

const FILTER_PILLS: FilterPill[] = [
  { label: 'All',        value: 'all'        },
  { label: 'Round',      value: 'round'      },
  { label: 'Rectangle',  value: 'rectangle'  },
  { label: 'Aviator',    value: 'aviator'    },
  { label: 'Cat-Eye',    value: 'cat-eye'    },
  { label: 'Sport Wrap', value: 'sport-wrap' },
];

// ── Glasses SVG schematic ─────────────────────────────────────────────────────

function GlassesSchematic() {
  return (
    <svg width="80" height="40" viewBox="0 0 80 40" fill="none" aria-hidden="true">
      <rect x="4"  y="8" width="28" height="24" rx="2" stroke="#C9A96E" strokeWidth="2" fill="rgba(201,169,110,0.08)" />
      <rect x="48" y="8" width="28" height="24" rx="2" stroke="#C9A96E" strokeWidth="2" fill="rgba(201,169,110,0.08)" />
      <line x1="32" y1="20" x2="48" y2="20" stroke="#C9A96E" strokeWidth="2" />
      <line x1="4"  y1="14" x2="0"  y2="12" stroke="#C9A96E" strokeWidth="1.5" />
      <line x1="76" y1="14" x2="80" y2="12" stroke="#C9A96E" strokeWidth="1.5" />
    </svg>
  );
}

// ── Frame card ────────────────────────────────────────────────────────────────

function FrameCard({ frame }: { frame: CatalogFrame }) {
  return (
    <div
      className="bg-cream-50 border border-cream-400 overflow-hidden cursor-pointer hover:border-gold-500 transition-colors group"
      style={{ borderRadius: 2 }}
    >
      {/* Preview area */}
      <div className="aspect-[4/3] bg-cream-200 border-b border-cream-400 relative flex items-center justify-center">
        <GlassesSchematic />
        {frame.featured && (
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
        <h3 className="font-serif text-base font-semibold text-ink-900 leading-tight mb-0.5">
          {frame.name}
        </h3>
        <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-ink-300 mb-2">
          {frame.style} · {frame.material}
        </p>

        {/* Color dots */}
        <div className="flex items-center gap-1 mb-2">
          {frame.colors.map((color, i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full border border-cream-400 flex-shrink-0"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="font-sans text-sm font-semibold text-ink-900">{frame.price}</span>
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
  const [search, setSearch]           = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy]           = useState('name-asc');

  const filtered = CATALOG_FRAMES
    .filter(f => activeFilter === 'all' || f.style === activeFilter)
    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name-asc')   return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc')  return b.name.localeCompare(a.name);
      if (sortBy === 'price-asc')  return parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, ''));
      if (sortBy === 'price-desc') return parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, ''));
      return 0;
    });

  function clearFilters() {
    setSearch('');
    setActiveFilter('all');
    setSortBy('name-asc');
  }

  return (
    <div className="flex h-screen bg-cream-100">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar pageTitle="Frames" />

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
                         hover:bg-ink-500 transition-colors flex-shrink-0"
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
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
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
