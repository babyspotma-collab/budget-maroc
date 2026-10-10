/**
 * Budgets par catégorie. Un enregistrement vaut « à partir de ce mois » :
 * le plafond d'un mois est celui du dernier enregistrement dont `month` <= mois demandé
 * (report automatique, modifiable mois par mois). `limitCents = 0` retire le budget.
 */

export const WARN_PERCENT = 80
export const OVER_PERCENT = 100

export type AlertLevel = 'none' | 'ok' | 'warning' | 'over'

export interface BudgetRecord {
  categoryId: number
  month: string
  limitCents: number
}

/** Plafond effectif de chaque catégorie pour `month` (catégories sans budget absentes). */
export function resolveLimits(records: BudgetRecord[], month: string): Map<number, number> {
  const latest = new Map<number, BudgetRecord>()
  for (const r of records) {
    if (r.month > month) continue
    const current = latest.get(r.categoryId)
    if (!current || r.month > current.month) latest.set(r.categoryId, r)
  }
  const limits = new Map<number, number>()
  for (const [categoryId, r] of latest) {
    if (r.limitCents > 0) limits.set(categoryId, r.limitCents)
  }
  return limits
}

/** Niveau d'alerte : ok < 80 %, warning à partir de 80 %, over à partir de 100 %. */
export function alertLevel(spentCents: number, limitCents: number | undefined): AlertLevel {
  if (!limitCents || limitCents <= 0) return 'none'
  // Comparaison entière : pas d'erreur d'arrondi à la frontière.
  if (spentCents * 100 >= limitCents * OVER_PERCENT) return 'over'
  if (spentCents * 100 >= limitCents * WARN_PERCENT) return 'warning'
  return 'ok'
}

const SEVERITY: Record<AlertLevel, number> = { none: 0, ok: 1, warning: 2, over: 3 }

/** Niveau franchi par une dépense (warning ou over), `null` si rien de nouveau. */
export function crossedLevel(
  spentBefore: number,
  spentAfter: number,
  limitCents: number | undefined,
): 'warning' | 'over' | null {
  const before = alertLevel(spentBefore, limitCents)
  const after = alertLevel(spentAfter, limitCents)
  if (SEVERITY[after] > SEVERITY[before] && (after === 'warning' || after === 'over')) return after
  return null
}

export interface BudgetStatus {
  categoryId: number
  limitCents: number
  spentCents: number
  /** spent / limit (peut dépasser 1). */
  ratio: number
  percent: number
  level: AlertLevel
  /** Négatif en cas de dépassement. */
  remainingCents: number
}

export function statusFor(categoryId: number, spentCents: number, limitCents: number): BudgetStatus {
  return {
    categoryId,
    limitCents,
    spentCents,
    ratio: spentCents / limitCents,
    percent: Math.floor((spentCents * 100) / limitCents),
    level: alertLevel(spentCents, limitCents),
    remainingCents: limitCents - spentCents,
  }
}

/** Statuts des catégories budgétées, les plus critiques d'abord. */
export function buildStatuses(
  limits: Map<number, number>,
  spentByCategory: Map<number, number>,
): BudgetStatus[] {
  const list = [...limits].map(([id, limit]) => statusFor(id, spentByCategory.get(id) ?? 0, limit))
  return list.sort((a, b) => b.ratio - a.ratio || a.categoryId - b.categoryId)
}

export function alertsOf(statuses: BudgetStatus[]): BudgetStatus[] {
  return statuses.filter((s) => s.level === 'warning' || s.level === 'over')
}

export interface BudgetSummary {
  limitCents: number
  spentCents: number
  remainingCents: number
  ratio: number
}

/** Total des budgets et dépenses sur les seules catégories budgétées. */
export function summarize(statuses: BudgetStatus[]): BudgetSummary {
  const limitCents = statuses.reduce((s, x) => s + x.limitCents, 0)
  const spentCents = statuses.reduce((s, x) => s + x.spentCents, 0)
  return {
    limitCents,
    spentCents,
    remainingCents: limitCents - spentCents,
    ratio: limitCents > 0 ? spentCents / limitCents : 0,
  }
}
