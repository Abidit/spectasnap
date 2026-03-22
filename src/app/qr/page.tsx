'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, QrCode, Printer } from 'lucide-react';
import QRCode from 'qrcode';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';

export default function QRPage() {
  const [storeName, setStoreName] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const storeUrl = storeName.trim()
    ? `https://spectasnap-orpin.vercel.app/trydemo?store=${encodeURIComponent(storeName.trim())}`
    : '';

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!storeName.trim()) return;
    setGenerating(true);
    try {
      const dataUrl = await QRCode.toDataURL(storeUrl, {
        width: 320,
        margin: 2,
        color: { dark: '#1A1612', light: '#FDFAF4' },
        errorCorrectionLevel: 'H',
      });
      setQrDataUrl(dataUrl);
    } finally {
      setGenerating(false);
    }
  }

  function handleDownload() {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${storeName.trim().replace(/\s+/g, '-').toLowerCase()}-spectasnap-qr.png`;
    a.click();
  }

  async function handleCopyUrl() {
    if (!storeUrl) return;
    await navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex h-screen bg-cream-100">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar pageTitle="QR Code" />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8 max-w-[1100px] mx-auto">

            {/* Page header */}
            <div className="mb-8">
              <h1 className="font-serif text-4xl font-semibold text-ink-900 leading-tight mb-2">
                <em>QR</em> Code
              </h1>
              <p className="text-sm font-sans text-ink-500 leading-relaxed">
                Customers scan to open AR try-on for your store.
              </p>
            </div>

            {/* Two-column layout */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">

              {/* LEFT — QR Generator card */}
              <div className="flex-1 min-w-0 max-w-[600px]">
                <div
                  className="bg-cream-50 border border-cream-400 p-6"
                  style={{ borderRadius: 2 }}
                >
                  <form onSubmit={(e) => void handleGenerate(e)} className="flex flex-col gap-5">
                    {/* Store name input */}
                    <div>
                      <label
                        htmlFor="store-name"
                        className="block text-[10px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-900 mb-1.5"
                      >
                        Store Name
                      </label>
                      <input
                        id="store-name"
                        type="text"
                        required
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="e.g. Vision Care Opticals"
                        className="w-full px-3 py-2.5 bg-cream-100 border border-cream-400
                                   text-sm font-sans text-ink-900 placeholder:text-ink-300
                                   focus:outline-none focus:border-gold-500 transition-colors"
                        style={{ borderRadius: 2 }}
                      />
                    </div>

                    {/* Generate button */}
                    <button
                      type="submit"
                      disabled={generating || !storeName.trim()}
                      className="w-full py-3 flex items-center justify-center gap-2
                                 font-sans font-semibold text-sm tracking-[0.1em] uppercase
                                 bg-ink-900 text-cream-50 hover:opacity-90 transition-opacity
                                 disabled:opacity-40"
                      style={{ borderRadius: 2 }}
                    >
                      <QrCode className="w-4 h-4" />
                      {generating ? 'Generating…' : 'Generate QR ⚡'}
                    </button>
                  </form>

                  {/* QR Preview area */}
                  <div className="mt-6">
                    <div
                      className="relative bg-cream-100 border border-cream-400 p-8 flex flex-col items-center justify-center"
                      style={{ borderRadius: 2, minHeight: 260 }}
                    >
                      {/* Corner brackets */}
                      <div className="absolute top-0 left-0 w-5 h-5" style={{ borderTop: '2px solid #C9A96E', borderLeft: '2px solid #C9A96E' }} />
                      <div className="absolute top-0 right-0 w-5 h-5" style={{ borderTop: '2px solid #C9A96E', borderRight: '2px solid #C9A96E' }} />
                      <div className="absolute bottom-0 left-0 w-5 h-5" style={{ borderBottom: '2px solid #C9A96E', borderLeft: '2px solid #C9A96E' }} />
                      <div className="absolute bottom-0 right-0 w-5 h-5" style={{ borderBottom: '2px solid #C9A96E', borderRight: '2px solid #C9A96E' }} />

                      {qrDataUrl ? (
                        <div className="flex flex-col items-center gap-4">
                          {/* QR code image */}
                          <div className="bg-cream-50 p-3" style={{ borderRadius: 2 }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={qrDataUrl}
                              alt={`QR code for ${storeName}`}
                              style={{ width: 180, height: 180, display: 'block', imageRendering: 'crisp-edges' }}
                            />
                          </div>

                          {/* Store label below QR */}
                          <div className="text-center">
                            <p
                              className="font-serif text-base font-semibold italic leading-tight"
                              style={{ color: '#C9A96E' }}
                            >
                              {storeName}
                            </p>
                            <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.18em] text-ink-300 mt-1">
                              spectasnap.com/trydemo
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Empty state — corner brackets only, placeholder */
                        <div className="flex flex-col items-center gap-2 opacity-30">
                          <QrCode className="w-12 h-12 text-ink-400" />
                          <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-400 text-center">
                            QR preview
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons — only when QR is generated */}
                  {qrDataUrl && (
                    <div className="mt-4 flex flex-col gap-2">
                      {/* Download PNG — full width, gold */}
                      <button
                        onClick={handleDownload}
                        className="w-full py-3 flex items-center justify-center gap-2
                                   font-sans font-semibold text-sm tracking-[0.1em] uppercase
                                   text-cream-50 hover:opacity-90 transition-opacity"
                        style={{ borderRadius: 2, backgroundColor: '#A8844A' }}
                      >
                        <Download className="w-4 h-4" />
                        ↓ Download PNG
                      </button>

                      {/* SVG + Print — half width each */}
                      <div className="flex gap-2">
                        <button
                          onClick={handleDownload}
                          className="flex-1 py-2.5 flex items-center justify-center gap-1.5
                                     font-sans font-semibold text-sm tracking-[0.08em] uppercase
                                     border border-cream-400 text-ink-900
                                     hover:border-ink-900 transition-colors"
                          style={{ borderRadius: 2 }}
                        >
                          <Download className="w-3.5 h-3.5" />
                          ↓ SVG
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="flex-1 py-2.5 flex items-center justify-center gap-1.5
                                     font-sans font-semibold text-sm tracking-[0.08em] uppercase
                                     border border-cream-400 text-ink-900
                                     hover:border-ink-900 transition-colors"
                          style={{ borderRadius: 2 }}
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom link */}
                <div className="mt-3 px-1">
                  <p className="text-[11px] font-sans text-ink-300">
                    Want the full sales flyer? —{' '}
                    <Link
                      href="/onepager"
                      className="font-semibold no-underline transition-colors"
                      style={{ color: '#C9A96E' }}
                    >
                      Generate a printable one-pager →
                    </Link>
                  </p>
                </div>
              </div>

              {/* RIGHT — Usage Guidelines panel (hidden on mobile) */}
              <div className="hidden lg:flex flex-col gap-4 flex-shrink-0" style={{ width: 280 }}>

                {/* Guidelines card */}
                <div
                  className="bg-cream-50 border border-cream-400 p-5"
                  style={{ borderRadius: 2 }}
                >
                  <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.14em] mb-4" style={{ color: '#C9A96E' }}>
                    Usage Guidelines
                  </p>

                  <div className="flex flex-col gap-5">
                    {/* Guideline 1 */}
                    <div className="flex gap-3 items-start">
                      <div
                        className="flex-shrink-0 w-9 h-9 bg-cream-100 flex items-center justify-center"
                        style={{ borderRadius: 2 }}
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <rect x="2" y="3" width="14" height="12" rx="0" stroke="#6B6560" strokeWidth="1.4" />
                          <path d="M6 3V2M9 3V2M12 3V2" stroke="#6B6560" strokeWidth="1.4" strokeLinecap="round" />
                          <path d="M5 8h8M5 11h5" stroke="#6B6560" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[11px] font-sans font-semibold text-ink-900 mb-0.5">
                          Place at store entrance
                        </p>
                        <p className="text-[11px] font-sans text-ink-400 leading-relaxed">
                          Position the QR code at eye-level to capture attention as customers enter.
                        </p>
                      </div>
                    </div>

                    {/* Guideline 2 */}
                    <div className="flex gap-3 items-start">
                      <div
                        className="flex-shrink-0 w-9 h-9 bg-cream-100 flex items-center justify-center"
                        style={{ borderRadius: 2 }}
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <rect x="3" y="2" width="12" height="14" rx="0" stroke="#6B6560" strokeWidth="1.4" />
                          <path d="M6 6h6M6 9h6M6 12h3" stroke="#6B6560" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[11px] font-sans font-semibold text-ink-900 mb-0.5">
                          Print min 5cm × 5cm
                        </p>
                        <p className="text-[11px] font-sans text-ink-400 leading-relaxed">
                          Maintain scan integrity by ensuring the code is large enough for any lens.
                        </p>
                      </div>
                    </div>

                    {/* Guideline 3 */}
                    <div className="flex gap-3 items-start">
                      <div
                        className="flex-shrink-0 w-9 h-9 bg-cream-100 flex items-center justify-center"
                        style={{ borderRadius: 2 }}
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <rect x="2" y="4" width="14" height="10" rx="0" stroke="#6B6560" strokeWidth="1.4" />
                          <circle cx="9" cy="9" r="2.5" stroke="#6B6560" strokeWidth="1.4" />
                          <circle cx="9" cy="9" r="0.8" fill="#6B6560" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[11px] font-sans font-semibold text-ink-900 mb-0.5">
                          Works with any phone camera
                        </p>
                        <p className="text-[11px] font-sans text-ink-400 leading-relaxed">
                          No app required. The native camera will instantly launch the AR portal.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dark curator insight card */}
                <div
                  className="p-6 flex flex-col gap-4"
                  style={{ backgroundColor: '#1A1612', borderRadius: 2 }}
                >
                  <span className="text-lg" style={{ color: '#C9A96E' }}>✦</span>
                  <p
                    className="font-serif text-sm italic leading-relaxed"
                    style={{ color: '#FDFAF4' }}
                  >
                    &ldquo;The digital bridge between your physical shelf and their personal style.&rdquo;
                  </p>
                  <p
                    className="text-[9px] font-sans font-semibold uppercase tracking-[0.18em]"
                    style={{ color: '#C9A96E' }}
                  >
                    Aurelian Curator Insight
                  </p>
                </div>

              </div>

            </div>

          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
