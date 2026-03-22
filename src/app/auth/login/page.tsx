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
    <div className="min-h-screen flex" style={{ backgroundColor: '#F5F0E8' }}>

      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex w-1/2 flex-col p-12 relative overflow-hidden"
        style={{ backgroundColor: '#F5F0E8' }}
      >
        {/* Logo — top left */}
        <div className="flex-shrink-0">
          <p className="font-serif text-2xl italic" style={{ color: '#1A1612' }}>
            Specta<span style={{ color: '#A8844A' }}>Snap</span>
          </p>
        </div>

        {/* Image area — centered vertically */}
        <div className="flex-1 flex items-center justify-center">
          {/* Dark image placeholder */}
          <div className="relative" style={{ width: 320, height: 340 }}>
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#1C3A2E',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle texture overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)',
                }}
              />
              {/* Glasses silhouette hint */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -60%)',
                  width: 160,
                  height: 50,
                  borderRadius: 2,
                  border: '1.5px solid rgba(201,169,110,0.18)',
                  opacity: 0.5,
                }}
              />
            </div>

            {/* Caption card — bottom-right corner, overlapping image */}
            <div
              style={{
                position: 'absolute',
                bottom: -28,
                right: -28,
                backgroundColor: '#FDFAF4',
                padding: '16px 20px',
                width: 200,
                borderRadius: 2,
                boxShadow: '0 4px 24px rgba(26,22,18,0.10)',
              }}
            >
              <p
                className="font-serif"
                style={{
                  fontStyle: 'italic',
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: '#1A1612',
                  marginBottom: 8,
                }}
              >
                Curating the visionary experience.
              </p>
              <p
                className="font-sans"
                style={{
                  fontSize: 9,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#A8844A',
                  fontWeight: 700,
                }}
              >
                The Digital Curator Edition
              </p>
            </div>
          </div>
        </div>

        {/* Bottom spacer for caption card overlap */}
        <div style={{ height: 48 }} />
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{ backgroundColor: '#F5F0E8' }}
      >
        {/* Subtle vertical separator on desktop */}
        <div
          className="hidden lg:block absolute"
          style={{
            left: '50%',
            top: '10%',
            height: '80%',
            width: 1,
            backgroundColor: '#DDD8CE',
          }}
        />

        <div className="w-full max-w-sm">
          {/* Heading block */}
          <h1
            className="font-serif"
            style={{
              fontSize: 38,
              fontWeight: 600,
              color: '#1A1612',
              lineHeight: 1.15,
              marginBottom: 10,
            }}
          >
            Welcome Back
          </h1>
          <p
            className="font-sans"
            style={{
              fontSize: 13,
              color: '#6B6560',
              marginBottom: 36,
              lineHeight: 1.6,
            }}
          >
            Please enter your credentials to access your digital inventory.
          </p>

          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col">

            {/* Email field */}
            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="login-email"
                className="font-sans"
                style={{
                  display: 'block',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#1A1612',
                  marginBottom: 8,
                }}
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@store.com"
                className="font-sans"
                style={{
                  width: '100%',
                  padding: '0 0 10px 0',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #DDD8CE',
                  outline: 'none',
                  fontSize: 14,
                  color: '#1A1612',
                  borderRadius: 0,
                  transition: 'border-color 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.currentTarget.style.borderBottomColor = '#A8844A'; }}
                onBlur={(e) => { e.currentTarget.style.borderBottomColor = '#DDD8CE'; }}
              />
            </div>

            {/* Password field */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label
                  htmlFor="login-password"
                  className="font-sans"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: '#1A1612',
                  }}
                >
                  Password
                </label>
                <Link
                  href="/auth/reset-password"
                  className="font-sans"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#A8844A',
                    textDecoration: 'none',
                  }}
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="font-sans"
                style={{
                  width: '100%',
                  padding: '0 0 10px 0',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #DDD8CE',
                  outline: 'none',
                  fontSize: 14,
                  color: '#1A1612',
                  borderRadius: 0,
                  transition: 'border-color 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.currentTarget.style.borderBottomColor = '#A8844A'; }}
                onBlur={(e) => { e.currentTarget.style.borderBottomColor = '#DDD8CE'; }}
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="font-sans" style={{ fontSize: 12, color: '#c0392b', marginTop: 8, marginBottom: 4 }}>
                {error}
              </p>
            )}

            {/* Log In button */}
            <button
              type="submit"
              disabled={loading}
              className="font-sans"
              style={{
                width: '100%',
                padding: '14px 0',
                marginTop: 28,
                backgroundColor: '#A8844A',
                color: '#FDFAF4',
                border: 'none',
                borderRadius: 2,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'opacity 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minHeight: 48,
              }}
            >
              {loading ? <><Spinner /> Signing in…</> : 'Log In'}
            </button>
          </form>

          {/* Google OAuth divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#DDD8CE' }} />
            <span className="font-sans" style={{ fontSize: 11, color: '#9A9490', letterSpacing: '0.08em' }}>or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#DDD8CE' }} />
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={() => void handleGoogleAuth()}
            className="font-sans"
            style={{
              width: '100%',
              padding: '12px 0',
              marginBottom: 10,
              backgroundColor: 'transparent',
              border: '1px solid #DDD8CE',
              borderRadius: 2,
              fontSize: 12,
              fontWeight: 600,
              color: '#1A1612',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A8844A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#DDD8CE'; }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          {/* Footer link */}
          <p
            className="font-sans"
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: '#6B6560',
              marginTop: 28,
            }}
          >
            New to SpectaSnap?{' '}
            <Link
              href="/auth/signup"
              style={{
                color: '#A8844A',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Start trial
            </Link>
          </p>

          {!SUPABASE_CONFIGURED && (
            <p className="font-sans" style={{ fontSize: 11, color: '#9A9490', textAlign: 'center', marginTop: 16 }}>
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
