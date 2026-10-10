import type { ButtonHTMLAttributes } from 'react'
import { PlusIcon } from './icons'

/** Bouton d'ajout rond et bleu, flottant au-dessus de la barre basse. */
export function Fab({ className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`flex size-14 items-center justify-center rounded-full bg-accent-600 text-white shadow-(--shadow-fab) transition-transform active:scale-95 ${className}`}
      {...rest}
    >
      <PlusIcon width={28} height={28} strokeWidth={2.4} />
    </button>
  )
}
