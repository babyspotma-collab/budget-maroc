import type { Expense } from '../db/types'

export interface DayGroup {
  date: string
  totalCents: number
  items: Expense[]
}

/** Plus récent d'abord : date, puis ordre de création. */
export function sortExpenses(list: Expense[]): Expense[] {
  return [...list].sort(
    (a, b) =>
      b.date.localeCompare(a.date) || b.createdAt - a.createdAt || (b.id ?? 0) - (a.id ?? 0),
  )
}

export function totalCents(list: Expense[]): number {
  return list.reduce((sum, e) => sum + e.amountCents, 0)
}

export function groupByDay(list: Expense[]): DayGroup[] {
  const groups: DayGroup[] = []
  for (const e of sortExpenses(list)) {
    const last = groups[groups.length - 1]
    if (last && last.date === e.date) {
      last.items.push(e)
      last.totalCents += e.amountCents
    } else {
      groups.push({ date: e.date, totalCents: e.amountCents, items: [e] })
    }
  }
  return groups
}

export function recentExpenses(list: Expense[], n: number): Expense[] {
  return sortExpenses(list).slice(0, n)
}

export interface CategoryTotal {
  categoryId: number
  totalCents: number
}

/** Total par catégorie, du plus dépensé au moins dépensé. */
export function totalsByCategory(list: Expense[]): CategoryTotal[] {
  const sums = new Map<number, number>()
  for (const e of list) sums.set(e.categoryId, (sums.get(e.categoryId) ?? 0) + e.amountCents)
  return [...sums.entries()]
    .map(([categoryId, totalCents]) => ({ categoryId, totalCents }))
    .sort((a, b) => b.totalCents - a.totalCents || a.categoryId - b.categoryId)
}

/** Reste à vivre = revenu − dépenses. `undefined` si aucun revenu n'est défini. */
export function remainingCents(incomeCents: number | undefined, spentCents: number) {
  return incomeCents === undefined ? undefined : incomeCents - spentCents
}

/** Part du revenu dépensée (0 si pas de revenu). */
export function spentRatio(incomeCents: number | undefined, spentCents: number): number {
  if (!incomeCents || incomeCents <= 0) return 0
  return spentCents / incomeCents
}
