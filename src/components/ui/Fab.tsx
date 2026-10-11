import type { ButtonHTMLAttributes } from 'react'
import { PlusIcon } from './icons'

/** Bouton d'ajout : carré arrondi doré, flottant au-dessus de la barre basse. */
export function Fab({ className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`flex size-14 items-center justify-center rounded-[1.1rem] bg-gold-500 text-ink shadow-(--shadow-fab) ring-1 ring-gold-700/25 transition-transform active:scale-95 ${className}`}
      {...rest}
    >
      <PlusIcon width={28} height={28} strokeWidth={2.6} />
    </button>
  )
}
