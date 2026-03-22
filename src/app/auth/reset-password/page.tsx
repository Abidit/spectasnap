'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

const SUPABASE_CONFIGURED = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/new-password',
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSent(true);
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
            Reset your password
          </p>
        </div>

        <div className="bg-cream-50 border border-cream-400 p-6" style={{ borderRadius: 2 }}>
          {sent ? (
            <div className="text-center py-4">
              <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-gold-600 mb-2">
                Email Sent
              </p>
              <p className="text-sm font-sans text-ink-500 leading-relaxed">
                Check your inbox for a password reset link.
              </p>
              <Link
                href="/auth/login"
                className="inline-block mt-4 text-xs font-sans font-medium text-gold-600 hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm font-sans text-ink-500 mb-4">
                Enter your email and we&apos;ll send a reset link.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-500 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400 text-ink-900 font-sans text-sm
                               focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    style={{ borderRadius: 2 }}
                    placeholder="you@storename.com"
                  />
                </div>

                {error && (
                  <p className="text-xs font-sans text-red-400 -mt-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 font-sans font-semibold text-sm uppercase tracking-wide
                             bg-ink-900 text-cream-50 hover:opacity-90 disabled:opacity-50 transition-opacity"
                  style={{ borderRadius: 2, minHeight: 44 }}
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center text-xs font-sans text-ink-500 mt-4">
                <Link href="/auth/login" className="text-gold-600 hover:underline font-medium">
                  Back to sign in
                </Link>
              </p>

              {!SUPABASE_CONFIGURED && (
                <p className="text-xs text-ink-300 text-center mt-4 font-sans">
                  Auth not configured — running in demo mode
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
