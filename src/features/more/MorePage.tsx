import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePrefs } from '../../app/prefs'
import { useToast } from '../../app/toast'
import type { Lang, Numerals } from '../../domain/money'
import { Button, Card, PageHeader } from '../../components/ui'
import { ChevronRightIcon } from '../../components/ui/icons'
import { clearDemoData, loadDemoData } from '../demo/actions'

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
      className="flex rounded-xl border border-line-strong bg-surface p-1"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-10 flex-1 rounded-lg px-3 text-sm font-medium transition-colors ${
            value === o.value ? 'bg-brand-500 text-white' : 'text-ink hover:bg-line/50'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function MenuLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="flex min-h-14 items-center justify-between px-3 font-medium hover:bg-line/40"
    >
      {children}
      <ChevronRightIcon className="rtl-flip text-muted" />
    </Link>
  )
}

export function MorePage() {
  const { t } = useTranslation()
  const { lang, setLang, numerals, setNumerals, money, num } = usePrefs()
  const toast = useToast()

  return (
    <>
      <PageHeader title={t('more.title')} />
      <div className="space-y-6">
        <Card className="divide-y divide-line/70 overflow-hidden p-0">
          <MenuLink to="/expenses">{t('more.expensesLink')}</MenuLink>
          <MenuLink to="/categories">{t('more.categoriesLink')}</MenuLink>
        </Card>

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
          <p className="text-sm tabular-nums text-muted">
            {t('more.preview')} : <span className="font-semibold text-ink">{money(123450)}</span>
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-medium text-muted">{t('more.dataTitle')}</h2>
          <Card className="space-y-3">
            <p className="text-sm text-muted">{t('more.demoHint')}</p>
            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                block
                onClick={async () => {
                  const n = await loadDemoData()
                  toast.show(t('more.demoLoaded', { count: num(n) }))
                }}
              >
                {t('more.loadDemo')}
              </Button>
              <Button
                variant="danger"
                block
                onClick={async () => {
                  const n = await clearDemoData()
                  toast.show(n > 0 ? t('more.demoCleared', { count: num(n) }) : t('more.demoNone'))
                }}
              >
                {t('more.clearDemo')}
              </Button>
            </div>
          </Card>
        </section>

        {import.meta.env.DEV && (
          <Link to="/ui" className="block text-sm font-medium text-accent-600 underline">
            Kit UI (dev)
          </Link>
        )}
      </div>
    </>
  )
}
