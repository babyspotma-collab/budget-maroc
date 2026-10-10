import { describe, expect, it } from 'vitest'
import type { Category, Expense } from '../../db/types'
import { nextCategoryOrder, sortByRecentUse } from '../categories'
import {
  groupByDay,
  recentExpenses,
  remainingCents,
  sortExpenses,
  spentRatio,
  totalCents,
  totalsByCategory,
} from '../expenses'

const exp = (id: number, date: string, amountCents: number, categoryId = 1, createdAt = id): Expense => ({
  id,
  date,
  amountCents,
  categoryId,
  createdAt,
})

describe('expenses', () => {
  const list = [
    exp(1, '2026-10-01', 220000),
    exp(2, '2026-10-05', 5000),
    exp(3, '2026-10-05', 12000),
    exp(4, '2026-10-03', 800),
  ]

  it('trie du plus récent au plus ancien (puis par création)', () => {
    expect(sortExpenses(list).map((e) => e.id)).toEqual([3, 2, 4, 1])
  })

  it('ne modifie pas la liste d\'origine', () => {
    const copy = [...list]
    sortExpenses(list)
    expect(list).toEqual(copy)
  })

  it('totalise les montants en centimes', () => {
    expect(totalCents(list)).toBe(237800)
    expect(totalCents([])).toBe(0)
  })

  it('groupe par jour avec le total de chaque jour', () => {
    const groups = groupByDay(list)
    expect(groups.map((g) => g.date)).toEqual(['2026-10-05', '2026-10-03', '2026-10-01'])
    expect(groups[0].totalCents).toBe(17000)
    expect(groups[0].items.map((e) => e.id)).toEqual([3, 2])
    expect(groupByDay([])).toEqual([])
  })

  it('renvoie les N dernières dépenses', () => {
    expect(recentExpenses(list, 2).map((e) => e.id)).toEqual([3, 2])
    expect(recentExpenses(list, 10)).toHaveLength(4)
  })

  it('calcule le reste à vivre', () => {
    expect(remainingCents(750000, 237800)).toBe(512200)
    expect(remainingCents(100000, 150000)).toBe(-50000)
    expect(remainingCents(undefined, 1000)).toBeUndefined()
  })

  it('totalise par catégorie, du plus dépensé au moins dépensé', () => {
    const rows = totalsByCategory([exp(1, '2026-10-01', 500, 2), exp(2, '2026-10-01', 300, 1), exp(3, '2026-10-02', 400, 2), exp(4, '2026-10-02', 100, 3)])
    expect(rows).toEqual([
      { categoryId: 2, totalCents: 900 },
      { categoryId: 1, totalCents: 300 },
      { categoryId: 3, totalCents: 100 },
    ])
    expect(totalsByCategory([])).toEqual([])
  })

  it('calcule la part du revenu dépensée', () => {
    expect(spentRatio(100000, 25000)).toBe(0.25)
    expect(spentRatio(undefined, 25000)).toBe(0)
    expect(spentRatio(0, 25000)).toBe(0)
  })
})

describe('categories', () => {
  const cat = (id: number, order: number, hidden = false): Category => ({
    id,
    order,
    icon: '📦',
    color: '#000000',
    key: `k${id}`,
    hidden,
  })
  const cats = [cat(1, 1), cat(2, 2), cat(3, 3), cat(4, 4)]

  it('place les catégories récemment utilisées en premier', () => {
    const sorted = sortByRecentUse(cats, [exp(1, '2026-10-02', 1, 3), exp(2, '2026-10-05', 1, 2)])
    expect(sorted.map((c) => c.id)).toEqual([2, 3, 1, 4])
  })

  it('garde l\'ordre naturel sans historique', () => {
    expect(sortByRecentUse(cats, []).map((c) => c.id)).toEqual([1, 2, 3, 4])
  })

  it('donne l\'ordre suivant pour une nouvelle catégorie', () => {
    expect(nextCategoryOrder(cats)).toBe(5)
    expect(nextCategoryOrder([])).toBe(1)
  })
})
