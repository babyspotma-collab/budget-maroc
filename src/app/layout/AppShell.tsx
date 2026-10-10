import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BottomNav } from './BottomNav'

export function AppShell() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col">
      <main className="flex-1 px-4 pb-28 pt-6">
        <Outlet />
      </main>

      {/* Le FAB d'ajout rapide sera branché à l'étape 2. */}
      <button
        type="button"
        aria-label={t('nav.add')}
        className="fixed bottom-16 end-1/2 z-30 translate-x-1/2 rounded-full bg-brand-700 px-5 py-3 text-2xl leading-none text-white shadow-lg rtl:-translate-x-1/2"
      >
        +
      </button>

      <BottomNav />
    </div>
  )
}
