import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Fab } from '../../components/ui'
import { ChartIcon, HomeIcon, MenuIcon, TargetIcon } from '../../components/ui/icons'

const LEFT = [
  { to: '/', key: 'home', icon: <HomeIcon />, end: true },
  { to: '/budgets', key: 'budgets', icon: <TargetIcon />, end: false },
] as const
const RIGHT = [
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
        `relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] ${
          isActive ? 'font-semibold text-terracotta-600' : 'text-muted'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              aria-hidden
              className="absolute top-0 h-0.5 w-8 rounded-b-full bg-terracotta-500"
            />
          )}
          {icon}
          {label}
        </>
      )}
    </NavLink>
  )
}

export function BottomNav({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation()
  return (
    <nav
      aria-label={t('nav.label')}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-sand bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 items-center">
        {LEFT.map((i) => (
          <Tab key={i.to} to={i.to} label={t(`nav.${i.key}`)} icon={i.icon} end={i.end} />
        ))}
        <div className="flex justify-center">
          <Fab onClick={onAdd} aria-label={t('nav.add')} className="-mt-7" />
        </div>
        {RIGHT.map((i) => (
          <Tab key={i.to} to={i.to} label={t(`nav.${i.key}`)} icon={i.icon} end={i.end} />
        ))}
      </div>
    </nav>
  )
}
