import { centsToInput, parseMAD } from '../../domain/money'
import type { Goal, IncomeKind, Problem, Profile, Situation } from '../../domain/plan'

/** Réponses en cours de saisie : les montants restent du texte jusqu'à la validation. */
export interface Draft {
  firstName: string
  situation: Situation | null
  income: string
  incomeKind: IncomeKind | null
  payDay: number | null
  rent: string
  credit: string
  school: string
  bills: string
  transport: string
  debtMonthly: string
  debtTotal: string
  daret: string
  dependents: number | null
  goal: Goal | null
  problem: Problem | null
}

export const STEPS = [
  'name',
  'situation',
  'income',
  'incomeKind',
  'payDay',
  'charges',
  'debts',
  'dependents',
  'goal',
  'problem',
] as const

export type StepId = (typeof STEPS)[number]

export const EMPTY_DRAFT: Draft = {
  firstName: '',
  situation: null,
  income: '',
  incomeKind: null,
  payDay: null,
  rent: '',
  credit: '',
  school: '',
  bills: '',
  transport: '',
  debtMonthly: '',
  debtTotal: '',
  daret: '',
  dependents: null,
  goal: null,
  problem: null,
}

/** Montant optionnel : vide = 0, invalide = NaN. */
function optionalCents(text: string): number {
  return text.trim() === '' ? 0 : parseMAD(text)
}

export type StepError = 'name' | 'income' | 'amount' | 'choice' | null

/** Validation d'une étape ; `null` si elle est complète. */
export function stepError(step: StepId, d: Draft): StepError {
  switch (step) {
    case 'name':
      return d.firstName.trim().length === 0 ? 'name' : null
    case 'situation':
      return d.situation === null ? 'choice' : null
    case 'income': {
      const cents = parseMAD(d.income)
      return Number.isFinite(cents) && cents > 0 ? null : 'income'
    }
    case 'incomeKind':
      return d.incomeKind === null ? 'choice' : null
    case 'payDay':
      return d.payDay === null ? 'choice' : null
    case 'charges':
      return [d.rent, d.credit, d.school, d.bills, d.transport].some((t) =>
        Number.isNaN(optionalCents(t)),
      )
        ? 'amount'
        : null
    case 'debts':
      return [d.debtMonthly, d.debtTotal, d.daret].some((t) => Number.isNaN(optionalCents(t)))
        ? 'amount'
        : null
    case 'dependents':
      return d.dependents === null ? 'choice' : null
    case 'goal':
      return d.goal === null ? 'choice' : null
    case 'problem':
      return d.problem === null ? 'choice' : null
  }
}

/** Convertit les réponses en profil ; `null` si une étape est incomplète. */
export function draftToProfile(d: Draft): Profile | null {
  if (STEPS.some((s) => stepError(s, d) !== null)) return null
  return {
    firstName: d.firstName.trim(),
    situation: d.situation!,
    incomeCents: parseMAD(d.income),
    incomeKind: d.incomeKind!,
    payDay: d.payDay!,
    charges: {
      rentCents: optionalCents(d.rent),
      creditCents: optionalCents(d.credit),
      schoolCents: optionalCents(d.school),
      billsCents: optionalCents(d.bills),
      transportCents: optionalCents(d.transport),
    },
    debtMonthlyCents: optionalCents(d.debtMonthly),
    debtTotalCents: optionalCents(d.debtTotal),
    daretMonthlyCents: optionalCents(d.daret),
    dependents: d.dependents!,
    goal: d.goal!,
    problem: d.problem!,
  }
}

const money = (cents: number) => (cents > 0 ? centsToInput(cents) : '')

/** Pré-remplit le questionnaire avec un profil existant (« refaire le questionnaire »). */
export function profileToDraft(p: Profile): Draft {
  return {
    firstName: p.firstName,
    situation: p.situation,
    income: money(p.incomeCents),
    incomeKind: p.incomeKind,
    payDay: p.payDay,
    rent: money(p.charges.rentCents),
    credit: money(p.charges.creditCents),
    school: money(p.charges.schoolCents),
    bills: money(p.charges.billsCents),
    transport: money(p.charges.transportCents),
    debtMonthly: money(p.debtMonthlyCents),
    debtTotal: money(p.debtTotalCents),
    daret: money(p.daretMonthlyCents),
    dependents: p.dependents,
    goal: p.goal,
    problem: p.problem,
  }
}
