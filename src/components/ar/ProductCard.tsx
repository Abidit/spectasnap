'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Share2, Check, Sun, Moon } from 'lucide-react';
import { GLASSES_COLLECTION, type GlassesFrame, type ColorVariant, type LensTint } from '@/lib/glasses-data';
import { computeSuitability, getTopRecommendations } from '@/lib/suitability';
import type { PDMeasurement } from '@/ar/pdMeasure';
import { getFrameWidthMm } from '@/ar/presets';
import AIStylePanel from '@/components/ar/AIStylePanel';

interface ProductCardProps {
  frame: GlassesFrame;
  colorVariants?: ColorVariant[];
  activeColor?: ColorVariant | null;
  onColorChange?: (variant: ColorVariant) => void;
  /** Lens tint variants to display. */
  lensTints?: LensTint[];
  /** Currently active lens tint. */
  activeTint?: LensTint | null;
  /** Called when user taps a lens tint. */
  onTintChange?: (tint: LensTint) => void;
  /** Called when the user taps "Ask Staff for This Frame". */
  onAskStaff?: () => void;
  /** If provided, "Ask Staff" button becomes a link to this URL (e.g. WhatsApp or mailto). */
  contactHref?: string;
  /** Custom label for the contact button (default "Ask Staff for This Frame"). */
  contactLabel?: string;
  /** Detected face shape from AR pipeline — used for rule-based recommendations. */
  faceShape?: string | null;
  /** Called when user taps a recommended frame chip. */
  onSelectFrame?: (id: string) => void;
  /** Called when user taps "Share My Look". */
  onShareLook?: () => void;
  /** Current PD measurement result (null if not yet measured). */
  pdMeasurement?: PDMeasurement | null;
  /** Whether PD measurement is currently in progress. */
  pdMeasuring?: boolean;
  /** Called when user taps "Measure PD" to start measuring. */
  onMeasurePD?: () => void;
  /** Current photochromic mode (indoor/outdoor). Only relevant when Photochromic tint is active. */
  photochromicMode?: 'indoor' | 'outdoor';
  /** Called when user toggles photochromic Indoor/Outdoor mode. */
  onPhotochromicModeChange?: (mode: 'indoor' | 'outdoor') => void;
  /** Whether anti-reflective lens coating is enabled. */
  lensCoating?: boolean;
  /** Called when user toggles anti-reflective lens coating. */
  onLensCoatingChange?: (enabled: boolean) => void;
}

const ALL_OCCASIONS = ['Casual', 'Office', 'Wedding', 'Sports'] as const;

const FRAME_MAP = Object.fromEntries(GLASSES_COLLECTION.map((f) => [f.id, f]));

export default function ProductCard({
  frame,
  colorVariants,
  activeColor,
  onColorChange,
  lensTints,
  activeTint,
  onTintChange,
  onAskStaff,
  contactHref,
  contactLabel,
  faceShape,
  onSelectFrame,
  onShareLook,
  pdMeasurement,
  pdMeasuring,
  onMeasurePD,
  photochromicMode,
  onPhotochromicModeChange,
  lensCoating,
  onLensCoatingChange,
}: ProductCardProps) {
  const [activeOccasion, setActiveOccasion] = useState<string | null>(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  return (
    <div className="relative overflow-hidden" style={{ minHeight: '100%' }}>
    <AnimatePresence mode="wait">
      <motion.div
        key={frame.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-5"
      >
        {/* Frame name + style tag */}
        <div>
          <span
            className="text-[10px] font-sans font-semibold tracking-[0.14em] uppercase"
            style={{ color: '#C9A96E' }}
          >
            {frame.styleTag}
          </span>
          <h3 className="font-serif text-2xl font-semibold text-ink-900 mt-1 leading-tight">
            {frame.name}
          </h3>
          <p className="text-ink-500 text-xs font-sans mt-0.5 uppercase tracking-wider">
            {frame.style}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-cream-400" />

        {/* Color swatches */}
        {colorVariants && colorVariants.length > 0 && (
          <div>
            <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-ink-500 mb-2" role="heading" aria-level={3}>
              Frame Color
            </p>
            <div className="flex flex-wrap gap-2">
              {colorVariants.map((variant) => {
                const isActive = activeColor?.label === variant.label;
                return (
                  <button
                    key={variant.label}
                    title={variant.label}
                    onClick={() => onColorChange?.(variant)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      backgroundColor: variant.frameHex,
                      border: isActive ? '2px solid #C9A96E' : '2px solid transparent',
                      outline: isActive ? '2px solid #C9A96E' : '2px solid #DDD8CE',
                      outlineOffset: 1,
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'outline 0.12s',
                    }}
                    aria-label={`${variant.label} frame color`}
                    aria-pressed={isActive}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Lens tint picker */}
        {lensTints && lensTints.length > 0 && (
          <>
            <div className="border-t border-cream-400" />
            <div>
              <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-ink-500 mb-2" role="heading" aria-level={3}>
                Lens Tint
              </p>
              <div className="flex flex-wrap gap-1.5">
                {lensTints.map((tint) => {
                  const isActive = activeTint?.label === tint.label;
                  return (
                    <button
                      key={tint.label}
                      onClick={() => onTintChange?.(tint)}
                      className="px-2.5 py-1 text-xs font-sans font-medium transition-all duration-150"
                      style={{
                        borderRadius: 2,
                        border: isActive ? '1px solid #C9A96E' : '1px solid #DDD8CE',
                        backgroundColor: isActive ? 'rgba(201,169,110,0.12)' : '#FDFAF4',
                        color: isActive ? '#A8844A' : '#1A1612',
                      }}
                      aria-label={`${tint.label} lens tint`}
                      aria-pressed={isActive}
                    >
                      {tint.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Photochromic Indoor/Outdoor toggle */}
        {activeTint?.label === 'Photochromic' && (
          <div>
            <p
              className="text-[9px] font-sans font-semibold tracking-[0.14em] uppercase mb-2"
              style={{ color: '#C9A96E' }}
              role="heading"
              aria-level={3}
            >
              Light Condition
            </p>
            <div className="flex gap-2">
              {([
                { mode: 'indoor' as const, label: 'Indoor', Icon: Sun },
                { mode: 'outdoor' as const, label: 'Outdoor', Icon: Moon },
              ]).map(({ mode, label, Icon }) => {
                const isActive = photochromicMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => onPhotochromicModeChange?.(mode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-sans font-semibold uppercase tracking-[0.12em] border transition-colors duration-150"
                    style={{
                      borderRadius: 2,
                      borderColor: isActive ? '#C9A96E' : '#DDD8CE',
                      color: isActive ? '#C9A96E' : '#6B6560',
                      backgroundColor: isActive ? 'rgba(201,169,110,0.08)' : 'transparent',
                    }}
                    aria-pressed={isActive}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Lens Coating */}
        <div>
          <p
            className="text-[9px] font-sans font-semibold tracking-[0.14em] uppercase mb-2"
            style={{ color: '#C9A96E' }}
            role="heading"
            aria-level={3}
          >
            Lens Coating
          </p>
          <div className="flex gap-2">
            {([
              { key: false, label: 'None' },
              { key: true, label: 'Anti-Reflective' },
            ] as const).map(({ key, label }) => {
              const isActive = key === true ? !!lensCoating : !lensCoating;
              return (
                <button
                  key={label}
                  onClick={() => onLensCoatingChange?.(key)}
                  className="px-3 py-1.5 text-[10px] font-sans font-semibold uppercase tracking-[0.12em] border transition-colors duration-150"
                  style={{
                    borderRadius: 2,
                    borderColor: isActive ? '#C9A96E' : '#DDD8CE',
                    color: isActive ? '#C9A96E' : '#6B6560',
                    backgroundColor: isActive ? 'rgba(201,169,110,0.08)' : 'transparent',
                  }}
                  aria-pressed={isActive}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-cream-400" />

        {/* Suitability Score */}
        {faceShape ? (
          (() => {
            const suitability = computeSuitability(frame.style, faceShape);
            return (
              <div>
                <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-ink-500 mb-2" role="heading" aria-level={3}>
                  Suitability Score
                </p>
                <div aria-live="polite" aria-atomic="true">
                <div className="flex items-center gap-2.5 mb-2">
                  {/* Progress bar track */}
                  <div
                    className="flex-1 h-[6px] bg-cream-200 overflow-hidden"
                    style={{ borderRadius: 2 }}
                  >
                    <div
                      className="h-full transition-all duration-300 ease-out"
                      style={{
                        width: `${suitability.score}%`,
                        backgroundColor: '#C9A96E',
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  {/* Score number */}
                  <span
                    className="text-[13px] font-sans font-semibold tabular-nums"
                    style={{ color: '#C9A96E', minWidth: 22, textAlign: 'right' }}
                  >
                    {suitability.score}
                  </span>
                </div>
                {/* Verdict badge + reason */}
                <div className="flex items-start gap-2">
                  <span
                    className="shrink-0 px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-[0.1em]"
                    style={{
                      borderRadius: 2,
                      backgroundColor:
                        suitability.verdict === 'excellent'
                          ? 'rgba(201,169,110,0.18)'
                          : suitability.verdict === 'good'
                            ? '#EDE8DC'
                            : 'transparent',
                      color:
                        suitability.verdict === 'excellent'
                          ? '#A8844A'
                          : suitability.verdict === 'good'
                            ? '#6B6560'
                            : '#6B6560',
                      border:
                        suitability.verdict === 'fair'
                          ? '1px solid #DDD8CE'
                          : '1px solid transparent',
                    }}
                  >
                    {suitability.verdict === 'excellent'
                      ? 'Excellent Match'
                      : suitability.verdict === 'good'
                        ? 'Good Match'
                        : 'Fair'}
                  </span>
                </div>
                <p className="text-[12px] font-sans italic text-ink-500 mt-1.5 leading-relaxed">
                  {suitability.reason}
                </p>
                </div>
              </div>
            );
          })()
        ) : (
          <div>
            <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-ink-500 mb-2" role="heading" aria-level={3}>
              Suitability Score
            </p>
            <p className="text-ink-500 text-xs font-sans italic leading-relaxed">
              Point camera at your face to see your suitability score
            </p>
          </div>
        )}

        {/* Best for */}
        <div>
          <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-ink-500 mb-2" role="heading" aria-level={3}>
            Best For
          </p>
          <div className="flex flex-wrap gap-1.5">
            {frame.bestFor.map((shape) => (
              <span
                key={shape}
                className="px-2.5 py-1 text-xs font-sans font-medium text-ink-900
                           bg-cream-200 border border-cream-400"
                style={{ borderRadius: 2 }}
              >
                {shape}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-cream-400" />

        {/* Occasion */}
        <div>
          <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-ink-500 mb-2" role="heading" aria-level={3}>
            Occasion
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_OCCASIONS.map((occ) => {
              const supported = frame.occasions.includes(occ);
              const isActive  = activeOccasion === occ;
              return (
                <button
                  key={occ}
                  onClick={() => setActiveOccasion(isActive ? null : occ)}
                  disabled={!supported}
                  className="px-2.5 py-1 text-xs font-sans font-medium transition-all duration-150"
                  style={{
                    borderRadius: 2,
                    border: isActive
                      ? '1px solid #C9A96E'
                      : '1px solid #DDD8CE',
                    backgroundColor: isActive
                      ? 'rgba(201,169,110,0.12)'
                      : supported
                        ? '#FDFAF4'
                        : '#EDE8DC',
                    color: isActive
                      ? '#A8844A'
                      : supported
                        ? '#1A1612'
                        : '#B0ABA6',
                    cursor: supported ? 'pointer' : 'default',
                  }}
                >
                  {occ}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-cream-400" />

        {/* Recommended For You */}
        <div>
          <p className="text-[10px] font-sans font-semibold tracking-[0.14em] uppercase mb-2" style={{ color: '#C9A96E' }} role="heading" aria-level={3}>
            Recommended For You
          </p>
          {faceShape ? (
            <div className="flex flex-col gap-1.5">
              {getTopRecommendations(GLASSES_COLLECTION, faceShape, 3).map((rec) => {
                const f = FRAME_MAP[rec.frameId];
                if (!f) return null;
                const isSelected = f.id === frame.id;
                return (
                  <button
                    key={rec.frameId}
                    onClick={() => onSelectFrame?.(rec.frameId)}
                    className="text-left px-2.5 py-2 text-xs font-sans font-medium
                               bg-cream-200 text-ink-900 transition-colors duration-150
                               flex items-center justify-between gap-2"
                    style={{
                      borderRadius: 2,
                      border: isSelected ? '1px solid #C9A96E' : '1px solid #DDD8CE',
                      color: isSelected ? '#A8844A' : '#1A1612',
                    }}
                  >
                    <span>{f.name}</span>
                    <span
                      className="shrink-0 text-[10px] font-sans font-semibold tabular-nums px-1.5 py-0.5"
                      style={{
                        borderRadius: 2,
                        backgroundColor: rec.score >= 80 ? 'rgba(201,169,110,0.18)' : '#EDE8DC',
                        color: rec.score >= 80 ? '#A8844A' : '#6B6560',
                      }}
                    >
                      {rec.score}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-ink-500 text-xs font-sans italic leading-relaxed">
              Point camera at your face to get recommendations
            </p>
          )}
        </div>

        {/* AI Recommendation trigger */}
        <button
          onClick={() => setAiPanelOpen(true)}
          className="w-full py-2.5 text-sm font-sans text-ink-500 border border-cream-400
                     hover:border-gold-500 hover:text-ink-900 transition-colors duration-150
                     flex items-center justify-center gap-1.5"
          style={{ borderRadius: 2 }}
          aria-label="Get AI frame recommendation"
        >
          <span style={{ color: '#C9A96E' }}>✦</span>
          Get AI Recommendation
        </button>

        {/* Divider */}
        <div className="border-t border-cream-400" />

        {/* Staff note */}
        <div>
          <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-ink-500 mb-2" role="heading" aria-level={3}>
            Staff Note
          </p>
          <p className="text-ink-900 text-sm font-sans leading-relaxed italic">
            &ldquo;{frame.staffNote}&rdquo;
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-cream-400" />

        {/* PD Measurement */}
        <div>
          <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-ink-500 mb-2" role="heading" aria-level={3}>
            Pupillary Distance
          </p>
          <div aria-live="polite" aria-atomic="true">
          {pdMeasurement?.stable ? (
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-2 px-2.5 py-1.5"
                style={{
                  borderRadius: 2,
                  border: '1px solid #C9A96E',
                  backgroundColor: 'rgba(201,169,110,0.08)',
                }}
              >
                <Check className="w-3.5 h-3.5" style={{ color: '#C9A96E' }} />
                <span className="text-sm font-sans font-semibold tabular-nums" style={{ color: '#A8844A' }}>
                  PD: {pdMeasurement.pdMm} mm
                </span>
              </div>
              <button
                onClick={onMeasurePD}
                className="text-[11px] font-sans font-medium underline underline-offset-2 transition-colors"
                style={{ color: '#6B6560' }}
                aria-label="Re-measure pupillary distance"
              >
                Re-measure
              </button>
            </div>
          ) : pdMeasuring ? (
            <div className="flex items-center gap-2.5 py-1">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor: '#C9A96E',
                  animation: 'pd-pulse 1.2s ease-in-out infinite',
                }}
              />
              <span className="text-xs font-sans font-medium text-ink-500">
                Measuring{pdMeasurement ? ` (${pdMeasurement.pdMm} mm)` : ''}...
              </span>
              <style>{`
                @keyframes pd-pulse {
                  0%, 100% { opacity: 0.3; transform: scale(0.85); }
                  50%       { opacity: 1; transform: scale(1.15); }
                }
              `}</style>
            </div>
          ) : (
            <button
              onClick={onMeasurePD}
              className="w-full py-2.5 font-sans font-semibold text-xs tracking-wide
                         bg-ink-900 text-cream-50 hover:opacity-90 active:scale-[0.98]
                         transition-all duration-150"
              style={{ borderRadius: 2 }}
              aria-label="Measure pupillary distance"
            >
              Measure PD
            </button>
          )}
          </div>
        </div>

        {/* Frame Fit Indicator — shown when PD is stable */}
        {pdMeasurement?.stable && (() => {
          const frameWidth = getFrameWidthMm(frame.id);
          if (frameWidth === null) return null;

          const pd = pdMeasurement.pdMm;
          const idealMin = pd + 20;
          const idealMax = pd + 32;

          type FitCategory = 'narrow' | 'ideal' | 'wide';
          let fit: FitCategory;
          if (frameWidth < idealMin) fit = 'narrow';
          else if (frameWidth > idealMax) fit = 'wide';
          else fit = 'ideal';

          const segments: { key: FitCategory; label: string }[] = [
            { key: 'narrow', label: 'Narrow' },
            { key: 'ideal', label: 'Ideal' },
            { key: 'wide', label: 'Wide' },
          ];

          return (
            <>
              <div className="border-t border-cream-400" />
              <div aria-live="polite" aria-atomic="true">
                <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-ink-500 mb-2" role="heading" aria-level={3}>
                  Frame Fit
                </p>
                <p className="text-[11px] font-sans text-ink-500 mb-2.5">
                  Frame width {frameWidth} mm vs PD {pd} mm
                </p>
                {/* 3-segment scale bar */}
                <div className="flex gap-0.5 mb-2" style={{ height: 6 }}>
                  {segments.map((seg) => (
                    <div
                      key={seg.key}
                      className="flex-1 transition-colors duration-200"
                      style={{
                        borderRadius: 2,
                        backgroundColor:
                          seg.key === fit
                            ? seg.key === 'ideal'
                              ? '#C9A96E'
                              : '#6B6560'
                            : '#EDE8DC',
                      }}
                    />
                  ))}
                </div>
                {/* Labels */}
                <div className="flex">
                  {segments.map((seg) => (
                    <span
                      key={seg.key}
                      className="flex-1 text-center text-[10px] font-sans font-semibold uppercase tracking-[0.12em] transition-colors duration-200"
                      style={{
                        color:
                          seg.key === fit
                            ? seg.key === 'ideal'
                              ? '#A8844A'
                              : '#1A1612'
                            : '#B0ABA6',
                      }}
                    >
                      {seg.label}
                    </span>
                  ))}
                </div>
              </div>
            </>
          );
        })()}

        {/* Divider */}
        <div className="border-t border-cream-400" />

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          {contactHref ? (
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 font-sans font-semibold text-sm tracking-wide
                         bg-ink-900 text-cream-50 hover:opacity-90 transition-opacity
                         text-center inline-flex items-center justify-center"
              style={{ borderRadius: 2, minHeight: 44, textDecoration: 'none' }}
              aria-label={contactLabel || `Ask staff about ${frame.name}`}
            >
              {contactLabel || 'Ask Staff for This Frame'}
            </a>
          ) : (
            <button
              onClick={onAskStaff}
              className="w-full py-3 font-sans font-semibold text-sm tracking-wide
                         bg-ink-900 text-cream-50 hover:opacity-90 active:scale-[0.98]
                         transition-all duration-150"
              style={{ borderRadius: 2 }}
              aria-label={`Ask staff about ${frame.name}`}
            >
              Ask Staff for This Frame
            </button>
          )}
          <button
            onClick={onShareLook}
            className="w-full py-2.5 flex items-center justify-center gap-2 font-sans font-semibold text-sm
                       tracking-wide border border-cream-400 text-ink-900
                       hover:border-ink-900 transition-colors duration-150"
            style={{ borderRadius: 2 }}
            aria-label={`Share your look with ${frame.name}`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share My Look
          </button>
        </div>
      </motion.div>
    </AnimatePresence>

    {/* AI Stylist slide-in panel */}
    <AIStylePanel
      open={aiPanelOpen}
      onClose={() => setAiPanelOpen(false)}
      faceShape={faceShape}
      onSelectFrame={onSelectFrame}
    />
    </div>
  );
}
