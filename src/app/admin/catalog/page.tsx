'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Glasses,
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Download,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CatalogFrame {
  id: string;
  storeId: string;
  name: string;
  style: string;
  price?: string;
  sku?: string;
  basePresetId: string;
  colorHex?: string;
  createdAt: string;
}

type PageStatus = 'idle' | 'loading' | 'saving' | 'deleting' | 'success' | 'error';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORE_ID_REGEX = /^[a-zA-Z0-9-]{3,50}$/;

const STYLE_OPTIONS = ['Round', 'Rectangle', 'Aviator', 'Cat-Eye', 'Sport Wrap'] as const;

const PRESET_OPTIONS = [
  'round-01',
  'round-02',
  'rectangle-01',
  'rectangle-02',
  'aviator-01',
  'aviator-02',
  'cat-eye-01',
  'cat-eye-02',
  'sport-wrap-01',
  'sport-wrap-02',
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CatalogAdminPage() {
  // ── Store ID state ──────────────────────────────────────────────────────
  const [storeId, setStoreId] = useState('');
  const [loadedStoreId, setLoadedStoreId] = useState<string | null>(null);

  // ── Frame list state ────────────────────────────────────────────────────
  const [frames, setFrames] = useState<CatalogFrame[]>([]);

  // ── Add form state ──────────────────────────────────────────────────────
  const [formName, setFormName] = useState('');
  const [formStyle, setFormStyle] = useState<string>(STYLE_OPTIONS[0]);
  const [formPreset, setFormPreset] = useState<string>(PRESET_OPTIONS[0]);
  const [formPrice, setFormPrice] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formColor, setFormColor] = useState('');

  // ── Status state ────────────────────────────────────────────────────────
  const [status, setStatus] = useState<PageStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // ── Load catalog ────────────────────────────────────────────────────────
  const handleLoad = useCallback(async () => {
    if (!STORE_ID_REGEX.test(storeId)) {
      setStatus('error');
      setStatusMessage('Enter a valid Store ID (3-50 alphanumeric characters or hyphens).');
      return;
    }

    setStatus('loading');
    setStatusMessage('Loading catalog...');

    try {
      const res = await fetch(`/api/catalog?store=${encodeURIComponent(storeId)}`);
      const data = await res.json();

      if (data.ok) {
        setFrames(data.frames ?? []);
        setLoadedStoreId(storeId);
        setStatus('success');
        setStatusMessage(
          data.frames?.length
            ? `Loaded ${data.frames.length} frame(s) for "${storeId}".`
            : `No frames found for "${storeId}". Add some below.`,
        );
      } else {
        setStatus('error');
        setStatusMessage(data.error || 'Failed to load catalog.');
      }
    } catch {
      setStatus('error');
      setStatusMessage('Network error -- could not reach the server.');
    }
  }, [storeId]);

  // ── Add frame ───────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!loadedStoreId) return;
    if (!formName.trim()) {
      setStatus('error');
      setStatusMessage('Frame name is required.');
      return;
    }

    setStatus('saving');
    setStatusMessage('Adding frame...');

    try {
      const payload = {
        storeId: loadedStoreId,
        name: formName.trim(),
        style: formStyle,
        basePresetId: formPreset,
        price: formPrice.trim() || undefined,
        sku: formSku.trim() || undefined,
        colorHex: formColor.trim() || undefined,
      };

      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.ok && data.frame) {
        setFrames((prev) => [...prev, data.frame]);
        // Reset form
        setFormName('');
        setFormPrice('');
        setFormSku('');
        setFormColor('');
        setStatus('success');
        setStatusMessage(`Added "${data.frame.name}" to catalog.`);
      } else {
        setStatus('error');
        setStatusMessage(data.error || 'Failed to add frame.');
      }
    } catch {
      setStatus('error');
      setStatusMessage('Network error -- could not reach the server.');
    }
  };

  // ── Delete frame ────────────────────────────────────────────────────────
  const handleDelete = async (frameId: string, frameName: string) => {
    if (!loadedStoreId) return;

    setStatus('deleting');
    setStatusMessage(`Deleting "${frameName}"...`);

    try {
      const res = await fetch(
        `/api/catalog?store=${encodeURIComponent(loadedStoreId)}&id=${encodeURIComponent(frameId)}`,
        { method: 'DELETE' },
      );
      const data = await res.json();

      if (data.ok) {
        setFrames((prev) => prev.filter((f) => f.id !== frameId));
        setStatus('success');
        setStatusMessage(`Deleted "${frameName}".`);
      } else {
        setStatus('error');
        setStatusMessage(data.error || 'Failed to delete frame.');
      }
    } catch {
      setStatus('error');
      setStatusMessage('Network error -- could not reach the server.');
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: '#F5F0E8', color: '#1A1612' }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ backgroundColor: '#FDFAF4', borderColor: '#DDD8CE' }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3"
          style={{ textDecoration: 'none' }}
          aria-label="SpectaSnap home"
        >
          <div className="w-7 h-7 flex items-center justify-center">
            <Glasses className="w-5 h-5" style={{ color: '#C9A96E' }} />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span
              className="font-serif text-xl font-semibold tracking-tight"
              style={{ color: '#1A1612' }}
            >
              Specta
            </span>
            <span
              className="font-serif text-xl font-semibold tracking-tight"
              style={{ color: '#C9A96E' }}
            >
              Snap
            </span>
          </div>
        </Link>

        {/* Title */}
        <h1
          className="font-serif text-lg font-semibold"
          style={{ color: '#1A1612' }}
        >
          Frame Catalog
        </h1>

        {/* Back link */}
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-xs font-sans font-medium"
          style={{ color: '#6B6560', textDecoration: 'none' }}
          aria-label="Back to Store Admin"
        >
          <ArrowLeft size={14} />
          Back to Admin
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        {/* ── Store ID Selector ─────────────────────────────────────────── */}
        <section
          className="mb-8 p-6 border"
          style={{
            backgroundColor: '#FDFAF4',
            borderColor: '#DDD8CE',
            borderRadius: 2,
          }}
        >
          <h2
            className="font-serif text-lg font-semibold mb-4"
            style={{ color: '#1A1612' }}
          >
            Select Store
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              placeholder="e.g. my-optics-store"
              className="flex-1 px-3 py-2 text-sm font-sans border outline-none focus:ring-1"
              style={{
                borderColor: '#DDD8CE',
                borderRadius: 2,
                backgroundColor: '#FDFAF4',
                color: '#1A1612',
              }}
              aria-label="Store ID"
            />
            <button
              onClick={handleLoad}
              disabled={!storeId || status === 'loading'}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-sans font-semibold uppercase tracking-wider border transition-opacity disabled:opacity-40"
              style={{
                borderColor: '#C9A96E',
                color: '#C9A96E',
                borderRadius: 2,
                letterSpacing: '0.12em',
              }}
              aria-label="Load store catalog"
            >
              {status === 'loading' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              Load
            </button>
          </div>
          <p
            className="mt-1 text-xs font-sans"
            style={{ color: '#6B6560' }}
          >
            Enter a Store ID and click Load to manage its frame catalog.
          </p>
        </section>

        {/* ── Status message ────────────────────────────────────────────── */}
        {statusMessage && (
          <div
            className="mb-6 flex items-center gap-2 px-3 py-2 text-sm font-sans border"
            style={{
              borderRadius: 2,
              backgroundColor:
                status === 'success'
                  ? 'rgba(201,169,110,0.08)'
                  : status === 'error'
                    ? 'rgba(220,38,38,0.06)'
                    : 'transparent',
              borderColor:
                status === 'success'
                  ? '#C9A96E'
                  : status === 'error'
                    ? '#DC2626'
                    : '#DDD8CE',
              color: status === 'error' ? '#DC2626' : '#1A1612',
            }}
            role={status === 'error' ? 'alert' : 'status'}
          >
            {status === 'success' && (
              <CheckCircle size={16} style={{ color: '#C9A96E' }} />
            )}
            {status === 'error' && (
              <AlertCircle size={16} style={{ color: '#DC2626' }} />
            )}
            {(status === 'loading' || status === 'saving' || status === 'deleting') && (
              <Loader2 size={16} className="animate-spin" style={{ color: '#C9A96E' }} />
            )}
            {statusMessage}
          </div>
        )}

        {/* ── Add Frame Form (shown only when store is loaded) ──────────── */}
        {loadedStoreId && (
          <section
            className="mb-8 p-6 border"
            style={{
              backgroundColor: '#FDFAF4',
              borderColor: '#DDD8CE',
              borderRadius: 2,
            }}
          >
            <h2
              className="font-serif text-lg font-semibold mb-4"
              style={{ color: '#1A1612' }}
            >
              Add Frame
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="frame-name"
                  className="block text-xs font-sans font-semibold uppercase mb-1"
                  style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
                >
                  Name *
                </label>
                <input
                  id="frame-name"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Heritage Round"
                  className="w-full px-3 py-2 text-sm font-sans border outline-none focus:ring-1"
                  style={{
                    borderColor: '#DDD8CE',
                    borderRadius: 2,
                    backgroundColor: '#FDFAF4',
                    color: '#1A1612',
                  }}
                />
              </div>

              {/* Style */}
              <div>
                <label
                  htmlFor="frame-style"
                  className="block text-xs font-sans font-semibold uppercase mb-1"
                  style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
                >
                  Style
                </label>
                <select
                  id="frame-style"
                  value={formStyle}
                  onChange={(e) => setFormStyle(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-sans border outline-none focus:ring-1"
                  style={{
                    borderColor: '#DDD8CE',
                    borderRadius: 2,
                    backgroundColor: '#FDFAF4',
                    color: '#1A1612',
                  }}
                >
                  {STYLE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Base Preset */}
              <div>
                <label
                  htmlFor="frame-preset"
                  className="block text-xs font-sans font-semibold uppercase mb-1"
                  style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
                >
                  Base Preset *
                </label>
                <select
                  id="frame-preset"
                  value={formPreset}
                  onChange={(e) => setFormPreset(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-sans border outline-none focus:ring-1"
                  style={{
                    borderColor: '#DDD8CE',
                    borderRadius: 2,
                    backgroundColor: '#FDFAF4',
                    color: '#1A1612',
                  }}
                >
                  {PRESET_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="frame-price"
                  className="block text-xs font-sans font-semibold uppercase mb-1"
                  style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
                >
                  Price
                </label>
                <input
                  id="frame-price"
                  type="text"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="e.g. $149.99"
                  className="w-full px-3 py-2 text-sm font-sans border outline-none focus:ring-1"
                  style={{
                    borderColor: '#DDD8CE',
                    borderRadius: 2,
                    backgroundColor: '#FDFAF4',
                    color: '#1A1612',
                  }}
                />
              </div>

              {/* SKU */}
              <div>
                <label
                  htmlFor="frame-sku"
                  className="block text-xs font-sans font-semibold uppercase mb-1"
                  style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
                >
                  SKU
                </label>
                <input
                  id="frame-sku"
                  type="text"
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  placeholder="e.g. FR-001-BLK"
                  className="w-full px-3 py-2 text-sm font-sans border outline-none focus:ring-1"
                  style={{
                    borderColor: '#DDD8CE',
                    borderRadius: 2,
                    backgroundColor: '#FDFAF4',
                    color: '#1A1612',
                  }}
                />
              </div>

              {/* Color */}
              <div>
                <label
                  htmlFor="frame-color"
                  className="block text-xs font-sans font-semibold uppercase mb-1"
                  style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
                >
                  Color Override
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="frame-color"
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    placeholder="#C9A96E"
                    className="flex-1 px-3 py-2 text-sm font-sans border outline-none focus:ring-1"
                    style={{
                      borderColor: '#DDD8CE',
                      borderRadius: 2,
                      backgroundColor: '#FDFAF4',
                      color: '#1A1612',
                    }}
                  />
                  {/^#[0-9a-fA-F]{6}$/.test(formColor) && (
                    <div
                      className="w-8 h-8 border flex-shrink-0"
                      style={{
                        backgroundColor: formColor,
                        borderColor: '#DDD8CE',
                        borderRadius: 2,
                      }}
                      aria-label={`Color preview: ${formColor}`}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Add button */}
            <button
              onClick={handleAdd}
              disabled={!formName.trim() || status === 'saving'}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-sans font-semibold uppercase tracking-wider transition-opacity disabled:opacity-40"
              style={{
                backgroundColor: '#1A1612',
                color: '#F5F0E8',
                borderRadius: 2,
                letterSpacing: '0.12em',
              }}
              aria-label="Add frame to catalog"
            >
              {status === 'saving' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              {status === 'saving' ? 'Adding...' : 'Add Frame'}
            </button>
          </section>
        )}

        {/* ── Frame List (shown only when store is loaded) ──────────────── */}
        {loadedStoreId && (
          <section
            className="p-6 border"
            style={{
              backgroundColor: '#FDFAF4',
              borderColor: '#DDD8CE',
              borderRadius: 2,
            }}
          >
            <h2
              className="font-serif text-lg font-semibold mb-4"
              style={{ color: '#1A1612' }}
            >
              Catalog Frames
              {frames.length > 0 && (
                <span
                  className="ml-2 text-xs font-sans font-semibold"
                  style={{ color: '#6B6560' }}
                >
                  ({frames.length})
                </span>
              )}
            </h2>

            {frames.length === 0 ? (
              <p
                className="text-sm font-sans italic py-4 text-center"
                style={{ color: '#6B6560' }}
              >
                No store frames yet. Add frames to your catalog.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {frames.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between px-4 py-3 border"
                    style={{
                      borderColor: '#DDD8CE',
                      borderRadius: 2,
                      backgroundColor: '#F5F0E8',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="font-serif text-sm font-semibold truncate"
                          style={{ color: '#1A1612' }}
                        >
                          {f.name}
                        </span>
                        {f.colorHex && (
                          <div
                            className="w-3.5 h-3.5 flex-shrink-0 border"
                            style={{
                              backgroundColor: f.colorHex,
                              borderColor: '#DDD8CE',
                              borderRadius: '50%',
                            }}
                            aria-label={`Color: ${f.colorHex}`}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-sans" style={{ color: '#6B6560' }}>
                        <span>{f.style}</span>
                        <span>{f.basePresetId}</span>
                        {f.price && <span>{f.price}</span>}
                        {f.sku && <span>SKU: {f.sku}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(f.id, f.name)}
                      disabled={status === 'deleting'}
                      className="flex-shrink-0 p-2 transition-opacity hover:opacity-70 disabled:opacity-40"
                      style={{ color: '#DC2626' }}
                      aria-label={`Delete ${f.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
