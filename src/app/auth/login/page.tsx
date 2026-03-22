'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const SUPABASE_CONFIGURED = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const next = searchParams.get('next') ?? '/dashboard';
    router.push(next);
  }

  async function handleGoogleAuth() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  }

  return (
    <div className="bg-cream-50 border border-cream-400 p-6" style={{ borderRadius: 2 }}>
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400 text-ink-900 font-sans text-sm
                       focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            style={{ borderRadius: 2 }}
            placeholder="Your password"
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
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 border-t border-cream-400" />
        <span className="font-sans text-xs text-ink-300">or</span>
        <div className="flex-1 border-t border-cream-400" />
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={() => void handleGoogleAuth()}
        className="w-full py-3 flex items-center justify-center gap-2 font-sans font-semibold text-sm border border-cream-400 text-ink-900 hover:border-ink-900 transition-colors"
        style={{ borderRadius: 2 }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
          />
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-xs font-sans text-ink-500 mt-4">
        New to SpectaSnap?{' '}
        <Link href="/auth/signup" className="text-gold-600 hover:underline font-medium">
          Create account
        </Link>
      </p>

      {!SUPABASE_CONFIGURED && (
        <p className="text-xs text-ink-300 text-center mt-4 font-sans">
          Auth not configured — running in demo mode
        </p>
      )}
    </div>
  );
}

export default function LoginPage() {
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

        <Suspense fallback={<div className="bg-cream-50 border border-cream-400 p-6 h-64" style={{ borderRadius: 2 }} />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
