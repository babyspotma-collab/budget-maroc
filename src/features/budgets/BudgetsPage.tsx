import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePrefs } from '../../app/prefs'
import { Card, PageHeader, ProgressBar } from '../../components/ui'
import type { Category } from '../../db/types'
import { alertsOf, summarize, type BudgetStatus } from '../../domain/budget'
import { currentMonth } from '../../domain/dates'
import { totalsByCategory } from '../../domain/expenses'
import { CategoryIcon } from '../categories/CategoryIcon'
import { useCategories, useCategoryLabel } from '../categories/hooks'
import { useMonthExpenses } from '../expenses/hooks'
import { MonthSwitcher } from '../expenses/MonthSwitcher'
import { BudgetSheet } from './BudgetSheet'
import { useBudgetStatuses, useMonthLimits } from './hooks'

const LEVEL_TEXT: Record<BudgetStatus['level'], string> = {
  none: 'text-muted',
  ok: 'text-mint-600',
  warning: 'text-saffron-700',
  over: 'text-danger-600',
}

export function BudgetsPage() {
  const { t } = useTranslation()
  const { money, num } = usePrefs()
  const label = useCategoryLabel()
  const categories = useCategories()

  const [month, setMonth] = useState(currentMonth())
  const [editing, setEditing] = useState<Category | undefined>()
  const [sheetOpen, setSheetOpen] = useState(false)

  const expenses = useMonthExpenses(month)
  const limits = useMonthLimits(month)
  const statuses = useBudgetStatuses(limits, expenses)

  const byId = useMemo(() => new Map((categories ?? []).map((c) => [c.id!, c])), [categories])
  const spentById = useMemo(
    () => new Map(totalsByCategory(expenses ?? []).map((r) => [r.categoryId, r.totalCents])),
    [expenses],
  )

  if (!categories || !statuses || !limits) {
    return <PageHeader title={t('budgets.title')} />
  }

  const alerts = alertsOf(statuses)
  const summary = summarize(statuses)
  const withoutBudget = categories.filter((c) => !c.hidden && !limits.has(c.id!))

  function open(c: Category | undefined) {
    setEditing(c)
    setSheetOpen(true)
  }

  return (
    <>
      <PageHeader title={t('budgets.title')} />
      <MonthSwitcher month={month} onChange={setMonth} />

      <div className="space-y-5">
        {statuses.length === 0 && (
          <Card tone="accent">
            <p className="text-sm text-muted">{t('budgets.intro')}</p>
          </Card>
        )}

        {alerts.length > 0 && (
          <section aria-label={t('budgets.alerts')} className="space-y-2">
            {alerts.map((s) => {
              const name = label(byId.get(s.categoryId))
              return (
                <Card key={s.categoryId} tone={s.level === 'over' ? 'danger' : 'warning'} className="py-3">
                  <p className="text-sm font-semibold">
                    {s.level === 'over'
                      ? t('budgets.alertOver', { name, amount: money(-s.remainingCents) })
                      : t('budgets.alertWarn', { name, pct: num(s.percent) })}
                  </p>
                </Card>
              )
            })}
          </section>
        )}

        {statuses.length > 0 && (
          <Card>
            <p className="text-xs font-medium text-muted">{t('budgets.summary')}</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">
              {money(summary.spentCents)}
              <span className="text-base font-semibold text-muted">
                {' '}
                / {money(summary.limitCents)}
              </span>
            </p>
            <div className="mt-3">
              <ProgressBar ratio={summary.ratio} label={t('budgets.summary')} />
            </div>
            <p
              className={`mt-2 text-sm font-medium ${
                summary.remainingCents < 0 ? 'text-danger-600' : 'text-muted'
              }`}
            >
              {summary.remainingCents < 0
                ? t('budgets.overBy', { amount: money(-summary.remainingCents) })
                : t('budgets.left', { amount: money(summary.remainingCents) })}
            </p>
          </Card>
        )}

        {statuses.length > 0 && (
          <ul className="space-y-3">
            {statuses.map((s) => {
              const c = byId.get(s.categoryId)
              return (
                <li key={s.categoryId}>
                  <button
                    type="button"
                    onClick={() => open(c)}
                    className="w-full rounded-(--radius-card) bg-surface p-4 text-start shadow-(--shadow-card)"
                  >
                    <span className="flex items-center gap-3">
                      <CategoryIcon category={c} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold">{label(c)}</span>
                        <span className="block text-xs tabular-nums text-muted">
                          {t('budgets.spentOf', {
                            spent: money(s.spentCents),
                            limit: money(s.limitCents),
                          })}
                        </span>
                      </span>
                      <span className={`text-sm font-extrabold tabular-nums ${LEVEL_TEXT[s.level]}`}>
                        {t('budgets.percent', { pct: num(s.percent) })}
                      </span>
                    </span>
                    <span className="mt-3 block">
                      <ProgressBar ratio={s.ratio} label={label(c)} />
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {withoutBudget.length > 0 && (
          <section>
            <h2 className="mb-2 px-1 text-sm font-bold">{t('budgets.noBudget')}</h2>
            <Card className="p-1.5">
              <ul>
                {withoutBudget.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => open(c)}
                      className="flex w-full items-center gap-3 rounded-xl p-2 text-start hover:bg-line/40"
                    >
                      <CategoryIcon category={c} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{label(c)}</span>
                        {(spentById.get(c.id!) ?? 0) > 0 && (
                          <span className="block text-xs tabular-nums text-muted">
                            {t('home.spentShort')} : {money(spentById.get(c.id!) ?? 0)}
                          </span>
                        )}
                      </span>
                      <span className="text-sm font-semibold text-accent-600">{t('budgets.set')}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        )}
      </div>

      <BudgetSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        category={editing}
        month={month}
        currentCents={editing?.id !== undefined ? (limits.get(editing.id) ?? 0) : 0}
      />
    </>
  )
}
