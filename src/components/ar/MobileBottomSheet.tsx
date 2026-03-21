'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import type { GlassesFrame, ColorVariant, LensTint } from '@/lib/glasses-data';

export type SnapHeight = 'collapsed' | 'half' | 'full';

interface RecommendedFrame {
  id: string;
  name: string;
  why: string;
}

interface MobileBottomSheetProps {
  frame: GlassesFrame;
  faceShape: string | null;
  colorVariants?: ColorVariant[];
  activeColor?: ColorVariant | null;
  onColorChange?: (v: ColorVariant) => void;
  lensTints?: LensTint[];
  activeTint?: LensTint | null;
  onTintChange?: (t: LensTint) => void;
  onAskStaff?: () => void;
  onShareLook?: () => void;
  staffNote?: string;
  recommendations?: RecommendedFrame[];
  onSelectFrame?: (id: string) => void;
}

// Pixel heights for each snap point
const SNAP: Record<SnapHeight, number> = {
  collapsed: 72,
  half: 300,
  full: Math.round(typeof window !== 'undefined' ? window.innerHeight * 0.85 : 600),
};

const SNAP_ORDER: SnapHeight[] = ['collapsed', 'half', 'full'];

export default function MobileBottomSheet({
  frame,
  faceShape,
  colorVariants = [],
  activeColor,
  onColorChange,
  lensTints = [],
  activeTint,
  onTintChange,
  onAskStaff,
  onShareLook,
  staffNote,
  recommendations = [],
  onSelectFrame,
}: MobileBottomSheetProps) {
  const [snap, setSnap] = useState<SnapHeight>('collapsed');
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const dragStartH = useRef<number>(SNAP.collapsed);
  const isDragging = useRef(false);
  const currentH = useRef(SNAP.collapsed);

  // Recalculate full height on resize
  useEffect(() => {
    function onResize() {
      SNAP.full = Math.round(window.innerHeight * 0.85);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Apply height via direct DOM style for smoothness
  function applyHeight(h: number) {
    if (!sheetRef.current) return;
    currentH.current = h;
    sheetRef.current.style.height = `${h}px`;
  }

  // Snap to nearest height
  function snapTo(targetSnap: SnapHeight) {
    setSnap(targetSnap);
    applyHeight(SNAP[targetSnap]);
  }

  // Cycle through snap heights on handle tap
  function handleTap() {
    if (isDragging.current) return;
    const current = SNAP_ORDER.indexOf(snap);
    const next = SNAP_ORDER[(current + 1) % SNAP_ORDER.length];
    snapTo(next);
  }

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = false;
    dragStartY.current = e.touches[0].clientY;
    dragStartH.current = currentH.current;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    const dy = dragStartY.current - e.touches[0].clientY; // positive = dragging up
    const newH = Math.max(48, Math.min(SNAP.full + 20, dragStartH.current + dy));
    applyHeight(newH);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    const h = currentH.current;
    const midHalf = (SNAP.collapsed + SNAP.half) / 2;
    const midFull  = (SNAP.half + SNAP.full) / 2;
    if (h < midHalf) {
      snapTo('collapsed');
    } else if (h < midFull) {
      snapTo('half');
    } else {
      snapTo('full');
    }
    isDragging.current = false;
  }, [snap]); // eslint-disable-line react-hooks/exhaustive-deps

  const isExpanded = snap !== 'collapsed';

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 z-40 bg-cream-50 overflow-hidden"
      style={{
        height: SNAP.collapsed,
        borderRadius: '12px 12px 0 0',
        boxShadow: '0 -4px 24px rgba(26,22,18,0.08)',
        transition: isDragging.current ? 'none' : 'height 0.3s cubic-bezier(0.32,0.72,0,1)',
      }}
    >
      {/* Pull handle */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleTap}
        role="button"
        aria-label={`Panel ${snap}. Tap to expand.`}
        className="flex justify-center pt-3 pb-2 cursor-pointer select-none"
      >
        <div className="w-10 h-1 bg-cream-400 rounded-full" />
      </div>

      {/* ─── COLLAPSED row ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pb-2 overflow-hidden" style={{ height: 36 }}>
        {/* Frame name */}
        <span className="font-serif text-base font-semibold text-ink-900 truncate flex-1">
          {frame.name}
        </span>

        {/* Face shape */}
        {faceShape && (
          <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-ink-300 flex-shrink-0">
            {faceShape}
          </span>
        )}

        {/* Color swatches (up to 5) */}
        <div className="flex gap-1 flex-shrink-0">
          {colorVariants.slice(0, 5).map((v) => (
            <button
              key={v.label}
              onClick={(e) => { e.stopPropagation(); onColorChange?.(v); }}
              aria-label={v.label}
              className="w-5 h-5 rounded-full border-2 transition-all"
              style={{
                backgroundColor: v.frameHex,
                borderColor: activeColor?.label === v.label ? '#C9A96E' : '#DDD8CE',
                transform: activeColor?.label === v.label ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Share icon */}
        <button
          onClick={(e) => { e.stopPropagation(); onShareLook?.(); }}
          aria-label="Share look"
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-ink-300"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* ─── HALF / FULL content ─────────────────────────────────────────── */}
      {isExpanded && (
        <div
          className="overflow-y-auto px-4"
          style={{
            height: `calc(100% - 72px)`,
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)',
          }}
        >
          {/* Frame name + style tag */}
          <div className="mb-4">
            <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.14em] text-gold-500 mb-0.5">
              {frame.styleTag}
            </p>
            <p className="font-serif text-2xl font-semibold text-ink-900 leading-tight">
              {frame.name}
            </p>
          </div>

          {/* Color swatches (all) */}
          {colorVariants.length > 0 && (
            <section className="mb-4">
              <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-ink-300 mb-2">
                Frame Finish
              </p>
              <div className="flex gap-2 flex-wrap">
                {colorVariants.map((v) => (
                  <button
                    key={v.label}
                    onClick={() => onColorChange?.(v)}
                    aria-label={v.label}
                    title={v.label}
                    className="w-7 h-7 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: v.frameHex,
                      borderColor: activeColor?.label === v.label ? '#C9A96E' : '#DDD8CE',
                      transform: activeColor?.label === v.label ? 'scale(1.15)' : 'scale(1)',
                      outline: activeColor?.label === v.label ? '2px solid #C9A96E' : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Lens tints */}
          {lensTints.length > 0 && (
            <section className="mb-4">
              <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-ink-300 mb-2">
                Lens Tint
              </p>
              <div className="flex gap-2 flex-wrap">
                {lensTints.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => onTintChange?.(t)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sharp border text-xs font-sans
                               transition-colors"
                    style={{
                      borderColor: activeTint?.label === t.label ? '#C9A96E' : '#DDD8CE',
                      backgroundColor: activeTint?.label === t.label ? '#F7EDD8' : '#F5F0E8',
                      color: activeTint?.label === t.label ? '#A8844A' : '#6B6560',
                    }}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-cream-400 flex-shrink-0"
                      style={{ backgroundColor: t.lensHex }}
                    />
                    {t.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Occasion pills */}
          {frame.occasions && frame.occasions.length > 0 && (
            <section className="mb-4">
              <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-ink-300 mb-2">
                Occasion
              </p>
              <div className="grid grid-cols-2 gap-2">
                {frame.occasions.slice(0, 4).map((occ) => (
                  <div
                    key={occ}
                    className="px-3 py-2 rounded-sharp border border-cream-400 bg-cream-50
                               text-xs font-sans text-ink-500 text-center"
                  >
                    {occ}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Only show in full snap */}
          {snap === 'full' && (
            <>
              {/* Recommendations */}
              {recommendations.length > 0 && (
                <section className="mb-4">
                  <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-ink-300 mb-2">
                    Recommended for You
                  </p>
                  <div className="flex flex-col gap-2">
                    {recommendations.map((rec) => (
                      <button
                        key={rec.id}
                        onClick={() => onSelectFrame?.(rec.id)}
                        className="flex items-center gap-3 p-3 rounded-sharp border border-cream-400
                                   bg-cream-100 text-left hover:border-gold-500 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-sans font-semibold text-ink-900 truncate">{rec.name}</p>
                          <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">{rec.why}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Staff note */}
              {staffNote && (
                <section className="mb-4 p-3 rounded-sharp bg-gold-100 border border-gold-500/30">
                  <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-gold-600 mb-1">
                    Staff Note
                  </p>
                  <p className="text-sm font-serif italic text-ink-900">{staffNote}</p>
                </section>
              )}
            </>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-2 mt-2 pb-2">
            <button
              onClick={onAskStaff}
              className="w-full py-3 font-sans font-semibold text-sm tracking-wide
                         bg-ink-900 text-cream-50 rounded-sharp hover:bg-ink-500 transition-colors"
              style={{ minHeight: 44 }}
            >
              Ask Staff for Help
            </button>
            <button
              onClick={onShareLook}
              className="w-full py-3 font-sans font-semibold text-sm tracking-wide
                         bg-transparent border border-cream-400 text-ink-900 rounded-sharp
                         hover:bg-cream-200 transition-colors"
              style={{ minHeight: 44 }}
            >
              Share My Look
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
