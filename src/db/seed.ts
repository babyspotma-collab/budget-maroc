import type { Category } from './types'

/** Catégories prédéfinies ; les libellés vivent dans i18n (`categories.<key>`). */
export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { key: 'groceries', icon: 'groceries', color: '#3c9d6f', order: 1 },
  { key: 'transport', icon: 'transport', color: '#3b82c4', order: 2 },
  { key: 'rent', icon: 'rent', color: '#7c6bc4', order: 3 },
  { key: 'phone', icon: 'phone', color: '#1aa5b8', order: 4 },
  { key: 'outings', icon: 'outings', color: '#e8833a', order: 5 },
  { key: 'utilities', icon: 'utilities', color: '#d9a441', order: 6 },
  { key: 'health', icon: 'health', color: '#d9534f', order: 7 },
  { key: 'education', icon: 'education', color: '#5b6fd6', order: 8 },
  { key: 'clothing', icon: 'clothing', color: '#d6578f', order: 9 },
  { key: 'family', icon: 'family', color: '#1f9e8f', order: 10 },
  { key: 'other', icon: 'other', color: '#7c8a84', order: 11 },
]
