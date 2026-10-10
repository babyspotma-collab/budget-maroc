import type { ButtonHTMLAttributes } from 'react'

/** Bouton d'ajout en losange majorelle ; le « + » est contre-tourné pour rester droit. */
export function Fab({ className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`flex size-14 rotate-45 items-center justify-center rounded-2xl bg-majorelle-600 text-white shadow-(--shadow-fab) ring-4 ring-cream transition-transform active:scale-95 ${className}`}
      {...rest}
    >
      <span aria-hidden className="-rotate-45 text-3xl font-light leading-none">
        +
      </span>
    </button>
  )
}
