import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pause, Play, SkipBack, SkipForward, Clock, X } from 'lucide-react'
import AtmosphereLayer from '../components/AtmosphereLayer'
import GenerativeField from '../components/GenerativeField'
import SpiralMark from '../components/SpiralMark'
import { TopBar } from '../components/ui'
import { useAudio } from '../context/AudioProvider'
import { getSoundscape, getPalette, SOUNDSCAPES } from '../data/soundscapes'

const TIMER_OPTS = [15, 30, 45, 60, 90]

export default function SoundscapePlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const audio = useAudio()
  const s = getSoundscape(id || '')
  const pal = getPalette(s?.id)
  const [showTimer, setShowTimer] = useState(false)

  // Auto-start this soundscape if it isn't the current one.
  useEffect(() => {
    if (s && audio.current?.id !== s.id) {
      audio.play(s)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s?.id])

  if (!s) {
    return (
      <div className="screen">
        <AtmosphereLayer />
        <div className="screen-body">
          <div style={{ position: 'relative', padding: 64 }}>
            <TopBar onBack />
            <p style={{ color: 'var(--color-text-muted)' }}>Soundscape not found.</p>
          </div>
        </div>
      </div>
    )
  }

  const isCurrent = audio.current?.id === s.id
  const playing = isCurrent && audio.playing
  const mm = String(Math.floor(audio.elapsed / 60)).padStart(2, '0')
  const ss = String(audio.elapsed % 60).padStart(2, '0')
  const idx = SOUNDSCAPES.findIndex(x => x.id === s.id)
  const cycle = (dir: number) =>
    navigate('/soundscape/' + SOUNDSCAPES[(idx + dir + SOUNDSCAPES.length) % SOUNDSCAPES.length].id, { replace: true })

  return (
    <div className="screen">
      <AtmosphereLayer grain={0.07} reactive colors={pal} />
      <GenerativeField tint={pal.tint} concept={pal.concept} />

      {/* Reactive glow — fixed backdrop */}
      <div aria-hidden style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(155,118,255,0.35), transparent 70%)',
        filter: 'blur(40px)',
        opacity: playing ? 0.9 : 0.35,
        transition: 'opacity 1.2s ease',
        pointerEvents: 'none',
      }} />

      <div className="screen-body">
        <div className="screen-enter" style={{
          position: 'relative', padding: '56px 28px 36px',
          minHeight: '100%', display: 'flex', flexDirection: 'column',
        }}>
          <TopBar
            onBack
            right={
              <button
                className="pressable focusable"
                onClick={() => { audio.stop(); navigate('/soundscape') }}
                aria-label="End"
              >
                <X size={20} color="var(--color-text-muted)" />
              </button>
            }
          />

          {/* Title — no synthesis label */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{
              fontFamily: 'var(--font-serif)', fontWeight: 400,
              fontSize: 30, color: 'var(--color-text)', letterSpacing: '-0.02em',
            }}>
              {s.name}
            </h1>
            <p style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 6 }}>
              {s.tagline}
            </p>
          </div>

          {/* Hero orb — compact */}
          <div style={{
            position: 'relative', width: 180, height: 180,
            margin: '0 auto 28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div aria-hidden style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '1px solid var(--color-accent)',
              animation: playing ? 'breathe-ring 5s ease-in-out infinite' : 'none', opacity: 0.2,
            }} />
            <div aria-hidden style={{
              position: 'absolute', inset: 22, borderRadius: '50%',
              border: '1px solid var(--color-accent)',
              animation: playing ? 'breathe-ring 5s ease-in-out -1.8s infinite' : 'none', opacity: 0.3,
            }} />
            <div aria-hidden style={{
              position: 'absolute', inset: 40, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(155,118,255,0.45), transparent 70%)',
              filter: 'blur(14px)',
            }} />
            <SpiralMark size={56} color="var(--color-accent)" strokeWidth={1} spinning={playing} />
          </div>

          {/* Transport */}
          <div style={{ marginBottom: 26 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>
                {mm}:{ss}
              </span>
              <button
                className="pressable"
                onClick={() => setShowTimer(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                <Clock size={12} />
                {audio.sleepTimer ? `${audio.sleepTimer}m left` : 'timer'}
              </button>
            </div>

            {/* Progress bar */}
            <div style={{ height: 2, background: 'var(--color-hair)', borderRadius: 2, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{
                height: '100%', background: 'var(--color-accent)',
                width: audio.sleepTimer ? `${Math.min(100, (audio.elapsed / (audio.sleepTimer * 60)) * 100)}%` : '100%',
                opacity: audio.sleepTimer ? 1 : 0.25,
                transition: 'width 1s linear',
              }} />
            </div>

            {showTimer && (
              <div className="rise" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                {TIMER_OPTS.map(m => (
                  <button
                    key={m}
                    className="pressable"
                    onClick={() => { audio.startSleepTimer(m); setShowTimer(false) }}
                    style={{
                      padding: '7px 13px', borderRadius: 999, fontSize: 12,
                      fontFamily: 'var(--font-mono)',
                      background: audio.sleepTimer === m ? 'var(--color-accent)' : 'var(--color-surface)',
                      color: audio.sleepTimer === m ? 'var(--color-accent-ink)' : 'var(--color-text-muted)',
                      border: '1px solid var(--color-hair)',
                    }}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36 }}>
              <button className="pressable focusable" aria-label="Previous" onClick={() => cycle(-1)}>
                <SkipBack size={20} color="var(--color-text-muted)" strokeWidth={1.5} />
              </button>
              <button
                className="pressable focusable"
                aria-label={playing ? 'Pause' : 'Play'}
                onClick={() => (isCurrent ? audio.toggle() : audio.play(s))}
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--color-accent)', color: 'var(--color-accent-ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 12px 36px rgba(181,168,232,0.3), inset 0 1px 0 rgba(255,255,255,0.35)',
                }}
              >
                {playing
                  ? <Pause size={24} fill="var(--color-accent-ink)" stroke="var(--color-accent-ink)" />
                  : <Play size={24} fill="var(--color-accent-ink)" stroke="var(--color-accent-ink)" style={{ marginLeft: 3 }} />}
              </button>
              <button className="pressable focusable" aria-label="Next" onClick={() => cycle(1)}>
                <SkipForward size={20} color="var(--color-text-muted)" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Layer faders */}
          <section style={{ borderTop: '1px solid var(--color-hair)', paddingTop: 20 }}>
            {s.layers.map(layer => (
              <div key={layer.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 13.5, color: 'var(--color-text-muted)', flex: 1 }}>{layer.label}</span>
                </div>
                <input
                  type="range"
                  min={0} max={1} step={0.01}
                  value={audio.levels[layer.id] ?? 0}
                  onChange={e => audio.setLevel(layer.id, parseFloat(e.target.value))}
                  aria-label={`${layer.label} volume`}
                />
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}
