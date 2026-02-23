'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { GLASSES_COLLECTION, type GlassesFrame } from '@/lib/glasses-data';
import clsx from 'clsx';

interface GlassesGridProps {
  selected: GlassesFrame;
  onSelect: (frame: GlassesFrame) => void;
}

export default function GlassesGrid({ selected, onSelect }: GlassesGridProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-white/80 font-sans font-medium text-xs tracking-[0.12em] uppercase">
          Choose Frames
        </h2>
        <span className="text-white/40 text-xs font-sans">{GLASSES_COLLECTION.length} styles</span>
      </div>

      {/* Horizontal scroll row */}
      <div className="flex gap-2.5 overflow-x-auto pb-0.5 scrollbar-hide snap-x snap-mandatory">
        {GLASSES_COLLECTION.map((frame) => {
          const isSelected = frame.id === selected.id;
          return (
            <motion.button
              key={frame.id}
              onClick={() => onSelect(frame)}
              whileTap={{ scale: 0.96 }}
              className={clsx(
                'relative flex-shrink-0 snap-center flex flex-col items-center gap-1.5 px-3 pt-3 pb-2.5',
                'border transition-all duration-200 cursor-pointer',
                isSelected
                  ? 'border-brand-gold bg-white/10'
                  : 'border-white/15 bg-white/6 hover:border-white/30',
              )}
              style={{ minWidth: 100, borderRadius: 2 }}
            >
              {/* SVG preview on dark bg */}
              <div className="w-full flex items-center justify-center" style={{ height: 46 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={frame.svg}
                  alt={frame.name}
                  className="w-full object-contain"
                  style={{ maxHeight: 42 }}
                />
              </div>

              {/* Name — no price */}
              <div className="text-center">
                <p
                  className="text-[11px] font-sans font-medium leading-tight"
                  style={{ color: isSelected ? '#C9A96E' : 'rgba(255,255,255,0.75)' }}
                >
                  {frame.name}
                </p>
                <p
                  className="text-[9px] font-sans tracking-widest uppercase mt-0.5"
                  style={{ color: isSelected ? '#A8844A' : 'rgba(255,255,255,0.35)' }}
                >
                  {frame.styleTag}
                </p>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center"
                  style={{ backgroundColor: '#C9A96E', borderRadius: 2 }}
                >
                  <Check className="w-2.5 h-2.5 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
