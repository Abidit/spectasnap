'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Auth integration deferred — stub
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="font-serif text-3xl italic text-ink-900">
            Specta<span style={{ color: '#C9A96E' }}>Snap</span>
          </p>
        </div>

        <div
          className="bg-cream-50 border border-cream-400 p-8"
          style={{ borderRadius: 2 }}
        >
          {sent ? (
            /* Success state */
            <div className="text-center py-2">
              <p
                className="font-sans font-semibold uppercase mb-3"
                style={{ fontSize: 10, letterSpacing: '0.14em', color: '#A8844A' }}
              >
                Email Sent
              </p>
              <h2 className="font-serif text-2xl text-ink-900 mb-2">Check your inbox</h2>
              <p className="font-sans text-sm text-ink-500 leading-relaxed mb-6">
                Reset link sent. Check your inbox.
              </p>
              <Link
                href="/auth/login"
                className="font-sans text-xs font-semibold text-gold-600 hover:underline"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              {/* Eyebrow */}
              <p
                className="font-sans font-semibold uppercase mb-2"
                style={{ fontSize: 10, letterSpacing: '0.14em', color: '#A8844A' }}
              >
                Password Reset
              </p>

              {/* Heading */}
              <h1 className="font-serif text-3xl text-ink-900 mb-1">Reset your password</h1>
              <p className="font-sans text-sm text-ink-500 mb-8">
                Enter your email and we&apos;ll send a reset link.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-0">
                <div className="mb-6">
                  <label
                    htmlFor="reset-email"
                    className="block font-sans font-semibold text-ink-900 uppercase mb-1.5"
                    style={{ fontSize: 12, letterSpacing: '0.1em' }}
                  >
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400 text-sm font-sans text-ink-900 focus:outline-none focus:border-gold-500 transition-colors"
                    style={{ borderRadius: 2 }}
                    placeholder="you@store.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
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
                      Sending&hellip;
                    </span>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>

              {/* Back link */}
              <p className="text-center font-sans text-xs text-ink-500 mt-5">
                <Link href="/auth/login" className="text-gold-600 hover:underline font-semibold">
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
