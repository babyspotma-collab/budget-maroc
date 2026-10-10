import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { buildStatuses, resolveLimits, type BudgetStatus } from '../../domain/budget'
import type { Expense } from '../../db/types'

export function useBudgetRecords() {
  return useLiveQuery(() => db.budgets.toArray(), [])
}

/** Plafonds effectifs du mois (report automatique). */
export function useMonthLimits(month: string): Map<number, number> | undefined {
  const records = useBudgetRecords()
  return useMemo(() => (records ? resolveLimits(records, month) : undefined), [records, month])
}

export function spentByCategory(expenses: Expense[]): Map<number, number> {
  const map = new Map<number, number>()
  for (const e of expenses) map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amountCents)
  return map
}

export function useBudgetStatuses(
  limits: Map<number, number> | undefined,
  expenses: Expense[] | undefined,
): BudgetStatus[] | undefined {
  return useMemo(
    () => (limits && expenses ? buildStatuses(limits, spentByCategory(expenses)) : undefined),
    [limits, expenses],
  )
}
