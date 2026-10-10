import { createContext, useContext } from 'react'

/** Ouvre la feuille d'ajout rapide (rendue par AppShell). */
export const QuickAddContext = createContext<{ openAdd: () => void }>({ openAdd: () => {} })

export function useQuickAdd() {
  return useContext(QuickAddContext)
}
