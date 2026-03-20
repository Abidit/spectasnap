'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { GLASSES_COLLECTION, type GlassesFrame } from '@/lib/glasses-data';
import GlassesGrid from '@/components/GlassesGrid';
import ErrorBoundary from '@/components/ErrorBoundary';
import OfflineBanner from '@/components/OfflineBanner';
import type { ARStatusKind } from '@/components/ARStatusBadge';
import { postToParent, createEmbedListener } from '@/lib/embedApi';

const ARCamera = dynamic(() => import('@/components/ARCamera'), { ssr: false });

export default function EmbedPage() {
  return (
    <Suspense>
      <EmbedContent />
    </Suspense>
  );
}

function EmbedContent() {
  const searchParams = useSearchParams();
  const accentColor = searchParams.get('accent') ?? null;
  const framesParam = searchParams.get('frames') ?? null;
  const storeParam = searchParams.get('store') ?? null;

  // State for store catalog frames
  const [catalogFrames, setCatalogFrames] = useState<GlassesFrame[]>([]);

  // State for store config / branding
  const [storeConfig, setStoreConfig] = useState<{
    storeName?: string;
    accentColor?: string;
    contactMethod?: string;
    contactValue?: string;
    showPD?: boolean;
  } | null>(null);

  // Fetch store catalog frames
  useEffect(() => {
    if (!storeParam) return;
    fetch(`/api/catalog?store=${encodeURIComponent(storeParam)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.frames)) {
          // Convert CatalogFrame to GlassesFrame
          const converted: GlassesFrame[] = data.frames.map((cf: { id: string; name: string; colorHex?: string; style: string; price?: string }) => ({
            id: cf.id,
            name: cf.name,
            color: cf.colorHex || '#C9A96E',
            style: cf.style,
            styleTag: 'STORE',
            bestFor: ['All face shapes'],
            occasions: ['Casual', 'Office'],
            staffNote: cf.price ? `${cf.price}` : 'Store exclusive frame.',
            svg: '',
            scaleFactor: 1.0,
            yOffset: 0,
            colorVariants: [],
          }));
          setCatalogFrames(converted);
        }
      })
      .catch(() => {}); // Silently fail
  }, [storeParam]);

  // Fetch store config for branding
  useEffect(() => {
    if (!storeParam) return;
    fetch(`/api/store?store=${encodeURIComponent(storeParam)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.config) {
          setStoreConfig(data.config);
        }
      })
      .catch(() => {});
  }, [storeParam]);

  // Filter GLASSES_COLLECTION if frames param is provided, merge catalog frames
  const availableFrames = useMemo<GlassesFrame[]>(() => {
    let base = GLASSES_COLLECTION;
    if (framesParam) {
      const ids = new Set(framesParam.split(',').map((s) => s.trim()).filter(Boolean));
      if (ids.size > 0) {
        const filtered = GLASSES_COLLECTION.filter((f) => ids.has(f.id));
        if (filtered.length > 0) base = filtered;
      }
    }
    // Prepend store catalog frames (they appear first with STORE badge)
    return [...catalogFrames, ...base];
  }, [framesParam, catalogFrames]);

  const [selected, setSelected] = useState<GlassesFrame>(availableFrames[0]);
  const [arStatus, setArStatus] = useState<ARStatusKind>('idle');
  const captureRef = useRef<(() => string | null) | null>(null);

  // Notify parent when selected frame changes
  const handleSelect = useCallback(
    (frame: GlassesFrame) => {
      setSelected(frame);
      postToParent({ type: 'spectasnap:frameChanged', frameId: frame.id, frameName: frame.name });
    },
    [],
  );

  // Notify parent that embed is ready
  useEffect(() => {
    postToParent({ type: 'spectasnap:ready' });
  }, []);

  // Listen for inbound postMessage commands from host page
  useEffect(() => {
    const cleanup = createEmbedListener({
      onSelectFrame: (frameId) => {
        const frame = availableFrames.find((f) => f.id === frameId);
        if (frame) {
          setSelected(frame);
          postToParent({ type: 'spectasnap:frameChanged', frameId: frame.id, frameName: frame.name });
        } else {
          postToParent({ type: 'spectasnap:error', message: `Frame "${frameId}" not found` });
        }
      },
      onGetSnapshot: () => {
        const dataUrl = captureRef.current?.();
        if (dataUrl) {
          postToParent({ type: 'spectasnap:snapshot', dataUrl });
        } else {
          postToParent({ type: 'spectasnap:error', message: 'Snapshot unavailable — camera may not be active' });
        }
      },
      onGetPD: () => {
        // PD measurement is not enabled in the embed widget
        postToParent({ type: 'spectasnap:pd', pdMm: null, stable: false });
      },
    });

    return cleanup;
  }, [availableFrames]);

  // Resolve effective accent — store config overrides URL param
  const effectiveAccent = storeConfig?.accentColor || (accentColor ? `#${accentColor.replace(/^#/, '')}` : null);

  // Build contact href for the "Contact Store" button
  const contactHref = (() => {
    if (!storeConfig || storeConfig.contactMethod === 'none' || !storeConfig.contactValue) return null;
    const frameName = encodeURIComponent(selected.name);
    if (storeConfig.contactMethod === 'whatsapp') {
      const phone = storeConfig.contactValue.replace(/[^0-9+]/g, '');
      return `https://wa.me/${phone}?text=I'm%20interested%20in%20${frameName}`;
    }
    if (storeConfig.contactMethod === 'email') {
      return `mailto:${storeConfig.contactValue}?subject=Inquiry about ${selected.name}`;
    }
    return null;
  })();

  return (
    <div
      className="relative bg-brand-camera"
      style={{
        height: '100dvh',
        maxHeight: '100dvh',
        overflow: 'hidden',
        ...(effectiveAccent ? { '--embed-accent': effectiveAccent } as React.CSSProperties : {}),
      }}
    >
      <OfflineBanner />

      {/* Camera viewport — full area */}
      <div className="absolute inset-0">
        <ErrorBoundary label="AR camera failed to load. Please reload the page.">
          <ARCamera
            selectedGlasses={selected}
            onARStatusChange={setArStatus}
            captureRef={captureRef}
          />
        </ErrorBoundary>
      </div>

      {/* Glasses grid at bottom with gradient overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 pt-3"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom), 14px)',
          background:
            'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0) 100%)',
        }}
      >
        <GlassesGrid selected={selected} onSelect={handleSelect} />
      </div>

      {/* Contact Store button — shown when store has a contact method */}
      {contactHref && (
        <a
          href={contactHref}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute font-sans font-semibold"
          style={{
            bottom: 28,
            right: 12,
            fontSize: 11,
            padding: '6px 12px',
            borderRadius: 2,
            backgroundColor: 'rgba(10,10,10,0.72)',
            color: '#C9A96E',
            textDecoration: 'none',
            letterSpacing: '0.04em',
            zIndex: 20,
          }}
          aria-label="Contact store about this frame"
        >
          Contact Store
        </a>
      )}

      {/* Powered by watermark */}
      <div
        className="absolute bottom-1 right-2 font-sans select-none pointer-events-none"
        style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.04em',
        }}
      >
        {storeConfig?.storeName
          ? `Powered by SpectaSnap \u00B7 ${storeConfig.storeName}`
          : 'Powered by SpectaSnap'}
      </div>
    </div>
  );
}
