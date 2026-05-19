import { useEffect, useRef } from 'react'
import * as engine from '../audio/engine'
import { useFieldConcept, type FieldConcept } from '../context/FieldConceptProvider'

/**
 * GenerativeField — a hand-rolled 2D-canvas particle drift behind content.
 * No 3D lib. Pre-rendered soft sprite (no hot-loop shadowBlur), single rAF,
 * paused when the tab is hidden, capped DPR. Reduced-motion → one static
 * frame. Mounts behind the screen content (z-index 0, pointer-events none).
 *
 * Pass C.1 ideation: the particle *kind* is selectable via FieldConcept
 * (motes | dust | starfield | constellation). The active concept comes from
 * FieldConceptProvider; absent a provider it defaults to 'motes', so the
 * existing two call sites and the production build are byte-identical to
 * before until the dev-only switcher overrides it.
 */

interface P {
  x: number; y: number; vx: number; vy: number; r: number; a: number
  /** per-particle phase — drives dust sway + starfield twinkle */
  ph: number
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

interface Props {
  /** base mote colour — defaults to the Pure Indigo lavender */
  tint?: string
  /** particle count baseline (scaled per concept) */
  density?: number
}

/** Per-concept density scale relative to the call site's `density` baseline. */
const DENSITY_SCALE: Record<FieldConcept, number> = {
  motes: 1,
  dust: 0.36,
  starfield: 1.7,
  constellation: 0.28,
}

export default function GenerativeField({ tint = '#BEB0FF', density = 96 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { concept, densityOverride } = useFieldConcept()
  const baseDensity = densityOverride ?? density

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const COUNT = Math.max(8, Math.round(baseDensity * DENSITY_SCALE[concept]))
    const [tr, tg, tb] = hexToRgb(tint)
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let W = 0, H = 0

    // Pre-rendered soft mote sprite (radial gradient → cheap drawImage),
    // built from the soundscape's tint so each soundscape feels distinct.
    const SP = 64
    const sprite = document.createElement('canvas')
    sprite.width = sprite.height = SP
    const sctx = sprite.getContext('2d')!
    const g = sctx.createRadialGradient(SP / 2, SP / 2, 0, SP / 2, SP / 2, SP / 2)
    g.addColorStop(0, `rgba(${tr},${tg},${tb},0.9)`)
    g.addColorStop(0.35, `rgba(${tr},${tg},${tb},0.42)`)
    g.addColorStop(1, `rgba(${tr},${tg},${tb},0)`)
    sctx.fillStyle = g
    sctx.fillRect(0, 0, SP, SP)

    const particles: P[] = []
    const seed = () => {
      particles.length = 0
      for (let i = 0; i < COUNT; i++) {
        const ph = Math.random() * Math.PI * 2
        if (concept === 'motes') {
          particles.push({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.12,
            vy: -0.08 - Math.random() * 0.22,
            r: 6 + Math.random() * 26,
            a: 0.12 + Math.random() * 0.3, ph,
          })
        } else if (concept === 'dust') {
          // sparse, large, near-still — the calmest treatment
          particles.push({
            x: Math.random() * W, y: Math.random() * H,
            vx: 0,
            vy: -0.015 - Math.random() * 0.03,
            r: 22 + Math.random() * 44,
            a: 0.07 + Math.random() * 0.13, ph,
          })
        } else if (concept === 'starfield') {
          // many tiny faint near-static points that slowly twinkle
          particles.push({
            x: Math.random() * W, y: Math.random() * H,
            vx: 0,
            vy: -0.006 - Math.random() * 0.012,
            r: 0.7 + Math.random() * 1.7,
            a: 0.25 + Math.random() * 0.5, ph,
          })
        } else {
          // constellation — sparse drifting nodes; links drawn in draw()
          particles.push({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.06,
            vy: (Math.random() - 0.5) * 0.06,
            r: 1.6 + Math.random() * 2.2,
            a: 0.5 + Math.random() * 0.4, ph,
          })
        }
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

    let t = 0

    const blob = (px: number, py: number, size: number, alpha: number) => {
      ctx.globalAlpha = alpha
      ctx.drawImage(sprite, px - size, py - size, size * 2, size * 2)
    }

    const draw = (amp: number) => {
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      const boost = 1 + amp * 0.8

      if (concept === 'constellation') {
        const LINK = Math.min(W, H) * 0.24
        const LINK2 = LINK * LINK
        ctx.lineWidth = 1
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          for (let j = i + 1; j < particles.length; j++) {
            const q = particles[j]
            const dx = p.x - q.x, dy = p.y - q.y
            const d2 = dx * dx + dy * dy
            if (d2 > LINK2) continue
            const closeness = 1 - Math.sqrt(d2) / LINK
            ctx.globalAlpha = closeness * (0.16 + amp * 0.34)
            ctx.strokeStyle = `rgb(${tr},${tg},${tb})`
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.stroke()
          }
        }
        for (const p of particles) {
          blob(p.x, p.y, p.r * 2.4 * boost, p.a * (0.6 + amp * 0.5))
        }
      } else if (concept === 'starfield') {
        for (const p of particles) {
          const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.04 + p.ph))
          blob(p.x, p.y, (p.r + 1.2) * boost, p.a * tw * (0.7 + amp * 0.5))
        }
      } else {
        // motes + dust share the soft-blob draw
        for (const p of particles) {
          blob(p.x, p.y, p.r * boost, p.a * (0.7 + amp * 0.5))
        }
      }

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }

    const step = (amp: number) => {
      t += 1
      const sp = 1 + amp * 1.4
      for (const p of particles) {
        if (concept === 'dust') {
          // gentle horizontal sway instead of linear vx
          p.x += Math.sin(t * 0.005 + p.ph) * 0.06
          p.y += p.vy * sp
        } else {
          p.x += p.vx * sp
          p.y += p.vy * sp
        }
        if (concept === 'constellation') {
          if (p.x < -40) p.x = W + 40
          else if (p.x > W + 40) p.x = -40
          if (p.y < -40) p.y = H + 40
          else if (p.y > H + 40) p.y = -40
        } else {
          if (p.y < -40) { p.y = H + 40; p.x = Math.random() * W }
          if (p.x < -40) p.x = W + 40
          else if (p.x > W + 40) p.x = -40
        }
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
  }, [tint, baseDensity, concept])

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
