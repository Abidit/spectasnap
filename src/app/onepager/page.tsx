'use client';

import { Printer, FileDown } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';

export default function OnepagerPage() {
  function handlePrint() {
    window.print();
  }

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 16mm; }
          .no-print { display: none !important; }
          body { background: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <div className="flex h-screen bg-cream-100 overflow-hidden">
        {/* Sidebar */}
        <div className="no-print">
          <Sidebar />
        </div>

        {/* Main column */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Custom top bar with print buttons */}
          <header
            className="no-print sticky top-0 z-30 flex items-center justify-between px-6
                       bg-cream-50/90 backdrop-blur border-b border-cream-400 flex-shrink-0"
            style={{ height: 56 }}
          >
            {/* Left — italic serif brand */}
            <span
              className="font-serif text-base font-semibold"
              style={{ fontStyle: 'italic', color: '#6B6560' }}
            >
              The Digital Curator
            </span>

            {/* Center — tiny caps label */}
            <span
              className="absolute left-1/2 -translate-x-1/2 font-sans font-semibold hidden sm:block"
              style={{ fontSize: 10, letterSpacing: '0.14em', color: '#9A9490', textTransform: 'uppercase' }}
            >
              Sales One-Pager Preview
            </span>

            {/* Right — action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 font-sans font-semibold"
                style={{
                  borderRadius: 2,
                  border: '1px solid #DDD8CE',
                  backgroundColor: 'transparent',
                  color: '#1A1612',
                  fontSize: 12,
                  padding: '7px 14px',
                }}
              >
                <Printer size={13} />
                Print
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 font-sans font-semibold"
                style={{
                  borderRadius: 2,
                  backgroundColor: '#1A1612',
                  color: '#FDFAF4',
                  fontSize: 12,
                  padding: '7px 14px',
                }}
              >
                <FileDown size={13} />
                Download PDF
              </button>
            </div>
          </header>

          {/* Scrollable content area */}
          <main className="flex-1 overflow-y-auto p-8">
            {/* A4-sized white card */}
            <div
              className="max-w-3xl mx-auto bg-white shadow-soft"
              style={{ padding: '48px 56px 56px', borderRadius: 2 }}
            >
              {/* Eyebrow */}
              <p
                className="font-sans font-semibold mb-5"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#9A9490',
                }}
              >
                B2B Solutions Portfolio
              </p>

              {/* Headline */}
              <h1
                className="font-semibold leading-tight mb-1"
                style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: '2.8rem',
                  color: '#1A1612',
                }}
              >
                More frames tried.
              </h1>
              <h1
                className="font-semibold leading-tight mb-10"
                style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: '2.8rem',
                  color: '#C9A96E',
                }}
              >
                More sales closed.
              </h1>

              {/* Hero image placeholder */}
              <div
                className="w-full mb-10 flex items-center justify-center relative overflow-hidden"
                style={{
                  height: 340,
                  backgroundColor: '#1A1612',
                  borderRadius: 2,
                }}
              >
                {/* Subtle decorative pedestal */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2"
                  style={{
                    width: 220,
                    height: 4,
                    backgroundColor: '#C9A96E',
                    opacity: 0.4,
                    borderRadius: 2,
                  }}
                />
                <div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2"
                  style={{
                    width: 140,
                    height: 1,
                    backgroundColor: '#C9A96E',
                    opacity: 0.2,
                  }}
                />
                {/* Glasses silhouette SVG */}
                <svg
                  width="180"
                  height="72"
                  viewBox="0 0 180 72"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ opacity: 0.55 }}
                >
                  {/* Left lens */}
                  <rect x="8" y="16" width="62" height="40" rx="20" stroke="#C9A96E" strokeWidth="3.5" />
                  {/* Right lens */}
                  <rect x="110" y="16" width="62" height="40" rx="20" stroke="#C9A96E" strokeWidth="3.5" />
                  {/* Bridge */}
                  <path d="M70 36 C80 28 100 28 110 36" stroke="#C9A96E" strokeWidth="3" fill="none" />
                  {/* Left temple */}
                  <line x1="8" y1="26" x2="0" y2="20" stroke="#C9A96E" strokeWidth="3" strokeLinecap="round" />
                  {/* Right temple */}
                  <line x1="172" y1="26" x2="180" y2="20" stroke="#C9A96E" strokeWidth="3" strokeLinecap="round" />
                </svg>
                {/* Golden pedestal stand */}
                <div
                  className="absolute"
                  style={{
                    bottom: 28,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 80,
                    height: 18,
                    border: '1px solid rgba(201,169,110,0.35)',
                    borderRadius: 2,
                    backgroundColor: 'rgba(201,169,110,0.08)',
                  }}
                />
              </div>

              {/* Three columns */}
              <div className="grid grid-cols-3 gap-6">
                {/* Col 1 — The Experience */}
                <div>
                  <p
                    className="font-sans font-semibold mb-2"
                    style={{
                      fontSize: 9,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#C9A96E',
                    }}
                  >
                    The Experience
                  </p>
                  <p
                    className="font-semibold leading-snug mb-3"
                    style={{
                      fontFamily: 'Cormorant Garamond, Georgia, serif',
                      fontStyle: 'italic',
                      fontSize: '1.1rem',
                      color: '#1A1612',
                    }}
                  >
                    Augmented Reality as a Service.
                  </p>
                  <p
                    className="font-sans leading-relaxed"
                    style={{ fontSize: 12, color: '#6B6560' }}
                  >
                    Transform your boutique with a seamless virtual try-on experience. High-precision face tracking meets hyper-realistic frame rendering.
                  </p>
                </div>

                {/* Col 2 — The Package */}
                <div>
                  <p
                    className="font-sans font-semibold mb-2"
                    style={{
                      fontSize: 9,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#C9A96E',
                    }}
                  >
                    The Package
                  </p>
                  <ul
                    className="font-sans leading-relaxed space-y-1.5"
                    style={{ fontSize: 12, color: '#1A1612' }}
                  >
                    <li>· Full digital inventory access</li>
                    <li>· Real-time face measurements</li>
                    <li>· Custom brand integration</li>
                    <li>· Sales analytics dashboard</li>
                  </ul>
                </div>

                {/* Col 3 — Onboarding */}
                <div>
                  <p
                    className="font-sans font-semibold mb-2"
                    style={{
                      fontSize: 9,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#C9A96E',
                    }}
                  >
                    Onboarding
                  </p>
                  <ol className="space-y-2.5">
                    {[
                      { num: '01', label: 'CONNECT CATALOG' },
                      { num: '02', label: 'SETUP QR NODES' },
                      { num: '03', label: 'ENGAGE CLIENTS' },
                    ].map(({ num, label }) => (
                      <li key={num} className="flex items-baseline gap-2">
                        <span
                          className="font-serif font-semibold flex-shrink-0"
                          style={{ fontSize: 13, color: '#C9A96E' }}
                        >
                          {num}
                        </span>
                        <span
                          className="font-sans font-semibold"
                          style={{ fontSize: 10, letterSpacing: '0.1em', color: '#1A1612' }}
                        >
                          {label}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Bottom spacer — footer cut off per design */}
              <div style={{ height: 48 }} />
            </div>

            {/* Bottom padding for mobile nav clearance */}
            <div className="h-8 no-print" />
          </main>
        </div>

        {/* Mobile bottom nav */}
        <div className="no-print">
          <BottomNav />
        </div>
      </div>
    </>
  );
}
