import type { Category } from './types'

/** Catégories prédéfinies ; les libellés vivent dans i18n (`categories.<key>`). */
export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { key: 'groceries', icon: '🛒', color: '#16a34a', order: 1 },
  { key: 'transport', icon: '🚌', color: '#2563eb', order: 2 },
  { key: 'rent', icon: '🏠', color: '#7c3aed', order: 3 },
  { key: 'phone', icon: '📱', color: '#0891b2', order: 4 },
  { key: 'outings', icon: '🍽️', color: '#ea580c', order: 5 },
  { key: 'utilities', icon: '💡', color: '#ca8a04', order: 6 },
  { key: 'health', icon: '💊', color: '#dc2626', order: 7 },
  { key: 'education', icon: '🎓', color: '#4f46e5', order: 8 },
  { key: 'clothing', icon: '👕', color: '#db2777', order: 9 },
  { key: 'family', icon: '👨‍👩‍👧', color: '#0d9488', order: 10 },
  { key: 'other', icon: '📦', color: '#64748b', order: 11 },
]
