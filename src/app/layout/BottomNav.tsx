import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CategoryIcon, type IconName } from '../../components/ui/CategoryIcon'

const TABS: { to: string; key: string; icon: IconName; end: boolean }[] = [
  { to: '/', key: 'home', icon: 'nav_home', end: true },
  { to: '/budgets', key: 'budgets', icon: 'nav_budgets', end: false },
  { to: '/stats', key: 'stats', icon: 'nav_stats', end: false },
  { to: '/more', key: 'more', icon: 'nav_more', end: false },
]

const GOLD = '#e9b949'
const INK = '#10231c'

/** Barre sombre flottante : chaque onglet est un badge en étoile (plein et doré si actif). */
export function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav
      aria-label={t('nav.label')}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
    >
      <div className="pointer-events-auto mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[1.75rem] bg-ink p-1.5 shadow-[0_18px_30px_-14px_rgb(16_35_28/0.55)]">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[1.25rem] text-[11px] font-medium transition-colors ${
                isActive ? 'text-gold-300' : 'text-white/70'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <CategoryIcon
                  name={tab.icon}
                  size="xs"
                  tone={isActive ? 'solid' : 'ghost'}
                  color={isActive ? GOLD : '#ffffff'}
                  iconColor={isActive ? INK : 'rgba(255,255,255,0.85)'}
                />
                {t(`nav.${tab.key}`)}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
