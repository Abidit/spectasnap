'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastData {
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
  duration?: number; // ms — defaults to 3500 for success, never for error
}

export default function Toast({ toast, onDismiss, duration = 3500 }: ToastProps) {
  useEffect(() => {
    if (!toast || toast.type === 'error') return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [toast, duration, onDismiss]);

  if (!toast) return null;

  const borderColor = {
    success: 'border-gold-500/55',
    error:   'border-red-500/55',
    info:    'border-cream-400/30',
  }[toast.type];

  const iconColor = {
    success: 'text-gold-500',
    error:   'text-red-400',
    info:    'text-ink-300',
  }[toast.type];

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className={clsx(
        'fixed z-50 left-4 right-4 flex items-center gap-3',
        'px-4 py-3 rounded-sharp border',
        'font-sans text-sm',
        borderColor,
      )}
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
        backgroundColor: 'rgba(26,22,18,0.91)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        color: 'rgba(255,255,255,0.88)',
        boxShadow: '0 4px 28px rgba(0,0,0,0.38)',
      }}
    >
      {/* Indicator dot */}
      <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', {
        'bg-gold-500': toast.type === 'success',
        'bg-red-400':  toast.type === 'error',
        'bg-ink-300':  toast.type === 'info',
      })} />

      <p className={clsx('flex-1 text-sm font-sans', iconColor)}>{toast.message}</p>

      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-sharp
                   text-white/35 hover:text-white/70 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
