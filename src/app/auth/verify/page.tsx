import Link from 'next/link';

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        <div className="mb-8">
          <p className="font-serif text-2xl font-semibold text-ink-900">
            Specta<em style={{ color: '#C9A96E' }}>Snap</em>
          </p>
        </div>

        <div className="bg-cream-50 border border-cream-400 p-8" style={{ borderRadius: 2 }}>
          {/* Mail icon */}
          <div
            className="w-14 h-14 mx-auto mb-5 flex items-center justify-center bg-gold-100 border border-gold-500/30"
            style={{ borderRadius: 2 }}
          >
            <span className="text-2xl">✉️</span>
          </div>

          <h1 className="font-serif text-2xl font-semibold text-ink-900 mb-2">
            Check your email
          </h1>
          <p className="text-sm font-sans text-ink-500 leading-relaxed">
            We&apos;ve sent a verification link to your email address. Click the link to activate your account.
          </p>

          <div className="border-t border-cream-400 my-6" />

          <p className="text-xs font-sans text-ink-500 mb-3">
            Didn&apos;t receive the email? Check your spam folder or{' '}
          </p>

          <Link
            href="/auth/signup"
            className="inline-block px-6 py-2.5 font-sans font-semibold text-xs uppercase tracking-wide
                       border border-cream-400 text-ink-900 hover:border-ink-900 transition-colors"
            style={{ borderRadius: 2, textDecoration: 'none' }}
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}
