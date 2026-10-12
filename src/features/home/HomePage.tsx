import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePrefs } from '../../app/prefs'
import { useQuickAdd } from '../../app/quickAdd'
import { useToast } from '../../app/toast'
import { Button, Card, Donut, EmptyState, ProgressBar } from '../../components/ui'
import { ChevronRightIcon } from '../../components/ui/icons'
import type { Expense } from '../../db/types'
import { alertsOf, type BudgetStatus } from '../../domain/budget'
import { currentMonth } from '../../domain/dates'
import {
  recentExpenses,
  remainingCents,
  spentRatio,
  totalCents,
  totalsByCategory,
} from '../../domain/expenses'
import { useBudgetStatuses, useMonthLimits } from '../budgets/hooks'
import { useCategoryLabel, useCategoryMap } from '../categories/hooks'
import { CategoryIcon } from '../../components/ui/CategoryIcon'
import { loadDemoData } from '../demo/actions'
import { ExpenseRow } from '../expenses/ExpenseRow'
import { ExpenseSheet } from '../expenses/ExpenseSheet'
import { useExpenseCount, useMonthExpenses, useMonthIncome } from '../expenses/hooks'
import { MonthSwitcher } from '../expenses/MonthSwitcher'
import { IncomeSheet } from '../income/IncomeSheet'
import { isOnboardingSkipped } from '../program/actions'
import { useProfile, useProgram } from '../program/hooks'

const RING_OK = '#0c7d5e'
const RING_WARN = '#e9b949'
const RING_OVER = '#c2321f'

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
  const stored = useProfile()
  const program = useProgram()

  const [editing, setEditing] = useState<Expense | undefined>()
  const [incomeOpen, setIncomeOpen] = useState(false)

  const recent = useMemo(() => recentExpenses(monthExpenses ?? [], 5), [monthExpenses])
  const limits = useMonthLimits(month)
  const statuses = useBudgetStatuses(limits, monthExpenses)
  const alerts = useMemo(() => alertsOf(statuses ?? []), [statuses])

  // Tuiles : catégories avec dépenses ou budget ; budgets les plus consommés d'abord.
  const tiles = useMemo(() => {
    const spent = new Map(
      totalsByCategory(monthExpenses ?? []).map((r) => [r.categoryId, r.totalCents]),
    )
    const ids = new Set([...spent.keys(), ...(limits?.keys() ?? [])])
    return [...ids]
      .map((categoryId) => {
        const totalCents = spent.get(categoryId) ?? 0
        const limit = limits?.get(categoryId)
        return { categoryId, totalCents, limit, ratio: limit ? totalCents / limit : -1 }
      })
      .sort((a, b) => b.ratio - a.ratio || b.totalCents - a.totalCents)
      .slice(0, 6)
  }, [monthExpenses, limits])

  function alertLine(s: BudgetStatus): string {
    const name = label(categories.get(s.categoryId))
    return s.level === 'over'
      ? t('budgets.alertOver', { name, amount: money(-s.remainingCents) })
      : t('budgets.alertWarn', { name, pct: num(s.percent) })
  }

  const header = (
    <div className="mb-4 flex items-center gap-3 pt-2">
      <CategoryIcon name="greeting" size="md" />
      <p className="text-lg font-bold">
        {stored ? t('home.greetingName', { name: stored.profile.firstName }) : t('home.greeting')}
      </p>
    </div>
  )

  // Premier lancement : on propose le questionnaire (sauf si l'utilisateur l'a reporté).
  if (stored === null && !isOnboardingSkipped()) return <Navigate to="/onboarding" replace />

  const programCta =
    stored === null ? (
      <Card tone="accent" className="mb-4">
        <h2 className="font-bold">{t('onboarding.cta.title')}</h2>
        <p className="mt-1 text-sm text-muted">{t('onboarding.cta.body')}</p>
        <Link
          to="/onboarding"
          className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white"
        >
          {t('onboarding.cta.button')}
        </Link>
      </Card>
    ) : program ? (
      <Link to="/programme" className="mb-4 block">
        <Card className="flex items-center gap-3 py-3">
          <CategoryIcon name={program.plan.status === 'deficit' ? 'deficit' : 'program'} size="sm" />
          <span className="min-w-0 flex-1">
            {program.plan.status === 'deficit' ? (
              <span className="block text-sm font-bold">{t('plan.deficitCard')}</span>
            ) : (
              <>
                <span className="block text-xs font-medium text-muted">{t('plan.dailyTitle')}</span>
                <span className="block font-extrabold">
                  {money(program.plan.dailyCents)} {t('plan.dailyPer')}
                </span>
              </>
            )}
          </span>
          <ChevronRightIcon className="text-muted" />
        </Card>
      </Link>
    ) : null
  if (monthExpenses === undefined || income === undefined || count === undefined) {
    return header
  }

  if (count === 0) {
    return (
      <>
        {header}
        {programCta}
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
      {programCta}
      <MonthSwitcher month={month} onChange={setMonth} />

      <div className="space-y-6">
        {alerts.length > 0 && (
          <Link to="/budgets" className="block">
            <Card
              tone={alerts.some((a) => a.level === 'over') ? 'danger' : 'warning'}
              className="py-3"
            >
              <p className="flex items-center gap-2 text-sm font-semibold">
                <CategoryIcon name="deficit" tone="plain" px={20} />
                <span>{alertLine(alerts[0])}
                {alerts.length > 1 &&
                  ` · ${t('home.alertMore', { count: num(alerts.length - 1) })}`}</span>
              </p>
            </Card>
          </Link>
        )}

        {/* Anneau « reste à vivre » */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-bold">{t('home.ringTitle')}</h2>
            <Link
              to="/expenses"
              className="inline-flex items-center gap-0.5 text-sm font-semibold text-brand-600"
            >
              {t('common.seeAll')}
              <ChevronRightIcon width={18} />
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
                  <span aria-hidden className="size-2 rounded-full bg-brand-500" />
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
        {tiles.length > 0 && (
          <section>
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-sm font-bold">{t('home.byCategory')}</h2>
              <Link
                to="/budgets"
                className="inline-flex items-center gap-0.5 text-sm font-semibold text-brand-600"
              >
                {t('nav.budgets')}
                <ChevronRightIcon width={18} />
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-3">
              {tiles.map((row) => {
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
                      <span aria-hidden className="size-1.5 rounded-full bg-brand-500" />
                      {row.limit ? t('home.budgetLabel') : t('home.spentShort')}
                    </p>
                    <p className="mt-0.5 text-sm font-bold tabular-nums">
                      {money(row.totalCents)}
                    </p>
                    {row.limit ? (
                      <p className="text-xs font-medium tabular-nums text-ink/60">
                        {t('home.ofLimit', { limit: money(row.limit) })}
                      </p>
                    ) : null}
                    {row.limit ? (
                      <div className="mt-2">
                        <ProgressBar ratio={row.ratio} label={label(c)} />
                      </div>
                    ) : null}
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
