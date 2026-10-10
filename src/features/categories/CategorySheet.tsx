import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Field, Sheet } from '../../components/ui'
import { useToast } from '../../app/toast'
import type { Category } from '../../db/types'
import { CATEGORY_COLORS, CATEGORY_EMOJIS } from '../../domain/categories'
import { addCategory, updateCategory } from './actions'
import { CategoryIcon } from './CategoryIcon'
import { useCategoryLabel } from './hooks'

interface CategorySheetProps {
  open: boolean
  onClose: () => void
  /** Présent = modification ; absent = nouvelle catégorie. */
  category?: Category
}

export function CategorySheet({ open, onClose, category }: CategorySheetProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const label = useCategoryLabel()

  const [name, setName] = useState('')
  const [icon, setIcon] = useState(CATEGORY_EMOJIS[0])
  const [color, setColor] = useState(CATEGORY_COLORS[0])
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (!open) return
    setName(category ? label(category) : '')
    setIcon(category?.icon ?? CATEGORY_EMOJIS[10])
    setColor(category?.color ?? CATEGORY_COLORS[0])
    setError(undefined)
    // `label` dépend de la langue : on ne réinitialise que lorsque la feuille s'ouvre.
  }, [open, category]) // eslint-disable-line

  async function save() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError(t('categories.nameRequired'))
      return
    }
    if (category?.id !== undefined) {
      // Nom inchangé sur une catégorie prédéfinie : on garde la traduction par clé.
      const keepKey = category.key !== undefined && trimmed === label(category)
      await updateCategory(category.id, {
        name: keepKey ? category.name : trimmed,
        icon,
        color,
      })
    } else {
      await addCategory({ name: trimmed, icon, color })
    }
    onClose()
    toast.show(t('categories.saved'))
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={category ? t('categories.edit') : t('categories.add')}
    >
      <div className="space-y-5">
        <div className="flex items-end gap-3">
          <CategoryIcon category={{ icon, color }} size="lg" />
          <Field
            className="min-w-0 flex-1"
            label={t('categories.name')}
            value={name}
            maxLength={30}
            error={error}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError(undefined)
            }}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted">{t('categories.icon')}</p>
          <div role="radiogroup" aria-label={t('categories.icon')} className="grid grid-cols-8 gap-1.5">
            {CATEGORY_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                role="radio"
                aria-checked={icon === e}
                onClick={() => setIcon(e)}
                className={`flex aspect-square items-center justify-center rounded-xl text-xl ${
                  icon === e ? 'bg-brand-50 ring-2 ring-brand-500' : 'bg-surface'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted">{t('categories.color')}</p>
          <div role="radiogroup" aria-label={t('categories.color')} className="flex flex-wrap gap-2.5">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={color === c}
                aria-label={c}
                onClick={() => setColor(c)}
                className={`size-9 rounded-full ${
                  color === c ? 'ring-2 ring-ink ring-offset-2 ring-offset-canvas' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <Button size="lg" block onClick={() => void save()}>
          {t('common.save')}
        </Button>
      </div>
    </Sheet>
  )
}
