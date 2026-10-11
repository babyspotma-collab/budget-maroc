/**
 * Moteur de règles du programme personnalisé.
 * Pur : aucune dépendance à React, à Dexie ni à la langue. Il renvoie des identifiants et
 * des paramètres (montants en centimes) ; l'interface les traduit.
 */
import { addMonths, todayISO } from './dates'
import { daysInMonth } from './stats'

export type Situation = 'employee' | 'self_employed' | 'merchant' | 'student' | 'unemployed'
export type IncomeKind = 'regular' | 'variable'
export type Goal = 'finish_month' | 'save' | 'repay_debt' | 'project' | 'understand'
export type Problem = 'impulsive' | 'month_end' | 'no_savings' | 'no_tracking'

export interface FixedCharges {
  rentCents: number
  creditCents: number
  schoolCents: number
  billsCents: number
  transportCents: number
}

export interface Profile {
  firstName: string
  situation: Situation
  incomeCents: number
  incomeKind: IncomeKind
  /** Jour de paie, 1 à 31. */
  payDay: number
  charges: FixedCharges
  /** Remboursements mensuels de dettes / crédits à rembourser. */
  debtMonthlyCents: number
  /** Reste dû au total (0 si inconnu). */
  debtTotalCents: number
  daretMonthlyCents: number
  dependents: number
  goal: Goal
  problem: Problem
}

export type RuleId =
  | 'deficit'
  | 'daily_cap'
  | 'variable_floor'
  | 'weekly_envelope'
  | 'debt_first'
  | 'debt_minimum'
  | 'fixed_charges_high'
  | 'impulse_24h'
  | 'month_end_half'
  | 'no_savings_auto'
  | 'pay_day_savings'
  | 'daret_keep'
  | 'savings_goal'
  | 'dependents_buffer'
  | 'student_cap'
  | 'track_daily'
  | 'weekly_review'

export type ActionId =
  | 'apply_budgets'
  | 'log_all'
  | 'weekly_envelope'
  | 'no_spend_day'
  | 'check_bills'
  | 'debt_plan'
  | 'first_transfer'
  | 'compare_prices'
  | 'mid_check'
  | 'family_talk'
  | 'student_meals'
  | 'plan_weekend'
  | 'weekly_review'

/** Paramètres : les clés finissant par « Cents » sont des montants à formater en MAD. */
export type Params = Record<string, number>

export interface PlanRule {
  id: RuleId
  params: Params
}

export interface PlanAction {
  day: number
  id: ActionId
  params: Params
}

export interface SavingsGoal {
  monthlyCents: number
  targetCents: number
  /** Nombre de mois pour atteindre la cible, `null` si on ne met rien de côté. */
  months: number | null
  /** 'YYYY-MM-DD', `null` si `months` est `null`. */
  targetDate: string | null
  kind: 'emergency' | 'project' | 'buffer'
}

export interface DebtPlan {
  monthlyCents: number
  extraCents: number
  totalCents: number
  months: number | null
  payoffDate: string | null
}

export interface Plan {
  /** Revenu retenu pour planifier (70 % du revenu moyen s'il est variable). */
  planningIncomeCents: number
  fixedCents: number
  obligationsCents: number
  /** Revenu de planification − charges fixes − obligations (négatif = déficit). */
  marginCents: number
  fixedRatio: number
  savingsCents: number
  /** Enveloppe des dépenses variables du mois. */
  spendableCents: number
  dailyCents: number
  weeklyCents: number
  /** Budget mensuel par clé de catégorie prédéfinie (montants > 0 uniquement). */
  budgets: Record<string, number>
  savingsGoal: SavingsGoal
  debt: DebtPlan | null
  rules: PlanRule[]
  week1: PlanAction[]
}

export const VARIABLE_INCOME_FACTOR = 0.7
const ROUND_TO = 1000 // 10 MAD

const roundTo = (cents: number, step: number = ROUND_TO) => Math.round(cents / step) * step
const floorTo = (cents: number, step: number) => Math.floor(cents / step) * step
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

const SAVE_RATE: Record<Goal, number> = {
  save: 0.15,
  project: 0.12,
  repay_debt: 0.05,
  finish_month: 0.03,
  understand: 0.05,
}

/** Poids de répartition des dépenses variables (hors charges fixes). */
function variableWeights(p: Profile): Record<string, number> {
  const w: Record<string, number> = {
    groceries: 40,
    transport: 8,
    outings: 15,
    health: 8,
    clothing: 7,
    family: 10,
    other: 12,
  }
  if (p.situation === 'student') {
    Object.assign(w, { groceries: 38, transport: 12, outings: 22, clothing: 5, family: 4, other: 12 })
  }
  if (p.situation === 'self_employed' || p.situation === 'merchant') w.other += 4
  if (p.situation === 'unemployed') w.outings *= 0.6

  const d = clamp(p.dependents, 0, 8)
  w.groceries += 8 * d
  w.health += 3 * d
  w.family += 4 * d
  w.outings = Math.max(5, w.outings - 1.5 * d)
  return w
}

export function generatePlan(profile: Profile, now: Date = new Date()): Plan {
  const p = profile
  const variable = p.incomeKind === 'variable'
  const c = p.charges

  const planningIncomeCents = variable
    ? roundTo(p.incomeCents * VARIABLE_INCOME_FACTOR, 100)
    : p.incomeCents
  const fixedCents = c.rentCents + c.creditCents + c.schoolCents + c.billsCents + c.transportCents
  const obligationsCents = p.debtMonthlyCents + p.daretMonthlyCents
  const marginCents = planningIncomeCents - fixedCents - obligationsCents
  const fixedRatio =
    planningIncomeCents > 0 ? (fixedCents + obligationsCents) / planningIncomeCents : 1

  // --- Épargne mensuelle -------------------------------------------------
  let rate = SAVE_RATE[p.goal]
  if (variable) rate += 0.03 // matelas pour les mois creux
  if (p.dependents >= 3) rate -= 0.03
  else if (p.dependents >= 1) rate -= 0.01
  if (p.problem === 'no_savings') rate += 0.02
  if (p.situation === 'student') rate = Math.min(rate, 0.05)
  if (fixedRatio > 0.85) rate = 0
  else if (fixedRatio > 0.7) rate = Math.min(rate, 0.03)
  rate = Math.max(0, rate)

  let savingsCents =
    marginCents > 0
      ? Math.min(roundTo(planningIncomeCents * rate), floorTo(marginCents * 0.5, ROUND_TO))
      : 0

  // --- Dette : on y met un quart du reste si c'est l'objectif ----------------
  let extraDebtCents = 0
  if (p.goal === 'repay_debt' && (p.debtTotalCents > 0 || p.debtMonthlyCents > 0)) {
    const room = Math.max(0, marginCents - savingsCents)
    extraDebtCents = floorTo(room * 0.25, ROUND_TO)
  }

  // --- Dépenses variables par catégorie ---------------------------------------
  const pool = Math.max(0, marginCents - savingsCents - extraDebtCents)
  const weights = variableWeights(p)
  const totalWeight = Object.values(weights).reduce((s, v) => s + v, 0)
  const raw: Record<string, number> = {}
  for (const [key, weight] of Object.entries(weights)) raw[key] = (pool * weight) / totalWeight

  // Impulsif : on plafonne les catégories « tentation », l'écart part en épargne.
  let redirectedCents = 0
  if (p.problem === 'impulsive') {
    for (const key of ['outings', 'clothing', 'other']) {
      const cut = raw[key] * 0.4
      raw[key] -= cut
      redirectedCents += cut
    }
    savingsCents += roundTo(redirectedCents)
  }

  // Arrondi à 10 MAD ; le reliquat est absorbé par les courses (jamais négatif).
  const rounded: Record<string, number> = {}
  for (const [key, v] of Object.entries(raw)) rounded[key] = Math.max(0, roundTo(v))
  const roundedSum = Object.values(rounded).reduce((s, v) => s + v, 0)
  rounded.groceries = Math.max(0, rounded.groceries + roundTo(pool - redirectedCents) - roundedSum)

  const spendableCents = Object.values(rounded).reduce((s, v) => s + v, 0)

  // Charges fixes rattachées aux catégories.
  const budgets: Record<string, number> = {}
  const add = (key: string, cents: number) => {
    if (cents > 0) budgets[key] = (budgets[key] ?? 0) + cents
  }
  add('rent', c.rentCents)
  add('education', c.schoolCents)
  const utilities = Math.round(c.billsCents * 0.65)
  add('utilities', utilities)
  add('phone', c.billsCents - utilities)
  add('transport', c.transportCents)
  add('other', c.creditCents)
  for (const [key, v] of Object.entries(rounded)) add(key, v)

  // --- Budget journalier -------------------------------------------------------
  const days = daysInMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  const dailyCents = floorTo(spendableCents / days, 100)
  const weeklyCents = floorTo(spendableCents / (days / 7), 100)

  // --- Objectif d'épargne --------------------------------------------------------
  const essentialCents = fixedCents + obligationsCents
  let targetCents: number
  let kind: SavingsGoal['kind']
  if (p.goal === 'project') {
    kind = 'project'
    targetCents = savingsCents * 12
  } else if (p.goal === 'save' || p.problem === 'no_savings') {
    kind = 'emergency'
    targetCents = essentialCents * (variable ? 4 : 3)
  } else {
    kind = 'buffer'
    targetCents = essentialCents
  }
  const months =
    savingsCents > 0 && targetCents > 0 ? Math.ceil(targetCents / savingsCents) : null
  const today = todayISO(now)
  const savingsGoal: SavingsGoal = {
    monthlyCents: savingsCents,
    targetCents,
    months,
    targetDate: months === null ? null : shiftMonths(today, months),
    kind,
  }

  // --- Dette --------------------------------------------------------------------------
  let debt: DebtPlan | null = null
  if (p.debtMonthlyCents > 0 || p.debtTotalCents > 0) {
    const monthly = p.debtMonthlyCents + extraDebtCents
    const payoffMonths =
      p.debtTotalCents > 0 && monthly > 0 ? Math.ceil(p.debtTotalCents / monthly) : null
    debt = {
      monthlyCents: monthly,
      extraCents: extraDebtCents,
      totalCents: p.debtTotalCents,
      months: payoffMonths,
      payoffDate: payoffMonths === null ? null : shiftMonths(today, payoffMonths),
    }
  }

  const base = {
    planningIncomeCents,
    fixedCents,
    obligationsCents,
    marginCents,
    fixedRatio,
    savingsCents,
    spendableCents,
    dailyCents,
    weeklyCents,
    budgets,
    savingsGoal,
    debt,
  }

  return { ...base, rules: selectRules(p, base), week1: weekOne(p, base) }
}

/** Ajoute des mois à une date ISO en gardant le jour (borné à la fin du mois). */
export function shiftMonths(iso: string, months: number): string {
  const month = addMonths(iso.slice(0, 7), months)
  const day = Math.min(Number(iso.slice(8, 10)), daysInMonth(month))
  return `${month}-${String(day).padStart(2, '0')}`
}

type Base = Omit<Plan, 'rules' | 'week1'>

interface Candidate {
  rule: PlanRule
  priority: number
}

/** Choisit 3 à 5 règles selon le profil : les priorités changent avec les réponses. */
function selectRules(p: Profile, b: Base): PlanRule[] {
  const variable = p.incomeKind === 'variable'
  const out: Candidate[] = []
  const push = (id: RuleId, priority: number, params: Params = {}) =>
    out.push({ rule: { id, params }, priority })

  if (b.marginCents <= 0) {
    push('deficit', 100, { gapCents: -b.marginCents, fixedPct: Math.round(b.fixedRatio * 100) })
  }

  push('daily_cap', 90, { dailyCents: b.dailyCents })

  if (variable) {
    push('variable_floor', 80, {
      planningCents: b.planningIncomeCents,
      percent: Math.round(VARIABLE_INCOME_FACTOR * 100),
    })
    push('weekly_envelope', 70, { weeklyCents: b.weeklyCents })
  }

  if (b.debt && p.goal === 'repay_debt') {
    push('debt_first', 85, { extraCents: b.debt.extraCents, monthlyCents: b.debt.monthlyCents })
  } else if (p.debtMonthlyCents > 0) {
    push('debt_minimum', 65, { monthlyCents: p.debtMonthlyCents })
  }

  if (b.fixedRatio > 0.6 && b.marginCents > 0) {
    push('fixed_charges_high', 75, { fixedPct: Math.round(b.fixedRatio * 100) })
  }

  if (p.problem === 'impulsive') {
    const threshold = Math.max(10000, roundTo(p.incomeCents * 0.02, 1000))
    push('impulse_24h', 72, { thresholdCents: threshold })
  }

  if (p.problem === 'month_end') {
    const midDay = ((p.payDay - 1 + 15) % 30) + 1
    push('month_end_half', 71, { halfCents: Math.floor(b.spendableCents / 2 / 100) * 100, day: midDay })
  }

  if (p.problem === 'no_savings' && b.savingsCents > 0) {
    push('no_savings_auto', 70, { savingsCents: b.savingsCents, day: p.payDay })
  } else if (b.savingsCents > 0 && !variable) {
    push('pay_day_savings', 60, { savingsCents: b.savingsCents, day: p.payDay })
  }

  if (b.savingsGoal.months !== null && b.savingsGoal.months <= 60) {
    push('savings_goal', 45, {
      targetCents: b.savingsGoal.targetCents,
      monthlyCents: b.savingsGoal.monthlyCents,
      months: b.savingsGoal.months,
    })
  }

  if (p.daretMonthlyCents > 0) {
    push('daret_keep', 40, { monthlyCents: p.daretMonthlyCents })
  }

  if (p.dependents >= 2) {
    const buffer = (b.budgets.health ?? 0) + (b.budgets.family ?? 0)
    push('dependents_buffer', 55, { bufferCents: buffer, count: p.dependents })
  }

  if (p.situation === 'student') {
    push('student_cap', 58, { weeklyOutingsCents: floorTo((b.budgets.outings ?? 0) / 4, 100) })
  }

  if (p.problem === 'no_tracking' || p.goal === 'understand') {
    push('track_daily', 50)
  }

  // Valeurs de repli : on garantit au moins 3 règles.
  push('track_daily', 20)
  push('weekly_review', 10)

  const seen = new Set<RuleId>()
  return out
    .sort((x, y) => y.priority - x.priority)
    .filter((c) => (seen.has(c.rule.id) ? false : (seen.add(c.rule.id), true)))
    .slice(0, 5)
    .map((c) => c.rule)
}

function weekOne(p: Profile, b: Base): PlanAction[] {
  const variable = p.incomeKind === 'variable'
  const act = (day: number, id: ActionId, params: Params = {}): PlanAction => ({ day, id, params })

  let day3: PlanAction
  if (variable) day3 = act(3, 'weekly_envelope', { weeklyCents: b.weeklyCents })
  else if (p.problem === 'impulsive') day3 = act(3, 'no_spend_day')
  else day3 = act(3, 'check_bills', { billsCents: p.charges.billsCents })

  let day4: PlanAction
  if (p.debtMonthlyCents > 0 || p.debtTotalCents > 0) {
    day4 = act(4, 'debt_plan', { monthlyCents: b.debt?.monthlyCents ?? p.debtMonthlyCents })
  } else if (b.savingsCents > 0 && (p.problem === 'no_savings' || p.goal === 'save')) {
    day4 = act(4, 'first_transfer', { savingsCents: b.savingsCents })
  } else {
    day4 = act(4, 'compare_prices', { groceriesCents: b.budgets.groceries ?? 0 })
  }

  let day6: PlanAction
  if (p.dependents > 0) day6 = act(6, 'family_talk', { count: p.dependents })
  else if (p.situation === 'student') day6 = act(6, 'student_meals', { groceriesCents: b.budgets.groceries ?? 0 })
  else day6 = act(6, 'plan_weekend', { outingsCents: b.budgets.outings ?? 0 })

  return [
    act(1, 'apply_budgets'),
    act(2, 'log_all'),
    day3,
    day4,
    act(5, 'mid_check', { dailyCents: b.dailyCents }),
    day6,
    act(7, 'weekly_review'),
  ]
}

/** Prochain jour de paie (ISO) à partir de `now`, jour borné à la longueur du mois. */
export function nextPayDate(payDay: number, now: Date = new Date()): string {
  const month0 = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisMonthDay = Math.min(payDay, daysInMonth(month0))
  if (now.getDate() <= thisMonthDay) return `${month0}-${String(thisMonthDay).padStart(2, '0')}`
  const next = addMonths(month0, 1)
  return `${next}-${String(Math.min(payDay, daysInMonth(next))).padStart(2, '0')}`
}
