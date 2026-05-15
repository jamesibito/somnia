import { useNavigate } from 'react-router-dom'
import { Screen, Eyebrow, Display } from '../components/ui'
import TabBar from '../components/TabBar'
import SpiralMark from '../components/SpiralMark'
import { SOUNDSCAPES } from '../data/soundscapes'
import { useAudio } from '../context/AudioProvider'
import { Play } from 'lucide-react'

export default function SoundscapeLibrary() {
  const navigate = useNavigate()
  const { current, playing } = useAudio()

  return (
    <>
      <Screen tabSafe>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
          <SpiralMark size={20} color="var(--color-text)" strokeWidth={1.4} />
          <Eyebrow>Soundscapes</Eyebrow>
        </header>

        <Display size={32} style={{ marginBottom: 6 }}>Sound</Display>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 28 }}>
          Built in real time. Every layer is synthesized — mix it your way.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SOUNDSCAPES.map((s, i) => {
            const active = current?.id === s.id
            return (
              <button
                key={s.id}
                className="pressable focusable"
                onClick={() => navigate('/soundscape/' + s.id)}
                style={{
                  textAlign: 'left',
                  padding: 18,
                  borderRadius: 18,
                  background: active ? 'rgba(181,168,232,0.1)' : 'var(--color-surface)',
                  border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-hair)'}`,
                  display: 'flex', alignItems: 'center', gap: 16,
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                  background: `radial-gradient(circle at 30% 30%, rgba(155,118,255,0.5), rgba(98,72,200,0.25))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {active && playing ? (
                    <Bars />
                  ) : (
                    <Play size={16} fill="var(--color-text)" stroke="var(--color-text)" style={{ opacity: 0.85 }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                    fontSize: 18, color: 'var(--color-text)', marginBottom: 3,
                  }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>{s.tagline}</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-faint)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </button>
            )
          })}
        </div>
      </Screen>
      <TabBar />
    </>
  )
}

function Bars() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 16 }}>
      {[0.5, 1, 0.7, 0.9].map((h, i) => (
        <span key={i} style={{
          width: 2.5, background: 'var(--color-text)', borderRadius: 1,
          height: `${h * 100}%`,
          animation: `breathe ${0.8 + i * 0.2}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  )
}
