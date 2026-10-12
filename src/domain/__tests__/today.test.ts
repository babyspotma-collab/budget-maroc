import { describe, expect, it } from 'vitest'
import type { Expense } from '../../db/types'
import type { PlanRule } from '../plan'
import { ruleOfTheDay, todayGauge, variableSpentToday } from '../today'

const exp = (id: number, date: string, amountCents: number, categoryId: number): Expense => ({
  id,
  date,
  amountCents,
  categoryId,
  createdAt: id,
})

describe('variableSpentToday', () => {
  const fixed = new Set([3]) // catégorie « loyer »
  const list = [
    exp(1, '2026-10-12', 4500, 1),
    exp(2, '2026-10-12', 1500, 2),
    exp(3, '2026-10-12', 250000, 3), // loyer payé aujourd'hui : ignoré
    exp(4, '2026-10-11', 9900, 1), // hier : ignoré
  ]

  it('ne compte que les dépenses variables d\'aujourd\'hui', () => {
    expect(variableSpentToday(list, fixed, '2026-10-12')).toBe(6000)
  })

  it('renvoie 0 sans dépense', () => {
    expect(variableSpentToday([], fixed, '2026-10-12')).toBe(0)
    expect(variableSpentToday(list, fixed, '2026-10-20')).toBe(0)
  })
})

describe('ruleOfTheDay', () => {
  const rules: PlanRule[] = [
    { id: 'daily_cap', params: {} },
    { id: 'savings_goal', params: {} },
    { id: 'track_daily', params: {} },
  ]

  it('est stable dans la journée et tourne d\'un jour à l\'autre', () => {
    const a = ruleOfTheDay(rules, '2026-10-12')
    expect(ruleOfTheDay(rules, '2026-10-12')).toEqual(a)
    const seen = new Set(
      ['2026-10-12', '2026-10-13', '2026-10-14'].map((d) => ruleOfTheDay(rules, d)!.id),
    )
    expect(seen.size).toBe(3) // 3 jours consécutifs, 3 règles différentes
  })

  it('renvoie null sans règle', () => {
    expect(ruleOfTheDay([], '2026-10-12')).toBeNull()
  })
})

describe('todayGauge', () => {
  it('programme sain : budget du jour moins dépensé aujourd\'hui', () => {
    expect(
      todayGauge({ status: 'ok', dailyCents: 9700, spentTodayCents: 2500, remainingMonthCents: 100000 }),
    ).toEqual({ kind: 'today', amountCents: 7200, over: false })
  })

  it('signale le dépassement du jour', () => {
    const g = todayGauge({ status: 'tight', dailyCents: 2600, spentTodayCents: 4000, remainingMonthCents: 5000 })
    expect(g).toEqual({ kind: 'today', amountCents: -1400, over: true })
  })

  it('déficit : jamais de budget du jour à 0, on montre le reste du mois', () => {
    const g = todayGauge({ status: 'deficit', dailyCents: 0, spentTodayCents: 1000, remainingMonthCents: -30000 })
    expect(g.kind).toBe('month')
    expect(g.over).toBe(true)
  })

  it('sans programme : reste du mois si le revenu est connu', () => {
    expect(
      todayGauge({ status: null, dailyCents: 0, spentTodayCents: 0, remainingMonthCents: 200000 }),
    ).toEqual({ kind: 'month', amountCents: 200000, over: false })
  })

  it('sans programme ni revenu : dépensé aujourd\'hui', () => {
    expect(
      todayGauge({ status: null, dailyCents: 0, spentTodayCents: 1800, remainingMonthCents: undefined }),
    ).toEqual({ kind: 'spent', amountCents: 1800, over: false })
  })
})
