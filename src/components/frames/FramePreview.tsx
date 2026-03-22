'use client'
import { useEffect, useRef } from 'react'

interface FramePreviewProps {
  frameId: string
  frameColor?: string
  colorIndex?: number
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
}

export function FramePreview({
  frameId,
  frameColor,
  colorIndex = 0,
  width = 280,
  height = 160,
  className,
  style,
}: FramePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    const cx = width / 2
    const cy = height / 2
    const scale = width / 300

    drawFramePreview(ctx, frameId, frameColor, cx, cy, scale)
  }, [frameId, frameColor, colorIndex, width, height])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={style}
    />
  )
}

function drawFramePreview(
  ctx: CanvasRenderingContext2D,
  frameId: string,
  frameColor: string | undefined,
  cx: number,
  cy: number,
  scale: number,
) {
  const ew = 82 * scale
  const eh = 52 * scale
  const gap = 16 * scale
  const lx = cx - ew / 2 - gap / 2
  const rx = cx + ew / 2 + gap / 2

  ctx.lineWidth = 2.5 * scale
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const s = getFrameStyle(frameId, frameColor)
  ctx.strokeStyle = s.stroke
  ctx.fillStyle = s.fill

  const id = frameId.toLowerCase()

  if (id.includes('round')) {
    // Circular lenses
    const r = ew / 2
    for (const x of [lx, rx]) {
      ctx.beginPath()
      ctx.arc(x, cy, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
  } else if (id.includes('aviator') || id.includes('pilot')) {
    // Teardrop aviator shape
    for (const x of [lx, rx]) {
      ctx.beginPath()
      ctx.moveTo(x - ew / 2, cy - eh * 0.35)
      ctx.quadraticCurveTo(x - ew / 2, cy + eh * 0.65, x, cy + eh * 0.65)
      ctx.quadraticCurveTo(x + ew / 2, cy + eh * 0.65, x + ew / 2, cy - eh * 0.35)
      ctx.quadraticCurveTo(x, cy - eh * 0.85, x - ew / 2, cy - eh * 0.35)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      // Brow bar
      ctx.beginPath()
      ctx.moveTo(x - ew / 2, cy - eh * 0.35)
      ctx.quadraticCurveTo(x, cy - eh, x + ew / 2, cy - eh * 0.35)
      ctx.stroke()
    }
  } else if (id.includes('cat')) {
    // Cat-eye: flick upward on outer corner
    const sides: [number, number][] = [[lx, -1], [rx, 1]]
    for (const [x, d] of sides) {
      ctx.beginPath()
      ctx.moveTo(x - ew / 2, cy + eh * 0.3)
      ctx.quadraticCurveTo(x - ew / 2, cy + eh * 0.5, x, cy + eh * 0.5)
      ctx.quadraticCurveTo(x + ew / 2, cy + eh * 0.5, x + ew / 2, cy + eh * 0.1)
      ctx.quadraticCurveTo(x + d * ew * 0.25, cy - eh * 0.5, x + d * ew / 2, cy - eh * 0.2)
      ctx.quadraticCurveTo(x, cy - eh * 0.3, x - ew / 2, cy + eh * 0.3)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  } else if (id.includes('sport') || id.includes('wrap')) {
    // Wide sport wrap: tapered ends
    for (const x of [lx, rx]) {
      ctx.beginPath()
      ctx.moveTo(x - ew / 2, cy - eh * 0.25)
      ctx.lineTo(x - ew / 2 + 4 * (ew < 0 ? -1 : 1), cy - eh / 2)
      ctx.lineTo(x + ew / 2 - 4, cy - eh / 2)
      ctx.lineTo(x + ew / 2, cy - eh * 0.25)
      ctx.quadraticCurveTo(x + ew / 2 + 4, cy, x + ew / 2, cy + eh * 0.25)
      ctx.lineTo(x + ew / 2 - 4, cy + eh / 2)
      ctx.lineTo(x - ew / 2 + 4, cy + eh / 2)
      ctx.lineTo(x - ew / 2, cy + eh * 0.25)
      ctx.quadraticCurveTo(x - ew / 2 - 4, cy, x - ew / 2, cy - eh * 0.25)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  } else {
    // Rectangle / wayfarer default
    const r = eh * 0.2
    for (const x of [lx, rx]) {
      roundRect(ctx, x - ew / 2, cy - eh / 2, ew, eh, r)
      ctx.fill()
      ctx.stroke()
    }
    // Wayfarer brow bar
    if (id.includes('wayfarer') || id.includes('wayfar')) {
      ctx.lineWidth = 4.5 * scale
      for (const x of [lx, rx]) {
        ctx.beginPath()
        ctx.moveTo(x - ew / 2 + r, cy - eh / 2)
        ctx.lineTo(x + ew / 2 - r, cy - eh / 2)
        ctx.stroke()
      }
      ctx.lineWidth = 2.5 * scale
    }
  }

  // Bridge
  ctx.beginPath()
  ctx.moveTo(lx + ew / 2, cy - 2 * scale)
  ctx.quadraticCurveTo(cx, cy - 10 * scale, rx - ew / 2, cy - 2 * scale)
  ctx.stroke()

  // Temple arms
  ctx.beginPath()
  ctx.moveTo(lx - ew / 2, cy - eh * 0.1)
  ctx.lineTo(lx - ew / 2 - 38 * scale, cy + 2 * scale)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(rx + ew / 2, cy - eh * 0.1)
  ctx.lineTo(rx + ew / 2 + 38 * scale, cy + 2 * scale)
  ctx.stroke()
}

function getFrameStyle(frameId: string, frameColor?: string) {
  // If a direct color is provided, use it
  if (frameColor) {
    return {
      stroke: frameColor,
      fill: frameColor + '22',
    }
  }
  const id = frameId.toLowerCase()
  if (id.includes('gold') || id.includes('aviator') || id.includes('pilot'))
    return { stroke: '#A8844A', fill: 'rgba(201,169,110,0.15)' }
  if (id.includes('tortoise') || id.includes('amber') || id.includes('havana'))
    return { stroke: '#5C3317', fill: 'rgba(92,51,23,0.15)' }
  if (id.includes('cat') || id.includes('scarlet') || id.includes('ruby'))
    return { stroke: '#8B2020', fill: 'rgba(139,32,32,0.12)' }
  if (id.includes('silver') || id.includes('rimless') || id.includes('titanium'))
    return { stroke: '#8A9198', fill: 'rgba(138,145,152,0.1)' }
  if (id.includes('navy') || id.includes('blue') || id.includes('ocean'))
    return { stroke: '#1E3A5F', fill: 'rgba(30,58,95,0.12)' }
  if (id.includes('sport') || id.includes('wrap'))
    return { stroke: '#245166', fill: 'rgba(36,81,102,0.12)' }
  return { stroke: '#1A1612', fill: 'rgba(26,22,18,0.1)' }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
