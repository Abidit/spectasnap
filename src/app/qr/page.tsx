'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, QrCode } from 'lucide-react';
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
          <div className="max-w-2xl mx-auto px-6 py-8">

            {/* Page header */}
            <div className="mb-8">
              <p
                className="text-[10px] font-sans font-semibold uppercase tracking-[0.14em] mb-1"
                style={{ color: '#C9A96E' }}
              >
                Store Tool
              </p>
              <h1 className="font-serif text-3xl font-semibold text-ink-900 leading-tight mb-2">
                Generate Store QR Code
              </h1>
              <p className="text-sm font-sans text-ink-500 leading-relaxed">
                Print and display this QR in your store. Customers scan it to open
                AR try-on pre-loaded with your store name.
              </p>
            </div>

            {/* Two-column layout on md+ */}
            <div className="flex flex-col md:flex-row gap-6">

              {/* Left — form */}
              <div className="flex-1">
                <div
                  className="bg-cream-50 border border-cream-400 p-6"
                  style={{ borderRadius: 2 }}
                >
                  <form onSubmit={(e) => void handleGenerate(e)} className="flex flex-col gap-5">
                    {/* Store name */}
                    <div>
                      <label
                        htmlFor="store-name"
                        className="block text-xs font-sans font-semibold uppercase tracking-[0.1em] text-ink-900 mb-1.5"
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
                      {storeUrl && (
                        <p className="text-[10px] font-sans text-ink-300 mt-1.5 break-all leading-relaxed">
                          {storeUrl}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        type="submit"
                        disabled={generating || !storeName.trim()}
                        className="w-full py-3 flex items-center justify-center gap-2
                                   font-sans font-semibold text-sm tracking-wide
                                   bg-ink-900 text-cream-50 hover:opacity-90 transition-opacity
                                   disabled:opacity-40"
                        style={{ borderRadius: 2 }}
                      >
                        <QrCode className="w-4 h-4" />
                        {generating ? 'Generating…' : 'Generate QR Code'}
                      </button>

                      {storeUrl && (
                        <button
                          type="button"
                          onClick={() => void handleCopyUrl()}
                          className="w-full py-3 font-sans font-semibold text-sm tracking-wide
                                     border border-cream-400 text-ink-900
                                     hover:border-ink-900 transition-colors"
                          style={{ borderRadius: 2 }}
                        >
                          {copied ? '✓ Copied!' : 'Copy Store URL'}
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Instructions */}
                  <div className="mt-6 border-t border-cream-400 pt-5">
                    <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-300 mb-3">
                      How to use
                    </p>
                    <ol className="flex flex-col gap-2">
                      {[
                        'Enter your store name above',
                        'Click "Generate QR Code"',
                        'Download and print at A5 or A4 size',
                        'Place near the frames display',
                        'Customers scan → AR try-on opens instantly',
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span
                            className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-[9px] font-semibold mt-0.5"
                            style={{
                              backgroundColor: '#C9A96E',
                              color: '#1A1612',
                              borderRadius: 2,
                            }}
                          >
                            {i + 1}
                          </span>
                          <span className="text-xs font-sans text-ink-500 leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Link to one-pager */}
                <div className="mt-3 px-1">
                  <p className="text-xs font-sans text-ink-300">
                    Want a full printable store sheet?{' '}
                    <Link
                      href="/onepager"
                      className="font-semibold no-underline transition-colors"
                      style={{ color: '#C9A96E' }}
                    >
                      View One-Pager →
                    </Link>
                  </p>
                </div>
              </div>

              {/* Right — QR preview */}
              <div className="flex-shrink-0 w-full md:w-64">
                <div
                  className="bg-cream-50 border border-cream-400 p-6 flex flex-col items-center gap-4"
                  style={{ borderRadius: 2 }}
                >
                  <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-300 self-start">
                    Preview
                  </p>

                  {qrDataUrl ? (
                    <>
                      {/* QR image */}
                      <div
                        className="border border-cream-400 p-3 bg-cream-50"
                        style={{ borderRadius: 2 }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrDataUrl}
                          alt={`QR code for ${storeName}`}
                          style={{ width: 180, height: 180, display: 'block', imageRendering: 'crisp-edges' }}
                        />
                      </div>

                      {/* Store label */}
                      <div className="text-center">
                        <p
                          className="font-serif text-lg font-semibold leading-tight"
                          style={{ color: '#C9A96E' }}
                        >
                          {storeName}
                        </p>
                        <p className="text-[10px] font-sans text-ink-300 mt-1 uppercase tracking-widest">
                          Scan to Try On
                        </p>
                      </div>

                      {/* Download */}
                      <button
                        onClick={handleDownload}
                        className="w-full py-2.5 flex items-center justify-center gap-2
                                   font-sans font-semibold text-sm
                                   border border-cream-400 text-ink-900
                                   hover:border-ink-900 transition-colors"
                        style={{ borderRadius: 2 }}
                      >
                        <Download className="w-4 h-4" />
                        Download PNG
                      </button>
                    </>
                  ) : (
                    /* Empty state */
                    <div
                      className="w-[180px] h-[180px] bg-cream-200 border border-cream-400
                                 flex flex-col items-center justify-center gap-2"
                      style={{ borderRadius: 2 }}
                    >
                      <QrCode className="w-10 h-10 text-cream-400" />
                      <p className="text-[10px] font-sans text-ink-300 text-center px-3">
                        Enter store name<br />to generate
                      </p>
                    </div>
                  )}
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
