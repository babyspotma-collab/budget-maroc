import { db } from '../../db/database'

/** Définit le revenu du mois ; un montant <= 0 le supprime. */
export async function setMonthlyIncome(month: string, incomeCents: number): Promise<void> {
  if (incomeCents > 0) await db.monthlyIncomes.put({ month, incomeCents })
  else await db.monthlyIncomes.delete(month)
}
