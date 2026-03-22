'use client';

import Link from 'next/link';

interface TrialBannerProps {
  daysLeft?: number;
}

export default function TrialBanner({ daysLeft = 24 }: TrialBannerProps) {
  // Ended state
  if (daysLeft === 0) {
    return (
      <div
        className="h-10 flex items-center justify-between px-6 border-b border-dark bg-dark"
      >
        <span className="text-sm font-sans text-cream-50/70">
          Your free trial has ended.
        </span>
        <Link
          href="/pricing"
          className="text-sm font-sans font-semibold text-gold-500 no-underline"
        >
          Upgrade to continue →
        </Link>
      </div>
    );
  }

  // Late state
  if (daysLeft <= 10) {
    return (
      <div
        className="h-10 flex items-center justify-between px-6 border-b border-gold-500/50 bg-gold-500/20"
      >
        <span className="text-sm font-sans font-semibold text-ink-900">
          ⚠ {daysLeft} days left — upgrade to keep access
        </span>
        <Link href="/pricing" className="no-underline">
          <span
            className="inline-flex items-center px-3 py-1 font-sans font-semibold text-xs bg-ink-900 text-cream-50 hover:opacity-90 transition-opacity"
            style={{ borderRadius: 2 }}
          >
            Upgrade now →
          </span>
        </Link>
      </div>
    );
  }

  // Early state (daysLeft > 10)
  return (
    <div
      className="h-10 flex items-center justify-between px-6 border-b border border-gold-500/30 bg-gold-100"
    >
      <span className="text-sm font-sans text-ink-900">
        ✦ {daysLeft} days left in your free trial
      </span>
      <Link
        href="/pricing"
        className="text-sm font-sans font-semibold text-gold-600 hover:text-gold-500 no-underline"
      >
        Upgrade now →
      </Link>
    </div>
  );
}
