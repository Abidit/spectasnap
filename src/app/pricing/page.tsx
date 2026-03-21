import { Check } from 'lucide-react';

export default function PricingPage() {
  const features = [
    'Real-time 3D AR try-on (60fps)',
    'All 50+ frame styles',
    'Custom frame upload',
    'Staff note & branding',
    'QR code share page',
    'Session analytics',
    'PD measurement tool',
    'Unlimited customers',
    'WhatsApp & share integration',
    'Dedicated onboarding call',
  ];

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-8">
      {/* Logo */}
      <div className="mb-12 text-center">
        <p className="font-serif text-2xl font-semibold text-ink-900">
          Specta<em style={{ color: '#C9A96E' }}>Snap</em>
        </p>
        <p className="text-xs font-sans tracking-widest uppercase text-ink-300 mt-1">
          AR Try-On Platform
        </p>
      </div>

      {/* Pricing card */}
      <div
        className="w-full max-w-md bg-cream-50 border border-cream-400 p-8"
        style={{ borderRadius: 2 }}
      >
        {/* Plan label */}
        <p
          className="text-[10px] font-sans font-semibold uppercase tracking-[0.14em] mb-1"
          style={{ color: '#C9A96E' }}
        >
          Optical Store Plan
        </p>
        <h1 className="font-serif text-3xl font-semibold text-ink-900 leading-tight">
          ₹2,999
          <span className="text-base font-sans font-normal text-ink-500 ml-1">/month</span>
        </h1>
        <p className="text-ink-500 text-sm font-sans mt-2">
          Everything you need to offer real-time AR try-on to your customers — no app install required.
        </p>

        {/* Divider */}
        <div className="border-t border-cream-400 my-6" />

        {/* Features */}
        <ul className="flex flex-col gap-3 mb-8">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-4 h-4 mt-0.5 flex items-center justify-center"
                style={{ color: '#C9A96E' }}
              >
                <Check className="w-3.5 h-3.5" />
              </span>
              <span className="text-sm font-sans text-ink-900">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href="https://formspree.io/f/xojnpnzy"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-4 text-center font-sans font-semibold text-sm uppercase tracking-wide
                     bg-ink-900 text-cream-50 hover:opacity-90 transition-opacity"
          style={{ borderRadius: 2, textDecoration: 'none' }}
        >
          Start Free Pilot
        </a>

        <p className="text-center text-[11px] font-sans text-ink-300 mt-3">
          14-day free trial · No credit card required
        </p>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-[11px] font-sans text-ink-300 text-center">
        Questions? Email{' '}
        <a href="mailto:hello@spectasnap.com" className="underline" style={{ color: '#C9A96E' }}>
          hello@spectasnap.com
        </a>
      </p>
    </div>
  );
}
