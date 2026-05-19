import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

/**
 * FieldConceptProvider — ideation + override harness for the particle field.
 *
 * Each soundscape now declares its own particle concept (see SoundscapePalette
 * in data/soundscapes.ts), passed to GenerativeField as the `concept` prop.
 * This provider holds an optional *dev override* that wins over the
 * per-soundscape default so the dev-only switcher can audition any concept on
 * any screen. `override: null` → the per-soundscape default is used.
 *
 * Precedence in GenerativeField: override ?? per-soundscape prop ?? 'motes'.
 * GenerativeField also reads safely with no provider mounted (production-safe).
 */

export const FIELD_CONCEPTS = [
  'motes', 'dust', 'starfield', 'constellation',
  'embers', 'fireflies', 'bubbles', 'fairies', 'rain',
] as const
export type FieldConcept = (typeof FIELD_CONCEPTS)[number]

interface FieldConceptState {
  /** dev override; null → use the per-soundscape default */
  override: FieldConcept | null
  /** null → each call site keeps its own density; number → global override */
  densityOverride: number | null
  setOverride: (c: FieldConcept | null) => void
  setDensityOverride: (d: number | null) => void
}

const KEY = 'somnia.fieldConcept.v2'

const Ctx = createContext<FieldConceptState | null>(null)

/** Safe read — no-op defaults when no provider is mounted. */
export function useFieldConcept(): FieldConceptState {
  const c = useContext(Ctx)
  if (c) return c
  return {
    override: null,
    densityOverride: null,
    setOverride: () => {},
    setDensityOverride: () => {},
  }
}

interface Persisted { override: FieldConcept | null; densityOverride: number | null }

export function FieldConceptProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const p = JSON.parse(raw) as Partial<Persisted>
        const ov = p.override && FIELD_CONCEPTS.includes(p.override) ? p.override : null
        return { override: ov, densityOverride: p.densityOverride ?? null }
      }
    } catch { /* ignore */ }
    return { override: null, densityOverride: null }
  })

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  const setOverride = useCallback((override: FieldConcept | null) => {
    setState(prev => ({ ...prev, override }))
  }, [])

  const setDensityOverride = useCallback((densityOverride: number | null) => {
    setState(prev => ({ ...prev, densityOverride }))
  }, [])

  return (
    <Ctx.Provider
      value={{
        override: state.override,
        densityOverride: state.densityOverride,
        setOverride,
        setDensityOverride,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}
