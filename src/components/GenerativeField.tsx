import { useEffect, useRef } from 'react'
import * as engine from '../audio/engine'
import { useFieldConcept, type FieldConcept } from '../context/FieldConceptProvider'

/**
 * GenerativeField — a hand-rolled 2D-canvas particle drift behind content.
 * No 3D lib. Pre-rendered soft sprite (no hot-loop shadowBlur), single rAF,
 * paused when the tab is hidden, capped DPR. Reduced-motion → one static
 * frame. Mounts behind the screen content (z-index 0, pointer-events none).
 *
 * Each soundscape declares its own particle `concept` (passed as a prop).
 * A dev-only override (FieldConceptProvider) wins for auditioning:
 *   effective concept = override ?? concept prop ?? 'motes'.
 * Absent a provider it falls back to the prop / 'motes', so the production
 * build and the existing hero-screen call site are unaffected.
 */

interface P {
  x: number; y: number; vx: number; vy: number; r: number; a: number
  /** per-particle phase — drives sway / twinkle / flicker / blink */
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
  /** per-soundscape particle identity; dev override still wins */
  concept?: FieldConcept
}

/** Per-concept density scale relative to the call site's `density` baseline. */
const DENSITY_SCALE: Record<FieldConcept, number> = {
  motes: 1,
  dust: 0.5,
  starfield: 1.7,
  constellation: 0.28,
  embers: 0.7,
  fireflies: 0.28,
  bubbles: 0.42,
  fairies: 0.22,
  rain: 1.5,
  // Cosmic: sparse void with rare shooting stars — drift/depth over sparkle density.
  cosmic: 0.7,
  // Waves: ~4 large wave lines + ~30 foam dots = ~0.36 of base density.
  waves: 0.36,
}

export default function GenerativeField({ tint = '#BEB0FF', density = 96, concept = 'motes' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { override, densityOverride } = useFieldConcept()
  const activeConcept: FieldConcept = override ?? concept
  const baseDensity = densityOverride ?? density

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const COUNT = Math.max(8, Math.round(baseDensity * DENSITY_SCALE[activeConcept]))
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
        switch (activeConcept) {
          case 'motes':
            particles.push({
              x: Math.random() * W, y: Math.random() * H,
              vx: (Math.random() - 0.5) * 0.12,
              vy: -0.08 - Math.random() * 0.22,
              r: 6 + Math.random() * 26,
              a: 0.12 + Math.random() * 0.3, ph,
            }); break
          case 'dust':
            particles.push({
              x: Math.random() * W, y: Math.random() * H,
              vx: 0, vy: -0.015 - Math.random() * 0.03,
              r: 20 + Math.random() * 40,
              a: 0.13 + Math.random() * 0.2, ph,
            }); break
          case 'starfield':
            particles.push({
              x: Math.random() * W, y: Math.random() * H,
              vx: 0, vy: -0.006 - Math.random() * 0.012,
              r: 0.7 + Math.random() * 1.7,
              a: 0.25 + Math.random() * 0.5, ph,
            }); break
          case 'constellation':
            particles.push({
              x: Math.random() * W, y: Math.random() * H,
              vx: (Math.random() - 0.5) * 0.06,
              vy: (Math.random() - 0.5) * 0.06,
              r: 1.6 + Math.random() * 2.2,
              a: 0.5 + Math.random() * 0.4, ph,
            }); break
          case 'embers':
            // warm sparks rising off a low fire — small, fast, flickering
            particles.push({
              x: Math.random() * W, y: H * 0.5 + Math.random() * H * 0.6,
              vx: (Math.random() - 0.5) * 0.16,
              vy: -0.35 - Math.random() * 0.75,
              r: 1.6 + Math.random() * 4.5,
              a: 0.35 + Math.random() * 0.45, ph,
            }); break
          case 'fireflies':
            // sparse wanderers that blink slowly on and off
            particles.push({
              x: Math.random() * W, y: Math.random() * H,
              vx: (Math.random() - 0.5) * 0.05,
              vy: (Math.random() - 0.5) * 0.05,
              r: 2.4 + Math.random() * 3,
              a: 0.6 + Math.random() * 0.4, ph,
            }); break
          case 'bubbles':
            // rising bubbles, wobbling, popping near the surface
            particles.push({
              x: Math.random() * W, y: Math.random() * H,
              vx: 0, vy: -0.22 - Math.random() * 0.4,
              r: 3 + Math.random() * 13,
              a: 0.18 + Math.random() * 0.3, ph,
            }); break
          case 'fairies':
            // slow drifting twinkles with a soft comet trail
            particles.push({
              x: Math.random() * W, y: Math.random() * H,
              vx: (Math.random() - 0.5) * 0.22,
              vy: (Math.random() - 0.5) * 0.22,
              r: 2.2 + Math.random() * 3.4,
              a: 0.55 + Math.random() * 0.4, ph,
            }); break
          case 'rain':
            // fast falling streaks, slight wind shear; r = streak length
            particles.push({
              x: Math.random() * W, y: Math.random() * H,
              vx: -0.5 - Math.random() * 0.4,
              vy: 5.5 + Math.random() * 5,
              r: 12 + Math.random() * 22,
              a: 0.12 + Math.random() * 0.22, ph,
            }); break
          case 'cosmic': {
            // 96% sparse stars, 4% rare shooting stars (encoded as r > 50)
            const isShooting = Math.random() < 0.04
            if (isShooting) {
              const angle = (-0.2 + Math.random() * -0.4) * Math.PI // downward diagonals
              const spd = 4 + Math.random() * 4
              particles.push({
                x: Math.random() * W * 1.4 - W * 0.2,
                y: Math.random() * H * 0.5,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                r: 60 + Math.random() * 80,   // trail length
                a: 0.55 + Math.random() * 0.35, ph,
              })
            } else {
              // Mix of dim and brighter stars — the bright ones do the heavy lifting
              const big = Math.random() < 0.18
              particles.push({
                x: Math.random() * W, y: Math.random() * H,
                vx: 0, vy: 0,
                r: big ? 1.4 + Math.random() * 1.4 : 0.4 + Math.random() * 0.9,
                a: big ? 0.55 + Math.random() * 0.4 : 0.2 + Math.random() * 0.35, ph,
              })
            }
            break
          }
          case 'waves': {
            // Hybrid: ~15% are wave-lines (encoded by r > 12), the rest are foam
            // particles drifting along the surface. Gives the field actual motion.
            const isLine = i % 7 === 0 // ~14% are wave lines
            if (isLine) {
              particles.push({
                x: Math.random() * Math.PI * 2, // phase offset
                y: H * (0.25 + (i / COUNT) * 0.7), // distribute through middle/lower
                vx: 0.004 + Math.random() * 0.006,
                vy: (Math.random() - 0.5) * 0.04,
                r: 22 + Math.random() * 38, // wave amplitude (always > 12 marks it as line)
                a: 0.12 + Math.random() * 0.16, ph,
              })
            } else {
              // Foam particle — small bright dot drifting with the current
              particles.push({
                x: Math.random() * W,
                y: H * (0.2 + Math.random() * 0.75), // mid-to-lower surface
                vx: 0.3 + Math.random() * 0.7, // horizontal drift (rightward current)
                vy: Math.sin(Math.random() * Math.PI * 2) * 0.08, // gentle bob
                r: 1.0 + Math.random() * 2.2, // small dots (< 12 marks them as foam)
                a: 0.4 + Math.random() * 0.4, ph,
              })
            }
            break
          }
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

      if (activeConcept === 'constellation') {
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
        for (const p of particles) blob(p.x, p.y, p.r * 2.4 * boost, p.a * (0.6 + amp * 0.5))
      } else if (activeConcept === 'starfield') {
        for (const p of particles) {
          const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.04 + p.ph))
          blob(p.x, p.y, (p.r + 1.2) * boost, p.a * tw * (0.7 + amp * 0.5))
        }
      } else if (activeConcept === 'embers') {
        for (const p of particles) {
          const fl = 0.55 + 0.45 * Math.sin(t * 0.5 + p.ph) // fast flicker
          // life fade: dimmer the higher it has risen
          const life = Math.max(0, Math.min(1, p.y / H))
          blob(p.x, p.y, (p.r + 1) * boost, p.a * fl * (0.4 + life * 0.7) * (0.7 + amp * 0.6))
        }
      } else if (activeConcept === 'fireflies') {
        for (const p of particles) {
          // gentle breathing glow with a brighter pulse — never fully dark,
          // so the forest always reads as alive
          const s = Math.sin(t * 0.02 + p.ph)
          const glow = 0.28 + 0.72 * Math.max(0, (s + 0.2) / 1.2)
          blob(p.x, p.y, (p.r + 2.4) * boost, p.a * glow * (0.85 + amp * 0.4))
        }
      } else if (activeConcept === 'bubbles') {
        for (const p of particles) {
          const life = Math.max(0, Math.min(1, p.y / (H * 0.9)))
          const fade = life < 0.12 ? life / 0.12 : 1 // pop/fade near surface
          // soft body + a brighter rim core for a "bubble" read
          blob(p.x, p.y, p.r * boost, p.a * fade * 0.6 * (0.7 + amp * 0.4))
          blob(p.x - p.r * 0.28, p.y - p.r * 0.28, p.r * 0.42 * boost, p.a * fade * (0.9 + amp * 0.4))
        }
      } else if (activeConcept === 'fairies') {
        for (const p of particles) {
          const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 0.06 + p.ph))
          // short comet trail opposite velocity (cheap: 3 fading echoes)
          for (let k = 3; k >= 1; k--) {
            blob(p.x - p.vx * k * 9, p.y - p.vy * k * 9,
                 p.r * (1 - k * 0.18) * boost, p.a * tw * (0.12 / k))
          }
          blob(p.x, p.y, (p.r + 1) * boost, p.a * tw * (0.85 + amp * 0.4))
        }
      } else if (activeConcept === 'rain') {
        ctx.lineCap = 'round'
        ctx.lineWidth = 1.1
        for (const p of particles) {
          const len = p.r * (0.85 + amp * 0.5)
          const inv = len / p.vy // scale velocity vector to streak length
          ctx.globalAlpha = p.a * (0.7 + amp * 0.5)
          ctx.strokeStyle = `rgb(${tr},${tg},${tb})`
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x - p.vx * inv, p.y - len)
          ctx.stroke()
        }
      } else if (activeConcept === 'cosmic') {
        // Sort: draw stars first, then shooting stars on top
        for (const p of particles) {
          const isShooting = Math.abs(p.vx) > 1.5 || Math.abs(p.vy) > 1.5
          if (isShooting) continue
          // Regular stars: tiny sharp point with gentle twinkle
          const tw = 0.55 + 0.45 * Math.sin(t * 0.025 + p.ph)
          const alpha = p.a * tw * (0.65 + amp * 0.6)
          // Draw as a crisp bright point
          ctx.globalAlpha = alpha
          ctx.fillStyle = `rgb(${tr},${tg},${tb})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * boost, 0, Math.PI * 2)
          ctx.fill()
          // Soft glow halo around brighter stars
          if (p.r > 1.2) blob(p.x, p.y, p.r * 5 * boost, alpha * 0.18)
        }
        // Shooting stars — gradient streak
        for (const p of particles) {
          const isShooting = Math.abs(p.vx) > 1.5 || Math.abs(p.vy) > 1.5
          if (!isShooting) continue
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
          const trailLen = p.r * (0.8 + amp * 0.5)
          const nx = -p.vx / speed, ny = -p.vy / speed // unit vector backwards
          const grd = ctx.createLinearGradient(
            p.x, p.y,
            p.x + nx * trailLen, p.y + ny * trailLen
          )
          grd.addColorStop(0, `rgba(${tr},${tg},${tb},${p.a})`)
          grd.addColorStop(0.35, `rgba(${tr},${tg},${tb},${p.a * 0.4})`)
          grd.addColorStop(1, `rgba(${tr},${tg},${tb},0)`)
          ctx.globalAlpha = 1
          ctx.strokeStyle = grd
          ctx.lineWidth = 1.6
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + nx * trailLen, p.y + ny * trailLen)
          ctx.stroke()
          // Bright head
          ctx.globalAlpha = p.a
          ctx.fillStyle = `rgba(255,255,255,0.9)`
          ctx.beginPath()
          ctx.arc(p.x, p.y, 1.2 * boost, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (activeConcept === 'waves') {
        // Wave-lines first (full-width sine curves), then foam dots on top
        ctx.globalCompositeOperation = 'source-over'
        ctx.lineCap = 'round'
        for (const p of particles) {
          if (p.r <= 12) continue // skip foam — drawn next pass
          const amp2 = p.r * (0.7 + amp * 1.2)
          ctx.globalAlpha = p.a * (0.85 + amp * 0.5)
          ctx.strokeStyle = `rgb(${tr},${tg},${tb})`
          ctx.lineWidth = 1.2 + amp * 0.7
          ctx.beginPath()
          const steps = Math.ceil(W / 4)
          for (let xi = 0; xi <= steps; xi++) {
            const x = (xi / steps) * W
            const y = p.y + Math.sin(x * 0.018 + p.x + t * p.vx) * amp2
            xi === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          }
          ctx.stroke()
        }
        // Foam dots — bright small particles drifting along, additive
        ctx.globalCompositeOperation = 'lighter'
        for (const p of particles) {
          if (p.r > 12) continue
          ctx.globalAlpha = p.a * (0.7 + amp * 0.4)
          ctx.fillStyle = `rgb(${tr},${tg},${tb})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * (0.9 + amp * 0.4), 0, Math.PI * 2)
          ctx.fill()
          // Soft halo around larger foam
          if (p.r > 1.6) blob(p.x, p.y, p.r * 6, p.a * 0.18)
        }
      } else {
        // motes + dust share the soft-blob draw
        for (const p of particles) blob(p.x, p.y, p.r * boost, p.a * (0.7 + amp * 0.5))
      }

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }

    const step = (amp: number) => {
      t += 1
      const sp = 1 + amp * 1.4
      for (const p of particles) {
        switch (activeConcept) {
          case 'dust':
            p.x += Math.sin(t * 0.005 + p.ph) * 0.06
            p.y += p.vy * sp
            break
          case 'embers':
            // curl + accelerate slightly as they rise
            p.x += (p.vx + Math.sin(t * 0.02 + p.ph) * 0.12) * sp
            p.y += p.vy * sp
            break
          case 'fireflies':
            p.x += (p.vx + Math.sin(t * 0.01 + p.ph) * 0.06) * sp
            p.y += (p.vy + Math.cos(t * 0.009 + p.ph * 1.3) * 0.05) * sp
            break
          case 'bubbles':
            p.x += Math.sin(t * 0.03 + p.ph) * 0.5 // wobble
            p.y += p.vy * sp
            break
          case 'fairies':
            p.x += (p.vx + Math.sin(t * 0.013 + p.ph) * 0.14) * sp
            p.y += (p.vy + Math.cos(t * 0.011 + p.ph) * 0.14) * sp
            break
          case 'cosmic': {
            // Shooting stars (r > 50 = long trail); regular stars are stationary
            const isShooting = p.r > 50
            if (isShooting) { p.x += p.vx * sp; p.y += p.vy * sp }
            // regular stars: no positional movement — twinkle only
            break
          }
          case 'waves':
            if (p.r > 12) {
              // Wave-line — advance phase, slow vertical drift
              p.x += p.vx * sp
              p.y += p.vy * 0.3
            } else {
              // Foam particle — drift right with the current + gentle vertical bob
              p.x += p.vx * sp
              p.y += Math.sin(t * 0.04 + p.ph) * 0.3
            }
            break
          default:
            p.x += p.vx * sp
            p.y += p.vy * sp
        }

        if (activeConcept === 'cosmic') {
          const isShooting = p.r > 50
          if (isShooting && (p.x > W + 60 || p.y > H + 60 || p.x < -60)) {
            p.x = Math.random() * W * 0.6
            p.y = -10 - Math.random() * 80
          }
          // regular stars don't need wrapping — they're stationary
        } else if (activeConcept === 'waves') {
          if (p.r > 12) {
            // Wave lines wrap vertically
            if (p.y < -p.r * 2) p.y = H + p.r
            else if (p.y > H + p.r * 2) p.y = -p.r
          } else {
            // Foam wraps horizontally — exits right, reappears on left
            if (p.x > W + 6) {
              p.x = -6
              p.y = H * (0.2 + Math.random() * 0.75)
            }
          }
        } else if (activeConcept === 'constellation' || activeConcept === 'fireflies' || activeConcept === 'fairies') {
          // wrap on all edges (free wander)
          if (p.x < -40) p.x = W + 40
          else if (p.x > W + 40) p.x = -40
          if (p.y < -40) p.y = H + 40
          else if (p.y > H + 40) p.y = -40
        } else if (activeConcept === 'embers' || activeConcept === 'bubbles') {
          // respawn at the bottom once they reach the top
          if (p.y < -20) { p.y = H + 20; p.x = Math.random() * W }
          if (p.x < -40) p.x = W + 40
          else if (p.x > W + 40) p.x = -40
        } else if (activeConcept === 'rain') {
          // respawn above once a streak falls past the bottom
          if (p.y - p.r > H) { p.y = -p.r - Math.random() * 60; p.x = Math.random() * (W + 120) }
          if (p.x < -60) p.x = W + 40
        } else {
          if (p.y < -40) { p.y = H + 40; p.x = Math.random() * W }
          if (p.x < -40) p.x = W + 40
          else if (p.x > W + 40) p.x = -40
        }
      }
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || !!document.querySelector('.phone-shell[data-reduced-motion]')
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
  }, [tint, baseDensity, activeConcept])

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
