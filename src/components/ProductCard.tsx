'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Star } from 'lucide-react';
import { useState } from 'react';
import type { GlassesFrame } from '@/lib/glasses-data';

interface ProductCardProps {
  frame: GlassesFrame;
}

export default function ProductCard({ frame }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);

  function handleAddToCart() {
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={frame.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22 }}
        className="flex flex-col gap-4"
      >
        {/* Brand + style tag */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-widest">{frame.brand}</p>
            <h3 className="text-white text-xl font-semibold mt-0.5">{frame.name}</h3>
          </div>
          <button
            onClick={() => setLiked((v) => !v)}
            className="p-2 rounded-full border border-brand-border hover:border-red-500/50 transition-colors"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-zinc-400'}`}
            />
          </button>
        </div>

        {/* Style chip */}
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-xs font-medium border"
            style={{
              color: frame.color,
              borderColor: frame.color + '55',
              backgroundColor: frame.color + '15',
            }}
          >
            {frame.style}
          </span>
          <span className="flex items-center gap-1 text-amber-400 text-xs">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>4.8</span>
            <span className="text-zinc-500">(214)</span>
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">${frame.price}</span>
          <span className="text-zinc-500 text-sm line-through">
            ${Math.round(frame.price * 1.3)}
          </span>
          <span className="text-emerald-400 text-xs font-medium">23% off</span>
        </div>

        {/* Color swatch */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 text-xs">Color:</span>
          <button
            className="w-6 h-6 rounded-full border-2 border-brand-gold ring-2 ring-brand-gold/30"
            style={{ backgroundColor: frame.color }}
          />
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          className="relative w-full py-3 rounded-full font-semibold text-sm overflow-hidden
                     bg-brand-gold text-black hover:bg-amber-400 active:scale-[0.98]
                     transition-all duration-150 shadow-gold-sm"
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span
                key="added"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex items-center justify-center gap-2"
              >
                ✓ Added to Bag
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Bag
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Free trial note */}
        <p className="text-zinc-500 text-[11px] text-center">
          Free 14-day home trial · Free returns
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
