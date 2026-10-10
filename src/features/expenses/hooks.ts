import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { monthBounds } from '../../domain/dates'
import { recentExpenses } from '../../domain/expenses'

export function useMonthExpenses(month: string) {
  return useLiveQuery(() => {
    const { start, end } = monthBounds(month)
    return db.expenses.where('date').between(start, end, true, true).toArray()
  }, [month])
}

/** Dépenses les plus récentes, toutes périodes confondues. */
export function useRecentExpenses(n: number) {
  return useLiveQuery(async () => {
    const latest = await db.expenses.orderBy('date').reverse().limit(Math.max(n, 60)).toArray()
    return recentExpenses(latest, n)
  }, [n])
}

export function useExpenseCount() {
  return useLiveQuery(() => db.expenses.count(), [])
}

export function useMonthIncome(month: string) {
  return useLiveQuery(async () => (await db.monthlyIncomes.get(month))?.incomeCents ?? null, [
    month,
  ])
}
