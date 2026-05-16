import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import AtmosphereLayer from '../components/AtmosphereLayer'
import SpiralMark from '../components/SpiralMark'
import { Eyebrow, Display, PrimaryButton } from '../components/ui'
import { usePlan } from '../context/PlanProvider'

type Step = 'welcome' | 'schedule' | 'goals' | 'sounds' | 'permissions'
const ORDER: Step[] = ['welcome', 'schedule', 'goals', 'sounds', 'permissions']

const GOALS = [
  'Fall asleep faster',
  'Stay asleep through the night',
  'Wake up less groggy',
  'Quiet a racing mind',
  'Build a consistent rhythm',
]
const SOUND_PREFS = ['Rain', 'Ocean', 'Forest', 'Fire', 'White noise', 'Pure drone']

export default function Onboarding() {
  const navigate = useNavigate()
  const { setPrefs } = usePlan()
  const [step, setStep] = useState<Step>('welcome')
  const [goals, setGoals] = useState<string[]>(['Quiet a racing mind'])
  const [sounds, setSounds] = useState<string[]>(['Rain'])
  const [bedH, setBedH] = useState(11)
  const [bedM, setBedM] = useState(30)

  const idx = ORDER.indexOf(step)
  const finish = () => {
    // 9–12 on the wheel are PM; 12 means midnight (00:00).
    const hour24 = bedH === 12 ? 0 : bedH + 12
    setPrefs({
      bedtimeHour: hour24,
      bedtimeMinute: bedM,
      goals,
      soundPrefs: sounds,
      bedtimeAdjustMin: 0,
      onboarded: true,
    })
    navigate('/tonight')
  }
  const next = () => {
    if (idx < ORDER.length - 1) setStep(ORDER[idx + 1])
    else finish()
  }

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v])

  return (
    <div className="screen">
      <AtmosphereLayer variant="deep" grain={0.06} />
      <div className="screen-enter" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', padding: '64px 28px 40px' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
          {ORDER.map((s, i) => (
            <div key={s} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= idx ? 'var(--color-accent)' : 'var(--color-hair)',
              transition: 'background 400ms ease',
            }} />
          ))}
        </div>

        <div style={{ flex: 1 }} key={step}>
          {step === 'welcome' && (
            <div className="rise" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                <SpiralMark size={40} color="var(--color-accent)" />
                <Display size={38} style={{ marginTop: 28 }}>
                  Sleep is a<br />practice. Let's<br />make it yours.
                </Display>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 15, lineHeight: 1.6, marginTop: 20, maxWidth: 300 }}>
                  A few questions so Somnia can shape the nights around you — not the other way around.
                </p>
              </div>
            </div>
          )}

          {step === 'schedule' && (
            <div className="rise">
              <Eyebrow>Step 2 — Rhythm</Eyebrow>
              <Display size={30} style={{ marginTop: 16, marginBottom: 8 }}>
                When do you want to be asleep?
              </Display>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 36 }}>
                We'll send one gentle nudge when it's time to wind down — never a nag.
              </p>
              <Wheel bedH={bedH} bedM={bedM} setBedH={setBedH} setBedM={setBedM} />
            </div>
          )}

          {step === 'goals' && (
            <div className="rise">
              <Eyebrow>Step 3 — Intent</Eyebrow>
              <Display size={30} style={{ marginTop: 16, marginBottom: 8 }}>
                What are you here for?
              </Display>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 28 }}>Pick as many as feel true.</p>
              <ChipList options={GOALS} selected={goals} onToggle={v => toggle(goals, setGoals, v)} />
            </div>
          )}

          {step === 'sounds' && (
            <div className="rise">
              <Eyebrow>Step 4 — Sound</Eyebrow>
              <Display size={30} style={{ marginTop: 16, marginBottom: 8 }}>
                What quiets you?
              </Display>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 28 }}>
                We'll build your first soundscape from this.
              </p>
              <ChipList options={SOUND_PREFS} selected={sounds} onToggle={v => toggle(sounds, setSounds, v)} />
            </div>
          )}

          {step === 'permissions' && (
            <div className="rise" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <SpiralMark size={36} color="var(--color-accent)" />
                <Display size={30} style={{ marginTop: 24, marginBottom: 10 }}>
                  One last thing.
                </Display>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
                  Two permissions make Somnia work. Both optional, both changeable.
                </p>
                <Perm title="Sleep & motion" sub="So we can track sleep stages overnight." />
                <Perm title="A single bedtime notification" sub="The one nudge. Nothing else." />
              </div>
            </div>
          )}
        </div>

        <PrimaryButton onClick={next} style={{ marginTop: 24 }}>
          {step === 'permissions' ? 'Allow & enter Somnia' : step === 'welcome' ? 'Begin' : 'Continue'}
        </PrimaryButton>
        {step !== 'welcome' && step !== 'permissions' && (
          <button className="pressable" onClick={next} style={{ marginTop: 14, fontSize: 13, color: 'var(--color-text-faint)', alignSelf: 'center' }}>
            Skip for now
          </button>
        )}
      </div>
    </div>
  )
}

function Wheel({ bedH, bedM, setBedH, setBedM }: { bedH: number; bedM: number; setBedH: (n: number) => void; setBedM: (n: number) => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      padding: '28px 0',
    }}>
      <Spinner value={bedH} min={9} max={12} onChange={setBedH} pad={false} />
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 44, color: 'var(--color-text-muted)' }}>:</span>
      <Spinner value={bedM} min={0} max={55} step={5} onChange={setBedM} pad />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-text-muted)', marginLeft: 10, letterSpacing: '0.1em' }}>PM</span>
    </div>
  )
}

function Spinner({ value, min, max, step = 1, onChange, pad }: { value: number; min: number; max: number; step?: number; onChange: (n: number) => void; pad: boolean }) {
  const dec = () => onChange(value - step < min ? max : value - step)
  const inc = () => onChange(value + step > max ? min : value + step)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <button className="pressable" onClick={inc} aria-label="Increase" style={{ color: 'var(--color-text-faint)', fontSize: 18 }}>⌃</button>
      <div style={{
        fontFamily: 'var(--font-serif)', fontSize: 64, fontWeight: 300,
        color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums',
        width: 96, textAlign: 'center', letterSpacing: '-0.03em',
      }}>
        {pad ? String(value).padStart(2, '0') : value}
      </div>
      <button className="pressable" onClick={dec} aria-label="Decrease" style={{ color: 'var(--color-text-faint)', fontSize: 18 }}>⌄</button>
    </div>
  )
}

function ChipList({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {options.map(o => {
        const on = selected.includes(o)
        return (
          <button
            key={o}
            className="pressable focusable"
            onClick={() => onToggle(o)}
            aria-pressed={on}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 18px', borderRadius: 14, textAlign: 'left',
              background: on ? 'rgba(181,168,232,0.12)' : 'var(--color-surface)',
              border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-hair)'}`,
              color: 'var(--color-text)', fontSize: 15,
              transition: 'background 200ms ease, border-color 200ms ease',
            }}
          >
            {o}
            <span style={{
              width: 20, height: 20, borderRadius: 10,
              border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-text-faint)'}`,
              background: on ? 'var(--color-accent)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {on && <Check size={13} color="var(--color-accent-ink)" strokeWidth={3} />}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function Perm({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '16px 0', borderTop: '1px solid var(--color-hair)',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 11, marginTop: 1,
        background: 'var(--color-accent)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Check size={13} color="var(--color-accent-ink)" strokeWidth={3} />
      </div>
      <div>
        <div style={{ fontSize: 15, color: 'var(--color-text)', marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{sub}</div>
      </div>
    </div>
  )
}
