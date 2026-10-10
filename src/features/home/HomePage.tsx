import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { db } from '../../db/database'

export function HomePage() {
  const { t } = useTranslation()
  const categoryCount = useLiveQuery(() => db.categories.count(), [])

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold">{t('home.title')}</h1>
      <p className="text-slate-600">{t('home.placeholder')}</p>
      {categoryCount !== undefined && (
        <p className="inline-block rounded-full bg-brand-100 px-3 py-1 text-sm text-brand-700">
          {t('home.categoriesLoaded', { count: categoryCount })}
        </p>
      )}
    </section>
  )
}
