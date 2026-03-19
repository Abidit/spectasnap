'use client';

import { X, Download, MessageCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-captured JPEG dataUrl from ARCamera composite. Null means still capturing. */
  dataUrl: string | null;
}

export default function ShareModal({ isOpen, onClose, dataUrl }: ShareModalProps) {
  if (!isOpen) return null;

  function handleDownload() {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'spectasnap-look.jpg';
    a.click();
  }

  function handleShare() {
    const text =
      'Check out my frames look! 🕶️ Try it yourself: https://spectasnap-orpin.vercel.app/trydemo';
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: 'My SpectaSnap Look',
          text: 'Try frames on your face live!',
          url: 'https://spectasnap-orpin.vercel.app/trydemo',
        })
        .catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(26,22,18,0.75)' }}
      onClick={onClose}
    >
      {/* Card */}
      <div
        className="relative w-full bg-brand-panel border border-brand-border flex flex-col gap-4 p-6"
        style={{ maxWidth: 360, borderRadius: 2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center
                     border border-brand-border text-brand-muted
                     hover:border-brand-text hover:text-brand-text transition-colors"
          style={{ borderRadius: 2 }}
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Title */}
        <div className="pr-8">
          <p className="text-[10px] font-sans font-semibold tracking-[0.14em] uppercase text-brand-muted">
            SpectaSnap AR
          </p>
          <h2
            className="text-2xl font-semibold text-brand-text leading-tight"
            style={{ fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)', fontStyle: 'italic' }}
          >
            Your Look
          </h2>
        </div>

        {/* Snapshot preview */}
        {dataUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={dataUrl}
            alt="Your glasses look"
            className="w-full border border-brand-border"
            style={{ borderRadius: 2 }}
          />
        ) : (
          <div
            className="w-full aspect-video bg-brand-secondary border border-brand-border
                       flex items-center justify-center"
            style={{ borderRadius: 2 }}
          >
            <p className="text-brand-muted text-xs font-sans">Capturing snapshot…</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleDownload}
            disabled={!dataUrl}
            className="w-full py-3 flex items-center justify-center gap-2
                       font-sans font-semibold text-sm tracking-wide
                       bg-brand-text text-brand-page hover:opacity-90 disabled:opacity-40
                       active:scale-[0.98] transition-all"
            style={{ borderRadius: 2 }}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={handleShare}
            className="w-full py-3 flex items-center justify-center gap-2
                       font-sans font-semibold text-sm tracking-wide
                       border border-brand-border text-brand-text
                       hover:border-brand-text active:scale-[0.98] transition-all"
            style={{ borderRadius: 2 }}
          >
            <MessageCircle className="w-4 h-4" />
            Share on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
