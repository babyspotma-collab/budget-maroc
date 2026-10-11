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
        `flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium transition-colors ${
          isActive ? 'bg-white/10 text-gold-300' : 'text-white/70'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

/** Barre sombre flottante, détachée des bords de l'écran. */
export function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav
      aria-label={t('nav.label')}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
    >
      <div className="pointer-events-auto mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[1.75rem] bg-ink p-1.5 shadow-[0_18px_30px_-14px_rgb(16_35_28/0.55)]">
        {TABS.map((i) => (
          <Tab key={i.to} to={i.to} label={t(`nav.${i.key}`)} icon={i.icon} end={i.end} />
        ))}
      </div>
    </nav>
  )
}
