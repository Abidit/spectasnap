'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIRec {
  frameId: string;
  frameName: string;
  reason: string;
  confidence: 'Perfect match' | 'Great choice' | 'Worth trying';
}

export interface AIStylePanelProps {
  /** Whether the panel is visible */
  open: boolean;
  /** Called when user closes the panel */
  onClose: () => void;
  /** Detected face shape from AR pipeline */
  faceShape?: string | null;
  /** Called when user taps a recommendation card — switch frame and close */
  onSelectFrame?: (frameId: string) => void;
}

// ─── Questions ────────────────────────────────────────────────────────────────

const QUESTIONS: { id: string; text: string; options: string[] }[] = [
  {
    id: 'q1',
    text: "What's your daily style?",
    options: ['Minimal & Clean', 'Bold & Expressive', 'Classic & Timeless', 'Sporty & Active'],
  },
  {
    id: 'q2',
    text: 'Where do you wear glasses most?',
    options: ['Office & Meetings', 'Casual & Social', 'Outdoors', 'All Day Every Day'],
  },
  {
    id: 'q3',
    text: 'How should people see you?',
    options: ['Professional', 'Creative', 'Approachable', 'Confident'],
  },
  {
    id: 'q4',
    text: 'Frame weight preference?',
    options: ['Light as possible', 'Medium', 'Chunky & bold', 'No preference'],
  },
  {
    id: 'q5',
    text: 'Pick a vibe:',
    options: ['🖤 Sleek', '🤎 Warm', '💛 Classic', '❤️ Statement'],
  },
];

// ─── Fallback recommendations by face shape ───────────────────────────────────

function getFallbackRecs(faceShape: string | null | undefined): AIRec[] {
  const shape = faceShape ?? 'Oval';
  const map: Record<string, AIRec[]> = {
    Oval: [
      { frameId: 'featured-aviator',  frameName: 'Featured Aviator',  reason: 'Balances your symmetrical oval shape perfectly', confidence: 'Perfect match' },
      { frameId: 'round-01',          frameName: 'Round 01',          reason: 'Softens and complements your even proportions', confidence: 'Great choice'   },
      { frameId: 'rectangle-01',      frameName: 'Rectangle 01',      reason: 'Adds structure to your versatile face shape',   confidence: 'Worth trying'  },
    ],
    Round: [
      { frameId: 'rectangle-01',      frameName: 'Rectangle 01',      reason: 'Angular lines elongate and define your face',   confidence: 'Perfect match' },
      { frameId: 'cat-eye-01',        frameName: 'Cat-Eye 01',        reason: 'Adds lift and definition to softer features',   confidence: 'Great choice'  },
      { frameId: 'featured-wayfarer', frameName: 'Featured Wayfarer', reason: 'Classic shape adds welcome contrast',           confidence: 'Worth trying'  },
    ],
    Square: [
      { frameId: 'featured-round',    frameName: 'Featured Round',    reason: 'Softens your strong, angular jawline beautifully', confidence: 'Perfect match' },
      { frameId: 'featured-aviator',  frameName: 'Featured Aviator',  reason: 'Curved brow bar balances your sharp features',    confidence: 'Great choice'  },
      { frameId: 'round-01',          frameName: 'Round 01',          reason: 'Rounds off strong angular proportions',           confidence: 'Worth trying'  },
    ],
    Heart: [
      { frameId: 'cat-eye-01',        frameName: 'Cat-Eye 01',        reason: 'Highlights your cheekbones and adds balance',      confidence: 'Perfect match' },
      { frameId: 'round-01',          frameName: 'Round 01',          reason: 'Balances a wider forehead with soft curves',       confidence: 'Great choice'  },
      { frameId: 'featured-aviator',  frameName: 'Featured Aviator',  reason: 'Adds width at the jaw to balance your forehead',   confidence: 'Worth trying'  },
    ],
    Oblong: [
      { frameId: 'featured-wayfarer', frameName: 'Featured Wayfarer', reason: 'Adds width and proportion to your longer face',   confidence: 'Perfect match' },
      { frameId: 'featured-round',    frameName: 'Featured Round',    reason: 'Wide frames break up a longer face shape',        confidence: 'Great choice'  },
      { frameId: 'cat-eye-01',        frameName: 'Cat-Eye 01',        reason: 'Horizontal emphasis creates pleasing proportion', confidence: 'Worth trying'  },
    ],
    Diamond: [
      { frameId: 'featured-cat-eye',  frameName: 'Featured Cat-Eye',  reason: 'Highlights cheekbones and your unique angles',    confidence: 'Perfect match' },
      { frameId: 'rectangle-01',      frameName: 'Rectangle 01',      reason: 'Clean lines complement your defined features',    confidence: 'Great choice'  },
      { frameId: 'featured-round',    frameName: 'Featured Round',    reason: 'Balances prominent cheekbones softly',            confidence: 'Worth trying'  },
    ],
  };
  return map[shape] ?? map['Oval'];
}

// ─── Confidence badge ─────────────────────────────────────────────────────────

function ConfidenceBadge({ confidence }: { confidence: AIRec['confidence'] }) {
  return (
    <span
      className="text-[10px] font-sans font-semibold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full"
      style={{
        backgroundColor: 'rgba(201,169,110,0.15)',
        color: '#A8844A',
      }}
    >
      {confidence}
    </span>
  );
}

// ─── Mini frame canvas ────────────────────────────────────────────────────────

function MiniFrameCanvas({ frameId }: { frameId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw a simple schematic glasses shape
    ctx.clearRect(0, 0, 44, 22);
    ctx.strokeStyle = '#C9A96E';
    ctx.lineWidth = 1.5;

    // Left lens
    ctx.beginPath();
    ctx.roundRect(2, 4, 16, 14, 3);
    ctx.stroke();

    // Right lens
    ctx.beginPath();
    ctx.roundRect(26, 4, 16, 14, 3);
    ctx.stroke();

    // Bridge
    ctx.beginPath();
    ctx.moveTo(18, 11);
    ctx.lineTo(26, 11);
    ctx.stroke();

    // Left temple (stub)
    ctx.beginPath();
    ctx.moveTo(2, 8);
    ctx.lineTo(0, 7);
    ctx.stroke();

    // Right temple (stub)
    ctx.beginPath();
    ctx.moveTo(42, 8);
    ctx.lineTo(44, 7);
    ctx.stroke();

    // Tint the lens fill slightly based on frameId to add variety
    ctx.fillStyle = frameId.includes('round') ? 'rgba(201,169,110,0.08)' : 'rgba(201,169,110,0.04)';
    ctx.beginPath();
    ctx.roundRect(2, 4, 16, 14, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(26, 4, 16, 14, 3);
    ctx.fill();
  }, [frameId]);

  return (
    <canvas
      ref={canvasRef}
      width={44}
      height={22}
      aria-hidden="true"
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
}

// ─── Rec card ─────────────────────────────────────────────────────────────────

function RecCard({
  rec,
  index,
  onSelect,
}: {
  rec: AIRec;
  index: number;
  onSelect: (frameId: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(rec.frameId)}
      className="w-full text-left border border-cream-400 bg-cream-100 p-3 mb-2
                 hover:border-gold-500 hover:bg-cream-50 transition-all duration-150
                 flex gap-3 items-start"
      style={{
        borderRadius: 2,
        animationDelay: `${index * 150}ms`,
      }}
      aria-label={`Select ${rec.frameName}`}
    >
      {/* Mini frame canvas */}
      <div className="flex-shrink-0 mt-1">
        <MiniFrameCanvas frameId={rec.frameId} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-sm font-sans font-semibold text-ink-900 truncate">
            {rec.frameName}
          </span>
          <ConfidenceBadge confidence={rec.confidence} />
        </div>
        <p className="text-xs font-sans text-ink-500 italic leading-snug">
          {rec.reason}
        </p>
        <p
          className="text-xs font-sans font-semibold mt-1.5"
          style={{ color: '#C9A96E' }}
        >
          Try This →
        </p>
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type PanelStep = 0 | 1 | 2 | 3 | 4 | 'loading' | 'result';

export default function AIStylePanel({
  open,
  onClose,
  faceShape,
  onSelectFrame,
}: AIStylePanelProps) {
  const [step, setStep] = useState<PanelStep>(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [recs, setRecs] = useState<AIRec[]>([]);
  const [visible, setVisible] = useState(false);

  // Animate open/close
  useEffect(() => {
    if (open) {
      setVisible(true);
      setStep(0);
      setAnswers([]);
      setRecs([]);
    } else {
      setVisible(false);
    }
  }, [open]);

  async function handleAnswer(answer: string) {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if ((step as number) < 4) {
      // Short delay before advancing
      await new Promise((r) => setTimeout(r, 150));
      setStep(((step as number) + 1) as PanelStep);
    } else {
      // Q5 answered — start loading
      setStep('loading');

      const loadStart = Date.now();
      let result: AIRec[] = [];

      try {
        const res = await fetch('/api/stylist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            faceShape: faceShape ?? 'Unknown',
            answers: newAnswers,
          }),
        });
        const data = (await res.json()) as AIRec[] | { error: string };
        if (!res.ok || 'error' in data) throw new Error();
        result = data as AIRec[];
        if (!Array.isArray(result) || result.length === 0) throw new Error();
      } catch {
        result = getFallbackRecs(faceShape);
      }

      // Enforce minimum 1500ms loading state
      const elapsed = Date.now() - loadStart;
      if (elapsed < 1500) {
        await new Promise((r) => setTimeout(r, 1500 - elapsed));
      }

      setRecs(result);
      setStep('result');
    }
  }

  function handleSelectFrame(frameId: string) {
    onSelectFrame?.(frameId);
    onClose();
  }

  const progressPct =
    step === 'loading' || step === 'result'
      ? 100
      : ((step as number) / 5) * 100;

  if (!visible) return null;

  return (
    <div
      className="absolute inset-y-0 right-0 flex flex-col bg-cream-50 border-l border-cream-400 z-10
                 overflow-hidden"
      style={{
        width: '100%',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 300ms ease',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-cream-400 flex-shrink-0">
        <h2
          className="font-serif italic text-lg text-ink-900"
          style={{ fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)' }}
        >
          AI Stylist
        </h2>
        <button
          onClick={onClose}
          className="text-ink-300 hover:text-ink-900 transition-colors"
          aria-label="Close AI Stylist"
        >
          <X size={18} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-cream-400 flex-shrink-0">
        <div
          className="h-full bg-gold-500 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Questions */}
        {typeof step === 'number' && step >= 0 && step <= 4 && (
          <div key={step}>
            <p className="font-serif text-lg text-ink-900 mb-4"
               style={{ fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)' }}>
              {QUESTIONS[step as number].text}
            </p>
            <div className="flex flex-col gap-2">
              {QUESTIONS[step as number].options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => void handleAnswer(opt)}
                  className="w-full p-3 text-left text-sm font-sans text-ink-900
                             border border-cream-400 rounded-sharp bg-cream-100
                             hover:border-gold-500 hover:bg-gold-100 transition-all duration-150"
                  style={{ borderRadius: 2 }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div
              className="w-3 h-3 rounded-full bg-gold-500 animate-pulse"
              aria-hidden="true"
            />
            <p
              className="font-serif italic text-ink-500 text-center"
              style={{ fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)' }}
            >
              Analysing your style…
            </p>
          </div>
        )}

        {/* Results */}
        {step === 'result' && recs.length > 0 && (
          <div>
            <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-300 mb-4">
              Your Recommendations
            </p>
            {recs.map((rec, i) => (
              <div
                key={rec.frameId}
                style={{
                  opacity: 0,
                  animation: `fadeSlideIn 0.3s ease forwards`,
                  animationDelay: `${i * 150}ms`,
                }}
              >
                <RecCard rec={rec} index={i} onSelect={handleSelectFrame} />
              </div>
            ))}
            <style>{`
              @keyframes fadeSlideIn {
                from { opacity: 0; transform: translateY(8px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            <button
              onClick={() => {
                setStep(0);
                setAnswers([]);
                setRecs([]);
              }}
              className="w-full mt-2 py-2 text-xs font-sans font-medium text-ink-300
                         border border-cream-400 hover:border-ink-900 hover:text-ink-900 transition-colors"
              style={{ borderRadius: 2 }}
            >
              Start Over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
