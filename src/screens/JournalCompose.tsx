import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Screen, TopBar, Eyebrow, PrimaryButton } from '../components/ui'
import { useJournal } from '../context/JournalProvider'
import { usePlan } from '../context/PlanProvider'
import { MOODS, LAST_NIGHT, type DreamEntry } from '../data/content'

const MOOD_KEYS = Object.keys(MOODS) as DreamEntry['mood'][]

export default function JournalCompose() {
  const navigate = useNavigate()
  const { add } = useJournal()
  const { plan } = usePlan()
  const [mood, setMood] = useState<DreamEntry['mood']>('calm')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')

  const save = () => {
    add({
      mood,
      title: title.trim() || 'Untitled dream',
      body: body.trim() || '—',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      // Tie this dream to last night — the loop, not a standalone note.
      linkedSession: {
        score: LAST_NIGHT.score,
        quality: LAST_NIGHT.quality,
        soundscape: plan.soundscape.name,
      },
    })
    navigate('/journal')
  }

  return (
    <Screen variant="deep">
      <TopBar onBack right={
        <button className="pressable focusable" onClick={save} style={{ fontSize: 14, color: 'var(--color-accent)', fontWeight: 600 }}>
          Save
        </button>
      } />

      <Eyebrow>New entry · {new Date().toLocaleDateString('en', { weekday: 'long' })} morning</Eyebrow>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--color-text)', marginTop: 12, marginBottom: 22 }}>
        Before it fades — what do you remember?
      </p>

      {/* The link, made visible while writing */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 14px', borderRadius: 12, marginBottom: 24,
        background: 'var(--color-surface)', border: '1px solid var(--color-hair)',
      }}>
        <span style={{ width: 7, height: 7, borderRadius: 4, background: 'var(--color-accent)' }} />
        <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>
          Tied to last night — <span style={{ color: 'var(--color-text)' }}>{LAST_NIGHT.score} {LAST_NIGHT.quality}</span>, {plan.soundscape.name}
        </span>
      </div>

      {/* Mood */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 26 }}>
        {MOOD_KEYS.map(k => {
          const on = mood === k
          return (
            <button
              key={k}
              className="pressable"
              onClick={() => setMood(k)}
              style={{
                flex: 1, padding: '12px 0', borderRadius: 14,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: on ? 'rgba(181,168,232,0.12)' : 'var(--color-surface)',
                border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-hair)'}`,
              }}
            >
              <span style={{ fontSize: 18, color: on ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                {MOODS[k].glyph}
              </span>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{MOODS[k].label}</span>
            </button>
          )
        })}
      </div>

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Give it a title…"
        style={{
          width: '100%', background: 'transparent', border: 'none',
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: 24, color: 'var(--color-text)',
          padding: '8px 0', marginBottom: 12,
        }}
      />
      <div style={{ height: 1, background: 'var(--color-hair)', marginBottom: 18 }} />
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="It started somewhere I half-recognized…"
        rows={7}
        style={{
          width: '100%', background: 'transparent', border: 'none', resize: 'none',
          fontSize: 15.5, lineHeight: 1.7, color: 'var(--color-text)',
          fontFamily: 'var(--font-sans)',
        }}
      />
      <input
        value={tags}
        onChange={e => setTags(e.target.value)}
        placeholder="tags, comma separated"
        style={{
          width: '100%', background: 'var(--color-surface)',
          border: '1px solid var(--color-hair)', borderRadius: 12,
          fontSize: 13, color: 'var(--color-text)', padding: '12px 14px',
          marginTop: 18, marginBottom: 26,
        }}
      />
      <PrimaryButton onClick={save}>Save to journal</PrimaryButton>
    </Screen>
  )
}
