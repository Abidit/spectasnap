'use client'

import { useState, useMemo } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import { FramePreview } from '@/components/frames/FramePreview'
import { GLASSES_COLLECTION } from '@/lib/glasses-data'

const STYLE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'round', label: 'Round' },
  { key: 'rectangle', label: 'Rectangle' },
  { key: 'aviator', label: 'Aviator' },
  { key: 'cat-eye', label: 'Cat-Eye' },
  { key: 'sport-wrap', label: 'Sport Wrap' },
]

// Deterministic "tries" count from frame index
function triesLabel(idx: number): string {
  const base = 800 + idx * 137
  if (base >= 1000) return `${(base / 1000).toFixed(1)}k tries`
  return `${base} tries`
}

export default function FramesPage() {
  const [activeFilter, setActiveFilter] = useState('all')

  const frames = useMemo(() => {
    if (activeFilter === 'all') return GLASSES_COLLECTION
    return GLASSES_COLLECTION.filter(f => {
      const key = f.style.toLowerCase().replace(/\s+/g, '-')
      return key === activeFilter || key.includes(activeFilter)
    })
  }, [activeFilter])

  return (
    <div className="flex h-screen bg-cream-100">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar pageTitle="Frame Catalog" />

        {/* Filter bar */}
        <div className="border-b border-cream-400 bg-cream-50 px-6">
          <div className="flex gap-1 py-3 overflow-x-auto scrollbar-none">
            {STYLE_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                style={{ borderRadius: 2 }}
                className={[
                  'flex-shrink-0 px-3 py-1.5 text-[11px] font-sans font-semibold uppercase tracking-[0.1em] transition-colors',
                  activeFilter === f.key
                    ? 'bg-ink-900 text-cream-50'
                    : 'bg-transparent text-ink-500 hover:text-ink-900',
                ].join(' ')}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Frame grid */}
        <main className="flex-1 overflow-y-auto p-6">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-300 mb-4">
            {frames.length} frame{frames.length !== 1 ? 's' : ''}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {frames.map((frame, idx) => (
              <div
                key={frame.id}
                style={{ borderRadius: 2 }}
                className="group bg-cream-50 border border-cream-400 overflow-hidden cursor-pointer hover:border-gold-500 transition-colors"
              >
                {/* Canvas preview */}
                <div className="bg-cream-100 flex items-center justify-center p-4 border-b border-cream-400" style={{ height: 120 }}>
                  <FramePreview
                    frameId={frame.id}
                    frameColor={frame.color}
                    width={200}
                    height={88}
                  />
                </div>

                {/* Card info */}
                <div className="px-3 py-2.5">
                  {/* Style tag */}
                  <p
                    className="text-[9px] font-sans font-semibold uppercase tracking-[0.14em] mb-0.5"
                    style={{ color: '#C9A96E' }}
                  >
                    {frame.styleTag}
                  </p>

                  {/* Name */}
                  <p className="font-serif text-sm font-semibold text-ink-900 leading-tight truncate">
                    {frame.name}
                  </p>

                  {/* Style pill */}
                  <p className="text-[10px] font-sans text-ink-500 mt-0.5">{frame.style}</p>

                  {/* Divider */}
                  <div className="border-t border-cream-400 my-2" />

                  {/* Tries count — no prices */}
                  <p className="text-xs font-sans text-ink-300">
                    {triesLabel(idx)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
