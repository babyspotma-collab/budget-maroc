import type { HTMLAttributes } from 'react'

type Tone = 'default' | 'accent' | 'warning' | 'danger'

/** `accent` : filet terracotta côté début (gauche en LTR, droite en RTL). */
const TONES: Record<Tone, string> = {
  default: 'border-sand',
  accent: 'border-sand border-s-4 border-s-terracotta-500',
  warning: 'border-saffron-500 border-s-4 bg-saffron-50',
  danger: 'border-danger-600 border-s-4 bg-danger-50',
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone
}

export function Card({ tone = 'default', className = '', ...rest }: CardProps) {
  return (
    <div
      className={`rounded-(--radius-card) border bg-surface p-4 shadow-(--shadow-card) ${TONES[tone]} ${className}`}
      {...rest}
    />
  )
}
