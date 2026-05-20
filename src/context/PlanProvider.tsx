import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { SOUNDSCAPES } from '../data/soundscapes'
import { MEDITATIONS } from '../data/content'

/**
 * PlanProvider — the spine of the loop.
 *
 * Onboarding writes preferences here. Tonight + Night read the derived plan.
 * The morning insight writes an adjustment back. Persisted to localStorage so
 * the loop survives reloads and actually feels like it remembers you.
 */

export interface Prefs {
  /** 24h hour for target bedtime, e.g. 23 */
  bedtimeHour: number
  bedtimeMinute: number
  wakeHour: number
  wakeMinute: number
  goals: string[]
  soundPrefs: string[]
  nightlyGoalHours: number
  /** minutes the morning insight shifted bedtime earlier (+) — closes the loop */
  bedtimeAdjustMin: number
  onboarded: boolean
  /** opt-in personalization theme; 'indigo' is the default Pure Indigo */
  theme: 'indigo' | 'moon'
  /** reduce motion + particle effects for accessibility / battery saving */
  reducedMotion: boolean
}

const DEFAULT_PREFS: Prefs = {
  bedtimeHour: 23,
  bedtimeMinute: 30,
  wakeHour: 7,
  wakeMinute: 0,
  goals: ['Quiet a racing mind'],
  soundPrefs: ['Rain'],
  nightlyGoalHours: 7.5,
  bedtimeAdjustMin: 0,
  onboarded: false,
  theme: 'indigo',
  reducedMotion: false,
}

const KEY = 'somnia.prefs.v1'

/** Read ?theme=moon|indigo from the URL — used by the compare iframe. */
function urlThemeOverride(): Prefs['theme'] | null {
  try {
    const t = new URLSearchParams(window.location.search).get('theme')
    if (t === 'moon' || t === 'indigo') return t
  } catch { /* SSR / test guard */ }
  return null
}

function fmtTime(h: number, m: number) {
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hr = ((h + 11) % 12) + 1
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`
}

/** Map a stated sound preference to the closest soundscape. */
function soundscapeForPrefs(prefs: string[]) {
  const p = prefs.map(s => s.toLowerCase())
  if (p.some(x => x.includes('ocean') || x.includes('tide'))) return SOUNDSCAPES.find(s => s.id === 'slow-tide')!
  if (p.some(x => x.includes('forest'))) return SOUNDSCAPES.find(s => s.id === 'cedar-forest')!
  if (p.some(x => x.includes('fire'))) return SOUNDSCAPES.find(s => s.id === 'hearth')!
  if (p.some(x => x.includes('drone'))) return SOUNDSCAPES.find(s => s.id === 'deep-drift')!
  if (p.some(x => x.includes('white') || x.includes('noise'))) return SOUNDSCAPES.find(s => s.id === 'static-bloom')!
  return SOUNDSCAPES[0] // Light Rainstorm
}

/** Map a stated goal to the meditation that addresses it. */
function meditationForGoals(goals: string[]) {
  const g = goals.join(' ').toLowerCase()
  if (g.includes('racing') || g.includes('mind')) return MEDITATIONS.find(m => m.id === 'four-counts')!
  if (g.includes('stay asleep') || g.includes('through the night')) return MEDITATIONS.find(m => m.id === 'body-of-water')!
  if (g.includes('groggy') || g.includes('wake')) return MEDITATIONS.find(m => m.id === 'letting-go')!
  return MEDITATIONS.find(m => m.id === 'letting-go')!
}

/** A sentence-friendly clause for a goal label (chips read as imperatives). */
function goalClause(goalLabel: string): string {
  switch (goalLabel) {
    case 'Fall asleep faster': return 'falling asleep faster'
    case 'Stay asleep through the night': return 'staying asleep through the night'
    case 'Wake up less groggy': return 'clearer mornings'
    case 'Quiet a racing mind': return 'a quieter mind'
    case 'Build a consistent rhythm': return 'a steadier rhythm'
    default: return 'better sleep'
  }
}

export interface TonightPlan {
  bedtimeLabel: string
  wakeLabel: string
  /** Wind-down begins 45 min before target bedtime */
  windDownLabel: string
  adjusted: boolean
  soundscape: ReturnType<typeof soundscapeForPrefs>
  meditation: ReturnType<typeof meditationForGoals>
  primaryGoal: string
  /** Sentence-friendly form of the primary goal */
  goalClause: string
}

interface PlanState {
  prefs: Prefs
  plan: TonightPlan
  setPrefs: (patch: Partial<Prefs>) => void
  applyBedtimeAdjustment: (minutesEarlier: number) => void
  reset: () => void
}

const Ctx = createContext<PlanState | null>(null)
export const usePlan = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('usePlan outside provider')
  return c
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<Prefs>(() => {
    const urlTheme = urlThemeOverride()
    try {
      const raw = localStorage.getItem(KEY)
      const stored: Prefs = raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS
      // URL param wins over stored preference (used by the compare iframe).
      return urlTheme ? { ...stored, theme: urlTheme } : stored
    } catch { /* ignore */ }
    return urlTheme ? { ...DEFAULT_PREFS, theme: urlTheme } : DEFAULT_PREFS
  })

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(prefs)) } catch { /* ignore */ }
  }, [prefs])

  // Apply the personalization theme app-wide (CSS-var swap on the root).
  useEffect(() => {
    const root = document.documentElement
    if (prefs.theme === 'moon') root.setAttribute('data-theme', 'moon')
    else root.removeAttribute('data-theme') // indigo default + any stale value
  }, [prefs.theme])

  // Apply reduce-motion pref as a data attribute so CSS + JS can both read it.
  useEffect(() => {
    const shell = document.querySelector('.phone-shell') as HTMLElement | null
    if (!shell) return
    if (prefs.reducedMotion) shell.setAttribute('data-reduced-motion', '')
    else shell.removeAttribute('data-reduced-motion')
  }, [prefs.reducedMotion])

  const setPrefs = useCallback((patch: Partial<Prefs>) => {
    setPrefsState(prev => ({ ...prev, ...patch }))
  }, [])

  const applyBedtimeAdjustment = useCallback((minutesEarlier: number) => {
    setPrefsState(prev => ({ ...prev, bedtimeAdjustMin: minutesEarlier }))
  }, [])

  const reset = useCallback(() => {
    setPrefsState(DEFAULT_PREFS)
    try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  }, [])

  const plan: TonightPlan = useMemo(() => {
    const totalBed = prefs.bedtimeHour * 60 + prefs.bedtimeMinute - prefs.bedtimeAdjustMin
    const norm = (mins: number) => {
      const m = ((mins % 1440) + 1440) % 1440
      return fmtTime(Math.floor(m / 60), m % 60)
    }
    const primaryGoal = prefs.goals[0] ?? 'Sleep better'
    return {
      bedtimeLabel: norm(totalBed),
      wakeLabel: fmtTime(prefs.wakeHour, prefs.wakeMinute),
      windDownLabel: norm(totalBed - 45),
      adjusted: prefs.bedtimeAdjustMin > 0,
      soundscape: soundscapeForPrefs(prefs.soundPrefs),
      meditation: meditationForGoals(prefs.goals),
      primaryGoal,
      goalClause: goalClause(primaryGoal),
    }
  }, [prefs])

  return (
    <Ctx.Provider value={{ prefs, plan, setPrefs, applyBedtimeAdjustment, reset }}>
      {children}
    </Ctx.Provider>
  )
}
