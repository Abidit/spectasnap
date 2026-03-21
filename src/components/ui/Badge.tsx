import { clsx } from 'clsx';

export type BadgeVariant = 'default' | 'gold' | 'live' | 'muted';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5',
        'font-sans text-[10px] font-semibold uppercase tracking-[0.12em]',
        'px-2.5 py-1 rounded-sharp',
        {
          default: 'bg-cream-200 text-ink-500',
          gold:    'bg-gold-100 text-gold-600',
          muted:   'bg-cream-200 text-ink-300',
          live:    'bg-cream-50/10 border border-green-500/40 text-green-400 backdrop-blur-sm',
        }[variant],
        className,
      )}
    >
      {variant === 'live' && (
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
      )}
      {children}
    </span>
  );
}
