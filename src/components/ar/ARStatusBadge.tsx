'use client';

import clsx from 'clsx';

export type ARStatusKind = 'idle' | 'loading' | 'searching' | 'tracking' | 'error';

interface ARStatusBadgeProps {
  status: ARStatusKind;
}

const CONFIG: Record<
  ARStatusKind,
  { dot: string; label: string; pulse: boolean; border: string; bg: string; text: string }
> = {
  idle: {
    dot: 'rgba(107,101,96,0.35)',
    label: 'AR Off',
    pulse: false,
    border: '#DDD8CE',
    bg: 'transparent',
    text: '#6B6560',
  },
  loading: {
    dot: '#C9A96E',
    label: 'Loading…',
    pulse: true,
    border: 'rgba(201,169,110,0.45)',
    bg: 'rgba(201,169,110,0.07)',
    text: '#A8844A',
  },
  searching: {
    dot: 'rgba(107,101,96,0.55)',
    label: 'Searching…',
    pulse: true,
    border: '#DDD8CE',
    bg: 'rgba(26,22,18,0.04)',
    text: '#6B6560',
  },
  tracking: {
    dot: '#C9A96E',
    label: 'AR Live',
    pulse: true,
    border: 'rgba(201,169,110,0.55)',
    bg: 'rgba(201,169,110,0.09)',
    text: '#A8844A',
  },
  error: {
    dot: '#dc2626',
    label: 'AR Error',
    pulse: false,
    border: 'rgba(220,38,38,0.45)',
    bg: 'rgba(220,38,38,0.05)',
    text: '#dc2626',
  },
};

export default function ARStatusBadge({ status }: ARStatusBadgeProps) {
  const cfg = CONFIG[status];

  return (
    <div
      aria-live="polite"
      aria-label={`AR tracking status: ${cfg.label}`}
      className="flex items-center gap-2 px-3 py-1.5 font-sans transition-all duration-300"
      style={{
        borderRadius: 2,
        border: `1px solid ${cfg.border}`,
        background: cfg.bg,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        color: cfg.text,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        className={clsx(
          'w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300',
          cfg.pulse && 'animate-pulse',
        )}
        style={{ background: cfg.dot }}
      />
      {cfg.label}
    </div>
  );
}
