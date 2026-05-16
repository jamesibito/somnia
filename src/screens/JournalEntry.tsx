import { useParams, useNavigate } from 'react-router-dom'
import { Screen, TopBar } from '../components/ui'
import { useJournal } from '../context/JournalProvider'
import { MOODS } from '../data/content'

export default function JournalEntry() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { get } = useJournal()
  const e = id ? get(id) : undefined

  if (!e) {
    return (
      <Screen variant="deep">
        <TopBar onBack />
        <p style={{ color: 'var(--color-text-muted)' }}>Entry not found.</p>
      </Screen>
    )
  }

  return (
    <Screen variant="deep">
      <TopBar onBack right={
        <button className="pressable" onClick={() => navigate('/journal')} style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          Done
        </button>
      } />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <span style={{ color: 'var(--color-accent)', fontSize: 18 }}>{MOODS[e.mood].glyph}</span>
        <span style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
          {MOODS[e.mood].label}
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-faint)' }}>
          {new Date(e.date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <h1 style={{
        fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400,
        fontSize: 30, color: 'var(--color-text)', letterSpacing: '-0.02em',
        lineHeight: 1.15, marginBottom: 22,
      }}>
        {e.title}
      </h1>

      <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--color-text)', opacity: 0.92 }}>
        {e.body}
      </p>

      {e.linkedSession && (
        <div style={{
          marginTop: 28, padding: 18, borderRadius: 16,
          background: 'var(--color-surface)', border: '1px solid var(--color-hair)',
          display: 'flex', alignItems: 'center', gap: 18,
        }}>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: 40, lineHeight: 1,
            color: 'var(--color-accent-bright)', fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.03em',
          }}>
            {e.linkedSession.score}
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 5 }}>
              The night this came from
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-text)' }}>
              {e.linkedSession.quality} sleep · fell asleep to {e.linkedSession.soundscape}
            </div>
          </div>
        </div>
      )}

      {e.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 30 }}>
          {e.tags.map(t => (
            <span key={t} style={{
              padding: '7px 14px', borderRadius: 999,
              background: 'var(--color-surface)', border: '1px solid var(--color-hair)',
              fontSize: 12, color: 'var(--color-text-muted)',
            }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </Screen>
  )
}
