import { useEffect, useRef, useState } from 'react'
import { useClock } from '../context/ClockProvider'
import { usePlan } from '../context/PlanProvider'
import { useAudio } from '../context/AudioProvider'

/**
 * TimeCompression — the felt passage that replaces the instant skip-to-morning.
 *
 * A fixed-duration scripted easing (single rAF, no real clock): the atmosphere
 * cross-fades deep→dawn, the soundscape recedes, an accelerated hour counter
 * runs, then onComplete() fires. Honors prefers-reduced-motion (collapses to a
 * short fade, same end state). Mounted by NightMode as a full-bleed overlay.
 */

const DURATION = 6200 // ms

export default function TimeCompression({ onComplete }: { onComplete: () => void }) {
  const { setPhase, setNotional } = useClock()
  const { prefs } = usePlan()
  const audio = useAudio()
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number | null>(null)

  const bed = prefs.bedtimeHour * 60 + prefs.bedtimeMinute - prefs.bedtimeAdjustMin
  const wake = prefs.wakeHour * 60 + prefs.wakeMinute
  const span = ((wake - bed) % 1440 + 1440) % 1440

  useEffect(() => {
    // A fresh rAF runs on every mount; cleanup cancels it. StrictMode's
    // throwaway mount is cancelled harmlessly and the real mount completes
    // once. onComplete is idempotent (SessionProvider guards the record and
    // NightMode navigates away on the first call).
    setPhase('asleep')
    try { audio.stop() } catch { /* no-op */ }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const shell = document.querySelector('.phone-shell') as HTMLElement | null
    const dur = reduced ? 650 : DURATION
    const t0 = performance.now()
    let done = false

    const tick = (now: number) => {
      const raw = Math.min(1, (now - t0) / dur)
      const e = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2
      setProgress(e)
      setNotional(bed + span * e)
      shell?.style.setProperty('--night-progress', String(e))
      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else if (!done) {
        done = true
        setPhase('dawn')
        onComplete()
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const nowMin = ((Math.round(bed + span * progress) % 1440) + 1440) % 1440
  const h = Math.floor(nowMin / 60)
  const hr = ((h + 11) % 12) + 1
  const ampm = h >= 12 ? 'PM' : 'AM'
  const label = `${hr}:${String(nowMin % 60).padStart(2, '0')} ${ampm}`

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute', inset: 0, zIndex: 78,
        overflow: 'hidden',
        // deep → dawn crossfade driven by progress
        background: `#06030F`,
      }}
    >
      {/* night layer fades out */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 1 - progress,
        background: 'radial-gradient(120% 90% at 50% 18%, rgba(70,52,170,0.5), transparent 70%), #06030F',
        transition: 'none',
      }} />
      {/* dawn layer fades in */}
      <div style={{
        position: 'absolute', inset: 0, opacity: progress,
        background: 'radial-gradient(120% 80% at 50% 88%, rgba(181,168,232,0.42), transparent 70%), radial-gradient(120% 70% at 50% 100%, rgba(140,120,235,0.4), transparent 72%), #0A0726',
      }} />
      {/* soft sinking orb */}
      <div style={{
        position: 'absolute', left: '50%', top: `${28 + progress * 46}%`,
        transform: 'translate(-50%,-50%)',
        width: 150, height: 150, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(155,118,255,0.4), transparent 70%)',
        filter: 'blur(22px)',
        opacity: 0.7 - progress * 0.45,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 12,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--color-text-faint)',
        }}>
          {progress < 0.92 ? 'the night passes' : 'morning'}
        </div>
        <div style={{
          fontFamily: 'var(--font-serif)', fontSize: 44,
          color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em', opacity: 0.9,
        }}>
          {label}
        </div>
      </div>
    </div>
  )
}
