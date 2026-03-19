'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useRef } from 'react';
import { GLASSES_COLLECTION, type GlassesFrame, type ColorVariant } from '@/lib/glasses-data';
import Header from '@/components/Header';
import GlassesGrid from '@/components/GlassesGrid';
import ProductCard from '@/components/ProductCard';
import ShareModal from '@/components/ShareModal';
import FeedbackToast, { type ToastData } from '@/components/FeedbackToast';
import ErrorBoundary from '@/components/ErrorBoundary';
import OfflineBanner from '@/components/OfflineBanner';
import type { ARStatusKind } from '@/components/ARStatusBadge';

const ARCamera = dynamic(() => import('@/components/ARCamera'), { ssr: false });
const AIStylePanel = dynamic(() => import('@/components/AIStylePanel'), { ssr: false });

const STYLIST_FRAMES = GLASSES_COLLECTION.slice(0, 20).map((f) => ({
  id: f.id,
  name: f.name,
  style: f.style,
  bestFor: f.bestFor,
}));

export default function TryDemo() {
  const [selected, setSelected] = useState<GlassesFrame>(GLASSES_COLLECTION[0]);
  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null);
  const [stylePanelOpen, setStylePanelOpen] = useState(false);
  const [arStatus, setArStatus] = useState<ARStatusKind>('idle');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [faceShape, setFaceShape] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareDataUrl, setShareDataUrl] = useState<string | null>(null);
  const captureRef = useRef<(() => string | null) | null>(null);

  // Reset color when switching frames so each frame shows its default look first
  function handleSelect(frame: GlassesFrame) {
    setSelected(frame);
    setSelectedColor(null);
  }

  function handleRecommendation(frameId: string) {
    const frame = GLASSES_COLLECTION.find((f) => f.id === frameId);
    if (frame) handleSelect(frame);
  }

  const handleAskStaff = useCallback(() => {
    setToast({
      message: `"${selected.name}" — a staff member will assist you shortly.`,
      type: 'success',
    });
  }, [selected.name]);

  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <div
      className="flex flex-col bg-brand-page"
      style={{ height: '100dvh', maxHeight: '100dvh', overflow: 'hidden' }}
    >
      <OfflineBanner />
      <Header arStatus={arStatus} />

      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1 bg-brand-camera overflow-hidden">
          <ErrorBoundary label="AR camera failed to load. Please reload the page.">
          <ARCamera
            selectedGlasses={selected}
            selectedColor={selectedColor}
            onARStatusChange={setArStatus}
            onFaceShapeDetected={setFaceShape}
            captureRef={captureRef}
          />

          </ErrorBoundary>

          <div
            className="absolute bottom-0 left-0 right-0 px-4 pt-3 pb-safe"
            style={{
              paddingBottom: 'max(env(safe-area-inset-bottom), 14px)',
              background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0) 100%)',
            }}
          >
            <GlassesGrid selected={selected} onSelect={handleSelect} />
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
              onAskStaff={handleAskStaff}
              faceShape={faceShape}
              onSelectFrame={(id) => {
                const f = GLASSES_COLLECTION.find((g) => g.id === id);
                if (f) handleSelect(f);
              }}
              onShareLook={() => {
                setShareDataUrl(captureRef.current?.() ?? null);
                setShareOpen(true);
              }}
            />
          </div>
          {/* AI Stylist CTA — hidden until ANTHROPIC_API_KEY is configured */}
          {/* <div className="px-6 pb-4 border-t border-brand-border pt-4">
            <button
              onClick={() => setStylePanelOpen(true)}
              className="w-full py-2.5 font-sans font-semibold text-xs tracking-wide
                         border border-brand-gold text-brand-gold hover:bg-[rgba(201,169,110,0.08)]
                         transition-colors"
              style={{ borderRadius: 2 }}
            >
              ✦ AI Style Advisor
            </button>
          </div> */}
          <div className="px-6 py-4 border-t border-brand-border">
            <p className="text-brand-muted text-[10px] text-center font-sans tracking-wide">
              Powered by MediaPipe · SpectaSnap AR © 2026
            </p>
          </div>
        </aside>
      </div>

      {/* Mobile bottom strip */}
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
          <div className="flex gap-2">
            {/* AI button hidden until ANTHROPIC_API_KEY is configured */}
            {/* <button
              onClick={() => setStylePanelOpen(true)}
              className="px-3 font-sans font-semibold text-xs tracking-wide
                         border border-brand-gold text-brand-gold hover:bg-[rgba(201,169,110,0.08)]
                         transition-colors"
              style={{ borderRadius: 2, minHeight: 44 }}
            >
              ✦ AI
            </button> */}
            <button
              onClick={handleAskStaff}
              className="px-4 py-2 font-sans font-semibold text-xs tracking-wide
                         bg-brand-text text-brand-page hover:opacity-90 transition-opacity"
              style={{ borderRadius: 2, minHeight: 44 }}
            >
              Ask Staff
            </button>
          </div>
        </div>
      </div>

      <AIStylePanel
        open={stylePanelOpen}
        onClose={() => setStylePanelOpen(false)}
        availableFrames={STYLIST_FRAMES}
        onRecommendation={handleRecommendation}
      />

      {/* Share modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => {
          setShareOpen(false);
          setShareDataUrl(null);
        }}
        dataUrl={shareDataUrl}
      />

      {/* Feedback toast — rendered at root so it composites above everything */}
      <FeedbackToast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
