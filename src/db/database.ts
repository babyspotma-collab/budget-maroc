import Dexie, { type EntityTable } from 'dexie'
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
} from './types'

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

  constructor(name = 'budget-maroc') {
    super(name)

    this.version(1).stores({
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
    })

    this.on('populate', (tx) => {
      tx.table('categories').bulkAdd(DEFAULT_CATEGORIES)
    })
  }
}

export const db = new BudgetDB()
