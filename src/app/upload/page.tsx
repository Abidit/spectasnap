'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Glasses, CheckCircle2, MessageCircle } from 'lucide-react';

const STYLES = ['Round', 'Rectangle', 'Aviator', 'Cat-Eye', 'Wrap', 'Other'];

export default function UploadPage() {
  const [storeName, setStoreName] = useState('');
  const [frameName, setFrameName] = useState('');
  const [style, setStyle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('https://formspree.io/f/xojnpnzy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ store_name: storeName, frame_name: frameName, style }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setDone(true);
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function openWhatsApp() {
    const msg = encodeURIComponent(
      `Hi SpectaSnap! I just submitted a frame request.\n\nStore: ${storeName}\nFrame: ${frameName}\nStyle: ${style}\n\nI'm sending the frame photo here.`,
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
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
        {done ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: '#C9A96E' }} />
            <h2 className="font-serif text-2xl font-semibold text-brand-text mb-2">Details Submitted</h2>
            <p className="text-brand-muted text-sm font-sans mb-6 max-w-xs mx-auto">
              Now send us the frame photo on WhatsApp and we&apos;ll add it within 24 hours.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={openWhatsApp}
                className="w-full py-3 flex items-center justify-center gap-2 font-sans font-semibold text-sm tracking-wide
                           text-white hover:opacity-90 transition-opacity"
                style={{ borderRadius: 2, backgroundColor: '#25D366' }}
              >
                <MessageCircle className="w-4 h-4" />
                Send Photo on WhatsApp
              </button>
              <Link
                href="/trydemo"
                className="w-full py-3 block text-center font-sans font-semibold text-sm tracking-wide
                           border border-brand-border text-brand-text hover:border-brand-text transition-colors"
                style={{ borderRadius: 2, textDecoration: 'none' }}
              >
                Back to Try-On
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-[10px] font-sans font-semibold tracking-[0.14em] uppercase mb-1" style={{ color: '#C9A96E' }}>
                Frame Upload
              </p>
              <h1 className="font-serif text-3xl font-semibold text-brand-text mb-2">Add Your Frames</h1>
              <p className="text-brand-muted text-sm font-sans">
                Tell us about your frame below, then send the photo via WhatsApp.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-sans font-medium text-brand-text mb-1.5">Store Name</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Sharma Opticals"
                  className="w-full px-3 py-2.5 bg-brand-page border border-brand-border text-sm font-sans text-brand-text
                             focus:outline-none focus:border-brand-gold transition-colors"
                  style={{ borderRadius: 2 }}
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-medium text-brand-text mb-1.5">Frame Name</label>
                <input
                  type="text"
                  required
                  value={frameName}
                  onChange={(e) => setFrameName(e.target.value)}
                  placeholder="e.g. Milano Classic Round"
                  className="w-full px-3 py-2.5 bg-brand-page border border-brand-border text-sm font-sans text-brand-text
                             focus:outline-none focus:border-brand-gold transition-colors"
                  style={{ borderRadius: 2 }}
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-medium text-brand-text mb-1.5">Frame Style</label>
                <select
                  required
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-brand-page border border-brand-border text-sm font-sans text-brand-text
                             focus:outline-none focus:border-brand-gold transition-colors"
                  style={{ borderRadius: 2 }}
                >
                  <option value="">Select style...</option>
                  {STYLES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {error && <p className="text-red-500 text-xs font-sans">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 font-sans font-semibold text-sm tracking-wide
                           bg-brand-text text-brand-page hover:opacity-90 transition-opacity
                           disabled:opacity-50"
                style={{ borderRadius: 2 }}
              >
                {submitting ? 'Submitting...' : 'Continue'}
              </button>

              <p className="text-brand-muted text-[10px] font-sans text-center">
                Step 1 of 2 — you&apos;ll send the frame photo via WhatsApp next
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
