import Dexie, { type EntityTable, type Transaction } from 'dexie'
import { generatePlan } from '../domain/plan'
import { DEFAULT_CATEGORIES } from './seed'
import type {
  Budget,
  Category,
  Daret,
  DaretMember,
  DaretPayment,
  DaretRound,
  Debt,
  DebtPayment,
  Expense,
  MonthlyIncome,
  Recurring,
  StoredProfile,
  StoredProgram,
} from './types'

/** Schémas versionnés (exportés pour tester les migrations). */
export const SCHEMA_V1 = {
  categories: '++id, key, order',
  expenses: '++id, date, categoryId, recurringId, [recurringId+date]',
  budgets: '++id, &[categoryId+month], month',
  monthlyIncomes: 'month',
  recurrings: '++id, active',
  darets: '++id, status',
  daretMembers: '++id, daretId',
  daretRounds: '++id, daretId, [daretId+roundNo]',
  daretPayments: '++id, roundId, [roundId+memberId]',
  debts: '++id, direction, status, dueDate',
  debtPayments: '++id, debtId',
}

/** v2 : profil d'onboarding et programme personnalisé. */
export const SCHEMA_V2 = {
  profile: 'id',
  program: 'id',
}

/** Recalcule le programme enregistré avec le moteur actuel (progression conservée). */
async function regenerateProgram(tx: Transaction): Promise<void> {
  const stored = await tx.table('profile').get(1)
  const program = await tx.table('program').get(1)
  if (!stored || !program) return
  const plan = generatePlan(stored.profile, new Date(program.generatedAt))
  await tx.table('program').put({ ...program, plan })
}

export class BudgetDB extends Dexie {
  categories!: EntityTable<Category, 'id'>
  expenses!: EntityTable<Expense, 'id'>
  budgets!: EntityTable<Budget, 'id'>
  monthlyIncomes!: EntityTable<MonthlyIncome, 'month'>
  recurrings!: EntityTable<Recurring, 'id'>
  darets!: EntityTable<Daret, 'id'>
  daretMembers!: EntityTable<DaretMember, 'id'>
  daretRounds!: EntityTable<DaretRound, 'id'>
  daretPayments!: EntityTable<DaretPayment, 'id'>
  debts!: EntityTable<Debt, 'id'>
  debtPayments!: EntityTable<DebtPayment, 'id'>
  profile!: EntityTable<StoredProfile, 'id'>
  program!: EntityTable<StoredProgram, 'id'>

  constructor(name = 'budget-maroc') {
    super(name)

    this.version(1).stores(SCHEMA_V1)
    this.version(2).stores(SCHEMA_V2)

    // v3 : le moteur de programme a changé (statut, déficit, conseils). On régénère le
    // programme enregistré à partir du profil, en gardant la progression et l'application.
    this.version(3)
      .stores({})
      .upgrade((tx) => regenerateProgram(tx))

    // v4 : catégorie « Crédit » (les mensualités n'étaient plus noyées dans « Autres »)
    // et nouvelle répartition des budgets.
    this.version(4)
      .stores({})
      .upgrade(async (tx) => {
        const categories = tx.table('categories')
        if (!(await categories.where('key').equals('credit').first())) {
          const all = await categories.toArray()
          const order = all.reduce((max, c) => Math.max(max, c.order ?? 0), 0) + 1
          await categories.add({ key: 'credit', icon: 'credit', color: '#6b7cc9', order })
        }
        await regenerateProgram(tx)
      })
    this.on('populate', (tx) => {
      tx.table('categories').bulkAdd(DEFAULT_CATEGORIES)
    })
  }
}

export const db = new BudgetDB()
