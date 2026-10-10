import { useTranslation } from 'react-i18next'

export function BudgetsPage() {
  const { t } = useTranslation()
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold">{t('budgets.title')}</h1>
      <p className="text-slate-600">{t('budgets.placeholder')}</p>
    </section>
  )
}
