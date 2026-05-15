import { useNavigate } from 'react-router-dom'
import { Lock, Play } from 'lucide-react'
import { Screen, Eyebrow, Display } from '../components/ui'
import TabBar from '../components/TabBar'
import SpiralMark from '../components/SpiralMark'
import { MEDITATIONS } from '../data/content'

const CATS = ['Wind-down', 'Sleep', 'Calm', 'Morning'] as const

export default function MeditateLibrary() {
  const navigate = useNavigate()
  return (
    <>
      <Screen tabSafe variant="calm">
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
          <SpiralMark size={20} color="var(--color-text)" strokeWidth={1.4} />
          <Eyebrow>Meditate</Eyebrow>
        </header>
        <Display size={32} style={{ marginBottom: 6 }}>Guided</Display>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 30 }}>
          Short practices for the edge of sleep. Three ready now — more arriving.
        </p>

        {CATS.map(cat => {
          const items = MEDITATIONS.filter(m => m.category === cat)
          if (!items.length) return null
          return (
            <div key={cat} style={{ marginBottom: 28 }}>
              <Eyebrow style={{ display: 'block', marginBottom: 14 }}>{cat}</Eyebrow>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(m => (
                  <button
                    key={m.id}
                    className="pressable focusable"
                    onClick={() => m.available && navigate('/meditate/' + m.id)}
                    style={{
                      textAlign: 'left', padding: 16, borderRadius: 16,
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-hair)',
                      display: 'flex', alignItems: 'center', gap: 14,
                      opacity: m.available ? 1 : 0.55,
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: 'radial-gradient(circle at 30% 30%, rgba(155,118,255,0.4), rgba(98,72,200,0.2))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {m.available
                        ? <Play size={14} fill="var(--color-text)" stroke="var(--color-text)" style={{ opacity: 0.85 }} />
                        : <Lock size={14} color="var(--color-text-muted)" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--color-text)' }}>
                        {m.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>
                        {m.available ? `${m.narrator} · ${m.minutes} min` : 'Coming soon'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </Screen>
      <TabBar />
    </>
  )
}
