import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, PageHeader } from '../../components/ui'
import { EyeIcon, EyeOffIcon, PencilIcon } from '../../components/ui/icons'
import type { Category } from '../../db/types'
import { setCategoryHidden } from './actions'
import { CategoryIcon } from './CategoryIcon'
import { CategorySheet } from './CategorySheet'
import { useCategories, useCategoryLabel } from './hooks'

export function CategoriesPage() {
  const { t } = useTranslation()
  const label = useCategoryLabel()
  const categories = useCategories()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Category | undefined>()

  const visible = (categories ?? []).filter((c) => !c.hidden)
  const hidden = (categories ?? []).filter((c) => c.hidden)

  function open(category?: Category) {
    setEditing(category)
    setSheetOpen(true)
  }

  function row(c: Category) {
    return (
      <li key={c.id} className="flex items-center gap-3 p-2">
        <CategoryIcon category={c} />
        <span className="min-w-0 flex-1 truncate font-medium">{label(c)}</span>
        <button
          type="button"
          aria-label={`${t('common.edit')} ${label(c)}`}
          onClick={() => open(c)}
          className="flex size-11 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-sand/50"
        >
          <PencilIcon />
        </button>
        <button
          type="button"
          aria-label={`${c.hidden ? t('categories.show') : t('categories.hide')} ${label(c)}`}
          onClick={() => void setCategoryHidden(c.id!, !c.hidden)}
          className="flex size-11 shrink-0 items-center justify-center rounded-xl text-majorelle-600 hover:bg-majorelle-50"
        >
          {c.hidden ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      </li>
    )
  }

  return (
    <>
      <PageHeader
        title={t('categories.title')}
        action={<Button onClick={() => open()}>{t('categories.addShort')}</Button>}
      />

      <div className="space-y-5">
        <Card className="p-1.5">
          <ul className="divide-y divide-sand/70">{visible.map(row)}</ul>
        </Card>

        {hidden.length > 0 && (
          <section>
            <h2 className="px-1 text-sm font-semibold text-muted">{t('categories.hidden')}</h2>
            <p className="mb-2 px-1 text-xs text-muted">{t('categories.hiddenHint')}</p>
            <Card className="p-1.5 opacity-80">
              <ul className="divide-y divide-sand/70">{hidden.map(row)}</ul>
            </Card>
          </section>
        )}
      </div>

      <CategorySheet open={sheetOpen} onClose={() => setSheetOpen(false)} category={editing} />
    </>
  )
}
