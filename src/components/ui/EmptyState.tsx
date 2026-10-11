import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  body: string
  children?: ReactNode
}

/** État vide soigné : anneau d'enveloppe, titre, explication et actions. */
export function EmptyState({ title, body, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-(--radius-card) bg-surface px-5 py-10 text-center shadow-(--shadow-card)">
      <div className="mb-5 flex size-28 items-center justify-center rounded-full bg-brand-50">
        <svg viewBox="0 0 64 64" width="64" height="64" fill="none" aria-hidden>
          <circle cx="32" cy="32" r="22" stroke="#cbe6da" strokeWidth="9" />
          <path
            d="M32 10a22 22 0 0 1 20.9 15.2"
            stroke="#0c7d5e"
            strokeWidth="9"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{body}</p>
      {children && <div className="mt-6 flex w-full max-w-xs flex-col gap-2">{children}</div>}
    </div>
  )
}
