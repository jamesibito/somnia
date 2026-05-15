import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pause, Play } from 'lucide-react'
import AtmosphereLayer from '../components/AtmosphereLayer'
import { TopBar, Eyebrow } from '../components/ui'
import { getMeditation } from '../data/content'
import * as engine from '../audio/engine'

export default function MeditatePlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const m = getMeditation(id || '')
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')
  const tick = useRef<number | null>(null)

  const total = (m?.minutes ?? 8) * 60

  // Soft synthesized ambient bed while the practice plays.
  useEffect(() => {
    let active = true
    engine.ensureRunning().then(() => {
      if (!active) return
      engine.setLayer('drone', 0.5)
      engine.setLayer('tide', 0.22)
    })
    return () => {
      active = false
      engine.stopAll()
    }
  }, [])

  useEffect(() => {
    if (!playing) { if (tick.current) clearInterval(tick.current); return }
    tick.current = window.setInterval(() => setT(x => Math.min(total, x + 1)), 1000)
    return () => { if (tick.current) clearInterval(tick.current) }
  }, [playing, total])

  // Breathing cadence 4-4-6
  useEffect(() => {
    const seq: Array<['in' | 'hold' | 'out', number]> = [['in', 4000], ['hold', 4000], ['out', 6000]]
    let i = 0
    let timer: number
    const run = () => {
      setPhase(seq[i][0])
      timer = window.setTimeout(() => { i = (i + 1) % seq.length; run() }, seq[i][1])
    }
    if (playing) run()
    return () => clearTimeout(timer)
  }, [playing])

  if (!m) return null

  const chapter = [...m.chapters].reverse().find(c => t >= c.at) ?? m.chapters[0]
  const mm = String(Math.floor(t / 60)).padStart(2, '0')
  const ss = String(t % 60).padStart(2, '0')
  const scale = phase === 'in' ? 1.18 : phase === 'hold' ? 1.18 : 0.86
  const dur = phase === 'in' ? 4 : phase === 'hold' ? 0.3 : 6

  return (
    <div className="screen">
      <AtmosphereLayer variant="calm" grain={0.06} />
      <div className="screen-enter" style={{ position: 'relative', minHeight: '100%', padding: '64px 28px 40px', display: 'flex', flexDirection: 'column' }}>
        <TopBar onBack right={<span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>{mm}:{ss}</span>} />

        <div style={{ textAlign: 'center' }}>
          <Eyebrow>{m.category} · {m.narrator}</Eyebrow>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 30, color: 'var(--color-text)', marginTop: 10, letterSpacing: '-0.02em' }}>
            {m.title}
          </h1>
        </div>

        {/* Breathing guide */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div aria-hidden style={{
            position: 'absolute', width: 240, height: 240, borderRadius: '50%',
            border: '1px solid var(--color-hair)',
          }} />
          <div
            aria-hidden
            style={{
              width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(155,118,255,0.5), rgba(98,72,200,0.12) 70%)',
              boxShadow: '0 0 60px rgba(155,118,255,0.3)',
              transform: `scale(${playing ? scale : 1})`,
              transition: `transform ${dur}s cubic-bezier(0.4,0,0.2,1)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              fontSize: 19, color: 'var(--color-text)',
              opacity: 0.92,
            }}>
              {playing ? (phase === 'in' ? 'Breathe in' : phase === 'hold' ? 'Hold' : 'Release') : 'Paused'}
            </span>
          </div>
        </div>

        {/* Chapter + progress */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--color-text-muted)' }}>
              {chapter?.title}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {m.chapters.map(c => (
              <div key={c.title} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: t >= c.at ? 'var(--color-accent)' : 'var(--color-hair)',
                transition: 'background 600ms ease',
              }} />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            className="pressable focusable"
            onClick={() => setPlaying(p => !p)}
            aria-label={playing ? 'Pause' : 'Play'}
            style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--color-accent)', color: 'var(--color-accent-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 14px 40px rgba(181,168,232,0.3), inset 0 1px 0 rgba(255,255,255,0.35)',
            }}
          >
            {playing
              ? <Pause size={24} fill="var(--color-accent-ink)" stroke="var(--color-accent-ink)" />
              : <Play size={24} fill="var(--color-accent-ink)" stroke="var(--color-accent-ink)" style={{ marginLeft: 3 }} />}
          </button>
        </div>

        {t >= total && (
          <button
            className="pressable"
            onClick={() => navigate('/journal/new')}
            style={{ marginTop: 22, textAlign: 'center', fontSize: 13, color: 'var(--color-accent)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
          >
            Practice complete — log a dream?
          </button>
        )}
      </div>
    </div>
  )
}
