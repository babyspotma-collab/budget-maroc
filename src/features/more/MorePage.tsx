import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePrefs } from '../../app/prefs'
import type { Lang, Numerals } from '../../domain/money'
import { Card, PageHeader } from '../../components/ui'

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex rounded-xl border border-sand-strong bg-surface p-1"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-10 flex-1 rounded-lg px-3 text-sm font-medium transition-colors ${
            value === o.value ? 'bg-terracotta-500 text-white' : 'text-ink hover:bg-sand/50'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function MorePage() {
  const { t } = useTranslation()
  const { lang, setLang, numerals, setNumerals, money } = usePrefs()

  return (
    <>
      <PageHeader title={t('more.title')} />
      <div className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted">{t('more.language')}</h2>
          <Segmented<Lang>
            label={t('more.language')}
            value={lang}
            onChange={setLang}
            options={[
              { value: 'fr', label: 'Français' },
              { value: 'ar', label: 'العربية' },
            ]}
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted">{t('more.numerals')}</h2>
          <Segmented<Numerals>
            label={t('more.numerals')}
            value={numerals}
            onChange={setNumerals}
            options={[
              { value: 'latn', label: t('more.numeralsLatn') },
              { value: 'arab', label: t('more.numeralsArab') },
            ]}
          />
        </div>

        <Card tone="accent">
          <p className="text-sm text-muted">{t('more.preview')}</p>
          <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{money(123450)}</p>
        </Card>

        {import.meta.env.DEV && (
          <Link to="/ui" className="block text-sm font-medium text-majorelle-600 underline">
            Kit UI (dev)
          </Link>
        )}
      </div>
    </>
  )
}
