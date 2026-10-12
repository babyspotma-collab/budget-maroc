import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../app/toast'
import type { Expense } from '../../db/types'
import { deleteExpense, restoreExpense } from './actions'

/** Supprime une dépense sans confirmation : un message « Annuler » reste affiché 5 s. */
export function useDeleteExpense() {
  const { t } = useTranslation()
  const toast = useToast()
  return useCallback(
    async (expense: Expense) => {
      if (expense.id === undefined) return
      const deleted = await deleteExpense(expense.id)
      if (deleted) {
        toast.show(t('add.deleted'), {
          actionLabel: t('common.undo'),
          onAction: () => void restoreExpense(deleted),
        })
      }
    },
    [t, toast],
  )
}
