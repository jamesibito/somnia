import { useState } from 'react'
import { Screen, Eyebrow, Display } from '../components/ui'
import SpiralMark from '../components/SpiralMark'
import SelectorGrid, { type SelectorVariant } from '../components/SoundscapeSelector'

/**
 * /selector-test — a parked A/B/C comparison of the soundscape selector layouts,
 * kept for user testing. Not in the app's nav; share the URL to gather feedback
 * on which condensed layout reads best, then fold the winner into
 * SoundscapeLibrary. (Production currently ships variant "tiles".)
 */
const VARIANTS: { id: SelectorVariant; label: string; note: string }[] = [
  { id: 'tiles',   label: 'Tiles',   note: 'Texture tiles, 2-up. Most immersive.' },
  { id: 'circles', label: 'Circles', note: 'Orbs, 3-up. Keeps the ring identity.' },
  { id: 'rows',    label: 'Rows',    note: 'Compact list. Least scroll, fastest scan.' },
]

export default function SelectorTester() {
  const [variant, setVariant] = useState<SelectorVariant>('tiles')
  const active = VARIANTS.find(v => v.id === variant)!

  return (
    <Screen>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <SpiralMark size={20} color="var(--color-text)" strokeWidth={1.4} />
        <Eyebrow>Selector test</Eyebrow>
      </header>

      <Display size={28} style={{ marginBottom: 6 }}>Which feels best?</Display>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5, marginBottom: 18, lineHeight: 1.5 }}>
        Three condensed layouts for picking a soundscape. Tap through them and tell me which one
        you&apos;d actually want to use.
      </p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {VARIANTS.map(v => (
          <button
            key={v.id}
            className="pressable"
            onClick={() => setVariant(v.id)}
            style={{
              padding: '6px 12px', borderRadius: 999, fontSize: 11,
              fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em',
              background: variant === v.id ? 'var(--color-accent)' : 'var(--color-surface)',
              color: variant === v.id ? 'var(--color-accent-ink)' : 'var(--color-text-muted)',
              border: '1px solid var(--color-hair)',
            }}
          >
            {v.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 11.5, color: 'var(--color-text-faint)', fontStyle: 'italic', marginBottom: 24 }}>
        {active.note}
      </p>

      <SelectorGrid variant={variant} />
    </Screen>
  )
}
