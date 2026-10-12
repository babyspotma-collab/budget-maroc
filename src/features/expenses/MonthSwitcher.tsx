import { useTranslation } from 'react-i18next'
import { usePrefs } from '../../app/prefs'
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/ui/icons'
import { addMonths, currentMonth, formatMonthLabel } from '../../domain/dates'

interface MonthSwitcherProps {
  month: string
  onChange: (month: string) => void
}

/** « ‹ octobre 2026 › » ; le mois suivant est bloqué sur le mois courant. */
export function MonthSwitcher({ month, onChange }: MonthSwitcherProps) {
  const { t } = useTranslation()
  const { locale } = usePrefs()
  const isCurrent = month >= currentMonth()

  return (
    <div className="mb-5 flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={t('expenses.prev')}
        onClick={() => onChange(addMonths(month, -1))}
        className="flex size-10 items-center justify-center rounded-full text-ink hover:bg-surface"
      >
        <ChevronLeftIcon />
      </button>
      <p className="min-w-36 text-center text-base font-bold first-letter:uppercase">
        {formatMonthLabel(month, locale)}
      </p>
      <button
        type="button"
        aria-label={t('expenses.next')}
        disabled={isCurrent}
        onClick={() => onChange(addMonths(month, 1))}
        className="flex size-10 items-center justify-center rounded-full text-ink hover:bg-surface disabled:opacity-30"
      >
        <ChevronRightIcon />
      </button>
    </div>
  )
}
