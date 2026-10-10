import { useTranslation } from 'react-i18next'
import { usePrefs } from '../../app/prefs'
import type { Lang, Numerals } from '../../domain/money'

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-white">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-4 py-2 text-sm ${
            value === o.value ? 'bg-brand-700 text-white' : 'text-slate-700'
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
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">{t('more.title')}</h1>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-slate-500">{t('more.language')}</h2>
        <Segmented<Lang>
          value={lang}
          onChange={setLang}
          options={[
            { value: 'fr', label: 'Français' },
            { value: 'ar', label: 'العربية' },
          ]}
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-slate-500">{t('more.numerals')}</h2>
        <Segmented<Numerals>
          value={numerals}
          onChange={setNumerals}
          options={[
            { value: 'latn', label: t('more.numeralsLatn') },
            { value: 'arab', label: t('more.numeralsArab') },
          ]}
        />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">{t('more.preview')}</p>
        <p className="mt-1 text-2xl font-semibold">{money(123450)}</p>
      </div>
    </section>
  )
}
