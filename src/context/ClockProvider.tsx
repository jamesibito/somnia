import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import { usePlan } from './PlanProvider'

/**
 * ClockProvider — a *simulated*, event-driven notional clock so the app has a
 * sense of time without being wall-clock-driven (a portfolio demo must look
 * identical at 3pm and 3am). Phases are set by screen events; greeting, status
 * time, and atmosphere variant follow.
 */

export type Phase = 'evening' | 'winding-down' | 'asleep' | 'dawn' | 'morning'

type AtmosphereVariant = 'default' | 'deep' | 'dawn' | 'calm'

interface ClockState {
  phase: Phase
  /** minutes-of-day for the simulated clock */
  notional: number
  clockLabel: string
  greeting: string
  atmosphereVariant: AtmosphereVariant
  setPhase: (p: Phase) => void
  /** TimeCompression drives this directly while the night passes */
  setNotional: (mins: number) => void
}

const Ctx = createContext<ClockState | null>(null)
export const useClock = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useClock outside provider')
  return c
}

function fmt(mins: number) {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440
  const h = Math.floor(m / 60)
  const mm = m % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hr = ((h + 11) % 12) + 1
  return `${hr}:${String(mm).padStart(2, '0')} ${ampm}`
}

export function ClockProvider({ children }: { children: ReactNode }) {
  const { prefs } = usePlan()
  const [phase, setPhaseState] = useState<Phase>('evening')
  const [notionalOverride, setNotionalOverride] = useState<number | null>(null)

  const bed = prefs.bedtimeHour * 60 + prefs.bedtimeMinute - prefs.bedtimeAdjustMin
  const wake = prefs.wakeHour * 60 + prefs.wakeMinute

  // Notional time per phase (override wins while TimeCompression runs).
  const notional = useMemo(() => {
    if (notionalOverride != null) return notionalOverride
    switch (phase) {
      case 'evening': return bed - 100
      case 'winding-down': return bed - 15
      case 'asleep': return bed + 180
      case 'dawn': return wake - 18
      case 'morning': return wake
    }
  }, [phase, notionalOverride, bed, wake])

  const setPhase = useCallback((p: Phase) => {
    setNotionalOverride(null)
    setPhaseState(p)
  }, [])

  const setNotional = useCallback((mins: number) => setNotionalOverride(mins), [])

  const greeting =
    phase === 'asleep' ? 'Good night' :
    phase === 'dawn' || phase === 'morning' ? 'Good morning' :
    'Good evening'

  const atmosphereVariant: AtmosphereVariant =
    phase === 'evening' ? 'calm' :
    phase === 'dawn' || phase === 'morning' ? 'dawn' : 'deep'

  return (
    <Ctx.Provider value={{
      phase, notional,
      clockLabel: fmt(notional),
      greeting, atmosphereVariant,
      setPhase, setNotional,
    }}>
      {children}
    </Ctx.Provider>
  )
}
