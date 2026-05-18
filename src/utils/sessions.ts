import { SESSIONS, type SleepSession } from '../data/content'

/**
 * A night the user actually ran. Persisted by SessionProvider. Carries the
 * choices (soundscape, meditation, duration) plus the computed result, so the
 * morning, the history, and the insight all reflect what the user did.
 */
export interface LoggedSession {
  id: string
  date: string
  soundscapeId: string
  soundscapeName: string
  meditationId: string | null
  meditationTitle: string | null
  meditationCompleted: boolean
  minutesAsleep: number
  bedtime: string
  wake: string
  score: number
  quality: string
  stages: { deep: number; rem: number; light: number; awake: number }
  note: string
  restedAnswer: number | null
}

/**
 * Curated strong night shown when there's no real history yet, so a fresh
 * viewer (e.g. a recruiter opening the link) always sees a polished, populated
 * "last night" instead of a cold first-run state. Once the user runs their own
 * night, real sessions sort ahead of this.
 */
const STRONG_SEED: SleepSession = {
  date: new Date(2026, 4, 16).toISOString(),
  label: 'Last night',
  score: 91,
  durationMin: 458, // 7h 38m
  bedtime: '11:18 PM',
  wake: '6:56 AM',
  quality: 'Restful',
  stages: { deep: 23, rem: 24, light: 47, awake: 6 },
  note: 'Fell asleep to Light Rainstorm. Completed Letting Go of the Day. Slept clean through.',
}

export function loggedToSession(l: LoggedSession, label: string): SleepSession {
  return {
    date: l.date,
    label,
    score: l.score,
    durationMin: l.minutesAsleep,
    bedtime: l.bedtime,
    wake: l.wake,
    quality: l.quality,
    stages: l.stages,
    note: l.note,
  }
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * A stable 30-long SleepSession[] (oldest → newest) for the charts/insight.
 * The recent tail is the user's real logged nights; older nights are backfilled
 * with the deterministic seed data, and the seed/real boundary is the curated
 * strong night so first-run still looks designed.
 *
 * Ordering (index 0 = oldest, last = most recent) is preserved exactly so
 * deriveInsight / deriveStreak / TrendChart / Hypnogram are untouched.
 */
export function mergedSessions(history: LoggedSession[]): SleepSession[] {
  const TOTAL = 30
  const real = history.slice(-TOTAL)
  const backfillCount = TOTAL - real.length

  // Oldest seed nights, then override the most-recent seed slot with the
  // curated strong night so the seed/real seam always looks good.
  const backfill = SESSIONS.slice(0, backfillCount).map((s, idx) => ({
    ...s,
    label: WEEKDAYS[new Date(s.date).getDay()],
    ...(idx === backfillCount - 1 ? STRONG_SEED : {}),
  }))

  const realMapped = real.map((l, idx) =>
    loggedToSession(l, WEEKDAYS[new Date(l.date).getDay()] ?? `N${idx}`),
  )

  const merged = [...backfill, ...realMapped]
  if (merged.length) {
    merged[merged.length - 1] = { ...merged[merged.length - 1], label: 'Last night' }
  }
  return merged
}
