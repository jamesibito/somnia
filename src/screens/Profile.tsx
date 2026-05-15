import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Download, Trash2, Shield, Moon, Bell, Volume2 } from 'lucide-react'
import { Screen, Eyebrow, Display, Hairline } from '../components/ui'
import TabBar from '../components/TabBar'
import SpiralMark from '../components/SpiralMark'
import { USER } from '../data/content'

const THEMES = [
  { id: 'indigo', name: 'Pure Indigo', sw: ['#0E0824', '#B5A8E8'], available: true },
  { id: 'dusk', name: 'Dusk Rose', sw: ['#150F26', '#E8B8C0'], available: false },
  { id: 'moon', name: 'Moonstone', sw: ['#0E1226', '#D8DDF0'], available: false },
]

export default function Profile() {
  const navigate = useNavigate()
  const [theme, setTheme] = useState('indigo')
  const [uiSounds, setUiSounds] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [bedtimeNudge, setBedtimeNudge] = useState(true)

  return (
    <>
      <Screen tabSafe>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <SpiralMark size={20} color="var(--color-text)" strokeWidth={1.4} />
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

        {/* Streak band */}
        <div style={{
          marginTop: 22, padding: '16px 18px', borderRadius: 16,
          background: 'var(--color-surface)', border: '1px solid var(--color-hair)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
              {USER.streak} nights
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>in rhythm — your longest yet</div>
          </div>
          <SpiralMark size={30} color="var(--color-accent)" strokeWidth={1.4} />
        </div>

        {/* Personalization */}
        <SectionTitle>Appearance</SectionTitle>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
          Pure Indigo is the default. Two alternate themes are in the works.
        </p>
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          {THEMES.map(t => {
            const on = theme === t.id
            return (
              <button
                key={t.id}
                className="pressable"
                onClick={() => t.available && setTheme(t.id)}
                style={{
                  flex: 1, padding: 14, borderRadius: 16, textAlign: 'center',
                  background: 'var(--color-surface)',
                  border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-hair)'}`,
                  opacity: t.available ? 1 : 0.5,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 10 }}>
                  {t.sw.map(c => <span key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c, border: '1px solid rgba(255,255,255,0.12)' }} />)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text)' }}>{t.name}</div>
                <div style={{ fontSize: 10, color: 'var(--color-text-faint)', marginTop: 3 }}>
                  {t.available ? (on ? 'Active' : 'Tap to use') : 'Soon'}
                </div>
              </button>
            )
          })}
        </div>

        <SettingToggle icon={<Volume2 size={16} />} label="UI sounds" sub="Off by default — silence is the respectful default" on={uiSounds} set={setUiSounds} />
        <SettingToggle icon={<Moon size={16} />} label="Reduce motion" sub="Stills the drifting background" on={reduceMotion} set={setReduceMotion} />
        <SettingToggle icon={<Bell size={16} />} label="Bedtime nudge" sub={`One notification at ${USER.bedtimeGoal}`} on={bedtimeNudge} set={setBedtimeNudge} last />

        {/* Sleep goals */}
        <SectionTitle>Sleep goals</SectionTitle>
        <NavRow label="Bedtime target" value={USER.bedtimeGoal} onClick={() => {}} />
        <NavRow label="Wake target" value={USER.wakeGoal} onClick={() => navigate('/alarm')} />
        <NavRow label="Nightly goal" value={`${USER.sleepGoalHours} hours`} onClick={() => {}} last />

        {/* Data & privacy */}
        <SectionTitle>Your data</SectionTitle>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: 1.55 }}>
          Sleep and dream data lives on your device. Nothing is sold, ever.
        </p>
        <NavRow icon={<Shield size={15} />} label="Privacy & permissions" onClick={() => {}} />
        <NavRow icon={<Download size={15} />} label="Export my data" sub=".json" onClick={() => {}} />
        <NavRow icon={<Trash2 size={15} />} label="Delete all sleep data" destructive onClick={() => {}} last />

        <Hairline mt={30} mb={20} />
        <button
          className="pressable"
          onClick={() => navigate('/')}
          style={{ width: '100%', textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)', padding: '4px 0' }}
        >
          Sign out
        </button>
        <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-faint)', marginTop: 18, letterSpacing: '0.1em' }}>
          SOMNIA v0.1 · CONCEPT
        </p>
      </Screen>
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
