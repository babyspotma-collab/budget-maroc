import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePrefs } from '../../app/prefs'
import { useToast } from '../../app/toast'
import { Button, Card, EmptyState, PageHeader } from '../../components/ui'
import { currentMonth, formatDateFull, formatMonthLabel } from '../../domain/dates'
import { nextPayDate, VARIABLE_INCOME_FACTOR, type Plan } from '../../domain/plan'
import { CategoryIcon } from '../categories/CategoryIcon'
import { useCategories, useCategoryLabel } from '../categories/hooks'
import { applyProgram, toggleWeekDay } from './actions'
import { formatParams } from './format'
import { useProfile, useProgram } from './hooks'

const RULE_ICONS: Record<string, string> = {
  deficit: '🚨',
  daily_cap: '🎯',
  variable_floor: '🎢',
  weekly_envelope: '✉️',
  debt_first: '🔗',
  debt_minimum: '📌',
  fixed_charges_high: '🏠',
  impulse_24h: '⏳',
  month_end_half: '🌗',
  no_savings_auto: '🐖',
  pay_day_savings: '💸',
  daret_keep: '🤝',
  savings_goal: '🏁',
  dependents_buffer: '👨‍👩‍👧',
  student_cap: '🎓',
  track_daily: '📝',
  weekly_review: '🗓️',
}

export function ProgramPage() {
  const { t } = useTranslation()
  const { money, num, locale } = usePrefs()
  const navigate = useNavigate()
  const toast = useToast()
  const stored = useProfile()
  const program = useProgram()
  const categories = useCategories()
  const label = useCategoryLabel()
  const [applying, setApplying] = useState(false)

  const budgetRows = useMemo(() => {
    if (!program || !categories) return []
    return categories
      .filter((c) => c.key && program.plan.budgets[c.key])
      .map((c) => ({ category: c, cents: program.plan.budgets[c.key!] }))
      .sort((a, b) => b.cents - a.cents)
  }, [program, categories])

  if (stored === undefined || program === undefined) {
    return <PageHeader title={t('plan.title')} />
  }

  if (!stored || !program) {
    return (
      <>
        <PageHeader title={t('plan.title')} />
        <EmptyState title={t('plan.notFound')} body={t('onboarding.cta.body')}>
          <Button size="lg" block onClick={() => navigate('/onboarding')}>
            {t('plan.create')}
          </Button>
        </EmptyState>
      </>
    )
  }

  const { profile } = stored
  const plan: Plan = program.plan
  const month = currentMonth()
  const deficit = plan.marginCents <= 0
  const applied = program.appliedAt !== undefined
  const goal = plan.savingsGoal

  async function apply() {
    setApplying(true)
    try {
      const count = await applyProgram()
      toast.show(t('plan.appliedToast', { count: num(count) }))
    } finally {
      setApplying(false)
    }
  }

  const breakdown: { key: string; cents: number; color: string }[] = [
    { key: 'fixed', cents: plan.fixedCents, color: 'bg-brand-500' },
    { key: 'obligations', cents: plan.obligationsCents, color: 'bg-accent-500' },
    { key: 'savings', cents: plan.savingsCents, color: 'bg-mint-600' },
    { key: 'spendable', cents: plan.spendableCents, color: 'bg-saffron-500' },
  ]

  return (
    <>
      <PageHeader
        title={t('plan.hello', { name: profile.firstName })}
        subtitle={t('plan.nextPay', { date: formatDateFull(nextPayDate(profile.payDay), locale) })}
      />

      <div className="space-y-5">
        {deficit && (
          <Card tone="danger">
            <h2 className="font-bold">{t('plan.deficitTitle')}</h2>
            <p className="mt-1 text-sm">
              {t('plan.deficitBody', { gap: money(Math.max(0, -plan.marginCents)) })}
            </p>
          </Card>
        )}

        {/* Carte principale : budget du jour */}
        <section
          className="rounded-3xl bg-linear-to-br from-brand-500 to-brand-700 p-6 text-white shadow-(--shadow-card)"
          aria-label={t('plan.dailyTitle')}
        >
          <p className="text-sm font-medium text-white/85">{t('plan.dailyTitle')}</p>
          <p className="mt-1 text-5xl font-extrabold leading-tight">{money(plan.dailyCents)}</p>
          <p className="text-lg font-semibold">{t('plan.dailyPer')}</p>
          <p className="mt-3 text-sm text-white/85">{t('plan.dailyHint')}</p>
          <p className="mt-1 text-sm font-medium text-white/95">
            {t('plan.weekly', { amount: money(plan.weeklyCents) })}
          </p>
          {profile.incomeKind === 'variable' && (
            <p className="mt-3 rounded-xl bg-white/15 px-3 py-2 text-xs">
              {t('plan.variableNote', { percent: num(Math.round(VARIABLE_INCOME_FACTOR * 100)) })}
            </p>
          )}
        </section>

        {/* Répartition du revenu */}
        <Card>
          <h2 className="mb-3 text-base font-bold">{t('plan.breakdownTitle')}</h2>
          <div
            role="img"
            aria-label={breakdown.map((b) => `${t(`plan.${b.key}`)} ${money(b.cents)}`).join(', ')}
            className="flex h-3 overflow-hidden rounded-full bg-line"
          >
            {breakdown.map((b) =>
              b.cents > 0 && plan.planningIncomeCents > 0 ? (
                <span
                  key={b.key}
                  className={`${b.color} first:rounded-s-full last:rounded-e-full`}
                  style={{
                    width: `${Math.min(100, (b.cents / plan.planningIncomeCents) * 100)}%`,
                    marginInlineEnd: '2px',
                  }}
                />
              ) : null,
            )}
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between font-semibold">
              <dt>{t('plan.income')}</dt>
              <dd className="tabular-nums">{money(plan.planningIncomeCents)}</dd>
            </div>
            {breakdown.map((b) => (
              <div key={b.key} className="flex items-center justify-between text-muted">
                <dt className="flex items-center gap-2">
                  <span aria-hidden className={`size-2.5 rounded-full ${b.color}`} />
                  {t(`plan.${b.key}`)}
                </dt>
                <dd className="tabular-nums">{money(b.cents)}</dd>
              </div>
            ))}
          </dl>
        </Card>

        {/* Objectif d'épargne */}
        <Card tone="accent">
          <h2 className="text-base font-bold">{t('plan.savingsTitle')}</h2>
          {goal.monthlyCents > 0 ? (
            <>
              <p className="mt-2 text-2xl font-extrabold">
                {t('plan.savingsPerMonth', { amount: money(goal.monthlyCents) })}
              </p>
              <p className="mt-1 text-sm">
                {t(`plan.savingsKind.${goal.kind}`, { target: money(goal.targetCents) })}
              </p>
              {goal.targetDate && goal.months !== null && (
                <p className="mt-1 text-sm font-semibold text-brand-600">
                  {t('plan.savingsDate', {
                    date: formatDateFull(goal.targetDate, locale),
                    months: num(goal.months),
                  })}
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">{t('plan.savingsNone')}</p>
          )}
        </Card>

        {plan.debt && (
          <Card>
            <h2 className="text-base font-bold">{t('plan.debtTitle')}</h2>
            <p className="mt-2 text-sm">
              {plan.debt.payoffDate
                ? t('plan.debtLine', {
                    monthly: money(plan.debt.monthlyCents),
                    date: formatDateFull(plan.debt.payoffDate, locale),
                  })
                : t('plan.debtLineNoDate', { monthly: money(plan.debt.monthlyCents) })}
            </p>
          </Card>
        )}

        {/* Règles personnalisées */}
        <section>
          <h2 className="mb-2 px-1 text-sm font-bold">{t('plan.rulesTitle')}</h2>
          <ol className="space-y-3">
            {plan.rules.map((rule, i) => (
              <li key={rule.id}>
                <Card className="flex gap-3 p-4">
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-lg"
                  >
                    {RULE_ICONS[rule.id] ?? '✔️'}
                  </span>
                  <p className="text-sm leading-relaxed">
                    <span className="sr-only">{num(i + 1)}. </span>
                    {t(`plan.rules.${rule.id}`, formatParams(rule.params, money, num))}
                  </p>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        {/* Budgets par catégorie */}
        <Card className="p-2">
          <h2 className="px-2 pb-1 pt-2 text-base font-bold">{t('plan.budgetsTitle')}</h2>
          <ul>
            {budgetRows.map(({ category, cents }) => (
              <li key={category.id} className="flex items-center gap-3 p-2">
                <CategoryIcon category={category} size="sm" />
                <span className="min-w-0 flex-1 truncate font-medium">{label(category)}</span>
                <span className="font-bold tabular-nums">{money(cents)}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Première semaine */}
        <section>
          <h2 className="mb-2 px-1 text-sm font-bold">{t('plan.weekTitle')}</h2>
          <ol className="space-y-2">
            {plan.week1.map((action) => {
              const done = program.weekDone.includes(action.day)
              return (
                <li key={action.day}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={done}
                    onClick={() => void toggleWeekDay(action.day)}
                    className="flex w-full items-start gap-3 rounded-2xl bg-surface p-3 text-start shadow-(--shadow-card)"
                  >
                    <span
                      aria-hidden
                      className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                        done
                          ? 'border-mint-600 bg-mint-600 text-white'
                          : 'border-line-strong text-muted'
                      }`}
                    >
                      {done ? '✓' : num(action.day)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-muted">
                        {t('plan.day', { n: num(action.day) })}
                      </span>
                      <span className={`block text-sm ${done ? 'text-muted line-through' : ''}`}>
                        {t(`plan.actions.${action.id}`, formatParams(action.params, money, num))}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </section>

        {/* Appliquer */}
        {applied ? (
          <Card tone="accent">
            <p className="font-bold">✓ {t('plan.applied')}</p>
            <p className="mt-1 text-sm text-muted">
              {t('plan.appliedBody', { month: formatMonthLabel(month, locale) })}
            </p>
            <div className="mt-3 flex gap-2">
              <Link
                to="/budgets"
                className="inline-flex min-h-11 items-center rounded-xl bg-accent-50 px-4 text-sm font-semibold text-accent-700"
              >
                {t('nav.budgets')}
              </Link>
              <Button variant="ghost" disabled={applying} onClick={() => void apply()}>
                {t('plan.apply')}
              </Button>
            </div>
          </Card>
        ) : (
          <Button size="lg" block disabled={applying} onClick={() => void apply()}>
            {t('plan.apply')}
          </Button>
        )}

        <Button variant="ghost" block onClick={() => navigate('/onboarding')}>
          {t('plan.redo')}
        </Button>
      </div>
    </>
  )
}
