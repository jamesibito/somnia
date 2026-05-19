import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sunrise, ArrowRight } from 'lucide-react'
import AtmosphereLayer from '../components/AtmosphereLayer'
import { BigNumber, PrimaryButton, Eyebrow } from '../components/ui'
import { usePlan } from '../context/PlanProvider'
import { useSession } from '../context/SessionProvider'
import { useClock } from '../context/ClockProvider'
import { fmtDuration } from '../data/content'
import { mergedSessions } from '../utils/sessions'
import { deriveInsight } from '../utils/insight'

const RESTED = ['Wiped', 'Foggy', 'Okay', 'Clear', 'Sharp']

export default function GoodMorning() {
  const navigate = useNavigate()
  const { prefs, applyBedtimeAdjustment } = usePlan()
  const { lastSession, history, pendingNight, completeNight, setRested: persistRested } = useSession()
  const { clockLabel, setPhase } = useClock()
  useEffect(() => { setPhase('morning') }, [setPhase])
  const [rested, setRested] = useState<number | null>(null)
  const [stage, setStage] = useState<'score' | 'checkin' | 'insight'>('score')
  const closed = useRef(false)

  // Close the loop regardless of path: if a night is still in progress (e.g.
  // the user came via the meditation path), score + record it now.
  useEffect(() => {
    if (pendingNight && !closed.current) {
      closed.current = true
      const bed = prefs.bedtimeHour * 60 + prefs.bedtimeMinute - prefs.bedtimeAdjustMin
      const wake = prefs.wakeHour * 60 + prefs.wakeMinute
      completeNight(((wake - bed) % 1440 + 1440) % 1440)
    }
  }, [pendingNight, completeNight, prefs])

  // merged's last element is the real night just logged, or the curated
  // STRONG_SEED on a fresh first-run — either way it's always populated.
  const merged = mergedSessions(history)
  const ln = merged[merged.length - 1]
  const insight = deriveInsight(merged, prefs, rested)

  const accept = () => {
    applyBedtimeAdjustment(insight.bedtimeAdjustMin)
    navigate('/tonight')
  }

  return (
    <div className="screen">
      <AtmosphereLayer variant="dawn" grain={0.05} />
      <div className="screen-enter" style={{ position: 'relative', minHeight: '100%', padding: '76px 28px 40px', display: 'flex', flexDirection: 'column' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 30 }}>
          <Sunrise size={20} color="var(--color-accent)" />
          <Eyebrow>{new Date().toLocaleDateString('en', { weekday: 'long' })} morning · {clockLabel}</Eyebrow>
        </div>

        {stage === 'score' && (
          <div className="rise" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 400, color: 'var(--color-text)', letterSpacing: '-0.025em', marginBottom: 36 }}>
              Good morning.<br />Here's how the night went.
            </h1>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 8 }}>
              <BigNumber value={ln.score} size={108} />
              <div style={{ paddingBottom: 14 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--color-text)' }}>{ln.quality}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtDuration(ln.durationMin)} · {ln.bedtime} → {ln.wake}
                </div>
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6, marginTop: 16 }}>
              {ln.note}
            </p>
            <div style={{ flex: 1 }} />
            <PrimaryButton onClick={() => setStage('checkin')}>
              <span>Continue</span><ArrowRight size={16} />
            </PrimaryButton>
          </div>
        )}

        {stage === 'checkin' && (
          <div className="rise" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, color: 'var(--color-text)', marginBottom: 10 }}>
              How rested do you feel?
            </h1>
            <p style={{ fontSize: 13.5, color: 'var(--color-text-muted)', marginBottom: 36, lineHeight: 1.6 }}>
              The number is the device's guess. This is the part only you know — it sharpens every future insight.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 36 }}>
              {RESTED.map((label, i) => {
                const on = rested === i
                return (
                  <button
                    key={label}
                    className="pressable"
                    onClick={() => { setRested(i); if (lastSession) persistRested(lastSession.id, i) }}
                    style={{
                      flex: 1, padding: '16px 0', borderRadius: 14,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      background: on ? 'rgba(181,168,232,0.14)' : 'var(--color-surface)',
                      border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-hair)'}`,
                    }}
                  >
                    <span style={{
                      width: 8, height: 8, borderRadius: 4,
                      background: on ? 'var(--color-accent)' : 'var(--color-text-faint)',
                    }} />
                    <span style={{ fontSize: 10.5, color: on ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{label}</span>
                  </button>
                )
              })}
            </div>
            <button
              className="pressable focusable"
              onClick={() => navigate('/journal/new?return=/morning')}
              style={{
                padding: 18, borderRadius: 16, background: 'var(--color-surface)',
                border: '1px solid var(--color-hair)', textAlign: 'left', marginBottom: 14,
              }}
            >
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--color-text)' }}>
                Remember a dream?
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 4 }}>
                Log it before it fades — it gets tied to last night's sleep.
              </div>
            </button>
            <div style={{ flex: 1 }} />
            <PrimaryButton onClick={() => setStage('insight')} style={{ opacity: rested === null ? 0.5 : 1 }}>
              <span>See what this means</span><ArrowRight size={16} />
            </PrimaryButton>
          </div>
        )}

        {stage === 'insight' && (
          <div className="rise" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Eyebrow style={{ marginBottom: 20 }}>The takeaway</Eyebrow>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, color: 'var(--color-text)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16 }}>
              {insight.headline}.
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-text-muted)', marginBottom: 28 }}>
              {insight.detail}
            </p>
            <div style={{
              padding: 18, borderRadius: 16,
              background: 'rgba(181,168,232,0.1)',
              border: '1px solid var(--color-accent)',
            }}>
              <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 8 }}>
                Tonight, automatically
              </div>
              <div style={{ fontSize: 15.5, color: 'var(--color-text)', lineHeight: 1.5 }}>
                {insight.action}
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <PrimaryButton onClick={accept}>
              <span>{insight.bedtimeAdjustMin > 0 ? 'Apply & go to Tonight' : 'Go to Tonight'}</span>
              <ArrowRight size={16} />
            </PrimaryButton>
          </div>
        )}
      </div>
      <div className="home-indicator" />
    </div>
  )
}
