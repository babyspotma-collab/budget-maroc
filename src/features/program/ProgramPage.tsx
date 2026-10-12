import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePrefs } from '../../app/prefs'
import { useToast } from '../../app/toast'
import { Button, Card, EmptyState, PageHeader } from '../../components/ui'
import { CategoryIcon } from '../../components/ui/CategoryIcon'
import { currentMonth, formatDateFull, formatMonthLabel } from '../../domain/dates'
import {
  nextPayDate,
  VARIABLE_INCOME_FACTOR,
  type DeficitInfo,
  type Plan,
} from '../../domain/plan'
import { useCategories, useCategoryLabel } from '../categories/hooks'
import { applyProgram, toggleWeekDay } from './actions'
import { formatParams } from './format'
import { useProfile, useProgram } from './hooks'

type Translate = (key: string, options?: Record<string, unknown>) => string

/** Explication du déficit : titre, texte précis selon la situation, et ce qu'on peut faire. */
function DeficitSection({
  deficit,
  planningCents,
  money,
  num,
  t,
}: {
  deficit: DeficitInfo
  planningCents: number
  money: (c: number) => string
  num: (n: number) => string
  t: Translate
}) {
  const shortfall = deficit.kind === 'variable_shortfall'
  const low = !shortfall && deficit.gapCents === 0

  const title = shortfall
    ? t('plan.deficit.shortfallTitle')
    : low
      ? t('plan.deficit.lowTitle')
      : t('plan.deficit.overTitle')

  const body = shortfall
    ? t('plan.deficit.shortfallBody', {
        percent: num(Math.round(VARIABLE_INCOME_FACTOR * 100)),
        planning: money(planningCents),
        gap: money(deficit.gapCents),
        margin: money(deficit.averageMarginCents),
        daily: money(deficit.averageDailyCents),
      })
    : low
      ? t('plan.deficit.lowBody', {
          margin: money(Math.max(0, deficit.marginCents)),
          vital: money(deficit.vitalDailyCents),
          needed: money(deficit.neededCents),
        })
      : t('plan.deficit.overBody', {
          gap: money(deficit.gapCents),
          vital: money(deficit.vitalDailyCents),
          needed: money(deficit.neededCents),
        })

  return (
    <>
      <section
        className="rounded-(--radius-card) bg-danger-600 p-6 text-white"
        aria-label={title}
      >
        <CategoryIcon
          name={shortfall ? 'variable_shortfall' : 'deficit'}
          size="md"
          tone="solid"
          color="#ffffff"
          iconColor="#c2321f"
        />
        <h2 className="mt-4 text-2xl font-extrabold leading-snug">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/90">{body}</p>
        {shortfall && deficit.averageDailyCents > 0 && (
          <p className="mt-4 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold">
            {t('plan.deficit.averageDaily', { daily: money(deficit.averageDailyCents) })}
          </p>
        )}
        <p className="mt-4 text-xs text-white/80">{t('plan.deficit.noDaily')}</p>
      </section>

      <section>
        <h2 className="mb-2 px-1 text-sm font-bold">{t('plan.deficit.adviceTitle')}</h2>
        <ul className="space-y-3">
          {deficit.advice.map((a) => (
            <li key={a.id}>
              <Card className="flex gap-3 p-4">
                <CategoryIcon name={a.id} size="sm" />
                <p className="text-sm leading-relaxed">
                  {t(`plan.advice.${a.id}`, {
                    ...formatParams(a.params, money, num),
                    name: a.item ? t(`plan.items.${a.item}`) : '',
                  })}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
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
  const deficit = plan.status === 'deficit' && plan.deficit !== null
  const tight = plan.status === 'tight'
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

      <div className="space-y-6">
        {deficit && plan.deficit ? (
          <DeficitSection
            deficit={plan.deficit}
            planningCents={plan.planningIncomeCents}
            money={money}
            num={num}
            t={t as unknown as Translate}
          />
        ) : (
          /* Carte principale : budget du jour (jamais affiché à 0) */
          <section
            className="rounded-(--radius-card) border-s-[6px] border-gold-500 bg-sand-deep p-6"
            aria-label={t('plan.dailyTitle')}
          >
            <p className="text-sm font-medium text-muted">{t('plan.dailyTitle')}</p>
            <p className="font-display mt-1 text-[44px] font-extrabold leading-tight">{money(plan.dailyCents)}</p>
            <p className="text-lg font-semibold">{t('plan.dailyPer')}</p>
            <p className="mt-3 text-sm text-muted">{t('plan.dailyHint')}</p>
            <p className="mt-1 text-sm font-semibold">
              {t('plan.weekly', { amount: money(plan.weeklyCents) })}
            </p>
            {tight && (
              <p className="mt-3 flex items-center gap-2 rounded-[14px] bg-saffron-50 px-3 py-2 text-xs font-medium text-saffron-700">
                <CategoryIcon name="fixed_charges_high" tone="plain" px={18} iconColor="#8a5a00" />
                {t('plan.tight')}
              </p>
            )}
            {profile.incomeKind === 'variable' && (
              <p className="mt-3 rounded-[14px] bg-ink/5 px-3 py-2 text-xs text-muted">
                {t('plan.variableNote', { percent: num(Math.round(VARIABLE_INCOME_FACTOR * 100)) })}
              </p>
            )}
          </section>
        )}

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
                  <CategoryIcon name={rule.id} size="sm" />
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
                    {done ? (
                      <CategoryIcon name="check" size="sm" tone="solid" color="#138a5e" />
                    ) : (
                      <CategoryIcon name={action.id} size="sm" />
                    )}
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
            <p className="flex items-center gap-2 font-bold">
              <CategoryIcon name="check" tone="plain" px={20} weight="bold" iconColor="#138a5e" />
              {t('plan.applied')}
            </p>
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
