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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-zinc-100 font-semibold text-sm tracking-wide uppercase">
          Choose Frames
        </h2>
        <span className="text-zinc-500 text-xs">{GLASSES_COLLECTION.length} styles</span>
      </div>

      {/* Horizontal scroll row */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
        {GLASSES_COLLECTION.map((frame) => {
          const isSelected = frame.id === selected.id;
          return (
            <motion.button
              key={frame.id}
              onClick={() => onSelect(frame)}
              whileTap={{ scale: 0.95 }}
              className={clsx(
                'relative flex-shrink-0 snap-center flex flex-col items-center gap-2 p-3 rounded-2xl',
                'border transition-all duration-200 cursor-pointer',
                isSelected
                  ? 'border-brand-gold bg-brand-gold/10 shadow-gold-sm'
                  : 'border-brand-border bg-brand-card hover:border-zinc-600',
              )}
              style={{ minWidth: 110 }}
            >
              {/* SVG preview */}
              <div
                className="w-full flex items-center justify-center"
                style={{ height: 52 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={frame.svg}
                  alt={frame.name}
                  className="w-full object-contain"
                  style={{ maxHeight: 48 }}
                />
              </div>

              {/* Name + price */}
              <div className="text-center">
                <p
                  className={clsx(
                    'text-xs font-medium leading-tight',
                    isSelected ? 'text-brand-gold' : 'text-zinc-300',
                  )}
                >
                  {frame.name}
                </p>
                <p className="text-zinc-500 text-[10px] mt-0.5">${frame.price}</p>
              </div>

              {/* Selected checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-gold flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-black" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
