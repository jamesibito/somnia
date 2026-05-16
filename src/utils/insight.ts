import type { SleepSession } from '../data/content'
import type { Prefs } from '../context/PlanProvider'

/**
 * Derive a specific, data-grounded insight from the last 7 sessions and the
 * user's stated goal — and a concrete numeric action. No insight theater:
 * everything here points at numbers visible elsewhere in the app.
 */

export interface Insight {
  headline: string
  detail: string
  /** The concrete action, phrased as something the app will do. */
  action: string
  /** Minutes to move bedtime earlier (0 = no change). Writes back to the plan. */
  bedtimeAdjustMin: number
}

export function deriveInsight(sessions: SleepSession[], prefs: Prefs): Insight {
  const week = sessions.slice(-7)
  const goalMin = prefs.nightlyGoalHours * 60
  const avgDuration = Math.round(week.reduce((a, s) => a + s.durationMin, 0) / week.length)
  const debtMin = goalMin - avgDuration
  const avgDeep = Math.round(week.reduce((a, s) => a + s.stages.deep, 0) / week.length)
  const worst = [...week].sort((a, b) => a.score - b.score)[0]

  // Primary lever: are they short of their own stated nightly goal?
  if (debtMin > 20) {
    const shift = Math.min(30, Math.round(debtMin / 2 / 5) * 5)
    return {
      headline: `You're ${fmtMin(debtMin)} short of your ${prefs.nightlyGoalHours}h goal`,
      detail: `Across the last 7 nights you averaged ${fmtHrs(avgDuration)}. Your lowest night (${worst.score}) followed your latest bedtime of the week.`,
      action: `Tonight's wind-down moves ${shift} min earlier.`,
      bedtimeAdjustMin: shift,
    }
  }

  // Secondary lever: deep sleep low despite adequate duration.
  if (avgDeep < 16) {
    return {
      headline: `Enough hours, not enough depth`,
      detail: `Duration is on target but deep sleep averaged only ${avgDeep}%. Deep sleep is when the night actually restores you.`,
      action: `Tonight leads with a longer wind-down before lights-out.`,
      bedtimeAdjustMin: 10,
    }
  }

  // Steady: reinforce, don't invent a problem.
  return {
    headline: `You're holding your rhythm`,
    detail: `Seven nights near your ${prefs.nightlyGoalHours}h goal, deep sleep steady at ${avgDeep}%. This is the version of you that sleeps well.`,
    action: `No change tonight — keep the bedtime you've been hitting.`,
    bedtimeAdjustMin: 0,
  }
}

/** Honest streak: consecutive recent nights that hit the bedtime window. */
export function deriveStreak(sessions: SleepSession[], prefs: Prefs): { count: number; broken: boolean } {
  const targetH = prefs.bedtimeHour
  let count = 0
  for (let i = sessions.length - 1; i >= 0; i--) {
    // bedtime label like "11:42 PM" — parse the hour back to 24h
    const m = sessions[i].bedtime.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!m) break
    let h = parseInt(m[1], 10)
    const pm = m[3].toUpperCase() === 'PM'
    if (pm && h !== 12) h += 12
    if (!pm && h === 12) h = 0
    // "in window" = asleep within 30 min after target hour
    const within = h <= targetH || (h === targetH && parseInt(m[2], 10) <= 30)
    if (within) count++
    else break
  }
  return { count, broken: count === 0 }
}

function fmtMin(min: number) {
  const m = Math.abs(min)
  if (m < 60) return `${m} min`
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`
}
function fmtHrs(min: number) {
  return `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, '0')}m`
}
