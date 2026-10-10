import { db } from '../../db/database'
import type { Category } from '../../db/types'
import { nextCategoryOrder } from '../../domain/categories'

export interface CategoryInput {
  name?: string
  icon: string
  color: string
}

export async function addCategory(input: Required<CategoryInput>): Promise<number> {
  const all = await db.categories.toArray()
  return (await db.categories.add({ ...input, order: nextCategoryOrder(all) })) as number
}

export async function updateCategory(
  id: number,
  changes: Partial<Pick<Category, 'name' | 'icon' | 'color'>>,
): Promise<void> {
  await db.categories.update(id, changes)
}

export async function setCategoryHidden(id: number, hidden: boolean): Promise<void> {
  await db.categories.update(id, { hidden })
}
