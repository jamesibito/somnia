import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Screen, Eyebrow, Display } from '../components/ui'
import TabBar from '../components/TabBar'
import SpiralMark from '../components/SpiralMark'
import { useJournal } from '../context/JournalProvider'
import { MOODS } from '../data/content'

export default function Journal() {
  const navigate = useNavigate()
  const { entries } = useJournal()

  return (
    <>
      <Screen tabSafe variant="deep">
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
          <SpiralMark size={20} color="var(--color-text)" strokeWidth={1.4} />
          <Eyebrow>Dream journal</Eyebrow>
        </header>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
          <Display size={32}>Dreams</Display>
          <button
            className="pressable focusable"
            onClick={() => navigate('/journal/new')}
            aria-label="New entry"
            style={{
              width: 42, height: 42, borderRadius: 21,
              background: 'var(--color-accent)', color: 'var(--color-accent-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(181,168,232,0.25)',
            }}
          >
            <Plus size={20} />
          </button>
        </div>

        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 80, color: 'var(--color-text-muted)' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, marginBottom: 8 }}>
              Nothing recorded yet.
            </p>
            <p style={{ fontSize: 13 }}>Log a dream the moment you wake — they fade fast.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {entries.map(e => (
              <button
                key={e.id}
                className="pressable focusable"
                onClick={() => navigate('/journal/' + e.id)}
                style={{
                  textAlign: 'left', padding: 18, borderRadius: 18,
                  background: 'var(--color-surface)', border: '1px solid var(--color-hair)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--color-accent)', fontSize: 15 }}>{MOODS[e.mood].glyph}</span>
                    <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                      {MOODS[e.mood].label}
                    </span>
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-faint)' }}>
                    {new Date(e.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--color-text)', marginBottom: 6 }}>
                  {e.title}
                </div>
                <p style={{
                  fontSize: 13.5, lineHeight: 1.55, color: 'var(--color-text-muted)',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {e.body}
                </p>
                {e.linkedSession && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
                    paddingTop: 12, borderTop: '1px solid var(--color-hair)',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--color-accent-bright)',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {e.linkedSession.score}
                    </span>
                    <span style={{ fontSize: 11.5, color: 'var(--color-text-faint)' }}>
                      {e.linkedSession.quality} night · {e.linkedSession.soundscape}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </Screen>
      <TabBar />
    </>
  )
}
