import { useTranslation } from 'react-i18next'
import { Card, PageHeader } from '../../components/ui'

export function BudgetsPage() {
  const { t } = useTranslation()
  return (
    <>
      <PageHeader title={t('budgets.title')} />
      <Card>
        <p className="text-muted">{t('budgets.placeholder')}</p>
      </Card>
    </>
  )
}
