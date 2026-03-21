'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-500"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full px-3 py-2.5',
            'bg-cream-100 border text-ink-900 text-sm font-sans',
            'rounded-sharp',
            'placeholder:text-ink-300',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-0 focus:border-gold-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
              : 'border-cream-400',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 font-sans">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-ink-300 font-sans">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
