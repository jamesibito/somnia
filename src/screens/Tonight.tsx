import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sunrise, Play, ChevronRight, Sparkles } from 'lucide-react'
import { Screen, Eyebrow, Display, BigNumber, StageBar } from '../components/ui'
import SpiralMark from '../components/SpiralMark'
import TabBar from '../components/TabBar'
import { usePlan } from '../context/PlanProvider'
import { useSession } from '../context/SessionProvider'
import { useClock } from '../context/ClockProvider'
import { fmtDuration, USER } from '../data/content'
import { deriveStreak } from '../utils/insight'
import { mergedSessions } from '../utils/sessions'

export default function Tonight() {
  const navigate = useNavigate()
  const { plan, prefs } = usePlan()
  const { history } = useSession()
  const { greeting, setPhase } = useClock()
  useEffect(() => { setPhase('evening') }, [setPhase])
  const merged = mergedSessions(history)
  const ln = merged[merged.length - 1]
  const streak = deriveStreak(merged, prefs)

  return (
    <>
      <Screen tabSafe field>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
          <SpiralMark size={22} color="var(--color-text)" strokeWidth={1.4} />
          <Eyebrow>Thu · 16 May</Eyebrow>
        </header>

        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 14 }}>
          {greeting}, {USER.firstName}
        </p>
        <Display size={36} style={{ marginBottom: 14 }}>
          Wind‑down at{' '}
          <span style={{ color: 'var(--color-accent-bright)', borderBottom: '2px solid rgba(201,187,245,0.4)', paddingBottom: 2 }}>
            {plan.windDownLabel}
          </span>.
        </Display>
        {/* The loop, made visible: why tonight looks the way it does */}
        <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 34 }}>
          Shaped for <span style={{ color: 'var(--color-text)' }}>{plan.goalClause}</span>
          {plan.adjusted && (
            <> · bedtime moved <span style={{ color: 'var(--color-accent)' }}>{prefs.bedtimeAdjustMin}m earlier</span> after last night</>
          )}.
        </p>

        {/* Last night */}
        <section
          className="pressable"
          onClick={() => navigate('/sleep')}
          style={{ paddingTop: 24, borderTop: '1px solid var(--color-hair)', marginBottom: 30 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Eyebrow>Last night</Eyebrow>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>
              {ln.bedtime} → {ln.wake}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <BigNumber value={ln.score} />
            <div style={{ paddingBottom: 10 }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--color-text)' }}>{ln.quality}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                {fmtDuration(ln.durationMin)}
              </div>
            </div>
            <ChevronRight size={18} color="var(--color-text-faint)" style={{ marginLeft: 'auto', alignSelf: 'center' }} />
          </div>
          <div style={{ marginTop: 20 }}><StageBar {...ln.stages} /></div>
          <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
            <Legend c="var(--color-accent)" label="Deep" v={ln.stages.deep} />
            <Legend c="var(--color-accent-dim)" label="REM" v={ln.stages.rem} />
            <Legend c="rgba(155,124,232,0.4)" label="Light" v={ln.stages.light} />
          </div>
        </section>

        {/* Tonight's plan — derived from onboarding answers */}
        <section style={{ paddingTop: 24, borderTop: '1px solid var(--color-hair)', marginBottom: 30 }}>
          <Eyebrow style={{ display: 'block', marginBottom: 14 }}>Tonight's plan</Eyebrow>
          <PlanRow
            icon={<Moon size={15} color="var(--color-text-muted)" strokeWidth={1.5} />}
            label="Bedtime"
            value={plan.bedtimeLabel}
            sub={plan.adjusted ? 'adjusted' : undefined}
            onClick={() => navigate('/profile')}
          />
          <PlanRow
            icon={<SpiralMark size={15} color="var(--color-accent)" strokeWidth={1.6} />}
            label={plan.soundscape.name}
            value={plan.soundscape.layers.map(l => l.label).slice(0, 2).join(' + ')}
            onClick={() => navigate('/soundscape/' + plan.soundscape.id)}
          />
          <PlanRow
            icon={<Sparkles size={15} color="var(--color-text-muted)" strokeWidth={1.5} />}
            label={plan.meditation.title}
            value={`${plan.meditation.minutes} min`}
            onClick={() => navigate('/meditate/' + plan.meditation.id)}
          />
          <PlanRow
            icon={<Sunrise size={15} color="var(--color-text-muted)" strokeWidth={1.5} />}
            label="Wake"
            value={plan.wakeLabel}
            sub="Sunrise"
            onClick={() => navigate('/alarm')}
            last
          />
        </section>

        {/* Primary action — enters the lights-out core job */}
        <button
          className="pressable focusable"
          onClick={() => navigate('/night')}
          style={{
            width: '100%', padding: '18px 22px', borderRadius: 16,
            background: 'var(--color-accent)', color: 'var(--color-accent-ink)',
            fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 14px 40px rgba(181,168,232,0.24), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}
        >
          <span>Begin tonight</span>
          <Play size={16} fill="var(--color-accent-ink)" stroke="var(--color-accent-ink)" />
        </button>

        <p style={{
          textAlign: 'center', fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: 13, color: 'var(--color-text-faint)', marginTop: 24,
        }}>
          {streak.broken
            ? 'A missed night isn’t a broken streak. Begin again tonight.'
            : `${streak.count} nights you hit your bedtime. Hold it.`}
        </p>
      </Screen>
      <TabBar />
    </>
  )
}

function Legend({ c, label, v }: { c: string; label: string; v: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: c }} />
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ fontSize: 11, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>{v}%</span>
    </div>
  )
}

function PlanRow({ icon, label, value, sub, onClick, last }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; onClick?: () => void; last?: boolean
}) {
  return (
    <div
      className="pressable"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 0',
        borderBottom: last ? 'none' : '1px solid var(--color-hair)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 18, display: 'flex', justifyContent: 'center' }}>{icon}</span>
        <span style={{ fontSize: 15, color: 'var(--color-text)' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {sub && <span style={{ fontSize: 11, color: 'var(--color-accent)' }}>{sub}</span>}
        <span style={{ fontSize: 14, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        <ChevronRight size={15} color="var(--color-text-faint)" />
      </div>
    </div>
  )
}
