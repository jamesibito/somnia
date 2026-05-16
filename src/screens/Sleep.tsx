import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Screen, Eyebrow, Display, BigNumber, Hairline, TopBar } from '../components/ui'
import TabBar from '../components/TabBar'
import { SESSIONS, fmtDuration, USER } from '../data/content'
import { usePlan } from '../context/PlanProvider'
import { deriveInsight } from '../utils/insight'

export default function Sleep() {
  const navigate = useNavigate()
  const { prefs, applyBedtimeAdjustment } = usePlan()
  const insight = deriveInsight(SESSIONS, prefs)
  const [sel, setSel] = useState(SESSIONS.length - 1)
  const s = SESSIONS[sel]
  const last7 = SESSIONS.slice(-7)

  return (
    <>
      <Screen tabSafe variant="deep">
        <TopBar title="Sleep" />

        {/* Selected session hero */}
        <Eyebrow>{sel === SESSIONS.length - 1 ? 'Last night' : new Date(s.date).toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 12, marginBottom: 6 }}>
          <BigNumber value={s.score} />
          <div style={{ paddingBottom: 10 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--color-text)' }}>{s.quality}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
              {fmtDuration(s.durationMin)} · {s.bedtime} → {s.wake}
            </div>
          </div>
        </div>
        {s.note && (
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13.5, color: 'var(--color-text-muted)', lineHeight: 1.5, marginTop: 8 }}>
            {s.note}
          </p>
        )}

        {/* Hypnogram */}
        <div style={{ marginTop: 28 }}>
          <Eyebrow style={{ display: 'block', marginBottom: 14 }}>Stages through the night</Eyebrow>
          <Hypnogram seed={s.score + sel} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            {(['Deep', 'REM', 'Light', 'Awake'] as const).map((k, i) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: 3,
                  background: ['var(--color-accent)', 'var(--color-accent-dim)', 'rgba(155,124,232,0.4)', 'rgba(155,146,196,0.3)'][i],
                }} />
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{k}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
                  {[s.stages.deep, s.stages.rem, s.stages.light, s.stages.awake][i]}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <Hairline mt={30} mb={28} />

        {/* 30-night trend */}
        <Eyebrow style={{ display: 'block', marginBottom: 6 }}>30 nights</Eyebrow>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 18 }}>
          Tap a bar to inspect that night.
        </p>
        <TrendChart selected={sel} onSelect={setSel} />

        <Hairline mt={30} mb={28} />

        {/* Weekly insights */}
        <Eyebrow style={{ display: 'block', marginBottom: 16 }}>This week</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Stat label="Avg score" value={String(USER.weekly.avgScore)} />
          <Stat label="Sleep debt" value={USER.weekly.debt} warn />
          <Stat label="Avg duration" value={fmtDuration(Math.round(last7.reduce((a, x) => a + x.durationMin, 0) / 7))} />
          <Stat label="Consistency" value={`${USER.streak} nights`} />
        </div>

        <div style={{
          marginTop: 22, padding: 18, borderRadius: 16,
          background: 'var(--color-surface)', border: '1px solid var(--color-hair)',
        }}>
          <Display size={18} style={{ marginBottom: 10 }}>{insight.headline}</Display>
          <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--color-text-muted)', marginBottom: 18 }}>
            {insight.detail}
          </p>
          <button
            className="pressable focusable"
            onClick={() => { applyBedtimeAdjustment(insight.bedtimeAdjustMin); navigate('/tonight') }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderRadius: 12,
              background: 'rgba(181,168,232,0.1)', border: '1px solid var(--color-accent)',
              color: 'var(--color-text)', textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 13.5, lineHeight: 1.4, paddingRight: 12 }}>{insight.action}</span>
            <ArrowRight size={16} color="var(--color-accent)" style={{ flexShrink: 0 }} />
          </button>
        </div>
      </Screen>
      <TabBar />
    </>
  )
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={{ padding: 16, borderRadius: 14, background: 'var(--color-surface)', border: '1px solid var(--color-hair)' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 8 }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-serif)', fontSize: 26, color: warn ? 'var(--color-warn)' : 'var(--color-text)',
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
      }}>
        {value}
      </div>
    </div>
  )
}

function Hypnogram({ seed }: { seed: number }) {
  // Deterministic stair-step path: 0=awake .. 3=deep
  let s = seed * 9301 + 49297
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  const N = 48
  const levels: number[] = []
  let cur = 1
  for (let i = 0; i < N; i++) {
    const r = rnd()
    if (i < 4) cur = 1
    else if (r < 0.18) cur = Math.min(3, cur + 1)
    else if (r < 0.32) cur = Math.max(0, cur - 1)
    if (i > N - 5 && r < 0.5) cur = Math.max(0, cur - 1)
    levels.push(cur)
  }
  const W = 334, H = 96
  const yFor = (l: number) => 8 + (3 - l) * ((H - 16) / 3)
  const step = W / N
  let d = `M0 ${yFor(levels[0])}`
  levels.forEach((l, i) => {
    const x = i * step
    d += ` H${x} V${yFor(l)}`
    d += ` H${x + step}`
  })
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} aria-hidden style={{ display: 'block' }}>
      {[0, 1, 2, 3].map(l => (
        <line key={l} x1={0} x2={W} y1={yFor(l)} y2={yFor(l)} stroke="var(--color-hair)" strokeWidth={1} />
      ))}
      <path d={d} fill="none" stroke="var(--color-accent)" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  )
}

function TrendChart({ selected, onSelect }: { selected: number; onSelect: (i: number) => void }) {
  const max = 100
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120 }}>
      {SESSIONS.map((s, i) => {
        const on = i === selected
        return (
          <button
            key={s.date}
            className="pressable"
            onClick={() => onSelect(i)}
            aria-label={`${s.label} score ${s.score}`}
            style={{
              flex: 1, height: '100%', display: 'flex', flexDirection: 'column',
              justifyContent: 'flex-end', alignItems: 'center', gap: 4,
            }}
          >
            <div style={{
              width: '100%',
              height: `${(s.score / max) * 100}%`,
              minHeight: 4,
              borderRadius: 3,
              background: on ? 'var(--color-accent-bright)' : 'rgba(155,124,232,0.32)',
              transition: 'background 200ms ease',
            }} />
          </button>
        )
      })}
    </div>
  )
}
