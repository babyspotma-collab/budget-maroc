import type { Expense } from '../db/types'
import { addMonths, currentMonth } from './dates'
import { totalCents, totalsByCategory } from './expenses'

/** Au-delà de 6 parts, le camembert se lit mal : le reste est regroupé. */
export const MAX_SLICES = 6

export interface Slice {
  /** `null` pour la part « Autres catégories ». */
  categoryId: number | null
  totalCents: number
  /** Part du total, arrondie à l'entier. */
  percent: number
}

/** Les catégories les plus dépensées, et le reste regroupé en une seule part. */
export function pieSlices(list: Expense[], maxSlices: number = MAX_SLICES): Slice[] {
  const rows = totalsByCategory(list).filter((r) => r.totalCents > 0)
  const sum = rows.reduce((s, r) => s + r.totalCents, 0)
  if (sum === 0) return []

  const pct = (v: number) => Math.round((v * 100) / sum)
  const head = rows.slice(0, maxSlices)
  const tail = rows.slice(maxSlices)
  const slices: Slice[] = head.map((r) => ({
    categoryId: r.categoryId,
    totalCents: r.totalCents,
    percent: pct(r.totalCents),
  }))
  if (tail.length > 0) {
    const rest = tail.reduce((s, r) => s + r.totalCents, 0)
    slices.push({ categoryId: null, totalCents: rest, percent: pct(rest) })
  }
  return slices
}

export function daysInMonth(month: string): number {
  const [y, m] = month.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

/** Dernier jour à représenter : aujourd'hui (mois courant), tout le mois (passé), 0 (futur). */
export function lastVisibleDay(month: string, now: Date = new Date()): number {
  const current = currentMonth(now)
  if (month === current) return now.getDate()
  return month < current ? daysInMonth(month) : 0
}

export interface CumulativePoint {
  day: number
  cumulativeCents: number
}

/** Dépenses cumulées jour par jour, de 1 à `lastDay` (inclus). */
export function cumulativeByDay(
  list: Expense[],
  month: string,
  lastDay: number,
): CumulativePoint[] {
  const perDay = new Map<number, number>()
  for (const e of list) {
    if (!e.date.startsWith(month)) continue
    const day = Number(e.date.slice(8, 10))
    perDay.set(day, (perDay.get(day) ?? 0) + e.amountCents)
  }
  const points: CumulativePoint[] = []
  let running = 0
  for (let day = 1; day <= lastDay; day++) {
    running += perDay.get(day) ?? 0
    points.push({ day, cumulativeCents: running })
  }
  return points
}

export interface CurvePoint {
  day: number
  current: number | null
  previous: number | null
}

/** Fusionne la courbe du mois et celle du mois précédent sur un même axe des jours. */
export function curveData(
  current: CumulativePoint[],
  previous: CumulativePoint[],
  maxDay: number,
): CurvePoint[] {
  const cur = new Map(current.map((p) => [p.day, p.cumulativeCents]))
  const prev = new Map(previous.map((p) => [p.day, p.cumulativeCents]))
  const rows: CurvePoint[] = []
  for (let day = 1; day <= maxDay; day++) {
    rows.push({ day, current: cur.get(day) ?? null, previous: prev.get(day) ?? null })
  }
  return rows
}

export interface MonthStats {
  totalCents: number
  count: number
  /** Moyenne par jour écoulé (0 si aucun jour à représenter). */
  averagePerDayCents: number
  /** Variation du total par rapport au mois précédent, en %, `null` si pas de base. */
  changePercent: number | null
}

export function monthStats(
  expenses: Expense[],
  previousExpenses: Expense[],
  month: string,
  now: Date = new Date(),
): MonthStats {
  const total = totalCents(expenses)
  const prevTotal = totalCents(previousExpenses)
  const days = lastVisibleDay(month, now)
  return {
    totalCents: total,
    count: expenses.length,
    averagePerDayCents: days > 0 ? Math.round(total / days) : 0,
    changePercent: prevTotal > 0 ? Math.round(((total - prevTotal) * 100) / prevTotal) : null,
  }
}

export function previousMonth(month: string): string {
  return addMonths(month, -1)
}
