import type { Category } from './types'

/** Catégories prédéfinies ; les libellés vivent dans i18n (`categories.<key>`). */
export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { key: 'groceries', icon: '🛒', color: '#3c9d6f', order: 1 },
  { key: 'transport', icon: '🚌', color: '#3b82c4', order: 2 },
  { key: 'rent', icon: '🏠', color: '#7c6bc4', order: 3 },
  { key: 'phone', icon: '📱', color: '#1aa5b8', order: 4 },
  { key: 'outings', icon: '🍽️', color: '#e8833a', order: 5 },
  { key: 'utilities', icon: '💡', color: '#d9a441', order: 6 },
  { key: 'health', icon: '💊', color: '#d9534f', order: 7 },
  { key: 'education', icon: '🎓', color: '#5b6fd6', order: 8 },
  { key: 'clothing', icon: '👕', color: '#d6578f', order: 9 },
  { key: 'family', icon: '👨‍👩‍👧', color: '#1f9e8f', order: 10 },
  { key: 'other', icon: '📦', color: '#7c8a84', order: 11 },
]
