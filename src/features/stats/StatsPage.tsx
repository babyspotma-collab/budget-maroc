import { useTranslation } from 'react-i18next'

export function StatsPage() {
  const { t } = useTranslation()
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold">{t('stats.title')}</h1>
      <p className="text-slate-600">{t('stats.placeholder')}</p>
    </section>
  )
}
