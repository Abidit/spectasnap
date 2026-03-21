'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';

export type ButtonVariant = 'primary' | 'ghost' | 'gold';
export type ButtonSize    = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-ink-900 text-cream-50 hover:bg-ink-500 active:bg-ink-900 disabled:bg-ink-300',
  ghost:   'bg-transparent text-ink-900 border border-cream-400 hover:bg-cream-200 active:bg-cream-400 disabled:text-ink-300',
  gold:    'bg-gold-500 text-ink-900 hover:bg-gold-600 active:bg-gold-600 disabled:bg-gold-100 disabled:text-ink-300',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs min-h-[36px]',
  md: 'px-5 py-2.5 text-sm min-h-[44px]',
  lg: 'px-10 py-4 text-sm min-h-[56px]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          // Base
          'inline-flex items-center justify-center gap-2',
          'font-sans font-semibold tracking-wide',
          'rounded-sharp transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'select-none',
          // Variant
          variantClasses[variant],
          // Size
          sizeClasses[size],
          // Full width
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
