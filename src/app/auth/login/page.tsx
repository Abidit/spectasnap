'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Auth integration deferred — stub
    setTimeout(() => setLoading(false), 1000);
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — hidden on mobile ── */}
      <div className="hidden lg:flex w-1/2 bg-dark flex-col justify-between p-12">
        {/* Logo */}
        <p className="font-serif text-3xl italic text-cream-50">
          Specta<span style={{ color: '#C9A96E' }}>Snap</span>
        </p>

        {/* Quote */}
        <div>
          <p className="font-serif text-4xl italic text-cream-50 leading-tight">
            &ldquo;See yourself in every frame.&rdquo;
          </p>
          <p className="font-sans text-sm mt-4" style={{ color: 'rgba(253,250,244,0.4)' }}>
            Live AR try-on for optical stores.
          </p>
        </div>

        {/* Stats */}
        <p
          className="font-sans text-xs uppercase tracking-widest"
          style={{ color: 'rgba(253,250,244,0.2)' }}
        >
          50+ frames · 478 landmarks · 60fps
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 bg-cream-100 flex items-center justify-center p-8">
        <div
          className="bg-cream-50 border border-cream-400 p-8 w-full max-w-sm"
          style={{ borderRadius: 2 }}
        >
          {/* Eyebrow */}
          <p
            className="font-sans font-semibold uppercase mb-2"
            style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              color: '#A8844A',
            }}
          >
            Store Login
          </p>

          {/* Heading */}
          <h1 className="font-serif text-3xl text-ink-900 mb-1">Welcome back</h1>
          <p className="font-sans text-sm text-ink-500 mb-8">
            Sign in to your store dashboard
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-0">
            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="login-email"
                className="block font-sans font-semibold text-ink-900 uppercase mb-1.5"
                style={{ fontSize: 12, letterSpacing: '0.1em' }}
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400 text-sm font-sans text-ink-900 focus:outline-none focus:border-gold-500 transition-colors"
                style={{ borderRadius: 2 }}
                placeholder="you@store.com"
              />
            </div>

            {/* Password */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block font-sans font-semibold text-ink-900 uppercase"
                  style={{ fontSize: 12, letterSpacing: '0.1em' }}
                >
                  Password
                </label>
                <Link
                  href="/auth/reset-password"
                  className="font-sans font-semibold text-gold-600 hover:text-gold-500 transition-colors"
                  style={{ fontSize: 12 }}
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400 text-sm font-sans text-ink-900 focus:outline-none focus:border-gold-500 transition-colors"
                style={{ borderRadius: 2 }}
                placeholder="••••••••"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-6 font-sans font-semibold text-sm bg-ink-900 text-cream-50 hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{ borderRadius: 2, minHeight: 44 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-cream-50"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Signing in&hellip;
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 border-t border-cream-400" />
            <span className="font-sans text-xs text-ink-300">or</span>
            <div className="flex-1 border-t border-cream-400" />
          </div>

          {/* Try demo */}
          <Link
            href="/trydemo"
            className="block w-full py-3 text-center font-sans font-semibold text-sm text-ink-900 border border-cream-400 hover:border-ink-900 transition-colors"
            style={{ borderRadius: 2, textDecoration: 'none' }}
          >
            Try the demo first
          </Link>

          {/* Footer */}
          <p className="text-center font-sans text-xs text-ink-500 mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-gold-600 hover:underline font-semibold">
              Get started
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
