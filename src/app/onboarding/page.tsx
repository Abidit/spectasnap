'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

type Step = 1 | 2 | 3;

/* ─── Progress indicator ─────────────────────────────────────────────────── */

const STEP_LABELS: Record<Step, string> = {
  1: 'IDENTITY',
  2: 'CURATION',
  3: 'OPTICS',
};

function StepProgress({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-0" aria-label="Onboarding progress" role="list">
      {([1, 2, 3] as Step[]).map((s, i) => {
        const done = s < current;
        const active = s === current;
        return (
          <div key={s} className="flex items-center" role="listitem">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="flex items-center justify-center font-sans font-semibold text-xs transition-colors"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: active
                    ? '#A8844A'
                    : done
                    ? '#C9A96E'
                    : 'transparent',
                  border: active || done ? 'none' : '1.5px solid #DDD8CE',
                  color: active || done ? '#FDFAF4' : '#9A9490',
                }}
                aria-label={`Step ${s}${done ? ' (completed)' : active ? ' (current)' : ''}`}
              >
                {done ? (
                  /* checkmark */
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                    <path
                      d="M1 5l3 3.5L11 1"
                      stroke="#FDFAF4"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  s
                )}
              </div>
              <span
                className="font-sans font-semibold uppercase"
                style={{
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  color: active ? '#A8844A' : done ? '#C9A96E' : '#9A9490',
                  whiteSpace: 'nowrap',
                }}
              >
                {STEP_LABELS[s]}
              </span>
            </div>

            {/* Connector line */}
            {i < 2 && (
              <div
                style={{
                  width: 48,
                  height: 1.5,
                  marginBottom: 16,
                  backgroundColor: s < current ? '#C9A96E' : '#DDD8CE',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Shared chrome (header + footer) ──────────────────────────────────────── */

function PageChrome({
  step,
  children,
}: {
  step: Step;
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#F5F0E8' }}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 pt-7 pb-0">
        {/* Logo */}
        <span
          className="font-serif"
          style={{ fontSize: 20, color: '#1A1612', letterSpacing: '-0.01em', fontWeight: 600 }}
        >
          SpectaSnap
        </span>

        {/* Progress */}
        <StepProgress current={step} />

        {/* Save & exit */}
        <Link
          href="/dashboard"
          className="font-sans font-semibold uppercase hover:opacity-60 transition-opacity"
          style={{ fontSize: 10, letterSpacing: '0.14em', color: '#6B6560', textDecoration: 'none' }}
        >
          Save &amp; Exit
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer */}
      <footer className="px-8 py-5 text-center">
        <span
          className="font-sans"
          style={{ fontSize: 11, color: '#9A9490', letterSpacing: '0.04em' }}
        >
          &copy; {new Date().getFullYear()} SpectaSnap. All rights reserved.
        </span>
      </footer>
    </div>
  );
}

/* ─── Step 1 — Identity ──────────────────────────────────────────────────── */

function Step1({
  storeName,
  setStoreName,
  storeCity,
  setStoreCity,
  onNext,
}: {
  storeName: string;
  setStoreName: (v: string) => void;
  storeCity: string;
  setStoreCity: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex-1 flex items-center px-8 py-12">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-5 gap-12 items-center">
        {/* LEFT — 60% */}
        <div className="col-span-3">
          {/* Eyebrow */}
          <p
            className="font-sans font-semibold uppercase mb-4"
            style={{ fontSize: 10, letterSpacing: '0.18em', color: '#A8844A' }}
          >
            The Beginning
          </p>

          {/* Heading */}
          <h1
            className="font-serif italic mb-5 leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#1A1612', fontWeight: 600 }}
          >
            Welcome to your Digital Atelier.
          </h1>

          {/* Body */}
          <p
            className="font-sans leading-relaxed mb-10"
            style={{ fontSize: 15, color: '#6B6560', maxWidth: 420 }}
          >
            Before we begin curating your virtual inventory, we need to calibrate the
            environment for your unique brand aesthetic.
          </p>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onNext();
            }}
            className="flex flex-col gap-6"
          >
            {/* Store name */}
            <div>
              <label
                htmlFor="onb-brand-name"
                className="block font-sans font-semibold uppercase mb-2"
                style={{ fontSize: 10, letterSpacing: '0.16em', color: '#1A1612' }}
              >
                Full Brand Identity Name
              </label>
              <input
                id="onb-brand-name"
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Maison de Vue"
                className="w-full px-4 py-3 font-sans text-sm bg-cream-50 border border-cream-400 text-ink-900 focus:outline-none transition-colors"
                style={{
                  borderRadius: 2,
                  fontSize: 14,
                  color: '#1A1612',
                  backgroundColor: '#FDFAF4',
                  borderColor: '#DDD8CE',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#C9A96E')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#DDD8CE')}
              />
            </div>

            {/* Region */}
            <div>
              <label
                htmlFor="onb-region"
                className="block font-sans font-semibold uppercase mb-2"
                style={{ fontSize: 10, letterSpacing: '0.16em', color: '#1A1612' }}
              >
                Primary Region of Operation
              </label>
              <div className="relative">
                <select
                  id="onb-region"
                  value={storeCity}
                  onChange={(e) => setStoreCity(e.target.value)}
                  className="w-full appearance-none px-4 py-3 font-sans text-sm border border-cream-400 focus:outline-none transition-colors pr-10"
                  style={{
                    borderRadius: 2,
                    fontSize: 14,
                    color: storeCity ? '#1A1612' : '#9A9490',
                    backgroundColor: '#FDFAF4',
                    borderColor: '#DDD8CE',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#C9A96E')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#DDD8CE')}
                >
                  <option value="" disabled>
                    European Union (Luxembourg)
                  </option>
                  <option value="europe">European Union</option>
                  <option value="north-america">North America</option>
                  <option value="asia-pacific">Asia Pacific</option>
                  <option value="middle-east">Middle East</option>
                  <option value="south-asia">South Asia</option>
                  <option value="latin-america">Latin America</option>
                  <option value="africa">Africa</option>
                </select>
                {/* Chevron */}
                <span
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#9A9490' }}
                  aria-hidden="true"
                >
                  <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                    <path
                      d="M1 1l6 6 6-6"
                      stroke="#9A9490"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-5 pt-2">
              <button
                type="submit"
                className="font-sans font-semibold text-cream-50 hover:opacity-80 transition-opacity px-8 py-3"
                style={{
                  borderRadius: 2,
                  fontSize: 12,
                  letterSpacing: '0.12em',
                  backgroundColor: '#A8844A',
                  textTransform: 'uppercase',
                  minHeight: 44,
                }}
              >
                Next Step &rarr;
              </button>
              <button
                type="button"
                className="font-sans font-semibold uppercase hover:opacity-60 transition-opacity"
                style={{ fontSize: 11, letterSpacing: '0.12em', color: '#6B6560', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => {}}
              >
                Back
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT — 40% */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Image card */}
          <div
            className="w-full flex items-center justify-center overflow-hidden"
            style={{
              backgroundColor: '#EDE8DC',
              borderRadius: 2,
              aspectRatio: '4/5',
              position: 'relative',
            }}
            aria-label="Brand preview"
          >
            {/* Decorative glasses silhouette */}
            <div className="flex flex-col items-center gap-3 opacity-30">
              <svg width="96" height="40" viewBox="0 0 96 40" fill="none" aria-hidden="true">
                <rect x="2" y="8" width="36" height="24" rx="8" stroke="#1A1612" strokeWidth="2.5" />
                <rect x="58" y="8" width="36" height="24" rx="8" stroke="#1A1612" strokeWidth="2.5" />
                <path d="M38 20 Q48 14 58 20" stroke="#1A1612" strokeWidth="2" fill="none" />
                <path d="M2 20 Q-6 20 -10 16" stroke="#1A1612" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M94 20 Q102 20 106 16" stroke="#1A1612" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              <span className="font-serif italic" style={{ fontSize: 13, color: '#1A1612' }}>
                Glasses Preview
              </span>
            </div>

            {/* Gold corner accent */}
            <div
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#C9A96E',
              }}
            />
          </div>

          {/* Caption box */}
          <div
            className="px-5 py-4 border border-cream-400"
            style={{ borderRadius: 2, backgroundColor: '#FDFAF4' }}
          >
            <p
              className="font-serif italic mb-1"
              style={{ fontSize: 14, color: '#1A1612' }}
            >
              Optical Precision
            </p>
            <p
              className="font-sans font-semibold uppercase"
              style={{ fontSize: 9, letterSpacing: '0.18em', color: '#A8844A' }}
            >
              Calibration: 99.4%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2 — Setup (PIN) ────────────────────────────────────────────────── */

function Step2({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  function handleDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...pin];
    next[index] = digit;
    setPin(next);
    if (digit && index < 3) {
      refs[index + 1].current?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-8 py-12 relative">
      {/* Vertical rotated text decoration */}
      <div
        className="absolute left-8 top-1/2 -translate-y-1/2 font-serif italic select-none pointer-events-none"
        style={{
          fontSize: 64,
          color: '#DDD8CE',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          transform: 'translateY(-50%) rotate(180deg)',
          letterSpacing: '-0.02em',
          userSelect: 'none',
        }}
        aria-hidden="true"
      >
        Precision
      </div>

      {/* Centered card */}
      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* Step indicator */}
        <p
          className="font-sans font-semibold uppercase mb-6"
          style={{ fontSize: 9, letterSpacing: '0.2em', color: '#9A9490' }}
        >
          Step 2 of 3
        </p>

        {/* Heading */}
        <h1
          className="font-serif italic mb-5 leading-tight"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#A8844A', fontWeight: 600 }}
        >
          Set your staff PIN.
        </h1>

        {/* Body */}
        <p
          className="font-sans leading-relaxed mb-10"
          style={{ fontSize: 15, color: '#6B6560', maxWidth: 360 }}
        >
          Create a secure access code for your team to quickly toggle between curator
          profiles and administrative settings.
        </p>

        {/* PIN inputs */}
        <div className="flex items-center gap-4 mb-10" role="group" aria-label="4-digit PIN">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              aria-label={`PIN digit ${i + 1}`}
              className="font-serif font-semibold text-center bg-transparent border-b-2 focus:outline-none transition-colors"
              style={{
                width: 72,
                height: 80,
                fontSize: 36,
                color: '#1A1612',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: digit ? '2px solid #A8844A' : '2px dashed #DDD8CE',
                borderRadius: 0,
                caretColor: '#A8844A',
              }}
              onFocus={(e) => {
                if (!digit) e.currentTarget.style.borderBottom = '2px dashed #C9A96E';
              }}
              onBlur={(e) => {
                if (!digit) e.currentTarget.style.borderBottom = '2px dashed #DDD8CE';
              }}
            />
          ))}
        </div>

        {/* Continue */}
        <button
          type="button"
          onClick={onNext}
          className="w-full font-sans font-semibold uppercase text-cream-50 hover:opacity-80 transition-opacity py-3 mb-4"
          style={{
            borderRadius: 2,
            fontSize: 12,
            letterSpacing: '0.14em',
            backgroundColor: '#A8844A',
            minHeight: 48,
          }}
        >
          Continue
        </button>

        {/* Skip */}
        <button
          type="button"
          onClick={onSkip}
          className="font-sans font-semibold uppercase hover:opacity-60 transition-opacity"
          style={{ fontSize: 10, letterSpacing: '0.14em', color: '#9A9490', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Skip for now
        </button>

        {/* Encryption note */}
        <p
          className="font-sans uppercase mt-6"
          style={{ fontSize: 9, letterSpacing: '0.16em', color: '#9A9490' }}
        >
          🔒 End-to-end encrypted storage
        </p>
      </div>
    </div>
  );
}

/* ─── Step 3 — Launch ─────────────────────────────────────────────────────── */

function Step3({ storeName, onDone }: { storeName: string; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const slug = storeName
    ? storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    : 'maison-elegant';
  const url = `try.spectasnap.com/${slug}`;

  function handleCopy() {
    navigator.clipboard.writeText(`https://${url}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex-1 flex items-center px-8 py-12">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-5 gap-12 items-start">
        {/* LEFT — 60% */}
        <div className="col-span-3 pt-4">
          {/* Pulsing gold dot */}
          <div className="mb-6">
            <span
              className="inline-block w-3 h-3 animate-pulse"
              style={{ borderRadius: '50%', backgroundColor: '#C9A96E' }}
              aria-hidden="true"
            />
          </div>

          {/* Heading */}
          <h1
            className="font-serif mb-5 leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#1A1612', fontWeight: 600 }}
          >
            You&apos;re{' '}
            <em style={{ color: '#A8844A', fontStyle: 'italic' }}>all set!</em>
          </h1>

          {/* Body */}
          <p
            className="font-sans leading-relaxed mb-10"
            style={{ fontSize: 15, color: '#6B6560', maxWidth: 420 }}
          >
            Your virtual boutique is ready for the world. We&apos;ve synchronized your
            collection and calibrated the AR lens.
          </p>

          {/* CTA */}
          <Link
            href="/dashboard"
            className="block font-sans font-semibold uppercase text-center hover:opacity-80 transition-opacity py-3 px-8 w-full"
            style={{
              borderRadius: 2,
              fontSize: 12,
              letterSpacing: '0.14em',
              backgroundColor: '#A8844A',
              color: '#FDFAF4',
              textDecoration: 'none',
              minHeight: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={onDone}
          >
            Open Try-On Dashboard
          </Link>
        </div>

        {/* RIGHT — 40% */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Boutique URL */}
          <div>
            <label
              className="block font-sans font-semibold uppercase mb-2"
              style={{ fontSize: 9, letterSpacing: '0.2em', color: '#9A9490' }}
            >
              Your Unique Boutique URL
            </label>
            <div className="flex items-stretch border border-cream-400" style={{ borderRadius: 2 }}>
              <input
                type="text"
                readOnly
                value={url}
                className="flex-1 px-4 py-3 font-sans text-sm bg-cream-50 focus:outline-none"
                style={{
                  borderRadius: 0,
                  fontSize: 13,
                  color: '#1A1612',
                  backgroundColor: '#FDFAF4',
                  border: 'none',
                }}
              />
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy boutique URL"
                className="px-4 flex items-center justify-center border-l border-cream-400 hover:opacity-70 transition-opacity"
                style={{ backgroundColor: '#F5F0E8', cursor: 'pointer' }}
              >
                {copied ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 7l3.5 3.5L12 3" stroke="#A8844A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <rect x="4" y="4" width="8" height="9" rx="1" stroke="#6B6560" strokeWidth="1.5" />
                    <path d="M4 4V3a1 1 0 011-1h5a1 1 0 011 1v1" stroke="#6B6560" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M1 7h3" stroke="#6B6560" strokeWidth="1.5" strokeLinecap="round" />
                    <rect x="1" y="2" width="7" height="8" rx="1" stroke="#6B6560" strokeWidth="1.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Two cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* QR code card */}
            <div
              className="flex flex-col gap-3 p-4 border border-cream-400"
              style={{ borderRadius: 2, backgroundColor: '#FDFAF4' }}
            >
              {/* QR placeholder */}
              <div
                className="w-full flex items-center justify-center border border-cream-400"
                style={{ borderRadius: 2, aspectRatio: '1', backgroundColor: '#EDE8DC' }}
                aria-label="QR code preview"
              >
                {/* Minimal QR pattern */}
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ opacity: 0.4 }}>
                  <rect x="4" y="4" width="16" height="16" rx="1" stroke="#1A1612" strokeWidth="2" />
                  <rect x="8" y="8" width="8" height="8" fill="#1A1612" />
                  <rect x="28" y="4" width="16" height="16" rx="1" stroke="#1A1612" strokeWidth="2" />
                  <rect x="32" y="8" width="8" height="8" fill="#1A1612" />
                  <rect x="4" y="28" width="16" height="16" rx="1" stroke="#1A1612" strokeWidth="2" />
                  <rect x="8" y="32" width="8" height="8" fill="#1A1612" />
                  <rect x="28" y="28" width="4" height="4" fill="#1A1612" />
                  <rect x="36" y="28" width="4" height="4" fill="#1A1612" />
                  <rect x="28" y="36" width="4" height="4" fill="#1A1612" />
                  <rect x="36" y="36" width="4" height="4" fill="#1A1612" />
                </svg>
              </div>

              <div>
                <p
                  className="font-sans font-semibold uppercase mb-1"
                  style={{ fontSize: 9, letterSpacing: '0.16em', color: '#6B6560' }}
                >
                  Store QR Code
                </p>
                <button
                  type="button"
                  className="font-sans font-semibold uppercase hover:opacity-60 transition-opacity"
                  style={{ fontSize: 9, letterSpacing: '0.14em', color: '#A8844A', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Download Asset
                </button>
              </div>
            </div>

            {/* Curator's tip card */}
            <div
              className="flex flex-col gap-3 p-4"
              style={{ borderRadius: 2, backgroundColor: '#1A1612' }}
            >
              {/* Sparkle */}
              <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden="true">✦</span>

              <p
                className="font-serif italic"
                style={{ fontSize: 13, color: '#C9A96E', lineHeight: 1.3 }}
              >
                The Curator&apos;s Tip
              </p>

              <p
                className="font-sans leading-snug"
                style={{ fontSize: 11, color: '#9A9490', lineHeight: 1.5 }}
              >
                Embed the try-on button directly into your product pages for a 3&times;
                higher conversion rate.
              </p>

              <button
                type="button"
                className="font-sans font-semibold uppercase hover:opacity-70 transition-opacity text-left"
                style={{ fontSize: 9, letterSpacing: '0.16em', color: '#C9A96E', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                View Guide &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page root ──────────────────────────────────────────────────────────── */

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [storeName, setStoreName] = useState('');
  const [storeCity, setStoreCity] = useState('');
  const [done, setDone] = useState(false);

  function advance() {
    setStep((prev) => (Math.min(prev + 1, 3) as Step));
  }

  /* Loading screen after done */
  if (done) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ backgroundColor: '#F5F0E8' }}
      >
        <div className="flex flex-col items-center gap-4">
          <span
            className="inline-block w-3 h-3 animate-pulse"
            style={{ borderRadius: '50%', backgroundColor: '#C9A96E' }}
            aria-hidden="true"
          />
          <p className="font-sans text-sm" style={{ color: '#6B6560' }}>
            All done! Redirecting to dashboard&hellip;
          </p>
        </div>
      </div>
    );
  }

  return (
    <PageChrome step={step}>
      {step === 1 && (
        <Step1
          storeName={storeName}
          setStoreName={setStoreName}
          storeCity={storeCity}
          setStoreCity={setStoreCity}
          onNext={advance}
        />
      )}

      {step === 2 && (
        <Step2
          onNext={advance}
          onSkip={advance}
        />
      )}

      {step === 3 && (
        <Step3
          storeName={storeName}
          onDone={() => setDone(true)}
        />
      )}
    </PageChrome>
  );
}
