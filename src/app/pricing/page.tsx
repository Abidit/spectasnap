'use client';

import { useState } from 'react';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────

type Feature = { text: string; included: boolean };

// ── FAQ data ──────────────────────────────────────────────────────────────────

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Is the 30-day trial really free?',
    a: 'Yes, no credit card required. Cancel before day 30 and you pay nothing.',
  },
  {
    q: 'What happens after the free trial?',
    a: "You choose a plan or downgrade to Starter. We'll send a reminder 3 days before trial ends.",
  },
  {
    q: 'Can I switch plans later?',
    a: 'Yes, upgrade or downgrade anytime. Billing adjusts pro-rata.',
  },
  {
    q: 'How does session counting work?',
    a: 'Each camera session counts as one session, regardless of how many frames are tried.',
  },
  {
    q: 'Do you support Indian payment methods?',
    a: 'Yes — UPI, NetBanking, and cards via Razorpay.',
  },
  {
    q: "What's included in white-label?",
    a: 'Remove SpectaSnap branding, use your own domain, custom colors.',
  },
  {
    q: 'Is there a setup fee?',
    a: 'Never. Setup is self-serve in under 5 minutes.',
  },
];

// ── Feature row ───────────────────────────────────────────────────────────────

function FeatureItem({ text, included }: Feature) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="flex-shrink-0 mt-0.5 text-[13px] leading-none"
        style={{ color: included ? '#22c55e' : '#DDD8CE' }}
        aria-hidden="true"
      >
        {included ? '✓' : '✗'}
      </span>
      <span
        className="font-sans text-sm leading-snug"
        style={{ color: included ? '#1A1612' : '#9A9490' }}
      >
        {text}
      </span>
    </li>
  );
}

// ── FAQ accordion item ────────────────────────────────────────────────────────

function FaqItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-cream-400 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
      >
        <span className="font-sans font-semibold text-sm text-ink-900 group-hover:text-gold-600 transition-colors">
          {q}
        </span>
        <span
          className="flex-shrink-0 font-sans font-semibold text-lg text-ink-300 leading-none transition-transform duration-200"
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      {open && (
        <div className="pb-5 -mt-1">
          <p className="font-sans text-sm text-ink-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [faqOpen, setFaqOpen] = useState<boolean[]>(
    new Array(FAQ_ITEMS.length).fill(false)
  );

  function toggleFaq(index: number) {
    setFaqOpen((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  // Prices per month (annual vs monthly)
  const proPriceMonthly = isAnnual ? '$119' : '$149';
  const bizPriceMonthly = isAnnual ? '$399' : '$499';

  const starterFeatures: Feature[] = [
    { text: 'Live AR try-on', included: true },
    { text: '10 frame styles', included: true },
    { text: '3 color variants', included: true },
    { text: '500 sessions/month', included: true },
    { text: 'Share look (with watermark)', included: true },
    { text: 'Analytics dashboard', included: false },
    { text: 'Staff panel', included: false },
    { text: 'Custom frames', included: false },
    { text: 'Remove watermark', included: false },
  ];

  const proFeatures: Feature[] = [
    { text: 'All 55 frame styles', included: true },
    { text: 'Unlimited sessions', included: true },
    { text: 'Upload 20 custom frames', included: true },
    { text: 'Remove watermark', included: true },
    { text: 'Analytics dashboard', included: true },
    { text: 'Staff recommendation panel', included: true },
    { text: 'AI Stylist', included: true },
    { text: 'QR code generator', included: true },
    { text: 'Printable one-pager', included: true },
    { text: '1 location', included: true },
  ];

  const bizFeatures: Feature[] = [
    { text: 'Up to 5 locations', included: true },
    { text: 'Multi-store analytics', included: true },
    { text: 'Unlimited frame upload', included: true },
    { text: 'White-label branding', included: true },
    { text: 'API access', included: true },
    { text: 'Priority support', included: true },
    { text: 'Everything in Professional', included: true },
  ];

  const trustItems = [
    'No credit card',
    '30-day free trial',
    'Cancel anytime',
    '5 min setup',
    'Data private',
  ];

  const enterprisePills = [
    'Custom SLA',
    'Dedicated support',
    'API access',
    'White-label',
    'Multiple brands',
  ];

  return (
    <div className="min-h-screen bg-cream-100 font-sans">
      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-cream-50 border-b border-cream-400 h-16 flex items-center px-6">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 no-underline">
            <span className="font-serif text-xl font-semibold text-ink-900">
              Specta<em className="italic not-italic" style={{ color: '#C9A96E' }}>Snap</em>
            </span>
          </Link>

          {/* Back link */}
          <Link
            href="/"
            className="font-sans text-sm font-semibold text-ink-500 hover:text-ink-900 transition-colors no-underline flex items-center gap-1"
          >
            <span aria-hidden="true">←</span> Back to home
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="py-20 text-center bg-cream-100 px-6">
        {/* Eyebrow */}
        <p
          className="text-[11px] uppercase tracking-[0.1em] font-semibold mb-4"
          style={{ color: '#A8844A' }}
        >
          PRICING
        </p>

        {/* H1 */}
        <h1 className="font-serif text-5xl font-semibold text-ink-900 leading-tight mb-4">
          Simple pricing.
          <br />
          <em className="italic" style={{ color: '#C9A96E' }}>
            Powerful try-on.
          </em>
        </h1>

        {/* Sub */}
        <p className="font-sans text-base text-ink-500 mb-8">
          Start free. Upgrade when ready.
        </p>

        {/* Monthly / Annual toggle */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <div
            className="flex border border-cream-400 p-0.5"
            style={{ borderRadius: 2, backgroundColor: '#FDFAF4' }}
          >
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className="font-sans font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              style={{
                borderRadius: 2,
                backgroundColor: !isAnnual ? '#1A1612' : 'transparent',
                color: !isAnnual ? '#FDFAF4' : '#6B6560',
                padding: '8px 20px',
                fontSize: 12,
                fontWeight: 600,
              }}
              aria-pressed={!isAnnual}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className="font-sans font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              style={{
                borderRadius: 2,
                backgroundColor: isAnnual ? '#1A1612' : 'transparent',
                color: isAnnual ? '#FDFAF4' : '#6B6560',
                padding: '8px 20px',
                fontSize: 12,
                fontWeight: 600,
              }}
              aria-pressed={isAnnual}
            >
              Annual — Save 20%
            </button>
          </div>
        </div>
      </section>

      {/* ── THREE PLAN CARDS ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 mt-2 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* STARTER */}
        <div
          className="bg-cream-50 border border-cream-400 p-8 flex flex-col"
          style={{ borderRadius: 2 }}
        >
          <p
            className="text-[10px] uppercase tracking-[0.12em] font-semibold mb-3"
            style={{ color: '#9A9490' }}
          >
            STARTER
          </p>

          <div className="mb-1">
            <span className="font-serif text-5xl font-semibold text-ink-900">$0</span>
            <span className="font-sans text-sm text-ink-500 ml-1">/month</span>
          </div>

          <p className="font-sans text-sm text-ink-500 mt-2 mb-6">
            Try the full AR experience
          </p>

          <button
            type="button"
            className="w-full py-3 font-sans font-semibold text-sm transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            style={{
              borderRadius: 2,
              border: '1px solid #DDD8CE',
              backgroundColor: 'transparent',
              color: '#1A1612',
            }}
          >
            Get started free
          </button>

          <div className="border-t border-cream-400 my-6" />

          <ul className="flex flex-col gap-3 flex-1">
            {starterFeatures.map((f) => (
              <FeatureItem key={f.text} text={f.text} included={f.included} />
            ))}
          </ul>
        </div>

        {/* PROFESSIONAL */}
        <div
          className="bg-cream-50 border-2 p-8 flex flex-col relative"
          style={{ borderRadius: 2, borderColor: '#C9A96E' }}
        >
          {/* Most popular badge */}
          <span
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.12em] font-semibold px-3 py-1 rounded-full whitespace-nowrap"
            style={{ backgroundColor: '#C9A96E', color: '#1A1612' }}
          >
            MOST POPULAR
          </span>

          <p
            className="text-[10px] uppercase tracking-[0.12em] font-semibold mb-3"
            style={{ color: '#9A9490' }}
          >
            PROFESSIONAL
          </p>

          <div className="mb-1">
            <span className="font-serif text-5xl font-semibold text-ink-900">
              {proPriceMonthly}
            </span>
            <span className="font-sans text-sm text-ink-500 ml-1">/month</span>
          </div>

          {isAnnual && (
            <p className="font-sans text-xs mt-1 mb-2" style={{ color: '#16a34a' }}>
              Save $360/year
            </p>
          )}

          <p className="font-sans text-sm text-ink-500 mt-2 mb-6">
            Everything you need to run AR in-store
          </p>

          <button
            type="button"
            className="w-full py-3 font-sans font-semibold text-sm transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            style={{
              borderRadius: 2,
              backgroundColor: '#C9A96E',
              color: '#1A1612',
            }}
          >
            Start 30-day free trial
          </button>

          <div className="border-t border-cream-400 my-6" />

          <ul className="flex flex-col gap-3 flex-1">
            {proFeatures.map((f) => (
              <FeatureItem key={f.text} text={f.text} included={f.included} />
            ))}
          </ul>
        </div>

        {/* BUSINESS */}
        <div
          className="bg-cream-50 border border-cream-400 p-8 flex flex-col"
          style={{ borderRadius: 2 }}
        >
          <p
            className="text-[10px] uppercase tracking-[0.12em] font-semibold mb-3"
            style={{ color: '#9A9490' }}
          >
            BUSINESS
          </p>

          <div className="mb-1">
            <span className="font-serif text-5xl font-semibold text-ink-900">
              {bizPriceMonthly}
            </span>
            <span className="font-sans text-sm text-ink-500 ml-1">/month</span>
          </div>

          {isAnnual && (
            <p className="font-sans text-xs mt-1 mb-2" style={{ color: '#16a34a' }}>
              Save $1,200/year
            </p>
          )}

          <p className="font-sans text-sm text-ink-500 mt-2 mb-6">
            For multi-location optical groups
          </p>

          <button
            type="button"
            className="w-full py-3 font-sans font-semibold text-sm transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            style={{
              borderRadius: 2,
              backgroundColor: '#1A1612',
              color: '#FDFAF4',
            }}
          >
            Start 30-day free trial
          </button>

          <div className="border-t border-cream-400 my-6" />

          <ul className="flex flex-col gap-3 flex-1">
            {bizFeatures.map((f) => (
              <FeatureItem key={f.text} text={f.text} included={f.included} />
            ))}
          </ul>
        </div>
      </div>

      {/* ── ENTERPRISE BANNER ────────────────────────────────────────────────── */}
      <div
        className="max-w-5xl mx-auto px-6 mt-8"
      >
        <div
          className="p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          style={{ borderRadius: 2, backgroundColor: '#0A0A0A' }}
        >
          <div className="flex-1">
            <h2 className="font-serif text-2xl font-semibold mb-4" style={{ color: '#FDFAF4' }}>
              Running 5+ locations or need a custom integration?
            </h2>
            <div className="flex flex-wrap gap-2">
              {enterprisePills.map((pill) => (
                <span
                  key={pill}
                  className="text-[10px] uppercase tracking-[0.08em] font-semibold px-3 py-1"
                  style={{
                    borderRadius: 2,
                    border: '1px solid rgba(253,250,244,0.20)',
                    color: 'rgba(253,250,244,0.60)',
                  }}
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0">
            <a
              href="/#pilot"
              className="inline-block px-6 py-2.5 font-sans font-semibold text-sm transition-opacity hover:opacity-90 no-underline"
              style={{
                borderRadius: 2,
                backgroundColor: '#C9A96E',
                color: '#1A1612',
              }}
            >
              Talk to us →
            </a>
          </div>
        </div>
      </div>

      {/* ── TRUST BAR ────────────────────────────────────────────────────────── */}
      <div className="bg-cream-200 border-y border-cream-400 py-4 mt-12">
        <div className="max-w-5xl mx-auto px-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {trustItems.map((item, idx) => (
              <li key={item} className="flex items-center gap-2">
                {idx > 0 && (
                  <span
                    className="hidden sm:inline-block w-1 h-1 rounded-full bg-cream-400"
                    aria-hidden="true"
                  />
                )}
                <span className="font-sans text-xs font-semibold text-ink-500 uppercase tracking-[0.08em]">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── FAQ ACCORDION ────────────────────────────────────────────────────── */}
      <section
        className="max-w-[720px] mx-auto px-6 py-20"
        aria-labelledby="faq-heading"
      >
        <h2
          id="faq-heading"
          className="font-serif text-3xl font-semibold text-ink-900 mb-8 text-center"
        >
          Frequently asked
        </h2>

        <div
          className="border-t border-cream-400"
          role="list"
        >
          {FAQ_ITEMS.map((item, idx) => (
            <div key={item.q} role="listitem">
              <FaqItem
                q={item.q}
                a={item.a}
                open={faqOpen[idx]}
                onToggle={() => toggleFaq(idx)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-cream-400 bg-cream-50 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-ink-300">
            &copy; 2026 SpectaSnap
          </p>
          <Link
            href="/"
            className="font-sans text-xs font-semibold text-ink-500 hover:text-ink-900 transition-colors no-underline flex items-center gap-1"
          >
            <span aria-hidden="true">←</span> Back to home
          </Link>
        </div>
      </footer>
    </div>
  );
}
