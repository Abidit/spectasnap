'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { GLASSES_COLLECTION, type GlassesFrame } from '@/lib/glasses-data';
import clsx from 'clsx';

type FilterFamily = 'all' | 'round' | 'rectangle' | 'aviator' | 'cat-eye' | 'sport-wrap' | 'custom';

const FILTERS: { key: FilterFamily; label: string }[] = [
  { key: 'all',        label: 'All'       },
  { key: 'round',      label: 'Round'     },
  { key: 'rectangle',  label: 'Rectangle' },
  { key: 'aviator',    label: 'Aviator'   },
  { key: 'cat-eye',    label: 'Cat-Eye'   },
  { key: 'sport-wrap', label: 'Sport'     },
  { key: 'custom',     label: 'Custom'    },
];

/** Normalize a frame's style string to a FilterFamily key. */
function frameFamily(frame: GlassesFrame): FilterFamily {
  return frame.style.toLowerCase().replace(/\s+/g, '-') as FilterFamily;
}

interface GlassesGridProps {
  selected: GlassesFrame;
  onSelect: (frame: GlassesFrame) => void;
  /** Additional frames (e.g. user-uploaded custom frames) prepended to the grid. */
  extraFrames?: GlassesFrame[];
}

export default function GlassesGrid({ selected, onSelect, extraFrames }: GlassesGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterFamily>('all');

  // Merge extra frames (custom uploads) with the built-in collection.
  const collection = useMemo(
    () => [...(extraFrames ?? []), ...GLASSES_COLLECTION],
    [extraFrames],
  );

  // Pre-compute counts
  const counts = useMemo(() => {
    const c: Record<FilterFamily, number> = {
      all: collection.length,
      round: 0, rectangle: 0, aviator: 0, 'cat-eye': 0, 'sport-wrap': 0, custom: 0,
    };
    collection.forEach((f) => {
      const fam = frameFamily(f);
      if (fam in c) c[fam]++;
    });
    return c;
  }, [collection]);

  const filtered = useMemo(
    () =>
      activeFilter === 'all'
        ? collection
        : collection.filter((f) => frameFamily(f) === activeFilter),
    [activeFilter, collection],
  );

  // Only show filter tabs that have frames (hides "Custom 0" when no custom frames exist)
  const visibleFilters = useMemo(
    () => FILTERS.filter((f) => f.key === 'all' || counts[f.key] > 0),
    [counts],
  );

  return (
    <div className="flex flex-col gap-2">
      {/* ── Header row ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-white/80 font-sans font-medium text-xs tracking-[0.12em] uppercase">
          Choose Frames
        </h2>
        <span className="text-white/40 text-xs font-sans">
          {filtered.length} style{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Filter frames by shape"
        className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide"
      >
        {visibleFilters.map(({ key, label }) => {
          const isActive = activeFilter === key;
          const count = counts[key];
          const disabled = count === 0;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActive}
              disabled={disabled}
              onClick={() => setActiveFilter(key)}
              className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 font-sans font-semibold
                         tracking-[0.1em] uppercase transition-all duration-150 focus-visible:outline-none
                         focus-visible:ring-1 focus-visible:ring-brand-gold"
              style={{
                fontSize: 10,
                borderRadius: 2,
                border: isActive
                  ? '1px solid rgba(201,169,110,0.7)'
                  : '1px solid rgba(255,255,255,0.12)',
                background: isActive
                  ? 'rgba(201,169,110,0.14)'
                  : 'rgba(255,255,255,0.05)',
                color: isActive
                  ? '#C9A96E'
                  : disabled
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(255,255,255,0.5)',
                cursor: disabled ? 'default' : 'pointer',
              }}
            >
              {label}
              <span
                style={{
                  fontSize: 9,
                  color: isActive ? '#A8844A' : 'rgba(255,255,255,0.22)',
                  fontWeight: 500,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Horizontal scroll row ───────────────────────────────────────── */}
      <div className="flex gap-2.5 overflow-x-auto pb-0.5 scrollbar-hide snap-x snap-mandatory">
        {filtered.map((frame) => {
          const isSelected = frame.id === selected.id;
          return (
            <motion.button
              key={frame.id}
              onClick={() => onSelect(frame)}
              whileTap={{ scale: 0.96 }}
              className={clsx(
                'relative flex-shrink-0 snap-center flex flex-col items-center gap-1.5 px-3 pt-3 pb-2.5',
                'border transition-all duration-200 cursor-pointer',
                isSelected
                  ? 'border-brand-gold bg-white/10'
                  : 'border-white/15 bg-white/6 hover:border-white/30',
              )}
              style={{ minWidth: 100, borderRadius: 2 }}
            >
              {/* SVG preview on dark bg */}
              <div className="w-full flex items-center justify-center" style={{ height: 46 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={frame.svg}
                  alt={frame.name}
                  className="w-full object-contain"
                  style={{ maxHeight: 42 }}
                />
              </div>

              {/* Name */}
              <div className="text-center">
                <p
                  className="text-[11px] font-sans font-medium leading-tight"
                  style={{ color: isSelected ? '#C9A96E' : 'rgba(255,255,255,0.75)' }}
                >
                  {frame.name}
                </p>
                <p
                  className="text-[9px] font-sans tracking-widest uppercase mt-0.5"
                  style={{ color: isSelected ? '#A8844A' : 'rgba(255,255,255,0.35)' }}
                >
                  {frame.styleTag}
                </p>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center"
                  style={{ backgroundColor: '#C9A96E', borderRadius: 2 }}
                >
                  <Check className="w-2.5 h-2.5 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
