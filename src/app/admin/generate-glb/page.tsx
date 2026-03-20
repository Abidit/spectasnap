'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { ArrowLeft, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { createProceduralGlasses } from '@/ar/proceduralGlasses';
import { getProceduralPreset } from '@/ar/presets';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CardStatus = 'idle' | 'generating' | 'done' | 'error';

interface FamilyCard {
  label: string;
  presetId: string;
  filename: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const FAMILY_CARDS: FamilyCard[] = [
  { label: 'Aviator',   presetId: 'aviator-01',    filename: 'aviator-featured.glb' },
  { label: 'Round',     presetId: 'round-01',      filename: 'round-featured.glb' },
  { label: 'Wayfarer',  presetId: 'rectangle-01',  filename: 'wayfarer-featured.glb' },
  { label: 'Cat-Eye',   presetId: 'cat-eye-01',    filename: 'cat-eye-featured.glb' },
  { label: 'Sport Wrap', presetId: 'sport-wrap-01', filename: 'sport-wrap-featured.glb' },
];

// ---------------------------------------------------------------------------
// GLB generation
// ---------------------------------------------------------------------------

async function generateGLB(presetId: string, filename: string): Promise<void> {
  // 1. Get preset
  const preset = getProceduralPreset(presetId);
  if (!preset) throw new Error(`Unknown preset: ${presetId}`);

  // 2. Create the procedural model
  const model = createProceduralGlasses(preset);

  // 3. Rename meshes for GLB temple detection compatibility
  let lensCount = 0;
  let frameCount = 0;
  model.traverse((obj) => {
    if (obj.name === 'temple-left') { obj.name = 'temple_left'; return; }
    if (obj.name === 'temple-right') { obj.name = 'temple_right'; return; }
    if (!(obj instanceof THREE.Mesh)) return;
    if (obj.userData.role === 'lens') {
      obj.name = lensCount === 0 ? 'lens_left' : 'lens_right';
      lensCount++;
    } else if (obj.userData.role === 'frame') {
      if (Math.abs(obj.position.x) < 0.005) {
        obj.name = 'bridge';
      } else {
        obj.name = frameCount === 0 ? 'frame_left' : 'frame_right';
        frameCount++;
      }
    } else if (obj.userData.role === 'glare') {
      obj.name = `glare_${obj.position.x < 0 ? 'left' : 'right'}`;
    } else if (obj.userData.role === 'shadow') {
      obj.name = 'shadow';
    }
  });

  // Set root name
  model.name = 'frame_front';

  // 4. Export using GLTFExporter
  const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
  const exporter = new GLTFExporter();
  const glb = await exporter.parseAsync(model, { binary: true });

  // 5. Download
  const blob = new Blob([glb as ArrayBuffer], { type: 'model/gltf-binary' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  // 6. Dispose geometries/materials
  model.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => m.dispose());
    }
  });
}

// ---------------------------------------------------------------------------
// Helper: small delay between sequential exports
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GenerateGlbPage() {
  const [statuses, setStatuses] = useState<Record<string, CardStatus>>(
    () => Object.fromEntries(FAMILY_CARDS.map((c) => [c.presetId, 'idle'])),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [allRunning, setAllRunning] = useState(false);

  // Update a single card status
  const setCardStatus = useCallback((presetId: string, status: CardStatus, error?: string) => {
    setStatuses((prev) => ({ ...prev, [presetId]: status }));
    if (error) {
      setErrors((prev) => ({ ...prev, [presetId]: error }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[presetId];
        return next;
      });
    }
  }, []);

  // Generate a single GLB
  const handleGenerate = useCallback(async (card: FamilyCard) => {
    setCardStatus(card.presetId, 'generating');
    try {
      await generateGLB(card.presetId, card.filename);
      setCardStatus(card.presetId, 'done');
    } catch (err) {
      setCardStatus(
        card.presetId,
        'error',
        err instanceof Error ? err.message : 'Unknown error',
      );
    }
  }, [setCardStatus]);

  // Generate all GLBs sequentially
  const handleGenerateAll = useCallback(async () => {
    setAllRunning(true);
    for (const card of FAMILY_CARDS) {
      setCardStatus(card.presetId, 'generating');
      try {
        await generateGLB(card.presetId, card.filename);
        setCardStatus(card.presetId, 'done');
      } catch (err) {
        setCardStatus(
          card.presetId,
          'error',
          err instanceof Error ? err.message : 'Unknown error',
        );
      }
      // Small delay between exports so the browser can breathe
      await delay(400);
    }
    setAllRunning(false);
  }, [setCardStatus]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: '#F5F0E8', color: '#1A1612' }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        className="flex items-center gap-4 px-6 py-4 border-b"
        style={{ backgroundColor: '#FDFAF4', borderColor: '#DDD8CE' }}
      >
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-xs font-sans font-semibold uppercase tracking-wider"
          style={{ color: '#6B6560', textDecoration: 'none', letterSpacing: '0.12em' }}
          aria-label="Back to Admin"
        >
          <ArrowLeft size={14} />
          Admin
        </Link>

        <div
          className="w-px h-5 flex-shrink-0"
          style={{ backgroundColor: '#DDD8CE' }}
        />

        <h1
          className="font-serif text-lg font-semibold"
          style={{ color: '#1A1612' }}
        >
          GLB Model Generator
        </h1>
      </header>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* Description */}
        <section className="mb-8">
          <p
            className="text-sm font-sans leading-relaxed"
            style={{ color: '#6B6560' }}
          >
            Generate downloadable .glb files from the existing procedural Three.js geometry.
            Each file contains properly named meshes (frame_front, lens_left, lens_right,
            temple_left, temple_right) compatible with the GLB temple detection pipeline.
            Click a card to generate a single family, or use &quot;Generate All&quot; to export
            all five featured frames sequentially.
          </p>
        </section>

        {/* Generate All button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleGenerateAll}
            disabled={allRunning}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-sans font-semibold uppercase tracking-wider transition-opacity disabled:opacity-40"
            style={{
              backgroundColor: '#1A1612',
              color: '#F5F0E8',
              borderRadius: 2,
              letterSpacing: '0.12em',
            }}
            aria-label="Generate all GLB files"
          >
            {allRunning ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {allRunning ? 'Generating...' : 'Generate All'}
          </button>
        </div>

        {/* ── Cards grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FAMILY_CARDS.map((card) => {
            const status = statuses[card.presetId];
            const errorMsg = errors[card.presetId];

            return (
              <div
                key={card.presetId}
                className="p-5 border flex flex-col"
                style={{
                  backgroundColor: '#FDFAF4',
                  borderColor: status === 'done'
                    ? '#C9A96E'
                    : status === 'error'
                      ? '#DC2626'
                      : '#DDD8CE',
                  borderRadius: 2,
                }}
              >
                {/* Family name */}
                <h2
                  className="font-serif text-xl font-semibold mb-1"
                  style={{ color: '#1A1612' }}
                >
                  {card.label}
                </h2>

                {/* Preset ID */}
                <p
                  className="text-xs font-sans font-semibold uppercase mb-1"
                  style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
                >
                  {card.presetId}
                </p>

                {/* Output filename */}
                <p
                  className="text-xs font-sans mb-4"
                  style={{ color: '#6B6560' }}
                >
                  {card.filename}
                </p>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Status indicator */}
                {status === 'done' && (
                  <div
                    className="flex items-center gap-1.5 mb-3 text-xs font-sans font-semibold"
                    style={{ color: '#C9A96E' }}
                    role="status"
                  >
                    <CheckCircle size={14} />
                    Downloaded
                  </div>
                )}
                {status === 'error' && (
                  <div
                    className="flex items-center gap-1.5 mb-3 text-xs font-sans font-semibold"
                    style={{ color: '#DC2626' }}
                    role="alert"
                  >
                    <AlertCircle size={14} />
                    {errorMsg || 'Export failed'}
                  </div>
                )}
                {status === 'generating' && (
                  <div
                    className="flex items-center gap-1.5 mb-3 text-xs font-sans font-semibold"
                    style={{ color: '#C9A96E' }}
                    role="status"
                  >
                    <Loader2 size={14} className="animate-spin" />
                    Generating...
                  </div>
                )}

                {/* Generate button */}
                <button
                  onClick={() => handleGenerate(card)}
                  disabled={status === 'generating' || allRunning}
                  className="flex items-center justify-center gap-2 w-full py-2 text-xs font-sans font-semibold uppercase tracking-wider border transition-opacity disabled:opacity-40"
                  style={{
                    borderColor: '#C9A96E',
                    color: '#C9A96E',
                    backgroundColor: 'transparent',
                    borderRadius: 2,
                    letterSpacing: '0.12em',
                  }}
                  aria-label={`Generate GLB for ${card.label}`}
                >
                  {status === 'generating' ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Download size={12} />
                  )}
                  {status === 'generating' ? 'Generating...' : 'Generate & Download'}
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
