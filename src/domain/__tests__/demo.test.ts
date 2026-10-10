import { describe, expect, it } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../db/seed'
import { DEMO_EXPENSE_COUNT, generateDemo } from '../demo'

const ids = Object.fromEntries(DEFAULT_CATEGORIES.map((c, i) => [c.key!, i + 1]))

describe('generateDemo', () => {
  const now = new Date(2026, 9, 10, 12) // 10 octobre 2026

  it('produit 30 dépenses du 1er du mois jusqu\'à aujourd\'hui', () => {
    const { expenses } = generateDemo(now, ids)
    expect(expenses).toHaveLength(DEMO_EXPENSE_COUNT)
    for (const e of expenses) {
      expect(e.date >= '2026-10-01' && e.date <= '2026-10-10').toBe(true)
      expect(e.amountCents).toBeGreaterThan(0)
      expect(e.amountCents % 100).toBe(0)
      expect(Object.values(ids)).toContain(e.categoryId)
    }
  })

  it('est déterministe pour un même mois', () => {
    expect(generateDemo(now, ids)).toEqual(generateDemo(now, ids))
  })

  it('reste valide le 1er du mois (toutes les dépenses le même jour)', () => {
    const first = new Date(2026, 9, 1, 8)
    const { expenses } = generateDemo(first, ids)
    expect(expenses).toHaveLength(DEMO_EXPENSE_COUNT)
    expect(new Set(expenses.map((e) => e.date))).toEqual(new Set(['2026-10-01']))
  })

  it('contient un loyer, et un revenu supérieur aux dépenses', () => {
    const { expenses, incomeCents } = generateDemo(now, ids)
    expect(expenses.some((e) => e.categoryId === ids.rent && e.amountCents === 220000)).toBe(true)
    const total = expenses.reduce((s, e) => s + e.amountCents, 0)
    expect(incomeCents).toBeGreaterThan(total)
  })

  it('ignore les catégories absentes', () => {
    const { expenses } = generateDemo(now, { rent: 1 })
    expect(expenses.every((e) => e.categoryId === 1)).toBe(true)
    expect(expenses).toHaveLength(1)
  })
})
