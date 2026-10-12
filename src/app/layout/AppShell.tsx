import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BottomNav } from './BottomNav'
import { QuickAddContext } from '../quickAdd'
import { Fab } from '../../components/ui'
import { ExpenseSheet } from '../../features/expenses/ExpenseSheet'

export function AppShell() {
  const { t } = useTranslation()
  const [addOpen, setAddOpen] = useState(false)
  const { pathname } = useLocation()
  const quickAdd = useMemo(() => ({ openAdd: () => setAddOpen(true) }), [])

  return (
    <QuickAddContext.Provider value={quickAdd}>
      <div className="mx-auto flex min-h-dvh max-w-md flex-col">
        <main key={pathname} className="page-enter flex-1 px-4 pb-36 pt-6">
          <Outlet />
        </main>

        {/* Bouton « + » flottant, du côté de fin (droite en LTR, gauche en RTL) */}
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30">
          <div className="mx-auto flex max-w-md justify-end px-5">
            <Fab
              onClick={quickAdd.openAdd}
              aria-label={t('nav.add')}
              className="pointer-events-auto"
            />
          </div>
        </div>

        <BottomNav />
        <ExpenseSheet open={addOpen} onClose={() => setAddOpen(false)} />
      </div>
    </QuickAddContext.Provider>
  )
}
