import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pause, Play } from 'lucide-react'
import AtmosphereLayer from '../components/AtmosphereLayer'
import GenerativeField from '../components/GenerativeField'
import { TopBar } from '../components/ui'
import { getMeditation } from '../data/content'
import { useSession } from '../context/SessionProvider'
import * as engine from '../audio/engine'

/**
 * MeditatePlayer — guided breathing, centre-stage.
 *
 * The orb IS the experience. Phase label + live breath count inside the orb.
 * 4s in → 4s hold → 6s out (14s cycle). --breath CSS var couples atmosphere.
 * Chapter dots + thin progress bar stay below the fold, out of the way.
 */

const CYCLE = [
  { phase: 'in'   as const, dur: 4000, label: 'Breathe in' },
  { phase: 'hold' as const, dur: 4000, label: 'Hold'       },
  { phase: 'out'  as const, dur: 6000, label: 'Release'    },
]
const CYCLE_TOTAL = CYCLE.reduce((s, c) => s + c.dur, 0) // 14000ms

export default function MeditatePlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const session = useSession()
  const m = getMeditation(id || '')

  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [cyclePhase, setCyclePhase] = useState(0) // index into CYCLE
  const [breathCount, setBreathCount] = useState(1)
  const tick = useRef<number | null>(null)
  const phaseTimer = useRef<number | null>(null)
  const countTimer = useRef<number | null>(null)

  const total = (m?.minutes ?? 8) * 60
  const done = t >= total

  // Ambient audio bed
  useEffect(() => {
    let active = true
    engine.ensureRunning().then(() => {
      if (!active) return
      engine.setLayer('drone', 0.4)
      engine.setLayer('tide', 0.14)
    })
    return () => { active = false; engine.stopAll() }
  }, [])

  // Timer tick
  useEffect(() => {
    if (!playing || done) { if (tick.current) clearInterval(tick.current); return }
    tick.current = window.setInterval(() => setT(x => Math.min(total, x + 1)), 1000)
    return () => { if (tick.current) clearInterval(tick.current) }
  }, [playing, done, total])

  // Mark session when done
  useEffect(() => { if (done) session.markMeditationDone() }, [done, session])

  // Breathing phase sequencer — cascading timeouts, cleans up properly
  useEffect(() => {
    if (!playing || done) return
    let cancelled = false

    const step = (idx: number) => {
      if (cancelled) return
      setCyclePhase(idx)
      setBreathCount(1)
      const { dur } = CYCLE[idx]

      // Count up within the phase (1 per second)
      let count = 1
      const countTick = () => {
        count++
        if (count <= Math.floor(dur / 1000)) {
          setBreathCount(count)
          countTimer.current = window.setTimeout(countTick, 1000)
        }
      }
      countTimer.current = window.setTimeout(countTick, 1000)

      // Advance to next phase
      phaseTimer.current = window.setTimeout(() => {
        if (!cancelled) step((idx + 1) % CYCLE.length)
      }, dur)
    }

    step(0)
    return () => {
      cancelled = true
      if (phaseTimer.current) clearTimeout(phaseTimer.current)
      if (countTimer.current) clearTimeout(countTimer.current)
    }
  }, [playing, done])

  // Drive --breath on .phone-shell for atmosphere coupling
  useEffect(() => {
    const shell = document.querySelector('.phone-shell') as HTMLElement | null
    if (!shell) return
    if (!playing || done || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shell.style.setProperty('--breath', '0')
      return
    }
    const smooth = (x: number) => x * x * (3 - 2 * x)
    let raf = 0
    const t0 = performance.now()
    const frame = (now: number) => {
      const p = (now - t0) % CYCLE_TOTAL
      const IN = 4000, HOLD = 4000
      let b: number
      if (p < IN) b = smooth(p / IN)
      else if (p < IN + HOLD) b = 1
      else b = 1 - smooth((p - IN - HOLD) / (CYCLE_TOTAL - IN - HOLD))
      shell.style.setProperty('--breath', b.toFixed(3))
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); shell.style.setProperty('--breath', '0') }
  }, [playing, done])

  if (!m) return null

  const chapter = [...m.chapters].reverse().find(c => t >= c.at) ?? m.chapters[0]
  const remaining = total - t
  const remMm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const remSs = String(remaining % 60).padStart(2, '0')
  const progress = total > 0 ? t / total : 0

  const current = CYCLE[cyclePhase]
  const phaseLabel = done ? 'Complete' : !playing ? 'Paused' : current.label
  const showCount = playing && !done

  // Orb scale: big on inhale/hold, small on exhale
  const orbScale = playing && !done
    ? (cyclePhase === 0 ? 1.22 : cyclePhase === 1 ? 1.22 : 0.84)
    : 1
  const orbDur = cyclePhase === 0 ? 4 : cyclePhase === 1 ? 0.2 : 6

  // Glow colour shifts subtly with phase
  const glowOpacity = cyclePhase === 1 ? 0.55 : cyclePhase === 0 ? 0.38 : 0.22

  return (
    <div className="screen">
      <AtmosphereLayer variant="calm" grain={0.05} reactive />
      <GenerativeField concept="constellation" tint="rgba(181,168,232,0.6)" density={40} />

      <div className="screen-body">
        <div style={{
          position: 'relative', minHeight: '100%',
          padding: '48px 24px 32px',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Top bar — time remaining right-aligned */}
          <TopBar
            onBack
            right={
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'var(--color-text-muted)', letterSpacing: '0.06em',
              }}>
                {done ? '—' : `${remMm}:${remSs}`}
              </span>
            }
          />

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--color-text-faint)', marginBottom: 6,
            }}>
              {m.category} · {m.narrator}
            </p>
            <h1 style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              fontSize: 22, fontWeight: 400,
              color: 'var(--color-text)', letterSpacing: '-0.02em',
            }}>
              {m.title}
            </h1>
          </div>

          {/* ── Hero breathing orb — the whole experience ── */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 22, minHeight: 280,
          }}>
            {/* Orb stack */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Ambient glow behind orb */}
              <div aria-hidden style={{
                position: 'absolute',
                width: 320, height: 320, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(155,118,255,0.18), transparent 65%)',
                opacity: glowOpacity,
                transition: `opacity ${orbDur}s ease`,
                pointerEvents: 'none',
              }} />

              {/* Outer guide ring — shows the full-inhale boundary */}
              <div aria-hidden style={{
                position: 'absolute',
                width: 240, height: 240, borderRadius: '50%',
                border: '1px solid rgba(181,168,232,0.1)',
              }} />

              {/* Breathing ring — tracks the phase */}
              <div aria-hidden style={{
                position: 'absolute',
                width: 210, height: 210, borderRadius: '50%',
                border: `1px solid rgba(181,168,232,${cyclePhase === 1 ? 0.4 : 0.16})`,
                transition: `border-color ${orbDur}s ease`,
              }} />

              {/* Main orb */}
              <div
                aria-hidden
                style={{
                  width: 180, height: 180, borderRadius: '50%',
                  background: 'radial-gradient(circle at 38% 36%, rgba(210,196,255,0.65), rgba(88,58,190,0.2) 68%)',
                  boxShadow: `0 0 ${cyclePhase === 1 ? 80 : 44}px rgba(155,118,255,${glowOpacity}), inset 0 1px 0 rgba(255,255,255,0.18)`,
                  transform: `scale(${orbScale})`,
                  transition: `transform ${orbDur}s cubic-bezier(0.4,0,0.2,1), box-shadow ${orbDur}s ease`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 4,
                }}
              >
                {/* Phase label inside orb */}
                <span style={{
                  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                  fontSize: 15, color: 'rgba(255,255,255,0.88)',
                  letterSpacing: '-0.01em', userSelect: 'none',
                  pointerEvents: 'none',
                }}>
                  {phaseLabel}
                </span>
                {/* Breath count */}
                {showCount && (
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 22,
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
                  }}>
                    {breathCount}
                  </span>
                )}
              </div>
            </div>

            {/* Current chapter label — ambient context */}
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 13.5, color: 'var(--color-text-muted)',
              textAlign: 'center', letterSpacing: '-0.01em',
              opacity: 0.8, maxWidth: 240,
            }}>
              {done ? 'Well done. Take a moment.' : chapter?.title}
            </p>
          </div>

          {/* ── Bottom — progress + controls ── */}
          <div>
            {/* Chapter segment bars */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              {m.chapters.map((c, i) => (
                <div key={i} style={{
                  flex: 1, height: 2, borderRadius: 2,
                  background: t >= c.at ? 'var(--color-accent)' : 'var(--color-hair)',
                  transition: 'background 800ms ease',
                }} />
              ))}
            </div>
            {/* Thin overall progress */}
            <div style={{ height: 1, background: 'var(--color-hair)', borderRadius: 1, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{
                height: '100%', background: 'rgba(181,168,232,0.35)',
                width: `${progress * 100}%`, transition: 'width 1s linear',
              }} />
            </div>

            {/* Play / Pause */}
            {!done && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  className="pressable focusable"
                  onClick={() => setPlaying(p => !p)}
                  aria-label={playing ? 'Pause' : 'Resume'}
                  style={{
                    width: 62, height: 62, borderRadius: '50%',
                    background: 'var(--color-accent)', color: 'var(--color-accent-ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 10px 32px rgba(181,168,232,0.28), inset 0 1px 0 rgba(255,255,255,0.3)',
                  }}
                >
                  {playing
                    ? <Pause size={20} fill="var(--color-accent-ink)" stroke="var(--color-accent-ink)" />
                    : <Play size={20} fill="var(--color-accent-ink)" stroke="var(--color-accent-ink)" style={{ marginLeft: 2 }} />}
                </button>
              </div>
            )}

            {/* Completion CTA */}
            {done && (
              <button
                className="pressable focusable"
                onClick={() => session.pendingNight ? navigate('/night') : navigate('/journal/new')}
                style={{
                  width: '100%', padding: '16px 22px', borderRadius: 16,
                  background: 'var(--color-accent)', color: 'var(--color-accent-ink)',
                  fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 10px 32px rgba(181,168,232,0.22), inset 0 1px 0 rgba(255,255,255,0.28)',
                  animation: 'rise 400ms cubic-bezier(0.22,1,0.36,1) both',
                }}
              >
                {session.pendingNight ? 'Continue to night mode →' : 'Log a dream →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
