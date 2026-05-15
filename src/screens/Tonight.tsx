import { useNavigate } from 'react-router-dom'
import { Moon, Sunrise, Play, ChevronRight, Sparkles } from 'lucide-react'
import { Screen, Eyebrow, Display, BigNumber, StageBar, Hairline } from '../components/ui'
import SpiralMark from '../components/SpiralMark'
import TabBar from '../components/TabBar'
import { useAudio } from '../context/AudioProvider'
import { SOUNDSCAPES } from '../data/soundscapes'
import { LAST_NIGHT, fmtDuration, USER, ALARM, getMeditation } from '../data/content'

export default function Tonight() {
  const navigate = useNavigate()
  const { play } = useAudio()
  const ln = LAST_NIGHT
  const med = getMeditation('letting-go')!
  const rainstorm = SOUNDSCAPES[0]

  const beginWindDown = async () => {
    await play(rainstorm)
    navigate('/soundscape/' + rainstorm.id)
  }

  return (
    <>
      <Screen tabSafe>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
          <SpiralMark size={22} color="var(--color-text)" strokeWidth={1.4} />
          <Eyebrow>Tue · 14 May</Eyebrow>
        </header>

        {/* Greeting */}
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 14 }}>
          Good evening, {USER.firstName}
        </p>
        <Display size={36} style={{ marginBottom: 36 }}>
          Wind‑down begins in{' '}
          <span style={{ color: 'var(--color-accent-bright)', borderBottom: '2px solid rgba(201,187,245,0.4)', paddingBottom: 2 }}>
            38m
          </span>.
        </Display>

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
          <div style={{ marginTop: 20 }}>
            <StageBar {...ln.stages} />
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
            <Legend c="var(--color-accent)" label="Deep" v={ln.stages.deep} />
            <Legend c="var(--color-accent-dim)" label="REM" v={ln.stages.rem} />
            <Legend c="rgba(155,124,232,0.4)" label="Light" v={ln.stages.light} />
          </div>
        </section>

        {/* Tonight's plan */}
        <section style={{ paddingTop: 24, borderTop: '1px solid var(--color-hair)', marginBottom: 30 }}>
          <Eyebrow style={{ display: 'block', marginBottom: 14 }}>Tonight's plan</Eyebrow>
          <PlanRow
            icon={<Moon size={15} color="var(--color-text-muted)" strokeWidth={1.5} />}
            label="Bedtime"
            value={USER.bedtimeGoal}
            onClick={() => navigate('/profile')}
          />
          <PlanRow
            icon={<SpiralMark size={15} color="var(--color-accent)" strokeWidth={1.6} />}
            label={rainstorm.name}
            value={rainstorm.layers.map(l => l.label).slice(0, 2).join(' + ')}
            onClick={() => navigate('/soundscape/' + rainstorm.id)}
          />
          <PlanRow
            icon={<Sunrise size={15} color="var(--color-text-muted)" strokeWidth={1.5} />}
            label="Wake"
            value={ALARM.target}
            sub="Sunrise"
            onClick={() => navigate('/alarm')}
            last
          />
        </section>

        {/* Primary CTA */}
        <button
          className="pressable focusable"
          onClick={beginWindDown}
          style={{
            width: '100%', padding: '18px 22px', borderRadius: 16,
            background: 'var(--color-accent)', color: 'var(--color-accent-ink)',
            fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 14px 40px rgba(181,168,232,0.24), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}
        >
          <span>Begin wind‑down</span>
          <Play size={16} fill="var(--color-accent-ink)" stroke="var(--color-accent-ink)" />
        </button>

        {/* Meditation */}
        <button
          className="pressable focusable"
          onClick={() => navigate('/meditate/' + med.id)}
          style={{
            marginTop: 12, width: '100%', padding: '15px 20px', borderRadius: 16,
            background: 'var(--color-surface)', border: '1px solid var(--color-hair)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Sparkles size={15} color="var(--color-accent)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--color-text)' }}>
                {med.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                {med.narrator} · {med.minutes} min
              </div>
            </div>
          </div>
          <ChevronRight size={16} color="var(--color-text-faint)" />
        </button>

        <Hairline mt={28} />
        <p style={{
          textAlign: 'center', fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: 13, color: 'var(--color-text-faint)', marginTop: 20,
        }}>
          {USER.streak} nights in rhythm. Keep going.
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
        {sub && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{sub}</span>}
        <span style={{ fontSize: 14, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        <ChevronRight size={15} color="var(--color-text-faint)" />
      </div>
    </div>
  )
}
