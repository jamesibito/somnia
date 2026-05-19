import { useState, useRef } from 'react'
import { Screen, TopBar, Eyebrow, Display, Hairline } from '../components/ui'
import { ALARM } from '../data/content'

const WINDOWS = ['15 min', '20 min', '30 min', '45 min']
const SOUNDS = ['Dawn Chimes', 'Soft Bells', 'Slow Tide', 'Birdsong', 'Low Pulse']
const REPEATS = ['Mon · Tue · Wed · Thu · Fri', 'Every day', 'Sat · Sun', 'Mon · Wed · Fri']

export default function Alarm() {
  const [enabled, setEnabled] = useState(ALARM.enabled)
  const [sunrise, setSunrise] = useState(ALARM.sunrise)
  const [win, setWin] = useState(1)       // → '20 min'
  const [sound, setSound] = useState(0)   // → 'Dawn Chimes'
  const [repeat, setRepeat] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const tt = useRef<number | null>(null)

  const flash = (msg: string) => {
    setToast(msg)
    if (tt.current) clearTimeout(tt.current)
    tt.current = window.setTimeout(() => setToast(null), 2400)
  }
  const cycle = (
    arr: string[], i: number, set: (n: number) => void, label: string,
  ) => {
    const next = (i + 1) % arr.length
    set(next)
    flash(`${label}: ${arr[next]}`)
  }

  return (
    <Screen variant="dawn">
      <TopBar title="Smart wake" onBack />

      {/* Sunrise visualization */}
      <div style={{
        position: 'relative', height: 180, borderRadius: 24, overflow: 'hidden',
        marginBottom: 28, border: '1px solid var(--color-hair)',
        background: 'linear-gradient(180deg, #1a0f3a 0%, #2a1a55 55%, #4a3580 100%)',
      }}>
        <div style={{
          position: 'absolute', bottom: -70, left: '50%', transform: 'translateX(-50%)',
          width: 140, height: 140, borderRadius: '50%',
          background: 'radial-gradient(circle, #C9BBF5, #B5A8E8 50%, transparent 72%)',
          boxShadow: '0 0 80px 20px rgba(201,187,245,0.4)',
          animation: 'breathe 6s ease-in-out infinite',
        }} />
        <div style={{ position: 'absolute', top: 20, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, color: 'var(--color-text)', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
            {ALARM.target}
          </div>
          <Eyebrow style={{ marginTop: 4 }}>Sunrise begins {ALARM.windowStart}</Eyebrow>
        </div>
      </div>

      <Display size={24} style={{ marginBottom: 10 }}>
        We'll wake you in the lightest sleep before {ALARM.target}.
      </Display>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-muted)', marginBottom: 28 }}>
        Somnia watches your sleep stages and wakes you at the gentlest moment
        in the {WINDOWS[win]} before {ALARM.target} — so you wake clear, not jolted.
      </p>

      <Hairline mb={8} />
      <Toggle label="Smart wake" sub="Wake within the window, not on the dot" on={enabled}
        onChange={v => { setEnabled(v); flash(v ? 'Smart wake on' : 'Exact-time alarm') }} />
      <Toggle label="Sunrise light" sub="Screen brightens over 20 minutes" on={sunrise}
        onChange={v => { setSunrise(v); flash(v ? 'Sunrise light on' : 'Sunrise light off') }} />

      <CycleRow label="Wake window" value={`${WINDOWS[win]} before ${ALARM.target}`}
        onClick={() => cycle(WINDOWS, win, setWin, 'Wake window')} />
      <CycleRow label="Sound" value={SOUNDS[sound]}
        onClick={() => cycle(SOUNDS, sound, setSound, 'Sound')} />
      <CycleRow label="Repeat" value={REPEATS[repeat]} last
        onClick={() => cycle(REPEATS, repeat, setRepeat, 'Repeat')} />

      <Toast msg={toast} />
    </Screen>
  )
}

function Toggle({ label, sub, on, onChange }: { label: string; sub: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--color-hair)' }}>
      <div>
        <div style={{ fontSize: 15, color: 'var(--color-text)' }}>{label}</div>
        <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 3 }}>{sub}</div>
      </div>
      <button
        className="pressable focusable"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onChange(!on)}
        style={{
          width: 46, height: 28, borderRadius: 14, flexShrink: 0,
          background: on ? 'var(--color-accent)' : 'var(--color-hair)',
          padding: 3, transition: 'background 220ms ease',
        }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: 11, background: '#fff',
          transform: on ? 'translateX(18px)' : 'translateX(0)',
          transition: 'transform 220ms cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </button>
    </div>
  )
}

function CycleRow({ label, value, onClick, last }: { label: string; value: string; onClick: () => void; last?: boolean }) {
  return (
    <button
      className="pressable focusable"
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 0', borderBottom: last ? 'none' : '1px solid var(--color-hair)',
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 15, color: 'var(--color-text)' }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>{value}</span>
        <span style={{ fontSize: 12, color: 'var(--color-text-faint)' }}>⤿</span>
      </span>
    </button>
  )
}

function Toast({ msg }: { msg: string | null }) {
  return (
    <div style={{
      position: 'absolute', left: 20, right: 20, bottom: 40, zIndex: 75,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      opacity: msg ? 1 : 0,
      transform: msg ? 'translateY(0)' : 'translateY(8px)',
      transition: 'opacity 220ms ease, transform 220ms ease',
    }}>
      <div style={{
        padding: '11px 18px', borderRadius: 999,
        background: 'rgba(20,14,44,0.86)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid var(--color-hair)',
        fontSize: 12.5, color: 'var(--color-text)',
      }}>
        {msg}
      </div>
    </div>
  )
}
