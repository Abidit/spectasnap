import * as THREE from 'three';
import type { LensTint } from './presets';

export type PhotochromicMode = 'indoor' | 'outdoor';

// Indoor config = nearly clear lenses
const INDOOR_TINT: LensTint = {
  label: 'Indoor',
  lensHex: '#e8e8ee',
  transmission: 0.92,
  opacity: 0.12,
};

// Outdoor config = darkened lenses (like sunglasses)
const OUTDOOR_TINT: LensTint = {
  label: 'Outdoor',
  lensHex: '#222222',
  transmission: 0.25,
  opacity: 0.75,
};

/**
 * Photochromic controller -- lerps lens material properties between indoor/outdoor
 * states over ~1.25 seconds (accelerated for demo).
 */
export class PhotochromicController {
  private currentT = 0; // 0 = indoor, 1 = outdoor
  private targetT = 0;
  private speed = 0.8; // Transition per second (reaches target in ~1.25s)
  private active = false;

  setMode(mode: PhotochromicMode): void {
    this.targetT = mode === 'outdoor' ? 1 : 0;
  }

  setActive(active: boolean): void {
    this.active = active;
    if (!active) this.currentT = 0;
    this.targetT = 0;
  }

  isActive(): boolean {
    return this.active;
  }

  /**
   * Call every frame with deltaTime in seconds.
   * Returns the interpolated LensTint to apply, or null if not active.
   */
  update(dt: number): LensTint | null {
    if (!this.active) return null;

    // Lerp toward target
    if (Math.abs(this.currentT - this.targetT) > 0.001) {
      const dir = this.targetT > this.currentT ? 1 : -1;
      this.currentT += dir * this.speed * dt;
      this.currentT = Math.max(0, Math.min(1, this.currentT));
    } else {
      this.currentT = this.targetT;
    }

    // Interpolate between indoor and outdoor tint
    const t = this.currentT;
    return {
      label: t < 0.5 ? 'Indoor' : 'Outdoor',
      lensHex: lerpHex(INDOOR_TINT.lensHex, OUTDOOR_TINT.lensHex, t),
      transmission: lerp(INDOOR_TINT.transmission, OUTDOOR_TINT.transmission, t),
      opacity: lerp(INDOOR_TINT.opacity, OUTDOOR_TINT.opacity, t),
    };
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpHex(hexA: string, hexB: string, t: number): string {
  const a = new THREE.Color(hexA);
  const b = new THREE.Color(hexB);
  a.lerp(b, t);
  return '#' + a.getHexString();
}

export function createPhotochromicController(): PhotochromicController {
  return new PhotochromicController();
}
