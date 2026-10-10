import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../db/database'
import { addCategory, setCategoryHidden, updateCategory } from '../categories/actions'
import { clearDemoData, loadDemoData } from '../demo/actions'
import { addExpense, deleteExpense, restoreExpense, updateExpense } from '../expenses/actions'
import { setMonthlyIncome } from '../income/actions'
import { budgetCrossing, setBudget } from '../budgets/actions'
import { resolveLimits } from '../../domain/budget'

const NOW = new Date(2026, 9, 10, 12)

beforeEach(async () => {
  await db.expenses.clear()
  await db.monthlyIncomes.clear()
  await db.budgets.clear()
})

describe('budgets', () => {
  it('crée, met à jour (sans doublon) et retire un budget', async () => {
    const cat = (await db.categories.toCollection().first())!.id!
    await setBudget(cat, '2026-10', 200000)
    await setBudget(cat, '2026-10', 250000)
    expect(await db.budgets.count()).toBe(1)
    expect((await db.budgets.toArray())[0].limitCents).toBe(250000)

    await setBudget(cat, '2026-11', 0)
    const records = await db.budgets.toArray()
    expect(resolveLimits(records, '2026-10').get(cat)).toBe(250000)
    expect(resolveLimits(records, '2026-11').has(cat)).toBe(false)
  })

  it('reporte le budget et laisse les mois passés intacts', async () => {
    const cat = (await db.categories.toCollection().first())!.id!
    await setBudget(cat, '2026-08', 100000)
    await setBudget(cat, '2026-10', 150000)
    const records = await db.budgets.toArray()
    expect(resolveLimits(records, '2026-09').get(cat)).toBe(100000)
    expect(resolveLimits(records, '2026-12').get(cat)).toBe(150000)
  })

  it('signale le franchissement de 80 % puis de 100 % à l\'ajout', async () => {
    const cat = (await db.categories.toCollection().first())!.id!
    await setBudget(cat, '2026-10', 100000)
    await addExpense({ amountCents: 70000, categoryId: cat, date: '2026-10-02' })

    expect(await budgetCrossing(cat, '2026-10-05', 5000)).toBeNull()

    const warn = await budgetCrossing(cat, '2026-10-05', 15000)
    expect(warn).toMatchObject({ level: 'warning', spentAfterCents: 85000 })

    await addExpense({ amountCents: 15000, categoryId: cat, date: '2026-10-05' })
    const over = await budgetCrossing(cat, '2026-10-06', 20000)
    expect(over).toMatchObject({ level: 'over' })
  })

  it('n\'alerte pas sans budget, ni pour un autre mois, ni pour une valeur nulle', async () => {
    const cat = (await db.categories.toCollection().first())!.id!
    expect(await budgetCrossing(cat, '2026-10-05', 999999)).toBeNull()
    await setBudget(cat, '2026-10', 100000)
    expect(await budgetCrossing(cat, '2026-09-05', 999999)).toBeNull() // avant le budget
    expect(await budgetCrossing(cat, '2026-10-05', 0)).toBeNull()
  })
})

describe('catégories prédéfinies', () => {
  it('sont injectées au premier lancement', async () => {
    expect(await db.categories.count()).toBeGreaterThanOrEqual(11)
  })
})

describe('dépenses', () => {
  it('ajoute, modifie, supprime et restaure', async () => {
    const cat = (await db.categories.toCollection().first())!
    const id = await addExpense({ amountCents: 4500, categoryId: cat.id!, date: '2026-10-09' })
    expect((await db.expenses.get(id))?.amountCents).toBe(4500)

    await updateExpense(id, { amountCents: 5000, note: 'Marché' })
    expect(await db.expenses.get(id)).toMatchObject({ amountCents: 5000, note: 'Marché' })

    const deleted = await deleteExpense(id)
    expect(await db.expenses.get(id)).toBeUndefined()

    await restoreExpense(deleted!)
    expect(await db.expenses.get(id)).toMatchObject({ id, amountCents: 5000 })
  })

  it('supprimer une dépense inexistante ne plante pas', async () => {
    expect(await deleteExpense(99999)).toBeUndefined()
  })
})

describe('catégories personnalisées', () => {
  it('ajoute à la fin, modifie et masque', async () => {
    const before = await db.categories.count()
    const id = await addCategory({ name: 'Daret', icon: '🤝', color: '#2b3fa0' })
    expect(await db.categories.count()).toBe(before + 1)

    const created = (await db.categories.get(id))!
    const maxOther = Math.max(
      ...(await db.categories.toArray()).filter((c) => c.id !== id).map((c) => c.order),
    )
    expect(created.order).toBeGreaterThan(maxOther)

    await updateCategory(id, { name: 'Daret Fatima', color: '#c2512f' })
    expect(await db.categories.get(id)).toMatchObject({ name: 'Daret Fatima', color: '#c2512f' })

    await setCategoryHidden(id, true)
    expect((await db.categories.get(id))?.hidden).toBe(true)
    await setCategoryHidden(id, false)
    expect((await db.categories.get(id))?.hidden).toBe(false)
  })

  it('masquer une catégorie conserve ses dépenses', async () => {
    const cat = (await db.categories.toCollection().first())!
    const id = await addExpense({ amountCents: 1000, categoryId: cat.id!, date: '2026-10-01' })
    await setCategoryHidden(cat.id!, true)
    expect(await db.expenses.get(id)).toBeDefined()
    await setCategoryHidden(cat.id!, false)
  })
})

describe('revenu du mois', () => {
  it('définit puis supprime avec un montant nul', async () => {
    await setMonthlyIncome('2026-10', 650000)
    expect((await db.monthlyIncomes.get('2026-10'))?.incomeCents).toBe(650000)
    await setMonthlyIncome('2026-10', 700000)
    expect((await db.monthlyIncomes.get('2026-10'))?.incomeCents).toBe(700000)
    await setMonthlyIncome('2026-10', 0)
    expect(await db.monthlyIncomes.get('2026-10')).toBeUndefined()
  })
})

describe('données de démo', () => {
  it('charge 30 dépenses marquées et un revenu de démo', async () => {
    const n = await loadDemoData(NOW)
    expect(n).toBe(30)
    expect(await db.expenses.filter((e) => e.demo === true).count()).toBe(30)
    expect((await db.monthlyIncomes.get('2026-10'))?.demo).toBe(true)
  })

  it('est idempotent : recharger ne duplique pas', async () => {
    await loadDemoData(NOW)
    await loadDemoData(NOW)
    expect(await db.expenses.count()).toBe(30)
  })

  it('n\'efface que la démo et préserve les vraies données', async () => {
    const cat = (await db.categories.toCollection().first())!
    const realId = await addExpense({ amountCents: 1234, categoryId: cat.id!, date: '2026-10-02' })
    await loadDemoData(NOW)
    expect(await db.expenses.count()).toBe(31)

    const removed = await clearDemoData()
    expect(removed).toBe(37) // 30 dépenses + 1 revenu + 6 budgets de démo
    expect(await db.expenses.count()).toBe(1)
    expect(await db.expenses.get(realId)).toBeDefined()
    expect(await db.monthlyIncomes.count()).toBe(0)
    expect(await db.budgets.count()).toBe(0)
  })

  it('charge des budgets de démo, sans écraser un vrai budget', async () => {
    const groceries = (await db.categories.where('key').equals('groceries').first())!.id!
    await setBudget(groceries, '2026-09', 123400) // vrai budget (mois précédent, reporté)
    await loadDemoData(NOW)

    const demo = await db.budgets.filter((b) => b.demo === true).toArray()
    expect(demo).toHaveLength(5) // 6 budgets de démo moins « courses » déjà défini
    expect(demo.some((b) => b.categoryId === groceries)).toBe(false)

    await clearDemoData()
    const left = await db.budgets.toArray()
    expect(left).toHaveLength(1)
    expect(left[0]).toMatchObject({ categoryId: groceries, limitCents: 123400 })
  })

  it('n\'écrase pas un vrai revenu', async () => {
    await setMonthlyIncome('2026-10', 900000)
    await loadDemoData(NOW)
    expect(await db.monthlyIncomes.get('2026-10')).toMatchObject({ incomeCents: 900000 })
    await clearDemoData()
    expect((await db.monthlyIncomes.get('2026-10'))?.incomeCents).toBe(900000)
  })

  it('effacer sans démo renvoie 0', async () => {
    expect(await clearDemoData()).toBe(0)
  })
})
