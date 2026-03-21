'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';

interface TopBarProps {
  pageTitle?: string;
  storeName?: string;
}

export default function TopBar({ pageTitle, storeName }: TopBarProps) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6
                 bg-cream-50/90 backdrop-blur border-b border-cream-400"
      style={{ height: 56 }}
    >
      {/* Left — Logo */}
      <Link href="/" className="flex-shrink-0 no-underline">
        <span className="font-serif text-xl font-semibold tracking-tight text-ink-900">
          Specta<em className="text-gold-500 not-italic italic">Snap</em>
        </span>
      </Link>

      {/* Center — Page title */}
      {pageTitle && (
        <span className="font-serif italic text-ink-500 text-sm absolute left-1/2 -translate-x-1/2 hidden sm:block">
          {pageTitle}
        </span>
      )}

      {/* Right — Store name pill */}
      {storeName && (
        <div className="flex items-center gap-1.5 bg-cream-200 rounded-full px-3 py-1 flex-shrink-0">
          <Lock size={11} className="text-ink-300" />
          <span className="text-xs font-sans text-ink-500">{storeName}</span>
        </div>
      )}
    </header>
  );
}
