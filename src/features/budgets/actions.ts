import { db } from '../../db/database'
import { crossedLevel, resolveLimits } from '../../domain/budget'
import { monthBounds, monthOf } from '../../domain/dates'

/**
 * Définit le plafond d'une catégorie à partir de `month` (0 = retirer le budget).
 * Écrase l'enregistrement de ce mois s'il existe ; les mois précédents ne changent pas.
 */
export async function setBudget(
  categoryId: number,
  month: string,
  limitCents: number,
): Promise<void> {
  const existing = await db.budgets.where('[categoryId+month]').equals([categoryId, month]).first()
  if (existing?.id !== undefined) {
    await db.budgets.update(existing.id, { limitCents, demo: undefined })
  } else {
    await db.budgets.add({ categoryId, month, limitCents })
  }
}

export interface Crossing {
  level: 'warning' | 'over'
  limitCents: number
  spentAfterCents: number
}

/**
 * Niveau d'alerte franchi si on ajoute `deltaCents` aux dépenses de la catégorie
 * pour le mois de `date`. À appeler AVANT d'enregistrer la dépense.
 */
export async function budgetCrossing(
  categoryId: number,
  date: string,
  deltaCents: number,
): Promise<Crossing | null> {
  if (deltaCents <= 0) return null
  const month = monthOf(date)
  const records = await db.budgets.filter((b) => b.categoryId === categoryId).toArray()
  const limit = resolveLimits(records, month).get(categoryId)
  if (!limit) return null

  const { start, end } = monthBounds(month)
  const inMonth = await db.expenses.where('date').between(start, end, true, true).toArray()
  const before = inMonth
    .filter((e) => e.categoryId === categoryId)
    .reduce((sum, e) => sum + e.amountCents, 0)
  const after = before + deltaCents

  const level = crossedLevel(before, after, limit)
  return level ? { level, limitCents: limit, spentAfterCents: after } : null
}
