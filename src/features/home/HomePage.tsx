import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePrefs } from '../../app/prefs'
import { useQuickAdd } from '../../app/quickAdd'
import { useToast } from '../../app/toast'
import { Button, Card, EmptyState, PageHeader } from '../../components/ui'
import type { Expense } from '../../db/types'
import { currentMonth, formatMonthLabel } from '../../domain/dates'
import { remainingCents, spentRatio, totalCents } from '../../domain/expenses'
import { useCategoryMap } from '../categories/hooks'
import { ExpenseRow } from '../expenses/ExpenseRow'
import { ExpenseSheet } from '../expenses/ExpenseSheet'
import {
  useExpenseCount,
  useMonthExpenses,
  useMonthIncome,
  useRecentExpenses,
} from '../expenses/hooks'
import { IncomeSheet } from '../income/IncomeSheet'
import { loadDemoData } from '../demo/actions'

export function HomePage() {
  const { t } = useTranslation()
  const { money, num, locale } = usePrefs()
  const { openAdd } = useQuickAdd()
  const toast = useToast()
  const categories = useCategoryMap()

  const month = currentMonth()
  const monthExpenses = useMonthExpenses(month)
  const income = useMonthIncome(month)
  const recent = useRecentExpenses(5)
  const count = useExpenseCount()

  const [editing, setEditing] = useState<Expense | undefined>()
  const [incomeOpen, setIncomeOpen] = useState(false)

  const ready =
    monthExpenses !== undefined && income !== undefined && recent !== undefined && count !== undefined
  const monthLabel = formatMonthLabel(month, locale)

  if (!ready) return <PageHeader title={t('home.title')} subtitle={monthLabel} />

  if (count === 0) {
    return (
      <>
        <PageHeader title={t('home.title')} subtitle={monthLabel} />
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
  const over = remaining !== undefined && remaining < 0

  return (
    <>
      <PageHeader title={t('home.title')} subtitle={monthLabel} />

      <div className="space-y-4">
        {/* Grande carte « reste à vivre » */}
        <section
          className={`relative overflow-hidden rounded-3xl p-5 text-white shadow-(--shadow-card) ${
            over
              ? 'bg-linear-to-br from-danger-600 to-terracotta-700'
              : 'bg-linear-to-br from-terracotta-500 to-terracotta-700'
          }`}
        >
          <div aria-hidden className="zellige-light pointer-events-none absolute inset-0" />
          <div className="relative">
            {remaining !== undefined ? (
              <>
                <p className="text-sm font-medium text-white/85">
                  {over ? t('home.overspent') : t('home.remaining')}
                </p>
                <p className="mt-1 font-display text-5xl font-semibold tabular-nums leading-tight">
                  {money(remaining)}
                </p>
                <div
                  role="progressbar"
                  aria-label={t('home.usedPct', { pct: num(Math.round(ratio * 100)) })}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.min(100, Math.round(ratio * 100))}
                  className="mt-4 h-2 overflow-hidden rounded-full bg-black/20"
                >
                  <div
                    className="h-full rounded-full bg-cream"
                    style={{ width: `${Math.min(100, Math.round(ratio * 100))}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-white/85">
                  {t('home.usedPct', { pct: num(Math.round(ratio * 100)) })}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-white/85">{t('home.spent')}</p>
                <p className="mt-1 font-display text-5xl font-semibold tabular-nums leading-tight">
                  {money(spent)}
                </p>
                <p className="mt-3 text-sm text-white/90">{t('home.noIncomeHint')}</p>
                <button
                  type="button"
                  onClick={() => setIncomeOpen(true)}
                  className="mt-3 rounded-xl bg-cream px-4 py-2.5 text-sm font-semibold text-terracotta-700"
                >
                  {t('home.setIncome')}
                </button>
              </>
            )}
          </div>
        </section>

        {/* Total dépensé et revenu */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-xs font-medium text-muted">{t('home.spent')}</p>
            <p className="mt-1 font-display text-xl font-semibold tabular-nums">{money(spent)}</p>
          </Card>
          <button
            type="button"
            onClick={() => setIncomeOpen(true)}
            className="rounded-(--radius-card) border border-sand bg-surface p-4 text-start shadow-(--shadow-card)"
          >
            <span className="block text-xs font-medium text-muted">{t('home.income')}</span>
            <span className="mt-1 block font-display text-xl font-semibold tabular-nums">
              {incomeCents !== undefined ? money(incomeCents) : '—'}
            </span>
            <span className="mt-0.5 block text-xs font-medium text-majorelle-600">
              {t('common.edit')}
            </span>
          </button>
        </div>

        {/* Dernières dépenses */}
        <Card className="p-2">
          <div className="flex items-center justify-between px-2 pb-1 pt-2">
            <h2 className="font-display text-lg font-semibold">{t('home.recent')}</h2>
            <Link to="/expenses" className="text-sm font-medium text-majorelle-600">
              {t('common.seeAll')}
            </Link>
          </div>
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
