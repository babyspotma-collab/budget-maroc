import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePrefs } from '../../app/prefs'
import { AMOUNT_RANGES, applyKey, formatTyped, rangeValue, type AmountKey, type Range } from './draft'
import { NumPad } from './NumPad'

interface AmountField {
  key: AmountKey
  label: string
}

interface AmountScreenProps {
  fields: AmountField[]
  values: Record<AmountKey, string>
  onChange: (key: AmountKey, value: string) => void
  error?: string
}

/**
 * Saisie de montants avec grand clavier numérique. Un seul champ : gros affichage.
 * Plusieurs champs : on touche une ligne puis on tape. « Je ne sais pas exactement »
 * propose des fourchettes pour le champ actif.
 */
export function AmountScreen({ fields, values, onChange, error }: AmountScreenProps) {
  const { t } = useTranslation()
  const { money } = usePrefs()
  const [active, setActive] = useState<AmountKey>(fields[0].key)
  const [ranges, setRanges] = useState(false)
  const single = fields.length === 1

  const rangeLabel = (r: Range) =>
    r.max === null
      ? t('onboarding.ranges.above', { min: money(r.min * 100) })
      : r.min === 0
        ? t('onboarding.ranges.below', { max: money(r.max * 100) })
        : t('onboarding.ranges.between', { min: money(r.min * 100), max: money(r.max * 100) })

  return (
    <div className="flex flex-col gap-4">
      {single ? (
        <div
          className={`flex items-baseline justify-center gap-2 rounded-(--radius-card) bg-surface py-6 shadow-(--shadow-card) ${
            error ? 'ring-2 ring-danger-600' : ''
          }`}
        >
          <span className="font-display min-h-12 text-[44px] font-extrabold tabular-nums" dir="ltr">
            {formatTyped(values[fields[0].key]) || (
              <span className="text-line-strong">0</span>
            )}
          </span>
          <span className="text-lg font-bold text-muted">MAD</span>
        </div>
      ) : (
        <ul className="space-y-2">
          {fields.map((f) => {
            const selected = f.key === active
            const text = formatTyped(values[f.key])
            return (
              <li key={f.key}>
                <button
                  type="button"
                  onClick={() => {
                    setActive(f.key)
                    setRanges(false)
                  }}
                  aria-pressed={selected}
                  className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border-2 bg-surface px-4 text-start transition-colors duration-200 ${
                    selected ? 'border-brand-500' : 'border-transparent shadow-(--shadow-card)'
                  }`}
                >
                  <span className="min-w-0 text-sm font-medium">{f.label}</span>
                  <span
                    dir="ltr"
                    className={`shrink-0 text-lg font-bold tabular-nums ${text ? '' : 'text-line-strong'}`}
                  >
                    {text || '0'} <span className="text-xs font-semibold text-muted">MAD</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-center text-sm font-medium text-danger-600">
          {error}
        </p>
      )}

      {ranges ? (
        <ul className="space-y-2" aria-label={t('onboarding.unsure')}>
          {AMOUNT_RANGES[active].map((r) => (
            <li key={`${r.min}-${r.max}`}>
              <button
                type="button"
                onClick={() => {
                  onChange(active, String(rangeValue(r)))
                  setRanges(false)
                }}
                className="min-h-12 w-full rounded-2xl bg-surface px-4 text-start font-semibold shadow-(--shadow-card) transition-transform duration-150 active:scale-[0.98]"
              >
                {rangeLabel(r)}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <NumPad onKey={(k) => onChange(active, applyKey(values[active], k))} />
      )}

      <button
        type="button"
        onClick={() => setRanges((v) => !v)}
        className="mx-auto min-h-11 px-3 text-sm font-semibold text-accent-600 underline underline-offset-2"
      >
        {ranges ? t('onboarding.useKeypad') : t('onboarding.unsure')}
      </button>
    </div>
  )
}
