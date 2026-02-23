'use client';

import { Glasses, Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-surface/80 backdrop-blur-md z-10">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center">
          <Glasses className="w-4 h-4 text-brand-gold" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-white font-bold text-lg tracking-tight">Specta</span>
          <span className="text-brand-gold font-bold text-lg tracking-tight">Snap</span>
        </div>
      </div>

      {/* Tagline — hidden on small tablets */}
      <p className="hidden sm:block text-zinc-500 text-xs tracking-widest uppercase">
        Virtual Try-On
      </p>

      {/* Menu placeholder */}
      <button className="p-2 rounded-lg border border-brand-border hover:border-zinc-600 transition-colors">
        <Menu className="w-4 h-4 text-zinc-400" />
      </button>
    </header>
  );
}
