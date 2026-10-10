import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Field, Sheet } from '../../components/ui'
import { useToast } from '../../app/toast'
import { centsToInput, parseMAD } from '../../domain/money'
import { setMonthlyIncome } from './actions'

interface IncomeSheetProps {
  open: boolean
  onClose: () => void
  month: string
  /** Revenu actuel en centimes, `null` s'il n'est pas défini. */
  currentCents: number | null
}

export function IncomeSheet({ open, onClose, month, currentCents }: IncomeSheetProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const ref = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (!open) return
    setValue(currentCents ? centsToInput(currentCents) : '')
    setError(undefined)
    const raf = requestAnimationFrame(() => ref.current?.focus())
    return () => cancelAnimationFrame(raf)
  }, [open, currentCents])

  async function save() {
    const cents = value.trim() === '' ? 0 : parseMAD(value)
    if (!Number.isFinite(cents) || cents < 0) {
      setError(t('income.error'))
      return
    }
    await setMonthlyIncome(month, cents)
    onClose()
    toast.show(t('income.saved'))
  }

  return (
    <Sheet open={open} onClose={onClose} title={t('income.title')}>
      <div className="space-y-4">
        <Field
          inputRef={ref}
          label={t('income.label')}
          hint={t('income.hint')}
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
        <Button size="lg" block onClick={() => void save()}>
          {t('common.save')}
        </Button>
      </div>
    </Sheet>
  )
}
