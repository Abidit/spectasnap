'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const SUPABASE_CONFIGURED = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function NewPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const form = e.currentTarget;
    const newPassword = (form.elements.namedItem('password') as HTMLInputElement).value;
    const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value;

    if (newPassword !== confirm) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({ password: newPassword });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setDone(true);

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
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
            Set new password
          </p>
        </div>

        <div className="bg-cream-50 border border-cream-400 p-6" style={{ borderRadius: 2 }}>
          {done ? (
            <div className="text-center py-4">
              <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-gold-600 mb-2">
                Password Updated
              </p>
              <p className="text-sm font-sans text-ink-500 leading-relaxed mb-4">
                Your password has been changed successfully. Redirecting&hellip;
              </p>
              <Link
                href="/auth/login"
                className="inline-block px-6 py-2.5 font-sans font-semibold text-xs uppercase tracking-wide
                           bg-ink-900 text-cream-50 hover:opacity-90 transition-opacity"
                style={{ borderRadius: 2, textDecoration: 'none' }}
              >
                Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-500 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400 text-ink-900 font-sans text-sm
                             focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  style={{ borderRadius: 2 }}
                  placeholder="Min. 8 characters"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-500 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirm"
                  required
                  minLength={8}
                  className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400 text-ink-900 font-sans text-sm
                             focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  style={{ borderRadius: 2 }}
                  placeholder="Repeat new password"
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
                {loading ? 'Updating…' : 'Set New Password'}
              </button>

              {!SUPABASE_CONFIGURED && (
                <p className="text-xs text-ink-300 text-center font-sans">
                  Auth not configured — running in demo mode
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
