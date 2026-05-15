import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { JOURNAL, type DreamEntry } from '../data/content'

interface JournalState {
  entries: DreamEntry[]
  add: (e: Omit<DreamEntry, 'id' | 'date'>) => void
  get: (id: string) => DreamEntry | undefined
}

const Ctx = createContext<JournalState | null>(null)
export const useJournal = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useJournal outside provider')
  return c
}

export function JournalProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<DreamEntry[]>(JOURNAL)

  const add = useCallback((e: Omit<DreamEntry, 'id' | 'date'>) => {
    setEntries(prev => [
      { ...e, id: 'j' + Date.now(), date: new Date().toISOString() },
      ...prev,
    ])
  }, [])

  const get = useCallback((id: string) => entries.find(x => x.id === id), [entries])

  return <Ctx.Provider value={{ entries, add, get }}>{children}</Ctx.Provider>
}
