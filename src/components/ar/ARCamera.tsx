'use client';

import { useEffect, useRef, useState, useCallback, type RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Download, Share2 } from 'lucide-react';
import type { GlassesFrame } from '@/lib/glasses-data';
import { drawGlassesOnCanvas, preloadGlassesImage } from '@/lib/face-overlay';
import ThreeOverlay from '@/components/ar/ThreeOverlay';
import { computeTransform, smoothKalman, createKalmanBank, computeFaceShape, type FaceTransform, type KalmanBank } from '@/ar/pose';
import { createPDMeasurer, type PDMeasurement, type PDMeasurer } from '@/ar/pdMeasure';
import { drawPDOverlay } from '@/ar/pdOverlay';
import type { ColorVariant } from '@/lib/glasses-data';
import type { LensTint } from '@/ar/presets';
import { loadCustomFrame } from '@/ar/customFrameLoader';
import { updateGlassesGlare } from '@/ar/proceduralGlasses';
import type { ARStatusKind } from '@/components/ar/ARStatusBadge';
import { createGlassesDetector, type GlassesDetector } from '@/ar/glassesDetector';
import { inpaintGlasses } from '@/ar/inpaint';
import { ARRecorder, type RecordingState, type RecordingResult } from '@/ar/recorder';

type Status = 'idle' | 'requesting' | 'loading-mp' | 'ready' | 'no-face' | 'error';

interface ARCameraProps {
  selectedGlasses: GlassesFrame;
  selectedColor?: ColorVariant | null;
  /** Lens tint variant to apply. */
  selectedTint?: LensTint | null;
  /** Called whenever the AR tracking state changes so parents can surface it. */
  onARStatusChange?: (status: ARStatusKind) => void;
  /** Called once with the detected face shape when a face is first tracked. */
  onFaceShapeDetected?: (shape: string) => void;
  /**
   * Pass a MutableRefObject — ARCamera will set its `.current` to a function
   * that returns a composite JPEG dataUrl (camera + 3D glasses + watermark).
   * Used by ShareModal to capture the current look.
   */
  captureRef?: RefObject<(() => string | null) | null>;
  /** When true, PD measurement runs each frame in the detection loop. */
  pdMeasuring?: boolean;
  /** Called with each PD measurement update while pdMeasuring is true. */
  onPDMeasured?: (pd: PDMeasurement) => void;
  /** Latest stable PD measurement — included in session analytics payload. */
  pdMeasurement?: PDMeasurement | null;
  /** Frame IDs saved to the compare tray — included in session analytics payload. */
  comparedFrames?: string[];
  /** Whether to detect and inpaint existing glasses before AR overlay. */
  glassesRemoval?: boolean;
  /** Whether recording is active. */
  recording?: boolean;
  /** Called whenever the recording state changes. */
  onRecordingStateChange?: (state: RecordingState) => void;
  /** Called when recording completes with the result blob/url. */
  onRecordingComplete?: (result: RecordingResult) => void;
}

const MEDIAPIPE_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MEDIAPIPE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

const FACE_HOLD_MS = 500; // hold last position this long after face disappears
const FACE_FADE_MS = 300; // then fade to transparent over this duration

// Suppress MediaPipe/TFLite internal INFO logs that surface via console.error
if (typeof window !== 'undefined') {
  const _origError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    const msg = String(args[0] ?? '');
    if (
      msg.includes('TensorFlow Lite') ||
      msg.includes('XNNPACK') ||
      msg.includes('Created TensorFlow')
    )
      return;
    _origError(...args);
  };
}

export default function ARCamera({ selectedGlasses, selectedColor, selectedTint, onARStatusChange, onFaceShapeDetected, captureRef, pdMeasuring, onPDMeasured, pdMeasurement, comparedFrames, glassesRemoval, recording, onRecordingStateChange, onRecordingComplete }: ARCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<import('@mediapipe/tasks-vision').FaceLandmarker | null>(null);
  const rafRef = useRef<number>(0);
  const glassesImgRef = useRef<HTMLImageElement | null>(null);
  const lastFrameTimeRef = useRef<number>(-1);
  const MAX_FACES = 3;
  const smoothedTransformsRef = useRef<(FaceTransform | null)[]>([null, null, null]);
  const kalmanBanksRef = useRef<(KalmanBank | null)[]>([null, null, null]);
  const threeSceneRef = useRef<typeof import('@/ar/threeScene') | null>(null);
  const facesLastSeenRef = useRef<number[]>([-Infinity, -Infinity, -Infinity]);
  const faceShapeDetectedRef = useRef(false);
  const pdMeasurerRef = useRef<PDMeasurer | null>(null);
  const pdMeasurementRef = useRef<PDMeasurement | null>(null);
  const comparedFramesRef = useRef<string[]>([]);
  const glassesDetectorRef = useRef<GlassesDetector | null>(null);
  const recorderRef = useRef<ARRecorder | null>(null);
  const sessionRef = useRef<{
    store: string;
    faceShape: string | null;
    framesTried: string[];
    startTime: number;
  } | null>(null);

  // Keep refs in sync with latest prop values
  pdMeasurementRef.current = pdMeasurement ?? null;
  comparedFramesRef.current = comparedFrames ?? [];

  const prefersReducedMotionRef = useRef(false);

  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [detectedFaceShape, setDetectedFaceShape] = useState<string | null>(null);
  const [arAnnouncement, setArAnnouncement] = useState('');

  // Detect prefers-reduced-motion once on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // Update screen reader announcement when AR status changes
  useEffect(() => {
    if (status === 'idle') setArAnnouncement('');
    else if (status === 'requesting') setArAnnouncement('Starting camera');
    else if (status === 'loading-mp') setArAnnouncement('Loading AR engine');
    else if (status === 'error') setArAnnouncement('Camera error');
    else if (status === 'ready' && faceDetected) setArAnnouncement('Face detected, AR tracking active');
    else if (status === 'ready' && !faceDetected) setArAnnouncement('No face detected, position your face in the frame');
  }, [status, faceDetected]);

  // Preload glasses image whenever selection changes
  useEffect(() => {
    glassesImgRef.current = null;
    preloadGlassesImage(selectedGlasses.svg)
      .then((img) => {
        glassesImgRef.current = img;
      })
      .catch(() => {});
  }, [selectedGlasses]);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    smoothedTransformsRef.current = [null, null, null];
    kalmanBanksRef.current = [null, null, null];
    facesLastSeenRef.current = [-Infinity, -Infinity, -Infinity];
    pdMeasurerRef.current?.reset();
    pdMeasurerRef.current = null;
    glassesDetectorRef.current?.reset();
    glassesDetectorRef.current = null;
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

    const videoTimestampMs = video.currentTime * 1000;
    if (videoTimestampMs === lastFrameTimeRef.current) {
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

    // Detect face landmarks
    try {
      const result = landmarker.detectForVideo(video, videoTimestampMs);

      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const faceCount = Math.min(result.faceLandmarks.length, MAX_FACES);
        setFaceDetected(true);
        setMultipleFaces(faceCount > 1);

        for (let fi = 0; fi < faceCount; fi++) {
          const landmarks = result.faceLandmarks[fi];
          facesLastSeenRef.current[fi] = now;

          // ── PRIMARY FACE ONLY (fi === 0) ──────────────────────────────────
          if (fi === 0) {
            if (!faceShapeDetectedRef.current) {
              faceShapeDetectedRef.current = true;
              const shape = computeFaceShape(landmarks);
              setDetectedFaceShape(shape);

              const store =
                typeof window !== 'undefined'
                  ? new URLSearchParams(window.location.search).get('store') || 'default'
                  : 'default';
              sessionRef.current = {
                store,
                faceShape: shape,
                framesTried: [],
                startTime: Date.now(),
              };
            }

            if (sessionRef.current) {
              const id = selectedGlasses.id;
              if (!sessionRef.current.framesTried.includes(id)) {
                sessionRef.current.framesTried.push(id);
              }
            }

            if (glassesRemoval) {
              if (!glassesDetectorRef.current) {
                glassesDetectorRef.current = createGlassesDetector();
              }
              const wearing = glassesDetectorRef.current.detect(landmarks);
              if (wearing) {
                inpaintGlasses(ctx, landmarks, canvas.width, canvas.height);
              }
            }

            const img = glassesImgRef.current;
            if (img) {
              drawGlassesOnCanvas(ctx, landmarks, img, selectedGlasses, canvas.width, canvas.height);
            }

            if (pdMeasuring && onPDMeasured) {
              if (!pdMeasurerRef.current) pdMeasurerRef.current = createPDMeasurer();
              const pd = pdMeasurerRef.current.update(landmarks, canvas.width, canvas.height);
              onPDMeasured(pd);
              drawPDOverlay(ctx, landmarks, canvas.width, canvas.height, pd.pdMm);
            }
          }

          // ── ALL FACES: 3-D glasses tracking ─────────────────────────────
          if (fi > 0) threeSceneRef.current?.ensureFaceSlot(fi);

          const raw = computeTransform(landmarks, canvas.width, canvas.height);
          if (!kalmanBanksRef.current[fi]) kalmanBanksRef.current[fi] = createKalmanBank();
          const smoothed = smoothKalman(kalmanBanksRef.current[fi]!, raw);
          smoothedTransformsRef.current[fi] = smoothed;

          threeSceneRef.current?.applyFaceTransformMulti(fi, smoothed, canvas.width, canvas.height);
          threeSceneRef.current?.updateFaceOccluderMulti(fi, landmarks, canvas.width, canvas.height);

          if (fi === 0) {
            threeSceneRef.current?.animateGLBTemples(landmarks, smoothed, canvas.width, canvas.height);
            // Update glare position with head pose for realistic glass sheen
            const activeModel = threeSceneRef.current?.getActiveModel?.();
            if (activeModel) updateGlassesGlare(activeModel, smoothed.yaw, smoothed.pitch);
          }

          // Yaw fade
          const absYaw = Math.abs(smoothed.yaw);
          if (absYaw > 0.42) {
            const fade = 1 - (absYaw - 0.42) / 0.16;
            threeSceneRef.current?.setFaceSlotOpacity(fi, Math.max(0, fade));
          } else {
            threeSceneRef.current?.setFaceSlotOpacity(fi, 1);
          }
        }

        // ── Clear disappeared faces ─────────────────────────────────────
        for (let fi = faceCount; fi < MAX_FACES; fi++) {
          if (prefersReducedMotionRef.current) {
            threeSceneRef.current?.setFaceSlotOpacity(fi, 0);
            threeSceneRef.current?.clearFaceSlot(fi);
          } else {
            const elapsed = now - facesLastSeenRef.current[fi];
            if (elapsed < FACE_HOLD_MS + FACE_FADE_MS && smoothedTransformsRef.current[fi]) {
              threeSceneRef.current?.applyFaceTransformMulti(
                fi, smoothedTransformsRef.current[fi]!, canvas.width, canvas.height
              );
              const opacity = elapsed < FACE_HOLD_MS
                ? 1
                : 1 - (elapsed - FACE_HOLD_MS) / FACE_FADE_MS;
              threeSceneRef.current?.setFaceSlotOpacity(fi, opacity);
            } else {
              threeSceneRef.current?.setFaceSlotOpacity(fi, 0);
              threeSceneRef.current?.clearFaceSlot(fi);
            }
          }
        }
      } else {
        setFaceDetected(false);
        setMultipleFaces(false);

        for (let fi = 0; fi < MAX_FACES; fi++) {
          if (fi === 0) threeSceneRef.current?.clearFaceOccluder();
          else threeSceneRef.current?.clearFaceSlot(fi);

          if (prefersReducedMotionRef.current) {
            threeSceneRef.current?.setFaceSlotOpacity(fi, 0);
          } else {
            const elapsed = now - facesLastSeenRef.current[fi];
            if (elapsed < FACE_HOLD_MS + FACE_FADE_MS && smoothedTransformsRef.current[fi]) {
              threeSceneRef.current?.applyFaceTransformMulti(
                fi, smoothedTransformsRef.current[fi]!, canvas.width, canvas.height
              );
              const opacity = elapsed < FACE_HOLD_MS
                ? 1
                : 1 - (elapsed - FACE_HOLD_MS) / FACE_FADE_MS;
              threeSceneRef.current?.setFaceSlotOpacity(fi, opacity);
            } else {
              threeSceneRef.current?.setFaceSlotOpacity(fi, 0);
            }
          }
        }
      }
    } catch {
      // Detection may fail on first frames; keep looping
    }

    rafRef.current = requestAnimationFrame(renderLoop);
  }, [selectedGlasses, pdMeasuring, onPDMeasured, glassesRemoval]);

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
    } catch {
      setStatus('error');
      setErrorMsg('Camera access denied. Please allow camera permissions and reload.');
      return;
    }

    setStatus('loading-mp');
    try {
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const filesetResolver = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM);
      landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: { modelAssetPath: MEDIAPIPE_MODEL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numFaces: 3,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });
    } catch {
      try {
        const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
        const filesetResolver = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM);
        landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: { modelAssetPath: MEDIAPIPE_MODEL, delegate: 'CPU' },
          runningMode: 'VIDEO',
          numFaces: 3,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });
      } catch {
        setStatus('error');
        setErrorMsg('Failed to load face tracking model. Check your connection and try again.');
        return;
      }
    }

    threeSceneRef.current = await import('@/ar/threeScene');

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('debugOcclusion') === '1') threeSceneRef.current.setOcclusionDebug(true);
    }

    setStatus('ready');
    rafRef.current = requestAnimationFrame(renderLoop);
  }, [renderLoop]);

  // Restart loop when glasses change
  useEffect(() => {
    if (status === 'ready') {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(renderLoop);
    }
  }, [renderLoop, status]);

  useEffect(() => {
    if (status !== 'ready') return;
    const scene = threeSceneRef.current;
    if (!scene) return;

    if (selectedGlasses.id.startsWith('custom-')) {
      const data = loadCustomFrame();
      if (!data) return;

      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (!scene.isReady()) {
          if (attempts >= 20) clearInterval(interval);
          return;
        }
        clearInterval(interval);
        const registeredId = scene.registerCustomFrame(data);
        void scene.selectModel(registeredId);
      }, 100);

      return () => clearInterval(interval);
    }

    void scene.selectModel(selectedGlasses.id);
  }, [selectedGlasses.id, status]);

  useEffect(() => {
    if (!selectedColor || status !== 'ready') return;
    threeSceneRef.current?.setModelColor(selectedColor.frameHex, selectedColor.lensHex);
  }, [selectedColor, status]);

  useEffect(() => {
    if (!selectedTint || status !== 'ready') return;
    threeSceneRef.current?.setLensTint(selectedTint);
  }, [selectedTint, status]);

  const takeSnapshot = useCallback(() => {
    const videoCanvas = canvasRef.current;
    if (!videoCanvas) return;

    const out = document.createElement('canvas');
    out.width = videoCanvas.width;
    out.height = videoCanvas.height;
    const ctx = out.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoCanvas, 0, 0);

    const threeCanvas = threeSceneRef.current?.getCanvas?.();
    if (threeCanvas) {
      ctx.drawImage(threeCanvas, 0, 0, out.width, out.height);
    }

    const padding = Math.round(out.width * 0.012);
    const fontSize = Math.round(out.width * 0.018);
    ctx.font = `600 ${fontSize}px Inter, sans-serif`;
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
      if (sessionRef.current) {
        const duration = Math.round((Date.now() - sessionRef.current.startTime) / 1000);
        const payload = {
          ...sessionRef.current,
          duration,
          pd: pdMeasurementRef.current?.stable ? pdMeasurementRef.current.pdMm : null,
          comparedFrames: comparedFramesRef.current,
        };
        fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => {});
        sessionRef.current = null;
      }
      stopCamera();
      landmarkerRef.current?.close();
    };
  }, [stopCamera]);

  // Expose composite snapshot function to parent via captureRef
  useEffect(() => {
    if (!captureRef) return;
    (captureRef as React.MutableRefObject<(() => string | null) | null>).current = () => {
      const videoCanvas = canvasRef.current;
      if (!videoCanvas) return null;

      const out = document.createElement('canvas');
      out.width = videoCanvas.width;
      out.height = videoCanvas.height;
      const ctx = out.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(videoCanvas, 0, 0);

      const threeCanvas = threeSceneRef.current?.getCanvas?.();
      if (threeCanvas) {
        ctx.drawImage(threeCanvas, 0, 0, out.width, out.height);
      }

      const w = out.width;
      const h = out.height;
      const size = Math.round(w * 0.038);
      ctx.font = `italic 600 ${size}px 'Cormorant Garamond', Georgia, serif`;
      ctx.fillStyle = 'rgba(245,240,232,0.9)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText('SpectaSnap', w - 14, h - 14);

      return out.toDataURL('image/jpeg', 0.92);
    };
    return () => {
      if (captureRef) {
        (captureRef as React.MutableRefObject<(() => string | null) | null>).current = null;
      }
    };
  }, [captureRef]);

  // Report AR status to parent
  useEffect(() => {
    if (!onARStatusChange) return;
    if (status === 'idle')                              onARStatusChange('idle');
    else if (status === 'requesting' || status === 'loading-mp') onARStatusChange('loading');
    else if (status === 'error')                        onARStatusChange('error');
    else if (status === 'ready' && faceDetected)        onARStatusChange('tracking');
    else if (status === 'ready' && !faceDetected)       onARStatusChange('searching');
  }, [status, faceDetected, onARStatusChange]);

  // Report detected face shape to parent (fires once per mount when first detected)
  useEffect(() => {
    if (detectedFaceShape && onFaceShapeDetected) {
      onFaceShapeDetected(detectedFaceShape);
    }
  }, [detectedFaceShape, onFaceShapeDetected]);

  // Handle recording prop changes
  useEffect(() => {
    if (!canvasRef.current) return;

    if (recording) {
      if (!recorderRef.current) {
        recorderRef.current = new ARRecorder({ maxDuration: 10, fps: 30 });
      }
      recorderRef.current.start(canvasRef.current, {
        onStateChange: onRecordingStateChange,
        onComplete: onRecordingComplete,
      });
    } else if (recorderRef.current?.getState() === 'recording') {
      recorderRef.current.stop();
    }
  }, [recording]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="relative w-full h-full flex items-center justify-center bg-dark overflow-hidden"
      aria-label="AR camera viewport with virtual glasses overlay"
    >
      {/* Visually hidden live region */}
      <span
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {arAnnouncement}
      </span>

      {/* Hidden video element */}
      <video ref={videoRef} className="hidden" playsInline muted autoPlay />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        style={{ display: status === 'ready' ? 'block' : 'none' }}
      />

      {/* Three.js WebGL overlay */}
      <ThreeOverlay enabled={status === 'ready'} />

      {/* Idle / permission prompt */}
      <AnimatePresence>
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-dark"
          >
            {/* Gold corner marks */}
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
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ backgroundColor: 'rgba(245,240,232,0.95)' }}
          >
            <p
              className="font-semibold text-ink-900 leading-none"
              style={{
                fontFamily: 'var(--font-cormorant-garamond, "Cormorant Garamond", Georgia, serif)',
                fontStyle: 'italic',
                fontSize: '1.4rem',
              }}
            >
              SpectaSnap
            </p>
            <p
              className="font-sans uppercase tracking-[2px] text-ink-500"
              style={{ fontSize: '0.75rem' }}
            >
              {status === 'requesting' ? 'Starting camera…' : 'Loading AR engine…'}
            </p>
            <div
              className="w-2 h-2 rounded-full mt-1"
              style={{
                backgroundColor: '#C9A96E',
                animation: 'spectasnap-pulse 1.5s ease-in-out infinite',
              }}
            />
            <style>{`
              @keyframes spectasnap-pulse {
                0%, 100% { opacity: 0.3; }
                50%       { opacity: 1; }
              }
            `}</style>
          </motion.div>
        )}

        {/* Error */}
        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-dark px-8"
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
                         border border-zinc-700 hover:border-gold-500 transition-colors"
              style={{ borderRadius: 2 }}
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multiple faces indicator */}
      {status === 'ready' && multipleFaces && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10
                        backdrop-blur-sm border px-4 py-1.5 text-xs font-medium font-sans"
          style={{
            backgroundColor: 'rgba(201,169,110,0.18)',
            borderColor: 'rgba(201,169,110,0.4)',
            color: '#C9A96E',
            borderRadius: 2,
          }}
        >
          Tracking multiple faces
        </div>
      )}

      {/* Face guide overlay */}
      {status === 'ready' && !faceDetected && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div
            className="border-2 border-dashed border-gold-500/40 rounded-[50%]"
            style={{ width: '45%', height: '70%' }}
          />
          <p className="absolute bottom-[18%] text-gold-500/60 text-sm font-sans font-medium tracking-wide">
            Position your face in the frame
          </p>
        </div>
      )}

      {/* Live badge */}
      {status === 'ready' && faceDetected && (
        <div
          className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm
                        border border-white/10 rounded-full px-3 py-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/80 text-xs font-sans font-medium">AR Live</span>
        </div>
      )}

      {/* Action buttons */}
      {status === 'ready' && faceDetected && (
        <div className="absolute bottom-[100px] right-4 z-10 flex flex-col gap-2">
          <button
            onClick={takeSnapshot}
            className="flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/15
                       px-4 text-white/80 text-xs font-sans font-medium
                       hover:border-gold-500 hover:text-gold-500 transition-colors"
            style={{ borderRadius: 2, minHeight: 44 }}
            title="Save look"
            aria-label="Save current look as image"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save Look</span>
          </button>
          <button
            onClick={() => {
              const text = encodeURIComponent(
                'Check out my new glasses look! Try SpectaSnap AR — real-time 3D try-on, no app needed: https://spectasnap-orpin.vercel.app/trydemo'
              );
              window.open(`https://wa.me/?text=${text}`, '_blank');
            }}
            className="flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/15
                       px-4 text-white/80 text-xs font-sans font-medium
                       hover:border-[#25D366] hover:text-[#25D366] transition-colors"
            style={{ borderRadius: 2, minHeight: 44 }}
            title="Share on WhatsApp"
            aria-label="Share on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      )}
    </div>
  );
}
