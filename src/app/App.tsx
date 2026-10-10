import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PrefsProvider } from './prefs'
import { AppShell } from './layout/AppShell'
import { HomePage } from '../features/home/HomePage'
import { BudgetsPage } from '../features/budgets/BudgetsPage'
import { StatsPage } from '../features/stats/StatsPage'
import { MorePage } from '../features/more/MorePage'

export function App() {
  return (
    <PrefsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="budgets" element={<BudgetsPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="more" element={<MorePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PrefsProvider>
  )
}
