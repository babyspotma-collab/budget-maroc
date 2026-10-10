import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PrefsProvider } from './prefs'
import { ToastProvider } from './toast'
import { ExpensesPage } from '../features/expenses/ExpensesPage'
import { CategoriesPage } from '../features/categories/CategoriesPage'
import { AppShell } from './layout/AppShell'
import { HomePage } from '../features/home/HomePage'
import { BudgetsPage } from '../features/budgets/BudgetsPage'
import { StatsPage } from '../features/stats/StatsPage'
import { MorePage } from '../features/more/MorePage'

// Chargé uniquement en dev ; retiré du bundle de production.
const UiKitPage = import.meta.env.DEV
  ? lazy(() => import('../features/dev/UiKitPage').then((m) => ({ default: m.UiKitPage })))
  : null

export function App() {
  return (
    <PrefsProvider>
      <ToastProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="budgets" element={<BudgetsPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="more" element={<MorePage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            {UiKitPage && (
              <Route
                path="ui"
                element={
                  <Suspense fallback={null}>
                    <UiKitPage />
                  </Suspense>
                }
              />
            )}
          </Route>
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </PrefsProvider>
  )
}
