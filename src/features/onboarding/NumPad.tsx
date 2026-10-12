import { useTranslation } from 'react-i18next'
import { CategoryIcon } from '../../components/ui/CategoryIcon'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'back'] as const

interface NumPadProps {
  onKey: (key: string) => void
}

/** Grand clavier numérique : touches larges, faciles à viser au pouce. */
export function NumPad({ onKey }: NumPadProps) {
  const { t } = useTranslation()
  return (
    <div role="group" aria-label={t('onboarding.keypad')} dir="ltr" className="grid grid-cols-3 gap-2">
      {KEYS.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onKey(k)}
          aria-label={k === 'back' ? t('onboarding.erase') : undefined}
          className="flex min-h-14 items-center justify-center rounded-2xl bg-surface text-2xl font-bold shadow-(--shadow-card) transition-transform duration-150 active:scale-95 active:bg-line"
        >
          {k === 'back' ? <CategoryIcon name="backspace" tone="plain" px={26} /> : k}
        </button>
      ))}
    </div>
  )
}
