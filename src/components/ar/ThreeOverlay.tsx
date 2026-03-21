'use client';

import { useEffect, useRef, useCallback } from 'react';

interface ThreeOverlayProps {
  /** Only mount the WebGL canvas when the camera is live. */
  enabled: boolean;
}

/**
 * Transparent Three.js canvas layered on top of the camera viewport.
 *
 * This component lazily imports the threeScene module (keeps the main bundle
 * small) and manages the render-loop + resize lifecycle via React effects.
 */
export default function ThreeOverlay({ enabled }: ThreeOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<typeof import('@/ar/threeScene') | null>(null);
  const rafRef = useRef<number>(0);

  const loop = useCallback(() => {
    sceneRef.current?.renderFrame();
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  // ── Init / teardown ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    let disposed = false;

    (async () => {
      const mod = await import('@/ar/threeScene');
      if (disposed) return;

      sceneRef.current = mod;
      mod.initThreeOverlay(containerRef.current!);
      rafRef.current = requestAnimationFrame(loop);
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafRef.current);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [enabled, loop]);

  // ── Resize observer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          sceneRef.current?.resize(width, height);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
}
