'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { GLASSES_COLLECTION, LENS_TINT_OPTIONS, type GlassesFrame, type ColorVariant, type LensTint } from '@/lib/glasses-data';
import { loadCustomFrame } from '@/ar/customFrameLoader';
import { COLOR_VARIANTS } from '@/ar/presets';
import type { PDMeasurement } from '@/ar/pdMeasure';
import Header from '@/components/Header';
import GlassesGrid from '@/components/GlassesGrid';
import ProductCard from '@/components/ProductCard';
import ShareModal from '@/components/ShareModal';
import CompareTray, { type SavedLook } from '@/components/CompareTray';
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

export default function TryDemoPage() {
  return (
    <Suspense>
      <TryDemo />
    </Suspense>
  );
}

function TryDemo() {
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<GlassesFrame>(GLASSES_COLLECTION[0]);
  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null);
  const [stylePanelOpen, setStylePanelOpen] = useState(false);
  const [arStatus, setArStatus] = useState<ARStatusKind>('idle');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [faceShape, setFaceShape] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareDataUrl, setShareDataUrl] = useState<string | null>(null);
  const [selectedTint, setSelectedTint] = useState<LensTint | null>(null);
  const [customFrames, setCustomFrames] = useState<GlassesFrame[]>([]);
  const [pdMeasurement, setPDMeasurement] = useState<PDMeasurement | null>(null);
  const [pdMeasuring, setPDMeasuring] = useState(false);
  const captureRef = useRef<(() => string | null) | null>(null);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);

  function handleSaveLook() {
    if (savedLooks.length >= 4) return;
    const dataUrl = captureRef.current?.();
    if (!dataUrl) return;
    setSavedLooks((prev) => [
      ...prev,
      {
        id: `look-${Date.now()}`,
        dataUrl,
        frameName: selected.name,
        frameId: selected.id,
        timestamp: Date.now(),
      },
    ]);
    setToast({ message: `Look saved! (${savedLooks.length + 1}/4)`, type: 'success' });
  }

  function handleRemoveLook(id: string) {
    setSavedLooks((prev) => prev.filter((l) => l.id !== id));
  }

  // Load custom frame from localStorage when ?customFrame=true
  useEffect(() => {
    if (searchParams.get('customFrame') !== 'true') return;
    const data = loadCustomFrame();
    if (!data) return;

    // Create a synthetic GlassesFrame entry for the custom frame
    const customId = `custom-${Date.now()}`;
    const customFrame: GlassesFrame = {
      id: customId,
      name: data.name || 'Custom Frame',
      color: '#C9A96E',
      style: 'Custom',
      styleTag: 'YOUR FRAME',
      bestFor: ['All face shapes'],
      occasions: ['Casual', 'Office'],
      staffNote: 'Your custom uploaded frame.',
      svg: data.dataUrl, // Use the transparent PNG as the thumbnail
      scaleFactor: data.widthScale,
      yOffset: 0,
      colorVariants: COLOR_VARIANTS,
    };

    setCustomFrames([customFrame]);
    setSelected(customFrame);
    setToast({
      message: `Custom frame "${data.name || 'Custom Frame'}" loaded!`,
      type: 'success',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset color + tint when switching frames so each frame shows its default look first
  function handleSelect(frame: GlassesFrame) {
    setSelected(frame);
    setSelectedColor(null);
    setSelectedTint(null);
  }

  // Reset tint when switching frame color
  function handleColorChange(variant: ColorVariant) {
    setSelectedColor(variant);
    setSelectedTint(null);
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

  const handlePDMeasured = useCallback((pd: PDMeasurement) => {
    setPDMeasurement(pd);
    if (pd.stable) {
      setPDMeasuring(false);
      setToast({ message: `PD measured: ${pd.pdMm} mm`, type: 'success' });
    }
  }, []);

  const handleStartPDMeasure = useCallback(() => {
    setPDMeasurement(null);
    setPDMeasuring(true);
  }, []);

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
            selectedTint={selectedTint}
            onARStatusChange={setArStatus}
            onFaceShapeDetected={setFaceShape}
            captureRef={captureRef}
            pdMeasuring={pdMeasuring}
            onPDMeasured={handlePDMeasured}
            pdMeasurement={pdMeasurement}
            comparedFrames={savedLooks.map(l => l.frameId)}
          />

          </ErrorBoundary>

          {/* Compare Looks tray */}
          <div className="absolute top-16 left-4 z-20">
            <CompareTray
              looks={savedLooks}
              onRemove={handleRemoveLook}
              onSelectFrame={(id) => {
                const f =
                  GLASSES_COLLECTION.find((g) => g.id === id) ||
                  customFrames.find((g) => g.id === id);
                if (f) handleSelect(f);
              }}
              onSave={handleSaveLook}
              canSave={savedLooks.length < 4 && arStatus === 'tracking'}
            />
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 px-4 pt-3 pb-safe"
            style={{
              paddingBottom: 'max(env(safe-area-inset-bottom), 14px)',
              background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0) 100%)',
            }}
          >
            <GlassesGrid selected={selected} onSelect={handleSelect} extraFrames={customFrames} />
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
              onColorChange={handleColorChange}
              lensTints={LENS_TINT_OPTIONS}
              activeTint={selectedTint}
              onTintChange={setSelectedTint}
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
              pdMeasurement={pdMeasurement}
              pdMeasuring={pdMeasuring}
              onMeasurePD={handleStartPDMeasure}
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
