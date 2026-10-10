import { useTranslation } from 'react-i18next'
import { usePrefs } from '../../app/prefs'
import type { Category, Expense } from '../../db/types'
import { formatDayShort, relativeDay, todayISO } from '../../domain/dates'
import { CategoryIcon } from '../categories/CategoryIcon'
import { useCategoryLabel } from '../categories/hooks'

interface ExpenseRowProps {
  expense: Expense
  category: Category | undefined
  onClick?: () => void
  /** Affiche la date (accueil) ; masquée dans les listes groupées par jour. */
  showDate?: boolean
}

export function ExpenseRow({ expense, category, onClick, showDate }: ExpenseRowProps) {
  const { t } = useTranslation()
  const { money, locale } = usePrefs()
  const label = useCategoryLabel()
  const name = label(category)

  const rel = showDate ? relativeDay(expense.date, todayISO()) : null
  const dateText = showDate
    ? rel
      ? t(`expenses.${rel}`)
      : formatDayShort(expense.date, locale)
    : null
  const title = expense.note || name
  const subtitle = [expense.note ? name : null, dateText].filter(Boolean).join(' · ')

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl p-2 text-start transition-colors hover:bg-sand/40 active:bg-sand/60"
    >
      <CategoryIcon category={category} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{title}</span>
        {subtitle && <span className="block truncate text-xs text-muted">{subtitle}</span>}
      </span>
      <span className="shrink-0 font-semibold tabular-nums">{money(expense.amountCents)}</span>
    </button>
  )
}
