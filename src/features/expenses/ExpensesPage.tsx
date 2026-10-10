import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePrefs } from '../../app/prefs'
import { useQuickAdd } from '../../app/quickAdd'
import { Button, Card, EmptyState, PageHeader } from '../../components/ui'
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/ui/icons'
import type { Expense } from '../../db/types'
import {
  addMonths,
  currentMonth,
  formatDayLong,
  formatMonthLabel,
  relativeDay,
  todayISO,
} from '../../domain/dates'
import { groupByDay, totalCents } from '../../domain/expenses'
import { useCategoryMap } from '../categories/hooks'
import { ExpenseRow } from './ExpenseRow'
import { ExpenseSheet } from './ExpenseSheet'
import { useMonthExpenses } from './hooks'

export function ExpensesPage() {
  const { t } = useTranslation()
  const { money, locale } = usePrefs()
  const { openAdd } = useQuickAdd()
  const categories = useCategoryMap()

  const [month, setMonth] = useState(currentMonth())
  const [editing, setEditing] = useState<Expense | undefined>()
  const expenses = useMonthExpenses(month)

  const groups = useMemo(() => groupByDay(expenses ?? []), [expenses])
  const monthLabel = formatMonthLabel(month, locale)
  const today = todayISO()
  const isCurrent = month === currentMonth()

  function dayLabel(date: string) {
    const rel = relativeDay(date, today)
    return rel ? t(`expenses.${rel}`) : formatDayLong(date, locale)
  }

  return (
    <>
      <PageHeader title={t('expenses.title')} />

      <div className="mb-4 flex items-center justify-between rounded-2xl border border-sand bg-surface p-1.5">
        <button
          type="button"
          aria-label={t('expenses.prev')}
          onClick={() => setMonth((m) => addMonths(m, -1))}
          className="flex size-11 items-center justify-center rounded-xl text-muted hover:bg-sand/50"
        >
          <ChevronLeftIcon className="rtl-flip" />
        </button>
        <div className="text-center">
          <p className="font-display text-lg font-semibold first-letter:uppercase">{monthLabel}</p>
          {expenses !== undefined && expenses.length > 0 && (
            <p className="text-sm tabular-nums text-muted">
              {t('expenses.monthTotal')} : {money(totalCents(expenses))}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label={t('expenses.next')}
          disabled={isCurrent}
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="flex size-11 items-center justify-center rounded-xl text-muted hover:bg-sand/50 disabled:opacity-30"
        >
          <ChevronRightIcon className="rtl-flip" />
        </button>
      </div>

      {expenses !== undefined && groups.length === 0 && (
        <EmptyState
          title={t('expenses.emptyTitle', { month: monthLabel })}
          body={t('expenses.emptyBody')}
        >
          {isCurrent && (
            <Button size="lg" block onClick={openAdd}>
              {t('home.emptyCta')}
            </Button>
          )}
        </EmptyState>
      )}

      <div className="space-y-4">
        {groups.map((g) => (
          <section key={g.date}>
            <div className="mb-1 flex items-baseline justify-between px-1">
              <h2 className="text-sm font-semibold text-muted first-letter:uppercase">{dayLabel(g.date)}</h2>
              <span className="text-sm tabular-nums text-muted">{money(g.totalCents)}</span>
            </div>
            <Card className="p-1.5">
              <ul>
                {g.items.map((e) => (
                  <li key={e.id}>
                    <ExpenseRow
                      expense={e}
                      category={categories.get(e.categoryId)}
                      onClick={() => setEditing(e)}
                    />
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        ))}
      </div>

      <ExpenseSheet open={editing !== undefined} onClose={() => setEditing(undefined)} expense={editing} />
    </>
  )
}
