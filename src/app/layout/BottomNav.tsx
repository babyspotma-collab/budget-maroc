import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CategoryIcon, type IconName } from '../../components/ui/CategoryIcon'

const TABS: { to: string; key: string; icon: IconName; end: boolean }[] = [
  { to: '/', key: 'home', icon: 'nav_home', end: true },
  { to: '/budgets', key: 'budgets', icon: 'nav_budgets', end: false },
  { to: '/stats', key: 'stats', icon: 'nav_stats', end: false },
  { to: '/more', key: 'more', icon: 'nav_more', end: false },
]

/**
 * Barre claire collée au bas de l'écran (zone sûre de l'iPhone comprise) :
 * onglet actif en bleu, avec un petit point ocre.
 */
export function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav
      aria-label={t('nav.label')}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors duration-200 ${
                isActive ? 'text-brand-500' : 'text-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <CategoryIcon
                  name={tab.icon}
                  tone="plain"
                  px={26}
                  weight={isActive ? 'fill' : 'duotone'}
                />
                {t(`nav.${tab.key}`)}
                <span
                  aria-hidden
                  className={`absolute bottom-1.5 size-1 rounded-full bg-gold-500 transition-opacity duration-200 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}