import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Waves, Sunrise } from 'lucide-react'
import { usePlan } from '../context/PlanProvider'
import { useAudio } from '../context/AudioProvider'

/**
 * Night mode — the lights-out core job.
 *
 * The screen the app exists for: dark room, phone at arm's length, do not make
 * me navigate. One decision (sounds, or sounds + meditation), then it auto-dims
 * to almost nothing but a breathing orb. Tap anywhere to bring controls back.
 * "Until morning" simulates the night and resolves to /morning.
 */

type Phase = 'choose' | 'settling' | 'asleep'

export default function NightMode() {
  const navigate = useNavigate()
  const { plan } = usePlan()
  const audio = useAudio()
  const [phase, setPhase] = useState<Phase>('choose')
  const [dim, setDim] = useState(false)
  const idleTimer = useRef<number | null>(null)

  // Auto-dim after inactivity once settling.
  const resetIdle = () => {
    setDim(false)
    if (idleTimer.current) clearTimeout(idleTimer.current)
    if (phase !== 'choose') {
      idleTimer.current = window.setTimeout(() => setDim(true), 4500)
    }
  }
  useEffect(() => {
    resetIdle()
    return () => { if (idleTimer.current) clearTimeout(idleTimer.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Cleanup audio on leaving night mode entirely.
  useEffect(() => {
    return () => { audio.stop() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const begin = async (withMeditation: boolean) => {
    await audio.play(plan.soundscape)
    audio.startSleepTimer(45)
    setPhase('settling')
    if (withMeditation) {
      // Soundscape runs; meditation is offered as the first thing to do.
      navigate('/meditate/' + plan.meditation.id)
    }
  }

  return (
    <div
      className="screen"
      onClick={resetIdle}
      onMouseMove={resetIdle}
      style={{
        background: '#060312',
        transition: 'filter 1.6s ease',
        filter: dim ? 'brightness(0.35)' : 'brightness(1)',
      }}
    >
      {/* Very low ambient glow — almost nothing */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '32%', left: '50%', transform: 'translateX(-50%)',
          width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(120,90,220,0.28), transparent 70%)',
          filter: 'blur(50px)',
          animation: 'drift 40s ease-in-out infinite',
        }} />
      </div>

      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 36 }}>

        {phase === 'choose' && (
          <div className="rise" style={{ textAlign: 'center', width: '100%' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: 18 }}>
              Lights out · {plan.bedtimeLabel}
            </p>
            <h1 style={{
              fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 400,
              color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 10,
            }}>
              Good night, Mira.
            </h1>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 44, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
              Tonight, for <span style={{ color: 'var(--color-text)' }}>{plan.goalClause}</span>.
              One choice, then put the phone down.
            </p>

            <button
              className="pressable focusable"
              onClick={() => begin(true)}
              style={{
                width: '100%', padding: '20px 22px', borderRadius: 18, marginBottom: 12,
                background: 'var(--color-accent)', color: 'var(--color-accent-ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 14px 40px rgba(181,168,232,0.22), inset 0 1px 0 rgba(255,255,255,0.3)',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Wind down with a practice</div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 3 }}>
                  {plan.meditation.title} · {plan.meditation.minutes} min, then {plan.soundscape.name}
                </div>
              </div>
              <Sparkles size={18} />
            </button>

            <button
              className="pressable focusable"
              onClick={() => begin(false)}
              style={{
                width: '100%', padding: '20px 22px', borderRadius: 18,
                background: 'transparent', color: 'var(--color-text)',
                border: '1px solid var(--color-hair)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Just {plan.soundscape.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>
                  Fades out in 45 min
                </div>
              </div>
              <Waves size={18} color="var(--color-accent)" />
            </button>

            <button
              className="pressable"
              onClick={() => { audio.stop(); navigate('/tonight') }}
              style={{ marginTop: 28, fontSize: 13, color: 'var(--color-text-faint)' }}
            >
              Not yet — back to Tonight
            </button>
          </div>
        )}

        {phase !== 'choose' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Breathing orb */}
            <div style={{ position: 'relative', width: 240, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div aria-hidden style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '1px solid var(--color-accent)', opacity: 0.18,
                animation: 'breathe-ring 7s ease-in-out infinite',
              }} />
              <div aria-hidden style={{
                position: 'absolute', inset: 40, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(155,118,255,0.4), transparent 72%)',
                filter: 'blur(20px)',
                animation: 'breathe 7s ease-in-out infinite',
              }} />
              <span style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontSize: 17, color: 'var(--color-text)', opacity: dim ? 0 : 0.85,
                transition: 'opacity 1.6s ease',
              }}>
                {audio.sleepTimer ? `${audio.sleepTimer}m` : 'resting'}
              </span>
            </div>

            <div style={{
              opacity: dim ? 0 : 1, transition: 'opacity 1.2s ease',
              marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
            }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--color-text-muted)' }}>
                {plan.soundscape.name} is playing.
              </p>
              <p style={{ fontSize: 12.5, color: 'var(--color-text-faint)', maxWidth: 240, lineHeight: 1.6 }}>
                Set the phone down. The screen will dim itself. Sound fades out on its own.
              </p>
              <button
                className="pressable focusable"
                onClick={() => { audio.stop(); navigate('/morning') }}
                style={{
                  marginTop: 16, padding: '14px 26px', borderRadius: 999,
                  border: '1px solid var(--color-hair)', color: 'var(--color-text-muted)',
                  fontSize: 13, display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <Sunrise size={15} color="var(--color-accent)" />
                Skip to morning
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="home-indicator" />
    </div>
  )
}
