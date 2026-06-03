import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GenerativeField from './GenerativeField'
import { SOUNDSCAPES, getPalette } from '../data/soundscapes'
import { useAudio } from '../context/AudioProvider'
import {
  CloudRain, Leaf, Waves, Flame,
  Radio, Moon, Sparkles, Droplets,
  type LucideProps,
} from 'lucide-react'
import type { ComponentType } from 'react'

export type SelectorVariant = 'tiles' | 'circles' | 'rows'

const SOUNDSCAPE_ICONS: Record<string, ComponentType<LucideProps>> = {
  'light-rainstorm': CloudRain,
  'cedar-forest':    Leaf,
  'slow-tide':       Waves,
  'hearth':          Flame,
  'static-bloom':    Radio,
  'deep-drift':      Moon,
  'fairy-forest':    Sparkles,
  'underwater':      Droplets,
}

/**
 * SelectorGrid — the soundscape picker, in three condensed layouts. Each tile
 * keeps the real GenerativeField texture + identity glyph, and lights its
 * tinted border-glow on press-and-hold (touch) or hover (desktop). Tap opens
 * the player. Shared by SoundscapeLibrary (variant="tiles") and the
 * /selector-test page (all three, behind a toggle).
 */
export default function SelectorGrid({ variant }: { variant: SelectorVariant }) {
  const navigate = useNavigate()
  const { current, playing } = useAudio()
  const [held, setHeld] = useState<string | null>(null)

  const press = (id: string) => ({
    onPointerDown: () => setHeld(id),
    onPointerEnter: () => setHeld(id),
    onPointerLeave: () => setHeld(h => (h === id ? null : h)),
    onPointerUp: () => setHeld(h => (h === id ? null : h)),
    onPointerCancel: () => setHeld(h => (h === id ? null : h)),
    onClick: () => navigate('/soundscape/' + id),
  })
  const isLit = (id: string) => held === id || (current?.id === id && playing)

  if (variant === 'tiles') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {SOUNDSCAPES.map(s => {
          const pal = getPalette(s.id)
          const Icon = SOUNDSCAPE_ICONS[s.id]
          const lit = isLit(s.id)
          return (
            <button key={s.id} className="focusable" {...press(s.id)} aria-label={`${s.name} — ${s.tagline}`}
              style={{
                position: 'relative', padding: 0, border: 'none', cursor: 'pointer',
                aspectRatio: '5 / 4', borderRadius: 18, overflow: 'hidden',
                boxShadow: lit ? `0 0 0 1px ${pal.tint}, 0 0 22px ${pal.tint}55` : 'inset 0 0 0 1px var(--color-hair)',
                transition: 'box-shadow 320ms ease',
              }}>
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 35%, ${pal.tint}30, ${pal.b2} 80%)` }} />
              <div style={{ position: 'absolute', inset: 0 }}>
                <GenerativeField concept={pal.concept} tint={pal.tint} density={16} />
              </div>
              {Icon && (
                <div aria-hidden style={{ position: 'absolute', top: 12, left: 14 }}>
                  <Icon size={20} color={pal.tint} strokeWidth={1.4} style={{ filter: 'drop-shadow(0 1px 5px rgba(10,4,32,0.85))', opacity: 0.95 }} />
                </div>
              )}
              <div style={{
                position: 'absolute', insetInline: 0, bottom: 0, padding: '22px 14px 12px', textAlign: 'left',
                background: 'linear-gradient(to top, rgba(8,4,26,0.78), transparent)',
              }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: '#fff', lineHeight: 1.1 }}>{s.name}</div>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  if (variant === 'circles') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: 12, rowGap: 18 }}>
        {SOUNDSCAPES.map(s => {
          const pal = getPalette(s.id)
          const Icon = SOUNDSCAPE_ICONS[s.id]
          const lit = isLit(s.id)
          return (
            <button key={s.id} className="focusable" {...press(s.id)} aria-label={`${s.name} — ${s.tagline}`}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{
                position: 'relative', width: '100%', aspectRatio: '1 / 1', borderRadius: '50%', overflow: 'hidden',
                border: `1px solid ${lit ? pal.tint : 'rgba(255,255,255,0.12)'}`,
                background: `radial-gradient(circle at 50% 38%, ${pal.tint}26, rgba(10,4,32,0.6) 72%)`,
                boxShadow: lit ? `0 0 20px ${pal.tint}55, inset 0 0 14px ${pal.tint}22` : 'inset 0 0 12px rgba(0,0,0,0.4)',
                transition: 'box-shadow 320ms ease, border-color 320ms ease',
              }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                  <GenerativeField concept={pal.concept} tint={pal.tint} density={14} />
                </div>
                {Icon && (
                  <div aria-hidden style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                    <Icon size={20} color={pal.tint} strokeWidth={1.4} style={{ opacity: lit ? 0.95 : 0.6, filter: 'drop-shadow(0 1px 5px rgba(10,4,32,0.85))' }} />
                  </div>
                )}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 12.5, color: 'var(--color-text)', textAlign: 'center', lineHeight: 1.15 }}>{s.name}</div>
            </button>
          )
        })}
      </div>
    )
  }

  // rows
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {SOUNDSCAPES.map(s => {
        const pal = getPalette(s.id)
        const Icon = SOUNDSCAPE_ICONS[s.id]
        const lit = isLit(s.id)
        return (
          <button key={s.id} className="focusable" {...press(s.id)} aria-label={`${s.name} — ${s.tagline}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
              padding: 10, borderRadius: 16, cursor: 'pointer',
              background: 'var(--color-surface)',
              border: `1px solid ${lit ? pal.tint : 'var(--color-hair)'}`,
              boxShadow: lit ? `0 0 16px ${pal.tint}40` : 'none',
              transition: 'box-shadow 320ms ease, border-color 320ms ease',
            }}>
            <div style={{
              position: 'relative', width: 52, height: 52, flexShrink: 0, borderRadius: 13, overflow: 'hidden',
              background: `radial-gradient(circle at 40% 35%, ${pal.tint}33, ${pal.b2} 82%)`,
            }}>
              <div style={{ position: 'absolute', inset: 0 }}>
                <GenerativeField concept={pal.concept} tint={pal.tint} density={12} />
              </div>
              {Icon && (
                <div aria-hidden style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                  <Icon size={17} color={pal.tint} strokeWidth={1.5} style={{ filter: 'drop-shadow(0 1px 4px rgba(10,4,32,0.85))' }} />
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--color-text)', marginBottom: 2 }}>{s.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>{s.tagline}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
