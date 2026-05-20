import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Download, Trash2, Shield, Moon, Bell, Volume2, Minus, Plus } from 'lucide-react'
import { Screen, Eyebrow, Display, Hairline } from '../components/ui'
import TabBar from '../components/TabBar'
import SpiralMark from '../components/SpiralMark'
import Wordmark from '../components/Wordmark'
import { USER } from '../data/content'
import { usePlan } from '../context/PlanProvider'
import { useSession } from '../context/SessionProvider'
import { deriveStreak } from '../utils/insight'
import { mergedSessions } from '../utils/sessions'

const THEMES = [
  { id: 'indigo', name: 'Pure Indigo', sw: ['#0E0824', '#B5A8E8'] },
  { id: 'moon', name: 'Moonstone', sw: ['#0E1226', '#C7D2EC'] },
] as const

function fmtClock(h: number, m: number) {
  const ap = h >= 12 ? 'PM' : 'AM'
  const hr = ((h + 11) % 12) + 1
  return `${hr}:${String(m).padStart(2, '0')} ${ap}`
}

export default function Profile() {
  const navigate = useNavigate()
  const { prefs, setPrefs } = usePlan()
  const { history, reset: resetSessions } = useSession()
  const streak = deriveStreak(mergedSessions(history), prefs)

  const [uiSounds, setUiSounds] = useState(false)
  const [bedtimeNudge, setBedtimeNudge] = useState(true)
  const [editing, setEditing] = useState<null | 'bedtime' | 'goal'>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  const flash = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2800)
  }

  const shiftBedtime = (deltaMin: number) => {
    const total = ((prefs.bedtimeHour * 60 + prefs.bedtimeMinute + deltaMin) % 1440 + 1440) % 1440
    setPrefs({ bedtimeHour: Math.floor(total / 60), bedtimeMinute: total % 60 })
  }
  const shiftGoal = (delta: number) => {
    setPrefs({ nightlyGoalHours: Math.min(9, Math.max(6, +(prefs.nightlyGoalHours + delta).toFixed(1))) })
  }

  const exportData = () => {
    try {
      const blob = new Blob([JSON.stringify({
        exportedAt: new Date().toISOString(),
        prefs: JSON.parse(localStorage.getItem('somnia.prefs.v1') || 'null'),
        sessions: JSON.parse(localStorage.getItem('somnia.sessions.v1') || '[]'),
      }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'somnia-data.json'
      a.click()
      URL.revokeObjectURL(url)
      flash('Exported somnia-data.json to your device.')
    } catch {
      flash('Export failed — nothing left this device.')
    }
  }

  const deleteData = () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    resetSessions()
    setConfirmDelete(false)
    flash('All sleep data cleared. Tonight resets to a fresh start.')
  }

  return (
    <>
      <Screen tabSafe>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <SpiralMark size={20} color="var(--color-text)" />
          <Eyebrow>Profile</Eyebrow>
        </header>

        {/* Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 30,
            background: 'radial-gradient(circle at 30% 30%, rgba(181,168,232,0.6), rgba(98,72,200,0.3))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--color-text)',
          }}>
            {USER.firstName[0]}
          </div>
          <div>
            <Display size={22}>{USER.fullName}</Display>
            <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 3 }}>{USER.member}</div>
          </div>
        </div>

        {/* Streak band — live */}
        <div style={{
          marginTop: 22, padding: '16px 18px', borderRadius: 16,
          background: 'var(--color-surface)', border: '1px solid var(--color-hair)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
              {streak.broken ? 'New start' : `${streak.count} nights`}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
              {streak.broken ? 'begin again tonight' : 'in rhythm — nights you hit your bedtime'}
            </div>
          </div>
          <SpiralMark size={30} color="var(--color-accent)" />
        </div>

        {/* Appearance */}
        <SectionTitle>Appearance</SectionTitle>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
          Pure Indigo is the default. Moonstone cools the night.
        </p>
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          {THEMES.map(t => {
            const on = prefs.theme === t.id
            return (
              <button
                key={t.id}
                className="pressable"
                onClick={() => { setPrefs({ theme: t.id }); flash(t.id === 'indigo' ? 'Pure Indigo restored.' : `${t.name} on.`) }}
                style={{
                  flex: 1, padding: 14, borderRadius: 16, textAlign: 'center',
                  background: 'var(--color-surface)',
                  border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-hair)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 10 }}>
                  {t.sw.map(c => <span key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c, border: '1px solid rgba(255,255,255,0.12)' }} />)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text)' }}>{t.name}</div>
                <div style={{ fontSize: 10, color: 'var(--color-text-faint)', marginTop: 3 }}>
                  {on ? 'Active' : 'Tap to use'}
                </div>
              </button>
            )
          })}
        </div>

        <SettingToggle icon={<Volume2 size={16} />} label="UI sounds" sub="Off by default — silence is the respectful default" on={uiSounds} set={v => { setUiSounds(v); flash(v ? 'UI sounds on.' : 'UI sounds off.') }} />
        <SettingToggle icon={<Moon size={16} />} label="Reduce motion" sub="Stills backgrounds, stops particle effects" on={!!prefs.reducedMotion} set={v => { setPrefs({ reducedMotion: v }); flash(v ? 'Motion reduced.' : 'Motion restored.') }} />
        <SettingToggle icon={<Bell size={16} />} label="Bedtime nudge" sub={`One notification at ${fmtClock(prefs.bedtimeHour, prefs.bedtimeMinute)}`} on={bedtimeNudge} set={v => { setBedtimeNudge(v); flash(v ? 'Bedtime nudge on.' : 'Bedtime nudge off.') }} last />

        {/* Sleep goals — real, write to the plan */}
        <SectionTitle>Sleep goals</SectionTitle>
        <StepperRow
          label="Bedtime target"
          value={fmtClock(prefs.bedtimeHour, prefs.bedtimeMinute)}
          open={editing === 'bedtime'}
          onToggle={() => setEditing(editing === 'bedtime' ? null : 'bedtime')}
          onMinus={() => shiftBedtime(-15)}
          onPlus={() => shiftBedtime(15)}
        />
        <NavRow label="Wake target" value={USER.wakeGoal} onClick={() => navigate('/alarm')} />
        <StepperRow
          label="Nightly goal"
          value={`${prefs.nightlyGoalHours} hours`}
          open={editing === 'goal'}
          onToggle={() => setEditing(editing === 'goal' ? null : 'goal')}
          onMinus={() => shiftGoal(-0.5)}
          onPlus={() => shiftGoal(0.5)}
          last
        />

        {/* Data & privacy — real behaviors */}
        <SectionTitle>Your data</SectionTitle>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: 1.55 }}>
          Sleep and dream data lives on your device. Nothing is sold, ever.
        </p>
        <NavRow
          icon={<Shield size={15} />}
          label="Privacy & permissions"
          onClick={() => flash('Everything stays on this device. No account, no servers, no selling — ever.')}
        />
        <NavRow icon={<Download size={15} />} label="Export my data" sub=".json" onClick={exportData} />
        <NavRow
          icon={<Trash2 size={15} />}
          label={confirmDelete ? 'Tap again to confirm' : 'Delete all sleep data'}
          destructive
          onClick={deleteData}
          last
        />

        <Hairline mt={30} mb={20} />
        <button
          className="pressable"
          onClick={() => navigate('/')}
          style={{ width: '100%', textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)', padding: '4px 0' }}
        >
          Sign out
        </button>
        {/* Colophon */}
        <div style={{
          marginTop: 30, paddingTop: 26, borderTop: '1px solid var(--color-hair)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.85 }}>
            <SpiralMark size={26} color="var(--color-text-muted)" />
            <Wordmark height={17} color="var(--color-text-muted)" />
          </div>
          <p style={{
            fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--color-text-muted)',
            textAlign: 'center', lineHeight: 1.5, maxWidth: 260,
          }}>
            A brand &amp; app concept by James Ibitoye.
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-faint)', textAlign: 'center', lineHeight: 1.6, maxWidth: 280 }}>
            Started as a 2D-Visualization brand project, evolved into a sleep,
            meditation &amp; white-noise product concept.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 4 }}>
            <a
              href="https://jamesibitoye.framer.website" target="_blank" rel="noopener noreferrer"
              className="pressable focusable"
              style={{ fontSize: 12.5, color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              Portfolio <span style={{ fontSize: 11 }}>↗</span>
            </a>
            <span style={{ width: 1, height: 12, background: 'var(--color-hair)' }} />
            <a
              href="https://github.com/jamesibito/somnia" target="_blank" rel="noopener noreferrer"
              className="pressable focusable"
              style={{ fontSize: 12.5, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              Source <span style={{ fontSize: 11 }}>↗</span>
            </a>
            <span style={{ width: 1, height: 12, background: 'var(--color-hair)' }} />
            <a
              href="/compare.html" target="_blank" rel="noopener noreferrer"
              className="pressable focusable"
              style={{ fontSize: 12.5, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              Themes <span style={{ fontSize: 11 }}>↗</span>
            </a>
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-faint)', marginTop: 6, letterSpacing: '0.14em' }}>
            SOMNIA · v0.3 · CONCEPT
          </p>
        </div>
      </Screen>

      {/* Transient confirmation */}
      <div style={{
        position: 'absolute', left: 20, right: 20, bottom: 104, zIndex: 75,
        display: 'flex', justifyContent: 'center',
        pointerEvents: 'none',
        opacity: toast ? 1 : 0,
        transform: toast ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 240ms ease, transform 240ms ease',
      }}>
        <div style={{
          maxWidth: '100%',
          padding: '12px 18px', borderRadius: 999,
          background: 'rgba(20,14,44,0.86)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid var(--color-hair)',
          fontSize: 12.5, color: 'var(--color-text)', textAlign: 'center', lineHeight: 1.4,
        }}>
          {toast}
        </div>
      </div>

      <TabBar />
    </>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Hairline mt={32} mb={20} />
      <Eyebrow style={{ display: 'block', marginBottom: 14 }}>{children}</Eyebrow>
    </>
  )
}

function SettingToggle({ icon, label, sub, on, set, last }: {
  icon: React.ReactNode; label: string; sub: string; on: boolean; set: (v: boolean) => void; last?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '15px 0', borderBottom: last ? 'none' : '1px solid var(--color-hair)',
    }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, color: 'var(--color-text)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{sub}</div>
      </div>
      <button
        className="pressable focusable" role="switch" aria-checked={on} aria-label={label}
        onClick={() => set(!on)}
        style={{
          width: 46, height: 28, borderRadius: 14, flexShrink: 0, padding: 3,
          background: on ? 'var(--color-accent)' : 'var(--color-hair)',
          transition: 'background 220ms ease',
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

function StepperRow({ label, value, open, onToggle, onMinus, onPlus, last }: {
  label: string; value: string; open: boolean; onToggle: () => void
  onMinus: () => void; onPlus: () => void; last?: boolean
}) {
  return (
    <div style={{ borderBottom: last && !open ? 'none' : '1px solid var(--color-hair)' }}>
      <button
        className="pressable focusable"
        onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '15px 0', textAlign: 'left' }}
      >
        <span style={{ flex: 1, fontSize: 15, color: 'var(--color-text)' }}>{label}</span>
        <span style={{ fontSize: 14, color: open ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>{value}</span>
        <ChevronRight size={16} color="var(--color-text-faint)" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 200ms ease' }} />
      </button>
      {open && (
        <div className="rise" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '6px 0 18px' }}>
          <StepBtn onClick={onMinus} aria="Decrease"><Minus size={16} /></StepBtn>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums', minWidth: 120, textAlign: 'center' }}>
            {value}
          </span>
          <StepBtn onClick={onPlus} aria="Increase"><Plus size={16} /></StepBtn>
        </div>
      )}
    </div>
  )
}

function StepBtn({ children, onClick, aria }: { children: React.ReactNode; onClick: () => void; aria: string }) {
  return (
    <button
      className="pressable focusable"
      onClick={onClick}
      aria-label={aria}
      style={{
        width: 40, height: 40, borderRadius: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-surface)', border: '1px solid var(--color-hair)',
        color: 'var(--color-text)',
      }}
    >
      {children}
    </button>
  )
}

function NavRow({ icon, label, value, sub, onClick, destructive, last }: {
  icon?: React.ReactNode; label: string; value?: string; sub?: string; onClick: () => void; destructive?: boolean; last?: boolean
}) {
  return (
    <button
      className="pressable focusable"
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14,
        padding: '15px 0', borderBottom: last ? 'none' : '1px solid var(--color-hair)',
        textAlign: 'left',
      }}
    >
      {icon && <span style={{ color: destructive ? 'var(--color-warn)' : 'var(--color-text-muted)' }}>{icon}</span>}
      <span style={{ flex: 1, fontSize: 15, color: destructive ? 'var(--color-warn)' : 'var(--color-text)' }}>{label}</span>
      {value && <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>{value}</span>}
      {sub && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-faint)' }}>{sub}</span>}
      <ChevronRight size={16} color="var(--color-text-faint)" />
    </button>
  )
}
