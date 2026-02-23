'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { GLASSES_COLLECTION, type GlassesFrame } from '@/lib/glasses-data';
import Header from '@/components/Header';
import GlassesGrid from '@/components/GlassesGrid';
import ProductCard from '@/components/ProductCard';

// Dynamically import ARCamera to skip SSR (needs browser APIs)
const ARCamera = dynamic(() => import('@/components/ARCamera'), { ssr: false });

export default function Home() {
  const [selected, setSelected] = useState<GlassesFrame>(GLASSES_COLLECTION[0]);

  return (
    <div
      className="flex flex-col bg-brand-dark"
      style={{ height: '100dvh', maxHeight: '100dvh', overflow: 'hidden' }}
    >
      {/* ── Top bar ── */}
      <Header />

      {/* ── Main content: camera | product panel ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT: AR Camera view (flex-grows to fill available space) ── */}
        <div className="relative flex-1 bg-black overflow-hidden">
          <ARCamera selectedGlasses={selected} />
        </div>

        {/* ── RIGHT: Product info panel (tablet sidebar) ── */}
        <aside
          className="hidden md:flex flex-col justify-between gap-6 p-6 border-l border-brand-border
                     bg-brand-surface overflow-y-auto scrollbar-hide"
          style={{ width: 280, minWidth: 260 }}
        >
          <ProductCard frame={selected} />

          {/* Divider */}
          <div className="border-t border-brand-border" />

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Frame Width', value: '140 mm' },
              { label: 'Lens Width', value: '52 mm' },
              { label: 'Bridge', value: '18 mm' },
              { label: 'Temple', value: '145 mm' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-brand-card rounded-xl p-3 border border-brand-border">
                <p className="text-zinc-500 text-[10px] uppercase tracking-wide">{label}</p>
                <p className="text-white text-sm font-semibold mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Bottom brand note */}
          <p className="text-zinc-600 text-[10px] text-center leading-relaxed">
            Powered by MediaPipe · SpectaSnap AR © 2025
          </p>
        </aside>
      </div>

      {/* ── BOTTOM: Glasses selector (full width on all screens) ── */}
      <div
        className="border-t border-brand-border bg-brand-surface px-4 pt-4 pb-safe"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      >
        {/* Mobile: show product info inline above grid */}
        <div className="md:hidden mb-4 px-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-[10px] uppercase tracking-widest">{selected.brand}</p>
              <p className="text-white font-semibold">{selected.name}</p>
            </div>
            <div className="text-right">
              <p className="text-brand-gold font-bold text-lg">${selected.price}</p>
              <p className="text-zinc-500 text-xs line-through">${Math.round(selected.price * 1.3)}</p>
            </div>
          </div>
        </div>

        <GlassesGrid selected={selected} onSelect={setSelected} />
      </div>
    </div>
  );
}
