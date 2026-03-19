'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Glasses } from 'lucide-react';
import QRCode from 'qrcode';

export default function QRPage() {
  const [storeName, setStoreName] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [generating, setGenerating] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!storeName.trim()) return;
    setGenerating(true);
    try {
      const url = `https://spectasnap-orpin.vercel.app/trydemo?store=${encodeURIComponent(storeName.trim())}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: { dark: '#1A1612', light: '#FDFAF4' },
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
    a.download = `${storeName.trim().replace(/\s+/g, '-').toLowerCase()}-qr.png`;
    a.click();
  }

  return (
    <div className="min-h-screen bg-brand-page">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-brand-panel border-b border-brand-border">
        <Link href="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
          <Glasses className="w-5 h-5" style={{ color: '#C9A96E' }} />
          <div className="flex items-baseline gap-0.5">
            <span className="font-serif text-xl font-semibold tracking-tight text-brand-text">Specta</span>
            <span className="font-serif text-xl font-semibold tracking-tight" style={{ color: '#C9A96E' }}>Snap</span>
          </div>
        </Link>
        <Link
          href="/trydemo"
          className="text-brand-muted text-xs font-sans font-medium hover:text-brand-gold transition-colors"
          style={{ textDecoration: 'none' }}
        >
          Try Demo
        </Link>
      </header>

      <div className="max-w-md mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-[10px] font-sans font-semibold tracking-[0.14em] uppercase mb-1" style={{ color: '#C9A96E' }}>
            Store QR Code
          </p>
          <h1 className="font-serif text-3xl font-semibold text-brand-text mb-2">Generate Store QR Code</h1>
          <p className="text-brand-muted text-sm font-sans">
            Customers scan this to open AR try-on for your store.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col gap-4 mb-8">
          <div>
            <label className="block text-xs font-sans font-medium text-brand-text mb-1.5 uppercase tracking-[0.1em]">
              Store Name
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Vision Care"
              className="w-full px-3 py-2.5 bg-brand-page border border-brand-border text-sm font-sans text-brand-text
                         focus:outline-none focus:border-brand-gold transition-colors"
              style={{ borderRadius: 2 }}
            />
          </div>
          <button
            type="submit"
            disabled={generating || !storeName.trim()}
            className="w-full py-3 font-sans font-semibold text-sm tracking-wide
                       bg-brand-text text-brand-page hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ borderRadius: 2 }}
          >
            {generating ? 'Generating…' : 'Generate QR Code'}
          </button>
        </form>

        {qrDataUrl && (
          <div className="flex flex-col items-center gap-4">
            {/* QR preview */}
            <div
              className="border border-brand-border p-4 bg-brand-panel"
              style={{ borderRadius: 2 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="Store QR code" style={{ width: 240, height: 240, display: 'block' }} />
            </div>

            {/* Store name label */}
            <p
              className="font-serif text-lg font-semibold text-center"
              style={{ color: '#C9A96E' }}
            >
              {storeName}
            </p>

            {/* URL hint */}
            <p className="text-brand-muted text-[10px] font-sans text-center break-all">
              spectasnap-orpin.vercel.app/trydemo?store={encodeURIComponent(storeName.trim())}
            </p>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="w-full py-3 font-sans font-semibold text-sm tracking-wide
                         bg-brand-text text-brand-page hover:opacity-90 transition-opacity"
              style={{ borderRadius: 2 }}
            >
              Download QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
