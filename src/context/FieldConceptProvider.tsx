import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

/**
 * FieldConceptProvider — ideation harness state for Pass C.1.
 *
 * Holds the active particle concept + a density override so the dev-only
 * FieldConceptSwitcher can compare GenerativeField treatments live. Persisted
 * to localStorage so reloads keep the selection. GenerativeField falls back to
 * the 'motes' default if no provider is mounted, so the component stays
 * self-contained and production behavior is unchanged.
 */

export const FIELD_CONCEPTS = ['motes', 'dust', 'starfield', 'constellation'] as const
export type FieldConcept = (typeof FIELD_CONCEPTS)[number]

interface FieldConceptState {
  concept: FieldConcept
  /** null → each call site keeps its own density; number → global override */
  densityOverride: number | null
  setConcept: (c: FieldConcept) => void
  cycleConcept: () => void
  setDensityOverride: (d: number | null) => void
}

const KEY = 'somnia.fieldConcept.v1'

const Ctx = createContext<FieldConceptState | null>(null)

/** Safe read — returns 'motes' default when no provider is mounted. */
export function useFieldConcept(): FieldConceptState {
  const c = useContext(Ctx)
  if (c) return c
  return {
    concept: 'motes',
    densityOverride: null,
    setConcept: () => {},
    cycleConcept: () => {},
    setDensityOverride: () => {},
  }
}

interface Persisted { concept: FieldConcept; densityOverride: number | null }

export function FieldConceptProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const p = JSON.parse(raw) as Partial<Persisted>
        if (p.concept && FIELD_CONCEPTS.includes(p.concept)) {
          return { concept: p.concept, densityOverride: p.densityOverride ?? null }
        }
      }
    } catch { /* ignore */ }
    return { concept: 'motes', densityOverride: null }
  })

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  const setConcept = useCallback((concept: FieldConcept) => {
    setState(prev => ({ ...prev, concept }))
  }, [])

  const cycleConcept = useCallback(() => {
    setState(prev => {
      const i = FIELD_CONCEPTS.indexOf(prev.concept)
      return { ...prev, concept: FIELD_CONCEPTS[(i + 1) % FIELD_CONCEPTS.length] }
    })
  }, [])

  const setDensityOverride = useCallback((densityOverride: number | null) => {
    setState(prev => ({ ...prev, densityOverride }))
  }, [])

  return (
    <Ctx.Provider
      value={{
        concept: state.concept,
        densityOverride: state.densityOverride,
        setConcept,
        cycleConcept,
        setDensityOverride,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}
