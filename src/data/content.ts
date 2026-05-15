// Meditations, journal seed, alarms, user.

export interface Meditation {
  id: string
  title: string
  narrator: string
  minutes: number
  category: 'Wind-down' | 'Sleep' | 'Calm' | 'Morning'
  description: string
  chapters: { title: string; at: number }[]
  available: boolean
}

export const MEDITATIONS: Meditation[] = [
  {
    id: 'letting-go',
    title: 'Letting Go of the Day',
    narrator: 'Aiyana Brooks',
    minutes: 8,
    category: 'Wind-down',
    description: 'A slow unclenching. We set down what the day asked of us, one thing at a time, and make the body heavy.',
    chapters: [
      { title: 'Arriving', at: 0 },
      { title: 'The breath settles', at: 90 },
      { title: 'Releasing the day', at: 240 },
      { title: 'Into stillness', at: 400 },
    ],
    available: true,
  },
  {
    id: 'body-of-water',
    title: 'A Body of Water',
    narrator: 'Aiyana Brooks',
    minutes: 12,
    category: 'Sleep',
    description: 'A guided descent. The body becomes water, then the water becomes still, then the stillness becomes sleep.',
    chapters: [
      { title: 'The surface', at: 0 },
      { title: 'Sinking', at: 180 },
      { title: 'The deep', at: 420 },
      { title: 'No edges', at: 600 },
    ],
    available: true,
  },
  {
    id: 'four-counts',
    title: 'Four Counts to Quiet',
    narrator: 'Dev Okafor',
    minutes: 6,
    category: 'Calm',
    description: 'A breath pattern for a racing mind. Box breathing, paced and unhurried, until the noise drops out.',
    chapters: [
      { title: 'Finding the rhythm', at: 0 },
      { title: 'Holding', at: 150 },
      { title: 'The quiet after', at: 300 },
    ],
    available: true,
  },
  { id: 'the-long-exhale', title: 'The Long Exhale', narrator: 'Dev Okafor', minutes: 10, category: 'Wind-down', description: 'Extending the out-breath until the nervous system follows.', chapters: [], available: false },
  { id: 'still-lake', title: 'Still Lake at Dawn', narrator: 'Mira Sol', minutes: 9, category: 'Morning', description: 'A gentle return. For waking without being startled into the day.', chapters: [], available: false },
  { id: 'no-thoughts', title: 'Nowhere to Be', narrator: 'Aiyana Brooks', minutes: 15, category: 'Sleep', description: 'The longest descent. For the nights nothing else worked.', chapters: [], available: false },
  { id: 'soft-landing', title: 'Soft Landing', narrator: 'Mira Sol', minutes: 7, category: 'Wind-down', description: 'A short ritual to close the laptop and close the day.', chapters: [], available: false },
  { id: 'tide-of-breath', title: 'Tide of Breath', narrator: 'Dev Okafor', minutes: 11, category: 'Calm', description: 'Breath as tide — in, out, and the pause the ocean takes.', chapters: [], available: false },
]

export function getMeditation(id: string) {
  return MEDITATIONS.find(m => m.id === id)
}

// ─── Sleep sessions — 30 nights, varied + realistic ────────────────────────

export interface SleepSession {
  date: string          // ISO
  label: string         // 'Last night', 'Mon', etc.
  score: number
  durationMin: number
  bedtime: string
  wake: string
  quality: string
  stages: { deep: number; rem: number; light: number; awake: number }
  note?: string
}

function gen(): SleepSession[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const qualities = ['Restful', 'Restful', 'Sound', 'Broken', 'Light', 'Deep', 'Fair']
  const out: SleepSession[] = []
  // deterministic pseudo-random so the data is stable across renders
  let seed = 42
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff }
  for (let i = 29; i >= 0; i--) {
    const d = new Date(2026, 4, 14 - i)
    const score = Math.round(62 + rnd() * 34)
    const durationMin = Math.round(360 + rnd() * 150)
    const deep = Math.round(12 + rnd() * 14)
    const rem = Math.round(18 + rnd() * 12)
    const awake = Math.round(3 + rnd() * 9)
    const light = 100 - deep - rem - awake
    const bedH = 22 + Math.floor(rnd() * 2)
    const bedM = Math.floor(rnd() * 60)
    const wakeH = 6 + Math.floor(rnd() * 2)
    const wakeM = Math.floor(rnd() * 60)
    out.push({
      date: d.toISOString(),
      label: i === 0 ? 'Last night' : days[d.getDay()],
      score,
      durationMin,
      bedtime: `${((bedH + 11) % 12) + 1}:${String(bedM).padStart(2, '0')} PM`,
      wake: `${wakeH}:${String(wakeM).padStart(2, '0')} AM`,
      quality: qualities[Math.floor(rnd() * qualities.length)],
      stages: { deep, rem, light, awake },
      note: i === 0 ? 'Fell asleep to Light Rainstorm. Woke once around 3am.' : undefined,
    })
  }
  return out
}

export const SESSIONS = gen()
export const LAST_NIGHT = SESSIONS[SESSIONS.length - 1]

export function fmtDuration(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${String(m).padStart(2, '0')}m`
}

// ─── Dream journal ─────────────────────────────────────────────────────────

export interface DreamEntry {
  id: string
  date: string
  mood: 'vivid' | 'calm' | 'restless' | 'strange' | 'fading'
  title: string
  body: string
  tags: string[]
}

export const MOODS: Record<DreamEntry['mood'], { label: string; glyph: string }> = {
  vivid: { label: 'Vivid', glyph: '◍' },
  calm: { label: 'Calm', glyph: '○' },
  restless: { label: 'Restless', glyph: '◌' },
  strange: { label: 'Strange', glyph: '◐' },
  fading: { label: 'Fading', glyph: '◔' },
}

export const JOURNAL: DreamEntry[] = [
  {
    id: 'j1',
    date: new Date(2026, 4, 14).toISOString(),
    mood: 'vivid',
    title: 'The house with the extra room',
    body: 'There was a door in the hallway I had never noticed. Behind it, a room that was clearly always there — a desk, a window facing a sea that does not exist near where I grew up. I felt no surprise, only a kind of recognition.',
    tags: ['recurring', 'houses', 'calm'],
  },
  {
    id: 'j2',
    date: new Date(2026, 4, 12).toISOString(),
    mood: 'strange',
    title: 'Trains that never arrived',
    body: 'A station, very clean, very quiet. The board kept changing but no train came. I was not anxious, which itself felt strange. Someone I could not see said it was fine to wait.',
    tags: ['transit', 'waiting'],
  },
  {
    id: 'j3',
    date: new Date(2026, 4, 9).toISOString(),
    mood: 'calm',
    title: 'Floating in the cedar dark',
    body: 'Put on Cedar Forest before bed. Dreamt I was lying on the forest floor, not cold, looking up through the trees at a sky with too many stars. Woke up before the alarm, rested.',
    tags: ['soundscape', 'forest'],
  },
]

// ─── Alarm ─────────────────────────────────────────────────────────────────

export const ALARM = {
  enabled: true,
  windowStart: '6:40 AM',
  windowEnd: '7:00 AM',
  target: '7:00 AM',
  sunrise: true,
  sound: 'Dawn Chimes',
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
}

// ─── User ──────────────────────────────────────────────────────────────────

export const USER = {
  firstName: 'Mira',
  fullName: 'Mira Sandoval',
  email: 'mira@example.com',
  member: 'Somnia member since 2025',
  bedtimeGoal: '11:30 PM',
  wakeGoal: '7:00 AM',
  sleepGoalHours: 7.5,
  streak: 12,
  weekly: { debt: '−42m', avgScore: 81, trend: [78, 82, 79, 86, 75, 80, 86] },
}
