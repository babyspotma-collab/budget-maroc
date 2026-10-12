import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePrefs } from '../../app/prefs'
import { useQuickAdd } from '../../app/quickAdd'
import { Button, Card, EmptyState, PageHeader } from '../../components/ui'
import { CategoryIcon } from '../../components/ui/CategoryIcon'
import { currentMonth, formatMonthLabel } from '../../domain/dates'
import {
  cumulativeByDay,
  curveData,
  daysInMonth,
  lastVisibleDay,
  monthStats,
  pieSlices,
  previousMonth,
} from '../../domain/stats'
import { useCategoryLabel, useCategoryMap } from '../categories/hooks'
import { useMonthExpenses } from '../expenses/hooks'
import { MonthSwitcher } from '../expenses/MonthSwitcher'
import { CategoryDonut } from './CategoryDonut'
import { MonthCurve } from './MonthCurve'

export function StatsPage() {
  const { t } = useTranslation()
  const { money, num, locale } = usePrefs()
  const { openAdd } = useQuickAdd()
  const categories = useCategoryMap()
  const label = useCategoryLabel()

  const [month, setMonth] = useState(currentMonth())
  const prevMonth = previousMonth(month)
  const expenses = useMonthExpenses(month)
  const prevExpenses = useMonthExpenses(prevMonth)

  const view = useMemo(() => {
    if (!expenses || !prevExpenses) return null
    const now = new Date()
    const last = lastVisibleDay(month, now)
    const prevLast = daysInMonth(prevMonth)
    const maxDay = Math.max(daysInMonth(month), 1)
    return {
      stats: monthStats(expenses, prevExpenses, month, now),
      slices: pieSlices(expenses),
      rows: curveData(
        cumulativeByDay(expenses, month, last),
        cumulativeByDay(prevExpenses, prevMonth, Math.min(prevLast, maxDay)),
        maxDay,
      ),
      hasPrevious: prevExpenses.length > 0,
      maxDay,
    }
  }, [expenses, prevExpenses, month, prevMonth])

  if (!view) return <PageHeader title={t('stats.title')} />

  const { stats, slices, rows, hasPrevious, maxDay } = view
  const top = slices[0]
  const topName =
    top === undefined
      ? '—'
      : top.categoryId === null
        ? t('stats.others')
        : label(categories.get(top.categoryId))

  if (stats.count === 0) {
    return (
      <>
        <PageHeader title={t('stats.title')} />
        <MonthSwitcher month={month} onChange={setMonth} />
        <EmptyState title={t('stats.emptyTitle')} body={t('stats.emptyBody')}>
          {month === currentMonth() && (
            <Button size="lg" block onClick={openAdd}>
              {t('home.emptyCta')}
            </Button>
          )}
        </EmptyState>
      </>
    )
  }

  const change = stats.changePercent
  const changeText =
    change === null
      ? null
      : change === 0
        ? t('stats.changeSame')
        : change > 0
          ? t('stats.changeUp', { pct: num(change) })
          : t('stats.changeDown', { pct: num(-change) })

  const monthName = formatMonthLabel(month, locale)

  return (
    <>
      <PageHeader title={t('stats.title')} />
      <MonthSwitcher month={month} onChange={setMonth} />

      <div className="space-y-6">
        {/* Chiffre clé + indicateurs */}
        <Card>
          <p className="text-sm font-medium text-muted">{t('stats.total')}</p>
          <p className="font-display mt-1 text-[44px] font-extrabold leading-tight">{money(stats.totalCents)}</p>
          {changeText && (
            <p className="mt-1 text-sm text-muted">
              {change !== 0 && (
                <CategoryIcon
                  name={change! > 0 ? 'arrow_up' : 'arrow_down'}
                  tone="plain"
                  px={14}
                  weight="bold"
                  className="me-1 inline align-[-2px]"
                />
              )}
              {changeText}
            </p>
          )}
          <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4">
            <div>
              <dt className="text-xs font-medium text-muted">{t('stats.perDay')}</dt>
              <dd className="mt-0.5 text-sm font-bold tabular-nums">
                {money(stats.averagePerDayCents)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">{t('stats.count')}</dt>
              <dd className="mt-0.5 text-sm font-bold tabular-nums">{num(stats.count)}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-medium text-muted">{t('stats.topCategory')}</dt>
              <dd className="mt-0.5 truncate text-sm font-bold">{topName}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-bold">{t('stats.byCategory')}</h2>
          <CategoryDonut
            slices={slices}
            totalCents={stats.totalCents}
            categories={categories}
            labelOf={label}
          />
        </Card>

        <Card>
          <h2 className="mb-2 text-base font-bold">{t('stats.curveTitle')}</h2>
          <MonthCurve
            rows={rows}
            daysInMonth={maxDay}
            currentLabel={monthName}
            previousLabel={formatMonthLabel(prevMonth, locale)}
            hasPrevious={hasPrevious}
          />
        </Card>
      </div>
    </>
  )
}
