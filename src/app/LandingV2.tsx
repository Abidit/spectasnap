'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Data ──────────────────────────────────────────────────────────────────────

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How long does setup take?',
    a: 'Under 5 minutes. Share a QR code on WhatsApp and your customer is live.',
  },
  {
    q: 'Does it work on mobile phones?',
    a: 'Yes — any device with a front camera. Works in Chrome and Safari, on tablet or phone.',
  },
  {
    q: 'Can I add our own frames?',
    a: 'Yes — upload GLB files via the Upload portal. Your real inventory, not generic styles.',
  },
  {
    q: 'Is customer data stored?',
    a: 'No. All face-tracking processing happens on-device. Nothing leaves the browser.',
  },
  {
    q: "What's the cost?",
    a: 'Free for 30 days, then ₹2,999/month. No per-customer charges, no surprises.',
  },
];

const FEATURES: { num: string; title: string; desc: string }[] = [
  {
    num: '01',
    title: 'No app to download',
    desc: 'Runs entirely in the browser. Open a URL on any tablet and you are live.',
  },
  {
    num: '02',
    title: 'Works on any tablet or laptop',
    desc: 'iPad, Android, Windows — if it has a front camera and a browser, it works.',
  },
  {
    num: '03',
    title: '50+ frame styles out of the box',
    desc: 'Round, aviator, cat-eye, rectangle, sport-wrap. Ready from day one.',
  },
  {
    num: '04',
    title: 'AI detects face shape automatically',
    desc: 'Oval, round, square, heart, oblong — detected in real time using 478 landmarks.',
  },
  {
    num: '05',
    title: 'Staff recommendation panel included',
    desc: 'Your staff sees the detected shape and the top 3 recommended frames. Know what to say.',
  },
];

const HOW_STEPS: { num: string; title: string; desc: string }[] = [
  {
    num: '01',
    title: 'Place tablet in store',
    desc: 'Mount at the counter or consultation table. No wiring.',
  },
  {
    num: '02',
    title: 'Customer sees frames live',
    desc: 'Face tracked in real time. Any frame. Any angle.',
  },
  {
    num: '03',
    title: 'Staff closes the sale',
    desc: 'AI recommends best frames by face shape. Staff knows what to say.',
  },
];

// ─── Types ─────────────────────────────────────────────────────────────────────

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

interface FormFields {
  name: string;
  store: string;
  city: string;
  whatsapp: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function LandingV2() {
  const [navOpen, setNavOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<boolean[]>(FAQS.map(() => false));
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [form, setForm] = useState<FormFields>({ name: '', store: '', city: '', whatsapp: '' });
  const [showStickyBar, setShowStickyBar] = useState(true);
  const pilotRef = useRef<HTMLElement>(null);

  // Hide sticky CTA when pilot section is visible
  useEffect(() => {
    const el = pilotRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Close nav on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setNavOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function toggleFaq(index: number) {
    setFaqOpen((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormStatus('loading');
    try {
      const res = await fetch('https://formspree.io/f/xojnpnzy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: form.name,
          store_name: form.store,
          city: form.city,
          whatsapp: form.whatsapp,
        }),
      });
      if (res.ok) {
        setFormStatus('success');
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  }

  return (
    <div className="bg-cream-50 font-sans text-ink-900 min-h-screen">

      {/* ── STICKY NAV ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 h-16 flex items-center bg-cream-50/90 backdrop-blur-sm border-b border-cream-400">
        <div className="max-w-6xl mx-auto w-full px-6 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="font-serif text-xl font-semibold text-ink-900 tracking-tight">
            Specta<em className="not-italic italic text-gold-500">Snap</em>
          </Link>

          {/* Desktop center links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-sm text-ink-500 hover:text-ink-900 transition-colors">
              How it works
            </a>
            <a href="#stores" className="text-sm text-ink-500 hover:text-ink-900 transition-colors">
              For stores
            </a>
            <a href="#pilot" className="text-sm text-ink-500 hover:text-ink-900 transition-colors">
              Pricing
            </a>
          </div>

          {/* Desktop right CTA + mobile hamburger */}
          <div className="flex items-center gap-3">
            <a
              href="#pilot"
              className="hidden md:inline-flex bg-ink-900 text-cream-50 text-xs font-semibold px-4 py-2 rounded-sharp hover:bg-ink-900/90 transition-colors"
            >
              Book Demo
            </a>
            <button
              className="md:hidden flex flex-col gap-[5px] items-center justify-center w-8 h-8"
              onClick={() => setNavOpen((v) => !v)}
              aria-label={navOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={navOpen}
            >
              <span
                className={`block w-5 h-0.5 bg-ink-900 transition-transform origin-center ${navOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`}
              />
              <span
                className={`block w-5 h-0.5 bg-ink-900 transition-opacity ${navOpen ? 'opacity-0' : ''}`}
              />
              <span
                className={`block w-5 h-0.5 bg-ink-900 transition-transform origin-center ${navOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {navOpen && (
          <div className="absolute top-16 left-0 right-0 bg-cream-50 border-b border-cream-400 flex flex-col gap-2 px-6 pb-4 md:hidden z-40">
            <a
              href="#how"
              className="text-sm text-ink-500 hover:text-ink-900 py-2 transition-colors"
              onClick={() => setNavOpen(false)}
            >
              How it works
            </a>
            <a
              href="#stores"
              className="text-sm text-ink-500 hover:text-ink-900 py-2 transition-colors"
              onClick={() => setNavOpen(false)}
            >
              For stores
            </a>
            <a
              href="#pilot"
              className="text-sm text-ink-500 hover:text-ink-900 py-2 transition-colors"
              onClick={() => setNavOpen(false)}
            >
              Pricing
            </a>
            <a
              href="#pilot"
              className="mt-2 bg-ink-900 text-cream-50 text-xs font-semibold px-4 py-2 rounded-sharp text-center"
              onClick={() => setNavOpen(false)}
            >
              Book Demo
            </a>
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">

          {/* Left col */}
          <div className="md:w-1/2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gold-600 mb-4">
              AR Try-On for Optical Stores
            </p>
            <h1 className="font-serif text-5xl md:text-6xl font-semibold text-ink-900 leading-[1.1] mb-6">
              Your customers try frames.{' '}
              <em className="not-italic italic text-gold-500">They buy more.</em>
            </h1>
            <p className="text-ink-500 text-base leading-relaxed mb-8 max-w-md">
              SpectaSnap puts live AR try-on in your store. Customers see themselves in any frame in
              seconds. No app. No friction.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#pilot"
                className="bg-ink-900 text-cream-50 px-8 py-3.5 font-semibold text-sm rounded-sharp hover:bg-ink-900/90 transition-colors"
              >
                Book free demo →
              </a>
              <Link
                href="/trydemo"
                className="border border-cream-400 text-ink-900 px-8 py-3.5 font-semibold text-sm rounded-sharp hover:border-ink-300 transition-colors"
              >
                Try it yourself
              </Link>
            </div>
          </div>

          {/* Right col — viewport mockup */}
          <div className="md:w-1/2 flex justify-center items-center">
            <div className="w-72 h-96 bg-dark rounded-sharp relative overflow-hidden flex items-center justify-center">

              {/* Corner brackets */}
              <span className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-gold-500/40 pointer-events-none" />
              <span className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-gold-500/40 pointer-events-none" />
              <span className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-gold-500/40 pointer-events-none" />
              <span className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-gold-500/40 pointer-events-none" />

              {/* Center glasses emoji */}
              <span className="text-5xl opacity-60 select-none">👓</span>

              {/* AR Live badge */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 block" />
                <span className="text-[10px] text-white/60 uppercase tracking-widest">AR Live</span>
              </div>

              {/* Try now link */}
              <Link
                href="/trydemo"
                className="absolute bottom-4 right-4 text-xs text-gold-500 hover:text-gold-600 transition-colors"
              >
                Try frames now →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ──────────────────────────────────────────────────────── */}
      <div className="bg-cream-200 border-y border-cream-400 py-4">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-wrap md:flex-nowrap items-center divide-y md:divide-y-0 md:divide-x divide-cream-400">
            {(['50+ frames', '478-pt tracking', 'Any tablet', 'No app', '5 min setup'] as const).map(
              (label) => (
                <div
                  key={label}
                  className="flex-1 min-w-[50%] md:min-w-0 text-center py-2 md:py-0"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                    {label}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── PROBLEM ────────────────────────────────────────────────────────── */}
      <section id="how" className="py-24 bg-cream-100">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gold-600 mb-2">
            The Problem
          </p>
          <blockquote className="border-l-2 border-gold-500 pl-7 my-6">
            <p className="font-serif italic text-2xl text-ink-900 leading-snug">
              &ldquo;Customers spend 40 minutes trying frames. Half still leave without buying.&rdquo;
            </p>
          </blockquote>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {(
              [
                { num: '65%', label: 'leave without buying' },
                { num: '8+', label: 'frames tried on average' },
                { num: '1 in 3', label: 'returns due to poor fit' },
              ] as const
            ).map(({ num, label }) => (
              <div
                key={num}
                className="bg-cream-50 border border-cream-400 p-6 rounded-sharp text-center"
              >
                <div className="font-serif text-5xl font-semibold text-gold-500 leading-none">
                  {num}
                </div>
                <div className="text-xs text-ink-500 mt-2 font-sans">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gold-600 mb-2">
            How it works
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] mb-12">
            Three steps.{' '}
            <em className="not-italic italic text-gold-500">That&apos;s all.</em>
          </h2>

          {/* Steps grid */}
          <div className="flex flex-col md:flex-row items-start gap-4">
            {HOW_STEPS.map((step, i) => (
              <div key={step.num} className="flex flex-row md:flex-col items-start md:items-stretch gap-4 flex-1">
                <div className="bg-cream-50 border border-cream-400 p-6 rounded-sharp text-left flex-1">
                  <div className="font-serif text-5xl text-gold-500/30 leading-none mb-4">
                    {step.num}
                  </div>
                  <div className="font-sans font-semibold text-ink-900 text-lg">{step.title}</div>
                  <p className="text-ink-500 text-sm mt-2">{step.desc}</p>
                </div>
                {/* Arrow between cards — visible md+ */}
                {i < HOW_STEPS.length - 1 && (
                  <div className="hidden md:flex items-center self-center text-cream-400 text-2xl select-none">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR STORES ─────────────────────────────────────────────────────── */}
      <section id="stores" className="py-24 bg-cream-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">

            {/* Left: feature list (col-span-3) */}
            <div className="md:col-span-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gold-600 mb-2">
                For store owners
              </p>
              <h2 className="font-serif text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] mb-8">
                Built for the{' '}
                <em className="not-italic italic text-gold-500">optical floor.</em>
              </h2>
              <div className="flex flex-col gap-6">
                {FEATURES.map((f) => (
                  <div key={f.num} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-cream-200 border border-cream-400 text-sm font-semibold text-ink-900 flex items-center justify-center rounded-sharp flex-shrink-0">
                      {f.num}
                    </div>
                    <div>
                      <div className="font-sans font-semibold text-ink-900 text-sm">{f.title}</div>
                      <div className="text-ink-500 text-sm mt-1">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: FAQ (col-span-2) */}
            <div className="md:col-span-2">
              <h3 className="font-sans font-semibold text-ink-900 text-base mb-4">
                Common questions
              </h3>
              <div className="divide-y divide-cream-400">
                {FAQS.map((faq, i) => (
                  <div key={i}>
                    <button
                      className="w-full flex justify-between items-center py-4 text-left cursor-pointer"
                      onClick={() => toggleFaq(i)}
                      aria-expanded={faqOpen[i]}
                    >
                      <span className="font-sans text-sm font-semibold text-ink-900 pr-4">
                        {faq.q}
                      </span>
                      <span className="text-gold-500 text-lg flex-shrink-0">
                        {faqOpen[i] ? '−' : '+'}
                      </span>
                    </button>
                    {faqOpen[i] && (
                      <p className="text-sm text-ink-500 pb-4 leading-relaxed">{faq.a}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PILOT FORM ─────────────────────────────────────────────────────── */}
      <section id="pilot" ref={pilotRef} className="py-24">
        <div className="max-w-[560px] mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gold-600 mb-2">
            Free 30-day pilot
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] mb-3">
            Start this week.
          </h2>
          <p className="font-sans text-base text-ink-500 mb-8">
            <em className="not-italic italic text-gold-500">No cost. No commitment.</em>
          </p>

          {formStatus === 'success' ? (
            <div className="bg-gold-100 border border-gold-500 rounded-sharp p-6 text-left">
              <p className="font-sans font-semibold text-gold-600 text-sm">
                We&apos;ll WhatsApp you within 24 hours.
              </p>
              <p className="text-ink-500 text-sm mt-1">
                Get ready to show your customers something they&apos;ve never seen before.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                    Your name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Rajesh Kumar"
                    value={form.name}
                    onChange={handleFormChange}
                    className="border border-cream-400 bg-cream-50 text-ink-900 text-sm px-3 py-2.5 rounded-sharp placeholder:text-ink-300 focus:outline-none focus:border-ink-500 transition-colors"
                  />
                </div>

                {/* Store name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                    Store name
                  </label>
                  <input
                    type="text"
                    name="store"
                    required
                    placeholder="Vision Care Opticals"
                    value={form.store}
                    onChange={handleFormChange}
                    className="border border-cream-400 bg-cream-50 text-ink-900 text-sm px-3 py-2.5 rounded-sharp placeholder:text-ink-300 focus:outline-none focus:border-ink-500 transition-colors"
                  />
                </div>

                {/* City */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="Mumbai"
                    value={form.city}
                    onChange={handleFormChange}
                    className="border border-cream-400 bg-cream-50 text-ink-900 text-sm px-3 py-2.5 rounded-sharp placeholder:text-ink-300 focus:outline-none focus:border-ink-500 transition-colors"
                  />
                </div>

                {/* WhatsApp */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                    WhatsApp number
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    placeholder="+91 98765 43210"
                    value={form.whatsapp}
                    onChange={handleFormChange}
                    className="border border-cream-400 bg-cream-50 text-ink-900 text-sm px-3 py-2.5 rounded-sharp placeholder:text-ink-300 focus:outline-none focus:border-ink-500 transition-colors"
                  />
                </div>
              </div>

              {formStatus === 'error' && (
                <p className="mt-3 text-sm text-red-600">
                  Something went wrong. Please try again.
                </p>
              )}

              <button
                type="submit"
                disabled={formStatus === 'loading'}
                className="mt-4 w-full bg-ink-900 text-cream-50 py-3.5 font-semibold text-sm rounded-sharp hover:bg-ink-900/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {formStatus === 'loading' ? 'Sending…' : 'Request free demo'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="bg-dark py-12">
        <div className="max-w-5xl mx-auto px-6">
          {/* Top row */}
          <div className="flex flex-col md:flex-row gap-10 md:gap-0 justify-between mb-10">
            {/* Logo */}
            <div>
              <span className="font-serif text-xl font-semibold text-cream-50">
                Specta<em className="not-italic italic text-gold-500">Snap</em>
              </span>
            </div>

            {/* Product links */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-cream-50/30 mb-1">
                Product
              </p>
              <Link href="/trydemo" className="text-sm text-cream-50/60 hover:text-cream-50 transition-colors">
                Try Demo
              </Link>
              <a href="#pilot" className="text-sm text-cream-50/60 hover:text-cream-50 transition-colors">
                Pricing
              </a>
              <a href="#stores" className="text-sm text-cream-50/60 hover:text-cream-50 transition-colors">
                For Stores
              </a>
              <a href="#how" className="text-sm text-cream-50/60 hover:text-cream-50 transition-colors">
                How It Works
              </a>
            </div>

            {/* Store tools links */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-cream-50/30 mb-1">
                Store tools
              </p>
              <Link href="/dashboard" className="text-sm text-cream-50/60 hover:text-cream-50 transition-colors">
                Dashboard
              </Link>
              <Link href="/qr" className="text-sm text-cream-50/60 hover:text-cream-50 transition-colors">
                QR Code
              </Link>
              <Link href="/upload" className="text-sm text-cream-50/60 hover:text-cream-50 transition-colors">
                Upload
              </Link>
              <Link href="/onepager" className="text-sm text-cream-50/60 hover:text-cream-50 transition-colors">
                One-Pager
              </Link>
            </div>
          </div>

          {/* Bottom row */}
          <div className="border-t border-cream-50/10 pt-6">
            <p className="text-xs text-cream-50/30">&copy; 2026 SpectaSnap</p>
          </div>
        </div>
      </footer>

      {/* ── MOBILE STICKY CTA ──────────────────────────────────────────────── */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream-50 border-t border-cream-400 px-4 py-3 transition-transform duration-300 ${
          showStickyBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <a
          href="#pilot"
          className="block w-full bg-gold-500 text-ink-900 rounded-sharp py-3 font-semibold text-sm text-center hover:bg-gold-600 transition-colors"
        >
          Book your free demo →
        </a>
      </div>
    </div>
  );
}
