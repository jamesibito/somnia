import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { scoreNight } from '../utils/score'
import type { LoggedSession } from '../utils/sessions'

/**
 * SessionProvider — records the night the user actually ran and computes the
 * morning from their choices. This is the core anti-shallow fix: the loop now
 * has consequence and persists. Mirrors PlanProvider's localStorage shape.
 */

const KEY = 'somnia.sessions.v1'

interface NightDraft {
  soundscapeId: string
  soundscapeName: string
  meditationId: string | null
  meditationTitle: string | null
  meditationCompleted: boolean
  keptRecommended: boolean
  bedtime: string
  wake: string
  bedtimeAdjustApplied: boolean
  nightlyGoalMin: number
}

export interface BeginNightArgs {
  soundscapeId: string
  soundscapeName: string
  meditationId: string | null
  meditationTitle: string | null
  keptRecommended: boolean
  bedtime: string
  wake: string
  bedtimeAdjustApplied: boolean
  nightlyGoalMin: number
}

interface SessionState {
  history: LoggedSession[]
  lastSession: LoggedSession | null
  /** true once beginNight ran and completeNight hasn't — lets GoodMorning
   * close the loop as a fallback regardless of which path the user took. */
  pendingNight: boolean
  beginNight: (a: BeginNightArgs) => void
  markMeditationDone: () => void
  completeNight: (minutesAsleep: number) => LoggedSession | null
  setRested: (id: string, restedIdx: number) => void
  reset: () => void
}

const Ctx = createContext<SessionState | null>(null)
export const useSession = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useSession outside provider')
  return c
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<LoggedSession[]>(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed as LoggedSession[]
      }
    } catch { /* ignore — fall back to empty so a demo never white-screens */ }
    return []
  })

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(history)) } catch { /* ignore */ }
  }, [history])

  // Draft + state machine. Guards React 19 StrictMode double-invoke so one
  // night never records twice.
  const draft = useRef<NightDraft | null>(null)
  const phase = useRef<'idle' | 'inProgress' | 'done'>('idle')

  const beginNight = useCallback((a: BeginNightArgs) => {
    if (phase.current === 'inProgress') return // already recording this night
    draft.current = { ...a, meditationCompleted: false }
    phase.current = 'inProgress'
  }, [])

  const markMeditationDone = useCallback(() => {
    if (phase.current === 'inProgress' && draft.current) {
      draft.current.meditationCompleted = true
    }
  }, [])

  const completeNight = useCallback((minutesAsleep: number): LoggedSession | null => {
    if (phase.current !== 'inProgress' || !draft.current) return null
    const d = draft.current
    const id = 'live-' + Date.now()
    const scored = scoreNight({
      id,
      soundscapeName: d.soundscapeName,
      meditationTitle: d.meditationTitle,
      meditationCompleted: d.meditationCompleted,
      minutesAsleep,
      keptRecommendedSoundscape: d.keptRecommended,
      bedtimeAdjustApplied: d.bedtimeAdjustApplied,
      nightlyGoalMin: d.nightlyGoalMin,
    })
    const session: LoggedSession = {
      id,
      date: new Date().toISOString(),
      soundscapeId: d.soundscapeId,
      soundscapeName: d.soundscapeName,
      meditationId: d.meditationId,
      meditationTitle: d.meditationTitle,
      meditationCompleted: d.meditationCompleted,
      minutesAsleep,
      bedtime: d.bedtime,
      wake: d.wake,
      score: scored.score,
      quality: scored.quality,
      stages: scored.stages,
      note: scored.note,
      restedAnswer: null,
    }
    phase.current = 'done'
    draft.current = null
    setHistory(prev => [...prev, session])
    return session
  }, [])

  const setRested = useCallback((id: string, restedIdx: number) => {
    setHistory(prev => prev.map(s => s.id === id ? { ...s, restedAnswer: restedIdx } : s))
  }, [])

  const reset = useCallback(() => {
    setHistory([])
    phase.current = 'idle'
    draft.current = null
    try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  }, [])

  const lastSession = history.length ? history[history.length - 1] : null

  return (
    <Ctx.Provider value={{
      history, lastSession,
      pendingNight: phase.current === 'inProgress',
      beginNight, markMeditationDone, completeNight, setRested, reset,
    }}>
      {children}
    </Ctx.Provider>
  )
}
