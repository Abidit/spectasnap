'use client';

// ── MediaPipeLoader ────────────────────────────────────────────────────────────
// Overlay shown while MediaPipe face landmarker is initialising.
// Displayed over the dark camera viewport before the AR loop starts.

interface MediaPipeLoaderProps {
  /** Show the overlay */
  visible: boolean;
  /** Current init stage — surfaced in sub-label for transparency */
  stage?: 'wasm' | 'model' | 'camera' | 'ready';
}

const STAGE_LABELS: Record<NonNullable<MediaPipeLoaderProps['stage']>, string> = {
  wasm:   'Loading AI engine…',
  model:  'Loading face model…',
  camera: 'Starting camera…',
  ready:  'Starting AR…',
};

export default function MediaPipeLoader({ visible, stage = 'wasm' }: MediaPipeLoaderProps) {
  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5"
      style={{ backgroundColor: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(2px)' }}
      aria-live="polite"
      aria-label={`Initialising AR: ${STAGE_LABELS[stage]}`}
    >
      {/* Pulsing ring */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ border: '2px solid rgba(201,169,110,0.35)' }}
          aria-hidden="true"
        />
        <span
          className="w-8 h-8 rounded-full"
          style={{ border: '2px solid #C9A96E' }}
          aria-hidden="true"
        />
      </div>

      {/* Text */}
      <div className="text-center flex flex-col gap-1">
        <p
          className="font-serif italic text-cream-50 text-lg"
          style={{ fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)' }}
        >
          Starting AR Try-On
        </p>
        <p className="font-sans text-xs text-cream-50/40 uppercase tracking-[0.12em]">
          {STAGE_LABELS[stage]}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2" aria-hidden="true">
        {(['wasm', 'model', 'camera', 'ready'] as const).map((s) => {
          const stages = ['wasm', 'model', 'camera', 'ready'] as const;
          const isDone = stages.indexOf(s) < stages.indexOf(stage);
          const isCurrent = s === stage;
          return (
            <span
              key={s}
              className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: isCurrent
                  ? '#C9A96E'
                  : isDone
                  ? 'rgba(201,169,110,0.45)'
                  : 'rgba(253,250,244,0.15)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
