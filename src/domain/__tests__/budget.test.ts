import { describe, expect, it } from 'vitest'
import {
  alertLevel,
  alertsOf,
  buildStatuses,
  crossedLevel,
  resolveLimits,
  statusFor,
  summarize,
} from '../budget'

describe('resolveLimits (report automatique)', () => {
  const records = [
    { categoryId: 1, month: '2026-08', limitCents: 200000 },
    { categoryId: 1, month: '2026-10', limitCents: 250000 },
    { categoryId: 2, month: '2026-09', limitCents: 50000 },
    { categoryId: 2, month: '2026-11', limitCents: 0 }, // budget retiré à partir de novembre
  ]

  it('reporte le dernier budget connu', () => {
    expect(resolveLimits(records, '2026-09').get(1)).toBe(200000)
    expect(resolveLimits(records, '2026-10').get(1)).toBe(250000)
    expect(resolveLimits(records, '2027-03').get(1)).toBe(250000)
  })

  it('ignore les budgets futurs', () => {
    expect(resolveLimits(records, '2026-07').size).toBe(0)
    expect(resolveLimits(records, '2026-08').get(2)).toBeUndefined()
  })

  it('un plafond de 0 retire le budget à partir de ce mois', () => {
    expect(resolveLimits(records, '2026-10').get(2)).toBe(50000)
    expect(resolveLimits(records, '2026-11').has(2)).toBe(false)
    expect(resolveLimits(records, '2027-01').has(2)).toBe(false)
  })

  it('une modification ne touche pas les mois précédents', () => {
    expect(resolveLimits(records, '2026-09').get(1)).toBe(200000)
  })
})

describe('alertLevel', () => {
  it('sans budget', () => {
    expect(alertLevel(1000, undefined)).toBe('none')
    expect(alertLevel(1000, 0)).toBe('none')
  })

  it('frontières à 80 % et 100 %', () => {
    const limit = 100000
    expect(alertLevel(0, limit)).toBe('ok')
    expect(alertLevel(79999, limit)).toBe('ok')
    expect(alertLevel(80000, limit)).toBe('warning')
    expect(alertLevel(99999, limit)).toBe('warning')
    expect(alertLevel(100000, limit)).toBe('over')
    expect(alertLevel(150000, limit)).toBe('over')
  })

  it('pas d\'erreur d\'arrondi sur des plafonds « difficiles »', () => {
    // 80 % de 33,33 MAD = 26,664 : 26,67 déclenche, 26,66 non
    expect(alertLevel(2666, 3333)).toBe('ok')
    expect(alertLevel(2667, 3333)).toBe('warning')
  })
})

describe('crossedLevel', () => {
  it('signale le franchissement de 80 % puis de 100 %', () => {
    expect(crossedLevel(70000, 85000, 100000)).toBe('warning')
    expect(crossedLevel(85000, 105000, 100000)).toBe('over')
    expect(crossedLevel(70000, 120000, 100000)).toBe('over')
  })

  it('ne répète pas une alerte déjà franchie', () => {
    expect(crossedLevel(85000, 90000, 100000)).toBeNull()
    expect(crossedLevel(110000, 120000, 100000)).toBeNull()
  })

  it('rien sous le seuil ou sans budget', () => {
    expect(crossedLevel(10000, 20000, 100000)).toBeNull()
    expect(crossedLevel(10000, 20000, undefined)).toBeNull()
  })
})

describe('statuts et synthèse', () => {
  const limits = new Map([
    [1, 100000],
    [2, 50000],
    [3, 20000],
  ])
  const spent = new Map([
    [1, 85000],
    [2, 60000],
    [9, 12345], // catégorie sans budget : ignorée
  ])

  it('calcule le statut d\'une catégorie', () => {
    const s = statusFor(1, 85000, 100000)
    expect(s).toMatchObject({ percent: 85, level: 'warning', remainingCents: 15000 })
    expect(statusFor(2, 60000, 50000)).toMatchObject({ percent: 120, level: 'over', remainingCents: -10000 })
  })

  it('trie les statuts du plus consommé au moins consommé', () => {
    const list = buildStatuses(limits, spent)
    expect(list.map((s) => s.categoryId)).toEqual([2, 1, 3])
    expect(list[2].spentCents).toBe(0)
  })

  it('extrait les alertes', () => {
    const alerts = alertsOf(buildStatuses(limits, spent))
    expect(alerts.map((a) => [a.categoryId, a.level])).toEqual([
      [2, 'over'],
      [1, 'warning'],
    ])
  })

  it('totalise uniquement les catégories budgétées', () => {
    const sum = summarize(buildStatuses(limits, spent))
    expect(sum.limitCents).toBe(170000)
    expect(sum.spentCents).toBe(145000)
    expect(sum.remainingCents).toBe(25000)
    expect(sum.ratio).toBeCloseTo(145000 / 170000)
    expect(summarize([]).ratio).toBe(0)
  })
})
