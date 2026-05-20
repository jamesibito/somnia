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
  const { greeting, setPhase, atmosphereVariant } = useClock()
  useEffect(() => { setPhase('evening') }, [setPhase])
  const merged = mergedSessions(history)
  const ln = merged[merged.length - 1]
  const streak = deriveStreak(merged, prefs)

  return (
    <>
      <Screen tabSafe field variant={atmosphereVariant}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
          <SpiralMark size={22} color="var(--color-text)" strokeWidth={1.4} />
          <Eyebrow>Thu · 16 May</Eyebrow>
        </header>

        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 12, letterSpacing: '0.01em' }}>
          {greeting}, {USER.firstName}
        </p>
        <Display size={40} style={{ marginBottom: 16, letterSpacing: '-0.03em' }}>
          Wind‑down at{' '}
          <span style={{ color: 'var(--color-accent-bright)' }}>
            {plan.windDownLabel}
          </span>.
        </Display>
        {/* The loop, made visible: why tonight looks the way it does */}
        <p style={{ fontSize: 13, color: 'var(--color-text-faint)', lineHeight: 1.6, marginBottom: 36 }}>
          Shaped for <span style={{ color: 'var(--color-text-muted)' }}>{plan.goalClause}</span>
          {plan.adjusted && (
            <> · bedtime <span style={{ color: 'var(--color-accent)' }}>−{prefs.bedtimeAdjustMin}m</span> after last night</>
          )}.
        </p>

        {/* Last night */}
        <section
          className="pressable"
          onClick={() => navigate('/sleep')}
          style={{ paddingTop: 28, borderTop: '1px solid var(--color-hair)', marginBottom: 32 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <Eyebrow>Last night</Eyebrow>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)', letterSpacing: '0.03em' }}>
              {ln.bedtime} → {ln.wake}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18 }}>
            <BigNumber value={ln.score} size={100} />
            <div style={{ paddingBottom: 8, flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{ln.quality}</div>
              <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                {fmtDuration(ln.durationMin)}
              </div>
            </div>
            <ChevronRight size={17} color="var(--color-text-faint)" style={{ alignSelf: 'center' }} />
          </div>
          <div style={{ marginTop: 22 }}><StageBar {...ln.stages} /></div>
          <div style={{ display: 'flex', gap: 14, marginTop: 11 }}>
            <StageLegend icon="🌑" label="Deep" v={ln.stages.deep} c="var(--color-accent)" />
            <StageLegend icon="✦" label="REM" v={ln.stages.rem} c="var(--color-accent-dim)" />
            <StageLegend icon="◌" label="Light" v={ln.stages.light} c="rgba(155,124,232,0.5)" />
          </div>
        </section>

        {/* Tonight's plan — derived from onboarding answers */}
        <section style={{ paddingTop: 28, borderTop: '1px solid var(--color-hair)', marginBottom: 32 }}>
          <Eyebrow style={{ display: 'block', marginBottom: 16 }}>Tonight's plan</Eyebrow>
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

function StageLegend({ icon, label, v, c }: { icon: string; label: string; v: number; c: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ fontSize: 11, color: c, lineHeight: 1, userSelect: 'none' }}>{icon}</span>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', letterSpacing: '0.02em' }}>{label}</span>
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
