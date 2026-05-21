import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import * as engine from '../audio/engine'
import type { LayerId } from '../audio/engine'

export interface SoundscapeDef {
  id: string
  name: string
  tagline: string
  layers: { id: LayerId; label: string; default: number }[]
}

interface AudioState {
  playing: boolean
  current: SoundscapeDef | null
  levels: Record<string, number>
  elapsed: number
  /** Master output gain (0..1). Applied to the engine immediately. */
  master: number
  /** Soften shrill highs (0..1). 0 = flat. 1 = heavily warmed lowpass. */
  softenHighs: number
  /** Cut low rumble (0..1). 0 = flat. 1 = bass cleared by highpass. */
  cutRumble: number
  /** Begin a soundscape (must originate from a user gesture). */
  play: (s: SoundscapeDef) => Promise<void>
  toggle: () => Promise<void>
  stop: () => void
  setLevel: (layerId: string, v: number) => void
  setMaster: (v: number) => void
  setSoftenHighs: (v: number) => void
  setCutRumble: (v: number) => void
  startSleepTimer: (minutes: number) => void
  sleepTimer: number | null
}

const Ctx = createContext<AudioState | null>(null)
export const useAudio = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAudio outside provider')
  return c
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState<SoundscapeDef | null>(null)
  const [levels, setLevels] = useState<Record<string, number>>({})
  const [elapsed, setElapsed] = useState(0)
  const [sleepTimer, setSleepTimer] = useState<number | null>(null)
  const [master, setMasterState] = useState(0.82)        // matches engine default
  const [softenHighs, setSoftenHighsState] = useState(0) // flat
  const [cutRumble, setCutRumbleState] = useState(0)     // flat
  const tick = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)

  const setMaster = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    setMasterState(clamped)
    engine.setMaster(clamped)
  }, [])

  const setSoftenHighs = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    setSoftenHighsState(clamped)
    engine.setSoftenHighs(clamped)
  }, [])

  const setCutRumble = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    setCutRumbleState(clamped)
    engine.setCutRumble(clamped)
  }, [])

  const startTick = useCallback(() => {
    if (tick.current) return
    tick.current = window.setInterval(() => setElapsed(e => e + 1), 1000)
  }, [])
  const stopTick = useCallback(() => {
    if (tick.current) { clearInterval(tick.current); tick.current = null }
  }, [])

  const applyLevels = useCallback((s: SoundscapeDef, lv: Record<string, number>) => {
    s.layers.forEach(l => engine.setLayer(l.id, lv[l.id] ?? 0))
  }, [])

  const play = useCallback(async (s: SoundscapeDef) => {
    await engine.ensureRunning()
    // Smoothly fade out the previous soundscape's UNIQUE layers (layers not
    // shared with the new soundscape). Shared layers (e.g. wind, drone) get
    // their new target volume applied below — engine's setLayer cross-fades
    // existing layers in place, so shared layers transition smoothly while
    // soundscape-specific ones (rain, harp, etc.) fade to silence.
    if (current) {
      const newIds = new Set(s.layers.map(l => l.id))
      current.layers.forEach(l => {
        if (!newIds.has(l.id)) engine.setLayer(l.id, 0)
      })
    }
    const initial: Record<string, number> = {}
    s.layers.forEach(l => { initial[l.id] = l.default })
    setCurrent(s)
    setLevels(initial)
    setElapsed(0)
    applyLevels(s, initial)
    setPlaying(true)
    startTick()
  }, [applyLevels, startTick, current])

  const toggle = useCallback(async () => {
    if (!current) return
    if (playing) {
      current.layers.forEach(l => engine.setLayer(l.id, 0))
      setPlaying(false)
      stopTick()
    } else {
      await engine.ensureRunning()
      applyLevels(current, levels)
      setPlaying(true)
      startTick()
    }
  }, [current, playing, levels, applyLevels, startTick, stopTick])

  const stop = useCallback(() => {
    engine.stopAll()
    setPlaying(false)
    setCurrent(null)
    setElapsed(0)
    setSleepTimer(null)
    stopTick()
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }, [stopTick])

  const setLevel = useCallback((layerId: string, v: number) => {
    setLevels(prev => ({ ...prev, [layerId]: v }))
    if (playing) engine.setLayer(layerId as LayerId, v)
  }, [playing])

  const startSleepTimer = useCallback((minutes: number) => {
    setSleepTimer(minutes)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      engine.fadeOutAndStop(12)
      setPlaying(false)
      setSleepTimer(null)
    }, minutes * 60 * 1000)
  }, [])

  return (
    <Ctx.Provider value={{
      playing, current, levels, elapsed,
      master, softenHighs, cutRumble,
      play, toggle, stop, setLevel, setMaster, setSoftenHighs, setCutRumble,
      startSleepTimer, sleepTimer,
    }}>
      {children}
    </Ctx.Provider>
  )
}
