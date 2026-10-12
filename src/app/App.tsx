import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PrefsProvider } from './prefs'
import { ToastProvider } from './toast'
import { AppShell } from './layout/AppShell'
import { HomePage } from '../features/home/HomePage'
import { BudgetsPage } from '../features/budgets/BudgetsPage'
import { MorePage } from '../features/more/MorePage'
import { ExpensesPage } from '../features/expenses/ExpensesPage'
import { CategoriesPage } from '../features/categories/CategoriesPage'

// Pages chargées à la demande : les graphiques (Recharts) et le questionnaire n'alourdissent
// pas le premier affichage. Le service worker les précache pour l'usage hors ligne.
const StatsPage = lazy(() =>
  import('../features/stats/StatsPage').then((m) => ({ default: m.StatsPage })),
)
const OnboardingPage = lazy(() =>
  import('../features/onboarding/OnboardingPage').then((m) => ({ default: m.OnboardingPage })),
)
const ProgramPage = lazy(() =>
  import('../features/program/ProgramPage').then((m) => ({ default: m.ProgramPage })),
)

// Chargé uniquement en dev ; retiré du bundle de production.
const UiKitPage = import.meta.env.DEV
  ? lazy(() => import('../features/dev/UiKitPage').then((m) => ({ default: m.UiKitPage })))
  : null

export function App() {
  return (
    <PrefsProvider>
      <ToastProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Suspense fallback={null}>
            <Routes>
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route element={<AppShell />}>
                <Route index element={<HomePage />} />
                <Route path="budgets" element={<BudgetsPage />} />
                <Route path="stats" element={<StatsPage />} />
                <Route path="more" element={<MorePage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="programme" element={<ProgramPage />} />
                {UiKitPage && <Route path="ui" element={<UiKitPage />} />}
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </PrefsProvider>
  )
}
