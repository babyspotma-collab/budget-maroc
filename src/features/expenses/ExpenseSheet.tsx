import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Field, Sheet } from '../../components/ui'
import { useToast } from '../../app/toast'
import type { Expense } from '../../db/types'
import { sortByRecentUse } from '../../domain/categories'
import { isValidISODate, todayISO } from '../../domain/dates'
import { centsToInput, parseMAD } from '../../domain/money'
import { CategoryIcon } from '../categories/CategoryIcon'
import { useCategories, useCategoryLabel } from '../categories/hooks'
import { addExpense, deleteExpense, restoreExpense, updateExpense } from './actions'
import { useRecentExpenses } from './hooks'

interface ExpenseSheetProps {
  open: boolean
  onClose: () => void
  /** Présent = modification ; absent = ajout rapide. */
  expense?: Expense
}

/**
 * Ajout : le montant d'abord, puis un clic sur la catégorie enregistre (2 clics).
 * Modification : on ajuste les champs puis « Enregistrer ».
 */
export function ExpenseSheet({ open, onClose, expense }: ExpenseSheetProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const label = useCategoryLabel()
  const categories = useCategories()
  const recent = useRecentExpenses(30)
  const amountRef = useRef<HTMLInputElement>(null)

  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [more, setMore] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const editing = expense !== undefined

  useEffect(() => {
    if (!open) return
    setAmount(expense ? centsToInput(expense.amountCents) : '')
    setCategoryId(expense?.categoryId ?? null)
    setDate(expense?.date ?? todayISO())
    setNote(expense?.note ?? '')
    setMore(Boolean(expense?.note))
    setError(undefined)
    const raf = requestAnimationFrame(() => amountRef.current?.focus())
    return () => cancelAnimationFrame(raf)
  }, [open, expense])

  const choices = useMemo(() => {
    const visible = (categories ?? []).filter((c) => !c.hidden || c.id === expense?.categoryId)
    return editing ? visible : sortByRecentUse(visible, recent ?? [])
  }, [categories, recent, editing, expense?.categoryId])

  function readAmount(): number | null {
    const cents = parseMAD(amount)
    if (!Number.isFinite(cents) || cents <= 0) {
      setError(t('add.errorAmount'))
      amountRef.current?.focus()
      return null
    }
    return cents
  }

  async function saveNew(chosenCategory: number) {
    const cents = readAmount()
    if (cents === null) return
    const id = await addExpense({
      amountCents: cents,
      categoryId: chosenCategory,
      date: isValidISODate(date) ? date : todayISO(),
      note: note.trim() || undefined,
    })
    onClose()
    toast.show(t('add.saved'), {
      actionLabel: t('common.undo'),
      onAction: () => void deleteExpense(id),
    })
  }

  async function saveEdit() {
    const cents = readAmount()
    if (cents === null || expense?.id === undefined || categoryId === null) return
    await updateExpense(expense.id, {
      amountCents: cents,
      categoryId,
      date: isValidISODate(date) ? date : expense.date,
      note: note.trim() || undefined,
    })
    onClose()
    toast.show(t('add.updated'))
  }

  async function remove() {
    if (expense?.id === undefined) return
    const deleted = await deleteExpense(expense.id)
    onClose()
    if (deleted) {
      toast.show(t('add.deleted'), {
        actionLabel: t('common.undo'),
        onAction: () => void restoreExpense(deleted),
      })
    }
  }

  function pick(id: number) {
    if (editing) setCategoryId(id)
    else void saveNew(id)
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? t('add.editTitle') : t('add.title')}
    >
      <div className="space-y-4">
        <Field
          inputRef={amountRef}
          label={t('add.amount')}
          amount
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          suffix="MAD"
          value={amount}
          error={error}
          onChange={(e) => {
            setAmount(e.target.value)
            if (error) setError(undefined)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && editing) void saveEdit()
          }}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-muted">
            {editing ? t('add.pickEdit') : t('add.pick')}
          </p>
          <div role="group" aria-label={t('add.pickEdit')} className="grid grid-cols-4 gap-2">
            {choices.map((c) => {
              const selected = editing && c.id === categoryId
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pick(c.id!)}
                  aria-pressed={editing ? selected : undefined}
                  className={`flex min-h-[4.75rem] flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-2 text-[11px] leading-tight transition-colors active:scale-95 ${
                    selected
                      ? 'border-terracotta-500 bg-terracotta-50 font-semibold'
                      : 'border-sand bg-surface hover:border-sand-strong'
                  }`}
                >
                  <CategoryIcon category={c} size="sm" />
                  <span className="line-clamp-2 break-words">{label(c)}</span>
                </button>
              )
            })}
          </div>
        </div>

        {more ? (
          <div className="grid grid-cols-2 gap-3">
            <Field
              label={t('add.date')}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Field
              label={t('add.note')}
              placeholder={t('add.notePlaceholder')}
              value={note}
              maxLength={80}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setMore(true)}
            className="text-sm font-medium text-majorelle-600 underline underline-offset-2"
          >
            {t('add.more')}
          </button>
        )}

        {editing && (
          <div className="flex gap-2 pt-1">
            <Button variant="danger" onClick={() => void remove()}>
              {t('common.delete')}
            </Button>
            <Button
              size="lg"
              className="flex-1"
              disabled={categoryId === null}
              onClick={() => void saveEdit()}
            >
              {t('common.save')}
            </Button>
          </div>
        )}
      </div>
    </Sheet>
  )
}
