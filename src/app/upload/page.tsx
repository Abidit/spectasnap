'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Glasses, Upload, Loader2, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { removeBackground } from '@/lib/removeBackground';
import { saveCustomFrame } from '@/ar/customFrameLoader';

type Step = 'upload' | 'processing' | 'calibrate' | 'done';

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
      // Navigate to AR demo with custom frame flag
      router.push('/trydemo?customFrame=true');
    } catch {
      setError('Could not save frame. Storage might be full.');
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
        {/* ═══════════════════════════════ STEP: UPLOAD ═══════════════════════════════ */}
        {step === 'upload' && (
          <>
            <div className="mb-8">
              <p
                className="text-[10px] font-sans font-semibold tracking-[0.14em] uppercase mb-1"
                style={{ color: '#C9A96E' }}
              >
                Frame Upload
              </p>
              <h1 className="font-serif text-3xl font-semibold text-brand-text mb-2">
                Upload Your Frames
              </h1>
              <p className="text-brand-muted text-sm font-sans">
                Upload a photo of your real spectacles. We&apos;ll remove the background and let you try them in live AR.
              </p>
            </div>

            {/* Frame name */}
            <div className="mb-4">
              <label className="block text-xs font-sans font-medium text-brand-text mb-1.5">
                Frame Name
              </label>
              <input
                type="text"
                value={frameName}
                onChange={(e) => setFrameName(e.target.value)}
                placeholder="e.g. Milano Classic Round"
                className="w-full px-3 py-2.5 bg-brand-page border border-brand-border text-sm font-sans text-brand-text
                           focus:outline-none focus:border-brand-gold transition-colors"
                style={{ borderRadius: 2 }}
              />
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-brand-border
                         hover:border-brand-gold cursor-pointer transition-colors py-12 mb-4"
              style={{ borderRadius: 2 }}
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
                  <Upload className="w-8 h-8 text-brand-muted" />
                  <p className="text-sm font-sans text-brand-muted">
                    Drag &amp; drop or click to select
                  </p>
                  <p className="text-[10px] font-sans text-brand-muted">PNG or JPEG</p>
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

            {error && <p className="text-red-500 text-xs font-sans mb-3">{error}</p>}

            <button
              onClick={startProcessing}
              disabled={!file}
              className="w-full py-3 font-sans font-semibold text-sm tracking-wide
                         bg-brand-text text-brand-page hover:opacity-90 transition-opacity
                         disabled:opacity-40"
              style={{ borderRadius: 2 }}
            >
              <span className="flex items-center justify-center gap-2">
                Remove Background
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>

            <p className="text-brand-muted text-[10px] font-sans text-center mt-3">
              Step 1 of 3 — background removal is next
            </p>
          </>
        )}

        {/* ═══════════════════════════ STEP: PROCESSING ═══════════════════════════════ */}
        {step === 'processing' && (
          <div className="text-center py-16">
            <Loader2 className="w-10 h-10 mx-auto mb-4 text-brand-gold animate-spin" />
            <h2 className="font-serif text-2xl font-semibold text-brand-text mb-2">
              Removing Background&hellip;
            </h2>
            <p className="text-brand-muted text-sm font-sans mb-6 max-w-xs mx-auto">
              This may take a moment. First-time use downloads ~50 MB of models (cached for future).
            </p>

            {/* Progress bar */}
            <div
              className="w-full h-2 bg-brand-secondary overflow-hidden mx-auto"
              style={{ borderRadius: 2, maxWidth: 280 }}
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
            <p className="text-brand-muted text-xs font-sans mt-2">
              {Math.round(progress * 100)}%
            </p>
          </div>
        )}

        {/* ═══════════════════════════ STEP: CALIBRATE ════════════════════════════════ */}
        {step === 'calibrate' && resultUrl && (
          <>
            <div className="mb-6">
              <button
                onClick={() => setStep('upload')}
                className="flex items-center gap-1 text-brand-muted text-xs font-sans font-medium
                           hover:text-brand-gold transition-colors mb-4"
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </button>
              <p
                className="text-[10px] font-sans font-semibold tracking-[0.14em] uppercase mb-1"
                style={{ color: '#C9A96E' }}
              >
                Calibrate
              </p>
              <h2 className="font-serif text-2xl font-semibold text-brand-text mb-1">
                Position the Bridge Point
              </h2>
              <p className="text-brand-muted text-xs font-sans">
                Adjust the gold dot to sit where the nose bridge meets the frame.
              </p>
            </div>

            {/* Preview with bridge dot */}
            <div
              className="relative border border-brand-border overflow-hidden mb-6"
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
              {/* Bridge dot */}
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
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="flex items-center justify-between text-xs font-sans font-medium text-brand-text mb-1">
                  Bridge X
                  <span className="text-brand-muted">{bridgeX}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={bridgeX}
                  onChange={(e) => setBridgeX(Number(e.target.value))}
                  className="w-full accent-brand-gold"
                />
              </div>
              <div>
                <label className="flex items-center justify-between text-xs font-sans font-medium text-brand-text mb-1">
                  Bridge Y
                  <span className="text-brand-muted">{bridgeY}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={bridgeY}
                  onChange={(e) => setBridgeY(Number(e.target.value))}
                  className="w-full accent-brand-gold"
                />
              </div>
              <div>
                <label className="flex items-center justify-between text-xs font-sans font-medium text-brand-text mb-1">
                  Width Scale
                  <span className="text-brand-muted">{widthScale}%</span>
                </label>
                <input
                  type="range"
                  min={50}
                  max={200}
                  value={widthScale}
                  onChange={(e) => setWidthScale(Number(e.target.value))}
                  className="w-full accent-brand-gold"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-sans mb-3">{error}</p>}

            <button
              onClick={handleTestInAR}
              className="w-full py-3 font-sans font-semibold text-sm tracking-wide
                         bg-brand-text text-brand-page hover:opacity-90 transition-opacity"
              style={{ borderRadius: 2 }}
            >
              <span className="flex items-center justify-center gap-2">
                Test in AR
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>

            <p className="text-brand-muted text-[10px] font-sans text-center mt-3">
              Step 3 of 3 — your frame will load in the AR try-on
            </p>
          </>
        )}

        {/* ═══════════════════════════════ STEP: DONE ═════════════════════════════════ */}
        {step === 'done' && (
          <div className="text-center py-16">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: '#C9A96E' }} />
            <h2 className="font-serif text-2xl font-semibold text-brand-text mb-2">
              Redirecting to AR&hellip;
            </h2>
            <p className="text-brand-muted text-sm font-sans">
              Your custom frame is loading in the try-on demo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
