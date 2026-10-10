import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { db } from '../../db/database'
import { Card, PageHeader } from '../../components/ui'

export function HomePage() {
  const { t } = useTranslation()
  const categoryCount = useLiveQuery(() => db.categories.count(), [])

  return (
    <>
      <PageHeader title={t('home.title')} />
      <div className="space-y-3">
        <Card tone="accent">
          <p className="text-muted">{t('home.placeholder')}</p>
        </Card>
        {categoryCount !== undefined && (
          <p className="inline-block rounded-full bg-mint-50 px-3 py-1 text-sm font-medium text-mint-600">
            {t('home.categoriesLoaded', { count: categoryCount })}
          </p>
        )}
      </div>
    </>
  )
}
