import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pause, Play, SkipBack, SkipForward, Clock, X } from 'lucide-react'
import AtmosphereLayer from '../components/AtmosphereLayer'
import SpiralMark from '../components/SpiralMark'
import { TopBar, Eyebrow } from '../components/ui'
import { useAudio } from '../context/AudioProvider'
import { getSoundscape, SOUNDSCAPES } from '../data/soundscapes'

const TIMER_OPTS = [15, 30, 45, 60, 90]

export default function SoundscapePlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const audio = useAudio()
  const s = getSoundscape(id || '')
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
        <div style={{ position: 'relative', padding: 64 }}>
          <TopBar onBack />
          <p style={{ color: 'var(--color-text-muted)' }}>Soundscape not found.</p>
        </div>
      </div>
    )
  }

  const isCurrent = audio.current?.id === s.id
  const playing = isCurrent && audio.playing
  const mm = String(Math.floor(audio.elapsed / 60)).padStart(2, '0')
  const ss = String(audio.elapsed % 60).padStart(2, '0')
  const idx = SOUNDSCAPES.findIndex(x => x.id === s.id)
  const cycle = (dir: number) => navigate('/soundscape/' + SOUNDSCAPES[(idx + dir + SOUNDSCAPES.length) % SOUNDSCAPES.length].id, { replace: true })

  return (
    <div className="screen">
      <AtmosphereLayer variant="calm" grain={0.07} />
      {/* Reactive glow that strengthens while playing */}
      <div aria-hidden style={{
        position: 'absolute', top: '12%', left: '50%', transform: 'translateX(-50%)',
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(155,118,255,0.4), transparent 70%)',
        filter: 'blur(40px)',
        opacity: playing ? 0.9 : 0.4,
        transition: 'opacity 1.2s ease',
        pointerEvents: 'none',
      }} />

      <div className="screen-enter" style={{ position: 'relative', padding: '64px 28px 40px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <TopBar
          onBack
          right={
            <button className="pressable focusable" onClick={() => { audio.stop(); navigate('/soundscape') }} aria-label="End">
              <X size={20} color="var(--color-text-muted)" />
            </button>
          }
        />

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Eyebrow>Soundscape · synthesized live</Eyebrow>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400,
            fontSize: 32, color: 'var(--color-text)', marginTop: 10,
            letterSpacing: '-0.02em',
          }}>
            {s.name}
          </h1>
        </div>

        {/* Hero breathing pad */}
        <div style={{ position: 'relative', width: 220, height: 220, margin: '40px auto 36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid var(--color-accent)', animation: playing ? 'breathe-ring 5s ease-in-out infinite' : 'none', opacity: 0.25 }} />
          <div aria-hidden style={{ position: 'absolute', inset: 26, borderRadius: '50%', border: '1px solid var(--color-accent)', animation: playing ? 'breathe-ring 5s ease-in-out -1.6s infinite' : 'none', opacity: 0.35 }} />
          <div aria-hidden style={{ position: 'absolute', inset: 48, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,118,255,0.45), transparent 70%)', filter: 'blur(16px)' }} />
          <SpiralMark size={64} color="var(--color-accent)" strokeWidth={1} spinning={playing} />
        </div>

        {/* Transport */}
        <div style={{ marginBottom: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>{mm}:{ss}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>
              {audio.sleepTimer ? `timer ${audio.sleepTimer}m` : '∞'}
            </span>
          </div>
          <div style={{ height: 3, background: 'var(--color-hair)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: 'var(--color-accent)',
              width: audio.sleepTimer ? `${Math.min(100, (audio.elapsed / (audio.sleepTimer * 60)) * 100)}%` : '100%',
              opacity: audio.sleepTimer ? 1 : 0.3,
              transition: 'width 1s linear',
            }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36, marginTop: 26 }}>
            <button className="pressable focusable" aria-label="Previous" onClick={() => cycle(-1)}>
              <SkipBack size={20} color="var(--color-text-muted)" strokeWidth={1.5} />
            </button>
            <button
              className="pressable focusable"
              aria-label={playing ? 'Pause' : 'Play'}
              onClick={() => (isCurrent ? audio.toggle() : audio.play(s))}
              style={{
                width: 76, height: 76, borderRadius: '50%',
                background: 'var(--color-accent)', color: 'var(--color-accent-ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 14px 40px rgba(181,168,232,0.3), inset 0 1px 0 rgba(255,255,255,0.35)',
              }}
            >
              {playing
                ? <Pause size={26} fill="var(--color-accent-ink)" stroke="var(--color-accent-ink)" />
                : <Play size={26} fill="var(--color-accent-ink)" stroke="var(--color-accent-ink)" style={{ marginLeft: 3 }} />}
            </button>
            <button className="pressable focusable" aria-label="Next" onClick={() => cycle(1)}>
              <SkipForward size={20} color="var(--color-text-muted)" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Layer faders — these drive real GainNodes */}
        <section style={{ borderTop: '1px solid var(--color-hair)', paddingTop: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <Eyebrow>Mix · {s.layers.length} layers</Eyebrow>
            <button
              className="pressable"
              onClick={() => setShowTimer(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-muted)' }}
            >
              <Clock size={13} /> Sleep timer
            </button>
          </div>

          {showTimer && (
            <div className="rise" style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {TIMER_OPTS.map(m => (
                <button
                  key={m}
                  className="pressable"
                  onClick={() => { audio.startSleepTimer(m); setShowTimer(false) }}
                  style={{
                    padding: '8px 14px', borderRadius: 999, fontSize: 12,
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

          {s.layers.map(layer => (
            <div key={layer.id} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
                <span style={{ fontSize: 14, color: 'var(--color-text)' }}>{layer.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {Math.round((audio.levels[layer.id] ?? 0) * 100)}%
                </span>
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

        <p style={{
          textAlign: 'center', marginTop: 20,
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--color-text-faint)',
        }}>
          No files · Web Audio synthesis
        </p>
      </div>
    </div>
  )
}
