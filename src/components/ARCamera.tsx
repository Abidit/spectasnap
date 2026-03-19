'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Download } from 'lucide-react';
import type { GlassesFrame } from '@/lib/glasses-data';
import { drawGlassesOnCanvas, preloadGlassesImage } from '@/lib/face-overlay';
import ThreeOverlay from '@/components/ThreeOverlay';
import { computeTransform, smooth, type FaceTransform } from '@/ar/pose';
import type { ColorVariant } from '@/lib/glasses-data';

type Status = 'idle' | 'requesting' | 'loading-mp' | 'ready' | 'no-face' | 'error';

interface ARCameraProps {
  selectedGlasses: GlassesFrame;
  selectedColor?: ColorVariant | null;
}

const MEDIAPIPE_WASM =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MEDIAPIPE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

const FACE_HOLD_MS = 500; // hold last position this long after face disappears
const FACE_FADE_MS = 300; // then fade to transparent over this duration

// Suppress MediaPipe/TFLite internal INFO logs that surface via console.error
// (e.g. "Created TensorFlow Lite XNNPACK delegate for CPU")
if (typeof window !== 'undefined') {
  const _origError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    const msg = String(args[0] ?? '');
    if (msg.includes('TensorFlow Lite') || msg.includes('XNNPACK') || msg.includes('Created TensorFlow')) return;
    _origError(...args);
  };
}

export default function ARCamera({ selectedGlasses, selectedColor }: ARCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<import('@mediapipe/tasks-vision').FaceLandmarker | null>(null);
  const rafRef = useRef<number>(0);
  const glassesImgRef = useRef<HTMLImageElement | null>(null);
  const lastFrameTimeRef = useRef<number>(-1);
  const smoothedTransformRef = useRef<FaceTransform | null>(null);
  const threeSceneRef = useRef<typeof import('@/ar/threeScene') | null>(null);
  const faceLastSeenRef = useRef<number>(-Infinity);

  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [multipleFaces, setMultipleFaces] = useState(false);

  // Preload glasses image whenever selection changes
  useEffect(() => {
    glassesImgRef.current = null;
    preloadGlassesImage(selectedGlasses.svg)
      .then((img) => { glassesImgRef.current = img; })
      .catch(() => {});
  }, [selectedGlasses]);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    smoothedTransformRef.current = null;
    faceLastSeenRef.current = -Infinity;
  }, []);

  const renderLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !canvas || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas to video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Use video's own timestamp — detectForVideo requires a monotonically
    // increasing value tied to the media stream, not wall-clock time.
    const videoTimestampMs = video.currentTime * 1000;
    if (videoTimestampMs === lastFrameTimeRef.current) {
      // Same video frame — nothing new to detect, skip
      rafRef.current = requestAnimationFrame(renderLoop);
      return;
    }
    lastFrameTimeRef.current = videoTimestampMs;

    const now = performance.now();

    // Draw mirrored video frame
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    // Detect face landmarks (video mode uses timestamp)
    try {
      const result = landmarker.detectForVideo(video, videoTimestampMs);

      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        faceLastSeenRef.current = now;
        setFaceDetected(true);
        setMultipleFaces(result.faceLandmarks.length > 1);

        const img = glassesImgRef.current;
        if (img) {
          drawGlassesOnCanvas(
            ctx,
            result.faceLandmarks[0],
            img,
            selectedGlasses,
            canvas.width,
            canvas.height,
          );
        }

        // ── 3-D glasses tracking ─────────────────────────────────────────
        const raw = computeTransform(result.faceLandmarks[0], canvas.width, canvas.height);
        const prev = smoothedTransformRef.current ?? raw;
        // position/scale lerp 0.15, rotation lerp 0.11 (50% less jitter)
        const smoothed = smooth(prev, raw, 0.15, 0.11);
        smoothedTransformRef.current = smoothed;
        threeSceneRef.current?.applyFaceTransform(smoothed, canvas.width, canvas.height);
        threeSceneRef.current?.updateFaceOccluder(result.faceLandmarks[0], canvas.width, canvas.height);
        threeSceneRef.current?.updateTempleExtensions(result.faceLandmarks[0], smoothed, canvas.width, canvas.height);

        // Yaw fade: smoothly fade glasses past ~24°, fully gone by ~33° (just under YAW_MAX)
        const absYaw = Math.abs(smoothed.yaw);
        if (absYaw > 0.42) {
          const fade = 1 - (absYaw - 0.42) / 0.16;
          threeSceneRef.current?.setModelOpacity(Math.max(0, fade));
        } else {
          threeSceneRef.current?.setModelOpacity(1);
        }
      } else {
        setFaceDetected(false);
        setMultipleFaces(false);
        threeSceneRef.current?.clearFaceOccluder();
        threeSceneRef.current?.clearTempleExtensions();

        // ── Stability: hold 500 ms, then fade over 300 ms ─────────────────
        const elapsed = now - faceLastSeenRef.current;
        if (elapsed < FACE_HOLD_MS + FACE_FADE_MS && smoothedTransformRef.current) {
          threeSceneRef.current?.applyFaceTransform(
            smoothedTransformRef.current,
            canvas.width,
            canvas.height,
          );
          const opacity = elapsed < FACE_HOLD_MS
            ? 1
            : 1 - (elapsed - FACE_HOLD_MS) / FACE_FADE_MS;
          threeSceneRef.current?.setModelOpacity(opacity);
        } else {
          threeSceneRef.current?.setModelOpacity(0);
        }
      }
    } catch {
      // Detection may fail on first frames; keep looping
    }

    rafRef.current = requestAnimationFrame(renderLoop);
  }, [selectedGlasses]);

  const startCamera = useCallback(async () => {
    setStatus('requesting');
    setErrorMsg('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg('Camera access denied. Please allow camera permissions and reload.');
      return;
    }

    // Load MediaPipe
    setStatus('loading-mp');
    try {
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const filesetResolver = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM);
      landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: MEDIAPIPE_MODEL,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 3,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });
    } catch {
      // Fallback to CPU if GPU delegate fails
      try {
        const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
        const filesetResolver = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM);
        landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: MEDIAPIPE_MODEL,
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numFaces: 3,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });
      } catch (err2) {
        setStatus('error');
        setErrorMsg('Failed to load face tracking model. Check your connection and try again.');
        return;
      }
    }

    // Pre-load the Three.js scene module so applyFaceTransform is available
    // from the first rendered frame (non-blocking; overlay init runs in parallel).
    threeSceneRef.current = await import('@/ar/threeScene');

    // URL debug flags: ?debugOcclusion=1  ?debugTemples=1
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('debugOcclusion') === '1') threeSceneRef.current.setOcclusionDebug(true);
      if (params.get('debugTemples')   === '1') threeSceneRef.current.setTempleExtensionDebug(true);
    }

    setStatus('ready');
    rafRef.current = requestAnimationFrame(renderLoop);
  }, [renderLoop]);

  // Restart loop when glasses change (re-bind renderLoop closure)
  useEffect(() => {
    if (status === 'ready') {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(renderLoop);
    }
  }, [renderLoop, status]);

  useEffect(() => {
    if (status !== 'ready') return;
    void threeSceneRef.current?.selectModel(selectedGlasses.id);
  }, [selectedGlasses.id, status]);

  useEffect(() => {
    if (!selectedColor || status !== 'ready') return;
    threeSceneRef.current?.setModelColor(selectedColor.frameHex, selectedColor.lensHex);
  }, [selectedColor, status]);

  const takeSnapshot = useCallback(() => {
    const videoCanvas = canvasRef.current;
    if (!videoCanvas) return;

    const out = document.createElement('canvas');
    out.width = videoCanvas.width;
    out.height = videoCanvas.height;
    const ctx = out.getContext('2d');
    if (!ctx) return;

    // Layer 1: mirrored camera feed
    ctx.drawImage(videoCanvas, 0, 0);

    // Layer 2: Three.js WebGL overlay
    const threeCanvas = threeSceneRef.current?.getCanvas?.();
    if (threeCanvas) {
      ctx.drawImage(threeCanvas, 0, 0, out.width, out.height);
    }

    // Watermark
    const padding = Math.round(out.width * 0.012);
    const fontSize = Math.round(out.width * 0.018);
    ctx.font = `600 ${fontSize}px DM Sans, sans-serif`;
    ctx.fillStyle = 'rgba(201,169,110,0.92)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('SpectaSnap AR', out.width - padding, out.height - padding);

    out.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spectasnap-${Date.now()}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
      },
      'image/jpeg',
      0.92,
    );
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      landmarkerRef.current?.close();
    };
  }, [stopCamera]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-brand-camera overflow-hidden">
      {/* Hidden video element — actual rendering goes to canvas */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
      />

      {/* Canvas — shows mirrored camera + glasses overlay */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        style={{ display: status === 'ready' ? 'block' : 'none' }}
      />

      {/* Three.js WebGL overlay — transparent, on top of 2D canvas */}
      <ThreeOverlay enabled={status === 'ready'} />

      {/* Idle / permission prompt */}
      <AnimatePresence>
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-brand-camera"
          >
            {/* Gold corner marks — AR viewport spec */}
            <div className="absolute inset-5 pointer-events-none" style={{ opacity: 0.4 }}>
              <div className="absolute top-0 left-0">
                <div style={{ width: 22, height: 2, backgroundColor: '#C9A96E' }} />
                <div style={{ width: 2, height: 22, backgroundColor: '#C9A96E' }} />
              </div>
              <div className="absolute top-0 right-0 flex flex-col items-end">
                <div style={{ width: 22, height: 2, backgroundColor: '#C9A96E' }} />
                <div style={{ width: 2, height: 22, backgroundColor: '#C9A96E' }} />
              </div>
              <div className="absolute bottom-0 left-0 flex flex-col justify-end">
                <div style={{ width: 2, height: 22, backgroundColor: '#C9A96E' }} />
                <div style={{ width: 22, height: 2, backgroundColor: '#C9A96E' }} />
              </div>
              <div className="absolute bottom-0 right-0 flex flex-col items-end justify-end">
                <div style={{ width: 2, height: 22, backgroundColor: '#C9A96E' }} />
                <div style={{ width: 22, height: 2, backgroundColor: '#C9A96E' }} />
              </div>
            </div>

            <p
              className="font-sans tracking-[0.3em] uppercase text-[10px]"
              style={{ color: '#C9A96E' }}
            >
              SpectaSnap AR
            </p>

            <div className="text-center px-8">
              <h2 className="font-serif text-4xl font-semibold text-white leading-tight mb-3">
                Try On Your<br />Perfect Pair
              </h2>
              <p className="text-white/50 text-sm font-sans max-w-[240px] mx-auto leading-relaxed">
                Real-time 3D fitting powered by face tracking. No download needed.
              </p>
            </div>

            <button
              onClick={startCamera}
              className="px-8 py-3.5 font-sans font-semibold text-sm tracking-widest uppercase
                         transition-colors hover:opacity-90 active:scale-[0.98]"
              style={{ borderRadius: 2, backgroundColor: '#C9A96E', color: '#1A1612' }}
            >
              Enable Camera
            </button>

            <p className="text-white/25 text-[10px] font-sans tracking-wide">
              Camera stays private — never stored or shared
            </p>
          </motion.div>
        )}

        {/* Loading states */}
        {(status === 'requesting' || status === 'loading-mp') && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-brand-camera"
          >
            <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
            <p className="text-zinc-300 text-sm font-sans">
              {status === 'requesting' ? 'Accessing camera…' : 'Loading face tracking model…'}
            </p>
            {status === 'loading-mp' && (
              <p className="text-zinc-500 text-xs font-sans">First load may take a few seconds</p>
            )}
          </motion.div>
        )}

        {/* Error */}
        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-brand-camera px-8"
          >
            <div
              className="w-14 h-14 flex items-center justify-center border border-red-800"
              style={{ backgroundColor: 'rgb(69,10,10)', borderRadius: 2 }}
            >
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <p className="text-red-300 text-sm font-sans text-center max-w-xs">{errorMsg}</p>
            <button
              onClick={startCamera}
              className="px-6 py-2.5 font-sans font-medium text-sm text-zinc-200
                         border border-zinc-700 hover:border-brand-gold transition-colors"
              style={{ borderRadius: 2 }}
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multiple faces warning */}
      {status === 'ready' && multipleFaces && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10
                     bg-amber-900/80 backdrop-blur-sm border border-amber-600/50
                     px-4 py-1.5 text-amber-300 text-xs font-sans font-medium"
          style={{ borderRadius: 2 }}
        >
          Multiple faces — tracking primary
        </div>
      )}

      {/* Face guide overlay — shown only when camera is ready */}
      {status === 'ready' && !faceDetected && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div
            className="border-2 border-dashed border-brand-gold/40 rounded-[50%]"
            style={{ width: '45%', height: '70%' }}
          />
          <p className="absolute bottom-[18%] text-brand-gold/60 text-sm font-sans font-medium tracking-wide">
            Position your face in the frame
          </p>
        </div>
      )}

      {/* Live badge */}
      {status === 'ready' && faceDetected && (
        <div
          className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm
                     border border-white/10 px-3 py-1.5"
          style={{ borderRadius: 2 }}
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/80 text-xs font-sans font-medium">AR Live</span>
        </div>
      )}

      {/* Snapshot button — visible when tracking active */}
      {status === 'ready' && faceDetected && (
        <button
          onClick={takeSnapshot}
          className="absolute bottom-[100px] right-4 z-10 flex items-center gap-2
                     bg-black/60 backdrop-blur-sm border border-white/15
                     px-4 text-white/80 text-xs font-sans font-medium
                     hover:border-brand-gold hover:text-brand-gold transition-colors"
          style={{ borderRadius: 2, minHeight: 44 }}
          title="Save look"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Save Look</span>
        </button>
      )}
    </div>
  );
}
