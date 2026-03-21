import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';

export default function FramesPage() {
  return (
    <div className="flex h-screen bg-cream-100">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar pageTitle="Frames" />

        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-sm">
            {/* Icon placeholder */}
            <div
              className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-cream-200 border border-cream-400"
              style={{ borderRadius: 2 }}
            >
              <span className="text-2xl">👓</span>
            </div>

            <p
              className="text-[10px] font-sans font-semibold uppercase tracking-[0.14em] mb-2"
              style={{ color: '#C9A96E' }}
            >
              Coming Soon
            </p>
            <h1 className="font-serif text-3xl font-semibold text-ink-900 leading-tight mb-3">
              Frame Catalog
            </h1>
            <p className="text-ink-500 text-sm font-sans leading-relaxed">
              Browse and manage your full collection of glasses frames. Upload new models, set pricing, and curate what customers see in the AR try-on.
            </p>

            <div
              className="mt-6 px-4 py-3 bg-gold-100 border border-gold-500/30"
              style={{ borderRadius: 2 }}
            >
              <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.1em] text-gold-600 mb-1">
                Sprint 2
              </p>
              <p className="text-xs font-sans text-ink-500">
                Full catalog management ships in Sprint 2 — Store Owner Tools.
              </p>
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
