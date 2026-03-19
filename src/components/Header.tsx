'use client';

import Link from 'next/link';
import { Glasses } from 'lucide-react';
import ARStatusBadge, { type ARStatusKind } from '@/components/ARStatusBadge';

interface HeaderProps {
  arStatus?: ARStatusKind;
}

export default function Header({ arStatus }: HeaderProps) {
  return (
    <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-brand-panel border-b border-brand-border z-10">
      {/* Logo — links back to landing page */}
      <Link href="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
        <div className="w-7 h-7 flex items-center justify-center">
          <Glasses className="w-5 h-5" style={{ color: '#C9A96E' }} />
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="font-serif text-xl font-semibold tracking-tight text-brand-text">Specta</span>
          <span className="font-serif text-xl font-semibold tracking-tight" style={{ color: '#C9A96E' }}>Snap</span>
        </div>
      </Link>

      {/* Tagline */}
      <p className="hidden sm:block text-brand-muted text-xs tracking-widest uppercase font-sans">
        Virtual Try-On
      </p>

      {/* Right side: AR status badge + Dashboard nav link */}
      <div className="flex items-center gap-4">
        {arStatus && <ARStatusBadge status={arStatus} />}
        <Link
          href="/dashboard"
          className="text-brand-muted text-xs font-sans font-medium hover:text-brand-gold transition-colors"
          style={{ textDecoration: 'none' }}
        >
          Dashboard
        </Link>
      </div>
    </header>
  );
}
