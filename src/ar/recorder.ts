/**
 * AR Video Recorder — captures the composite AR canvas (video + Three.js overlay)
 * as a WebM video using the MediaRecorder API + canvas.captureStream().
 */

export type RecordingState = 'idle' | 'recording' | 'processing' | 'done';

export interface RecorderOptions {
  /** Max recording duration in seconds (default: 10). */
  maxDuration?: number;
  /** Frame rate for the captured stream (default: 30). */
  fps?: number;
}

export interface RecordingResult {
  blob: Blob;
  durationMs: number;
  url: string; // Object URL for preview/download
}

export class ARRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private startTime = 0;
  private maxDuration: number;
  private fps: number;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private state: RecordingState = 'idle';
  private onStateChange?: (state: RecordingState) => void;
  private onComplete?: (result: RecordingResult) => void;

  constructor(options?: RecorderOptions) {
    this.maxDuration = (options?.maxDuration ?? 10) * 1000;
    this.fps = options?.fps ?? 30;
  }

  getState(): RecordingState {
    return this.state;
  }

  /** Check if MediaRecorder is available in this browser. */
  static isSupported(): boolean {
    return (
      typeof MediaRecorder !== 'undefined' &&
      typeof HTMLCanvasElement.prototype.captureStream === 'function'
    );
  }

  /**
   * Start recording from a canvas element.
   * @param canvas - The canvas to capture (should be the composite AR canvas)
   */
  start(
    canvas: HTMLCanvasElement,
    callbacks?: {
      onStateChange?: (state: RecordingState) => void;
      onComplete?: (result: RecordingResult) => void;
    },
  ): boolean {
    if (this.state === 'recording') return false;
    if (!ARRecorder.isSupported()) return false;

    this.onStateChange = callbacks?.onStateChange;
    this.onComplete = callbacks?.onComplete;
    this.chunks = [];

    try {
      const stream = canvas.captureStream(this.fps);

      // Try VP9 first, fall back to VP8
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm;codecs=vp8';

      this.mediaRecorder = new MediaRecorder(stream, { mimeType });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        this.setState('processing');
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        const durationMs = Date.now() - this.startTime;
        const url = URL.createObjectURL(blob);

        this.setState('done');
        this.onComplete?.({ blob, durationMs, url });
      };

      this.startTime = Date.now();
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.setState('recording');

      // Auto-stop at max duration
      this.timeoutId = setTimeout(() => this.stop(), this.maxDuration);

      return true;
    } catch {
      this.setState('idle');
      return false;
    }
  }

  /** Stop recording and trigger processing. */
  stop(): void {
    if (this.state !== 'recording' || !this.mediaRecorder) return;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.mediaRecorder.stop();
  }

  /** Reset to idle state and revoke any object URLs. */
  reset(): void {
    this.stop();
    this.chunks = [];
    this.setState('idle');
  }

  private setState(state: RecordingState): void {
    this.state = state;
    this.onStateChange?.(state);
  }
}

export function createARRecorder(options?: RecorderOptions): ARRecorder {
  return new ARRecorder(options);
}
