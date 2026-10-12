import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePrefs } from '../../app/prefs'
import { useToast } from '../../app/toast'
import { Button, Card } from '../../components/ui'
import { CategoryIcon } from '../../components/ui/CategoryIcon'
import { ChevronRightIcon } from '../../components/ui/icons'
import { SwipeToDelete } from '../../components/ui/SwipeToDelete'
import type { Expense } from '../../db/types'
import { currentMonth, todayISO } from '../../domain/dates'
import { remainingCents, spentRatio, totalCents } from '../../domain/expenses'
import { FIXED_CATEGORY_KEYS, ruleOfTheDay, todayGauge, variableSpentToday } from '../../domain/today'
import { useCategories, useCategoryMap } from '../categories/hooks'
import { loadDemoData } from '../demo/actions'
import { ExpenseRow } from '../expenses/ExpenseRow'
import { ExpenseSheet } from '../expenses/ExpenseSheet'
import {
  useExpenseCount,
  useMonthExpenses,
  useMonthIncome,
  useRecentExpenses,
} from '../expenses/hooks'
import { useDeleteExpense } from '../expenses/useDeleteExpense'
import { formatParams } from '../program/format'
import { isOnboardingSkipped } from '../program/actions'
import { useProfile, useProgram } from '../program/hooks'

/**
 * Accueil volontairement minimal, sur un seul écran : ce qu'il me reste aujourd'hui,
 * une règle du jour, mes trois dernières dépenses. Le reste vit dans les autres onglets.
 */
export function HomePage() {
  const { t } = useTranslation()
  const { money, num } = usePrefs()
  const toast = useToast()
  const removeExpense = useDeleteExpense()

  const month = currentMonth()
  const today = todayISO()
  const monthExpenses = useMonthExpenses(month)
  const income = useMonthIncome(month)
  const recent = useRecentExpenses(3)
  const count = useExpenseCount()
  const stored = useProfile()
  const program = useProgram()
  const categoryList = useCategories()
  const categories = useCategoryMap()
  const [editing, setEditing] = useState<Expense | undefined>()

  const fixedIds = useMemo(
    () =>
      new Set(
        (categoryList ?? [])
          .filter((c) => c.key && (FIXED_CATEGORY_KEYS as readonly string[]).includes(c.key))
          .map((c) => c.id!),
      ),
    [categoryList],
  )

  // Premier lancement : on propose le questionnaire (sauf si l'utilisateur l'a reporté).
  if (stored === null && !isOnboardingSkipped()) return <Navigate to="/onboarding" replace />

  if (
    monthExpenses === undefined ||
    income === undefined ||
    recent === undefined ||
    count === undefined ||
    stored === undefined ||
    program === undefined
  ) {
    return null
  }

  const plan = program?.plan ?? null
  const incomeCents = income ?? stored?.profile.incomeCents
  const spentMonth = totalCents(monthExpenses)
  const remainingMonth = remainingCents(incomeCents, spentMonth)
  const ratio = spentRatio(incomeCents, spentMonth)
  const gauge = todayGauge({
    status: plan?.status ?? null,
    dailyCents: plan?.dailyCents ?? 0,
    spentTodayCents: variableSpentToday(monthExpenses, fixedIds, today),
    remainingMonthCents: remainingMonth,
  })

  const amount = money(Math.abs(gauge.amountCents))
  const headline =
    gauge.kind === 'today'
      ? gauge.over
        ? t('home.todayOver', { amount })
        : t('home.todayLeft', { amount })
      : gauge.kind === 'month'
        ? gauge.over
          ? t('home.monthOver', { amount })
          : t('home.monthLeft', { amount })
        : `${t('home.spentToday')} : ${amount}`

  const rule = plan ? ruleOfTheDay(plan.rules, today) : null
  const pct = Math.min(100, Math.round(ratio * 100))
  const name = stored?.profile.firstName

  return (
    <div className="flex flex-col gap-3">
      {/* Grande carte : ce qu'il me reste aujourd'hui (fond sable foncé, marge ocre) */}
      <section
        className={`rounded-(--radius-card) border-s-[6px] p-5 ${
          gauge.over
            ? 'border-danger-600 bg-danger-50'
            : 'border-gold-500 bg-sand-deep'
        }`}
        aria-label={headline}
      >
        <p className="flex items-center gap-2 text-sm font-medium text-muted">
          <CategoryIcon name="greeting" size="xs" />
          {name ? t('home.greetingName', { name }) : t('home.greeting')}
        </p>
        <h1
          className={`mt-4 text-[32px] font-extrabold leading-[1.1] [text-wrap:balance] ${gauge.over ? 'text-danger-600' : ''}`}
        >
          {headline}
        </h1>

        {incomeCents !== undefined && (
          <>
            {/* Règle graduée : une graduation tous les 10 % du revenu */}
            <div
              role="progressbar"
              aria-label={t('home.monthSpent', { pct: num(pct) })}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              className="relative mt-5 h-3 overflow-hidden rounded-full bg-ink/10"
            >
              <div
                className={`h-full rounded-full transition-[width] duration-300 ease-out ${
                  gauge.over ? 'bg-danger-600' : 'bg-brand-500'
                }`}
                style={{ width: `${pct}%` }}
              />
              <div aria-hidden className="ruler pointer-events-none absolute inset-0" />
            </div>
            <p className="mt-3 flex flex-wrap items-center justify-between gap-x-3 text-sm text-muted">
              <span>{t('home.monthSpent', { pct: num(pct) })}</span>
              {remainingMonth !== undefined && gauge.kind === 'today' && (
                <span className="font-semibold text-ink">
                  {t('home.leftToLive', { amount: money(remainingMonth) })}
                </span>
              )}
            </p>
          </>
        )}
        {plan?.status === 'deficit' && (
          <Link
            to="/programme"
            className="mt-3 block text-sm font-semibold text-danger-600 underline underline-offset-2"
          >
            {t('home.deficitHint')}
          </Link>
        )}
      </section>
      {/* Une seule règle du jour, tirée du programme */}
      {rule ? (
        <Link to="/programme" className="block">
          <Card className="flex items-start gap-3 p-4">
            <CategoryIcon name={rule.id} size="md" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-muted">{t('home.ruleTitle')}</span>
              <span className="mt-0.5 block text-sm font-medium leading-snug">
                {t(`plan.rules.${rule.id}`, formatParams(rule.params, money, num))}
              </span>
            </span>
            <ChevronRightIcon width={18} className="mt-1 shrink-0 text-muted" />
          </Card>
        </Link>
      ) : stored === null ? (
        <Link to="/onboarding" className="block">
          <Card tone="accent" className="flex items-center gap-3 p-4">
            <CategoryIcon name="program" size="md" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">{t('onboarding.cta.title')}</span>
              <span className="block text-xs text-muted">{t('home.noProgramRule')}</span>
            </span>
            <ChevronRightIcon width={18} className="shrink-0 text-muted" />
          </Card>
        </Link>
      ) : null}

      {/* Les trois dernières dépenses */}
      <Card className="p-2">
        <div className="flex items-center justify-between px-2 pb-1 pt-1.5">
          <h2 className="text-sm font-bold">{t('home.lastThree')}</h2>
          <Link
            to="/expenses"
            className="inline-flex items-center gap-0.5 text-sm font-semibold text-brand-600"
          >
            {t('common.seeAll')}
            <ChevronRightIcon width={16} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="px-2 pb-2">
            <p className="text-sm text-muted">{t('home.noExpenses')}</p>
            <Button
              variant="ghost"
              className="mt-2"
              onClick={async () => {
                const n = await loadDemoData()
                toast.show(t('more.demoLoaded', { count: num(n) }))
              }}
            >
              {t('home.emptyDemo')}
            </Button>
          </div>
        ) : (
          <ul>
            {recent.map((e) => (
              <li key={e.id}>
                <SwipeToDelete onDelete={() => void removeExpense(e)}>
                  <ExpenseRow
                    expense={e}
                    category={categories.get(e.categoryId)}
                    showDate
                    onClick={() => setEditing(e)}
                  />
                </SwipeToDelete>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ExpenseSheet
        open={editing !== undefined}
        onClose={() => setEditing(undefined)}
        expense={editing}
      />
    </div>
  )
}
