import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pause, Play, SkipBack, SkipForward, Clock, X, Heart, ChevronUp, ChevronDown } from 'lucide-react'
import AtmosphereLayer from '../components/AtmosphereLayer'
import GenerativeField from '../components/GenerativeField'
import Fader from '../components/Fader'
import SpiralMark from '../components/SpiralMark'
import { TopBar } from '../components/ui'
import { useAudio } from '../context/AudioProvider'
import { getSoundscape, getPalette, SOUNDSCAPES } from '../data/soundscapes'

const TIMER_OPTS = [15, 30, 45, 60, 90]

// Faint fractal-noise grain — laid over the hero orb's glow so the pulses read
// as organic light rather than a clean CSS gradient.
const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

// ─── Saved mixes (your default preset per soundscape) ───────────────────────
const PRESET_KEY = 'somnia.presets.v1'
interface Preset { levels: Record<string, number>; master: number; soften: number; rumble: number }
function loadPresets(): Record<string, Preset> {
  try { return JSON.parse(localStorage.getItem(PRESET_KEY) || '{}') } catch { return {} }
}
function savePreset(id: string, p: Preset) {
  const all = loadPresets(); all[id] = p
  try { localStorage.setItem(PRESET_KEY, JSON.stringify(all)) } catch { /* quota */ }
}
function clearPreset(id: string) {
  const all = loadPresets(); delete all[id]
  try { localStorage.setItem(PRESET_KEY, JSON.stringify(all)) } catch { /* quota */ }
}

export default function SoundscapePlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const audio = useAudio()
  const s = getSoundscape(id || '')
  const pal = getPalette(s?.id)
  const [showTimer, setShowTimer] = useState(false)
  const [faved, setFaved] = useState(false)
  const [mixerExpanded, setMixerExpanded] = useState(false)

  // Auto-start this soundscape, then apply the saved mix (your default preset)
  // if one exists for it — otherwise the soundscape's defaults stand.
  useEffect(() => {
    if (!s) return
    const preset = loadPresets()[s.id]
    setFaved(!!preset)
    const apply = () => {
      if (!preset) return
      Object.entries(preset.levels).forEach(([lid, v]) => audio.setLevel(lid, v))
      audio.setMaster(preset.master)
      audio.setSoftenHighs(preset.soften)
      audio.setCutRumble(preset.rumble)
    }
    if (audio.current?.id !== s.id) audio.play(s).then(apply)
    else apply()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s?.id])

  const toggleFav = () => {
    if (!s) return
    if (faved) { clearPreset(s.id); setFaved(false) }
    else {
      savePreset(s.id, {
        levels: { ...audio.levels },
        master: audio.master, soften: audio.softenHighs, rumble: audio.cutRumble,
      })
      setFaved(true)
    }
  }

  if (!s) {
    return (
      <div className="screen">
        <AtmosphereLayer />
        <div className="screen-body">
          <div style={{ position: 'relative', padding: 64 }}>
            <TopBar onBack />
            <p style={{ color: 'var(--color-text-muted)' }}>Soundscape not found.</p>
          </div>
        </div>
      </div>
    )
  }

  const isCurrent = audio.current?.id === s.id
  const playing = isCurrent && audio.playing
  const mm = String(Math.floor(audio.elapsed / 60)).padStart(2, '0')
  const ss = String(audio.elapsed % 60).padStart(2, '0')
  const idx = SOUNDSCAPES.findIndex(x => x.id === s.id)
  const cycle = (dir: number) =>
    navigate('/soundscape/' + SOUNDSCAPES[(idx + dir + SOUNDSCAPES.length) % SOUNDSCAPES.length].id, { replace: true })

  return (
    <div className="screen">
      <AtmosphereLayer grain={0.07} reactive colors={pal} />
      <GenerativeField tint={pal.tint} concept={pal.concept} />

      {/* Reactive glow — fixed backdrop */}
      <div aria-hidden style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(155,118,255,0.35), transparent 70%)',
        filter: 'blur(40px)',
        opacity: playing ? 0.9 : 0.35,
        transition: 'opacity 1.2s ease',
        pointerEvents: 'none',
      }} />

      <div className="screen-body">
        <div className="screen-enter" style={{
          position: 'relative', padding: '46px 22px 18px',
          height: '100%', display: 'flex', flexDirection: 'column',
        }}>
          <TopBar
            onBack
            right={
              <button
                className="pressable focusable"
                onClick={() => { audio.stop(); navigate('/soundscape') }}
                aria-label="End"
              >
                <X size={20} color="var(--color-text-muted)" />
              </button>
            }
          />

          {/* Title — shifted up + tighter so the orb + mixer get room to breathe */}
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <h1 style={{
              fontFamily: 'var(--font-serif)', fontWeight: 400,
              fontSize: 27, color: 'var(--color-text)', letterSpacing: '-0.02em',
            }}>
              {s.name}
            </h1>
            <p style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 5 }}>
              {s.tagline}
            </p>
          </div>

          {/* Hero orb — pulses tinted to the soundscape, with a faint grain so
              they blend like real light rather than a clean gradient. */}
          <div style={{
            position: 'relative', width: 168, height: 168,
            margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <div aria-hidden style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: `1px solid ${pal.tint}`,
              animation: playing ? 'breathe-ring 5s ease-in-out infinite' : 'none', opacity: 0.28,
            }} />
            <div aria-hidden style={{
              position: 'absolute', inset: 20, borderRadius: '50%',
              border: `1px solid ${pal.tint}`,
              animation: playing ? 'breathe-ring 5s ease-in-out -1.8s infinite' : 'none', opacity: 0.38,
            }} />
            <div aria-hidden style={{
              position: 'absolute', inset: 38, borderRadius: '50%',
              background: `radial-gradient(circle, ${pal.tint}cc, rgba(155,118,255,0.32) 45%, transparent 72%)`,
              filter: 'blur(14px)',
            }} />
            {/* Grain overlay on the glow — soft-light, very subtle */}
            <div aria-hidden style={{
              position: 'absolute', inset: 28, borderRadius: '50%', overflow: 'hidden',
              backgroundImage: GRAIN, backgroundSize: '120px 120px',
              mixBlendMode: 'soft-light', opacity: 0.5, pointerEvents: 'none',
            }} />
            <SpiralMark size={54} color="var(--color-accent)" strokeWidth={1} spinning={playing} />
          </div>

          {/* Transport — timer inline with elapsed */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>
                {mm}:{ss}
              </span>
              <button
                className="pressable"
                onClick={() => setShowTimer(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--font-mono)',
                  color: audio.sleepTimer ? pal.tint : 'var(--color-text-muted)',
                  textShadow: audio.sleepTimer ? `0 0 9px ${pal.tint}99` : 'none',
                }}
              >
                <Clock size={11} />
                {audio.sleepTimer ? `${audio.sleepTimer}m left` : 'timer'}
              </button>
            </div>

            <div style={{ height: 2, background: 'var(--color-hair)', borderRadius: 2, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{
                height: '100%',
                background: audio.sleepTimer ? pal.tint : 'var(--color-accent)',
                boxShadow: audio.sleepTimer ? `0 0 8px ${pal.tint}aa` : 'none',
                width: audio.sleepTimer ? `${Math.min(100, (audio.elapsed / (audio.sleepTimer * 60)) * 100)}%` : '100%',
                opacity: audio.sleepTimer ? 1 : 0.25,
                transition: 'width 1s linear',
              }} />
            </div>

            {showTimer && (
              <div className="rise" style={{ display: 'flex', gap: 7, marginBottom: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                {TIMER_OPTS.map(m => {
                  const on = audio.sleepTimer === m
                  return (
                    <button
                      key={m}
                      className="pressable"
                      onClick={() => { audio.startSleepTimer(m); setShowTimer(false) }}
                      style={{
                        padding: '6px 12px', borderRadius: 999, fontSize: 11.5, fontFamily: 'var(--font-mono)',
                        background: on ? pal.tint : 'var(--color-surface)',
                        color: on ? '#10081F' : 'var(--color-text-muted)',
                        border: `1px solid ${on ? pal.tint : 'var(--color-hair)'}`,
                        boxShadow: on ? `0 0 14px ${pal.tint}66` : 'none',
                      }}
                    >
                      {m}m
                    </button>
                  )
                })}
                {audio.sleepTimer != null && (
                  <button
                    className="pressable"
                    onClick={() => { audio.cancelSleepTimer(); setShowTimer(false) }}
                    style={{
                      padding: '6px 14px', borderRadius: 999, fontSize: 11.5, fontFamily: 'var(--font-mono)',
                      background: 'transparent', color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-hair)',
                    }}
                  >
                    Off
                  </button>
                )}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 38 }}>
              <button className="pressable focusable" aria-label="Previous" onClick={() => cycle(-1)}>
                <SkipBack size={22} color="var(--color-text-muted)" strokeWidth={1.5} />
              </button>
              <button
                className="pressable focusable"
                aria-label={playing ? 'Pause' : 'Play'}
                onClick={() => (isCurrent ? audio.toggle() : audio.play(s))}
                style={{
                  width: 74, height: 74, borderRadius: '50%',
                  background: 'var(--color-accent)', color: 'var(--color-accent-ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 14px 38px rgba(181,168,232,0.32), inset 0 1px 0 rgba(255,255,255,0.35)',
                }}
              >
                {playing
                  ? <Pause size={24} fill="var(--color-accent-ink)" stroke="var(--color-accent-ink)" />
                  : <Play size={24} fill="var(--color-accent-ink)" stroke="var(--color-accent-ink)" style={{ marginLeft: 2 }} />}
              </button>
              <button className="pressable focusable" aria-label="Next" onClick={() => cycle(1)}>
                <SkipForward size={22} color="var(--color-text-muted)" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Mixer — a frosted glass card (like the experience site). The card
              holds the whole mix and scrolls INTERNALLY, so the page itself never
              scrolls regardless of how many layers a soundscape has. */}
          <section style={{
            display: 'flex', flexDirection: 'column',
            borderRadius: 22, padding: '14px 16px 6px',
            border: '1px solid rgba(234,226,255,0.09)',
            backdropFilter: 'blur(20px) saturate(120%)',
            WebkitBackdropFilter: 'blur(20px) saturate(120%)',
            boxShadow: '0 -10px 40px -28px rgba(0,0,0,0.8)',
            ...(mixerExpanded
              ? { position: 'absolute', left: 16, right: 16, top: 48, bottom: 16, zIndex: 30, background: 'rgba(14,8,30,0.92)' }
              : { flex: 1, minHeight: 0, background: 'rgba(20,12,40,0.5)' }),
          }}>
            {/* Card header — MIXER taps to expand into a sheet + save-as-default */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <button
                className="pressable focusable"
                onClick={() => setMixerExpanded(v => !v)}
                aria-label={mixerExpanded ? 'Collapse mixer' : 'Expand mixer'}
                style={{ display: 'flex', alignItems: 'center', gap: 7 }}
              >
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.22em',
                  textTransform: 'uppercase', color: 'var(--color-text)',
                }}>
                  Mixer
                </span>
                {mixerExpanded
                  ? <ChevronDown size={14} color="var(--color-text-muted)" strokeWidth={2} />
                  : <ChevronUp size={14} color="var(--color-text-muted)" strokeWidth={2} />}
              </button>
              <button
                className="pressable focusable"
                onClick={toggleFav}
                aria-label={faved ? 'Remove saved mix' : 'Save this mix as your default'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 11px', borderRadius: 999,
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: faved ? 'rgba(181,168,232,0.16)' : 'transparent',
                  border: `1px solid ${faved ? 'var(--color-accent)' : 'var(--color-hair)'}`,
                  color: faved ? 'var(--color-accent-bright)' : 'var(--color-text-muted)',
                }}
              >
                <Heart size={12} fill={faved ? 'currentColor' : 'none'} strokeWidth={1.8} />
                {faved ? 'Saved' : 'Save mix'}
              </button>
            </div>

            {/* Scrollable fader stack */}
            <div style={{
              flex: 1, minHeight: 0, overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: 13, paddingBottom: 6,
            }}>
              {/* Per-layer faders — tinted to the soundscape */}
              {s.layers.map(layer => (
                <Fader
                  key={layer.id}
                  label={layer.label}
                  tint={pal.tint}
                  value={audio.levels[layer.id] ?? 0}
                  onChange={v => audio.setLevel(layer.id, v)}
                />
              ))}

              {/* Seam between layers and the global tone controls */}
              <div style={{ height: 1, background: 'var(--color-hair)', margin: '3px 0' }} />

              {/* Global tone — master + the two filters, neutral lavender */}
              <Fader label="Volume" tint="var(--color-accent-bright)" value={audio.master} onChange={audio.setMaster} />
              <Fader label="Soften" tint="var(--color-accent)" value={audio.softenHighs} onChange={audio.setSoftenHighs} />
              <Fader label="De-rumble" tint="var(--color-accent)" value={audio.cutRumble} onChange={audio.setCutRumble} />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
