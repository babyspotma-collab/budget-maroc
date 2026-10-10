import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChartIcon, HomeIcon, MenuIcon, TargetIcon } from '../../components/ui/icons'

const TABS = [
  { to: '/', key: 'home', icon: <HomeIcon />, end: true },
  { to: '/budgets', key: 'budgets', icon: <TargetIcon />, end: false },
  { to: '/stats', key: 'stats', icon: <ChartIcon />, end: false },
  { to: '/more', key: 'more', icon: <MenuIcon />, end: false },
] as const

function Tab({
  to,
  label,
  icon,
  end,
}: {
  to: string
  label: string
  icon: ReactNode
  end: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
          isActive ? 'text-brand-500' : 'text-muted'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

export function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav
      aria-label={t('nav.label')}
      className="fixed inset-x-0 bottom-0 z-20 rounded-t-3xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-12px_rgb(30_27_58/0.18)]"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map((i) => (
          <Tab key={i.to} to={i.to} label={t(`nav.${i.key}`)} icon={i.icon} end={i.end} />
        ))}
      </div>
    </nav>
  )
}
