import { useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { QuickAddContext } from '../quickAdd'
import { ExpenseSheet } from '../../features/expenses/ExpenseSheet'

export function AppShell() {
  const [addOpen, setAddOpen] = useState(false)
  const quickAdd = useMemo(() => ({ openAdd: () => setAddOpen(true) }), [])

  return (
    <QuickAddContext.Provider value={quickAdd}>
      <div className="mx-auto flex min-h-dvh max-w-md flex-col">
        <main className="flex-1 px-4 pb-28 pt-6">
          <Outlet />
        </main>

        <BottomNav onAdd={quickAdd.openAdd} />
        <ExpenseSheet open={addOpen} onClose={() => setAddOpen(false)} />
      </div>
    </QuickAddContext.Provider>
  )
}
