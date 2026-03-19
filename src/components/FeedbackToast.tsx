'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastData {
  message: string;
  type: ToastType;
}

interface FeedbackToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
  /** Auto-dismiss after this many ms. Pass 0 for persistent. Errors never auto-dismiss. */
  duration?: number;
}

const TYPE_CONFIG: Record<ToastType, { icon: string; color: string; border: string }> = {
  success: { icon: '✓', color: '#C9A96E',               border: 'rgba(201,169,110,0.55)' },
  error:   { icon: '✕', color: '#dc2626',               border: 'rgba(220,38,38,0.55)'   },
  info:    { icon: 'ℹ', color: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.14)' },
};

export default function FeedbackToast({
  toast,
  onDismiss,
  duration = 3500,
}: FeedbackToastProps) {
  // Auto-dismiss — never for errors
  useEffect(() => {
    if (!toast || duration === 0 || toast.type === 'error') return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [toast, duration, onDismiss]);

  const cfg = toast ? TYPE_CONFIG[toast.type] : null;

  return (
    <AnimatePresence>
      {toast && cfg && (
        <motion.div
          role={toast.type === 'error' ? 'alert' : 'status'}
          key={toast.message + toast.type}
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{ opacity: 0,    y: 20, scale: 0.97 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed z-50 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 font-sans text-sm"
          style={{
            bottom: 'calc(max(env(safe-area-inset-bottom, 0px), 12px) + 76px)',
            borderRadius: 2,
            background: 'rgba(26,22,18,0.91)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: `1px solid ${cfg.border}`,
            color: 'rgba(255,255,255,0.88)',
            boxShadow: '0 4px 28px rgba(0,0,0,0.38)',
            minWidth: 220,
            maxWidth: 'min(360px, calc(100vw - 32px))',
          }}
        >
          {/* Type icon */}
          <span
            style={{ color: cfg.color, fontSize: 14, fontWeight: 700, flexShrink: 0, lineHeight: 1 }}
          >
            {cfg.icon}
          </span>

          {/* Message */}
          <span className="flex-1 leading-snug">{toast.message}</span>

          {/* Dismiss */}
          <button
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="flex-shrink-0 flex items-center justify-center w-5 h-5 transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)', borderRadius: 2 }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)')
            }
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
