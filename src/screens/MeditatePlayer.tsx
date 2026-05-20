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
 * MeditatePlayer — guided breathing with chapter markers.
 *
 * Breathing cycle: 4s in → 4s hold → 6s out (14s total). The orb scales
 * with the breath phase. The --breath CSS var on .phone-shell couples the
 * atmosphere to the guided breath (same as NightMode orb pattern).
 */
export default function MeditatePlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const session = useSession()
  const m = getMeditation(id || '')
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')
  const tick = useRef<number | null>(null)

  const total = (m?.minutes ?? 8) * 60

  // Soft ambient bed while the practice plays.
  useEffect(() => {
    let active = true
    engine.ensureRunning().then(() => {
      if (!active) return
      engine.setLayer('drone', 0.45)
      engine.setLayer('tide', 0.18)
    })
    return () => {
      active = false
      engine.stopAll()
    }
  }, [])

  // Timer tick
  useEffect(() => {
    if (!playing) { if (tick.current) clearInterval(tick.current); return }
    tick.current = window.setInterval(() => setT(x => Math.min(total, x + 1)), 1000)
    return () => { if (tick.current) clearInterval(tick.current) }
  }, [playing, total])

  // Mark session when done
  const done = t >= total
  useEffect(() => {
    if (done) session.markMeditationDone()
  }, [done, session])

  // Breathing phase sequencer 4-4-6
  useEffect(() => {
    const seq: Array<['in' | 'hold' | 'out', number]> = [['in', 4000], ['hold', 4000], ['out', 6000]]
    let i = 0
    let timer: number
    const run = () => {
      setPhase(seq[i][0])
      timer = window.setTimeout(() => { i = (i + 1) % seq.length; run() }, seq[i][1])
    }
    if (playing && !done) run()
    return () => clearTimeout(timer)
  }, [playing, done])

  // Drive --breath CSS var on .phone-shell for atmosphere coupling
  useEffect(() => {
    const shell = document.querySelector('.phone-shell') as HTMLElement | null
    if (!shell) return
    if (!playing || done || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shell.style.setProperty('--breath', '0')
      return
    }
    const CYCLE = 14000, IN = 4000, HOLD = 4000
    const smooth = (x: number) => x * x * (3 - 2 * x)
    let raf = 0
    const t0 = performance.now()
    const frame = (now: number) => {
      const p = (now - t0) % CYCLE
      let b: number
      if (p < IN) b = smooth(p / IN)
      else if (p < IN + HOLD) b = 1
      else b = 1 - smooth((p - IN - HOLD) / (CYCLE - IN - HOLD))
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

  // Orb scale driven by breathing phase
  const orbScale = playing && !done
    ? (phase === 'in' ? 1.2 : phase === 'hold' ? 1.2 : 0.88)
    : 1
  const orbDur = phase === 'in' ? 4 : phase === 'hold' ? 0.3 : 6

  // Instruction text
  const phaseLabel = done
    ? 'Complete'
    : !playing
    ? 'Paused'
    : phase === 'in' ? 'Breathe in'
    : phase === 'hold' ? 'Hold'
    : 'Release'

  return (
    <div className="screen">
      <AtmosphereLayer variant="calm" grain={0.055} reactive />
      <GenerativeField concept="constellation" tint="rgba(181,168,232,0.7)" />

      <div className="screen-body">
        <div style={{
          position: 'relative', minHeight: '100%',
          padding: '56px 28px 40px',
          display: 'flex', flexDirection: 'column',
        }}>
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

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--color-text-faint)', marginBottom: 8,
            }}>
              {m.category} · {m.narrator}
            </p>
            <h1 style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              fontSize: 26, fontWeight: 400,
              color: 'var(--color-text)', letterSpacing: '-0.02em',
            }}>
              {m.title}
            </h1>
          </div>

          {/* Central breathing orb — the hero */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 20, minHeight: 260,
          }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Outer guide ring */}
              <div aria-hidden style={{
                position: 'absolute',
                width: 230, height: 230, borderRadius: '50%',
                border: '1px solid rgba(181,168,232,0.12)',
              }} />
              {/* Mid ring — pulses softly */}
              <div aria-hidden style={{
                position: 'absolute',
                width: 200, height: 200, borderRadius: '50%',
                border: '1px solid rgba(181,168,232,0.18)',
                animation: playing && !done ? 'breathe-ring 14s ease-in-out infinite' : 'none',
              }} />
              {/* Main orb */}
              <div
                aria-hidden
                style={{
                  width: 160, height: 160, borderRadius: '50%',
                  background: 'radial-gradient(circle at 40% 38%, rgba(201,187,245,0.6), rgba(98,72,200,0.18) 68%)',
                  boxShadow: '0 0 60px rgba(155,118,255,0.28), inset 0 1px 0 rgba(255,255,255,0.15)',
                  transform: `scale(${orbScale})`,
                  transition: `transform ${orbDur}s cubic-bezier(0.4,0,0.2,1)`,
                }}
              />
              {/* Phase label overlaid on orb */}
              <div style={{
                position: 'absolute',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                pointerEvents: 'none',
              }}>
                <span style={{
                  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                  fontSize: 17, color: 'var(--color-text)', opacity: 0.9,
                  letterSpacing: '-0.01em',
                }}>
                  {phaseLabel}
                </span>
              </div>
            </div>

            {/* Chapter label */}
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: 14,
              color: 'var(--color-text-muted)', textAlign: 'center',
              letterSpacing: '-0.01em', opacity: 0.85,
            }}>
              {done ? 'Well done.' : chapter?.title}
            </p>
          </div>

          {/* Chapter progress dots */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
              {m.chapters.map(c => (
                <div
                  key={c.title}
                  title={c.title}
                  style={{
                    flex: 1, height: 2, borderRadius: 2,
                    background: t >= c.at ? 'var(--color-accent)' : 'var(--color-hair)',
                    transition: 'background 600ms ease',
                  }}
                />
              ))}
            </div>
            {/* Continuous progress bar */}
            <div style={{ height: 1, background: 'var(--color-hair)', borderRadius: 1, overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: 'rgba(181,168,232,0.3)',
                width: `${progress * 100}%`,
                transition: 'width 1s linear',
              }} />
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            {!done && (
              <button
                className="pressable focusable"
                onClick={() => setPlaying(p => !p)}
                aria-label={playing ? 'Pause' : 'Resume'}
                style={{
                  width: 68, height: 68, borderRadius: '50%',
                  background: 'var(--color-accent)', color: 'var(--color-accent-ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 12px 36px rgba(181,168,232,0.3), inset 0 1px 0 rgba(255,255,255,0.35)',
                }}
              >
                {playing
                  ? <Pause size={22} fill="var(--color-accent-ink)" stroke="var(--color-accent-ink)" />
                  : <Play size={22} fill="var(--color-accent-ink)" stroke="var(--color-accent-ink)" style={{ marginLeft: 3 }} />}
              </button>
            )}

            {done && (
              <button
                className="pressable focusable"
                onClick={() => session.pendingNight ? navigate('/night') : navigate('/journal/new')}
                style={{
                  width: '100%', padding: '17px 22px', borderRadius: 16,
                  background: 'var(--color-accent)', color: 'var(--color-accent-ink)',
                  fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 12px 36px rgba(181,168,232,0.22), inset 0 1px 0 rgba(255,255,255,0.3)',
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
