import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const ITEMS = [
  { to: '/', key: 'home', icon: '🏠', end: true },
  { to: '/budgets', key: 'budgets', icon: '🎯', end: false },
  { to: '/stats', key: 'stats', icon: '📊', end: false },
  { to: '/more', key: 'more', icon: '☰', end: false },
] as const

export function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {ITEMS.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-xs ${
                  isActive ? 'font-semibold text-brand-700' : 'text-slate-500'
                }`
              }
            >
              <span aria-hidden className="text-xl leading-none">
                {item.icon}
              </span>
              {t(`nav.${item.key}`)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
