import type { IconWeight } from '@phosphor-icons/react'
import { CategoryIcon, type IconName } from './CategoryIcon'

/**
 * Petites icônes d'interface (sans badge) : toutes passent par <CategoryIcon tone="plain" />.
 * Les icônes directionnelles (chevrons) s'inversent d'elles-mêmes en RTL.
 */
interface GlyphProps {
  width?: number
  className?: string
  weight?: IconWeight
}

function glyph(name: IconName, defaultWeight?: IconWeight) {
  return function Glyph({ width = 24, className, weight }: GlyphProps) {
    return (
      <CategoryIcon
        name={name}
        tone="plain"
        px={width}
        className={className}
        weight={weight ?? defaultWeight}
      />
    )
  }
}

export const HomeIcon = glyph('nav_home')
export const TargetIcon = glyph('nav_budgets')
export const ChartIcon = glyph('nav_stats')
export const MenuIcon = glyph('nav_more')
export const ChevronLeftIcon = glyph('chevron_left', 'bold')
export const ChevronRightIcon = glyph('chevron_right', 'bold')
export const PlusIcon = glyph('plus', 'bold')
export const PencilIcon = glyph('edit')
export const EyeIcon = glyph('show')
export const EyeOffIcon = glyph('hide')
export const CheckIcon = glyph('check', 'bold')
export const CloseIcon = glyph('close', 'bold')
