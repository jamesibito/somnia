import { useNavigate } from 'react-router-dom'
import { Screen, Eyebrow, Display } from '../components/ui'
import TabBar from '../components/TabBar'
import SpiralMark from '../components/SpiralMark'
import GenerativeField from '../components/GenerativeField'
import { SOUNDSCAPES, getPalette } from '../data/soundscapes'
import { useAudio } from '../context/AudioProvider'
import {
  CloudRain, Leaf, Waves, Flame,
  Radio, Moon, Sparkles, Droplets,
  type LucideProps,
} from 'lucide-react'
import type { ComponentType } from 'react'

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
 * Soundscape library — living-field discs (ported from the experience site's
 * selector). Each soundscape is a circular disc holding its real particle field
 * + a thin identity glyph + a tinted glow; the playing one stays lit. Tap a disc
 * to open its player + mixer.
 */
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
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 30 }}>
          Step into one and the room takes its colour. Every layer is yours to mix.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 16, rowGap: 22 }}>
          {SOUNDSCAPES.map((s) => {
            const active = current?.id === s.id
            const isPlaying = active && playing
            const pal = getPalette(s.id)
            const Icon = SOUNDSCAPE_ICONS[s.id]
            return (
              <button
                key={s.id}
                className="pressable focusable"
                onClick={() => navigate('/soundscape/' + s.id)}
                aria-label={`${s.name} — ${s.tagline}`}
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                }}
              >
                {/* Disc */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
                  {/* Glow */}
                  <div aria-hidden style={{
                    position: 'absolute', inset: '-12%', borderRadius: '50%',
                    background: `radial-gradient(circle, ${pal.tint}55 0%, transparent 68%)`,
                    opacity: isPlaying ? 1 : 0.5,
                    transition: 'opacity 500ms ease',
                  }} />
                  {/* Disc body with living field */}
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
                    border: `1px solid ${active ? pal.tint : 'rgba(255,255,255,0.12)'}`,
                    background: `radial-gradient(circle at 50% 38%, ${pal.tint}26 0%, rgba(10,4,32,0.6) 72%)`,
                    boxShadow: isPlaying
                      ? `0 0 26px ${pal.tint}55, inset 0 0 18px ${pal.tint}22`
                      : 'inset 0 0 14px rgba(0,0,0,0.4)',
                    transition: 'border-color 400ms ease, box-shadow 400ms ease',
                  }}>
                    <div style={{ position: 'absolute', inset: 0 }}>
                      <GenerativeField concept={pal.concept} tint={pal.tint} density={18} />
                    </div>
                    {Icon && (
                      <div aria-hidden style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                        <Icon
                          size={26}
                          color={pal.tint}
                          strokeWidth={1.3}
                          style={{
                            opacity: active ? 0.95 : 0.6,
                            filter: 'drop-shadow(0 1px 5px rgba(10,4,32,0.85))',
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Label */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--color-text)', lineHeight: 1.15 }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-text-faint)', marginTop: 2 }}>
                    {isPlaying ? 'now playing' : s.tagline}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </Screen>
      <TabBar />
    </>
  )
}
