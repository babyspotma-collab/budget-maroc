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
    expect(plan.rules[0].params.gapCents).toBe(Math.max(0, -plan.marginCents))
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

describe('charges supérieures au revenu : jamais de « 0 MAD » trompeur', () => {
  const overRent: Profile = {
    ...employee,
    incomeCents: MAD(3000),
    charges: { ...NO_CHARGES, rentCents: MAD(3500), billsCents: MAD(300) },
    daretMonthlyCents: MAD(400),
    dependents: 2,
  }
  const plan = generatePlan(overRent, NOW)

  it('passe en statut « deficit » avec les montants du manque', () => {
    expect(plan.status).toBe('deficit')
    expect(plan.deficit).not.toBeNull()
    const d = plan.deficit!
    expect(d.kind).toBe('fixed_over_income')
    expect(d.gapCents).toBe(MAD(3500 + 300 + 400 - 3000)) // 1 200 MAD au-dessus du revenu
    expect(d.neededCents).toBe(d.gapCents + 2000 * 31) // + minimum de vie : 20 MAD × 31 jours
    expect(d.averageDailyCents).toBe(0)
  })

  it('ne propose ni épargne ni dépense variable, et garde seulement les charges fixes', () => {
    expect(plan.savingsCents).toBe(0)
    expect(plan.spendableCents).toBe(0)
    expect(plan.savingsGoal.months).toBeNull()
    expect(plan.budgets.rent).toBe(MAD(3500))
    expect(Object.keys(plan.budgets).sort()).toEqual(['phone', 'rent', 'utilities'])
  })

  it('remplace le budget du jour par des règles et conseils adaptés', () => {
    const rules = plan.rules.map((r) => r.id)
    expect(rules[0]).toBe('deficit')
    expect(rules).toContain('essentials_first')
    expect(rules).not.toContain('daily_cap')
    expect(rules).not.toContain('daret_keep') // pas de « garde ton daret » quand on manque d'argent
    expect(rules.length).toBeGreaterThanOrEqual(3)

    const advice = plan.deficit!.advice
    expect(advice.length).toBeGreaterThanOrEqual(3)
    expect(advice.length).toBeLessThanOrEqual(4)
    const reduce = advice.find((a) => a.id === 'reduce_biggest')!
    expect(reduce.item).toBe('rent') // la charge la plus lourde
    expect(reduce.params.amountCents).toBe(MAD(3500))
    expect(advice.map((a) => a.id)).toContain('raise_income')
  })

  it('adapte les conseils aux charges réellement présentes', () => {
    const withCredit = generatePlan(
      { ...overRent, charges: { ...overRent.charges, creditCents: MAD(900) }, debtMonthlyCents: MAD(500) },
      NOW,
    ).deficit!.advice.map((a) => a.id)
    expect(withCredit).toContain('renegotiate_credit')

    const noExtras = generatePlan(
      { ...overRent, daretMonthlyCents: 0, charges: { ...NO_CHARGES, rentCents: MAD(4000) } },
      NOW,
    ).deficit!.advice.map((a) => a.id)
    expect(noExtras).not.toContain('renegotiate_credit')
    expect(noExtras).not.toContain('spread_debt')
    expect(noExtras).not.toContain('daret_review')
  })

  it('la première semaine devient un plan de redressement', () => {
    const ids = plan.week1.map((a) => a.id)
    expect(ids).toEqual([
      'apply_budgets',
      'log_all',
      'check_bills',
      'negotiate',
      'income_ideas',
      'essentials_list',
      'weekly_review',
    ])
  })

  it('cible la dette quand c\'est elle la plus lourde obligation', () => {
    const debtHeavy = generatePlan(
      {
        ...employee,
        incomeCents: MAD(4000),
        charges: { ...NO_CHARGES, rentCents: MAD(1500) },
        debtMonthlyCents: MAD(3000),
        daretMonthlyCents: 0,
        dependents: 0,
      },
      NOW,
    )
    expect(debtHeavy.status).toBe('deficit')
    expect(debtHeavy.deficit!.advice.find((a) => a.id === 'reduce_biggest')?.item).toBe('debt')
    expect(debtHeavy.deficit!.advice.map((a) => a.id)).toContain('spread_debt')
  })

  it('une marge presque nulle est aussi un déficit (moins que le minimum de vie)', () => {
    const almost = generatePlan(
      { ...employee, incomeCents: MAD(3000), charges: { ...NO_CHARGES, rentCents: MAD(2800) }, daretMonthlyCents: 0, dependents: 0 },
      NOW,
    )
    expect(almost.marginCents).toBe(MAD(200))
    expect(almost.status).toBe('deficit')
    expect(almost.deficit!.gapCents).toBe(0)
    expect(almost.deficit!.neededCents).toBe(2000 * 31 - MAD(200))
  })

  it('une marge pile à zéro est un déficit', () => {
    const zero = generatePlan(
      { ...employee, incomeCents: MAD(3000), charges: { ...NO_CHARGES, rentCents: MAD(3000) }, daretMonthlyCents: 0, dependents: 0 },
      NOW,
    )
    expect(zero.marginCents).toBe(0)
    expect(zero.status).toBe('deficit')
  })
})

describe('revenu variable : base prudente de 70 %', () => {
  const merchantShortfall: Profile = {
    ...merchant,
    incomeCents: MAD(5000),
    charges: { ...NO_CHARGES, rentCents: MAD(2500), billsCents: MAD(500), transportCents: MAD(600) },
    debtMonthlyCents: 0,
    debtTotalCents: 0,
    daretMonthlyCents: MAD(500),
    dependents: 0,
    goal: 'finish_month',
  }

  it('distingue « mois creux » d\'un vrai déficit (le revenu moyen couvre les charges)', () => {
    const plan = generatePlan(merchantShortfall, NOW)
    // 70 % de 5 000 = 3 500 < 4 100 de charges, alors que 5 000 les couvre largement
    expect(plan.planningIncomeCents).toBe(MAD(3500))
    expect(plan.status).toBe('deficit')
    const d = plan.deficit!
    expect(d.kind).toBe('variable_shortfall')
    expect(d.gapCents).toBe(MAD(600))
    expect(d.averageMarginCents).toBe(MAD(900))
    expect(d.averageDailyCents).toBe(MAD(29)) // 900 / 31 jours, arrondi au dirham
    expect(plan.rules[0].id).toBe('variable_shortfall')
    expect(d.advice[0].id).toBe('variable_buffer')
  })

  it('un revenu régulier avec les mêmes chiffres ne déclenche pas le déficit', () => {
    const plan = generatePlan({ ...merchantShortfall, incomeKind: 'regular' }, NOW)
    expect(plan.status).not.toBe('deficit')
    expect(plan.spendableCents).toBeGreaterThan(0)
  })
})

describe('cohérence budgets / revenu (balayage de 3 000+ profils)', () => {
  const profiles: Profile[] = []
  for (const kind of ['regular', 'variable'] as const)
    for (const income of [2500, 3000, 4500, 6000, 8000, 12000, 20000])
      for (const rent of [0, 1000, 2000, 3000, 5000])
        for (const bills of [0, 400])
          for (const daret of [0, 600])
            for (const dependents of [0, 2, 4])
              for (const problem of ['impulsive', 'no_tracking'] as const)
                for (const goal of ['save', 'repay_debt'] as const)
                  profiles.push({
                    ...employee,
                    incomeKind: kind,
                    incomeCents: MAD(income),
                    charges: { ...NO_CHARGES, rentCents: MAD(rent), billsCents: MAD(bills), transportCents: MAD(250) },
                    daretMonthlyCents: MAD(daret),
                    debtMonthlyCents: goal === 'repay_debt' ? MAD(400) : 0,
                    debtTotalCents: goal === 'repay_debt' ? MAD(9000) : 0,
                    dependents,
                    problem,
                    goal,
                  })

  it('le sweep couvre assez de cas', () => {
    expect(profiles.length).toBeGreaterThan(3000)
  })

  it('hors déficit : somme des budgets + épargne + obligations ≤ revenu, sans trou important', () => {
    let checked = 0
    for (const p of profiles) {
      const plan = generatePlan(p, NOW)
      if (plan.status === 'deficit') continue
      checked++
      const budgetsSum = Object.values(plan.budgets).reduce((s, v) => s + v, 0)
      const committed =
        budgetsSum + plan.savingsCents + plan.obligationsCents + (plan.debt?.extraCents ?? 0)
      expect(committed).toBeLessThanOrEqual(plan.planningIncomeCents)
      expect(committed).toBeLessThanOrEqual(p.incomeCents)
      expect(committed).toBeGreaterThan(plan.planningIncomeCents - 1000) // < 10 MAD d'écart d'arrondi
      expect(budgetsSum).toBe(plan.fixedCents + plan.spendableCents)
      for (const v of Object.values(plan.budgets)) expect(v).toBeGreaterThan(0)
      // « Autres » : jamais plus de ~10 % du budget variable (+ arrondi de 10 MAD)
      expect(plan.budgets.other ?? 0).toBeLessThanOrEqual(plan.spendableCents * 0.1 + 1000)
    }
    expect(checked).toBeGreaterThan(1000)
  })

  it('un budget du jour n\'est annoncé que s\'il vaut au moins le minimum de vie', () => {
    for (const p of profiles) {
      const plan = generatePlan(p, NOW)
      if (plan.status === 'deficit') {
        expect(plan.deficit).not.toBeNull()
        expect(plan.deficit!.advice.length).toBeGreaterThan(0)
        expect(plan.rules.map((r) => r.id)).not.toContain('daily_cap')
      } else {
        expect(plan.deficit).toBeNull()
        expect(plan.dailyCents).toBeGreaterThanOrEqual(2000) // ≥ 20 MAD par jour
        expect(plan.spendableCents).toBeGreaterThan(0)
      }
    }
  })

  it('déficit : aucune épargne, et les budgets ne dépassent jamais le revenu disponible', () => {
    let deficits = 0
    for (const p of profiles) {
      const plan = generatePlan(p, NOW)
      if (plan.status !== 'deficit') continue
      deficits++
      expect(plan.savingsCents).toBe(0)
      expect(plan.debt?.extraCents ?? 0).toBe(0)
      // ce qui reste après charges (s'il en reste) va aux dépenses variables, sans plus
      expect(plan.spendableCents).toBeLessThanOrEqual(Math.max(0, plan.marginCents))
      expect(plan.spendableCents).toBeLessThan(2000 * 31)
      const budgetsSum = Object.values(plan.budgets).reduce((s, v) => s + v, 0)
      expect(budgetsSum).toBe(plan.fixedCents + plan.spendableCents)
    }
    expect(deficits).toBeGreaterThan(300)
  })
})

describe('budget « Autres » et crédit', () => {
  const withCredit: Profile = {
    ...merchant,
    incomeKind: 'regular',
    incomeCents: MAD(10000),
    charges: { rentCents: MAD(2500), creditCents: MAD(1000), schoolCents: 0, billsCents: MAD(500), transportCents: MAD(600) },
    debtMonthlyCents: 0,
    debtTotalCents: 0,
    daretMonthlyCents: 0,
    dependents: 1,
    goal: 'save',
    problem: 'no_tracking',
  }

  it('range la mensualité de crédit dans sa propre catégorie, pas dans « Autres »', () => {
    const plan = generatePlan(withCredit, NOW)
    expect(plan.budgets.credit).toBe(MAD(1000))
    // « Autres » ne contient que sa part variable, nettement sous le crédit
    expect(plan.budgets.other).toBeLessThan(MAD(500))
  })

  it('« Autres » reste un fourre-tout : au plus ~10 % du budget variable', () => {
    for (const p of [withCredit, employee, merchant, student]) {
      const plan = generatePlan(p, NOW)
      if (plan.status === 'deficit' || plan.spendableCents === 0) continue
      const other = plan.budgets.other ?? 0
      expect(other).toBeLessThanOrEqual(plan.spendableCents * 0.1 + 1000)
    }
  })

  it('même pour un gros revenu, « Autres » reste modeste', () => {
    const plan = generatePlan({ ...withCredit, incomeCents: MAD(30000) }, NOW)
    expect(plan.budgets.other!).toBeLessThan(plan.budgets.groceries! / 2)
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
