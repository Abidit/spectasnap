'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NewPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mismatch, setMismatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMismatch(false);

    if (password !== confirm) {
      setMismatch(true);
      return;
    }

    setLoading(true);
    // Auth integration deferred — stub
    setTimeout(() => {
      setLoading(false);
      setDone(true);
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
          {done ? (
            /* Success state */
            <div className="text-center py-2">
              <p
                className="font-sans font-semibold uppercase mb-3"
                style={{ fontSize: 10, letterSpacing: '0.14em', color: '#A8844A' }}
              >
                Password Updated
              </p>
              <h2 className="font-serif text-2xl text-ink-900 mb-2">All set!</h2>
              <p className="font-sans text-sm text-ink-500 leading-relaxed mb-6">
                Password updated! Redirecting&hellip;
              </p>
              <Link
                href="/auth/login"
                className="inline-block px-6 py-2.5 font-sans font-semibold text-xs uppercase tracking-wide bg-ink-900 text-cream-50 hover:opacity-90 transition-opacity"
                style={{ borderRadius: 2, textDecoration: 'none' }}
              >
                Sign In
              </Link>
            </div>
          ) : (
            <>
              {/* Eyebrow */}
              <p
                className="font-sans font-semibold uppercase mb-2"
                style={{ fontSize: 10, letterSpacing: '0.14em', color: '#A8844A' }}
              >
                New Password
              </p>

              {/* Heading */}
              <h1 className="font-serif text-3xl text-ink-900 mb-1">Set new password</h1>
              <p className="font-sans text-sm text-ink-500 mb-8">
                Choose a strong password for your account.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-0">
                {/* New password */}
                <div className="mb-4">
                  <label
                    htmlFor="new-password"
                    className="block font-sans font-semibold text-ink-900 uppercase mb-1.5"
                    style={{ fontSize: 12, letterSpacing: '0.1em' }}
                  >
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (mismatch) setMismatch(false);
                    }}
                    className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400 text-sm font-sans text-ink-900 focus:outline-none focus:border-gold-500 transition-colors"
                    style={{ borderRadius: 2 }}
                    placeholder="Min. 8 characters"
                  />
                </div>

                {/* Confirm password */}
                <div className="mb-6">
                  <label
                    htmlFor="confirm-password"
                    className="block font-sans font-semibold text-ink-900 uppercase mb-1.5"
                    style={{ fontSize: 12, letterSpacing: '0.1em' }}
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      if (mismatch) setMismatch(false);
                    }}
                    className={`w-full px-3 py-2.5 bg-cream-100 border text-sm font-sans text-ink-900 focus:outline-none transition-colors ${
                      mismatch
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-cream-400 focus:border-gold-500'
                    }`}
                    style={{ borderRadius: 2 }}
                    placeholder="Repeat new password"
                  />
                  {mismatch && (
                    <p className="font-sans text-xs mt-1.5" style={{ color: '#dc2626' }}>
                      Passwords don&apos;t match
                    </p>
                  )}
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
                      Updating&hellip;
                    </span>
                  ) : (
                    'Update password'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
