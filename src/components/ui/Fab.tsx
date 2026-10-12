import type { ButtonHTMLAttributes } from 'react'
import { PlusIcon } from './icons'

/** Bouton d'ajout : rond, ocre, flottant au-dessus de la barre du bas. */
export function Fab({ className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`flex size-14 items-center justify-center rounded-full bg-gold-500 text-ink shadow-(--shadow-fab) transition-transform duration-200 active:scale-95 ${className}`}
      {...rest}
    >
      <PlusIcon width={28} />
    </button>
  )
}