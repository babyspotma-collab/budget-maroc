import type { Category } from '../../db/types'

const SIZES = {
  sm: 'size-9 text-lg',
  md: 'size-11 text-xl',
  lg: 'size-14 text-3xl',
} as const

interface CategoryIconProps {
  category: Pick<Category, 'icon' | 'color'> | undefined
  size?: keyof typeof SIZES
}

/** Pastille ronde : fond blanc cerclé de la couleur de la catégorie, teinte douce. */
export function CategoryIcon({ category, size = 'md' }: CategoryIconProps) {
  const color = category?.color ?? '#64748b'
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full ${SIZES[size]}`}
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 16%, white)`,
        boxShadow: `inset 0 0 0 2px color-mix(in srgb, ${color} 55%, white)`,
      }}
    >
      {category?.icon ?? '📦'}
    </span>
  )
}
