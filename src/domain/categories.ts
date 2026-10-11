import type { Category, Expense } from '../db/types'
import { sortExpenses } from './expenses'

/** Ordre d'affichage : catégories récemment utilisées d'abord, puis le reste par `order`. */
export function sortByRecentUse(categories: Category[], expenses: Expense[]): Category[] {
  const byOrder = [...categories].sort((a, b) => a.order - b.order)
  const rank = new Map<number, number>()
  for (const e of sortExpenses(expenses)) {
    if (!rank.has(e.categoryId)) rank.set(e.categoryId, rank.size)
  }
  const used = byOrder
    .filter((c) => c.id !== undefined && rank.has(c.id))
    .sort((a, b) => rank.get(a.id!)! - rank.get(b.id!)!)
  const unused = byOrder.filter((c) => c.id === undefined || !rank.has(c.id))
  return [...used, ...unused]
}

export function nextCategoryOrder(categories: Category[]): number {
  return categories.reduce((max, c) => Math.max(max, c.order), 0) + 1
}

export const CATEGORY_COLORS = [
  '#0c7d5e',
  '#3c9d6f',
  '#1f9e8f',
  '#1aa5b8',
  '#3b82c4',
  '#5b6fd6',
  '#7c6bc4',
  '#d6578f',
  '#d9534f',
  '#e8833a',
  '#d9a441',
  '#7c8a84',
]

export const CATEGORY_EMOJIS = [
  '🛒', '🚌', '🏠', '📱', '🍽️', '💡', '💊', '🎓',
  '👕', '👨‍👩‍👧', '📦', '☕', '🎬', '✈️', '🎁', '💇',
  '⛽', '🔧', '📚', '🐾', '🕌', '🏋️', '🧾', '💰',
]
