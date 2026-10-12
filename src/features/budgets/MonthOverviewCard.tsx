import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePrefs } from '../../app/prefs'
import { Card, Donut } from '../../components/ui'
import { remainingCents, spentRatio } from '../../domain/expenses'
import { useMonthIncome } from '../expenses/hooks'
import { IncomeSheet } from '../income/IncomeSheet'

const RING_OK = '#0c7d5e'
const RING_WARN = '#e9b949'
const RING_OVER = '#c2321f'

interface MonthOverviewCardProps {
  month: string
  spentCents: number
}

/** Vue d'ensemble du mois : anneau « reste à vivre », dépensé, revenu (modifiable). */
export function MonthOverviewCard({ month, spentCents }: MonthOverviewCardProps) {
  const { t } = useTranslation()
  const { money, num } = usePrefs()
  const income = useMonthIncome(month)
  const [open, setOpen] = useState(false)

  if (income === undefined) return null

  const incomeCents = income ?? undefined
  const remaining = remainingCents(incomeCents, spentCents)
  const ratio = spentRatio(incomeCents, spentCents)
  const pct = Math.round(ratio * 100)
  const color = ratio >= 1 ? RING_OVER : ratio >= 0.8 ? RING_WARN : RING_OK
  const over = remaining !== undefined && remaining < 0

  return (
    <>
      <Card className="p-5">
        <Donut
          ratio={incomeCents !== undefined ? ratio : 0}
          color={color}
          label={t('home.usedPct', { pct: num(pct) })}
          size={176}
        >
          {remaining !== undefined ? (
            <>
              <span className="text-xs font-medium text-muted">
                {over ? t('home.overspent') : t('home.remaining')}
              </span>
              <span
                className={`mt-1 text-xl font-extrabold tabular-nums ${over ? 'text-danger-600' : ''}`}
              >
                {money(remaining)}
              </span>
              <span className="mt-1 text-xs text-muted">{t('home.usedPct', { pct: num(pct) })}</span>
            </>
          ) : (
            <>
              <span className="text-xs font-medium text-muted">{t('home.spent')}</span>
              <span className="mt-1 text-xl font-extrabold tabular-nums">{money(spentCents)}</span>
            </>
          )}
        </Donut>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
          <div>
            <dt className="flex items-center gap-2 text-xs font-medium text-muted">
              <span aria-hidden className="size-2 rounded-full bg-brand-500" />
              {t('home.spent')}
            </dt>
            <dd className="mt-0.5 font-bold tabular-nums">{money(spentCents)}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-xs font-medium text-muted">
              <span aria-hidden className="size-2 rounded-full bg-gold-500" />
              {t('home.income')}
            </dt>
            <dd className="mt-0.5 flex items-center gap-2 font-bold tabular-nums">
              {incomeCents !== undefined ? money(incomeCents) : '—'}
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="text-xs font-semibold text-accent-600"
              >
                {incomeCents !== undefined ? t('common.edit') : t('home.setIncome')}
              </button>
            </dd>
          </div>
        </dl>
      </Card>

      <IncomeSheet
        open={open}
        onClose={() => setOpen(false)}
        month={month}
        currentCents={income}
      />
    </>
  )
}
