'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Share2 } from 'lucide-react';
import { generateCompareCollage } from '../CompareExport';

export interface SavedLook {
  id: string;
  dataUrl: string;
  frameName: string;
  frameId: string;
  timestamp: number;
}

interface CompareTrayProps {
  looks: SavedLook[];
  onRemove: (id: string) => void;
  onSelectFrame: (frameId: string) => void;
  onSave: () => void;
  canSave: boolean;
  /** Called with a JPEG dataUrl of the 2x2 collage when the user taps "Share Compare". */
  onShareCollage?: (dataUrl: string) => void;
}

const MAX_LOOKS = 4;

export default function CompareTray({
  looks,
  onRemove,
  onSelectFrame,
  onSave,
  canSave,
  onShareCollage,
}: CompareTrayProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeThumbId, setActiveThumbId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleThumbTap = useCallback(
    (look: SavedLook) => {
      setActiveThumbId(look.id);
      onSelectFrame(look.frameId);
      // Clear highlight after a brief moment
      setTimeout(() => setActiveThumbId(null), 1200);
    },
    [onSelectFrame],
  );

  const handleDoubleClick = useCallback(() => {
    if (looks.length > 0) setExpanded(true);
  }, [looks.length]);

  const handleShareCollage = useCallback(() => {
    const collage = generateCompareCollage(looks);
    if (collage && onShareCollage) onShareCollage(collage);
  }, [looks, onShareCollage]);

  // Focus management: save trigger element on open, restore on close
  useEffect(() => {
    if (expanded) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      // Focus first look card when overlay opens
      requestAnimationFrame(() => {
        const firstCard = gridRef.current?.querySelector<HTMLButtonElement>('button[data-look]');
        firstCard?.focus();
      });
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [expanded]);

  // Keyboard handler for the expanded overlay
  const handleOverlayKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setExpanded(false);
        return;
      }

      // Arrow key navigation between look cards
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();

      const grid = gridRef.current;
      if (!grid) return;
      const cards = Array.from(grid.querySelectorAll<HTMLButtonElement>('button[data-look]'));
      if (cards.length === 0) return;

      const current = document.activeElement as HTMLElement;
      const idx = cards.indexOf(current as HTMLButtonElement);
      let nextIdx: number;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIdx = idx < cards.length - 1 ? idx + 1 : 0;
      } else {
        nextIdx = idx > 0 ? idx - 1 : cards.length - 1;
      }

      cards[nextIdx]?.focus();
    },
    [],
  );

  return (
    <>
      {/* ── Inline tray ────────────────────────────────────────────────── */}
      <div
        ref={triggerRef}
        className="flex items-center gap-2"
        onDoubleClick={handleDoubleClick}
      >
        {/* Saved look thumbnails */}
        <AnimatePresence mode="popLayout">
          {looks.map((look) => {
            const isActive = activeThumbId === look.id;
            return (
              <motion.div
                key={look.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="relative flex-shrink-0"
              >
                {/* Thumbnail button */}
                <button
                  onClick={() => handleThumbTap(look)}
                  className="block overflow-hidden"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: isActive
                      ? '2px solid #C9A96E'
                      : '2px solid rgba(255,255,255,0.6)',
                    padding: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease',
                  }}
                  aria-label={`Switch to ${look.frameName}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={look.dataUrl}
                    alt={look.frameName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      display: 'block',
                    }}
                  />
                </button>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(look.id);
                  }}
                  className="absolute flex items-center justify-center"
                  style={{
                    top: -2,
                    right: -2,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'rgba(26,22,18,0.85)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: 'rgba(255,255,255,0.75)',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  aria-label={`Remove ${look.frameName} from comparison`}
                >
                  <X style={{ width: 10, height: 10 }} />
                </button>

                {/* Frame name tooltip */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-1/2 -translate-x-1/2 font-sans font-semibold whitespace-nowrap pointer-events-none"
                      style={{
                        top: 54,
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.85)',
                        background: 'rgba(26,22,18,0.85)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        padding: '2px 6px',
                        borderRadius: 2,
                      }}
                    >
                      {look.frameName}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Save Look button */}
        <motion.button
          onClick={onSave}
          disabled={!canSave}
          whileTap={canSave ? { scale: 0.94 } : undefined}
          className="flex items-center gap-1.5 font-sans font-semibold tracking-wide transition-opacity"
          style={{
            fontSize: 11,
            padding: '8px 12px',
            borderRadius: 2,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: canSave ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
            cursor: canSave ? 'pointer' : 'default',
            opacity: canSave ? 1 : 0.5,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          aria-label={
            looks.length >= MAX_LOOKS
              ? 'Maximum 4 looks saved'
              : 'Save current look for comparison'
          }
        >
          <Camera style={{ width: 14, height: 14 }} />
          {looks.length === 0 ? 'Save Look' : `Save (${looks.length}/${MAX_LOOKS})`}
        </motion.button>
      </div>

      {/* ── Expanded 2x2 compare overlay ───────────────────────────────── */}
      <AnimatePresence>
        {expanded && looks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{
              background: 'rgba(26,22,18,0.91)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
            onClick={() => setExpanded(false)}
            onKeyDown={handleOverlayKeyDown}
            role="dialog"
            aria-modal="true"
            aria-label="Compare saved looks"
          >
            {/* Grid card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full flex flex-col gap-4 p-5"
              style={{
                maxWidth: 420,
                background: 'rgba(26,22,18,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-[9px] font-sans font-semibold tracking-[0.14em] uppercase"
                    style={{ color: '#C9A96E' }}
                  >
                    Compare Looks
                  </p>
                  <p
                    className="font-sans text-xs"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    Tap a look to switch frames
                  </p>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="flex items-center justify-center"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                  }}
                  aria-label="Close comparison view"
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>

              {/* 2x2 grid */}
              <div
                ref={gridRef}
                className="grid gap-3"
                style={{
                  gridTemplateColumns:
                    looks.length <= 2 ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
                }}
              >
                {looks.map((look) => (
                  <button
                    key={look.id}
                    data-look={look.id}
                    onClick={() => {
                      onSelectFrame(look.frameId);
                      setExpanded(false);
                    }}
                    className="relative group overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500"
                    style={{
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'transparent',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                    aria-label={`Select look with ${look.frameName}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={look.dataUrl}
                      alt={`Look with ${look.frameName}`}
                      className="w-full aspect-[3/4] object-cover"
                      style={{ borderRadius: 2, display: 'block' }}
                    />
                    {/* Label overlay */}
                    <div
                      className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                      style={{
                        background:
                          'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
                      }}
                    >
                      <p
                        className="font-semibold text-white leading-tight"
                        style={{
                          fontFamily:
                            'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)',
                          fontSize: 14,
                        }}
                      >
                        {look.frameName}
                      </p>
                    </div>

                    {/* Hover ring */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{
                        border: '2px solid #C9A96E',
                        borderRadius: 2,
                      }}
                    />
                  </button>
                ))}

                {/* Empty slots */}
                {Array.from({ length: MAX_LOOKS - looks.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex items-center justify-center aspect-[3/4]"
                    style={{
                      borderRadius: 2,
                      border: '1px dashed rgba(255,255,255,0.1)',
                    }}
                  >
                    <span
                      className="font-sans text-xs"
                      style={{ color: 'rgba(255,255,255,0.2)' }}
                    >
                      Empty
                    </span>
                  </div>
                ))}
              </div>

              {/* Share Compare button — visible when at least 2 looks are saved */}
              {looks.length >= 2 && onShareCollage && (
                <button
                  onClick={handleShareCollage}
                  className="w-full flex items-center justify-center gap-2 py-2.5
                             font-sans font-semibold text-xs tracking-wide transition-colors"
                  style={{
                    borderRadius: 2,
                    border: '1px solid #C9A96E',
                    color: '#C9A96E',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                  aria-label="Share comparison as collage image"
                >
                  <Share2 style={{ width: 14, height: 14 }} />
                  Share Compare
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
