'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const SUPABASE_CONFIGURED = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

// Spinner SVG
function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-cream-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!SUPABASE_CONFIGURED) return;
    setLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); return; }
      router.push(next);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
    if (!SUPABASE_CONFIGURED) return;
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-1/2 bg-dark flex-col justify-between p-12">
        <p className="font-serif text-3xl italic text-cream-50">
          Specta<span style={{ color: '#C9A96E' }}>Snap</span>
        </p>
        <div>
          <p className="font-serif text-4xl italic text-cream-50 leading-tight">
            &ldquo;See yourself in every frame.&rdquo;
          </p>
          <p className="font-sans text-sm mt-4" style={{ color: 'rgba(253,250,244,0.4)' }}>
            Live AR try-on for optical stores.
          </p>
        </div>
        <p className="font-sans text-xs uppercase tracking-widest" style={{ color: 'rgba(253,250,244,0.2)' }}>
          50+ frames · 478 landmarks · 60fps
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 bg-cream-100 flex items-center justify-center p-8">
        <div className="bg-cream-50 border border-cream-400 p-8 w-full max-w-sm" style={{ borderRadius: 2 }}>
          <p className="font-sans font-semibold uppercase mb-2" style={{ fontSize: 10, letterSpacing: '0.14em', color: '#A8844A' }}>
            Store Login
          </p>
          <h1 className="font-serif text-3xl text-ink-900 mb-1">Welcome back</h1>
          <p className="font-sans text-sm text-ink-500 mb-8">Sign in to your store dashboard</p>

          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-0">
            <div className="mb-4">
              <label htmlFor="login-email" className="block font-sans font-semibold text-ink-900 uppercase mb-1.5" style={{ fontSize: 12, letterSpacing: '0.1em' }}>
                Email
              </label>
              <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400 text-sm font-sans text-ink-900 focus:outline-none focus:border-gold-500 transition-colors"
                style={{ borderRadius: 2 }} placeholder="you@store.com" />
            </div>

            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block font-sans font-semibold text-ink-900 uppercase" style={{ fontSize: 12, letterSpacing: '0.1em' }}>
                  Password
                </label>
                <Link href="/auth/reset-password" className="font-sans font-semibold text-gold-600 hover:text-gold-500 transition-colors" style={{ fontSize: 12 }}>
                  Forgot password?
                </Link>
              </div>
              <input id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400 text-sm font-sans text-ink-900 focus:outline-none focus:border-gold-500 transition-colors"
                style={{ borderRadius: 2 }} placeholder="••••••••" />
            </div>

            {error && <p className="text-xs font-sans text-red-400 mt-1 mb-1">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3 mt-5 font-sans font-semibold text-sm bg-ink-900 text-cream-50 hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{ borderRadius: 2, minHeight: 44 }}>
              {loading ? <span className="flex items-center justify-center gap-2"><Spinner /> Signing in…</span> : 'Sign In'}
            </button>
          </form>

          {/* Google OAuth */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 border-t border-cream-400" />
            <span className="font-sans text-xs text-ink-300">or</span>
            <div className="flex-1 border-t border-cream-400" />
          </div>

          <button type="button" onClick={() => void handleGoogleAuth()}
            className="w-full py-3 mb-3 flex items-center justify-center gap-2 font-sans font-semibold text-sm border border-cream-400 text-ink-900 hover:border-ink-900 transition-colors"
            style={{ borderRadius: 2 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
            Continue with Google
          </button>

          <Link href="/trydemo" className="block w-full py-3 text-center font-sans font-semibold text-sm text-ink-900 border border-cream-400 hover:border-ink-900 transition-colors" style={{ borderRadius: 2, textDecoration: 'none' }}>
            Try the demo first
          </Link>

          <p className="text-center font-sans text-xs text-ink-500 mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-gold-600 hover:underline font-semibold">Get started</Link>
          </p>

          {!SUPABASE_CONFIGURED && (
            <p className="text-xs font-sans text-ink-300 text-center mt-4">
              Auth not configured — running in demo mode
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
