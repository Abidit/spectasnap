'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { GLASSES_COLLECTION, type GlassesFrame, type ColorVariant } from '@/lib/glasses-data';

interface ProductCardProps {
  frame: GlassesFrame;
  colorVariants?: ColorVariant[];
  activeColor?: ColorVariant | null;
  onColorChange?: (variant: ColorVariant) => void;
  /** Called when the user taps "Ask Staff for This Frame". */
  onAskStaff?: () => void;
  /** Detected face shape from AR pipeline — used for rule-based recommendations. */
  faceShape?: string | null;
  /** Called when user taps a recommended frame chip. */
  onSelectFrame?: (id: string) => void;
  /** Called when user taps "Share My Look". */
  onShareLook?: () => void;
}

const ALL_OCCASIONS = ['Casual', 'Office', 'Wedding', 'Sports'] as const;

// Rule-based recommendations per face shape (IDs from GLASSES_COLLECTION)
const SHAPE_RECS: Record<string, string[]> = {
  oval:   ['glb-aviator',    'glb-wayfarer',    'glb-round-metal'],
  round:  ['glb-wayfarer',   'glb-cat-eye',     'glb-aviator'],
  square: ['glb-round-metal','glb-cat-eye',      'glb-aviator'],
  heart:  ['glb-aviator',    'glb-cat-eye',      'glb-wayfarer'],
  oblong: ['glb-wayfarer',   'glb-sport-wrap',   'glb-round-metal'],
};

const FRAME_MAP = Object.fromEntries(GLASSES_COLLECTION.map((f) => [f.id, f]));

export default function ProductCard({
  frame,
  colorVariants,
  activeColor,
  onColorChange,
  onAskStaff,
  faceShape,
  onSelectFrame,
  onShareLook,
}: ProductCardProps) {
  const [activeOccasion, setActiveOccasion] = useState<string | null>(null);

  return (
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
          <h3 className="font-serif text-2xl font-semibold text-brand-text mt-1 leading-tight">
            {frame.name}
          </h3>
          <p className="text-brand-muted text-xs font-sans mt-0.5 uppercase tracking-wider">
            {frame.style}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-brand-border" />

        {/* Color swatches */}
        {colorVariants && colorVariants.length > 0 && (
          <div>
            <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-brand-muted mb-2">
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
                    aria-label={variant.label}
                    aria-pressed={isActive}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-brand-border" />

        {/* Best for */}
        <div>
          <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-brand-muted mb-2">
            Best For
          </p>
          <div className="flex flex-wrap gap-1.5">
            {frame.bestFor.map((shape) => (
              <span
                key={shape}
                className="px-2.5 py-1 text-xs font-sans font-medium text-brand-text
                           bg-brand-secondary border border-brand-border"
                style={{ borderRadius: 2 }}
              >
                {shape}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-brand-border" />

        {/* Occasion */}
        <div>
          <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-brand-muted mb-2">
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
        <div className="border-t border-brand-border" />

        {/* Recommended For You */}
        <div>
          <p className="text-[10px] font-sans font-semibold tracking-[0.14em] uppercase mb-2" style={{ color: '#C9A96E' }}>
            Recommended For You
          </p>
          {faceShape ? (
            <div className="flex flex-col gap-1.5">
              {(SHAPE_RECS[faceShape.toLowerCase()] ?? SHAPE_RECS.oval).map((id) => {
                const f = FRAME_MAP[id];
                if (!f) return null;
                const isSelected = f.id === frame.id;
                return (
                  <button
                    key={id}
                    onClick={() => onSelectFrame?.(id)}
                    className="text-left px-2.5 py-2 text-xs font-sans font-medium
                               bg-brand-secondary text-brand-text transition-colors duration-150"
                    style={{
                      borderRadius: 2,
                      border: isSelected ? '1px solid #C9A96E' : '1px solid #DDD8CE',
                      color: isSelected ? '#A8844A' : '#1A1612',
                    }}
                  >
                    {f.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-brand-muted text-xs font-sans italic leading-relaxed">
              Point camera at your face to get recommendations
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-brand-border" />

        {/* Staff note */}
        <div>
          <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-brand-muted mb-2">
            Staff Note
          </p>
          <p className="text-brand-text text-sm font-sans leading-relaxed italic">
            &ldquo;{frame.staffNote}&rdquo;
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-brand-border" />

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onAskStaff}
            className="w-full py-3 font-sans font-semibold text-sm tracking-wide
                       bg-brand-text text-brand-page hover:opacity-90 active:scale-[0.98]
                       transition-all duration-150"
            style={{ borderRadius: 2 }}
          >
            Ask Staff for This Frame
          </button>
          <button
            onClick={onShareLook}
            className="w-full py-2.5 flex items-center justify-center gap-2 font-sans font-semibold text-sm
                       tracking-wide border border-brand-border text-brand-text
                       hover:border-brand-text transition-colors duration-150"
            style={{ borderRadius: 2 }}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share My Look
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
