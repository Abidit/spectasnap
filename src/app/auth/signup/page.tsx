'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const SUPABASE_CONFIGURED = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function SignupPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState('');
  const [yourName, setYourName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agreed) return;
    if (!SUPABASE_CONFIGURED) return;
    setLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { store_name: storeName, full_name: yourName, city } },
      });
      if (authError) { setError(authError.message); return; }
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    } finally {
      setLoading(false);
    }
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
            Start your free trial today.
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
            Create Account
          </p>

          {/* Heading */}
          <h1 className="font-serif text-3xl text-ink-900 mb-1">30-day free trial</h1>
          <p className="font-sans text-sm text-ink-500 mb-8">No credit card required</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-0">
            {/* Store Name */}
            <div className="mb-4">
              <label
                htmlFor="signup-store-name"
                className="block font-sans font-semibold text-ink-900 uppercase mb-1.5"
                style={{ fontSize: 12, letterSpacing: '0.1em' }}
              >
                Store Name
              </label>
              <input
                id="signup-store-name"
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400 text-sm font-sans text-ink-900 focus:outline-none focus:border-gold-500 transition-colors"
                style={{ borderRadius: 2 }}
                placeholder="Shah Opticals"
              />
            </div>

            {/* Your Name */}
            <div className="mb-4">
              <label
                htmlFor="signup-your-name"
                className="block font-sans font-semibold text-ink-900 uppercase mb-1.5"
                style={{ fontSize: 12, letterSpacing: '0.1em' }}
              >
                Your Name
              </label>
              <input
                id="signup-your-name"
                type="text"
                required
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400 text-sm font-sans text-ink-900 focus:outline-none focus:border-gold-500 transition-colors"
                style={{ borderRadius: 2 }}
                placeholder="Aditya Shah"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="signup-email"
                className="block font-sans font-semibold text-ink-900 uppercase mb-1.5"
                style={{ fontSize: 12, letterSpacing: '0.1em' }}
              >
                Email
              </label>
              <input
                id="signup-email"
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
            <div className="mb-4">
              <label
                htmlFor="signup-password"
                className="block font-sans font-semibold text-ink-900 uppercase mb-1.5"
                style={{ fontSize: 12, letterSpacing: '0.1em' }}
              >
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400 text-sm font-sans text-ink-900 focus:outline-none focus:border-gold-500 transition-colors"
                style={{ borderRadius: 2 }}
                placeholder="Min. 8 characters"
              />
            </div>

            {/* City */}
            <div className="mb-4">
              <label
                htmlFor="signup-city"
                className="block font-sans font-semibold text-ink-900 uppercase mb-1.5"
                style={{ fontSize: 12, letterSpacing: '0.1em' }}
              >
                City
              </label>
              <input
                id="signup-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400 text-sm font-sans text-ink-900 focus:outline-none focus:border-gold-500 transition-colors"
                style={{ borderRadius: 2 }}
                placeholder="Mumbai"
              />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-gold-500 flex-shrink-0"
                style={{ borderRadius: 2 }}
              />
              <span className="font-sans text-xs text-ink-500 leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="text-gold-600 hover:underline font-semibold">
                  Terms of Service
                </Link>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full py-3 font-sans font-semibold text-sm bg-ink-900 text-cream-50 hover:opacity-90 disabled:opacity-50 transition-opacity"
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
                  Creating account&hellip;
                </span>
              ) : (
                'Create my store \u2192'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center font-sans text-xs text-ink-500 mt-5">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-gold-600 hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
