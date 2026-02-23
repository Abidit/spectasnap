'use client';

import { Glasses } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-brand-panel border-b border-brand-border z-10">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 flex items-center justify-center">
          <Glasses className="w-5 h-5" style={{ color: '#C9A96E' }} />
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="font-serif text-xl font-semibold tracking-tight text-brand-text">Specta</span>
          <span className="font-serif text-xl font-semibold tracking-tight" style={{ color: '#C9A96E' }}>Snap</span>
        </div>
      </div>

      {/* Tagline */}
      <p className="hidden sm:block text-brand-muted text-xs tracking-widest uppercase font-sans">
        Virtual Try-On
      </p>

      {/* Spacer to match layout */}
      <div className="w-7" />
    </header>
  );
}
