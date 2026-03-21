'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  const [resent, setResent] = useState(false);

  function handleResend() {
    // Resend integration deferred — stub
    setResent(true);
    setTimeout(() => setResent(false), 3000);
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
          className="bg-cream-50 border border-cream-400 p-8 text-center"
          style={{ borderRadius: 2 }}
        >
          {/* Mail icon */}
          <div
            className="w-10 h-10 mx-auto mb-6 flex items-center justify-center border border-gold-500"
            style={{ borderRadius: 2, backgroundColor: '#F7EDD8' }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect
                x="2"
                y="4"
                width="20"
                height="16"
                rx="1"
                stroke="#A8844A"
                strokeWidth="1.5"
              />
              <path
                d="M2 7l10 7 10-7"
                stroke="#A8844A"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-2xl text-ink-900 mb-2">Check your email</h1>

          {/* Sub */}
          <p className="font-sans text-sm text-ink-500 leading-relaxed mb-6">
            {emailParam
              ? <>We sent a link to <span className="font-semibold text-ink-900">{emailParam}</span></>
              : 'We sent a verification link to your email.'}
          </p>

          {/* Resend */}
          {resent ? (
            <p
              className="font-sans text-xs font-semibold uppercase tracking-[0.12em] mb-4"
              style={{ color: '#A8844A' }}
            >
              Email resent!
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="w-full py-2.5 mb-4 font-sans font-semibold text-sm text-ink-900 border border-cream-400 hover:border-ink-900 transition-colors"
              style={{ borderRadius: 2 }}
            >
              Resend email
            </button>
          )}

          {/* Back to login */}
          <Link
            href="/auth/login"
            className="font-sans text-xs font-semibold text-gold-600 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from 'react';

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream-100 flex items-center justify-center">
          <p className="font-sans text-sm text-ink-500">Loading&hellip;</p>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
