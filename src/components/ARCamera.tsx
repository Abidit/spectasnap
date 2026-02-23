'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Loader2, AlertCircle } from 'lucide-react';
import { GLASSES_COLLECTION, type GlassesFrame } from '@/lib/glasses-data';
import { drawGlassesOnCanvas, preloadGlassesImage } from '@/lib/face-overlay';

type Status = 'idle' | 'requesting' | 'loading-mp' | 'ready' | 'no-face' | 'error';

interface ARCameraProps {
  selectedGlasses: GlassesFrame;
}

const MEDIAPIPE_WASM =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MEDIAPIPE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

export default function ARCamera({ selectedGlasses }: ARCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<import('@mediapipe/tasks-vision').FaceLandmarker | null>(null);
  const rafRef = useRef<number>(0);
  const glassesImgRef = useRef<HTMLImageElement | null>(null);
  const lastFrameTimeRef = useRef<number>(-1);

  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);

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

    const now = performance.now();
    // Throttle MediaPipe to avoid calling with same timestamp
    if (now === lastFrameTimeRef.current) {
      rafRef.current = requestAnimationFrame(renderLoop);
      return;
    }
    lastFrameTimeRef.current = now;

    // Draw mirrored video frame
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    // Detect face landmarks (video mode uses timestamp)
    try {
      const result = landmarker.detectForVideo(video, now);

      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        setFaceDetected(true);
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
      } else {
        setFaceDetected(false);
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
        numFaces: 1,
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
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });
      } catch (err2) {
        setStatus('error');
        setErrorMsg('Failed to load face tracking model. Check your connection and try again.');
        return;
      }
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
    return () => {
      stopCamera();
      landmarkerRef.current?.close();
    };
  }, [stopCamera]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-brand-dark overflow-hidden">
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

      {/* Idle / permission prompt */}
      <AnimatePresence>
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-brand-dark"
          >
            <div className="w-24 h-24 rounded-full bg-brand-card border border-brand-border flex items-center justify-center shadow-gold">
              <Camera className="w-10 h-10 text-brand-gold" />
            </div>
            <div className="text-center">
              <p className="text-white text-xl font-semibold mb-2">Try On Glasses</p>
              <p className="text-zinc-400 text-sm max-w-xs">
                Enable your camera to see how each pair looks on you in real-time AR.
              </p>
            </div>
            <button
              onClick={startCamera}
              className="px-8 py-3 bg-brand-gold text-black font-semibold rounded-full text-sm
                         hover:bg-amber-400 active:scale-95 transition-all shadow-gold-sm"
            >
              Enable Camera
            </button>
          </motion.div>
        )}

        {/* Loading states */}
        {(status === 'requesting' || status === 'loading-mp') && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-brand-dark"
          >
            <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
            <p className="text-zinc-300 text-sm">
              {status === 'requesting' ? 'Accessing camera…' : 'Loading face tracking model…'}
            </p>
            {status === 'loading-mp' && (
              <p className="text-zinc-500 text-xs">First load may take a few seconds</p>
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
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-brand-dark px-8"
          >
            <div className="w-16 h-16 rounded-full bg-red-950 border border-red-800 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-300 text-sm text-center max-w-xs">{errorMsg}</p>
            <button
              onClick={startCamera}
              className="px-6 py-2.5 bg-brand-card border border-brand-border text-zinc-200
                         rounded-full text-sm hover:border-brand-gold transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Face guide overlay — shown only when camera is ready */}
      {status === 'ready' && !faceDetected && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div
            className="border-2 border-dashed border-brand-gold/40 rounded-[50%]"
            style={{ width: '45%', height: '70%' }}
          />
          <p className="absolute bottom-[18%] text-brand-gold/60 text-sm font-medium tracking-wide">
            Position your face in the frame
          </p>
        </div>
      )}

      {/* Live badge */}
      {status === 'ready' && faceDetected && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm
                        border border-white/10 rounded-full px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/80 text-xs font-medium">AR Live</span>
        </div>
      )}
    </div>
  );
}
