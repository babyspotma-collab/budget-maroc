import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { useCallback, useMemo } from 'react'
import { db } from '../../db/database'
import type { Category } from '../../db/types'

/** Toutes les catégories (masquées incluses), triées par `order`. */
export function useCategories(): Category[] | undefined {
  return useLiveQuery(() => db.categories.orderBy('order').toArray(), [])
}

export function useCategoryMap(): Map<number, Category> {
  const all = useCategories()
  return useMemo(() => new Map((all ?? []).map((c) => [c.id!, c])), [all])
}

/** Nom affiché : nom personnalisé, sinon traduction de la clé prédéfinie. */
export function useCategoryLabel() {
  const { t } = useTranslation()
  return useCallback(
    (c: Category | undefined) =>
      c ? (c.name ?? (c.key ? t(`categories.${c.key}`) : '')) : t('categories.other'),
    [t],
  )
}
