// Montants en centimes (entiers). Dates en 'YYYY-MM-DD', mois en 'YYYY-MM'.

export type Frequency = 'weekly' | 'monthly' | 'yearly'
export type DaretFrequency = 'weekly' | 'biweekly' | 'monthly'

export interface Category {
  id?: number
  /** Clé de catégorie prédéfinie (traduite via i18n). Absente pour une catégorie personnalisée. */
  key?: string
  /** Nom libre, pour les catégories personnalisées. */
  name?: string
  icon: string
  color: string
  order: number
}

export interface Expense {
  id?: number
  amountCents: number
  categoryId: number
  date: string
  note?: string
  recurringId?: number
  createdAt: number
}

/**
 * Budget d'une catégorie à partir d'un mois. Report automatique : le budget
 * effectif d'un mois est le dernier enregistrement dont `month` <= mois demandé.
 */
export interface Budget {
  id?: number
  categoryId: number
  month: string
  limitCents: number
}

export interface MonthlyIncome {
  month: string
  incomeCents: number
}

export interface Recurring {
  id?: number
  amountCents: number
  categoryId: number
  note?: string
  frequency: Frequency
  /** Jour du mois (1-31) pour mensuel/annuel ; ignoré pour hebdomadaire. */
  dayOfMonth: number
  startDate: string
  endDate?: string
  lastGeneratedOn?: string
  active: boolean
}

export interface Daret {
  id?: number
  name: string
  contributionCents: number
  frequency: DaretFrequency
  startDate: string
  status: 'active' | 'done'
}

export interface DaretMember {
  id?: number
  daretId: number
  name: string
  /** Rang de réception (1 = premier à recevoir). */
  turnOrder: number
  isMe: boolean
}

export interface DaretRound {
  id?: number
  daretId: number
  roundNo: number
  dueDate: string
  receiverMemberId: number
}

export interface DaretPayment {
  id?: number
  roundId: number
  memberId: number
  paid: boolean
  paidOn?: string
}

export interface Debt {
  id?: number
  direction: 'owed_to_me' | 'i_owe'
  person: string
  amountCents: number
  dueDate?: string
  reminderDate?: string
  note?: string
  status: 'open' | 'settled'
  createdAt: number
}

export interface DebtPayment {
  id?: number
  debtId: number
  amountCents: number
  date: string
}
