'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { GLASSES_COLLECTION, type GlassesFrame, type ColorVariant } from '@/lib/glasses-data';
import Header from '@/components/Header';
import GlassesGrid from '@/components/GlassesGrid';
import ProductCard from '@/components/ProductCard';

const ARCamera = dynamic(() => import('@/components/ARCamera'), { ssr: false });

export default function TryDemo() {
  const [selected, setSelected] = useState<GlassesFrame>(GLASSES_COLLECTION[0]);
  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null);

  // Reset color when switching frames so each frame shows its default look first
  useEffect(() => {
    setSelectedColor(null);
  }, [selected.id]);

  return (
    <div
      className="flex flex-col bg-brand-page"
      style={{ height: '100dvh', maxHeight: '100dvh', overflow: 'hidden' }}
    >
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1 bg-brand-camera overflow-hidden">
          <ARCamera selectedGlasses={selected} selectedColor={selectedColor} />

          <div
            className="absolute bottom-0 left-0 right-0 px-4 pt-3 pb-safe"
            style={{
              paddingBottom: 'max(env(safe-area-inset-bottom), 14px)',
              background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0) 100%)',
            }}
          >
            <GlassesGrid selected={selected} onSelect={setSelected} />
          </div>
        </div>

        <aside
          className="hidden md:flex flex-col gap-0 border-l border-brand-border
                     bg-brand-panel overflow-y-auto scrollbar-hide"
          style={{ width: 272, minWidth: 252 }}
        >
          <div className="flex-1 p-6">
            <ProductCard
              frame={selected}
              colorVariants={selected.colorVariants}
              activeColor={selectedColor}
              onColorChange={setSelectedColor}
            />
          </div>
          <div className="px-6 py-4 border-t border-brand-border">
            <p className="text-brand-muted text-[10px] text-center font-sans tracking-wide">
              Powered by MediaPipe · SpectaSnap AR © 2026
            </p>
          </div>
        </aside>
      </div>

      <div className="md:hidden border-t border-brand-border bg-brand-panel px-5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[9px] font-sans font-semibold tracking-[0.14em] uppercase"
              style={{ color: '#C9A96E' }}
            >
              {selected.styleTag}
            </p>
            <p className="font-serif text-lg font-semibold text-brand-text leading-tight">
              {selected.name}
            </p>
          </div>
          <button
            className="px-4 py-2 font-sans font-semibold text-xs tracking-wide
                       bg-brand-text text-brand-page hover:opacity-90 transition-opacity"
            style={{ borderRadius: 2 }}
          >
            Ask Staff
          </button>
        </div>
      </div>
    </div>
  );
}
