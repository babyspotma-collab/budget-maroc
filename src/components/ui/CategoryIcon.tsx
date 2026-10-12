/**
 * Composant d'icône unique de l'application : catégories, règles, actions, navigation…
 *
 * Tout passe par ici pour pouvoir changer de style en un seul endroit :
 *  - la famille d'icônes (Phosphor, variante `duotone`) est choisie dans `ICON_WEIGHT` ;
 *  - la forme du badge (carré arrondi ou cercle) dans `BADGE_SHAPE` ;
 *  - les couleurs par défaut et le sens (icônes directionnelles inversées en RTL) dans `REGISTRY`.
 */
import type { Icon as PhosphorIcon, IconWeight } from '@phosphor-icons/react'
import { Airplane } from '@phosphor-icons/react/dist/csr/Airplane'
import { ArrowDown } from '@phosphor-icons/react/dist/csr/ArrowDown'
import { ArrowUp } from '@phosphor-icons/react/dist/csr/ArrowUp'
import { Baby } from '@phosphor-icons/react/dist/csr/Baby'
import { Backspace } from '@phosphor-icons/react/dist/csr/Backspace'
import { Trash } from '@phosphor-icons/react/dist/csr/Trash'
import { Barbell } from '@phosphor-icons/react/dist/csr/Barbell'
import { Basket } from '@phosphor-icons/react/dist/csr/Basket'
import { Books } from '@phosphor-icons/react/dist/csr/Books'
import { Briefcase } from '@phosphor-icons/react/dist/csr/Briefcase'
import { Buildings } from '@phosphor-icons/react/dist/csr/Buildings'
import { Bus } from '@phosphor-icons/react/dist/csr/Bus'
import { CalendarCheck } from '@phosphor-icons/react/dist/csr/CalendarCheck'
import { CalendarDots } from '@phosphor-icons/react/dist/csr/CalendarDots'
import { Car } from '@phosphor-icons/react/dist/csr/Car'
import { CaretLeft } from '@phosphor-icons/react/dist/csr/CaretLeft'
import { CaretRight } from '@phosphor-icons/react/dist/csr/CaretRight'
import { ChartBar } from '@phosphor-icons/react/dist/csr/ChartBar'
import { ChartLineUp } from '@phosphor-icons/react/dist/csr/ChartLineUp'
import { Check } from '@phosphor-icons/react/dist/csr/Check'
import { Coffee } from '@phosphor-icons/react/dist/csr/Coffee'
import { Coins } from '@phosphor-icons/react/dist/csr/Coins'
import { CreditCard } from '@phosphor-icons/react/dist/csr/CreditCard'
import { CookingPot } from '@phosphor-icons/react/dist/csr/CookingPot'
import { DeviceMobile } from '@phosphor-icons/react/dist/csr/DeviceMobile'
import { Envelope } from '@phosphor-icons/react/dist/csr/Envelope'
import { Eye } from '@phosphor-icons/react/dist/csr/Eye'
import { EyeSlash } from '@phosphor-icons/react/dist/csr/EyeSlash'
import { FilmSlate } from '@phosphor-icons/react/dist/csr/FilmSlate'
import { FlagCheckered } from '@phosphor-icons/react/dist/csr/FlagCheckered'
import { ForkKnife } from '@phosphor-icons/react/dist/csr/ForkKnife'
import { GasPump } from '@phosphor-icons/react/dist/csr/GasPump'
import { Gift } from '@phosphor-icons/react/dist/csr/Gift'
import { GraduationCap } from '@phosphor-icons/react/dist/csr/GraduationCap'
import { HandCoins } from '@phosphor-icons/react/dist/csr/HandCoins'
import { Handshake } from '@phosphor-icons/react/dist/csr/Handshake'
import { HandWaving } from '@phosphor-icons/react/dist/csr/HandWaving'
import { Heart } from '@phosphor-icons/react/dist/csr/Heart'
import { Hourglass } from '@phosphor-icons/react/dist/csr/Hourglass'
import { House } from '@phosphor-icons/react/dist/csr/House'
import { Laptop } from '@phosphor-icons/react/dist/csr/Laptop'
import { Lifebuoy } from '@phosphor-icons/react/dist/csr/Lifebuoy'
import { Lightbulb } from '@phosphor-icons/react/dist/csr/Lightbulb'
import { List } from '@phosphor-icons/react/dist/csr/List'
import { ListChecks } from '@phosphor-icons/react/dist/csr/ListChecks'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import { MoonStars } from '@phosphor-icons/react/dist/csr/MoonStars'
import { Mosque } from '@phosphor-icons/react/dist/csr/Mosque'
import { NotePencil } from '@phosphor-icons/react/dist/csr/NotePencil'
import { Package } from '@phosphor-icons/react/dist/csr/Package'
import { PawPrint } from '@phosphor-icons/react/dist/csr/PawPrint'
import { PencilSimple } from '@phosphor-icons/react/dist/csr/PencilSimple'
import { PiggyBank } from '@phosphor-icons/react/dist/csr/PiggyBank'
import { Pill } from '@phosphor-icons/react/dist/csr/Pill'
import { Plus } from '@phosphor-icons/react/dist/csr/Plus'
import { PushPin } from '@phosphor-icons/react/dist/csr/PushPin'
import { Receipt } from '@phosphor-icons/react/dist/csr/Receipt'
import { Rocket } from '@phosphor-icons/react/dist/csr/Rocket'
import { Scales } from '@phosphor-icons/react/dist/csr/Scales'
import { Scissors } from '@phosphor-icons/react/dist/csr/Scissors'
import { ShoppingBag } from '@phosphor-icons/react/dist/csr/ShoppingBag'
import { ShoppingCart } from '@phosphor-icons/react/dist/csr/ShoppingCart'
import { Storefront } from '@phosphor-icons/react/dist/csr/Storefront'
import { Target } from '@phosphor-icons/react/dist/csr/Target'
import { TrendDown } from '@phosphor-icons/react/dist/csr/TrendDown'
import { TShirt } from '@phosphor-icons/react/dist/csr/TShirt'
import { UsersThree } from '@phosphor-icons/react/dist/csr/UsersThree'
import { Wallet } from '@phosphor-icons/react/dist/csr/Wallet'
import { WarningOctagon } from '@phosphor-icons/react/dist/csr/WarningOctagon'
import { Waves } from '@phosphor-icons/react/dist/csr/Waves'
import { Wrench } from '@phosphor-icons/react/dist/csr/Wrench'
import { X } from '@phosphor-icons/react/dist/csr/X'

/** Variante des icônes Phosphor (duotone = deux tons, cohérent avec les badges teintés). */
const ICON_WEIGHT: IconWeight = 'duotone'

export type BadgeShape = 'square' | 'circle'
/** Forme des badges : change ici pour modifier toute l'application. */
export const BADGE_SHAPE: BadgeShape = 'square'

interface Entry {
  Icon: PhosphorIcon
  /** Couleur par défaut du badge (une catégorie utilise sa propre couleur). */
  color: string
  /** Icône qui indique un sens : inversée automatiquement en RTL. */
  directional?: boolean
}

const EMERALD = '#4e8f6f' // sauge

const TEAL = '#2b6cb0' // bleu Chaouen
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
  credit: { Icon: CreditCard, color: '#6b7cc9' },
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
  backspace: { Icon: Backspace, color: SLATE },
  trash: { Icon: Trash, color: RED },
  answer_yes: { Icon: Check, color: EMERALD },
  answer_no: { Icon: X, color: SLATE },
  arrow_up: { Icon: ArrowUp, color: RED },
  arrow_down: { Icon: ArrowDown, color: EMERALD },
  chevron_left: { Icon: CaretLeft, color: SLATE, directional: true },
  chevron_right: { Icon: CaretRight, color: SLATE, directional: true },
} satisfies Record<string, Entry>

export type IconName = keyof typeof REGISTRY

/** Icônes proposées quand on crée ou modifie une catégorie. */
export const PICKABLE_CATEGORY_ICONS: IconName[] = [
  'groceries', 'transport', 'rent', 'phone', 'outings', 'utilities', 'health', 'education',
  'clothing', 'family', 'credit', 'other', 'coffee', 'film', 'plane', 'gift', 'scissors',
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

export interface CategoryIconProps {
  /** Une catégorie : clé prédéfinie, nom d'icône ou ancien emoji. */
  category?: { key?: string; icon?: string; color?: string }
  /** Ou un nom du registre (règle, action, navigation…). */
  name?: IconName
  /** Couleur du badge (par défaut : couleur de la catégorie, sinon du registre). */
  color?: string
  size?: IconSize
  /** tint = fond teinté clair, solid = fond plein, ghost = contour seul, plain = icône nue. */
  tone?: 'tint' | 'solid' | 'ghost' | 'plain'
  /** Couleur de l'icône (par défaut : teinte plus foncée du badge ; blanc sur fond plein). */
  iconColor?: string
  /** Variante de l'icône pour `plain` (ex. « bold »). */
  weight?: IconWeight
  /** Taille en pixels pour `plain`. */
  px?: number
  shape?: BadgeShape
  className?: string
}

/** Teinte plus foncée de la même couleur, pour que l'icône reste lisible sur le fond clair. */
const darker = (color: string) => `color-mix(in srgb, ${color} 72%, black)`

/**
 * Petit carré arrondi : fond teinté clair + icône duotone dans une teinte plus foncée
 * de la même couleur. Une couleur propre à chaque catégorie, règle ou action.
 */
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
    return (
      <entry.Icon
        aria-hidden
        weight={weight}
        size={px ?? PX[size] * 0.6}
        color={iconColor ?? 'currentColor'}
        className={`${flip} ${className}`}
      />
    )
  }

  const dim = PX[size]
  const background =
    tone === 'solid'
      ? base
      : tone === 'ghost'
        ? 'transparent'
        : `color-mix(in srgb, ${base} 14%, white)`
  const border =
    tone === 'ghost' ? `1.5px solid color-mix(in srgb, ${base} 45%, transparent)` : 'none'
  const glyph = iconColor ?? (tone === 'solid' ? '#ffffff' : tone === 'ghost' ? base : darker(base))

  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      style={{
        width: dim,
        height: dim,
        background,
        border,
        borderRadius: shape === 'circle' ? '9999px' : `${Math.round(dim * 0.3)}px`,
        color: glyph,
      }}
    >
      {entry ? (
        <entry.Icon weight={weight} size={Math.round(dim * 0.54)} color={glyph} className={flip} />
      ) : (
        <span className="leading-none" style={{ fontSize: Math.round(dim * 0.45) }}>
          {fallbackText ?? '•'}
        </span>
      )}
    </span>
  )
}