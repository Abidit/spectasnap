'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Glasses,
  Upload,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Camera,
  Settings,
  Crosshair,
  Lock,
} from 'lucide-react';
import { removeBackground } from '@/lib/removeBackground';
import { saveCustomFrame } from '@/ar/customFrameLoader';

type Step = 'upload' | 'processing' | 'calibrate' | 'done';

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'upload',     label: 'PHOTO',     icon: <Camera className="w-3.5 h-3.5" /> },
  { id: 'processing', label: 'PROCESS',   icon: <Settings className="w-3.5 h-3.5" /> },
  { id: 'calibrate',  label: 'CALIBRATE', icon: <Crosshair className="w-3.5 h-3.5" /> },
  { id: 'done',       label: 'DONE',      icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
];

const STEP_ORDER: Step[] = ['upload', 'processing', 'calibrate', 'done'];

function stepIndex(s: Step) {
  return STEP_ORDER.indexOf(s);
}

/* ─── Progress breadcrumb dots ─────────────────────────────────────────────── */
function ProgressBreadcrumb({ current }: { current: Step }) {
  const ci = stepIndex(current);
  return (
    <div className="flex items-center gap-3 mb-7">
      {STEPS.map((s, i) => {
        const done    = i < ci;
        const active  = i === ci;
        const future  = i > ci;
        return (
          <div key={s.id} className="flex items-center gap-1.5">
            {i > 0 && (
              <div
                className="h-px w-5"
                style={{ backgroundColor: done ? '#A8844A' : '#DDD8CE' }}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: active ? '#A8844A' : done ? '#C9A96E' : '#DDD8CE',
                }}
              />
              <span
                className="font-sans font-semibold tracking-[0.12em] uppercase"
                style={{
                  fontSize: 9,
                  color: active ? '#A8844A' : done ? '#C9A96E' : '#9A9490',
                }}
              >
                {s.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Left step sidebar ─────────────────────────────────────────────────────── */
function StepSidebar({ current }: { current: Step }) {
  const ci = stepIndex(current);
  return (
    <aside
      className="hidden md:flex flex-col pt-10 px-5 border-r border-cream-400"
      style={{ width: 168, flexShrink: 0 }}
    >
      <p className="font-serif italic text-ink-900 font-semibold mb-0.5" style={{ fontSize: 17 }}>
        Upload Wizard
      </p>
      <p
        className="font-sans font-semibold tracking-[0.14em] uppercase mb-6"
        style={{ fontSize: 9, color: '#A8844A' }}
      >
        STEP {ci + 1} OF 4
      </p>

      <div className="flex flex-col gap-1">
        {STEPS.map((s, i) => {
          const done   = i < ci;
          const active = i === ci;
          return (
            <div
              key={s.id}
              className="flex items-center gap-2.5 py-2 px-2"
              style={{ borderRadius: 2 }}
            >
              {/* icon slot */}
              <span style={{ color: active ? '#A8844A' : done ? '#C9A96E' : '#9A9490' }}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.icon}
              </span>
              <span
                className="font-sans tracking-[0.12em] uppercase"
                style={{
                  fontSize: 10,
                  fontWeight: active ? 700 : 500,
                  color: active ? '#A8844A' : done ? '#6B6560' : '#9A9490',
                }}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

/* ─── Right photo guide panel ──────────────────────────────────────────────── */
function PhotoGuidePanel() {
  const tips = [
    {
      title: 'PERFECT SYMMETRY',
      body: 'Place the frames flat on a level surface. Ensure both temples are equidistant from the lens center.',
    },
    {
      title: 'SOFT, DIFFUSED LIGHT',
      body: 'Avoid direct flash. Use natural window light or a lightbox to eliminate harsh glare on the lenses.',
    },
    {
      title: 'CONTRAST MATTERS',
      body: 'A clean white or light grey background works best for our automated AI background removal.',
    },
    {
      title: 'HIGH RESOLUTION',
      body: 'Ensure the focus is sharp across the entire frame. Blurry edges will cause calibration errors.',
    },
  ];
  return (
    <aside
      className="hidden md:flex flex-col pt-10 px-5 border-l border-cream-400"
      style={{ width: 264, flexShrink: 0 }}
    >
      <h3 className="font-serif italic text-ink-900 font-semibold mb-6 leading-snug" style={{ fontSize: 16 }}>
        How to take the <em>perfect</em> photo
      </h3>
      <div className="flex flex-col gap-5">
        {tips.map((tip, i) => (
          <div key={i} className="flex gap-3">
            {/* gold circle number */}
            <div
              className="flex items-center justify-center font-sans font-bold flex-shrink-0"
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#F7EDD8',
                color: '#A8844A',
                fontSize: 10,
                marginTop: 1,
              }}
            >
              {i + 1}
            </div>
            <div>
              <p
                className="font-sans font-semibold tracking-[0.12em] uppercase mb-0.5"
                style={{ fontSize: 9, color: '#A8844A' }}
              >
                {tip.title}
              </p>
              <p className="font-sans text-ink-500 leading-relaxed" style={{ fontSize: 12 }}>
                {tip.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ─── Right calibrate guide panel ──────────────────────────────────────────── */
function CalibrateGuidePanel({
  bridgeX,
  bridgeY,
  widthScale,
  onReset,
}: {
  bridgeX: number;
  bridgeY: number;
  widthScale: number;
  onReset: () => void;
}) {
  return (
    <aside
      className="hidden md:flex flex-col pt-10 px-5 border-l border-cream-400"
      style={{ width: 264, flexShrink: 0 }}
    >
      {/* Bridge calibration card */}
      <div
        className="bg-white border border-cream-400 p-4 mb-6"
        style={{ borderRadius: 2 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Glasses className="w-4 h-4" style={{ color: '#C9A96E' }} />
          <span
            className="font-sans font-semibold tracking-[0.12em] uppercase"
            style={{ fontSize: 9, color: '#A8844A' }}
          >
            Bridge Calibration
          </span>
        </div>
        <p className="font-sans text-ink-500 leading-relaxed" style={{ fontSize: 12 }}>
          Position the gold dot precisely on the metal or plastic bridge between the two lenses.
        </p>
      </div>

      {/* Fine tuning */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="font-sans font-semibold tracking-[0.14em] uppercase"
          style={{ fontSize: 9, color: '#1A1612' }}
        >
          FINE TUNING
        </span>
        <button
          onClick={onReset}
          className="font-sans font-semibold tracking-[0.12em] uppercase hover:opacity-70 transition-opacity"
          style={{ fontSize: 9, color: '#A8844A', textDecoration: 'underline' }}
        >
          RESET VALUES
        </button>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        {[
          { label: 'Bridge X-Axis', value: bridgeX },
          { label: 'Bridge Y-Axis', value: bridgeY },
          { label: 'Digital Scale', value: widthScale },
        ].map((row) => (
          <div key={row.label} className="flex justify-between">
            <span className="font-sans text-ink-500" style={{ fontSize: 11 }}>
              {row.label}
            </span>
            <span className="font-sans font-semibold text-ink-900" style={{ fontSize: 11 }}>
              {row.value}%
            </span>
          </div>
        ))}
      </div>

      {/* Calibration tips */}
      <p
        className="font-sans font-semibold tracking-[0.14em] uppercase mb-3"
        style={{ fontSize: 9, color: '#1A1612' }}
      >
        CALIBRATION TIPS
      </p>
      <ul className="flex flex-col gap-2">
        {[
          'Zoom into the image to place the bridge dot with higher precision.',
          'The dot should sit at the exact midpoint of the nose bridge connector.',
          'Scale adjusts how wide the frame renders relative to the face width in AR.',
        ].map((tip, i) => (
          <li key={i} className="flex gap-2">
            <span style={{ color: '#C9A96E', fontSize: 10, flexShrink: 0, marginTop: 1 }}>•</span>
            <span className="font-sans text-ink-500 leading-relaxed" style={{ fontSize: 11 }}>
              {tip}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* Main page                                                                   */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function UploadPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  // Step state
  const [step, setStep] = useState<Step>('upload');

  // Upload step
  const [frameName, setFrameName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  // Processing step
  const [progress, setProgress] = useState(0);

  // Calibrate step — transparent PNG result
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultW, setResultW] = useState(0);
  const [resultH, setResultH] = useState(0);
  const [bridgeX, setBridgeX] = useState(50);
  const [bridgeY, setBridgeY] = useState(40);
  const [widthScale, setWidthScale] = useState(100);

  // ---------------------------------------------------------------------------
  // File handling
  // ---------------------------------------------------------------------------

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Please select an image file (PNG or JPEG).');
      return;
    }
    setFile(f);
    setError('');
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0] ?? null);
  }

  // ---------------------------------------------------------------------------
  // Background removal
  // ---------------------------------------------------------------------------

  async function startProcessing() {
    if (!file) return;
    setStep('processing');
    setProgress(0);
    setError('');

    try {
      const result = await removeBackground(file, (p) => setProgress(p));
      setResultUrl(result.dataUrl);
      setResultW(result.width);
      setResultH(result.height);
      setBridgeX(50);
      setBridgeY(40);
      setWidthScale(100);
      setStep('calibrate');
    } catch {
      setError('Background removal failed. Please try a different image.');
      setStep('upload');
    }
  }

  // ---------------------------------------------------------------------------
  // Save & test in AR
  // ---------------------------------------------------------------------------

  async function handleTestInAR() {
    if (!resultUrl) return;
    try {
      await saveCustomFrame({
        dataUrl: resultUrl,
        width: resultW,
        height: resultH,
        bridgeX: bridgeX / 100,
        bridgeY: bridgeY / 100,
        widthScale: widthScale / 100,
        name: frameName || 'Custom Frame',
      });
      setStep('done');
      router.push('/trydemo?customFrame=true');
    } catch {
      setError('Could not save frame. Storage might be full.');
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 h-16 bg-cream-50 border-b border-cream-400 flex-shrink-0">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
          <Glasses className="w-5 h-5" style={{ color: '#C9A96E' }} />
          <div className="flex items-baseline gap-0">
            <span className="font-serif text-xl font-semibold tracking-tight text-ink-900">Specta</span>
            <span className="font-serif text-xl font-semibold tracking-tight" style={{ color: '#C9A96E' }}>Snap</span>
          </div>
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-6">
          {(['UPLOAD FRAMES', 'CATALOG', 'ANALYTICS'] as const).map((label, i) => (
            <span
              key={label}
              className="font-sans font-semibold tracking-[0.12em] uppercase cursor-default"
              style={{
                fontSize: 10,
                color: i === 0 ? '#A8844A' : '#9A9490',
                borderBottom: i === 0 ? '1px solid #A8844A' : 'none',
                paddingBottom: i === 0 ? 1 : 0,
              }}
            >
              {label}
            </span>
          ))}
        </nav>

        {/* Right slot */}
        <div className="flex items-center gap-2">
          <span className="font-sans font-semibold tracking-[0.12em] uppercase text-ink-500" style={{ fontSize: 10 }}>
            STORE NAME
          </span>
          <Lock className="w-3.5 h-3.5 text-ink-300" />
        </div>
      </header>

      {/* ── Three-column body ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT sidebar */}
        <StepSidebar current={step} />

        {/* CENTER main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto px-6 py-10">

            {/* ══ STEP: UPLOAD ══════════════════════════════════════════════════ */}
            {step === 'upload' && (
              <>
                <ProgressBreadcrumb current="upload" />

                <h1 className="font-serif text-4xl font-semibold text-ink-900 mb-2 leading-tight">
                  Upload Frames
                </h1>
                <p className="font-sans text-ink-500 mb-8" style={{ fontSize: 14 }}>
                  Add your store&apos;s spectacles to SpectaSnap&apos;s AR catalog with editorial precision.
                </p>

                {/* Frame name */}
                <div className="mb-5">
                  <label
                    className="block font-sans font-semibold tracking-[0.12em] uppercase mb-1.5"
                    style={{ fontSize: 9, color: '#6B6560' }}
                  >
                    FRAME NAME
                  </label>
                  <input
                    type="text"
                    value={frameName}
                    onChange={(e) => setFrameName(e.target.value)}
                    placeholder="e.g. Classic Wayfarer"
                    className="w-full px-3 py-2.5 bg-cream-50 border border-cream-400 text-sm font-sans text-ink-900
                               focus:outline-none focus:border-gold-500 transition-colors placeholder:text-ink-300"
                    style={{ borderRadius: 2 }}
                  />
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-cream-400
                             hover:border-gold-500 cursor-pointer transition-colors mb-3"
                  style={{ borderRadius: 2, minHeight: 200, padding: '2.5rem 1.5rem' }}
                >
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-48 object-contain"
                    />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-ink-300" />
                      <p className="font-sans text-ink-500 text-center" style={{ fontSize: 13 }}>
                        Drop your frame photo here or click to browse
                      </p>
                      <p
                        className="font-sans font-semibold tracking-[0.12em] uppercase text-center"
                        style={{ fontSize: 9, color: '#9A9490' }}
                      >
                        PNG OR JPG · WHITE BACKGROUND RECOMMENDED
                      </p>
                    </>
                  )}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />

                {/* Skip link */}
                <button
                  onClick={() => file && startProcessing()}
                  className="font-sans font-semibold tracking-[0.10em] uppercase mb-5 block"
                  style={{
                    fontSize: 9,
                    color: '#A8844A',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  PHOTO ALREADY HAS TRANSPARENT BACKGROUND? SKIP REMOVAL →
                </button>

                {/* Example images row */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div
                      className="w-full h-24 bg-white border border-cream-400 flex items-center justify-center mb-1.5"
                      style={{ borderRadius: 2 }}
                    >
                      <span className="font-sans text-ink-300" style={{ fontSize: 10 }}>flat · even light</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C9A96E' }} />
                      <span
                        className="font-sans font-semibold tracking-[0.10em] uppercase"
                        style={{ fontSize: 9, color: '#A8844A' }}
                      >
                        GOOD
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div
                      className="w-full h-24 bg-cream-200 border border-cream-400 flex items-center justify-center mb-1.5"
                      style={{ borderRadius: 2 }}
                    >
                      <span className="font-sans text-ink-300" style={{ fontSize: 10 }}>angled · shadows</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <span
                        className="font-sans font-semibold tracking-[0.10em] uppercase"
                        style={{ fontSize: 9, color: '#9A9490' }}
                      >
                        BAD
                      </span>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 font-sans text-xs mb-3">{error}</p>
                )}

                {/* CTA */}
                <button
                  onClick={startProcessing}
                  disabled={!file}
                  className="w-full py-3 font-sans font-semibold tracking-wide text-cream-50
                             hover:opacity-90 transition-opacity disabled:opacity-40"
                  style={{ borderRadius: 2, backgroundColor: '#A8844A', fontSize: 13 }}
                >
                  <span className="flex items-center justify-center gap-2">
                    CONTINUE TO PROCESS
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </>
            )}

            {/* ══ STEP: PROCESSING ══════════════════════════════════════════════ */}
            {step === 'processing' && (
              <>
                <ProgressBreadcrumb current="processing" />

                <div className="py-8 flex flex-col items-center text-center">
                  <Loader2 className="w-10 h-10 mb-6 animate-spin" style={{ color: '#C9A96E' }} />
                  <h2 className="font-serif text-3xl font-semibold text-ink-900 mb-3">
                    Removing Background&hellip;
                  </h2>
                  <p className="font-sans text-ink-500 mb-8 max-w-xs" style={{ fontSize: 13 }}>
                    This may take a moment. First-time use downloads ~50 MB of models (cached for future visits).
                  </p>

                  <div
                    className="w-full overflow-hidden"
                    style={{ maxWidth: 320, height: 6, borderRadius: 2, backgroundColor: '#EDE8DC' }}
                  >
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${Math.round(progress * 100)}%`,
                        backgroundColor: '#C9A96E',
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  <p className="font-sans text-ink-500 mt-2" style={{ fontSize: 12 }}>
                    {Math.round(progress * 100)}%
                  </p>
                </div>
              </>
            )}

            {/* ══ STEP: CALIBRATE ═══════════════════════════════════════════════ */}
            {step === 'calibrate' && resultUrl && (
              <>
                <ProgressBreadcrumb current="calibrate" />

                {/* Back / Test in AR header row */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setStep('upload')}
                    className="flex items-center gap-1.5 font-sans font-semibold tracking-[0.10em] uppercase
                               text-ink-500 hover:text-gold-600 transition-colors"
                    style={{ fontSize: 10 }}
                  >
                    <ArrowLeft className="w-3 h-3" />
                    BACK
                  </button>
                  <button
                    onClick={handleTestInAR}
                    className="flex items-center gap-1.5 font-sans font-semibold tracking-[0.10em] uppercase
                               text-ink-900 hover:text-gold-600 transition-colors"
                    style={{ fontSize: 10 }}
                  >
                    TEST IN AR →
                  </button>
                </div>

                <h1 className="font-serif italic text-4xl font-semibold text-ink-900 mb-2 leading-tight">
                  Precision Alignment
                </h1>
                <p className="font-sans text-ink-500 mb-6" style={{ fontSize: 14 }}>
                  Calibrate the frame&apos;s optical center to ensure the AR trial matches the real-world fit.
                </p>

                {/* Image with bridge dot */}
                <div
                  className="relative border border-cream-400 overflow-hidden mb-6"
                  style={{
                    borderRadius: 2,
                    background:
                      'repeating-conic-gradient(#e8e3da 0% 25%, #f5f0e8 0% 50%) 50% / 20px 20px',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resultUrl}
                    alt="Transparent frame"
                    className="w-full object-contain"
                    style={{ maxHeight: 300 }}
                  />
                  <div
                    className="absolute w-3 h-3 rounded-full border-2 border-white pointer-events-none"
                    style={{
                      backgroundColor: '#C9A96E',
                      left: `${bridgeX}%`,
                      top: `${bridgeY}%`,
                      transform: 'translate(-50%, -50%)',
                      boxShadow: '0 0 6px rgba(201,169,110,0.6)',
                    }}
                  />
                </div>

                {/* Sliders */}
                <div className="flex flex-col gap-5 mb-6">
                  <div>
                    <label className="flex items-center justify-between font-sans font-semibold tracking-[0.10em] uppercase mb-2">
                      <span style={{ fontSize: 9, color: '#6B6560' }}>BRIDGE X-AXIS</span>
                      <span className="font-sans text-ink-900" style={{ fontSize: 11 }}>{bridgeX}%</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={bridgeX}
                      onChange={(e) => setBridgeX(Number(e.target.value))}
                      className="w-full accent-gold-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center justify-between font-sans font-semibold tracking-[0.10em] uppercase mb-2">
                      <span style={{ fontSize: 9, color: '#6B6560' }}>BRIDGE Y-AXIS</span>
                      <span className="font-sans text-ink-900" style={{ fontSize: 11 }}>{bridgeY}%</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={bridgeY}
                      onChange={(e) => setBridgeY(Number(e.target.value))}
                      className="w-full accent-gold-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center justify-between font-sans font-semibold tracking-[0.10em] uppercase mb-2">
                      <span style={{ fontSize: 9, color: '#6B6560' }}>DIGITAL SCALE</span>
                      <span className="font-sans text-ink-900" style={{ fontSize: 11 }}>{widthScale}%</span>
                    </label>
                    <input
                      type="range"
                      min={50}
                      max={200}
                      value={widthScale}
                      onChange={(e) => setWidthScale(Number(e.target.value))}
                      className="w-full accent-gold-500"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 font-sans text-xs mb-3">{error}</p>
                )}

                <button
                  onClick={handleTestInAR}
                  className="w-full py-3 font-sans font-semibold tracking-wide text-cream-50
                             hover:opacity-90 transition-opacity"
                  style={{ borderRadius: 2, backgroundColor: '#A8844A', fontSize: 13 }}
                >
                  <span className="flex items-center justify-center gap-2">
                    TEST IN AR
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </>
            )}

            {/* ══ STEP: DONE ════════════════════════════════════════════════════ */}
            {step === 'done' && (
              <div className="flex flex-col items-center text-center py-20">
                <CheckCircle2 className="w-12 h-12 mb-4" style={{ color: '#C9A96E' }} />
                <h2 className="font-serif text-3xl font-semibold text-ink-900 mb-2">
                  Redirecting to AR&hellip;
                </h2>
                <p className="font-sans text-ink-500" style={{ fontSize: 14 }}>
                  Your custom frame is loading in the try-on demo.
                </p>
              </div>
            )}

          </div>
        </main>

        {/* RIGHT panel — contextual */}
        {(step === 'upload' || step === 'processing') && <PhotoGuidePanel />}
        {step === 'calibrate' && (
          <CalibrateGuidePanel
            bridgeX={bridgeX}
            bridgeY={bridgeY}
            widthScale={widthScale}
            onReset={() => { setBridgeX(50); setBridgeY(40); setWidthScale(100); }}
          />
        )}

      </div>
    </div>
  );
}
