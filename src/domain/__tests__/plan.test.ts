import { describe, expect, it } from 'vitest'
import { generatePlan, nextPayDate, shiftMonths, type Profile } from '../plan'

const NOW = new Date(2026, 9, 11, 12) // 11 octobre 2026
const MAD = (n: number) => n * 100

const NO_CHARGES = { rentCents: 0, creditCents: 0, schoolCents: 0, billsCents: 0, transportCents: 0 }

/** Salarié, revenu régulier, un enfant, aucune épargne. */
const employee: Profile = {
  firstName: 'Samira',
  situation: 'employee',
  incomeCents: MAD(8000),
  incomeKind: 'regular',
  payDay: 25,
  charges: {
    rentCents: MAD(2500),
    creditCents: 0,
    schoolCents: 0,
    billsCents: MAD(400),
    transportCents: MAD(300),
  },
  debtMonthlyCents: 0,
  debtTotalCents: 0,
  daretMonthlyCents: MAD(500),
  dependents: 1,
  goal: 'save',
  problem: 'no_savings',
}

/** Commerçant à revenu variable, dette à rembourser, deux personnes à charge. */
const merchant: Profile = {
  firstName: 'Youssef',
  situation: 'merchant',
  incomeCents: MAD(10000),
  incomeKind: 'variable',
  payDay: 1,
  charges: {
    rentCents: MAD(3000),
    creditCents: MAD(1000),
    schoolCents: 0,
    billsCents: MAD(600),
    transportCents: MAD(800),
  },
  debtMonthlyCents: MAD(700),
  debtTotalCents: MAD(15000),
  daretMonthlyCents: 0,
  dependents: 2,
  goal: 'repay_debt',
  problem: 'month_end',
}

/** Étudiante, petit revenu, achats impulsifs. */
const student: Profile = {
  firstName: 'Nadia',
  situation: 'student',
  incomeCents: MAD(3000),
  incomeKind: 'regular',
  payDay: 5,
  charges: { ...NO_CHARGES, rentCents: MAD(1000), billsCents: MAD(100), transportCents: MAD(200) },
  debtMonthlyCents: 0,
  debtTotalCents: 0,
  daretMonthlyCents: 0,
  dependents: 0,
  goal: 'understand',
  problem: 'impulsive',
}

const ids = (p: Profile) => generatePlan(p, NOW).rules.map((r) => r.id)

describe('invariants du plan', () => {
  for (const [name, profile] of [
    ['salarié', employee],
    ['commerçant', merchant],
    ['étudiante', student],
  ] as const) {
    it(`${name} : montants cohérents`, () => {
      const plan = generatePlan(profile, NOW)
      expect(plan.savingsCents).toBeGreaterThanOrEqual(0)
      expect(plan.spendableCents).toBeGreaterThanOrEqual(0)
      for (const v of Object.values(plan.budgets)) {
        expect(Number.isInteger(v)).toBe(true)
        expect(v).toBeGreaterThan(0)
      }
      // Épargne + dépenses + charges + dette supplémentaire ne dépassent pas le revenu planifié.
      const committed =
        plan.fixedCents +
        plan.obligationsCents +
        plan.savingsCents +
        plan.spendableCents +
        (plan.debt?.extraCents ?? 0)
      expect(committed).toBeLessThanOrEqual(plan.planningIncomeCents + 1000)
      expect(committed).toBeGreaterThan(plan.planningIncomeCents - 2000)
    })

    it(`${name} : 3 à 5 règles uniques, avec le budget journalier`, () => {
      const rules = ids(profile)
      expect(rules.length).toBeGreaterThanOrEqual(3)
      expect(rules.length).toBeLessThanOrEqual(5)
      expect(new Set(rules).size).toBe(rules.length)
      expect(rules).toContain('daily_cap')
    })

    it(`${name} : première semaine sur 7 jours`, () => {
      const week = generatePlan(profile, NOW).week1
      expect(week.map((a) => a.day)).toEqual([1, 2, 3, 4, 5, 6, 7])
      expect(week[0].id).toBe('apply_budgets')
      expect(week[6].id).toBe('weekly_review')
    })
  }

  it('est déterministe', () => {
    expect(generatePlan(merchant, NOW)).toEqual(generatePlan(merchant, NOW))
  })
})

describe('salarié (revenu régulier)', () => {
  const plan = generatePlan(employee, NOW)

  it('utilise le revenu déclaré et calcule le budget journalier', () => {
    expect(plan.planningIncomeCents).toBe(MAD(8000))
    expect(plan.marginCents).toBe(MAD(8000 - 3200 - 500))
    // 4 300 MAD de marge, ~16 % épargnés → environ 3 000 MAD pour 31 jours
    expect(plan.dailyCents).toBeGreaterThan(MAD(85))
    expect(plan.dailyCents).toBeLessThan(MAD(105))
  })

  it('épargne chaque mois et fixe un objectif daté (matelas de 3 mois)', () => {
    expect(plan.savingsCents).toBeGreaterThan(0)
    expect(plan.savingsGoal.kind).toBe('emergency')
    expect(plan.savingsGoal.targetCents).toBe((employee.charges.rentCents + MAD(400) + MAD(300) + MAD(500)) * 3)
    expect(plan.savingsGoal.months).toBe(Math.ceil(plan.savingsGoal.targetCents / plan.savingsCents))
    expect(plan.savingsGoal.targetDate).not.toBeNull()
  })

  it('applique les règles « épargne automatique » et « daret », pas celles du revenu variable', () => {
    const rules = ids(employee)
    expect(rules).toContain('no_savings_auto')
    expect(rules).not.toContain('variable_floor')
    expect(rules).not.toContain('weekly_envelope')
    expect(rules).not.toContain('impulse_24h')
  })

  it('range les charges fixes dans leurs catégories', () => {
    expect(plan.budgets.rent).toBe(MAD(2500))
    expect(plan.budgets.utilities! + plan.budgets.phone!).toBe(MAD(400))
    expect(plan.budgets.transport!).toBeGreaterThanOrEqual(MAD(300))
  })
})

describe('commerçant à revenu variable', () => {
  const plan = generatePlan(merchant, NOW)

  it('planifie sur 70 % du revenu moyen', () => {
    expect(plan.planningIncomeCents).toBe(MAD(7000))
  })

  it('a un plan serré : charges lourdes, pas d\'épargne mais un effort sur la dette', () => {
    expect(plan.fixedRatio).toBeGreaterThan(0.8)
    expect(plan.savingsCents).toBe(0)
    expect(plan.debt).not.toBeNull()
    expect(plan.debt!.extraCents).toBeGreaterThan(0)
    expect(plan.debt!.months).toBe(Math.ceil(MAD(15000) / plan.debt!.monthlyCents))
    expect(plan.debt!.payoffDate).not.toBeNull()
  })

  it('reçoit des règles différentes du salarié', () => {
    const rules = ids(merchant)
    expect(rules).toContain('variable_floor')
    expect(rules).toContain('debt_first')
    expect(rules).toContain('fixed_charges_high')
    expect(rules).not.toContain('no_savings_auto')
  })

  it('a une enveloppe hebdomadaire dans la semaine 1 et un plan de dette', () => {
    const week = generatePlan(merchant, NOW).week1
    expect(week[2].id).toBe('weekly_envelope')
    expect(week[3].id).toBe('debt_plan')
    expect(week[5].id).toBe('family_talk')
  })
})

describe('étudiante impulsive', () => {
  const plan = generatePlan(student, NOW)

  it('reçoit la règle des 24 h et le plafond étudiant', () => {
    const rules = ids(student)
    expect(rules).toContain('impulse_24h')
    expect(rules).toContain('student_cap')
    expect(rules).toContain('track_daily')
  })

  it('redirige vers l\'épargne ce qu\'elle ne doit pas dépenser', () => {
    const calm = generatePlan({ ...student, problem: 'no_tracking' }, NOW)
    expect(plan.savingsCents).toBeGreaterThan(calm.savingsCents)
    expect(plan.budgets.outings!).toBeLessThan(calm.budgets.outings!)
    expect(plan.budgets.clothing!).toBeLessThan(calm.budgets.clothing!)
  })

  it('plafonne l\'épargne des étudiants avant redirection', () => {
    const calm = generatePlan({ ...student, problem: 'no_tracking' }, NOW)
    expect(calm.savingsCents).toBeLessThanOrEqual(Math.round(MAD(3000) * 0.05) + 1000)
  })

  it('a des journées sans dépense et un plan repas étudiant', () => {
    const week = plan.week1
    expect(week[2].id).toBe('no_spend_day')
    expect(week[5].id).toBe('student_meals')
  })
})

describe('cas limites', () => {
  it('déficit : aucune épargne ni dépense variable, règle « deficit » en tête', () => {
    const p: Profile = {
      ...employee,
      incomeCents: MAD(3000),
      charges: { ...NO_CHARGES, rentCents: MAD(3000) },
      daretMonthlyCents: 0,
      dependents: 0,
    }
    const plan = generatePlan(p, NOW)
    expect(plan.marginCents).toBeLessThanOrEqual(0)
    expect(plan.savingsCents).toBe(0)
    expect(plan.spendableCents).toBe(0)
    expect(plan.dailyCents).toBe(0)
    expect(plan.savingsGoal.months).toBeNull()
    expect(plan.savingsGoal.targetDate).toBeNull()
    const rules = plan.rules.map((r) => r.id)
    expect(rules[0]).toBe('deficit')
    expect(plan.rules[0].params.gapCents).toBe(-plan.marginCents)
  })

  it('l\'épargne ne dépasse jamais la moitié de la marge', () => {
    for (const goal of ['save', 'project', 'finish_month', 'understand', 'repay_debt'] as const) {
      const plan = generatePlan({ ...employee, goal, problem: 'no_savings' }, NOW)
      expect(plan.savingsCents).toBeLessThanOrEqual(plan.marginCents / 2 + 1)
    }
  })

  it('objectif « projet » : cible sur 12 mois', () => {
    const plan = generatePlan({ ...employee, goal: 'project', problem: 'no_tracking' }, NOW)
    expect(plan.savingsGoal.kind).toBe('project')
    expect(plan.savingsGoal.targetCents).toBe(plan.savingsCents * 12)
    expect(plan.savingsGoal.months).toBe(12)
    expect(plan.savingsGoal.targetDate).toBe('2027-10-11')
  })

  it('plus de personnes à charge = plus de budget courses', () => {
    const alone = generatePlan({ ...employee, dependents: 0 }, NOW)
    const family = generatePlan({ ...employee, dependents: 4 }, NOW)
    expect(family.budgets.groceries!).toBeGreaterThan(alone.budgets.groceries!)
    expect(family.rules.map((r) => r.id)).toContain('dependents_buffer')
    expect(alone.rules.map((r) => r.id)).not.toContain('dependents_buffer')
  })

  it('revenu variable : plus de matelas que le même profil à revenu régulier', () => {
    const regular = generatePlan({ ...employee, goal: 'save', problem: 'no_tracking' }, NOW)
    const variable = generatePlan(
      { ...employee, incomeKind: 'variable', incomeCents: Math.round(MAD(8000) / 0.7), goal: 'save', problem: 'no_tracking' },
      NOW,
    )
    expect(variable.planningIncomeCents).toBeCloseTo(MAD(8000), -2)
    expect(variable.savingsGoal.targetCents).toBeGreaterThan(regular.savingsGoal.targetCents)
  })

  it('sans dette : pas de plan de dette', () => {
    expect(generatePlan(employee, NOW).debt).toBeNull()
  })
})

describe('dates', () => {
  it('shiftMonths borne le jour à la fin du mois', () => {
    expect(shiftMonths('2026-01-31', 1)).toBe('2026-02-28')
    expect(shiftMonths('2026-10-11', 3)).toBe('2027-01-11')
    expect(shiftMonths('2026-12-15', 1)).toBe('2027-01-15')
  })

  it('nextPayDate : mois courant ou suivant', () => {
    expect(nextPayDate(25, new Date(2026, 9, 11))).toBe('2026-10-25')
    expect(nextPayDate(25, new Date(2026, 9, 25))).toBe('2026-10-25')
    expect(nextPayDate(25, new Date(2026, 9, 26))).toBe('2026-11-25')
    expect(nextPayDate(31, new Date(2026, 1, 10))).toBe('2026-02-28')
    expect(nextPayDate(5, new Date(2026, 11, 20))).toBe('2027-01-05')
  })
})
