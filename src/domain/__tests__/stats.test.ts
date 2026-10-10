import { describe, expect, it } from 'vitest'
import type { Expense } from '../../db/types'
import {
  cumulativeByDay,
  curveData,
  daysInMonth,
  lastVisibleDay,
  monthStats,
  pieSlices,
} from '../stats'

const exp = (id: number, date: string, amountCents: number, categoryId = 1): Expense => ({
  id,
  date,
  amountCents,
  categoryId,
  createdAt: id,
})

describe('pieSlices', () => {
  it('trie par montant et calcule les parts', () => {
    const slices = pieSlices([exp(1, '2026-10-01', 7500, 1), exp(2, '2026-10-02', 2500, 2)])
    expect(slices).toEqual([
      { categoryId: 1, totalCents: 7500, percent: 75 },
      { categoryId: 2, totalCents: 2500, percent: 25 },
    ])
  })

  it('regroupe le reste en « Autres » au-delà de 6 parts', () => {
    const list = Array.from({ length: 9 }, (_, i) => exp(i + 1, '2026-10-01', (9 - i) * 1000, i + 1))
    const slices = pieSlices(list)
    expect(slices).toHaveLength(7)
    expect(slices.slice(0, 6).every((s) => s.categoryId !== null)).toBe(true)
    const others = slices[6]
    expect(others.categoryId).toBeNull()
    expect(others.totalCents).toBe(3000 + 2000 + 1000) // catégories 7, 8 et 9
    expect(slices.reduce((s, x) => s + x.totalCents, 0)).toBe(45000)
  })

  it('ne regroupe pas 6 parts ou moins', () => {
    const list = Array.from({ length: 6 }, (_, i) => exp(i + 1, '2026-10-01', 1000, i + 1))
    expect(pieSlices(list)).toHaveLength(6)
  })

  it('renvoie une liste vide sans dépense', () => {
    expect(pieSlices([])).toEqual([])
  })
})

describe('jours du mois', () => {
  it('compte les jours, y compris février bissextile', () => {
    expect(daysInMonth('2026-10')).toBe(31)
    expect(daysInMonth('2026-02')).toBe(28)
    expect(daysInMonth('2024-02')).toBe(29)
  })

  it('détermine le dernier jour à afficher', () => {
    const now = new Date(2026, 9, 10)
    expect(lastVisibleDay('2026-10', now)).toBe(10)
    expect(lastVisibleDay('2026-09', now)).toBe(30)
    expect(lastVisibleDay('2026-11', now)).toBe(0)
  })
})

describe('cumulativeByDay et curveData', () => {
  const list = [
    exp(1, '2026-10-01', 1000),
    exp(2, '2026-10-01', 500),
    exp(3, '2026-10-04', 2000),
    exp(4, '2026-09-30', 9999), // autre mois : ignoré
  ]

  it('cumule jour par jour, jours vides inclus', () => {
    const pts = cumulativeByDay(list, '2026-10', 5)
    expect(pts.map((p) => p.cumulativeCents)).toEqual([1500, 1500, 1500, 3500, 3500])
    expect(pts[0].day).toBe(1)
    expect(pts).toHaveLength(5)
  })

  it('est croissante', () => {
    const pts = cumulativeByDay(list, '2026-10', 31)
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].cumulativeCents).toBeGreaterThanOrEqual(pts[i - 1].cumulativeCents)
    }
  })

  it('fusionne deux mois sur un même axe, avec des trous', () => {
    const cur = cumulativeByDay(list, '2026-10', 3)
    const prev = cumulativeByDay([exp(9, '2026-09-02', 700)], '2026-09', 5)
    const rows = curveData(cur, prev, 5)
    expect(rows).toHaveLength(5)
    expect(rows[0]).toEqual({ day: 1, current: 1500, previous: 0 })
    expect(rows[1]).toEqual({ day: 2, current: 1500, previous: 700 })
    expect(rows[3].current).toBeNull() // pas de point au-delà du jour courant
    expect(rows[4].previous).toBe(700)
  })
})

describe('monthStats', () => {
  const now = new Date(2026, 9, 10)
  const cur = [exp(1, '2026-10-02', 30000), exp(2, '2026-10-08', 20000)]
  const prev = [exp(3, '2026-09-10', 40000)]

  it('calcule total, moyenne par jour écoulé et variation', () => {
    const s = monthStats(cur, prev, '2026-10', now)
    expect(s.totalCents).toBe(50000)
    expect(s.count).toBe(2)
    expect(s.averagePerDayCents).toBe(5000) // 50000 / 10 jours
    expect(s.changePercent).toBe(25)
  })

  it('variation négative', () => {
    expect(monthStats([exp(1, '2026-10-02', 20000)], prev, '2026-10', now).changePercent).toBe(-50)
  })

  it('pas de variation sans mois précédent', () => {
    expect(monthStats(cur, [], '2026-10', now).changePercent).toBeNull()
  })

  it('moyenne d\'un mois passé : divisée par tous ses jours', () => {
    const s = monthStats([exp(1, '2026-09-02', 30000)], [], '2026-09', now)
    expect(s.averagePerDayCents).toBe(1000) // 30000 / 30
  })
})
