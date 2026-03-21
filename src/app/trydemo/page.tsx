'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { GLASSES_COLLECTION, LENS_TINT_OPTIONS, type GlassesFrame, type ColorVariant, type LensTint } from '@/lib/glasses-data';
import { loadCustomFrame } from '@/ar/customFrameLoader';
import { COLOR_VARIANTS } from '@/ar/presets';
import type { PDMeasurement } from '@/ar/pdMeasure';
import GlassesGrid from '@/components/ar/GlassesGrid';
import ProductCard from '@/components/ar/ProductCard';
import ShareModal from '@/components/ar/ShareModal';
import CompareTray, { type SavedLook } from '@/components/ar/CompareTray';
import MobileBottomSheet from '@/components/ar/MobileBottomSheet';
import ARStatusBadge, { type ARStatusKind } from '@/components/ar/ARStatusBadge';
import FeedbackToast, { type ToastData } from '@/components/FeedbackToast';
import ErrorBoundary from '@/components/ErrorBoundary';
import OfflineBanner from '@/components/OfflineBanner';
import type { RecordingState, RecordingResult } from '@/ar/recorder';
import { ARRecorder } from '@/ar/recorder';

const ARCamera = dynamic(() => import('@/components/ar/ARCamera'), { ssr: false });

export default function TryDemoPage() {
  return (
    <Suspense>
      <TryDemo />
    </Suspense>
  );
}

function TryDemo() {
  const searchParams = useSearchParams();
  const storeName = searchParams.get('store') || '';

  const [isIdle, setIsIdle] = useState(true);
  const [selected, setSelected] = useState<GlassesFrame>(GLASSES_COLLECTION[0]);
  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null);
  const [selectedTint, setSelectedTint] = useState<LensTint | null>(null);
  const [arStatus, setArStatus] = useState<ARStatusKind>('idle');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [faceShape, setFaceShape] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareDataUrl, setShareDataUrl] = useState<string | null>(null);
  const [shareMediaType, setShareMediaType] = useState<'image' | 'video'>('image');
  const [pdMeasurement, setPDMeasurement] = useState<PDMeasurement | null>(null);
  const [pdMeasuring, setPDMeasuring] = useState(false);
  const [customFrames, setCustomFrames] = useState<GlassesFrame[]>([]);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [isRecordingSupported, setIsRecordingSupported] = useState(false);
  const captureRef = useRef<(() => string | null) | null>(null);

  useEffect(() => {
    setIsRecordingSupported(ARRecorder.isSupported());
  }, []);

  // Load custom frame from localStorage when ?customFrame=true
  useEffect(() => {
    if (searchParams.get('customFrame') !== 'true') return;
    const data = loadCustomFrame();
    if (!data) return;

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
      svg: data.dataUrl,
      scaleFactor: data.widthScale,
      yOffset: 0,
      colorVariants: COLOR_VARIANTS,
    };

    setCustomFrames([customFrame]);
    setSelected(customFrame);
    setToast({ message: `Custom frame "${data.name || 'Custom Frame'}" loaded!`, type: 'success' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelect(frame: GlassesFrame) {
    setSelected(frame);
    setSelectedColor(null);
    setSelectedTint(null);
  }

  function handleColorChange(variant: ColorVariant) {
    setSelectedColor(variant);
    setSelectedTint(null);
  }

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

  const handleAskStaff = useCallback(() => {
    setToast({
      message: `"${selected.name}" — a staff member will assist you shortly.`,
      type: 'success',
    });
  }, [selected.name]);

  const handleShareLook = useCallback(() => {
    setShareMediaType('image');
    setShareDataUrl(captureRef.current?.() ?? null);
    setShareOpen(true);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const handlePDMeasured = useCallback((pd: PDMeasurement) => {
    setPDMeasurement(pd);
    if (pd.stable) {
      setPDMeasuring(false);
      setToast({ message: `PD measured: ${pd.pdMm} mm`, type: 'success' });
    }
  }, []);

  const handleToggleRecording = useCallback(() => {
    if (recording) {
      setRecording(false);
    } else {
      setRecording(true);
    }
  }, [recording]);

  const handleRecordingComplete = useCallback((result: RecordingResult) => {
    setRecording(false);
    setShareMediaType('video');
    setShareDataUrl(result.url);
    setShareOpen(true);
  }, []);

  // ─── IDLE SCREEN ─────────────────────────────────────────────────────────────
  if (isIdle) {
    return (
      <div
        className="relative flex flex-col items-center justify-center overflow-hidden"
        style={{ height: '100dvh', backgroundColor: '#0A0A0A' }}
      >
        {/* Store name top-right */}
        {storeName && (
          <p
            className="absolute top-4 right-4 text-xs font-sans tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            {storeName}
          </p>
        )}

        {/* Gold pulsing ring */}
        <div
          className="absolute pointer-events-none animate-pulse"
          style={{
            width: 300,
            height: 300,
            borderRadius: '50%',
            border: '4px solid rgba(201,169,110,0.2)',
          }}
        />

        {/* 4 corner brackets */}
        <div className="absolute top-6 left-6 pointer-events-none" style={{ opacity: 0.4 }}>
          <div style={{ width: 20, height: 2, backgroundColor: '#C9A96E' }} />
          <div style={{ width: 2, height: 20, backgroundColor: '#C9A96E' }} />
        </div>
        <div className="absolute top-6 right-6 pointer-events-none flex flex-col items-end" style={{ opacity: 0.4 }}>
          <div style={{ width: 20, height: 2, backgroundColor: '#C9A96E' }} />
          <div style={{ width: 2, height: 20, backgroundColor: '#C9A96E' }} />
        </div>
        <div className="absolute bottom-6 left-6 pointer-events-none flex flex-col justify-end" style={{ opacity: 0.4 }}>
          <div style={{ width: 2, height: 20, backgroundColor: '#C9A96E' }} />
          <div style={{ width: 20, height: 2, backgroundColor: '#C9A96E' }} />
        </div>
        <div className="absolute bottom-6 right-6 pointer-events-none flex flex-col items-end justify-end" style={{ opacity: 0.4 }}>
          <div style={{ width: 2, height: 20, backgroundColor: '#C9A96E' }} />
          <div style={{ width: 20, height: 2, backgroundColor: '#C9A96E' }} />
        </div>

        {/* Center content */}
        <div className="relative z-10 text-center px-8 flex flex-col items-center gap-3">
          <p className="font-serif text-4xl font-semibold text-cream-50 leading-tight">
            Specta<em style={{ color: '#C9A96E', fontStyle: 'italic' }}>Snap</em>
          </p>
          <p className="font-serif text-xl italic text-cream-50/60 mt-1">
            See yourself in every frame.
          </p>
          <p className="text-ink-300 text-sm font-sans mt-1">
            Move naturally — glasses track with you.
          </p>

          <button
            onClick={() => setIsIdle(false)}
            className="font-sans font-semibold text-sm uppercase tracking-widest
                       transition-all hover:opacity-90 active:scale-[0.97]"
            style={{
              marginTop: 32,
              backgroundColor: '#C9A96E',
              color: '#1A1612',
              borderRadius: 2,
              padding: '16px 40px',
              minHeight: 56,
              letterSpacing: '0.12em',
            }}
          >
            Tap to Begin
          </button>
        </div>

        {/* Privacy note */}
        <p
          className="absolute bottom-6 font-sans text-center uppercase tracking-widest"
          style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)' }}
        >
          All data private · Nothing stored
        </p>
      </div>
    );
  }

  // ─── ACTIVE LAYOUT ────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col md:flex-row overflow-hidden"
      style={{ height: '100dvh', maxHeight: '100dvh' }}
    >
      <OfflineBanner />

      {/* ── Camera area (left / full-width on mobile) ── */}
      <div className="relative flex-1 bg-dark overflow-hidden">
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
            comparedFrames={savedLooks.map((l) => l.frameId)}
            recording={recording}
            onRecordingStateChange={setRecordingState}
            onRecordingComplete={handleRecordingComplete}
          />
        </ErrorBoundary>

        {/* Top overlays — AR status + store name + controls */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-20 pointer-events-none">
          {/* Left: AR status badge + compare tray */}
          <div className="flex flex-col gap-2 pointer-events-auto">
            <ARStatusBadge status={arStatus} />
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
              onShareCollage={(collageUrl) => {
                setShareMediaType('image');
                setShareDataUrl(collageUrl);
                setShareOpen(true);
              }}
            />
          </div>

          {/* Center: store name */}
          {storeName && (
            <p
              className="text-xs font-sans tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              {storeName}
            </p>
          )}

          {/* Right: exit + record */}
          <div className="flex flex-col gap-2 items-end pointer-events-auto">
            <button
              onClick={() => setIsIdle(true)}
              className="flex items-center justify-center bg-black/60 backdrop-blur-sm border border-white/15 text-white/70 hover:text-white transition-colors"
              style={{ borderRadius: 2, width: 32, height: 32 }}
              aria-label="Exit AR"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {isRecordingSupported && (
              <button
                onClick={handleToggleRecording}
                className="flex items-center gap-1.5 px-2.5 py-1.5 font-sans font-semibold text-xs tracking-wide transition-all"
                style={{
                  borderRadius: 2,
                  backgroundColor: recording ? 'rgba(220,38,38,0.9)' : 'rgba(10,10,10,0.6)',
                  color: '#fff',
                  border: recording ? '1px solid rgba(220,38,38,1)' : '1px solid rgba(255,255,255,0.2)',
                }}
                aria-label={recording ? 'Stop recording' : 'Start recording'}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: recording ? 2 : '50%',
                    backgroundColor: recording ? '#fff' : '#DC2626',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                {recording ? `REC${recordingState === 'recording' ? '' : '…'}` : 'REC'}
              </button>
            )}
          </div>
        </div>

        {/* Frame bar — bottom of camera area */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 pt-3"
          style={{
            paddingBottom: 'max(env(safe-area-inset-bottom), 14px)',
            background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0) 100%)',
          }}
        >
          <GlassesGrid selected={selected} onSelect={handleSelect} extraFrames={customFrames} />
        </div>
      </div>

      {/* ── Desktop/Tablet sidebar ── */}
      <aside
        className="hidden md:flex flex-col border-l border-cream-400 bg-cream-50 overflow-y-auto"
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
            onShareLook={handleShareLook}
            pdMeasurement={pdMeasurement}
            pdMeasuring={pdMeasuring}
            onMeasurePD={() => { setPDMeasurement(null); setPDMeasuring(true); }}
          />
        </div>
        <div className="px-6 py-4 border-t border-cream-400">
          <p className="text-ink-300 text-[10px] text-center font-sans tracking-wide">
            Powered by MediaPipe · SpectaSnap AR © 2026
          </p>
        </div>
      </aside>

      {/* ── Mobile bottom sheet (replaces sidebar on mobile) ── */}
      <div className="md:hidden">
        <MobileBottomSheet
          frame={selected}
          faceShape={faceShape}
          colorVariants={selected.colorVariants ?? []}
          activeColor={selectedColor}
          onColorChange={handleColorChange}
          lensTints={LENS_TINT_OPTIONS}
          activeTint={selectedTint}
          onTintChange={setSelectedTint}
          onAskStaff={handleAskStaff}
          onShareLook={handleShareLook}
          onSelectFrame={(id) => {
            const f = GLASSES_COLLECTION.find((g) => g.id === id);
            if (f) handleSelect(f);
          }}
        />
      </div>

      {/* Share modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => {
          setShareOpen(false);
          setShareDataUrl(null);
          setShareMediaType('image');
        }}
        dataUrl={shareDataUrl}
        mediaType={shareMediaType}
      />

      {/* Feedback toast */}
      <FeedbackToast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
