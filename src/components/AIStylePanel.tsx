'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

interface FrameOption {
  id: string;
  name: string;
  style: string;
  bestFor: string[];
}

interface AIStylePanelProps {
  open: boolean;
  onClose: () => void;
  availableFrames: FrameOption[];
  onRecommendation: (frameId: string, rationale: string) => void;
}

type Step = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'loading' | 'result' | 'error';

interface Answers {
  occasion: string;
  faceShape: string;
  style: string;
  material: string;
  avoidColors: string;
}

const STEP_INDEX: Record<Step, number> = { q1: 0, q2: 1, q3: 2, q4: 3, q5: 4, loading: 5, result: 5, error: 5 };

function OptionButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-3 text-sm font-sans font-medium border transition-all duration-150 text-left"
      style={{
        borderRadius: 2,
        border: active ? '1px solid #C9A96E' : '1px solid #DDD8CE',
        backgroundColor: active ? 'rgba(201,169,110,0.12)' : '#FDFAF4',
        color: active ? '#A8844A' : '#1A1612',
      }}
    >
      {label}
    </button>
  );
}

export default function AIStylePanel({ open, onClose, availableFrames, onRecommendation }: AIStylePanelProps) {
  const [step, setStep] = useState<Step>('q1');
  const [errorMsg, setErrorMsg] = useState('');
  const [answers, setAnswers] = useState<Answers>({
    occasion: '',
    faceShape: '',
    style: '',
    material: '',
    avoidColors: '',
  });
  const [result, setResult] = useState<{ frameId: string; frameName: string; rationale: string } | null>(null);

  function reset() {
    setStep('q1');
    setErrorMsg('');
    setAnswers({ occasion: '', faceShape: '', style: '', material: '', avoidColors: '' });
    setResult(null);
  }

  async function submit() {
    setStep('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...answers, availableFrames }),
      });
      const data = (await res.json()) as { frameId: string; frameName: string; rationale: string; error?: string };
      if (data.error) throw new Error(data.error);
      setResult(data);
      setStep('result');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setStep('error');
    }
  }

  const progressSteps = STEP_INDEX[step];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed top-0 right-0 bottom-0 z-50 bg-brand-panel border-l border-brand-border
                       flex flex-col overflow-hidden"
            style={{ width: 'min(360px, 100vw)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border flex-shrink-0">
              <div>
                <p className="text-[10px] font-sans font-semibold tracking-[0.14em] uppercase" style={{ color: '#C9A96E' }}>
                  SpectaSnap
                </p>
                <h2 className="font-serif text-xl font-semibold text-brand-text leading-tight">AI Style Advisor</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center border border-brand-border text-brand-muted
                           hover:border-brand-text hover:text-brand-text transition-colors"
                style={{ borderRadius: 2 }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            {progressSteps < 5 && (
              <div className="flex gap-1 px-6 pt-4 flex-shrink-0">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-0.5 flex-1 transition-colors duration-300"
                    style={{ backgroundColor: i < progressSteps ? '#C9A96E' : '#DDD8CE' }}
                  />
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <AnimatePresence mode="wait">
                {/* Q1 */}
                {step === 'q1' && (
                  <motion.div key="q1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <p className="font-sans text-xs font-semibold tracking-[0.1em] uppercase text-brand-muted mb-1">Step 1 of 5</p>
                    <h3 className="font-serif text-2xl font-semibold text-brand-text mb-5">What&apos;s the occasion?</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {['Casual', 'Office', 'Wedding', 'Sports'].map((o) => (
                        <OptionButton
                          key={o}
                          label={o}
                          active={answers.occasion === o}
                          onClick={() => {
                            setAnswers((a) => ({ ...a, occasion: o }));
                            setStep('q2');
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Q2 */}
                {step === 'q2' && (
                  <motion.div key="q2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <p className="font-sans text-xs font-semibold tracking-[0.1em] uppercase text-brand-muted mb-1">Step 2 of 5</p>
                    <h3 className="font-serif text-2xl font-semibold text-brand-text mb-1">Your face shape?</h3>
                    <p className="text-brand-muted text-xs font-sans mb-5">Not sure? Pick what feels closest</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['Oval', 'Round', 'Square', 'Heart', 'Oblong', 'Diamond'].map((s) => (
                        <OptionButton
                          key={s}
                          label={s}
                          active={answers.faceShape === s}
                          onClick={() => {
                            setAnswers((a) => ({ ...a, faceShape: s }));
                            setStep('q3');
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Q3 */}
                {step === 'q3' && (
                  <motion.div key="q3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <p className="font-sans text-xs font-semibold tracking-[0.1em] uppercase text-brand-muted mb-1">Step 3 of 5</p>
                    <h3 className="font-serif text-2xl font-semibold text-brand-text mb-5">Preferred style?</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {['Classic', 'Bold', 'Minimal', 'Trendy'].map((s) => (
                        <OptionButton
                          key={s}
                          label={s}
                          active={answers.style === s}
                          onClick={() => {
                            setAnswers((a) => ({ ...a, style: s }));
                            setStep('q4');
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Q4 */}
                {step === 'q4' && (
                  <motion.div key="q4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <p className="font-sans text-xs font-semibold tracking-[0.1em] uppercase text-brand-muted mb-1">Step 4 of 5</p>
                    <h3 className="font-serif text-2xl font-semibold text-brand-text mb-5">Frame material?</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {['Metal', 'Acetate', 'Lightweight', 'No Preference'].map((m) => (
                        <OptionButton
                          key={m}
                          label={m}
                          active={answers.material === m}
                          onClick={() => {
                            setAnswers((a) => ({ ...a, material: m }));
                            setStep('q5');
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Q5 */}
                {step === 'q5' && (
                  <motion.div key="q5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex flex-col gap-5">
                    <div>
                      <p className="font-sans text-xs font-semibold tracking-[0.1em] uppercase text-brand-muted mb-1">Step 5 of 5</p>
                      <h3 className="font-serif text-2xl font-semibold text-brand-text mb-1">Any colors to avoid?</h3>
                      <p className="text-brand-muted text-xs font-sans mb-4">Optional — leave blank if no preference</p>
                      <input
                        type="text"
                        placeholder="e.g. bright yellow, pink..."
                        value={answers.avoidColors}
                        onChange={(e) => setAnswers((a) => ({ ...a, avoidColors: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-brand-page border border-brand-border text-sm font-sans text-brand-text
                                   focus:outline-none focus:border-brand-gold transition-colors"
                        style={{ borderRadius: 2 }}
                      />
                    </div>
                    <button
                      onClick={submit}
                      className="w-full py-3 font-sans font-semibold text-sm tracking-wide
                                 hover:opacity-90 active:scale-[0.98] transition-all"
                      style={{ borderRadius: 2, backgroundColor: '#C9A96E', color: '#1A1612' }}
                    >
                      Get My Recommendation
                    </button>
                  </motion.div>
                )}

                {/* Loading */}
                {step === 'loading' && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center gap-4 py-16"
                  >
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C9A96E' }} />
                    <p className="font-sans text-sm text-brand-muted">Analyzing your style...</p>
                  </motion.div>
                )}

                {/* Result */}
                {step === 'result' && result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-5"
                  >
                    <div className="text-center py-4">
                      <span className="text-3xl" style={{ color: '#C9A96E' }}>✦</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-sans font-semibold tracking-[0.14em] uppercase text-brand-muted mb-1">
                        Your perfect match
                      </p>
                      <h3 className="font-serif text-2xl font-semibold text-brand-text leading-tight">
                        {result.frameName}
                      </h3>
                    </div>
                    <div className="border-t border-brand-border" />
                    <p className="font-sans text-sm text-brand-text leading-relaxed italic">
                      &ldquo;{result.rationale}&rdquo;
                    </p>
                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        onClick={() => {
                          onRecommendation(result.frameId, result.rationale);
                          onClose();
                        }}
                        className="w-full py-3 font-sans font-semibold text-sm tracking-wide
                                   hover:opacity-90 active:scale-[0.98] transition-all"
                        style={{ borderRadius: 2, backgroundColor: '#C9A96E', color: '#1A1612' }}
                      >
                        Apply This Frame
                      </button>
                      <button
                        onClick={reset}
                        className="w-full py-3 font-sans font-semibold text-sm tracking-wide
                                   border border-brand-border text-brand-text hover:border-brand-text transition-colors"
                        style={{ borderRadius: 2 }}
                      >
                        Try Again
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Error */}
                {step === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center gap-4 py-16 text-center"
                  >
                    <p className="font-sans text-sm text-brand-muted">Something went wrong.</p>
                    {errorMsg && (
                      <p className="font-sans text-xs text-red-500 max-w-[280px] break-words">{errorMsg}</p>
                    )}
                    <button
                      onClick={reset}
                      className="px-6 py-2.5 font-sans font-medium text-sm border border-brand-border
                                 text-brand-text hover:border-brand-text transition-colors"
                      style={{ borderRadius: 2 }}
                    >
                      Start Over
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
