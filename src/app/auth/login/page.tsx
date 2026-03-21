'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Supabase integration deferred — stub
    setTimeout(() => setLoading(false), 1000);
  }

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="font-serif text-2xl font-semibold text-ink-900">
            Specta<em style={{ color: '#C9A96E' }}>Snap</em>
          </p>
          <p className="text-xs font-sans tracking-widest uppercase text-ink-300 mt-1">
            Sign in to your account
          </p>
        </div>

        <div className="bg-cream-50 border border-cream-400 p-6" style={{ borderRadius: 2 }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-500 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400 text-ink-900 font-sans text-sm
                           focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                style={{ borderRadius: 2 }}
                placeholder="you@storename.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-500">
                  Password
                </label>
                <Link
                  href="/auth/reset-password"
                  className="text-[10px] font-sans text-gold-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400 text-ink-900 font-sans text-sm
                           focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                style={{ borderRadius: 2 }}
                placeholder="Your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-sans font-semibold text-sm uppercase tracking-wide
                         bg-ink-900 text-cream-50 hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{ borderRadius: 2, minHeight: 44 }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs font-sans text-ink-500 mt-4">
            New to SpectaSnap?{' '}
            <Link href="/auth/signup" className="text-gold-600 hover:underline font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
