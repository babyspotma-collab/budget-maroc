import { db } from '../../db/database'
import { currentMonth } from '../../domain/dates'
import { DEMO_BUDGETS_MAD, generateDemo } from '../../domain/demo'

/**
 * Charge les données de démo du mois courant (remplace une démo précédente).
 * Les données réelles ne sont jamais touchées : la démo est marquée `demo: true`
 * (dépenses, revenu, budgets) ; un budget réel existant n'est pas écrasé.
 */
export async function loadDemoData(now: Date = new Date()): Promise<number> {
  const categories = await db.categories.toArray()
  const idByKey: Record<string, number> = {}
  for (const c of categories) if (c.key && c.id !== undefined) idByKey[c.key] = c.id

  const { expenses, incomeCents } = generateDemo(now, idByKey)
  const month = currentMonth(now)

  await db.transaction('rw', db.expenses, db.monthlyIncomes, db.budgets, async () => {
    await db.expenses.filter((e) => e.demo === true).delete()
    await db.budgets.filter((b) => b.demo === true).delete()
    await db.expenses.bulkAdd(expenses.map((e) => ({ ...e, demo: true })))

    const existing = await db.monthlyIncomes.get(month)
    // On n'écrase jamais un vrai revenu saisi par l'utilisateur.
    if (!existing || existing.demo) {
      await db.monthlyIncomes.put({ month, incomeCents, demo: true })
    }

    const realBudgets = await db.budgets.toArray()
    for (const [key, mad] of Object.entries(DEMO_BUDGETS_MAD)) {
      const categoryId = idByKey[key]
      if (categoryId === undefined) continue
      // Si l'utilisateur a déjà un budget pour cette catégorie, on n'y touche pas.
      if (realBudgets.some((b) => b.categoryId === categoryId)) continue
      await db.budgets.add({ categoryId, month, limitCents: mad * 100, demo: true })
    }
  })
  return expenses.length
}

/** Efface uniquement les éléments de démo ; renvoie leur nombre. */
export async function clearDemoData(): Promise<number> {
  return db.transaction('rw', db.expenses, db.monthlyIncomes, db.budgets, async () => {
    const expenses = await db.expenses.filter((e) => e.demo === true).delete()
    const incomes = await db.monthlyIncomes.filter((i) => i.demo === true).delete()
    const budgets = await db.budgets.filter((b) => b.demo === true).delete()
    return expenses + incomes + budgets
  })
}
