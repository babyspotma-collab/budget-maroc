/**
 * Composant d'icône unique de l'application : catégories, règles, actions, navigation…
 *
 * Tout passe par ici pour pouvoir changer de style en un seul endroit :
 *  - la famille d'icônes (Phosphor, variante `duotone`) est choisie dans `ICON_WEIGHT` ;
 *  - la forme du badge (étoile à 8 branches, losange arrondi ou cercle) dans `BADGE_SHAPE` ;
 *  - les couleurs par défaut et le sens (icônes directionnelles inversées en RTL) dans `REGISTRY`.
 */
import type { Icon as PhosphorIcon, IconWeight } from '@phosphor-icons/react'
import {
  Airplane,
  ArrowDown,
  ArrowUp,
  Baby,
  Barbell,
  Basket,
  Briefcase,
  Buildings,
  Bus,
  CalendarCheck,
  CalendarDots,
  Car,
  CaretLeft,
  CaretRight,
  ChartBar,
  ChartLineUp,
  Check,
  Coffee,
  Coins,
  CookingPot,
  DeviceMobile,
  Envelope,
  Eye,
  EyeSlash,
  FilmSlate,
  FlagCheckered,
  ForkKnife,
  GasPump,
  Gift,
  GraduationCap,
  HandCoins,
  Handshake,
  HandWaving,
  Heart,
  Hourglass,
  House,
  Laptop,
  Lifebuoy,
  Lightbulb,
  List,
  ListChecks,
  MagnifyingGlass,
  Mosque,
  MoonStars,
  NotePencil,
  Package,
  PawPrint,
  PencilSimple,
  Pill,
  PiggyBank,
  Plus,
  PushPin,
  Receipt,
  Rocket,
  Scales,
  Scissors,
  ShoppingBag,
  ShoppingCart,
  Storefront,
  Target,
  TrendDown,
  TShirt,
  UsersThree,
  Wallet,
  WarningOctagon,
  Waves,
  Wrench,
  X,
  Books,
} from '@phosphor-icons/react'

/** Variante des icônes Phosphor (duotone = deux tons, cohérent avec les badges teintés). */
const ICON_WEIGHT: IconWeight = 'duotone'

export type BadgeShape = 'star' | 'diamond' | 'circle'
/** Forme des badges : change ici pour modifier toute l'application. */
export const BADGE_SHAPE: BadgeShape = 'star'

interface Entry {
  Icon: PhosphorIcon
  /** Couleur par défaut du badge (une catégorie utilise sa propre couleur). */
  color: string
  /** Icône qui indique un sens : inversée automatiquement en RTL. */
  directional?: boolean
}

const EMERALD = '#0c7d5e'
const TEAL = '#0e7490'
const GREEN = '#3c9d6f'
const BLUE = '#3b82c4'
const INDIGO = '#5b6fd6'
const VIOLET = '#7c6bc4'
const PINK = '#d6578f'
const RED = '#c2321f'
const ORANGE = '#e8833a'
const GOLD = '#b8860b'
const SLATE = '#7c8a84'

const REGISTRY = {
  // --- Catégories prédéfinies ------------------------------------------------
  groceries: { Icon: ShoppingCart, color: GREEN },
  transport: { Icon: Bus, color: BLUE },
  rent: { Icon: House, color: VIOLET },
  phone: { Icon: DeviceMobile, color: '#1aa5b8' },
  outings: { Icon: ForkKnife, color: ORANGE },
  utilities: { Icon: Lightbulb, color: '#d9a441' },
  health: { Icon: Pill, color: '#d9534f' },
  education: { Icon: GraduationCap, color: INDIGO },
  clothing: { Icon: TShirt, color: PINK },
  family: { Icon: UsersThree, color: '#1f9e8f' },
  other: { Icon: Package, color: SLATE },
  // --- Icônes supplémentaires pour les catégories personnalisées ---------------
  coffee: { Icon: Coffee, color: '#8a5a2b' },
  film: { Icon: FilmSlate, color: VIOLET },
  plane: { Icon: Airplane, color: BLUE },
  gift: { Icon: Gift, color: PINK },
  scissors: { Icon: Scissors, color: ORANGE },
  fuel: { Icon: GasPump, color: RED },
  wrench: { Icon: Wrench, color: SLATE },
  books: { Icon: Books, color: INDIGO },
  paw: { Icon: PawPrint, color: '#8a5a2b' },
  mosque: { Icon: Mosque, color: EMERALD },
  barbell: { Icon: Barbell, color: ORANGE },
  receipt: { Icon: Receipt, color: SLATE },
  piggy: { Icon: PiggyBank, color: PINK },
  heart: { Icon: Heart, color: RED },
  car: { Icon: Car, color: BLUE },
  baby: { Icon: Baby, color: '#1aa5b8' },
  // --- Règles du programme ------------------------------------------------------
  deficit: { Icon: WarningOctagon, color: RED },
  variable_shortfall: { Icon: Waves, color: ORANGE },
  essentials_first: { Icon: ListChecks, color: RED },
  daily_cap: { Icon: Target, color: EMERALD },
  variable_floor: { Icon: ChartLineUp, color: TEAL },
  weekly_envelope: { Icon: Envelope, color: VIOLET },
  debt_first: { Icon: Scales, color: RED },
  debt_minimum: { Icon: PushPin, color: ORANGE },
  fixed_charges_high: { Icon: Buildings, color: ORANGE },
  impulse_24h: { Icon: Hourglass, color: VIOLET },
  month_end_half: { Icon: MoonStars, color: INDIGO },
  no_savings_auto: { Icon: PiggyBank, color: EMERALD },
  pay_day_savings: { Icon: HandCoins, color: GREEN },
  daret_keep: { Icon: Handshake, color: TEAL },
  savings_goal: { Icon: FlagCheckered, color: GOLD },
  dependents_buffer: { Icon: UsersThree, color: '#1f9e8f' },
  student_cap: { Icon: GraduationCap, color: INDIGO },
  track_daily: { Icon: NotePencil, color: BLUE },
  weekly_review: { Icon: CalendarCheck, color: EMERALD },
  // --- Conseils et actions de la semaine ------------------------------------------
  reduce_biggest: { Icon: TrendDown, color: RED },
  raise_income: { Icon: Coins, color: GOLD },
  renegotiate_credit: { Icon: Handshake, color: TEAL },
  spread_debt: { Icon: Scales, color: ORANGE },
  daret_review: { Icon: UsersThree, color: TEAL },
  bills_audit: { Icon: Receipt, color: BLUE },
  variable_buffer: { Icon: Lifebuoy, color: TEAL },
  track_leaks: { Icon: MagnifyingGlass, color: BLUE },
  apply_budgets: { Icon: Check, color: EMERALD },
  log_all: { Icon: NotePencil, color: BLUE },
  no_spend_day: { Icon: Hourglass, color: VIOLET },
  check_bills: { Icon: Receipt, color: BLUE },
  debt_plan: { Icon: CalendarDots, color: ORANGE },
  first_transfer: { Icon: PiggyBank, color: EMERALD },
  compare_prices: { Icon: Basket, color: GREEN },
  mid_check: { Icon: Target, color: EMERALD },
  family_talk: { Icon: UsersThree, color: '#1f9e8f' },
  student_meals: { Icon: CookingPot, color: ORANGE },
  plan_weekend: { Icon: ForkKnife, color: ORANGE },
  negotiate: { Icon: Handshake, color: TEAL },
  income_ideas: { Icon: Rocket, color: GOLD },
  essentials_list: { Icon: ListChecks, color: RED },
  // --- Questionnaire d'onboarding -----------------------------------------------------
  sit_employee: { Icon: Briefcase, color: BLUE },
  sit_self_employed: { Icon: Laptop, color: INDIGO },
  sit_merchant: { Icon: Storefront, color: ORANGE },
  sit_student: { Icon: GraduationCap, color: VIOLET },
  sit_unemployed: { Icon: MagnifyingGlass, color: SLATE },
  income_regular: { Icon: CalendarCheck, color: EMERALD },
  income_variable: { Icon: Waves, color: ORANGE },
  goal_finish_month: { Icon: MoonStars, color: INDIGO },
  goal_save: { Icon: PiggyBank, color: EMERALD },
  goal_repay_debt: { Icon: Scales, color: RED },
  goal_project: { Icon: Rocket, color: GOLD },
  goal_understand: { Icon: MagnifyingGlass, color: BLUE },
  problem_impulsive: { Icon: ShoppingBag, color: PINK },
  problem_month_end: { Icon: TrendDown, color: ORANGE },
  problem_no_savings: { Icon: Wallet, color: VIOLET },
  problem_no_tracking: { Icon: EyeSlash, color: SLATE },
  // --- Navigation et interface ----------------------------------------------------------
  nav_home: { Icon: House, color: EMERALD },
  nav_budgets: { Icon: Target, color: EMERALD },
  nav_stats: { Icon: ChartBar, color: EMERALD },
  nav_more: { Icon: List, color: EMERALD },
  greeting: { Icon: HandWaving, color: GOLD },
  program: { Icon: Target, color: EMERALD },
  plus: { Icon: Plus, color: EMERALD },
  edit: { Icon: PencilSimple, color: SLATE },
  show: { Icon: Eye, color: TEAL },
  hide: { Icon: EyeSlash, color: SLATE },
  check: { Icon: Check, color: EMERALD },
  close: { Icon: X, color: SLATE },
  arrow_up: { Icon: ArrowUp, color: RED },
  arrow_down: { Icon: ArrowDown, color: EMERALD },
  chevron_left: { Icon: CaretLeft, color: SLATE, directional: true },
  chevron_right: { Icon: CaretRight, color: SLATE, directional: true },
} satisfies Record<string, Entry>

export type IconName = keyof typeof REGISTRY

/** Icônes proposées quand on crée ou modifie une catégorie. */
export const PICKABLE_CATEGORY_ICONS: IconName[] = [
  'groceries', 'transport', 'rent', 'phone', 'outings', 'utilities', 'health', 'education',
  'clothing', 'family', 'other', 'coffee', 'film', 'plane', 'gift', 'scissors',
  'fuel', 'wrench', 'books', 'paw', 'mosque', 'barbell', 'receipt', 'piggy',
  'heart', 'car', 'baby',
]

/** Anciennes catégories : l'icône était un emoji, on le fait correspondre à une icône. */
const LEGACY_EMOJI: Record<string, IconName> = {
  '🛒': 'groceries', '🚌': 'transport', '🏠': 'rent', '📱': 'phone', '🍽️': 'outings',
  '💡': 'utilities', '💊': 'health', '🎓': 'education', '👕': 'clothing', '👨‍👩‍👧': 'family',
  '📦': 'other', '☕': 'coffee', '🎬': 'film', '✈️': 'plane', '🎁': 'gift', '💇': 'scissors',
  '⛽': 'fuel', '🔧': 'wrench', '📚': 'books', '🐾': 'paw', '🕌': 'mosque', '🏋️': 'barbell',
  '🧾': 'receipt', '💰': 'piggy',
}

function isIconName(value: string): value is IconName {
  return Object.prototype.hasOwnProperty.call(REGISTRY, value)
}

/** Nom d'icône pour une catégorie : clé prédéfinie, nom enregistré ou ancien emoji. */
export function iconNameForCategory(c: { key?: string; icon?: string }): IconName | null {
  if (c.key && isIconName(c.key)) return c.key
  if (c.icon) {
    if (isIconName(c.icon)) return c.icon
    if (LEGACY_EMOJI[c.icon]) return LEGACY_EMOJI[c.icon]
  }
  return null
}

const PX = { xs: 30, sm: 38, md: 46, lg: 58 } as const
export type IconSize = keyof typeof PX

/** Étoile à 8 branches (deux carrés superposés, pointes arrondies par le trait). */
function starPath(outer = 22.5, inner = 17.2): string {
  const pts: string[] = []
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (Math.PI / 8) * i - Math.PI / 2
    pts.push(`${(24 + r * Math.cos(a)).toFixed(2)} ${(24 + r * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join('L')}Z`
}

const SHAPES: Record<BadgeShape, string> = {
  star: starPath(),
  diamond: 'M24 3.5 Q26 3.5 27.5 5 L43 20.5 Q44.5 22 44.5 24 Q44.5 26 43 27.5 L27.5 43 Q26 44.5 24 44.5 Q22 44.5 20.5 43 L5 27.5 Q3.5 26 3.5 24 Q3.5 22 5 20.5 L20.5 5 Q22 3.5 24 3.5Z',
  circle: 'M24 2a22 22 0 1 0 0 44a22 22 0 1 0 0-44Z',
}

export interface CategoryIconProps {
  /** Une catégorie : clé prédéfinie, nom d'icône ou ancien emoji. */
  category?: { key?: string; icon?: string; color?: string }
  /** Ou un nom du registre (règle, action, navigation…). */
  name?: IconName
  /** Couleur du badge (par défaut : couleur de la catégorie, sinon du registre). */
  color?: string
  size?: IconSize
  /** tint = fond teinté, solid = fond plein, ghost = contour seul, plain = icône nue. */
  tone?: 'tint' | 'solid' | 'ghost' | 'plain'
  /** Couleur de l'icône (par défaut : celle du badge ; blanc sur fond plein). */
  iconColor?: string
  /** Épaisseur de l'icône pour `plain` (ex. « bold »). */
  weight?: IconWeight
  /** Taille en pixels pour `plain`. */
  px?: number
  shape?: BadgeShape
  className?: string
}

export function CategoryIcon({
  category,
  name,
  color,
  size = 'md',
  tone = 'tint',
  iconColor,
  weight = ICON_WEIGHT,
  px,
  shape = BADGE_SHAPE,
  className = '',
}: CategoryIconProps) {
  const resolved: IconName | null = name ?? (category ? iconNameForCategory(category) : null)
  const entry: Entry | null = resolved ? REGISTRY[resolved] : null
  const base = color ?? category?.color ?? entry?.color ?? SLATE
  const flip = entry?.directional ? 'rtl-flip' : ''
  // Emoji inconnu (catégorie créée avant les icônes) : on l'affiche tel quel dans le badge.
  const fallbackText = !entry && category?.icon ? category.icon : null

  if (tone === 'plain') {
    if (!entry) return null
    const size1 = px ?? PX[size] * 0.6
    return (
      <entry.Icon
        aria-hidden
        weight={weight}
        size={size1}
        color={iconColor ?? 'currentColor'}
        className={`${flip} ${className}`}
      />
    )
  }

  const dim = PX[size]
  const fill =
    tone === 'solid'
      ? base
      : tone === 'ghost'
        ? 'transparent'
        : `color-mix(in srgb, ${base} 15%, white)`
  const stroke =
    tone === 'solid'
      ? 'none'
      : tone === 'ghost'
        ? `color-mix(in srgb, ${base} 55%, transparent)`
        : `color-mix(in srgb, ${base} 42%, white)`
  const glyph = iconColor ?? (tone === 'solid' ? '#ffffff' : base)

  return (
    <span
      aria-hidden
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: dim, height: dim }}
    >
      <svg viewBox="0 0 48 48" width={dim} height={dim} className="absolute inset-0">
        <path
          d={SHAPES[shape]}
          style={{ fill, stroke, strokeWidth: stroke === 'none' ? 0 : 1.6 }}
          strokeLinejoin="round"
        />
      </svg>
      {entry ? (
        <entry.Icon
          weight={weight}
          size={Math.round(dim * 0.5)}
          color={glyph}
          className={`relative ${flip}`}
        />
      ) : (
        <span className="relative leading-none" style={{ fontSize: Math.round(dim * 0.42) }}>
          {fallbackText ?? '•'}
        </span>
      )}
    </span>
  )
}
