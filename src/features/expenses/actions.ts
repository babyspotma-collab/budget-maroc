import { db } from '../../db/database'
import type { Expense } from '../../db/types'

export type NewExpense = Omit<Expense, 'id' | 'createdAt'>

export async function addExpense(input: NewExpense): Promise<number> {
  return (await db.expenses.add({ ...input, createdAt: Date.now() })) as number
}

export async function updateExpense(
  id: number,
  changes: Partial<Pick<Expense, 'amountCents' | 'categoryId' | 'date' | 'note'>>,
): Promise<void> {
  await db.expenses.update(id, changes)
}

/** Supprime et renvoie l'original, pour permettre « Annuler ». */
export async function deleteExpense(id: number): Promise<Expense | undefined> {
  const existing = await db.expenses.get(id)
  if (existing) await db.expenses.delete(id)
  return existing
}

export async function restoreExpense(expense: Expense): Promise<void> {
  await db.expenses.put(expense)
}
