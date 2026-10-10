import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BottomNav } from './BottomNav'
import { Sheet } from '../../components/ui'

export function AppShell() {
  const { t } = useTranslation()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <main className="flex-1 px-4 pb-28 pt-6">
        <Outlet />
      </main>

      <BottomNav onAdd={() => setAddOpen(true)} />

      {/* Le formulaire d'ajout rapide arrive à l'étape 2. */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title={t('add.title')}>
        <p className="text-muted">{t('add.soon')}</p>
      </Sheet>
    </div>
  )
}
