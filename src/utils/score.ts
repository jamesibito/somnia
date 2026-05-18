import type { SleepSession } from '../data/content'

/**
 * Deterministic, choice-driven sleep scoring. No Math.random — the same night
 * always scores the same, but different choices produce different mornings.
 * This is what makes the loop consequential instead of a constant.
 */

export interface ScoreInput {
  /** stable id of the logged session — seeds the tiny stage jitter */
  id: string
  soundscapeName: string
  /** title of the meditation the user chose, or null if they picked "just sounds" */
  meditationTitle: string | null
  meditationCompleted: boolean
  minutesAsleep: number
  /** did the user keep the soundscape Somnia recommended */
  keptRecommendedSoundscape: boolean
  /** was an insight bedtime adjustment in effect (loop honored) */
  bedtimeAdjustApplied: boolean
  /** prefs.nightlyGoalHours * 60 */
  nightlyGoalMin: number
}

export interface ScoredNight {
  score: number
  quality: string
  stages: { deep: number; rem: number; light: number; awake: number }
  note: string
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

export function scoreNight(i: ScoreInput): ScoredNight {
  let s = 70

  // Meditation: completing the practice is the single biggest lever.
  if (i.meditationTitle && i.meditationCompleted) s += 10
  else if (i.meditationTitle) s += 2 // chosen but drifted off / skipped

  // Duration vs the user's own stated goal.
  const delta = i.minutesAsleep - i.nightlyGoalMin
  if (Math.abs(delta) <= 15) s += 12
  else if (delta < 0) s += clamp(Math.floor(delta / 30) * 6, -18, 0) // each 30m short = -6, floor -18
  else s += 3 // a little over goal

  if (i.keptRecommendedSoundscape) s += 4
  if (i.bedtimeAdjustApplied) s += 3

  const score = clamp(Math.round(s), 40, 98)

  // Quality bucket — uses the vocabulary already in content.ts.
  const quality =
    score >= 86 ? 'Restful' :
    score >= 76 ? 'Sound' :
    score >= 66 ? 'Fair' :
    score >= 56 ? 'Light' : 'Broken'

  // Stages derived from the score, with a deterministic ±1 jitter so two
  // identical nights aren't pixel-identical but stay reproducible.
  const j = (i.id.length % 3) - 1 // -1 | 0 | 1
  const deep = clamp(Math.round(14 + (score - 70) * 0.22) + j, 10, 30)
  const rem = clamp(Math.round(20 + (score - 70) * 0.12) - j, 14, 30)
  const awake = clamp(Math.round(10 - (score - 70) * 0.13), 2, 16)
  const light = clamp(100 - deep - rem - awake, 20, 70)

  const parts: string[] = [`Fell asleep to ${i.soundscapeName}.`]
  if (i.meditationTitle) {
    parts.push(i.meditationCompleted
      ? `Completed ${i.meditationTitle}.`
      : `Started ${i.meditationTitle} but drifted off.`)
  }
  if (awake >= 11) parts.push('Woke once around 3am.')
  else if (score >= 86) parts.push('Slept clean through.')

  return { score, quality, stages: { deep, rem, light, awake }, note: parts.join(' ') }
}

/** Map a scored night onto the SleepSession shape used everywhere else. */
export function toSleepSession(
  scored: ScoredNight,
  meta: { date: string; label: string; durationMin: number; bedtime: string; wake: string },
): SleepSession {
  return {
    date: meta.date,
    label: meta.label,
    score: scored.score,
    durationMin: meta.durationMin,
    bedtime: meta.bedtime,
    wake: meta.wake,
    quality: scored.quality,
    stages: scored.stages,
    note: scored.note,
  }
}
