import type { HTMLAttributes } from 'react'

type Tone = 'default' | 'accent' | 'warning' | 'danger'

/** `accent` : filet ocre côté début (gauche en LTR, droite en RTL), comme une marge de carnet. */
const TONES: Record<Tone, string> = {
  default: 'border-transparent',
  accent: 'border-transparent border-s-4 border-s-gold-500',
  warning: 'border-gold-500 border-s-4 bg-saffron-50',
  danger: 'border-danger-600 border-s-4 bg-danger-50',
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone
}

/**
 * Carte à plat : filet d'encre à 10 %, 20 px de marge intérieure. Une classe de padding
 * donnée par l'appelant (p-, px-, py-) remplace seulement l'axe concerné.
 */
export function Card({ tone = 'default', className = '', ...rest }: CardProps) {
  const hasAll = /(^|\s)p-/.test(className)
  const hasX = hasAll || /(^|\s)px-/.test(className)
  const hasY = hasAll || /(^|\s)py-/.test(className)
  return (
    <div
      className={`rounded-(--radius-card) border bg-surface shadow-(--shadow-card) ${
        hasX ? '' : 'px-5'
      } ${hasY ? '' : 'py-5'} ${TONES[tone]} ${className}`}
      {...rest}
    />
  )
}