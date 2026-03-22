'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PaywallModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  function handleTalkToUs() {
    if (typeof window !== 'undefined') {
      window.location.href = '/#pilot';
    }
    onClose?.();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(245,240,232,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="bg-cream-50 max-w-md w-full border border-gold-500 p-10 text-center"
        style={{ borderRadius: 2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logo */}
        <p className="font-serif text-xl font-semibold text-ink-900 mb-6">
          Specta<em style={{ color: '#C9A96E' }}>Snap</em>
        </p>

        {/* Heading */}
        <h2 className="font-serif text-2xl text-ink-900 mb-3">
          Your trial has ended
        </h2>

        {/* Body */}
        <p className="text-sm font-sans text-ink-500 leading-relaxed mb-6">
          You had 147 customer sessions during your trial. Upgrade to keep your
          analytics, staff tools, and unlimited try-on.
        </p>

        {/* Pricing mini-card */}
        <div
          className="bg-cream-200 p-4 mb-6"
          style={{ borderRadius: 2 }}
        >
          <div>
            <span className="font-serif text-xl text-gold-600 font-semibold">
              $39/month
            </span>
            <span className="text-xs font-sans text-ink-300 ml-1">
              · billed annually
            </span>
          </div>
          <span className="text-xs font-sans text-ink-300 mt-1 block">
            Cancel anytime. No contracts.
          </span>
        </div>

        {/* Primary CTA */}
        <Link href="/pricing" className="no-underline block">
          <button
            className="w-full py-3 font-sans font-semibold text-sm bg-gold-500 text-ink-900"
            style={{ borderRadius: 2 }}
            onClick={() => router.push('/pricing')}
          >
            Upgrade to Professional →
          </button>
        </Link>

        {/* Ghost link */}
        <button
          className="mt-3 text-sm font-sans text-ink-300 hover:text-ink-900 cursor-pointer block w-full bg-transparent border-0 p-0"
          onClick={handleTalkToUs}
        >
          Talk to us first
        </button>
      </div>
    </div>
  );
}
