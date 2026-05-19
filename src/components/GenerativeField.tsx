import { useEffect, useRef } from 'react'
import * as engine from '../audio/engine'

/**
 * GenerativeField — a hand-rolled 2D-canvas particle drift behind content.
 * No 3D lib. Soft indigo motes flowing slowly upward; speed/size respond to
 * audio amplitude. Pre-rendered soft sprite (no hot-loop shadowBlur), single
 * rAF, paused when the tab is hidden, capped DPR. Reduced-motion → one static
 * frame. Mounts behind the screen content (z-index 0, pointer-events none).
 */

const COUNT = 96

interface P { x: number; y: number; vx: number; vy: number; r: number; a: number }

export default function GenerativeField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let W = 0, H = 0

    // Pre-rendered soft mote sprite (radial gradient → cheap drawImage).
    const SP = 64
    const sprite = document.createElement('canvas')
    sprite.width = sprite.height = SP
    const sctx = sprite.getContext('2d')!
    const g = sctx.createRadialGradient(SP / 2, SP / 2, 0, SP / 2, SP / 2, SP / 2)
    g.addColorStop(0, 'rgba(190,176,255,0.9)')
    g.addColorStop(0.35, 'rgba(155,124,232,0.45)')
    g.addColorStop(1, 'rgba(120,90,210,0)')
    sctx.fillStyle = g
    sctx.fillRect(0, 0, SP, SP)

    const particles: P[] = []
    const seed = () => {
      particles.length = 0
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.12,
          vy: -0.08 - Math.random() * 0.22,
          r: 6 + Math.random() * 26,
          a: 0.12 + Math.random() * 0.3,
        })
      }
    }

    const resize = () => {
      W = parent.clientWidth
      H = parent.clientHeight
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (particles.length === 0) seed()
    }
    resize()

    const draw = (amp: number) => {
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      const boost = 1 + amp * 0.8
      for (const p of particles) {
        const size = p.r * boost
        ctx.globalAlpha = p.a * (0.7 + amp * 0.5)
        ctx.drawImage(sprite, p.x - size, p.y - size, size * 2, size * 2)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }

    const step = (amp: number) => {
      const sp = 1 + amp * 1.4
      for (const p of particles) {
        p.x += p.vx * sp
        p.y += p.vy * sp
        if (p.y < -40) { p.y = H + 40; p.x = Math.random() * W }
        if (p.x < -40) p.x = W + 40
        else if (p.x > W + 40) p.x = -40
      }
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0

    if (reduced) {
      draw(0) // single static frame, no animation
    } else {
      const loop = () => {
        if (!document.hidden) {
          const amp = engine.getAmplitude()
          step(amp)
          draw(amp)
        }
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }

    let ro: ResizeObserver | null = null
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(resize)
      ro.observe(parent)
    }

    return () => {
      if (raf) cancelAnimationFrame(raf)
      ro?.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'absolute', inset: 0, zIndex: 0,
        pointerEvents: 'none',
        // soft fade-in so it doesn't pop on mount
        animation: 'fade-in 1200ms ease both',
      }}
    />
  )
}
