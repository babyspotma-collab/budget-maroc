import { db } from '../../db/database'
import { currentMonth } from '../../domain/dates'
import { generatePlan, type Plan, type Profile } from '../../domain/plan'
import { resolveLimits } from '../../domain/budget'
import { setBudget } from '../budgets/actions'
import { setMonthlyIncome } from '../income/actions'

const SKIP_KEY = 'budget.onboardingSkipped'

/** L'utilisateur a choisi « Plus tard » : on ne le redirige plus vers le questionnaire. */
export function isOnboardingSkipped(): boolean {
  try {
    return localStorage.getItem(SKIP_KEY) === '1'
  } catch {
    return false
  }
}

export function skipOnboarding(): void {
  try {
    localStorage.setItem(SKIP_KEY, '1')
  } catch {
    /* ignoré */
  }
}

/** Enregistre le profil et (re)génère le programme ; la progression est remise à zéro. */
export async function saveProgram(profile: Profile, now: Date = new Date()): Promise<Plan> {
  const plan = generatePlan(profile, now)
  await db.transaction('rw', db.profile, db.program, async () => {
    await db.profile.put({ id: 1, profile, updatedAt: now.getTime() })
    await db.program.put({ id: 1, plan, generatedAt: now.getTime(), weekDone: [] })
  })
  return plan
}

/**
 * Crée les budgets du programme à partir du mois courant, fixe le revenu du mois, et
 * remet à zéro les budgets des catégories prédéfinies que le programme ne prévoit pas.
 * Renvoie le nombre de budgets créés.
 */
export async function applyProgram(now: Date = new Date()): Promise<number> {
  const program = await db.program.get(1)
  const stored = await db.profile.get(1)
  if (!program || !stored) return 0

  const month = currentMonth(now)
  const categories = await db.categories.toArray()
  const records = await db.budgets.toArray()
  const current = resolveLimits(records, month)

  let created = 0
  for (const c of categories) {
    if (!c.key || c.id === undefined) continue
    const limit = program.plan.budgets[c.key]
    if (limit && limit > 0) {
      await setBudget(c.id, month, limit)
      created++
    } else if (current.has(c.id)) {
      await setBudget(c.id, month, 0)
    }
  }

  await setMonthlyIncome(month, stored.profile.incomeCents)
  await db.program.update(1, { appliedAt: now.getTime() })
  return created
}

export async function toggleWeekDay(day: number): Promise<void> {
  const program = await db.program.get(1)
  if (!program) return
  const done = new Set(program.weekDone)
  if (done.has(day)) done.delete(day)
  else done.add(day)
  await db.program.update(1, { weekDone: [...done].sort((a, b) => a - b) })
}
