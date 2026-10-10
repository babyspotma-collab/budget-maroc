import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePrefs } from '../../app/prefs'
import { useQuickAdd } from '../../app/quickAdd'
import { Button, Card, EmptyState, PageHeader } from '../../components/ui'
import type { Expense } from '../../db/types'
import {
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
import { MonthSwitcher } from './MonthSwitcher'

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
      <PageHeader
        title={t('expenses.title')}
        subtitle={
          expenses !== undefined && expenses.length > 0
            ? `${t('expenses.monthTotal')} : ${money(totalCents(expenses))}`
            : undefined
        }
      />
      <MonthSwitcher month={month} onChange={setMonth} />

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

      <div className="space-y-5">
        {groups.map((g) => (
          <section key={g.date}>
            <div className="mb-1.5 flex items-baseline justify-between px-1">
              <h2 className="text-sm font-bold first-letter:uppercase">{dayLabel(g.date)}</h2>
              <span className="text-sm font-semibold tabular-nums text-muted">
                {money(g.totalCents)}
              </span>
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
