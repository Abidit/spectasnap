'use client';

import { useState } from 'react';
import Link from 'next/link';

type Step = 1 | 2 | 3;

type FrameOrder = 'recommended' | 'all';

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [storeName, setStoreName] = useState('');
  const [storeCity, setStoreCity] = useState('');
  const [frameOrder, setFrameOrder] = useState<FrameOrder>('recommended');
  const [aiStylist, setAiStylist] = useState(true);
  const [faceShape, setFaceShape] = useState(true);
  const [done, setDone] = useState(false);

  function advance() {
    setStep((prev) => (prev + 1) as Step);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          {/* Pulsing gold dot */}
          <span
            className="inline-block w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: '#C9A96E' }}
            aria-hidden="true"
          />
          <p className="font-sans text-sm text-ink-500">
            All done! Redirecting to dashboard&hellip;
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <div className="max-w-lg mx-auto pt-16 pb-12 px-6">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-3" role="list" aria-label="Onboarding steps">
          {([1, 2, 3] as Step[]).map((s) => (
            <span
              key={s}
              role="listitem"
              aria-label={`Step ${s}${s === step ? ', current' : s < step ? ', completed' : ''}`}
              className="inline-block w-2 h-2 rounded-full transition-colors"
              style={{
                backgroundColor: s === step ? '#C9A96E' : '#DDD8CE',
              }}
            />
          ))}
        </div>

        {/* Step indicator */}
        <p className="text-center font-sans text-xs text-ink-300 mb-8 uppercase tracking-[0.12em]">
          Step {step} of 3
        </p>

        {/* ── Step 1 — Welcome ── */}
        {step === 1 && (
          <div>
            <h1 className="font-serif text-3xl text-ink-900 mb-2">
              Let&apos;s set up your store
            </h1>
            <p className="font-sans text-sm text-ink-500 leading-relaxed mb-8">
              It takes 2 minutes. We&apos;ll configure AR try-on for your optical store.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                advance();
              }}
              className="flex flex-col gap-0"
            >
              <div className="mb-4">
                <label
                  htmlFor="onb-store-name"
                  className="block font-sans font-semibold text-ink-900 uppercase mb-1.5"
                  style={{ fontSize: 12, letterSpacing: '0.1em' }}
                >
                  Store Name
                </label>
                <input
                  id="onb-store-name"
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-cream-50 border border-cream-400 text-sm font-sans text-ink-900 focus:outline-none focus:border-gold-500 transition-colors"
                  style={{ borderRadius: 2 }}
                  placeholder="Shah Opticals"
                />
              </div>

              <div className="mb-8">
                <label
                  htmlFor="onb-city"
                  className="block font-sans font-semibold text-ink-900 uppercase mb-1.5"
                  style={{ fontSize: 12, letterSpacing: '0.1em' }}
                >
                  City
                </label>
                <input
                  id="onb-city"
                  type="text"
                  value={storeCity}
                  onChange={(e) => setStoreCity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-cream-50 border border-cream-400 text-sm font-sans text-ink-900 focus:outline-none focus:border-gold-500 transition-colors"
                  style={{ borderRadius: 2 }}
                  placeholder="Mumbai"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 font-sans font-semibold text-sm text-ink-900 hover:opacity-80 transition-opacity"
                style={{ borderRadius: 2, minHeight: 44, backgroundColor: '#C9A96E' }}
              >
                Continue &rarr;
              </button>
            </form>
          </div>
        )}

        {/* ── Step 2 — Configure ── */}
        {step === 2 && (
          <div>
            <h1 className="font-serif text-3xl text-ink-900 mb-2">
              Customise your experience
            </h1>
            <p className="font-sans text-sm text-ink-500 leading-relaxed mb-8">
              Choose what customers see first when they scan your QR.
            </p>

            {/* Radio group: frame order */}
            <fieldset className="mb-6">
              <legend
                className="block font-sans font-semibold text-ink-900 uppercase mb-3"
                style={{ fontSize: 12, letterSpacing: '0.1em' }}
              >
                Frame Order
              </legend>
              <div className="flex flex-col gap-3">
                {/* Recommended */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={frameOrder === 'recommended'}
                  onClick={() => setFrameOrder('recommended')}
                  className="w-full flex items-start gap-3 p-4 bg-cream-50 border text-left transition-colors"
                  style={{
                    borderRadius: 2,
                    borderColor: frameOrder === 'recommended' ? '#C9A96E' : '#DDD8CE',
                  }}
                >
                  {/* Checkmark or empty circle */}
                  <span
                    className="flex-shrink-0 mt-0.5 w-4 h-4 flex items-center justify-center border"
                    style={{
                      borderRadius: 2,
                      borderColor: frameOrder === 'recommended' ? '#C9A96E' : '#DDD8CE',
                      backgroundColor: frameOrder === 'recommended' ? '#C9A96E' : 'transparent',
                    }}
                  >
                    {frameOrder === 'recommended' && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                        <path
                          d="M1 4l2.5 2.5L9 1"
                          stroke="#1A1612"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <div>
                    <p className="font-sans font-semibold text-sm text-ink-900">
                      Recommended frames first
                    </p>
                    <p className="font-sans text-xs text-ink-500 mt-0.5">
                      AI picks the best fit for each face shape.
                    </p>
                  </div>
                </button>

                {/* All frames */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={frameOrder === 'all'}
                  onClick={() => setFrameOrder('all')}
                  className="w-full flex items-start gap-3 p-4 bg-cream-50 border text-left transition-colors"
                  style={{
                    borderRadius: 2,
                    borderColor: frameOrder === 'all' ? '#C9A96E' : '#DDD8CE',
                  }}
                >
                  <span
                    className="flex-shrink-0 mt-0.5 w-4 h-4 flex items-center justify-center border"
                    style={{
                      borderRadius: 2,
                      borderColor: frameOrder === 'all' ? '#C9A96E' : '#DDD8CE',
                      backgroundColor: frameOrder === 'all' ? '#C9A96E' : 'transparent',
                    }}
                  >
                    {frameOrder === 'all' && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                        <path
                          d="M1 4l2.5 2.5L9 1"
                          stroke="#1A1612"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <div>
                    <p className="font-sans font-semibold text-sm text-ink-900">All frames</p>
                    <p className="font-sans text-xs text-ink-500 mt-0.5">
                      Show full catalogue in alphabetical order.
                    </p>
                  </div>
                </button>
              </div>
            </fieldset>

            {/* Checkboxes */}
            <div className="flex flex-col gap-3 mb-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiStylist}
                  onChange={(e) => setAiStylist(e.target.checked)}
                  className="accent-gold-500"
                  style={{ borderRadius: 2 }}
                />
                <span className="font-sans text-sm text-ink-900">Show AI Stylist by default</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={faceShape}
                  onChange={(e) => setFaceShape(e.target.checked)}
                  className="accent-gold-500"
                  style={{ borderRadius: 2 }}
                />
                <span className="font-sans text-sm text-ink-900">Show face shape analysis</span>
              </label>
            </div>

            <button
              type="button"
              onClick={advance}
              className="w-full py-3 font-sans font-semibold text-sm text-ink-900 hover:opacity-80 transition-opacity"
              style={{ borderRadius: 2, minHeight: 44, backgroundColor: '#C9A96E' }}
            >
              Continue &rarr;
            </button>
          </div>
        )}

        {/* ── Step 3 — Go Live ── */}
        {step === 3 && (
          <div>
            <h1 className="font-serif text-3xl italic text-ink-900 mb-2">You&apos;re ready!</h1>
            <p className="font-sans text-sm text-ink-500 leading-relaxed mb-8">
              Your AR try-on is configured. Share your QR code to start.
            </p>

            {/* QR placeholder */}
            <div className="flex justify-center mb-8">
              <div
                className="w-[120px] h-[120px] bg-cream-200 border border-cream-400 flex items-center justify-center"
                style={{ borderRadius: 2 }}
                aria-label="QR code preview"
              >
                <p className="font-sans text-xs text-ink-300 text-center leading-snug px-2">
                  QR
                  <br />
                  Preview
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 mb-5">
              <Link
                href="/trydemo"
                className="block w-full py-3 text-center font-sans font-semibold text-sm text-ink-900 hover:opacity-80 transition-opacity"
                style={{ borderRadius: 2, backgroundColor: '#C9A96E', textDecoration: 'none' }}
              >
                Open AR Demo
              </Link>
              <button
                type="button"
                onClick={() => setDone(true)}
                className="w-full py-3 font-sans font-semibold text-sm text-ink-900 border border-cream-400 hover:border-ink-900 transition-colors bg-transparent"
                style={{ borderRadius: 2, minHeight: 44 }}
              >
                Go to Dashboard
              </button>
            </div>

            {/* QR note */}
            <p className="text-center font-sans text-xs text-ink-500">
              Generate your store QR at{' '}
              <Link href="/qr" className="text-gold-600 hover:underline font-semibold">
                spectasnap.com/qr
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
