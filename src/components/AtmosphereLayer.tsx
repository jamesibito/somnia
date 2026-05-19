import { useEffect, useRef } from 'react'
import * as engine from '../audio/engine'

/**
 * AtmosphereLayer — the drifting blurred-color bath + film grain.
 * Used behind every screen. `variant` tweaks the palette.
 *
 * When `reactive`, a single rAF reads engine.getAmplitude() and writes a
 * smoothed `--amp` CSS custom property onto the .phone-shell element. The
 * field then breathes with the audio — zero React re-renders per frame.
 * Back-compatible: default behavior (non-reactive) is unchanged.
 */

interface Props {
  variant?: 'default' | 'deep' | 'dawn' | 'calm'
  grain?: number
  reactive?: boolean
  /** Per-soundscape override — wins over `variant` when provided. */
  colors?: { b1: string; b2: string; b3: string }
}

const VARIANTS = {
  default: { b1: 'rgba(155,118,255,0.5)', b2: 'rgba(98,72,200,0.46)', b3: 'rgba(181,168,232,0.3)' },
  deep:    { b1: 'rgba(120,86,220,0.42)', b2: 'rgba(70,52,170,0.5)',  b3: 'rgba(150,130,230,0.24)' },
  dawn:    { b1: 'rgba(181,168,232,0.42)', b2: 'rgba(140,120,235,0.4)', b3: 'rgba(120,150,235,0.26)' },
  calm:    { b1: 'rgba(140,120,235,0.36)', b2: 'rgba(98,72,200,0.34)', b3: 'rgba(181,168,232,0.22)' },
}

function useAmplitudeVar(enabled: boolean) {
  const raf = useRef<number | null>(null)
  useEffect(() => {
    if (!enabled) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const shell = document.querySelector('.phone-shell') as HTMLElement | null
    if (!shell) return
    let smoothed = 0
    const tick = () => {
      if (!document.hidden) {
        const a = engine.getAmplitude()
        // asymmetric smoothing: rise quickly, fall gently
        smoothed += (a - smoothed) * (a > smoothed ? 0.35 : 0.08)
        shell.style.setProperty('--amp', smoothed.toFixed(3))
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      shell.style.setProperty('--amp', '0')
    }
  }, [enabled])
}

export default function AtmosphereLayer({ variant = 'default', grain = 0.06, reactive = false, colors }: Props) {
  const v = colors ?? VARIANTS[variant]
  useAmplitudeVar(reactive)

  // Only attach the amplitude-driven transform when reactive, so the ~12
  // existing non-reactive call sites render byte-identically to before.
  const reactiveStyle = reactive
    ? {
        transform: 'scale(calc(1 + var(--amp, 0) * 0.05 + var(--breath, 0) * 0.045))',
        opacity: 'calc(0.86 + var(--amp, 0) * 0.1 + var(--breath, 0) * 0.06)' as unknown as number,
        transition: 'transform 120ms linear',
        willChange: 'transform',
      }
    : undefined

  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...reactiveStyle }}>
      <div style={{
        position: 'absolute', top: '-18%', left: '-22%',
        width: '92%', height: '62%',
        background: `radial-gradient(closest-side, ${v.b1}, transparent 70%)`,
        filter: 'blur(42px)',
        animation: 'drift 26s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: '24%', right: '-30%',
        width: '92%', height: '70%',
        background: `radial-gradient(closest-side, ${v.b2}, transparent 70%)`,
        filter: 'blur(52px)',
        animation: 'drift 34s ease-in-out -9s infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '-26%', left: '8%',
        width: '92%', height: '66%',
        background: `radial-gradient(closest-side, ${v.b3}, transparent 70%)`,
        filter: 'blur(62px)',
        animation: 'drift 42s ease-in-out -17s infinite',
      }} />
      {grain > 0 && (
        <div style={{
          position: 'absolute', inset: '-60%',
          backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\'/></filter><rect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/></svg>")',
          opacity: grain,
          mixBlendMode: 'overlay',
          animation: 'grain 1.6s steps(6) infinite',
        }} />
      )}
    </div>
  )
}
