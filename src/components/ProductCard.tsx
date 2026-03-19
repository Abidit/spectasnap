'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { GlassesFrame, ColorVariant } from '@/lib/glasses-data';

interface ProductCardProps {
  frame: GlassesFrame;
  colorVariants?: ColorVariant[];
  activeColor?: ColorVariant | null;
  onColorChange?: (variant: ColorVariant) => void;
  /** Called when the user taps "Ask Staff for This Frame". */
  onAskStaff?: () => void;
}

const ALL_OCCASIONS = ['Casual', 'Office', 'Wedding', 'Sports'] as const;

export default function ProductCard({
  frame,
  colorVariants,
  activeColor,
  onColorChange,
  onAskStaff,
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

        {/* CTA */}
        <button
          onClick={onAskStaff}
          className="w-full py-3 font-sans font-semibold text-sm tracking-wide
                     bg-brand-text text-brand-page hover:opacity-90 active:scale-[0.98]
                     transition-all duration-150"
          style={{ borderRadius: 2 }}
        >
          Ask Staff for This Frame
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
