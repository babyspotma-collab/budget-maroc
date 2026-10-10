import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Field, Sheet } from '../../components/ui'
import { usePrefs } from '../../app/prefs'
import { useToast } from '../../app/toast'
import type { Category } from '../../db/types'
import { formatMonthLabel } from '../../domain/dates'
import { centsToInput, parseMAD } from '../../domain/money'
import { CategoryIcon } from '../categories/CategoryIcon'
import { useCategoryLabel } from '../categories/hooks'
import { setBudget } from './actions'

interface BudgetSheetProps {
  open: boolean
  onClose: () => void
  category: Category | undefined
  month: string
  /** Plafond actuel en centimes (0 = aucun). */
  currentCents: number
}

export function BudgetSheet({ open, onClose, category, month, currentCents }: BudgetSheetProps) {
  const { t } = useTranslation()
  const { locale } = usePrefs()
  const toast = useToast()
  const label = useCategoryLabel()
  const ref = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (!open) return
    setValue(currentCents > 0 ? centsToInput(currentCents) : '')
    setError(undefined)
    const raf = requestAnimationFrame(() => ref.current?.focus())
    return () => cancelAnimationFrame(raf)
  }, [open, currentCents, category?.id])

  async function save() {
    if (category?.id === undefined) return
    const cents = parseMAD(value)
    if (!Number.isFinite(cents) || cents <= 0) {
      setError(t('budgets.error'))
      return
    }
    await setBudget(category.id, month, cents)
    onClose()
    toast.show(t('budgets.saved'))
  }

  async function remove() {
    if (category?.id === undefined) return
    await setBudget(category.id, month, 0)
    onClose()
    toast.show(t('budgets.removed'))
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={category ? `${t('budgets.sheetTitle')} · ${label(category)}` : t('budgets.sheetTitle')}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <CategoryIcon category={category} size="lg" />
          <p className="text-sm text-muted">
            {t('budgets.applies', { month: formatMonthLabel(month, locale) })}
          </p>
        </div>
        <Field
          inputRef={ref}
          label={t('budgets.amount')}
          amount
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          suffix="MAD"
          value={value}
          error={error}
          onChange={(e) => {
            setValue(e.target.value)
            if (error) setError(undefined)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void save()
          }}
        />
        <div className="flex gap-2">
          {currentCents > 0 && (
            <Button variant="danger" onClick={() => void remove()}>
              {t('budgets.remove')}
            </Button>
          )}
          <Button size="lg" className="flex-1" onClick={() => void save()}>
            {t('common.save')}
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
