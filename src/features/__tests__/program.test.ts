import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../db/database'
import { resolveLimits } from '../../domain/budget'
import type { Profile } from '../../domain/plan'
import { setBudget } from '../budgets/actions'
import { setMonthlyIncome } from '../income/actions'
import {
  draftToProfile,
  EMPTY_DRAFT,
  profileToDraft,
  STEPS,
  stepError,
  type Draft,
} from '../onboarding/draft'
import { applyProgram, saveProgram, toggleWeekDay } from '../program/actions'

const NOW = new Date(2026, 9, 11, 12)
const MAD = (n: number) => n * 100

const profile: Profile = {
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

beforeEach(async () => {
  await db.budgets.clear()
  await db.monthlyIncomes.clear()
  await db.profile.clear()
  await db.program.clear()
})

describe('questionnaire (brouillon → profil)', () => {
  const full: Draft = {
    firstName: '  Samira ',
    situation: 'employee',
    income: '8000',
    incomeKind: 'regular',
    payDay: 25,
    rent: '2 500',
    credit: '',
    school: '',
    bills: '400,5',
    transport: '300',
    debtMonthly: '',
    debtTotal: '',
    daret: '500',
    dependents: 1,
    goal: 'save',
    problem: 'no_savings',
  }

  it('convertit les réponses en profil en centimes', () => {
    const p = draftToProfile(full)!
    expect(p.firstName).toBe('Samira')
    expect(p.incomeCents).toBe(800000)
    expect(p.charges.rentCents).toBe(250000)
    expect(p.charges.billsCents).toBe(40050)
    expect(p.charges.creditCents).toBe(0)
    expect(p.daretMonthlyCents).toBe(50000)
  })

  it('refuse un questionnaire incomplet ou invalide', () => {
    expect(draftToProfile(EMPTY_DRAFT)).toBeNull()
    expect(stepError('name', { ...full, firstName: '   ' })).toBe('name')
    expect(stepError('income', { ...full, income: '0' })).toBe('income')
    expect(stepError('income', { ...full, income: 'abc' })).toBe('income')
    expect(stepError('charges', { ...full, rent: '12x' })).toBe('amount')
    expect(stepError('goal', { ...full, goal: null })).toBe('choice')
    expect(draftToProfile({ ...full, payDay: null })).toBeNull()
  })

  it('les montants facultatifs vides valent 0 ; 10 questions', () => {
    expect(STEPS).toHaveLength(10)
    expect(stepError('debts', full)).toBeNull()
    expect(stepError('charges', { ...full, rent: '', bills: '', transport: '' })).toBeNull()
  })

  it('accepte les chiffres arabes-indiens', () => {
    const p = draftToProfile({ ...full, income: '٨٠٠٠', rent: '٢٥٠٠٫٥' })!
    expect(p.incomeCents).toBe(800000)
    expect(p.charges.rentCents).toBe(250050)
  })

  it('refait le chemin inverse pour « refaire le questionnaire »', () => {
    const d = profileToDraft(profile)
    expect(draftToProfile(d)).toEqual(profile)
  })
})

describe('programme enregistré', () => {
  it('stocke le profil et le programme', async () => {
    const plan = await saveProgram(profile, NOW)
    expect((await db.profile.get(1))?.profile.firstName).toBe('Samira')
    const program = (await db.program.get(1))!
    expect(program.plan).toEqual(plan)
    expect(program.weekDone).toEqual([])
    expect(program.appliedAt).toBeUndefined()
  })

  it('refaire le questionnaire remplace le programme et remet la semaine à zéro', async () => {
    await saveProgram(profile, NOW)
    await toggleWeekDay(2)
    await saveProgram({ ...profile, incomeCents: MAD(9000) }, NOW)
    const program = (await db.program.get(1))!
    expect(program.weekDone).toEqual([])
    expect(program.plan.planningIncomeCents).toBe(MAD(9000))
    expect(await db.profile.count()).toBe(1)
  })

  it('coche et décoche les jours de la première semaine', async () => {
    await saveProgram(profile, NOW)
    await toggleWeekDay(3)
    await toggleWeekDay(1)
    expect((await db.program.get(1))!.weekDone).toEqual([1, 3])
    await toggleWeekDay(3)
    expect((await db.program.get(1))!.weekDone).toEqual([1])
  })
})

describe('application du programme', () => {
  it('crée les budgets du mois, fixe le revenu et marque le programme appliqué', async () => {
    const plan = await saveProgram(profile, NOW)
    const created = await applyProgram(NOW)
    expect(created).toBe(Object.keys(plan.budgets).length)

    const limits = resolveLimits(await db.budgets.toArray(), '2026-10')
    const rent = (await db.categories.where('key').equals('rent').first())!.id!
    expect(limits.get(rent)).toBe(MAD(2500))

    expect((await db.monthlyIncomes.get('2026-10'))?.incomeCents).toBe(MAD(8000))
    expect((await db.program.get(1))?.appliedAt).toBe(NOW.getTime())
  })

  it('est idempotent : réappliquer ne duplique rien', async () => {
    await saveProgram(profile, NOW)
    await applyProgram(NOW)
    const before = await db.budgets.count()
    await applyProgram(NOW)
    expect(await db.budgets.count()).toBe(before)
  })

  it('remet à zéro un budget prédéfini que le programme ne prévoit pas', async () => {
    const education = (await db.categories.where('key').equals('education').first())!.id!
    await setBudget(education, '2026-09', MAD(900)) // budget hérité du mois précédent
    await saveProgram(profile, NOW) // pas de frais d'école dans le profil
    await applyProgram(NOW)
    const limits = resolveLimits(await db.budgets.toArray(), '2026-10')
    expect(limits.has(education)).toBe(false)
    // le mois précédent reste intact
    expect(resolveLimits(await db.budgets.toArray(), '2026-09').get(education)).toBe(MAD(900))
  })

  it('remplace un revenu déjà saisi par celui du questionnaire', async () => {
    await setMonthlyIncome('2026-10', MAD(5000))
    await saveProgram(profile, NOW)
    await applyProgram(NOW)
    expect((await db.monthlyIncomes.get('2026-10'))?.incomeCents).toBe(MAD(8000))
  })

  it('ne fait rien sans programme', async () => {
    expect(await applyProgram(NOW)).toBe(0)
    expect(await db.budgets.count()).toBe(0)
  })
})
