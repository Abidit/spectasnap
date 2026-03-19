'use client';

import Link from 'next/link';

export default function OnepagerPage() {
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

      <div className="min-h-screen bg-white" style={{ fontFamily: 'DM Sans, system-ui, sans-serif', color: '#1A1612' }}>
        {/* Print button */}
        <div className="no-print fixed top-4 right-4 z-10">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 font-sans font-semibold text-sm"
            style={{ borderRadius: 2, backgroundColor: '#1A1612', color: '#FDFAF4' }}
          >
            Print this page
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-8 py-12" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

          {/* Header row */}
          <div className="flex items-baseline justify-between pb-6 mb-8" style={{ borderBottom: '1px solid #DDD8CE' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span
                className="text-2xl font-semibold"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic', color: '#C9A96E' }}
              >
                SpectaSnap
              </span>
            </Link>
            <span className="text-xs font-sans" style={{ color: '#6B6560' }}>
              spectasnap-orpin.vercel.app
            </span>
          </div>

          {/* Headline */}
          <div className="mb-10">
            <h1
              className="font-semibold leading-tight mb-1"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.4rem', color: '#1A1612' }}
            >
              More frames tried.
            </h1>
            <h1
              className="font-semibold leading-tight"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic', fontSize: '2.4rem', color: '#C9A96E' }}
            >
              More sales closed.
            </h1>
          </div>

          {/* Three columns */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {/* Col 1 */}
            <div className="p-4" style={{ border: '1px solid #DDD8CE', borderRadius: 2 }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: '#C9A96E' }}>
                What It Does
              </p>
              <ul className="text-sm leading-relaxed space-y-2" style={{ color: '#1A1612' }}>
                <li>· Customers try any frame live on a tablet — no app needed</li>
                <li>· AI detects face shape instantly</li>
                <li>· Staff gets the right recommendation every time</li>
              </ul>
            </div>

            {/* Col 2 */}
            <div className="p-4" style={{ border: '1px solid #DDD8CE', borderRadius: 2 }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: '#C9A96E' }}>
                What You Get
              </p>
              <ul className="text-sm leading-relaxed space-y-2" style={{ color: '#1A1612' }}>
                <li>· Tablet AR try-on experience</li>
                <li>· Auto face shape detection</li>
                <li>· Staff recommendation panel</li>
                <li>· Weekly analytics dashboard</li>
                <li>· Your own frame catalogue</li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="p-4" style={{ border: '1px solid #DDD8CE', borderRadius: 2 }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: '#C9A96E' }}>
                How To Start
              </p>
              <ol className="text-sm leading-relaxed space-y-2" style={{ color: '#1A1612' }}>
                <li>1. WhatsApp us your store name</li>
                <li>2. Setup call — under 5 minutes</li>
                <li>3. Customers try frames same day</li>
              </ol>
            </div>
          </div>

          {/* Pricing row */}
          <div className="mb-10 py-6" style={{ borderTop: '1px solid #DDD8CE', borderBottom: '1px solid #DDD8CE' }}>
            <p
              className="font-semibold text-2xl mb-1"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#1A1612' }}
            >
              Free for 30 days.
            </p>
            <p className="text-sm font-sans" style={{ color: '#6B6560' }}>
              Then{' '}
              <span className="font-semibold" style={{ color: '#C9A96E' }}>₹2,999/month.</span>
              {' '}Cancel anytime. No contracts.
            </p>
          </div>

          {/* Footer row — pushes to bottom */}
          <div className="mt-auto pt-6 flex items-start justify-between" style={{ borderTop: '1px solid #DDD8CE' }}>
            <div>
              <p className="text-[10px] font-sans uppercase tracking-[0.14em] mb-1" style={{ color: '#6B6560' }}>
                Scan to try it now
              </p>
              {/* QR placeholder — store owners generate via /qr page */}
              <div
                className="w-20 h-20 flex items-center justify-center text-center"
                style={{ border: '1px solid #DDD8CE', borderRadius: 2, backgroundColor: '#F5F0E8' }}
              >
                <span className="text-[9px] font-sans" style={{ color: '#6B6560' }}>
                  Generate at<br />/qr
                </span>
              </div>
              <p className="text-[9px] font-sans mt-1" style={{ color: '#B0ABA6' }}>
                spectasnap-orpin.vercel.app/trydemo
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-sans font-semibold mb-1" style={{ color: '#1A1612' }}>
                Get in touch
              </p>
              <p className="text-sm font-sans" style={{ color: '#6B6560' }}>
                hello@spectasnap.com
              </p>
              <p className="text-sm font-sans" style={{ color: '#6B6560' }}>
                spectasnap-orpin.vercel.app
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
