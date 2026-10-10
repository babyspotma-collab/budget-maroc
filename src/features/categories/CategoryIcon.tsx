import type { Category } from '../../db/types'

const SIZES = {
  sm: 'size-9 text-lg rounded-xl',
  md: 'size-11 text-xl rounded-2xl',
  lg: 'size-14 text-3xl rounded-2xl',
} as const

interface CategoryIconProps {
  category: Pick<Category, 'icon' | 'color'> | undefined
  size?: keyof typeof SIZES
}

/** Pastille teintée à la couleur de la catégorie. */
export function CategoryIcon({ category, size = 'md' }: CategoryIconProps) {
  const color = category?.color ?? '#64748b'
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center ${SIZES[size]}`}
      style={{ backgroundColor: `${color}26`, boxShadow: `inset 0 0 0 1.5px ${color}55` }}
    >
      {category?.icon ?? '📦'}
    </span>
  )
}
