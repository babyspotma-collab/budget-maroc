import type { Expense } from '../db/types'
import { dayNumber } from './dates'
import type { PlanRule, PlanStatus } from './plan'

/**
 * Catégories de charges fixes : leurs dépenses (loyer payé le 1er…) ne consomment pas le
 * budget variable du jour, sinon « il te reste X aujourd'hui » deviendrait absurde.
 */
export const FIXED_CATEGORY_KEYS = ['rent', 'utilities', 'phone', 'education', 'credit'] as const

/** Dépenses variables du jour (hors charges fixes), en centimes. */
export function variableSpentToday(
  expenses: Expense[],
  fixedCategoryIds: ReadonlySet<number>,
  today: string,
): number {
  return expenses
    .filter((e) => e.date === today && !fixedCategoryIds.has(e.categoryId))
    .reduce((sum, e) => sum + e.amountCents, 0)
}

/** Une règle par jour, qui tourne d'un jour à l'autre parmi celles du programme. */
export function ruleOfTheDay(rules: PlanRule[], today: string): PlanRule | null {
  if (rules.length === 0) return null
  const n = dayNumber(today)
  return rules[((n % rules.length) + rules.length) % rules.length]
}

export type GaugeKind = 'today' | 'month' | 'spent'

export interface TodayGauge {
  /**
   * - `today` : budget du jour du programme moins ce qui est déjà dépensé aujourd'hui ;
   * - `month` : pas de budget du jour fiable (déficit ou pas de programme) → reste à vivre ;
   * - `spent` : ni programme ni revenu → ce qui est dépensé aujourd'hui.
   */
  kind: GaugeKind
  /** Peut être négatif (dépassement). */
  amountCents: number
  over: boolean
}

export function todayGauge(input: {
  status: PlanStatus | null
  dailyCents: number
  spentTodayCents: number
  remainingMonthCents: number | undefined
}): TodayGauge {
  const { status, dailyCents, spentTodayCents, remainingMonthCents } = input
  if ((status === 'ok' || status === 'tight') && dailyCents > 0) {
    const left = dailyCents - spentTodayCents
    return { kind: 'today', amountCents: left, over: left < 0 }
  }
  if (remainingMonthCents !== undefined) {
    return { kind: 'month', amountCents: remainingMonthCents, over: remainingMonthCents < 0 }
  }
  return { kind: 'spent', amountCents: spentTodayCents, over: false }
}
