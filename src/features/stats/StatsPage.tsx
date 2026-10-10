import { useTranslation } from 'react-i18next'
import { Card, PageHeader } from '../../components/ui'

export function StatsPage() {
  const { t } = useTranslation()
  return (
    <>
      <PageHeader title={t('stats.title')} />
      <Card>
        <p className="text-muted">{t('stats.placeholder')}</p>
      </Card>
    </>
  )
}
