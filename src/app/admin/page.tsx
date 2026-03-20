'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Glasses,
  Copy,
  Check,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2,
  Download,
  Trash2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ContactMethod = 'whatsapp' | 'email' | 'none';
type FormStatus = 'idle' | 'saving' | 'saved' | 'error' | 'loading' | 'deleting';

interface StoreFormData {
  storeId: string;
  storeName: string;
  accentColor: string;
  contactMethod: ContactMethod;
  contactValue: string;
  showPD: boolean;
  frameSelection: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMBED_HOST = 'https://spectasnap-orpin.vercel.app';
const DEFAULT_ACCENT = '#C9A96E';
const STORE_ID_REGEX = /^[a-zA-Z0-9-]{3,50}$/;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminPage() {
  // ── Form state ──────────────────────────────────────────────────────────
  const [form, setForm] = useState<StoreFormData>({
    storeId: '',
    storeName: '',
    accentColor: DEFAULT_ACCENT,
    contactMethod: 'none',
    contactValue: '',
    showPD: false,
    frameSelection: '',
  });

  const [status, setStatus] = useState<FormStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [savedStoreId, setSavedStoreId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const updateField = <K extends keyof StoreFormData>(
    field: K,
    value: StoreFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isStoreIdValid = STORE_ID_REGEX.test(form.storeId);
  const isFormValid = isStoreIdValid && form.storeName.trim().length > 0;

  // ── Parse frame IDs from text ───────────────────────────────────────────
  const parseFrameIds = (raw: string): string[] | undefined => {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.toLowerCase() === 'all') return undefined;
    return trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  // ── Load existing config ────────────────────────────────────────────────
  const handleLoad = useCallback(async () => {
    if (!STORE_ID_REGEX.test(form.storeId)) {
      setStatus('error');
      setStatusMessage('Enter a valid Store ID first (3-50 alphanumeric characters or hyphens).');
      return;
    }

    setStatus('loading');
    setStatusMessage('Loading configuration...');

    try {
      const res = await fetch(
        `/api/store?store=${encodeURIComponent(form.storeId)}`,
      );
      const data = await res.json();

      if (data.ok && data.config) {
        const cfg = data.config;
        setForm({
          storeId: cfg.storeId,
          storeName: cfg.storeName ?? '',
          accentColor: cfg.accentColor ?? DEFAULT_ACCENT,
          contactMethod: cfg.contactMethod ?? 'none',
          contactValue: cfg.contactValue ?? '',
          showPD: cfg.showPD === true,
          frameSelection: cfg.allowedFrameIds?.join(', ') ?? '',
        });
        setSavedStoreId(cfg.storeId);
        setStatus('saved');
        setStatusMessage(`Loaded configuration for "${cfg.storeName}".`);
      } else {
        setStatus('error');
        setStatusMessage(data.error || 'Store configuration not found.');
      }
    } catch {
      setStatus('error');
      setStatusMessage('Network error -- could not reach the server.');
    }
  }, [form.storeId]);

  // ── Save config ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!isFormValid) return;

    setStatus('saving');
    setStatusMessage('Saving configuration...');

    try {
      const payload = {
        storeId: form.storeId,
        storeName: form.storeName.trim(),
        accentColor: form.accentColor || undefined,
        contactMethod: form.contactMethod,
        contactValue: form.contactValue.trim() || undefined,
        showPD: form.showPD,
        allowedFrameIds: parseFrameIds(form.frameSelection),
      };

      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.ok) {
        setSavedStoreId(form.storeId);
        setStatus('saved');
        setStatusMessage(`Configuration saved for "${form.storeName}".`);
      } else {
        setStatus('error');
        setStatusMessage(data.error || 'Failed to save configuration.');
      }
    } catch {
      setStatus('error');
      setStatusMessage('Network error -- could not reach the server.');
    }
  };

  // ── Delete config ───────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!savedStoreId) return;
    if (!confirm(`Delete configuration for "${form.storeName}"? This cannot be undone.`)) return;

    setStatus('deleting');
    setStatusMessage('Deleting configuration...');

    try {
      const res = await fetch(
        `/api/store?store=${encodeURIComponent(savedStoreId)}`,
        { method: 'DELETE' },
      );
      const data = await res.json();

      if (data.ok) {
        setSavedStoreId(null);
        setForm({
          storeId: '',
          storeName: '',
          accentColor: DEFAULT_ACCENT,
          contactMethod: 'none',
          contactValue: '',
          showPD: false,
          frameSelection: '',
        });
        setStatus('idle');
        setStatusMessage('Configuration deleted.');
      } else {
        setStatus('error');
        setStatusMessage(data.error || 'Failed to delete configuration.');
      }
    } catch {
      setStatus('error');
      setStatusMessage('Network error -- could not reach the server.');
    }
  };

  // ── Embed code generation ───────────────────────────────────────────────
  const embedCode = savedStoreId
    ? [
        `<script src="${EMBED_HOST}/embed.js"`,
        `  data-store="${savedStoreId}"`,
        form.frameSelection.trim() && form.frameSelection.trim().toLowerCase() !== 'all'
          ? `  data-frames="${parseFrameIds(form.frameSelection)?.join(',') ?? ''}"`
          : null,
        form.accentColor && form.accentColor !== DEFAULT_ACCENT
          ? `  data-accent="${form.accentColor}"`
          : null,
        `  data-width="100%"`,
        `  data-height="600px">`,
        `</script>`,
      ]
        .filter(Boolean)
        .join('\n')
    : null;

  const handleCopyEmbed = async () => {
    if (!embedCode) return;
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available — fail silently.
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
        <div className="flex items-center gap-2">
          <Settings size={16} style={{ color: '#C9A96E' }} />
          <h1
            className="font-serif text-lg font-semibold"
            style={{ color: '#1A1612' }}
          >
            Store Admin
          </h1>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-xs font-sans font-medium"
            style={{ color: '#6B6560', textDecoration: 'none' }}
            aria-label="Go to Dashboard"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/catalog"
            className="text-xs font-sans font-medium"
            style={{ color: '#6B6560', textDecoration: 'none' }}
            aria-label="Go to Frame Catalog"
          >
            Catalog
          </Link>
          <Link
            href="/admin/models"
            className="text-xs font-sans font-medium"
            style={{ color: '#6B6560', textDecoration: 'none' }}
            aria-label="Go to 3D Models"
          >
            3D Models
          </Link>
          <Link
            href="/trydemo"
            className="text-xs font-sans font-medium"
            style={{ color: '#6B6560', textDecoration: 'none' }}
            aria-label="Go to Try Demo"
          >
            Try Demo
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        {/* ── Store Configuration form ──────────────────────────────────── */}
        <section
          className="mb-8 p-6 border"
          style={{
            backgroundColor: '#FDFAF4',
            borderColor: '#DDD8CE',
            borderRadius: 2,
          }}
        >
          <h2
            className="font-serif text-lg font-semibold mb-6"
            style={{ color: '#1A1612' }}
          >
            Store Configuration
          </h2>

          {/* Store ID + Load button */}
          <div className="mb-4">
            <label
              htmlFor="store-id"
              className="block text-xs font-sans font-semibold uppercase mb-1"
              style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
            >
              Store ID
            </label>
            <div className="flex gap-2">
              <input
                id="store-id"
                type="text"
                value={form.storeId}
                onChange={(e) => updateField('storeId', e.target.value)}
                placeholder="e.g. my-optics-store"
                className="flex-1 px-3 py-2 text-sm font-sans border outline-none focus:ring-1"
                style={{
                  borderColor: '#DDD8CE',
                  borderRadius: 2,
                  backgroundColor: '#FDFAF4',
                  color: '#1A1612',
                }}
                aria-describedby="store-id-hint"
              />
              <button
                onClick={handleLoad}
                disabled={!form.storeId || status === 'loading'}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-sans font-semibold uppercase tracking-wider border transition-opacity disabled:opacity-40"
                style={{
                  borderColor: '#C9A96E',
                  color: '#C9A96E',
                  borderRadius: 2,
                  letterSpacing: '0.12em',
                }}
                aria-label="Load existing store configuration"
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
              id="store-id-hint"
              className="mt-1 text-xs font-sans"
              style={{ color: '#6B6560' }}
            >
              3-50 characters: letters, numbers, and hyphens only.
            </p>
          </div>

          {/* Store Name */}
          <div className="mb-4">
            <label
              htmlFor="store-name"
              className="block text-xs font-sans font-semibold uppercase mb-1"
              style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
            >
              Store Name
            </label>
            <input
              id="store-name"
              type="text"
              value={form.storeName}
              onChange={(e) => updateField('storeName', e.target.value)}
              placeholder="e.g. My Optics Store"
              className="w-full px-3 py-2 text-sm font-sans border outline-none focus:ring-1"
              style={{
                borderColor: '#DDD8CE',
                borderRadius: 2,
                backgroundColor: '#FDFAF4',
                color: '#1A1612',
              }}
            />
          </div>

          {/* Accent Color */}
          <div className="mb-4">
            <label
              htmlFor="accent-color"
              className="block text-xs font-sans font-semibold uppercase mb-1"
              style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
            >
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                id="accent-color"
                type="text"
                value={form.accentColor}
                onChange={(e) => updateField('accentColor', e.target.value)}
                placeholder="#C9A96E"
                className="flex-1 px-3 py-2 text-sm font-sans border outline-none focus:ring-1"
                style={{
                  borderColor: '#DDD8CE',
                  borderRadius: 2,
                  backgroundColor: '#FDFAF4',
                  color: '#1A1612',
                }}
              />
              <div
                className="w-9 h-9 border flex-shrink-0"
                style={{
                  backgroundColor: /^#[0-9a-fA-F]{6}$/.test(form.accentColor)
                    ? form.accentColor
                    : DEFAULT_ACCENT,
                  borderColor: '#DDD8CE',
                  borderRadius: 2,
                }}
                aria-label={`Color preview: ${form.accentColor}`}
              />
            </div>
            <p className="mt-1 text-xs font-sans" style={{ color: '#6B6560' }}>
              Hex color to override the default gold accent. Defaults to #C9A96E.
            </p>
          </div>

          {/* Contact Method */}
          <div className="mb-4">
            <span
              className="block text-xs font-sans font-semibold uppercase mb-2"
              style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
            >
              Contact Method
            </span>
            <div
              className="flex gap-4"
              role="radiogroup"
              aria-label="Contact method"
            >
              {(['whatsapp', 'email', 'none'] as const).map((method) => (
                <label
                  key={method}
                  className="flex items-center gap-2 cursor-pointer text-sm font-sans"
                  style={{ color: '#1A1612' }}
                >
                  <input
                    type="radio"
                    name="contactMethod"
                    value={method}
                    checked={form.contactMethod === method}
                    onChange={() => {
                      updateField('contactMethod', method);
                      if (method === 'none') updateField('contactValue', '');
                    }}
                    className="accent-[#C9A96E]"
                  />
                  {method === 'whatsapp'
                    ? 'WhatsApp'
                    : method === 'email'
                      ? 'Email'
                      : 'None'}
                </label>
              ))}
            </div>
          </div>

          {/* Contact Value (conditional) */}
          {form.contactMethod !== 'none' && (
            <div className="mb-4">
              <label
                htmlFor="contact-value"
                className="block text-xs font-sans font-semibold uppercase mb-1"
                style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
              >
                {form.contactMethod === 'whatsapp'
                  ? 'WhatsApp Number'
                  : 'Email Address'}
              </label>
              <input
                id="contact-value"
                type={form.contactMethod === 'email' ? 'email' : 'tel'}
                value={form.contactValue}
                onChange={(e) => updateField('contactValue', e.target.value)}
                placeholder={
                  form.contactMethod === 'whatsapp'
                    ? '+1 555 123 4567'
                    : 'store@example.com'
                }
                className="w-full px-3 py-2 text-sm font-sans border outline-none focus:ring-1"
                style={{
                  borderColor: '#DDD8CE',
                  borderRadius: 2,
                  backgroundColor: '#FDFAF4',
                  color: '#1A1612',
                }}
              />
            </div>
          )}

          {/* Show PD Measurement toggle */}
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <span
                className="relative inline-flex items-center"
                style={{ width: 40, height: 22 }}
              >
                <input
                  type="checkbox"
                  checked={form.showPD}
                  onChange={(e) => updateField('showPD', e.target.checked)}
                  className="sr-only peer"
                  aria-label="Enable PD measurement in embed"
                />
                <span
                  className="block w-full h-full border peer-focus:ring-1 transition-colors"
                  style={{
                    borderRadius: 2,
                    backgroundColor: form.showPD ? '#C9A96E' : '#DDD8CE',
                    borderColor: form.showPD ? '#A8844A' : '#DDD8CE',
                  }}
                />
                <span
                  className="absolute top-0.5 left-0.5 block transition-transform"
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 2,
                    backgroundColor: '#FDFAF4',
                    transform: form.showPD ? 'translateX(18px)' : 'translateX(0)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                />
              </span>
              <span className="text-sm font-sans" style={{ color: '#1A1612' }}>
                Show PD Measurement
              </span>
            </label>
            <p
              className="mt-1 text-xs font-sans ml-[52px]"
              style={{ color: '#6B6560' }}
            >
              When enabled, the embed will include pupillary distance measurement.
            </p>
          </div>

          {/* Frame Selection */}
          <div className="mb-6">
            <label
              htmlFor="frame-selection"
              className="block text-xs font-sans font-semibold uppercase mb-1"
              style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
            >
              Frame Selection
            </label>
            <textarea
              id="frame-selection"
              value={form.frameSelection}
              onChange={(e) => updateField('frameSelection', e.target.value)}
              placeholder='Comma-separated frame IDs, or leave blank for "all"'
              rows={3}
              className="w-full px-3 py-2 text-sm font-sans border outline-none focus:ring-1 resize-y"
              style={{
                borderColor: '#DDD8CE',
                borderRadius: 2,
                backgroundColor: '#FDFAF4',
                color: '#1A1612',
              }}
            />
            <p className="mt-1 text-xs font-sans" style={{ color: '#6B6560' }}>
              Leave blank or type &quot;all&quot; to include all 55 frames. Or provide
              specific IDs: frame-01, frame-02, frame-03
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!isFormValid || status === 'saving'}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-sans font-semibold uppercase tracking-wider transition-opacity disabled:opacity-40"
              style={{
                backgroundColor: '#1A1612',
                color: '#F5F0E8',
                borderRadius: 2,
                letterSpacing: '0.12em',
              }}
              aria-label="Save store configuration"
            >
              {status === 'saving' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle size={14} />
              )}
              {status === 'saving' ? 'Saving...' : 'Save Configuration'}
            </button>

            {savedStoreId && (
              <button
                onClick={handleDelete}
                disabled={status === 'deleting'}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-sans font-semibold uppercase tracking-wider border transition-opacity disabled:opacity-40"
                style={{
                  borderColor: '#DC2626',
                  color: '#DC2626',
                  borderRadius: 2,
                  letterSpacing: '0.08em',
                }}
                aria-label="Delete store configuration"
              >
                {status === 'deleting' ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Trash2 size={12} />
                )}
                Delete
              </button>
            )}
          </div>

          {/* Status message */}
          {statusMessage && (
            <div
              className="mt-4 flex items-center gap-2 px-3 py-2 text-sm font-sans border"
              style={{
                borderRadius: 2,
                backgroundColor:
                  status === 'saved'
                    ? 'rgba(201,169,110,0.08)'
                    : status === 'error'
                      ? 'rgba(220,38,38,0.06)'
                      : 'transparent',
                borderColor:
                  status === 'saved'
                    ? '#C9A96E'
                    : status === 'error'
                      ? '#DC2626'
                      : '#DDD8CE',
                color: status === 'error' ? '#DC2626' : '#1A1612',
              }}
              role={status === 'error' ? 'alert' : 'status'}
            >
              {status === 'saved' && (
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
        </section>

        {/* ── Embed Code Generator ──────────────────────────────────────── */}
        {savedStoreId && embedCode && (
          <section
            className="mb-8 p-6 border"
            style={{
              backgroundColor: '#FDFAF4',
              borderColor: '#DDD8CE',
              borderRadius: 2,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="font-serif text-lg font-semibold"
                style={{ color: '#1A1612' }}
              >
                Embed Code
              </h2>
              <span
                className="text-xs font-sans font-semibold uppercase"
                style={{ color: '#C9A96E', letterSpacing: '0.12em' }}
              >
                Store: {savedStoreId}
              </span>
            </div>

            <p
              className="text-sm font-sans mb-4"
              style={{ color: '#6B6560' }}
            >
              Copy this snippet and paste it into your website to embed the AR
              try-on widget.
            </p>

            <pre
              className="p-4 text-xs font-mono leading-relaxed overflow-x-auto border"
              style={{
                backgroundColor: '#1A1612',
                color: '#F5F0E8',
                borderColor: '#DDD8CE',
                borderRadius: 2,
              }}
            >
              {embedCode}
            </pre>

            <button
              onClick={handleCopyEmbed}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-xs font-sans font-semibold uppercase tracking-wider border transition-colors"
              style={{
                borderColor: copied ? '#C9A96E' : '#DDD8CE',
                color: copied ? '#C9A96E' : '#1A1612',
                backgroundColor: copied ? 'rgba(201,169,110,0.08)' : 'transparent',
                borderRadius: 2,
                letterSpacing: '0.12em',
              }}
              aria-label="Copy embed code to clipboard"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
