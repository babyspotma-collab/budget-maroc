import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePrefs } from '../../app/prefs'
import { useQuickAdd } from '../../app/quickAdd'
import { useToast } from '../../app/toast'
import { Button, Card, Donut, EmptyState } from '../../components/ui'
import { ChevronRightIcon } from '../../components/ui/icons'
import type { Expense } from '../../db/types'
import { currentMonth } from '../../domain/dates'
import {
  recentExpenses,
  remainingCents,
  spentRatio,
  totalCents,
  totalsByCategory,
} from '../../domain/expenses'
import { useCategoryLabel, useCategoryMap } from '../categories/hooks'
import { CategoryIcon } from '../categories/CategoryIcon'
import { loadDemoData } from '../demo/actions'
import { ExpenseRow } from '../expenses/ExpenseRow'
import { ExpenseSheet } from '../expenses/ExpenseSheet'
import { useExpenseCount, useMonthExpenses, useMonthIncome } from '../expenses/hooks'
import { MonthSwitcher } from '../expenses/MonthSwitcher'
import { IncomeSheet } from '../income/IncomeSheet'

const RING_OK = '#2f7df6'
const RING_WARN = '#f5b82e'
const RING_OVER = '#d92d3f'

export function HomePage() {
  const { t } = useTranslation()
  const { money, num } = usePrefs()
  const { openAdd } = useQuickAdd()
  const toast = useToast()
  const categories = useCategoryMap()
  const label = useCategoryLabel()

  const [month, setMonth] = useState(currentMonth())
  const monthExpenses = useMonthExpenses(month)
  const income = useMonthIncome(month)
  const count = useExpenseCount()

  const [editing, setEditing] = useState<Expense | undefined>()
  const [incomeOpen, setIncomeOpen] = useState(false)

  const recent = useMemo(() => recentExpenses(monthExpenses ?? [], 5), [monthExpenses])
  const byCategory = useMemo(() => totalsByCategory(monthExpenses ?? []).slice(0, 6), [monthExpenses])

  const header = (
    <div className="mb-4 flex items-center gap-3 pt-2">
      <span
        aria-hidden
        className="flex size-11 items-center justify-center rounded-full bg-brand-50 text-xl"
      >
        👋
      </span>
      <p className="text-lg font-bold">{t('home.greeting')}</p>
    </div>
  )

  if (monthExpenses === undefined || income === undefined || count === undefined) {
    return header
  }

  if (count === 0) {
    return (
      <>
        {header}
        <EmptyState title={t('home.emptyTitle')} body={t('home.emptyBody')}>
          <Button size="lg" block onClick={openAdd}>
            {t('home.emptyCta')}
          </Button>
          <Button
            variant="ghost"
            block
            onClick={async () => {
              const n = await loadDemoData()
              toast.show(t('more.demoLoaded', { count: num(n) }))
            }}
          >
            {t('home.emptyDemo')}
          </Button>
        </EmptyState>
      </>
    )
  }

  const spent = totalCents(monthExpenses)
  const incomeCents = income ?? undefined
  const remaining = remainingCents(incomeCents, spent)
  const ratio = spentRatio(incomeCents, spent)
  const pct = Math.round(ratio * 100)
  const ringColor = ratio >= 1 ? RING_OVER : ratio >= 0.8 ? RING_WARN : RING_OK
  const over = remaining !== undefined && remaining < 0

  return (
    <>
      {header}
      <MonthSwitcher month={month} onChange={setMonth} />

      <div className="space-y-6">
        {/* Anneau « reste à vivre » */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-bold">{t('home.ringTitle')}</h2>
            <Link
              to="/expenses"
              className="inline-flex items-center gap-0.5 text-sm font-semibold text-brand-500"
            >
              {t('common.seeAll')}
              <ChevronRightIcon width={18} height={18} className="rtl-flip" />
            </Link>
          </div>
          <Card className="p-5">
            <Donut
              ratio={incomeCents !== undefined ? ratio : 0}
              color={ringColor}
              label={t('home.usedPct', { pct: num(pct) })}
            >
              {remaining !== undefined ? (
                <>
                  <span className="text-xs font-medium text-muted">
                    {over ? t('home.overspent') : t('home.remaining')}
                  </span>
                  <span
                    className={`mt-1 text-2xl font-extrabold tabular-nums ${over ? 'text-danger-600' : ''}`}
                  >
                    {money(remaining)}
                  </span>
                  <span className="mt-1 text-xs text-muted">
                    {t('home.usedPct', { pct: num(pct) })}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs font-medium text-muted">{t('home.spent')}</span>
                  <span className="mt-1 text-2xl font-extrabold tabular-nums">{money(spent)}</span>
                </>
              )}
            </Donut>

            <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
              <div>
                <dt className="flex items-center gap-2 text-xs font-medium text-muted">
                  <span aria-hidden className="size-2 rounded-full bg-accent-600" />
                  {t('home.spent')}
                </dt>
                <dd className="mt-0.5 font-bold tabular-nums">{money(spent)}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs font-medium text-muted">
                  <span aria-hidden className="size-2 rounded-full bg-brand-500" />
                  {t('home.income')}
                </dt>
                <dd className="mt-0.5 flex items-center gap-2 font-bold tabular-nums">
                  {incomeCents !== undefined ? money(incomeCents) : '—'}
                  <button
                    type="button"
                    onClick={() => setIncomeOpen(true)}
                    className="text-xs font-semibold text-accent-600"
                  >
                    {incomeCents !== undefined ? t('common.edit') : t('home.setIncome')}
                  </button>
                </dd>
              </div>
            </dl>
          </Card>
        </section>

        {/* Tuiles pastel par catégorie */}
        {byCategory.length > 0 && (
          <section>
            <h2 className="mb-2 px-1 text-sm font-bold">{t('home.byCategory')}</h2>
            <ul className="grid grid-cols-2 gap-3">
              {byCategory.map((row) => {
                const c = categories.get(row.categoryId)
                const color = c?.color ?? '#64748b'
                return (
                  <li
                    key={row.categoryId}
                    className="rounded-3xl p-4"
                    style={{ backgroundColor: `color-mix(in srgb, ${color} 26%, white)` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="min-w-0 text-base font-bold leading-tight break-words">
                        {label(c)}
                      </span>
                      <CategoryIcon category={c} size="sm" />
                    </div>
                    <p className="mt-4 flex items-center gap-1.5 text-xs font-medium">
                      <span aria-hidden className="size-1.5 rounded-full bg-accent-600" />
                      {t('home.spentShort')}
                    </p>
                    <p className="mt-0.5 text-sm font-bold tabular-nums">{money(row.totalCents)}</p>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Dernières dépenses du mois */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-bold">{t('home.recent')}</h2>
          </div>
          {recent.length === 0 ? (
            <Card>
              <p className="text-sm text-muted">{t('home.noExpensesMonth')}</p>
            </Card>
          ) : (
            <Card className="p-2">
              <ul>
                {recent.map((e) => (
                  <li key={e.id}>
                    <ExpenseRow
                      expense={e}
                      category={categories.get(e.categoryId)}
                      showDate
                      onClick={() => setEditing(e)}
                    />
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>
      </div>

      <ExpenseSheet open={editing !== undefined} onClose={() => setEditing(undefined)} expense={editing} />
      <IncomeSheet
        open={incomeOpen}
        onClose={() => setIncomeOpen(false)}
        month={month}
        currentCents={income}
      />
    </>
  )
}
