import { centsToInput, parseMAD } from '../../domain/money'
import type { Goal, IncomeKind, Problem, Profile, Situation } from '../../domain/plan'

/** Réponses en cours de saisie : les montants restent du texte jusqu'à la validation. */
export interface Draft {
  firstName: string
  goal: Goal | null
  situation: Situation | null
  income: string
  incomeKind: IncomeKind | null
  payDay: number | null
  rent: string
  credit: string
  school: string
  bills: string
  transport: string
  /** Oui / non : y a-t-il des dettes ou un daret ? `null` tant qu'on n'a pas répondu. */
  hasDebts: boolean | null
  debtMonthly: string
  debtTotal: string
  daret: string
  dependents: number | null
  problem: Problem | null
}

/** Ordre des écrans : une question par écran, puis le récapitulatif modifiable. */
export const STEP_ORDER = [
  'name',
  'goal',
  'situation',
  'income',
  'incomeKind',
  'payDay',
  'charges',
  'hasDebts',
  'debts',
  'dependents',
  'problem',
  'recap',
] as const

export type StepId = (typeof STEP_ORDER)[number]

/** Questions facultatives : le bouton « Passer » y est proposé. */
export const OPTIONAL_STEPS: readonly StepId[] = ['charges', 'hasDebts', 'debts', 'dependents', 'problem']

/** Les détails de dettes ne sont demandés que si la réponse est « oui ». */
export function visibleSteps(d: Draft): StepId[] {
  return STEP_ORDER.filter((s) => s !== 'debts' || d.hasDebts === true)
}

export const EMPTY_DRAFT: Draft = {
  firstName: '',
  goal: null,
  situation: null,
  income: '',
  incomeKind: null,
  payDay: null,
  rent: '',
  credit: '',
  school: '',
  bills: '',
  transport: '',
  hasDebts: null,
  debtMonthly: '',
  debtTotal: '',
  daret: '',
  dependents: null,
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
    case 'goal':
      return d.goal === null ? 'choice' : null
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
    case 'hasDebts':
      return d.hasDebts === null ? 'choice' : null
    case 'debts':
      return [d.debtMonthly, d.debtTotal, d.daret].some((t) => Number.isNaN(optionalCents(t)))
        ? 'amount'
        : null
    case 'dependents':
      return d.dependents === null ? 'choice' : null
    case 'problem':
      return d.problem === null ? 'choice' : null
    case 'recap':
      return null
  }
}

/**
 * Valeurs par défaut quand on touche « Passer » : on ne bloque jamais l'utilisateur sur
 * une question facultative.
 */
export function skipStep(step: StepId, d: Draft): Draft {
  switch (step) {
    case 'charges':
      return { ...d, rent: '', credit: '', school: '', bills: '', transport: '' }
    case 'hasDebts':
      return { ...d, hasDebts: false, debtMonthly: '', debtTotal: '', daret: '' }
    case 'debts':
      return { ...d, debtMonthly: '', debtTotal: '', daret: '' }
    case 'dependents':
      return { ...d, dependents: 0 }
    case 'problem':
      return { ...d, problem: 'no_tracking' }
    default:
      return d
  }
}

/** Convertit les réponses en profil ; `null` si une étape est incomplète. */
export function draftToProfile(d: Draft): Profile | null {
  if (visibleSteps(d).some((s) => stepError(s, d) !== null)) return null
  if (d.hasDebts === null) return null
  const hasDebts = d.hasDebts === true
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
    debtMonthlyCents: hasDebts ? optionalCents(d.debtMonthly) : 0,
    debtTotalCents: hasDebts ? optionalCents(d.debtTotal) : 0,
    daretMonthlyCents: hasDebts ? optionalCents(d.daret) : 0,
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
    goal: p.goal,
    situation: p.situation,
    income: money(p.incomeCents),
    incomeKind: p.incomeKind,
    payDay: p.payDay,
    rent: money(p.charges.rentCents),
    credit: money(p.charges.creditCents),
    school: money(p.charges.schoolCents),
    bills: money(p.charges.billsCents),
    transport: money(p.charges.transportCents),
    hasDebts: p.debtMonthlyCents > 0 || p.debtTotalCents > 0 || p.daretMonthlyCents > 0,
    debtMonthly: money(p.debtMonthlyCents),
    debtTotal: money(p.debtTotalCents),
    daret: money(p.daretMonthlyCents),
    dependents: p.dependents,
    problem: p.problem,
  }
}

// --- « Je ne sais pas exactement » : fourchettes ---------------------------------

export type AmountKey =
  | 'income'
  | 'rent'
  | 'credit'
  | 'school'
  | 'bills'
  | 'transport'
  | 'debtMonthly'
  | 'debtTotal'
  | 'daret'

/** Fourchette en MAD : `max = null` signifie « plus de `min` ». */
export interface Range {
  min: number
  max: number | null
}

export const AMOUNT_RANGES: Record<AmountKey, Range[]> = {
  income: [
    { min: 0, max: 3000 },
    { min: 3000, max: 5000 },
    { min: 5000, max: 8000 },
    { min: 8000, max: 12000 },
    { min: 12000, max: null },
  ],
  rent: [
    { min: 0, max: 1000 },
    { min: 1000, max: 2000 },
    { min: 2000, max: 3500 },
    { min: 3500, max: null },
  ],
  credit: [
    { min: 0, max: 500 },
    { min: 500, max: 1500 },
    { min: 1500, max: null },
  ],
  school: [
    { min: 0, max: 300 },
    { min: 300, max: 1000 },
    { min: 1000, max: null },
  ],
  bills: [
    { min: 0, max: 300 },
    { min: 300, max: 600 },
    { min: 600, max: null },
  ],
  transport: [
    { min: 0, max: 200 },
    { min: 200, max: 500 },
    { min: 500, max: null },
  ],
  debtMonthly: [
    { min: 0, max: 500 },
    { min: 500, max: 1500 },
    { min: 1500, max: null },
  ],
  debtTotal: [
    { min: 0, max: 5000 },
    { min: 5000, max: 20000 },
    { min: 20000, max: null },
  ],
  daret: [
    { min: 0, max: 300 },
    { min: 300, max: 1000 },
    { min: 1000, max: null },
  ],
}

/** Valeur retenue pour une fourchette (en MAD, arrondie à la dizaine). */
export function rangeValue(r: Range): number {
  const raw = r.max === null ? r.min * 1.3 : (r.min + r.max) / 2
  return Math.max(10, Math.round(raw / 10) * 10)
}

// --- Clavier numérique ----------------------------------------------------------------

export const MAX_AMOUNT_DIGITS = 9

/** Applique une touche du clavier numérique à la saisie courante. */
export function applyKey(current: string, key: string): string {
  if (key === 'back') return current.slice(0, -1)
  if (key === ',') {
    if (current.includes(',')) return current
    return current === '' ? '0,' : `${current},`
  }
  if (!/^\d$/.test(key)) return current
  const [whole, frac] = current.split(',')
  if (current.includes(',')) return frac.length >= 2 ? current : `${current}${key}`
  if (whole.length >= MAX_AMOUNT_DIGITS) return current
  // pas de zéros en tête : « 0 » puis « 5 » donne « 5 »
  return whole === '0' ? key : `${current}${key}`
}

/** « 12500,5 » → « 12 500,5 » pour l'affichage (la valeur saisie reste sans espaces). */
export function formatTyped(text: string): string {
  if (text === '') return ''
  const [whole, frac] = text.split(',')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return frac === undefined ? grouped : `${grouped},${frac}`
}
